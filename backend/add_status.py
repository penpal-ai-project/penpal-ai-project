import sqlite3

conn = sqlite3.connect("letters.db")

conn.execute("""
ALTER TABLE letters
ADD COLUMN status TEXT DEFAULT 'received'
""")

conn.commit()
conn.close()

print("status 컬럼 추가 완료")