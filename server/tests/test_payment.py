import hmac
import hashlib
import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException

import app.models as models
from app.api.v1.endpoints.subscription import verify_payment
from app.schemas.subscription import VerifyPaymentSchema
from app.config.config import RAZORPAY_KEY_SECRET
from app.api.v1.endpoints.subscription import create_order
from app.schemas.subscription import CreateOrderSchema
from unittest.mock import patch
from sqlalchemy.exc import IntegrityError


def compute_razorpay_signature(order_id: str, payment_id: str, secret: str) -> str:
    """Helper to compute valid Razorpay payment signature."""
    payload = f"{order_id}|{payment_id}"
    return hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()


def test_payment_signature_verification_logic():
    """Verify HMAC-SHA256 calculation for payment verification."""
    order_id = "order_test_12345"
    payment_id = "pay_test_67890"
    secret = RAZORPAY_KEY_SECRET or "test_secret"

    valid_signature = compute_razorpay_signature(order_id, payment_id, secret)
    assert len(valid_signature) == 64

    # Direct HMAC match
    body = f"{order_id}|{payment_id}"
    expected = hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()
    assert expected == valid_signature

    # Mismatched secret or payload fails
    wrong_sig = compute_razorpay_signature(order_id, payment_id, "wrong_secret")
    assert wrong_sig != valid_signature

    tampered_sig = compute_razorpay_signature(order_id, "pay_tampered", secret)
    assert tampered_sig != valid_signature


def test_verify_payment_success(db_session, teacher_user, student_user):
    """Calling verify_payment with valid signature activates subscription."""
    group = models.TeacherInsight(
        id="group-test-payment-id",
        user_id=teacher_user.id,
        group_name="Math Group",
        group_des="Math Group Description",
    )
    db_session.add(group)
    db_session.flush()

    plan = models.SubscriptionPlan(
        id="plan-test-payment-id",
        group_id=group.id,
        plan_name="Monthly Premium",
        amount=499,
        validity_days=30,
    )
    db_session.add(plan)
    db_session.commit()

    order_id = "order_abc_123"
    db_session.add(models.PaymentOrder(
        id=order_id, user_id=student_user.id, plan_id=plan.id,
        amount=49900, validity_days=30,
    ))
    db_session.commit()
    payment_id = "pay_xyz_789"
    sig = compute_razorpay_signature(order_id, payment_id, RAZORPAY_KEY_SECRET)

    schema = VerifyPaymentSchema(
        plan_id=plan.id,
        razorpay_order_id=order_id,
        razorpay_payment_id=payment_id,
        razorpay_signature=sig,
    )

    response = verify_payment(data=schema, db=db_session, user=student_user)
    assert response == {"message": "Subscription activated"}

    # Verify student subscription record created in DB
    sub = (
        db_session.query(models.StudentSubscription)
        .filter_by(user_id=student_user.id, group_id=group.id)
        .first()
    )
    assert sub is not None
    assert sub.is_active is True
    assert sub.amount == 499
    assert sub.valid_till > datetime.utcnow() + timedelta(days=28)


@pytest.mark.parametrize("signature", ["invalid_signature_hex_value_1234567890", "invalid_é"])
def test_verify_payment_invalid_signature_rejected(db_session, teacher_user, student_user, signature):
    """Calling verify_payment with invalid signature must raise HTTP 400."""
    group = models.TeacherInsight(
        id="group-test-fail-sig",
        user_id=teacher_user.id,
        group_name="Science Group",
        group_des="Science Group Description",
    )
    db_session.add(group)
    db_session.flush()

    plan = models.SubscriptionPlan(
        id="plan-test-fail-sig",
        group_id=group.id,
        plan_name="Science Plan",
        amount=299,
        validity_days=15,
    )
    db_session.add(plan)
    db_session.commit()

    schema = VerifyPaymentSchema(
        plan_id=plan.id,
        razorpay_order_id="order_1",
        razorpay_payment_id="pay_1",
        razorpay_signature=signature,
    )

    with pytest.raises(HTTPException) as exc_info:
        verify_payment(data=schema, db=db_session, user=student_user)

    assert exc_info.value.status_code == 400
    assert "Invalid payment signature" in exc_info.value.detail


def test_verify_payment_duplicate_active_subscription_prevented(db_session, teacher_user, student_user):
    """Prevent purchasing/activating duplicate subscription while existing one is active."""
    group = models.TeacherInsight(
        id="group-test-dup-sub",
        user_id=teacher_user.id,
        group_name="History Group",
        group_des="History Group Description",
    )
    db_session.add(group)
    db_session.flush()

    plan = models.SubscriptionPlan(
        id="plan-test-dup-sub",
        group_id=group.id,
        plan_name="History Plan",
        amount=399,
        validity_days=30,
    )
    db_session.add(plan)

    # Pre-existing active subscription
    existing_sub = models.StudentSubscription(
        user_id=student_user.id,
        group_id=group.id,
        plan_id=plan.id,
        amount=399,
        is_active=True,
        valid_till=datetime.utcnow() + timedelta(days=20),
    )
    db_session.add(existing_sub)
    db_session.commit()

    order_id = "order_dup_123"
    db_session.add(models.PaymentOrder(
        id=order_id, user_id=student_user.id, plan_id=plan.id,
        amount=39900, validity_days=30,
    ))
    db_session.commit()
    payment_id = "pay_dup_789"
    sig = compute_razorpay_signature(order_id, payment_id, RAZORPAY_KEY_SECRET)

    schema = VerifyPaymentSchema(
        plan_id=plan.id,
        razorpay_order_id=order_id,
        razorpay_payment_id=payment_id,
        razorpay_signature=sig,
    )

    with pytest.raises(HTTPException) as exc_info:
        verify_payment(data=schema, db=db_session, user=student_user)

    assert exc_info.value.status_code == 400
    assert "already have an active subscription" in exc_info.value.detail


@pytest.fixture
def checkout(db_session, teacher_user, student_user):
    group = models.TeacherInsight(
        user_id=teacher_user.id, group_name="Checkout", group_des="Payment tests",
    )
    db_session.add(group)
    db_session.flush()
    plan = models.SubscriptionPlan(
        group_id=group.id, plan_name="Basic", amount=10, validity_days=30,
    )
    db_session.add(plan)
    db_session.commit()
    with patch("app.api.v1.endpoints.subscription.client.order.create", return_value={
        "id": "order_checkout", "amount": 1000,
    }) as create:
        response = create_order(CreateOrderSchema(plan_id=plan.id), db_session, student_user)
    create.assert_called_once_with({"amount": 1000, "currency": "INR", "receipt": f"sub_{plan.id}"})
    order = db_session.get(models.PaymentOrder, response["order_id"])
    assert order.user_id == student_user.id
    assert order.plan_id == plan.id
    assert order.amount == 1000
    assert order.validity_days == 30
    return plan, order


def payment_submission(plan_id, order_id="order_checkout", payment_id="pay_checkout"):
    return VerifyPaymentSchema(
        plan_id=plan_id, razorpay_order_id=order_id, razorpay_payment_id=payment_id,
        razorpay_signature=compute_razorpay_signature(order_id, payment_id, RAZORPAY_KEY_SECRET),
    )


@pytest.mark.parametrize("tampering", ["plan", "user", "unknown_order"])
def test_checkout_rejects_unbound_payments(db_session, student_user, checkout, tampering):
    plan, order = checkout
    plan_id, order_id = plan.id, order.id
    if tampering == "plan":
        premium = models.SubscriptionPlan(
            group_id=plan.group_id, plan_name="Premium", amount=5000, validity_days=365,
        )
        db_session.add(premium)
        db_session.commit()
        plan_id = premium.id
    elif tampering == "user":
        other = models.User(id="other-student", email="other@example.com", role=models.userRole.STUDENT)
        db_session.add(other)
        order.user_id = other.id
        db_session.commit()
    else:
        order_id = "order_not_created_here"
    with pytest.raises(HTTPException) as error:
        verify_payment(payment_submission(plan_id, order_id), db_session, student_user)
    assert error.value.status_code == 400
    assert db_session.query(models.StudentSubscription).count() == 0


def test_checkout_honors_price_and_validity_at_purchase(db_session, student_user, checkout):
    plan, order = checkout
    plan.amount = 5000
    plan.validity_days = 365
    db_session.commit()
    verify_payment(payment_submission(plan.id), db_session, student_user)
    sub = db_session.query(models.StudentSubscription).one()
    assert sub.amount == 10
    assert sub.plan_id == order.plan_id
    assert datetime.utcnow() + timedelta(days=29) < sub.valid_till < datetime.utcnow() + timedelta(days=31)


@pytest.mark.parametrize("replay", ["same_payment", "same_order", "different_order"])
def test_payment_cannot_be_reused_after_cancellation(db_session, student_user, checkout, replay):
    plan, order = checkout
    verify_payment(payment_submission(plan.id), db_session, student_user)
    sub = db_session.query(models.StudentSubscription).one()
    sub.is_active = False
    sub.valid_till = datetime.utcnow() - timedelta(days=1)
    order_id, payment_id = order.id, "pay_checkout"
    if replay == "same_order":
        payment_id = "pay_different"
    elif replay == "different_order":
        order_id = "order_different"
        db_session.add(models.PaymentOrder(
            id=order_id, user_id=student_user.id, plan_id=plan.id, amount=1000, validity_days=30,
        ))
    db_session.commit()
    with pytest.raises(HTTPException) as error:
        verify_payment(payment_submission(plan.id, order_id, payment_id), db_session, student_user)
    assert error.value.status_code == 400
    assert db_session.query(models.StudentSubscription).count() == 1


@pytest.mark.parametrize("duplicate", ["order", "payment"])
def test_database_rejects_duplicate_payment_claims(db_session, student_user, checkout, duplicate):
    plan, order = checkout
    verify_payment(payment_submission(plan.id), db_session, student_user)
    db_session.add(models.StudentSubscription(
        user_id=student_user.id, group_id=plan.group_id, plan_id=plan.id, amount=10,
        razorpay_order_id=order.id if duplicate == "order" else "other_order",
        razorpay_payment_id="pay_checkout" if duplicate == "payment" else "other_payment",
    ))
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()
    assert db_session.query(models.StudentSubscription).count() == 1
