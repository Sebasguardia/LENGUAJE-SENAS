import smtplib
import socket

host = "smtp.gmail.com"
port = 587

print(f"Testing connection to {host}:{port}...")
try:
    # Manual resolution check
    ip = socket.gethostbyname(host)
    print(f"Resolved {host} to {ip}")
    
    with smtplib.SMTP(host, port, timeout=10) as server:
        print("Connected successfully!")
        server.starttls()
        print("STARTTLS successful!")
except Exception as e:
    print(f"Connection failed: {e}")
