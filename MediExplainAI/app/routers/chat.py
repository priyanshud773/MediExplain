from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import database, models, schema
from ..utils.current_user import get_current_user
from ..ai.chat_service import chat_with_report


router = APIRouter(
    prefix="/chat",
    tags=["AI Chat"]
)


@router.post("/", response_model=schema.ChatResponse)
def chat(
    request: schema.ChatRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):

    # Find user's report
    report = db.query(models.Report).filter(
        models.Report.id == request.report_id,
        models.Report.user_id == current_user.id
    ).first()

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    print("Report ID:", report.id)
    print("Report Name:", report.filename)
    print("Report Language:", report.language)
    print("Report Length:", len(report.extracted_text))

    # AI Chat
    try:
        answer = chat_with_report(
            report.extracted_text,
            request.question,
            report.language
        )
    except Exception as exc:
        print(f"[CHAT ERROR] {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"AI Chat service could not process the question: {str(exc)}"
        )

    return {
        "answer": answer
    }