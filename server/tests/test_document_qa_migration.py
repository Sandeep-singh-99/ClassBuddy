import runpy
from pathlib import Path

from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import MetaData, create_engine, inspect

from app.config.db import Base


def test_document_qa_migration_round_trip():
    metadata = MetaData()
    for table in Base.metadata.sorted_tables:
        if table.name not in {"document_indexes", "document_chunks"}:
            table.to_metadata(metadata)
    migration = runpy.run_path(str(
        Path(__file__).resolve().parents[1] / "alembic/versions/b4e2c9a1037f_add_document_qa.py"
    ))
    engine = create_engine("sqlite:///:memory:")
    try:
        with engine.begin() as connection:
            metadata.create_all(connection)
            with Operations.context(MigrationContext.configure(connection)):
                migration["upgrade"]()
                tables = inspect(connection).get_table_names()
                assert "document_indexes" in tables and "document_chunks" in tables
                columns = {column["name"] for column in inspect(connection).get_columns("document_indexes")}
                assert columns == {"document_id", "status", "error", "page_count", "source_pdf"}
                migration["downgrade"]()
                assert "document_chunks" not in inspect(connection).get_table_names()
                assert "document_indexes" not in inspect(connection).get_table_names()
                assert "docsuploads" in inspect(connection).get_table_names()
    finally:
        engine.dispose()
