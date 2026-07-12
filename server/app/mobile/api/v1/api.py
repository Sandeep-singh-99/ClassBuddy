from fastapi import APIRouter
from app.mobile.api.v1.endpoints import auth, ai_evaluator, assignment, generate_assignment, generate_notes, group, groupMessage, studentInsight, submission, subscription, teacherInsight, docsupload, interviewPerp

app_router = APIRouter()

app_router.include_router(auth.router, prefix='/auth', tags=['Authentication'])
app_router.include_router(ai_evaluator, prefix='/ai-evaluator', tags=['AI Evalutor'])
app_router.include_router(assignment.router, prefix='/assignments', tags=['Assignments'])
app_router.include_router(generate_assignment.router, prefix='/assignments', tags=['Generate Assignment'])
app_router.include_router(generate_notes.router, prefix='/notes', tags=['Generate Notes'])
app_router.include_router(group.router, prefix='/groups', tags=['Groups'])
app_router.include_router(groupMessage.router, prefix='/group-messages', tags=['Group Messages'])
app_router.include_router(studentInsight.router, prefix='/student-insight', tags=['Student Insight'])
app_router.include_router(submission.router, prefix='/submissions', tags=['Submission'])
app_router.include_router(subscription.router, prefix='/subscription', tags=['Subscription'])
app_router.include_router(teacherInsight.router, prefix='/insights', tags=['Teacher Insights'])
app_router.include_router(docsupload.router, prefix='/docs', tags=['Document Upload'])
app_router.include_router(interviewPerp.router, prefix='/interview-prep', tags=['Interview Preparation'])
