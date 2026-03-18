import os
import sys
from sqlalchemy import create_url
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in .env")
    sys.exit(1)

# Handle Supabase pooler URL if needed (sometimes sqlalchemy needs different drivers)
if "pooler.supabase.com" in DATABASE_URL and not DATABASE_URL.startswith("postgresql://"):
    pass # Already postgresql

engine = create_engine(DATABASE_URL)

with engine.connect() as connection:
    result = connection.execute(text("SELECT id, title, is_active, is_published FROM modules"))
    modules = result.fetchall()
    print(f"Total modules found: {len(modules)}")
    for m in modules:
        print(f"ID: {m[0]}, Title: {m[1]}, Active: {m[2]}, Published: {m[3]}")
