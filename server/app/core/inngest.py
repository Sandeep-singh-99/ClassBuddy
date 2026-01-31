import os
from inngest import Inngest
from dotenv import load_dotenv

load_dotenv()

is_dev = os.getenv("INNGEST_DEV") == "1"

inngest_client = Inngest(
    app_id="classbuddy-api",
    # Local dev usually doesn't need the signing key
    signing_key=os.getenv("INNGEST_SIGNING_KEY") if not is_dev else None,
    is_production=not is_dev
)