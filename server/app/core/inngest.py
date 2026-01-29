import inngest
from dotenv import load_dotenv
import os

load_dotenv()

inngest_client = inngest.Inngest(
    app_id="classbuddy-api",
    event_key=os.getenv("INNGEST_EVENT_KEY"),
)

# Force reload for env update
