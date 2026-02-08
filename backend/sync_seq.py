from app.db.session import engine
from sqlalchemy import text

def sync_sequences():
    sequences = [
        ('users', 'id'),
        ('notifications', 'id'),
        ('achievements', 'id'),
        ('modules', 'id'),
        ('elements', 'id'),
        ('hand_captures', 'id'),
        ('user_progress', 'id'),
        ('practice_sessions', 'id'),
    ]
    
    with engine.begin() as conn:
        for table, col in sequences:
            try:
                # PostgreSQL command to sync the identity sequence
                sql = f"SELECT setval('{table}_{col}_seq', (SELECT MAX({col}) FROM {table}))"
                conn.execute(text(sql))
                print(f"✅ Secuencia sincronizada: {table}")
            except Exception as e:
                print(f"⚠️ No se pudo sincronizar {table}: {e}")

if __name__ == "__main__":
    sync_sequences()
