from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api.v1.api import api_router
from app.db import base  # Importar modelos para asegurar que SQLAlchemy los conozca


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuración de archivos estáticos para subidas
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Configuración CORS adaptada para desarrollo y producción
origins = [
    "http://localhost:5173",          # desarrollo local
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "https://lenguaje-senas-5-we.onrender.com",
    "https://lenguaje-senas.vercel.app",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Usamos la lista explícita para ser compatibles con allow_credentials=True
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir Router V1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to Lenguaje de Señas AI API"}
