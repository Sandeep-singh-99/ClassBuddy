import runpy
from pathlib import Path

from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import Column, Integer, MetaData, String, Table, create_engine, inspect, select
from sqlalchemy.exc import IntegrityError


def test_submission_migration_preserves_history_and_enforces_uniqueness():
    metadata = MetaData()
    submissions = Table("submissions", metadata, Column("id", String, primary_key=True), Column("student_id", String), Column("assignment_id", String), Column("grade", Integer))
    Table("assignment_questions", metadata, Column("id", String, primary_key=True), Column("assignment_id", String))
    Table("interviewpreps", metadata, Column("id", String, primary_key=True))
    migration = runpy.run_path(str(Path(__file__).resolve().parents[1] / "alembic/versions/c8a5d4e1206b_protect_ai_submissions.py"))
    engine = create_engine("sqlite://")
    try:
        with engine.begin() as connection:
            metadata.create_all(connection)
            connection.execute(submissions.insert().values(id="history", student_id="student", assignment_id="assignment", grade=7))
            with Operations.context(MigrationContext.configure(connection)):
                migration["upgrade"]()
                updated = Table("submissions", MetaData(), autoload_with=connection)
                assert connection.execute(select(updated.c.status)).scalar_one() == "completed"
                assert connection.execute(select(updated.c.grade)).scalar_one() == 7
                try:
                    with connection.begin_nested():
                        connection.execute(updated.insert().values(id="duplicate", student_id="student", assignment_id="assignment", grade=8))
                except IntegrityError:
                    pass
                else:
                    raise AssertionError("Duplicate submission was accepted")
                assert {constraint["name"] for constraint in inspect(connection).get_unique_constraints("assignment_questions")} == {"uq_assignment_questions_assignment"}
                migration["downgrade"]()
                assert "status" not in {column["name"] for column in inspect(connection).get_columns("submissions")}
                assert "submitted_at" not in {column["name"] for column in inspect(connection).get_columns("interviewpreps")}
                assert connection.execute(select(submissions.c.grade)).scalar_one() == 7
    finally:
        engine.dispose()
