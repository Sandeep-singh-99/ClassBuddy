from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
import dotenv
import os
import sys

# make sure app is importable
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

dotenv.load_dotenv()

# Import Base and models so Alembic can detect them
from app.config.db import Base
from app.models import auth, notes, teacherInsight

# Alembic Config object
config = context.config

# Load DB URL from .env
config.set_main_option('sqlalchemy.url', os.getenv('DATABASE_URL', ""))

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Tell Alembic which metadata to look at
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
