"""
Email and Statutory Communication Service for METRAVISION.
Dispatches official Show Cause Notices, Inspection Memos, and Compliance Alerts.
"""
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

class EmailService:
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SENDER_EMAIL = os.getenv("SENDER_EMAIL", "legalmetrology-enforcement@gov.in")
    SENDER_NAME = "Legal Metrology Enforcement Directorate"

    @classmethod
    def send_statutory_notice_email(
        cls,
        recipient_email: str,
        recipient_name: str,
        case_number: str,
        notice_type: str,
        statutory_section: str,
        due_date_str: str,
        pdf_bytes: Optional[bytes] = None,
        pdf_filename: Optional[str] = None
    ) -> bool:
        """
        Sends statutory notice email with PDF attachment.
        Gracefully simulates sending if SMTP credentials are not configured.
        """
        subject = f"[OFFICIAL NOTICE] {notice_type} - Case {case_number} | Legal Metrology Act, 2009"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
            <div style="background-color: #002b49; padding: 16px 24px; color: #ffffff;">
                <h2 style="margin:0; font-size: 18px; text-transform: uppercase;">Legal Metrology Enforcement Directorate</h2>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #93c5fd;">Government of India | Statutory Notice</p>
            </div>
            
            <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
                <p>To,</p>
                <p><strong>{recipient_name}</strong><br/>Email: {recipient_email}</p>
                
                <p><strong>Subject:</strong> Formal Notice under {statutory_section} of Legal Metrology Act, 2009 / PCR 2011</p>
                
                <p>Take notice that during statutory inspection/verification conducted under the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011, non-compliance was recorded against pre-packaged commodities associated with your establishment.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr style="background-color: #f8fafc;">
                        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; width: 30%;">Case Reference</td>
                        <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">{case_number}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">Notice Classification</td>
                        <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">{notice_type}</td>
                    </tr>
                    <tr style="background-color: #f8fafc;">
                        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">Statutory Provision</td>
                        <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">{statutory_section}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #b91c1c;">Response Deadline</td>
                        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #b91c1c;">{due_date_str}</td>
                    </tr>
                </table>
                
                <p>You are hereby directed to submit your formal written reply/justification within the stipulated deadline. Failure to respond may lead to statutory compounding proceedings or prosecution under Section 36/39/49 of the Legal Metrology Act, 2009.</p>
                
                <p>The detailed statutory inspection memo and violation evidence are attached to this communication.</p>
                
                <p style="margin-top: 32px;">Yours faithfully,</p>
                <p><strong>Authorized Enforcement Officer</strong><br/>
                Legal Metrology Enforcement Wing<br/>
                METRAVISION Automated Compliance System</p>
            </div>
            
            <div style="padding: 12px 24px; background-color: #f1f5f9; font-size: 11px; color: #64748b; border: 1px solid #e2e8f0; border-top: none;">
                This is a system-generated official communication. For verification, visit the official METRAVISION portal.
            </div>
        </body>
        </html>
        """

        if not (cls.SMTP_USER and cls.SMTP_PASSWORD):
            logger.info(f"[SIMULATED EMAIL] Statutory notice successfully queued for {recipient_email} (Case {case_number}).")
            return True

        try:
            msg = MIMEMultipart()
            msg["From"] = f"{cls.SENDER_NAME} <{cls.SENDER_EMAIL}>"
            msg["To"] = recipient_email
            msg["Subject"] = subject
            msg.attach(MIMEText(html_body, "html"))

            if pdf_bytes:
                part = MIMEApplication(pdf_bytes, Name=pdf_filename or f"Statutory_Notice_{case_number}.pdf")
                part["Content-Disposition"] = f'attachment; filename="{pdf_filename or f"Statutory_Notice_{case_number}.pdf"}"'
                msg.attach(part)

            server = smtplib.SMTP(cls.SMTP_HOST, cls.SMTP_PORT)
            server.starttls()
            server.login(cls.SMTP_USER, cls.SMTP_PASSWORD)
            server.sendmail(cls.SENDER_EMAIL, [recipient_email], msg.as_string())
            server.quit()
            logger.info(f"Email successfully sent to {recipient_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send statutory email: {e}")
            return False
