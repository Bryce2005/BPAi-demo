from database import engine, SessionLocal, Base
from sqlalchemy import text

# Only import and create tables if models exist
try:
    import models
    print("Creating tables from models...")
    models.Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")
except ImportError:
    print("ℹ️  No models.py found, skipping table creation")
except AttributeError:
    print("ℹ️  models.py exists but no Base found, skipping table creation")

# Test database connection
print("Testing database connection...")

try:
    # Test basic connection
    db = SessionLocal()
    
    # Test with a simple query
    result = db.execute(text("SELECT version()"))
    version = result.fetchone()[0]
    print("✅ Database connection successful!")
    print(f"PostgreSQL version: {version[:50]}...")
    
    # Test current database
    result = db.execute(text("SELECT current_database()"))
    db_name = result.fetchone()[0]
    print(f"✅ Connected to database: {db_name}")
    
    db.close()
    print("✅ Database test completed successfully!")
    
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    print("\nTroubleshooting:")
    print("1. Check your .env file has the correct DATABASE_URL")
    print("2. Make sure PostgreSQL is running")
    print("3. Verify your password is correct")
    print("4. Try: psql -U postgres -d postgres")