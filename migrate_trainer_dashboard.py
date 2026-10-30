import sqlite3
import json

def migrate():
    conn = sqlite3.connect('fitsphere360.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("[FitSphere 360] Migrating Trainer Dashboard tables in SQLite...")

    # 1. trainer_workout_plans Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS trainer_workout_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trainer_id INTEGER NOT NULL,
        trainee_id INTEGER,
        gym_id INTEGER,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'Strength & Conditioning',
        difficulty TEXT DEFAULT 'Intermediate',
        target_muscle TEXT DEFAULT 'Full Body',
        duration_weeks INTEGER DEFAULT 4,
        exercises TEXT NOT NULL,
        instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
        FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL
    )
    ''')

    # 2. trainer_messages Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS trainer_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trainer_id INTEGER NOT NULL,
        trainee_id INTEGER NOT NULL,
        sender_role TEXT NOT NULL CHECK(sender_role IN ('trainer', 'trainee')),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
        FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    conn.commit()

    # Get John Doe's trainer_id
    cursor.execute("SELECT id FROM trainers WHERE email = 'trainer@fitsphere360.com' OR user_id = 3")
    row = cursor.fetchone()
    if row:
        trainer_id = row['id']
        print(f"[FitSphere 360] Found John Doe trainer_id = {trainer_id}")

        # Check existing workout plans
        cursor.execute("SELECT COUNT(*) FROM trainer_workout_plans WHERE trainer_id = ?", (trainer_id,))
        wp_count = cursor.fetchone()[0]
        if wp_count == 0:
            print("[FitSphere 360] Seeding sample workout plans for Trainer John Doe...")
            sample_plans = [
                (
                    trainer_id,
                    1, # Alex Mercer
                    1, # IronPulse Gym
                    "Hypertrophy Push-Pull-Legs Specialist Cycle",
                    "Hypertrophy",
                    "Advanced",
                    "Full Body & Power",
                    6,
                    json.dumps([
                        {"name": "Barbell Incline Bench Press", "sets": "4", "reps": "8-10", "notes": "RPE 8. Retract scapula, 2-sec eccentric phase"},
                        {"name": "Weighted Dips", "sets": "3", "reps": "10-12", "notes": "Forward lean for chest focus, add 10-15kg belt"},
                        {"name": "Romanian Deadlift (RDL)", "sets": "4", "reps": "8-10", "notes": "Slow 3s negative, feel deep hamstring stretch"},
                        {"name": "Cable Lateral Raises", "sets": "4", "reps": "15-20", "notes": "Constant shoulder tension, no swinging"},
                        {"name": "Bulgarian Split Squats", "sets": "3", "reps": "10/leg", "notes": "Torso upright for quad bias, dumbbells in hand"}
                    ]),
                    "Follow progressive overload strictly. Increase load by 2.5kg whenever top rep target is reached across all working sets. Hydrate with 3.5L water daily."
                ),
                (
                    trainer_id,
                    None, # General plan
                    1,
                    "Olympic Snatch Trajectory & Barbell Speed",
                    "Olympic Weightlifting",
                    "Intermediate",
                    "Posterior Chain & Speed",
                    4,
                    json.dumps([
                        {"name": "Snatch High Pulls", "sets": "5", "reps": "3", "notes": "Drive through heels, violent triple extension"},
                        {"name": "Overhead Squat (Paused)", "sets": "4", "reps": "4", "notes": "2-sec pause in bottom hole, active shoulder shrug"},
                        {"name": "Hang Power Snatch", "sets": "4", "reps": "3", "notes": "Fast elbow turnover, catch with high hips"},
                        {"name": "Snatch Balance", "sets": "3", "reps": "3", "notes": "Speed under the barbell"}
                    ]),
                    "Focus entirely on bar velocity and bar path verticality. Video record your top sets for technique breakdown during 1-on-1 coaching."
                ),
                (
                    trainer_id,
                    1,
                    1,
                    "Calisthenics Bar Mastery & Core Stabilization",
                    "Calisthenics",
                    "Intermediate",
                    "Lats, Shoulders & Core",
                    8,
                    json.dumps([
                        {"name": "Strict Chest-To-Bar Pull-Ups", "sets": "4", "reps": "8", "notes": "Dead-hang start, explode chest to bar"},
                        {"name": "Parallel Bar Dips", "sets": "4", "reps": "12", "notes": "Full depth, 90 degree arm angle at bottom"},
                        {"name": "Dragon Flags", "sets": "3", "reps": "6-8", "notes": "Controlled descent without breaking lumbar position"},
                        {"name": "L-Sit Parallette Holds", "sets": "4", "reps": "20 sec", "notes": "Point toes forward, press floor away"}
                    ]),
                    "Strict gymnastics cadence. No kipping or swinging. Rest 90 seconds between sets."
                )
            ]

            for sp in sample_plans:
                cursor.execute('''
                INSERT INTO trainer_workout_plans 
                (trainer_id, trainee_id, gym_id, title, category, difficulty, target_muscle, duration_weeks, exercises, instructions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', sp)
            conn.commit()
            print("[FitSphere 360] Seeded 3 workout plans successfully.")

        # Check messages
        cursor.execute("SELECT COUNT(*) FROM trainer_messages WHERE trainer_id = ?", (trainer_id,))
        msg_count = cursor.fetchone()[0]
        if msg_count == 0:
            print("[FitSphere 360] Seeding sample messages between Trainer John Doe and Alex Mercer...")
            sample_messages = [
                (trainer_id, 1, 'trainee', "Hi Coach John! I've been hitting the warm-up protocol and my hip mobility feels so much looser for tomorrow's session."),
                (trainer_id, 1, 'trainer', "Outstanding Alex! That hip capsule work will unlock your depth on back squats. Have a solid meal 90 mins prior, and we'll dial in bar path tomorrow morning."),
                (trainer_id, 1, 'trainee', "Understood coach! Looking forward to testing the new workout plan you assigned."),
                (trainer_id, 1, 'trainer', "You got it. Push-Pull-Legs Cycle is now active in your dashboard. Let's crush it!")
            ]
            for sm in sample_messages:
                cursor.execute('''
                INSERT INTO trainer_messages (trainer_id, trainee_id, sender_role, message)
                VALUES (?, ?, ?, ?)
                ''', sm)
            conn.commit()
            print("[FitSphere 360] Seeded 4 messages successfully.")

        # Ensure John Doe has realistic booking requests in different statuses
        # 1. Alex Mercer pending booking
        cursor.execute("SELECT id FROM trainer_bookings WHERE trainer_id = ? AND status = 'pending'", (trainer_id,))
        if not cursor.fetchone():
            cursor.execute('''
            INSERT INTO trainer_bookings (trainer_id, trainee_id, gym_id, booking_date, time_slot, status, notes)
            VALUES (?, ?, ?, '2026-11-06', '07:00 AM - 11:00 AM', 'pending', 'Interested in Olympic lifting snatch progression and biomechanics review.')
            ''', (trainer_id, 1, 1))

        # 2. Alex Mercer accepted booking
        cursor.execute("SELECT id FROM trainer_bookings WHERE trainer_id = ? AND status = 'accepted'", (trainer_id,))
        if not cursor.fetchone():
            cursor.execute('''
            INSERT INTO trainer_bookings (trainer_id, trainee_id, gym_id, booking_date, time_slot, status, notes)
            VALUES (?, ?, ?, '2026-11-08', '04:00 PM - 08:00 PM', 'accepted', 'Confirmed 1-on-1 Hypertrophy and heavy compound lifts session.')
            ''', (trainer_id, 1, 1))

        conn.commit()
        print("[FitSphere 360] Seeded bookings successfully for Trainer John Doe.")

    conn.close()
    print("[FitSphere 360] Trainer migration completed!")

if __name__ == '__main__':
    migrate()
