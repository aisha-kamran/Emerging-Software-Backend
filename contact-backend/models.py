from pydantic import BaseModel, EmailStr

class ContactForm(BaseModel):
    name: str  | None = "User"
    email: EmailStr
    subject: str | None = "No Subject"
    message: str | None = None
