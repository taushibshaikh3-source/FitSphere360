import sqlite3

def run_migration():
    conn = sqlite3.connect('fitsphere360.db')
    cursor = conn.cursor()
    cursor.execute('PRAGMA foreign_keys = OFF;')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS trainers_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        owner_id INTEGER,
        gym_id INTEGER,
        name TEXT NOT NULL,
        full_name TEXT,
        email TEXT,
        phone TEXT,
        profile_image TEXT,
        avatar_url TEXT,
        experience_years INTEGER NOT NULL DEFAULT 1,
        experience TEXT,
        specialization TEXT NOT NULL,
        qualifications TEXT NOT NULL,
        hourly_rate REAL NOT NULL DEFAULT 1000.0,
        salary REAL DEFAULT 45000.0,
        gender TEXT,
        age INTEGER,
        available_days TEXT,
        available_time_slots TEXT,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
        rating REAL DEFAULT 4.9,
        reviews_count INTEGER DEFAULT 0,
        bio TEXT,
        availability TEXT,
        clients_count INTEGER DEFAULT 12,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL
    );
    ''')

    cursor.execute('''
    INSERT OR REPLACE INTO trainers_new (
        id, user_id, owner_id, gym_id, name, full_name, email, phone, profile_image, avatar_url,
        experience_years, experience, specialization, qualifications, hourly_rate, salary,
        gender, age, available_days, available_time_slots, status, rating, reviews_count,
        bio, availability, clients_count, created_at, updated_at
    )
    SELECT 
        t.id, t.user_id, COALESCE(g.owner_id, 2), t.gym_id, t.name, t.name, u.email, u.phone, t.avatar_url, t.avatar_url,
        t.experience_years, CAST(t.experience_years AS TEXT) || ' years', t.specialization, t.qualifications, t.hourly_rate, 45000.0,
        'Male', 29, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]', '["07:00 AM - 11:00 AM", "04:00 PM - 08:00 PM"]', 'active', t.rating, t.reviews_count,
        t.bio, t.availability, t.clients_count, t.created_at, CURRENT_TIMESTAMP
    FROM trainers t
    LEFT JOIN gyms g ON t.gym_id = g.id
    LEFT JOIN users u ON t.user_id = u.id;
    ''')

    cursor.execute('DROP TABLE trainers;')
    cursor.execute('ALTER TABLE trainers_new RENAME TO trainers;')

    cursor.execute('PRAGMA foreign_keys = ON;')
    conn.commit()

    rows = cursor.execute('SELECT id, name, owner_id, gym_id, email, status, salary FROM trainers').fetchall()
    print("Migration successful! Current trainers:")
    for r in rows:
        print(r)
    conn.close()

if __name__ == '__main__':
    run_migration()
