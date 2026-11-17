import asyncio

import inngest

from app.core.inngest import inngest_client
from app.services.document_qa import index_document


@inngest_client.create_function(
    fn_id="index-classroom-document",
    trigger=inngest.TriggerEvent(event="document/index.requested"),
)
async def index_classroom_document(ctx: inngest.Context):
    document_id = ctx.event.data["document_id"]

    async def run_index():
        return await asyncio.to_thread(index_document, document_id)

    return await ctx.step.run("extract-and-index-pdf", run_index)
