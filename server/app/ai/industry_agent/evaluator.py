from app.ai.industry_agent.state import IndustryState


async def evaluator_node(state: IndustryState) -> dict:
    """
    Evaluator Node: Validates the generated industry insight JSON against database requirements.
    """
    data = state.get("insight_data")
    if not isinstance(data, dict):
        return {
            "evaluation": {
                "is_valid": False,
                "feedback": "insight_data is missing or not a JSON object.",
            }
        }

    missing_fields = []
    required_keys = [
        "salary_range",
        "growth_rate",
        "demand_level",
        "top_skills",
        "market_outlook",
        "key_trends",
        "recommend_skills",
    ]

    for key in required_keys:
        if key not in data or data[key] is None:
            missing_fields.append(f"Missing field: {key}")

    # Check salary range format
    salary_range = data.get("salary_range")
    if not isinstance(salary_range, list) or len(salary_range) == 0:
        missing_fields.append("salary_range must be a non-empty list of role objects.")
    elif isinstance(salary_range, list):
        for idx, item in enumerate(salary_range):
            if not isinstance(item, dict):
                missing_fields.append(f"salary_range item {idx} is not an object.")
            else:
                for s_key in ["role", "min", "max", "median", "location"]:
                    if s_key not in item:
                        missing_fields.append(f"salary_range item {idx} missing subfield '{s_key}'.")

    # Check numerical growth_rate
    growth_rate = data.get("growth_rate")
    if not isinstance(growth_rate, (int, float)):
        missing_fields.append("growth_rate must be a float or integer number.")

    # Check demand_level
    demand_level = data.get("demand_level")
    if demand_level not in ["High", "Medium", "Low"]:
        missing_fields.append("demand_level must be 'High', 'Medium', or 'Low'.")

    is_valid = len(missing_fields) == 0
    feedback = "Schema validation passed." if is_valid else "; ".join(missing_fields)

    return {
        "evaluation": {
            "is_valid": is_valid,
            "feedback": feedback,
        }
    }
