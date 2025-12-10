import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os

load_dotenv()

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")


def send_email(to_email, subject, html_content):
    msg = MIMEMultipart()
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)


def notify_admin(name, email, subject, message):
    html = f"""
        <h3>New Contact Form Submission</h3>
        <p><b>Name:</b> {name}</p>
        <p><b>Email:</b> {email}</p>
        <p><b>Subject:</b> {subject}</p>
        <p><b>Message:</b> {message}</p>
    """
    send_email(RECEIVER_EMAIL, f"New Contact Message: {subject}", html)


def send_user_confirmation(name, user_email):
    html = f"""
        <h3>Thank you for contacting Emerging Software!</h3>
        <p>Dear {name},</p>
        <p>We have received your message. Our team will get back to you soon.</p>
        <br><p>Regards,<br>Emerging Software Team</p>
    """
    send_email(user_email, "We Received Your Message – Emerging Software", html)
    