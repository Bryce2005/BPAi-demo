from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router instead of FastAPI app
router = APIRouter(prefix="/api/email", tags=["email"])

# Email configuration - Use environment variables for security
class EmailConfig:
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")  # Gmail by default
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))  # TLS port
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")  # Your email
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")  # Your app password
    FROM_EMAIL = os.getenv("FROM_EMAIL", "")  # Sender email (can be same as username)
    FROM_NAME = os.getenv("FROM_NAME", "Application Review Team")

# Pydantic models
class EmailData(BaseModel):
    applicationId: str
    email: EmailStr  # This validates email format
    subject: str
    content: str

class EmailRequest(BaseModel):
    emails: List[EmailData]

class EmailResponse(BaseModel):
    status: str
    sent: int
    failed: int
    details: Optional[List[dict]] = None

# Email service class
class EmailService:
    def __init__(self, config: EmailConfig):
        self.config = config
        
    def validate_config(self) -> bool:
        """Validate that all required email configuration is present"""
        required_fields = [
            self.config.SMTP_USERNAME,
            self.config.SMTP_PASSWORD,
            self.config.FROM_EMAIL
        ]
        return all(field.strip() for field in required_fields)
    
    def send_single_email(self, to_email: str, subject: str, content: str) -> dict:
        """Send a single email and return result"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.config.FROM_NAME} <{self.config.FROM_EMAIL}>"
            message["To"] = to_email
            message["Date"] = datetime.now().strftime("%a, %d %b %Y %H:%M:%S %z")
            
            # Create both plain text and HTML versions
            text_part = MIMEText(content, "plain")
            
            # Convert plain text to simple HTML
            html_content = content.replace("\n", "<br>\n")
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>{subject}</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
                    <h2 style="color: #dc3545; margin-top: 0;">Document Review Required</h2>
                    <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 15px 0;">
                        {html_content}
                    </div>
                    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
                    <p style="font-size: 12px; color: #6c757d; margin: 0;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </body>
            </html>
            """
            html_part = MIMEText(html_body, "html")
            
            # Attach parts
            message.attach(text_part)
            message.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.config.SMTP_SERVER, self.config.SMTP_PORT) as server:
                server.starttls()  # Enable TLS encryption
                server.login(self.config.SMTP_USERNAME, self.config.SMTP_PASSWORD)
                server.send_message(message)
            
            logger.info(f"Email sent successfully to {to_email}")
            return {
                "email": to_email,
                "status": "success",
                "message": "Email sent successfully"
            }
            
        except smtplib.SMTPAuthenticationError:
            logger.error(f"SMTP authentication failed for {to_email}")
            return {
                "email": to_email,
                "status": "error",
                "message": "SMTP authentication failed. Check username/password."
            }
        except smtplib.SMTPRecipientsRefused:
            logger.error(f"Recipient refused: {to_email}")
            return {
                "email": to_email,
                "status": "error",
                "message": "Recipient email address was refused"
            }
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error for {to_email}: {str(e)}")
            return {
                "email": to_email,
                "status": "error",
                "message": f"SMTP error: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Unexpected error sending email to {to_email}: {str(e)}")
            return {
                "email": to_email,
                "status": "error",
                "message": f"Unexpected error: {str(e)}"
            }

# Initialize email service
email_config = EmailConfig()
email_service = EmailService(email_config)

# Thread pool for concurrent email sending
executor = ThreadPoolExecutor(max_workers=5)

@router.post("/send-emails", response_model=EmailResponse)
async def send_emails(request: EmailRequest):
    """
    Send emails to multiple recipients
    
    This endpoint accepts a list of emails with their content and sends them
    using the configured SMTP settings. The emails are sent concurrently for better performance.
    """
    try:
        # Validate email configuration
        if not email_service.validate_config():
            raise HTTPException(
                status_code=500,
                detail="Email configuration incomplete. Please check SMTP_USERNAME, SMTP_PASSWORD, and FROM_EMAIL environment variables."
            )
        
        if not request.emails:
            raise HTTPException(
                status_code=400,
                detail="No emails provided"
            )
        
        if len(request.emails) > 100:  # Prevent abuse
            raise HTTPException(
                status_code=400,
                detail="Maximum 100 emails per request"
            )
        
        logger.info(f"Processing {len(request.emails)} emails")
        
        # Send emails concurrently using thread pool
        loop = asyncio.get_event_loop()
        tasks = []
        
        for email_data in request.emails:
            task = loop.run_in_executor(
                executor,
                email_service.send_single_email,
                email_data.email,
                email_data.subject,
                email_data.content
            )
            tasks.append(task)
        
        # Wait for all emails to be processed
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        successful_emails = []
        failed_emails = []
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                failed_emails.append({
                    "email": request.emails[i].email,
                    "status": "error",
                    "message": f"Exception occurred: {str(result)}"
                })
            elif result.get("status") == "success":
                successful_emails.append(result)
            else:
                failed_emails.append(result)
        
        # Log summary
        logger.info(f"Email sending completed: {len(successful_emails)} successful, {len(failed_emails)} failed")
        
        return EmailResponse(
            status="completed" if len(failed_emails) == 0 else "partial",
            sent=len(successful_emails),
            failed=len(failed_emails),
            details=failed_emails if failed_emails else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in send_emails endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/config/test")
async def test_email_config():
    """Test endpoint to check email configuration"""
    try:
        if not email_service.validate_config():
            return {
                "status": "error",
                "message": "Email configuration incomplete",
                "missing_vars": [
                    var for var, val in {
                        "SMTP_USERNAME": email_config.SMTP_USERNAME,
                        "SMTP_PASSWORD": email_config.SMTP_PASSWORD,
                        "FROM_EMAIL": email_config.FROM_EMAIL
                    }.items() if not val.strip()
                ]
            }
        
        # Test SMTP connection
        with smtplib.SMTP(email_config.SMTP_SERVER, email_config.SMTP_PORT) as server:
            server.starttls()
            server.login(email_config.SMTP_USERNAME, email_config.SMTP_PASSWORD)
        
        return {
            "status": "success",
            "message": "Email configuration is valid and SMTP connection successful",
            "config": {
                "smtp_server": email_config.SMTP_SERVER,
                "smtp_port": email_config.SMTP_PORT,
                "from_email": email_config.FROM_EMAIL,
                "from_name": email_config.FROM_NAME
            }
        }
        
    except smtplib.SMTPAuthenticationError:
        return {
            "status": "error",
            "message": "SMTP authentication failed. Check username and password."
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Connection test failed: {str(e)}"
        }

@router.post("/send-test-email")
async def send_test_email(test_email: EmailStr):
    """Send a test email to verify configuration"""
    try:
        if not email_service.validate_config():
            raise HTTPException(
                status_code=500,
                detail="Email configuration incomplete"
            )
        
        test_subject = "Test Email - Configuration Verification"
        test_content = """Dear User,

This is a test email to verify that your email configuration is working correctly.

If you receive this email, your SMTP settings are properly configured and ready to send application notifications.

Best regards,
BPI Application Review Team

---
This is an automated test message."""

        result = email_service.send_single_email(test_email, test_subject, test_content)
        
        if result["status"] == "success":
            return {"status": "success", "message": f"Test email sent successfully to {test_email}"}
        else:
            raise HTTPException(status_code=500, detail=result["message"])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send test email: {str(e)}")

# Configuration check function (don't run on import)
def print_email_config():
    print("=" * 50)
    print("EMAIL SERVICE CONFIGURATION")
    print("=" * 50)
    print(f"SMTP Server: {email_config.SMTP_SERVER}:{email_config.SMTP_PORT}")
    print(f"From Email: {email_config.FROM_EMAIL}")
    print(f"From Name: {email_config.FROM_NAME}")
    print(f"Username: {email_config.SMTP_USERNAME}")
    print(f"Password: {'*' * len(email_config.SMTP_PASSWORD) if email_config.SMTP_PASSWORD else 'NOT SET'}")
    print("=" * 50)

    if not email_service.validate_config():
        print("⚠️  WARNING: Email configuration is incomplete!")
        print("Please set the following environment variables:")
        print("- SMTP_USERNAME (your email address)")
        print("- SMTP_PASSWORD (your email app password)")
        print("- FROM_EMAIL (sender email address)")
    else:
        print("✅ Email configuration looks good!")

    print("=" * 50)

# Print config info (optional - call this manually if needed)
# print_email_config()