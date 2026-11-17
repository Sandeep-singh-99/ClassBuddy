import os
import sys

# Ensure server root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from unittest.mock import MagicMock
import redis
import redis.asyncio

# Ensure essential environment variables are set for isolated test execution
os.environ.setdefault("RAZORPAY_KEY_SECRET", "test_razorpay_secret_key_12345")
os.environ.setdefault("RAZORPAY_KEY_ID", "rzp_test_12345")
os.environ.setdefault("JWT_SECRET_KEY", "test_jwt_secret_key_for_testing_12345")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

# Prevent network calls to external Redis cloud during testing
redis.Redis.ping = MagicMock(return_value=True)
redis.asyncio.Redis.ping = MagicMock(return_value=True)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config.db import Base
import app.models as models


@pytest.fixture(scope="function")
def db_session():
    """Provides an isolated in-memory SQLite database session for each test."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def student_user(db_session):
    """Creates and returns a student test user."""
    user = models.User(
        id="student-test-uuid",
        email="student@classbuddy.test",
        full_name="Student Test",
        role=models.userRole.STUDENT,
        hashed_password="mock_hashed_password",
    )
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def teacher_user(db_session):
    """Creates and returns a teacher test user."""
    user = models.User(
        id="teacher-test-uuid",
        email="teacher@classbuddy.test",
        full_name="Teacher Test",
        role=models.userRole.TEACHER,
        hashed_password="mock_hashed_password",
    )
    db_session.add(user)
    db_session.commit()
    return user


def pytest_terminal_summary(terminalreporter, exitstatus, config):
    """Ensure immediate clean process exit on Windows avoiding hanging atexit hooks."""
    import os, sys
    sys.stdout.flush()
    sys.stderr.flush()
    os._exit(exitstatus)


