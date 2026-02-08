import urllib.request
import json
import random

email = f"test_{random.randint(10000, 99999)}@test.com"
url = "http://localhost:8005/api/v1/auth/register"
data = json.dumps({
    "email": email,
    "password": "password123",
    "full_name": "Test User"
}).encode('utf-8')

print(f"Testing with: {email}")

req = urllib.request.Request(url, data=data, method='POST')
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.getcode()}")
        print(f"Body: {response.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'read'):
        print(f"Error Body: {e.read().decode('utf-8')}")
