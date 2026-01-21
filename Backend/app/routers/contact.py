from fastapi import APIRouter, HTTPException
from app.schemas import ContactForm
from app.email_utils import notify_admin, send_user_confirmation

# Router Setup
router = APIRouter(tags=["Contact"])

@router.post("/contact")
def submit_contact(form: ContactForm):
    try:
        # Send to Aisha (Admin)
        notify_admin(form.name, form.email, form.subject, form.message)

        # Send to User (Confirmation)
        send_user_confirmation(form.name, form.email)

        return {"success": True, "message": "Message sent successfully!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))