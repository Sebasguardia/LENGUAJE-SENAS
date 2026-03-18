import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.core.config import settings

def send_email(
    email_to: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Generic function to send an email via SMTP.
    """
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("DEBUG: SMTP settings not configured. Printing email content to terminal:")
        print(f"To: {email_to}")
        print(f"Subject: {subject}")
        print(f"Content: {html_content}")
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email_to

    if text_content:
        part1 = MIMEText(text_content, "plain")
        message.attach(part1)
    
    part2 = MIMEText(html_content, "html")
    message.attach(part2)

    host = str(settings.SMTP_HOST).strip()
    port = int(settings.SMTP_PORT)
    user = str(settings.SMTP_USER).strip()
    password = str(settings.SMTP_PASSWORD).strip()
    
    print(f"DEBUG: Intentando conectar a {repr(host)}:{port}...")
    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            if settings.SMTP_TLS:
                server.starttls()
            server.login(user, password)
            server.sendmail(user, email_to, message.as_string())
        return True
    except Exception as e:
        print(f"ERRO AL ENVIAR CORREO a {email_to}: {e}")
        print(f"DEBUG DETAIL - HOST: {repr(host)}, PORT: {port}, USER: {repr(user)}")
        return False

def send_recovery_email(email_to: str, code: str) -> bool:
    """
    Sends a security code for password recovery.
    """
    subject = f"{code} es tu código de recuperación - {settings.PROJECT_NAME}"
    
    html_content = f"""
    <html>
        <body style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background: #1e293b; padding: 40px; border-radius: 12px; border: 1px solid #334155;">
                <h1 style="color: #8b5cf6; text-align: center;">Recuperación de Acceso</h1>
                <p style="font-size: 16px; line-height: 1.6; text-align: center;">
                    Has solicitado restablecer tu contraseña en <strong>{settings.PROJECT_NAME}</strong>.
                </p>
                <div style="margin: 30px auto; padding: 20px; background: #334155; border-radius: 8px; text-align: center;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #a78bfa;">{code}</span>
                </div>
                <p style="font-size: 14px; color: #94a3b8; text-align: center;">
                    Este código expirará en 10 minutos. Si no has solicitado esto, puedes ignorar este mensaje.
                </p>
                <hr style="border: 0; border-top: 1px solid #334155; margin: 30px 0;">
                <p style="font-size: 12px; color: #64748b; text-align: center;">
                    © {settings.PROJECT_NAME} - Protocolo de Seguridad Neuronal Activo.
                </p>
            </div>
        </body>
    </html>
    """
    
    text_content = f"Tu código de recuperación para {settings.PROJECT_NAME} es: {code}. Este código expira en 10 minutos."
    
    return send_email(email_to, subject, html_content, text_content)
def send_registration_verification_email(email_to: str, code: str) -> bool:
    """
    Sends a verification code for new user registration.
    """
    subject = f"{code} es tu código de verificación - {settings.PROJECT_NAME}"
    
    html_content = f"""
    <html>
        <body style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background: #1e293b; padding: 40px; border-radius: 12px; border: 1px solid #334155;">
                <h1 style="color: #3b82f6; text-align: center;">Bienvenido a {settings.PROJECT_NAME}</h1>
                <p style="font-size: 16px; line-height: 1.6; text-align: center;">
                    Para completar tu registro, por favor ingresa el siguiente código de seguridad en la aplicación:
                </p>
                <div style="margin: 30px auto; padding: 20px; background: #334155; border-radius: 8px; text-align: center;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #60a5fa;">{code}</span>
                </div>
                <p style="font-size: 14px; color: #94a3b8; text-align: center;">
                    Este código es necesario para validar tu identidad empresarial y activar tu cuenta.
                </p>
                <hr style="border: 0; border-top: 1px solid #334155; margin: 30px 0;">
                <p style="font-size: 12px; color: #64748b; text-align: center;">
                    © {settings.PROJECT_NAME} - Sistema de Seguridad Corporativa.
                </p>
            </div>
        </body>
    </html>
    """
    
    text_content = f"Tu código de verificación para {settings.PROJECT_NAME} es: {code}. Úsalo para activar tu cuenta."
    
    return send_email(email_to, subject, html_content, text_content)
