import requests
import json
import random

url = "http://localhost:8000/api/v1/auth/register"
email = f"test_{random.randint(1000, 9999)}@example.com"
data = {
    "email": email,
    "password": "password123",
    "full_name": "Test User"
}

print(f"Testing registration with {email}...")

try:
    response = requests.post(url, json=data, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
