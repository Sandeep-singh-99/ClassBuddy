import runpy
from pathlib import Path

from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import MetaData, create_engine, inspect, select

from app.config.db import Base


def test_payment_migration_round_trip_preserves_subscriptions():
    metadata = MetaData()
    for table in Base.metadata.sorted_tables:
        if table.name != "payment_orders":
            table.to_metadata(metadata)
    subscriptions = metadata.tables["student_subscriptions"]
    for constraint in list(subscriptions.constraints):
        if constraint.name in {"uq_student_subscriptions_order", "uq_student_subscriptions_payment"}:
            subscriptions.constraints.remove(constraint)

    migration = runpy.run_path(str(
        Path(__file__).resolve().parents[1] / "alembic/versions/8d36e5a7c921_bind_payment_orders.py"
    ))
    engine = create_engine("sqlite:///:memory:")
    try:
        with engine.begin() as connection:
            metadata.create_all(connection)
            connection.execute(subscriptions.insert().values(id="legacy", amount=10))
            with Operations.context(MigrationContext.configure(connection)):
                migration["upgrade"]()
                assert "payment_orders" in inspect(connection).get_table_names()
                constraints = inspect(connection).get_unique_constraints("student_subscriptions")
                assert {item["name"] for item in constraints} == {
                    "uq_student_subscriptions_order", "uq_student_subscriptions_payment",
                }
                assert connection.execute(select(subscriptions.c.id)).scalar_one() == "legacy"
                migration["downgrade"]()
                assert "payment_orders" not in inspect(connection).get_table_names()
                assert inspect(connection).get_unique_constraints("student_subscriptions") == []
                assert connection.execute(select(subscriptions.c.id)).scalar_one() == "legacy"
    finally:
        engine.dispose()
