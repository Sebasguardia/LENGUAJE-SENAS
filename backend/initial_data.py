import logging
from app.db.init_db import init_db

from app.db.seeds import seed_modules
from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init() -> None:
    db = SessionLocal()
    try:
        init_db(db)
        seed_modules(db)
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Creating initial data")
    init()
    logger.info("Initial data created")
