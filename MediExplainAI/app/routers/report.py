from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
import os
import shutil
from fastapi.responses import FileResponse

from .. import database, models, schema
from ..utils.current_user import get_current_user
from ..ai.pdf_reader import extract_text_from_pdf
from ..ai.gemini_service import explain_medical_report

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.get("/")
def reports():
    return {
        "message": "Report Router Working Successfully"
    }


@router.post("/upload")
def upload_report(
    language: str = Form("English"),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    filename = os.path.basename(file.filename)
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    if file.content_type and file.content_type.lower() != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_path = os.path.join(UPLOAD_FOLDER, filename)
    counter = 1
    while os.path.exists(file_path):
        name, ext = os.path.splitext(filename)
        file_path = os.path.join(UPLOAD_FOLDER, f"{name}_{counter}{ext}")
        counter += 1

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pdf_text = extract_text_from_pdf(file_path)
    if not pdf_text or not pdf_text.strip():
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=400,
            detail="Could not extract readable text from the uploaded PDF. Please make sure the PDF is not an image-only or empty document."
        )

    try:
        explanation = explain_medical_report(pdf_text, language)
    except Exception as exc:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        print(f"[REPORT ERROR] Gemini AI analysis failed: {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"Medical AI analysis could not be completed: {str(exc)}"
        )

    new_report = models.Report(
        filename=os.path.basename(file_path),
        filepath=file_path,
        report_type="application/pdf",
        extracted_text=pdf_text,
        explanation=explanation,
        language=language,
        user_id=current_user.id
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return {
        "status": "success",
        "message": "Report uploaded successfully",
        "report_id": new_report.id,
        "filename": new_report.filename,
        "language": language,
        "explanation": new_report.explanation
    }


@router.get("/my-reports", response_model=list[schema.ReportResponse])
def my_reports(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    reports = db.query(models.Report).filter(
        models.Report.user_id == current_user.id
    ).all()

    return reports


@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    report = db.query(models.Report).filter(
        models.Report.id == report_id,
        models.Report.user_id == current_user.id
    ).first()

    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")

    if os.path.exists(report.filepath):
        try:
            os.remove(report.filepath)
        except Exception:
            pass
    else:
        fallback_path = os.path.join(UPLOAD_FOLDER, report.filename)
        if os.path.exists(fallback_path):
            try:
                os.remove(fallback_path)
            except Exception:
                pass

    db.delete(report)
    db.commit()

    return {
        "status": "success",
        "message": "Report deleted successfully",
        "report_id": report_id
    }


@router.get("/download/{report_id}")
def download_report(
    report_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    report = db.query(models.Report).filter(
        models.Report.id == report_id,
        models.Report.user_id == current_user.id
    ).first()

    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")

    file_to_send = report.filepath
    if not os.path.exists(file_to_send):
        fallback_path = os.path.join(UPLOAD_FOLDER, report.filename)
        if os.path.exists(fallback_path):
            file_to_send = fallback_path
            report.filepath = fallback_path
            db.commit()
        else:
            raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_to_send,
        filename=report.filename,
        media_type="application/pdf"
    )


@router.get("/search", response_model=list[schema.ReportSearchResponse])
def search_reports(
    query: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    reports = db.query(models.Report).filter(
        models.Report.user_id == current_user.id,
        models.Report.filename.contains(query)
    ).all()

    return reports


@router.get("/dashboard", response_model=schema.DashboardResponse)
def dashboard(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    reports = db.query(models.Report).filter(
        models.Report.user_id == current_user.id
    ).order_by(
        models.Report.id.desc()
    ).all()

    total_reports = len(reports)
    latest_report = reports[0].filename if reports else None

    return {
        "total_reports": total_reports,
        "latest_report": latest_report,
        "recent_reports": reports[:5]
    }
