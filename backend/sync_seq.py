from app.db.session import engine
from sqlalchemy import text

def sync_sequences():
    # Only tables that actually have an 'id' sequence
    sequences = [
        ('users', 'id'),
        ('notifications', 'id'),
        ('achievements', 'id'),
        ('modules', 'id'),
        ('elements', 'id'),
        ('hand_captures', 'id'),
        ('user_progress', 'id'),
        ('practice_sessions', 'id'),
        ('user_module_progress', 'id'),
    ]
    
    with engine.begin() as conn:
        for table, col in sequences:
            try:
                # Check if table has data
                res = conn.execute(text(f"SELECT MAX({col}) FROM {table}")).scalar()
                if res is not None:
                    sql = f"SELECT setval('{table}_{col}_seq', (SELECT MAX({col}) FROM {table}))"
                    conn.execute(text(sql))
                    print(f"✅ Secuencia sincronizada: {table} (Max ID: {res})")
                else:
                    print(f"ℹ️ Tabla vacía, saltando secuencia: {table}")
            except Exception as e:
                print(f"⚠️ No se pudo sincronizar {table}: {e}")

if __name__ == "__main__":
    sync_sequences()
