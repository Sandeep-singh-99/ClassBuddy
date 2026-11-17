import json
from unittest.mock import AsyncMock, Mock, patch

import pytest
from langchain_core.messages import AIMessage

from app.api.v1.endpoints.studentInsight import generate_industry_insight
from app.models.studentInsight import StudentInsight


@pytest.mark.asyncio
@pytest.mark.parametrize("existing", [False, True])
async def test_generation_runs_once_without_background_dispatch(
    db_session, student_user, existing
):
    insight_data = {
        "salary_range": [],
        "growth_rate": 5.4,
        "demand_level": "High",
        "top_skills": ["Python"],
        "market_outlook": "Growing",
        "key_trends": ["AI"],
        "recommend_skills": ["SQL"],
    }
    if existing:
        db_session.add(StudentInsight(
            user_id=student_user.id,
            industry="Technology",
            **{**insight_data, "market_outlook": "Old report"},
        ))
        db_session.commit()

    cache = Mock()
    with (
        patch(
            "app.api.v1.endpoints.studentInsight.industry_graph.ainvoke",
            new_callable=AsyncMock,
            return_value={"getIndustry": [AIMessage(content=json.dumps(insight_data))]},
        ) as generate,
        patch("inngest.Inngest.send", new_callable=AsyncMock) as send,
    ):
        result = await generate_industry_insight(
            industry=" Technology ",
            current_user=student_user,
            db_session=db_session,
            redis=cache,
        )

    generate.assert_awaited_once()
    assert generate.call_args.args[0]["industry"][0].content == "Technology"
    send.assert_not_called()
    cache.delete.assert_called_once_with(f"student_insights:{student_user.id}")
    assert result.market_outlook == "Growing"
    assert result.user_id == student_user.id
    assert result.industry == "Technology"
    assert db_session.query(StudentInsight).count() == 1
