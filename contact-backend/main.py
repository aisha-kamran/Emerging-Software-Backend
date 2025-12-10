from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ContactForm
from email_utils import notify_admin, send_user_confirmation
import uvicorn

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/contact")
def submit_contact(form: ContactForm):
    try:
        # Send to Aisha (Admin)
        notify_admin(form.name, form.email, form.subject, form.message)

        # Send to User (Confirmation)
        send_user_confirmation(form.name, form.email)

        return {"success": True, "message": "Message sent successfully!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def home():
    return {"status": "Backend server running successfully!"}

    
if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)
