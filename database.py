import sqlite3
import json
import os
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fitsphere360.db')

def get_db_connection():
    """Returns a SQLite connection with row factory configured to return dict-like objects."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Initializes all database tables and seeds demo data if not already present."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('trainee', 'owner', 'trainer')),
        phone TEXT,
        avatar TEXT,
        bio TEXT,
        fitness_goal TEXT DEFAULT 'General Fitness',
        budget_max REAL DEFAULT 3000.0,
        preferred_location TEXT DEFAULT 'Downtown',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 2. Gyms Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS gyms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        tagline TEXT,
        description TEXT,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        price_range TEXT NOT NULL,
        min_price REAL NOT NULL,
        rating REAL DEFAULT 4.8,
        review_count INTEGER DEFAULT 0,
        image_url TEXT,
        opening_hours TEXT NOT NULL,
        closing_hours TEXT NOT NULL,
        contact_phone TEXT,
        women_safety_features TEXT,
        crowd_level TEXT DEFAULT 'Moderate',
        crowd_percent INTEGER DEFAULT 55,
        fitness_goals TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    # 3. Membership Plans Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS membership_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gym_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        duration TEXT NOT NULL,
        duration_months INTEGER DEFAULT 1,
        price REAL NOT NULL,
        description TEXT,
        features TEXT,
        is_popular INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
    )
    ''')

    # 4. Trainers Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS trainers (
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
    )
    ''')

    # 5. Trainer Bookings Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS trainer_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trainer_id INTEGER NOT NULL,
        trainee_id INTEGER NOT NULL,
        gym_id INTEGER,
        booking_date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'completed')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
        FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL
    )
    ''')

    # 6. Membership Selections Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS membership_selections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        plan_id INTEGER NOT NULL,
        gym_id INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        expiry_date TEXT NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled')),
        payment_demo_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES membership_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
    )
    ''')

    # 7. Reviews Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gym_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    ''')

    # 8. Equipment Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gym_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        target_muscle TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        condition TEXT DEFAULT 'Excellent',
        image_url TEXT,
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
    )
    ''')

    # 9. Workouts Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        duration_mins INTEGER NOT NULL,
        calories_burn INTEGER NOT NULL,
        target_muscles TEXT NOT NULL,
        description TEXT NOT NULL,
        steps TEXT NOT NULL
    )
    ''')

    # 10. Trainer Workout Plans Table
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

    # 11. Trainer Messages Table
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

    # Check if demo users already exist
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    if count == 0:
        print("[FitSphere 360] Database empty. Seeding initial data...")
        seed_data(cursor, conn)
    else:
        print(f"[FitSphere 360] Database verified with {count} users.")

    conn.close()

def seed_data(cursor, conn):
    """Populates realistic commercial fitness data matching FitSphere 360 styling."""
    
    # 1. Seed Users (Demo Accounts)
    users_data = [
        # Trainee Demo Account
        (
            'Alex Mercer',
            'trainee@fitsphere360.com',
            generate_password_hash('trainee123'),
            'trainee',
            '+1 (555) 234-5678',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            'Passionate fitness enthusiast dedicated to strength training and progressive overload.',
            'Muscle Building',
            3500.0,
            'Downtown'
        ),
        # Gym Owner Demo Account
        (
            'Marcus Vance',
            'owner@fitsphere360.com',
            generate_password_hash('owner123'),
            'owner',
            '+1 (555) 876-5432',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
            'Founder & Managing Director of IronPulse Fitness Network. 15+ years in sports facility management.',
            'Business Growth',
            0.0,
            'Downtown'
        ),
        # Trainer Demo Account
        (
            'John Doe',
            'trainer@fitsphere360.com',
            generate_password_hash('trainer123'),
            'trainer',
            '+1 (555) 432-1098',
            'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&auto=format&fit=crop&q=80',
            'CSCS Certified Master Trainer specializing in hypertrophy, Olympic weightlifting and functional longevity.',
            'Coaching & Hypertrophy',
            0.0,
            'Downtown'
        ),
        # Additional Trainers as Users
        (
            'Emma Davis',
            'emma@fitsphere360.com',
            generate_password_hash('trainer123'),
            'trainer',
            '+1 (555) 777-1234',
            'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&auto=format&fit=crop&q=80',
            'Elite Pilates & Core Conditioning specialist. Former national gymnast.',
            'Pilates & Mobility',
            0.0,
            'Uptown'
        ),
        (
            'Robert Fox',
            'robert@fitsphere360.com',
            generate_password_hash('trainer123'),
            'trainer',
            '+1 (555) 888-2345',
            'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=80',
            'Endurance and tactical conditioning coach. Precision heart rate training and metabolic optimization.',
            'Endurance & HIIT',
            0.0,
            'Westside'
        ),
        (
            'Eleanor Pena',
            'eleanor@fitsphere360.com',
            generate_password_hash('trainer123'),
            'trainer',
            '+1 (555) 999-3456',
            'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80',
            'Golden Gloves boxing coach and high-intensity combat conditioning expert.',
            'Boxing & Combat',
            0.0,
            'Metro Hub'
        )
    ]

    for user in users_data:
        cursor.execute('''
        INSERT INTO users (name, email, password_hash, role, phone, avatar, bio, fitness_goal, budget_max, preferred_location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', user)

    # 2. Seed Gyms (Owned by Marcus Vance, user_id=2)
    gyms_data = [
        (
            2, # Marcus Vance
            'IronPulse Mega Gym & Athletic Arena',
            'Where Elite Performance Meets Cutting-Edge Technology',
            'Spanning 35,000 sq ft, IronPulse features competition Olympic platforms, Eleiko calibrated plates, hammer strength iso-lateral machines, turf sprinting track, recovery cryo saunas, and biometric check-ins.',
            '742 Ironworks Boulevard, Suite 100',
            'Downtown',
            '₹1,499 - ₹2,999/mo',
            1499.0,
            4.9,
            128,
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&auto=format&fit=crop&q=80',
            '05:00 AM',
            '11:30 PM',
            '+1 (555) 901-2000',
            json.dumps([
                'Dedicated Female-Only Workout Zone (2,500 sq ft)',
                'Female Certified Coaches on Staff 7 Days/Week',
                '24/7 Monitored HD Security & Biometric Access',
                'Touchless Keycard Entry and Private Luxury Lockers',
                'Panic Buttons and Escort to Parking at Night'
            ]),
            'Moderate',
            58,
            'Muscle Building, CrossFit, Strength Training, Powerlifting'
        ),
        (
            2,
            'Aura Wellness & Boutique Fitness Club',
            'Harmonious Mind-Body Architecture & Elevated Studio Training',
            'A sanctuary designed for holistic transformation. Featuring infrared hot yoga studios, balanced reformer pilates suites, zero-gravity relaxation pods, and organic protein hydration bar.',
            '18 Lotus Way, Highland Center',
            'Uptown',
            '₹1,999 - ₹4,499/mo',
            1999.0,
            4.8,
            94,
            'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1000&auto=format&fit=crop&q=80',
            '06:00 AM',
            '10:00 PM',
            '+1 (555) 901-3000',
            json.dumps([
                'Women-Led Facility & 80% Female Staff',
                'Private Changing Suites with En-Suite Rain Showers',
                'Private Keypad Secure Access Systems',
                '24/7 Security Concierge Onsite',
                'Zero-Tolerance Harassment Policy strictly enforced'
            ]),
            'Low',
            32,
            'Yoga, Pilates, Flexibility, Fat Loss, Mindfulness'
        ),
        (
            2,
            'Titan Strength Lab & Functional Athletics',
            'Old School Heavy Iron Meets Modern Sports Science',
            'Engineered for serious lifters. Custom power racks with band pegs, deadlift jacks, calibrated kilogram discs, specialty bars (Safety Squat, Swiss, Trap), and dedicated chalk allowed environment.',
            '404 Powerhouse Road',
            'Westside',
            '₹1,199 - ₹2,499/mo',
            1199.0,
            4.7,
            86,
            'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1000&auto=format&fit=crop&q=80',
            '05:30 AM',
            '11:00 PM',
            '+1 (555) 901-4000',
            json.dumps([
                'Designated Co-Ed & Respectful Training Etiquette',
                'Staffed Safety Desk & Certified First Responders',
                'Well-lit Gated Parking Lot with CCTV',
                'Private Lockers and Surveillance in Public Hallways'
            ]),
            'Peak',
            82,
            'Strength Training, Powerlifting, Muscle Building, Olympic Lifting'
        ),
        (
            2,
            'PulseFit 24/7 Smart Gym',
            'Autonomous Fitness with Real-Time Smart Equipment Sync',
            'Open 24 hours a day, 365 days a year. Fitted with Technogym smart consoles that record your reps and heart-rate directly to your mobile profile. Ultra-clean, well lit, and always accessible.',
            '880 Metro Gateway Avenue',
            'Metro Hub',
            '₹899 - ₹1,799/mo',
            899.0,
            4.6,
            112,
            'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1000&auto=format&fit=crop&q=80',
            'Open 24 Hours',
            'Open 24 Hours',
            '+1 (555) 901-5000',
            json.dumps([
                '24/7 Continuous Automated CCTV Monitoring',
                'Direct Emergency Calling Stations around the floor',
                'Mobile App Door Unlock with Anti-Tailgating Sensors',
                'Private Single-Occupancy Restrooms and Showers'
            ]),
            'Brisk',
            65,
            'Cardio, HIIT, Weight Loss, General Fitness'
        ),
        (
            2,
            'Apex Combat & Calisthenics Academy',
            'Forged in Sweat: High Energy Boxing, MMA & Gymnastic Strength',
            'Full Olympic boxing ring, 15 heavy tear-drop bags, calisthenics rigs with pullup ladders and wooden rings, plus high-intensity turf sprint lanes.',
            '120 Ringmaster Way',
            'Eastside',
            '₹1,699 - ₹3,499/mo',
            1699.0,
            4.9,
            78,
            'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1000&auto=format&fit=crop&q=80',
            '06:00 AM',
            '10:30 PM',
            '+1 (555) 901-6000',
            json.dumps([
                'Women-Only Self Defense and Kickboxing Classes',
                'Female Sparring Coaches Available',
                'Secured Locker Facilities with Full Camera Coverage outside',
                'Family Friendly, Zero Intimidation Environment'
            ]),
            'Moderate',
            48,
            'Boxing, Martial Arts, Calisthenics, Conditioning'
        )
    ]

    for gym in gyms_data:
        cursor.execute('''
        INSERT INTO gyms (owner_id, name, tagline, description, address, city, price_range, min_price, rating, review_count, image_url, opening_hours, closing_hours, contact_phone, women_safety_features, crowd_level, crowd_percent, fitness_goals)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', gym)

    # 3. Seed Membership Plans
    plans_data = [
        # Plans for Gym 1 (IronPulse)
        (
            1,
            'Standard Access Pass',
            '1 Month',
            1,
            1499.0,
            'Full access to all free weights, cardio decks, and locker facilities during all operating hours.',
            json.dumps(['Complete Gym Floor Access', 'Locker Room & Sauna', 'FitSphere 360 App Integration', '1 Free Trainer Consultation']),
            0
        ),
        (
            1,
            'Pro Athlete Tier',
            '3 Months',
            3,
            3999.0, # ₹1,333/mo
            'Our most popular pass! Includes group classes, turf sprint arena, and towel service.',
            json.dumps(['All Standard Access Perks', 'Unlimited CrossFit & HIIT Classes', 'Free Cryo Sauna Sessions (2/mo)', 'Priority Personal Trainer Booking', 'Free InBody Composition Scans']),
            1
        ),
        (
            1,
            'VIP Elite Black Pass',
            '12 Months (Annual)',
            12,
            14999.0, # ₹1,250/mo
            'The ultimate fitness commitment. Unlimited guest passes, recovery lounge, and nutritional consulting.',
            json.dumps(['24/7 All-Location Gym Access', '1 Monthly Personal Training Session Included', 'Unlimited Cryotherapy & Recovery Suite', 'Complimentary Whey Protein Shake daily', 'Dedicated VIP Locker & Towel Service']),
            0
        ),
        # Plans for Gym 2 (Aura Wellness)
        (
            2,
            'Mind & Body Flex',
            '1 Month',
            1,
            1999.0,
            'Access to yoga studios, open gym, and mindfulness meditation dome.',
            json.dumps(['Unlimited Yoga & Mat Pilates', 'Infrared Sauna Access', 'Herbal Tea & Hydration Bar', 'Weekend Sound Bath Sessions']),
            0
        ),
        (
            2,
            'Reformer & Holistic Plus',
            '3 Months',
            3,
            5499.0,
            'Includes Allegro 2 Reformer Pilates group sessions and customized wellness coaching.',
            json.dumps(['All Mind & Body Perks', '8 Reformer Pilates Sessions/mo', 'Nutritionist Consultation', 'Complimentary Bamboo Towel Pack']),
            1
        ),
        # Plans for Gym 3 (Titan Strength)
        (
            3,
            'Heavy Metal Monthly',
            '1 Month',
            1,
            1199.0,
            'Unrestricted access to all competition powerlifting and Olympic platforms.',
            json.dumps(['Full Platform & Rack Access', 'Calibrated Kilo Discs', 'Chalk Allowed Everywhere', 'Deadlift Jack & Band Pegs']),
            1
        ),
        # Plans for Gym 4 (PulseFit 24/7)
        (
            4,
            '24/7 Digital Pass',
            '1 Month',
            1,
            899.0,
            'Keyless smartphone access to any PulseFit around the clock.',
            json.dumps(['24/7 Door App Access', 'Smart Equipment Bluetooth Sync', 'Showers & Private Lockers', 'No Long-Term Contracts']),
            1
        ),
        # Plans for Gym 5 (Apex Combat)
        (
            5,
            'Fighter Conditioning',
            '1 Month',
            1,
            1699.0,
            'Ring access, heavy bags, calisthenics rigs, and glove sanitizing.',
            json.dumps(['Heavy Bag & Speed Bag Zone', 'Boxing Ring Sparring (Coach Monitored)', 'Calisthenics Bars & Rings', 'Combat HIIT Conditioning']),
            1
        )
    ]

    for plan in plans_data:
        cursor.execute('''
        INSERT INTO membership_plans (gym_id, name, duration, duration_months, price, description, features, is_popular)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', plan)

    # 4. Seed Trainers
    trainers_data = [
        (
            3, # John Doe user_id
            1, # IronPulse Gym
            'John Doe',
            8,
            'Strength & Calisthenics',
            'CSCS (Certified Strength and Conditioning Specialist), USAW Level 2 Olympic Lifting Coach',
            1200.0,
            4.95,
            64,
            'Passionate about building bulletproof joints, exceptional barbell mechanics, and aesthetic functional strength. Over 250 athletes coached.',
            json.dumps({
                'Monday': '07:00 AM - 12:00 PM, 04:00 PM - 08:00 PM',
                'Wednesday': '07:00 AM - 12:00 PM, 04:00 PM - 08:00 PM',
                'Friday': '07:00 AM - 12:00 PM, 03:00 PM - 07:00 PM',
                'Saturday': '09:00 AM - 02:00 PM'
            }),
            'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&auto=format&fit=crop&q=80',
            18
        ),
        (
            4, # Emma Davis
            2, # Aura Wellness
            'Emma Davis',
            6,
            'Pilates & Mobility',
            'Comprehensive Balanced Body Master Instructor, B.S. in Kinesiology',
            1500.0,
            4.92,
            52,
            'Specializes in postural correction, deep core stabilization, and athletic flexibility for both beginners and elite dancers.',
            json.dumps({
                'Tuesday': '08:00 AM - 01:00 PM, 04:00 PM - 07:00 PM',
                'Thursday': '08:00 AM - 01:00 PM, 04:00 PM - 07:00 PM',
                'Saturday': '10:00 AM - 03:00 PM'
            }),
            'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&auto=format&fit=crop&q=80',
            14
        ),
        (
            5, # Robert Fox
            1, # IronPulse Gym
            'Robert Fox',
            10,
            'Endurance & Power',
            'NSCA-CPT, Ironman Finisher, Precision Nutrition Level 2 Coach',
            1000.0,
            4.88,
            43,
            'Transforming metabolic capacity through hybrid endurance routines and periodized power training.',
            json.dumps({
                'Monday': '06:00 AM - 11:00 AM, 05:00 PM - 09:00 PM',
                'Tuesday': '06:00 AM - 11:00 AM, 05:00 PM - 09:00 PM',
                'Thursday': '06:00 AM - 11:00 AM, 05:00 PM - 09:00 PM'
            }),
            'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
            22
        ),
        (
            6, # Eleanor Pena
            5, # Apex Combat
            'Eleanor Pena',
            7,
            'Boxing & Combat Conditioning',
            'Former State Golden Gloves Champion, USA Boxing Certified Instructor',
            1400.0,
            4.97,
            59,
            'Empowering individuals with real fight techniques, speed work, footwork drills, and cardiovascular stamina in a supportive setting.',
            json.dumps({
                'Monday': '08:00 AM - 12:00 PM, 05:00 PM - 09:00 PM',
                'Wednesday': '08:00 AM - 12:00 PM, 05:00 PM - 09:00 PM',
                'Friday': '08:00 AM - 12:00 PM, 04:00 PM - 08:00 PM'
            }),
            'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
            16
        )
    ]

    for trainer in trainers_data:
        cursor.execute('''
        INSERT INTO trainers (user_id, gym_id, name, experience_years, specialization, qualifications, hourly_rate, rating, reviews_count, bio, availability, avatar_url, clients_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', trainer)

    # 5. Seed Membership Selection (Trainee Alex Mercer has chosen Pro Athlete Tier at IronPulse)
    cursor.execute('''
    INSERT INTO membership_selections (user_id, plan_id, gym_id, start_date, expiry_date, status, payment_demo_id)
    VALUES (?, ?, ?, '2026-10-01', '2027-01-01', 'active', 'FS360-DEMO-98214')
    ''', (1, 2, 1))

    # 6. Seed Trainer Bookings for Alex Mercer
    bookings_data = [
        (1, 1, 1, '2026-11-04', '09:00 AM - 10:00 AM', 'accepted', 'Focus on Deadlift form and bracing technique.'),
        (2, 1, 2, '2026-11-07', '10:00 AM - 11:00 AM', 'pending', 'Core stabilization and spine decompression.'),
        (3, 1, 1, '2026-10-22', '05:00 PM - 06:00 PM', 'completed', 'Completed heavy bench press 5x5 protocol.')
    ]
    for b in bookings_data:
        cursor.execute('''
        INSERT INTO trainer_bookings (trainer_id, trainee_id, gym_id, booking_date, time_slot, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', b)

    # 7. Seed Reviews
    reviews_data = [
        (1, 1, 5, 'Absolute game changer. The equipment at IronPulse is world class, and having female-only zones gives complete peace of mind!'),
        (1, 3, 5, 'Best gym I have ever trained in. Clean, spacious, and the community is super motivating.'),
        (2, 1, 5, 'The pilates reformer suites are stunning. Instructors pay immense attention to individual alignment.'),
        (3, 1, 4, 'Chalk friendly, loud music, heavy weights. If you love serious lifting, this is paradise.'),
        (4, 1, 5, 'Super convenient 24/7 access. The app-based check in is lightning fast and it is always clean.')
    ]
    for r in reviews_data:
        cursor.execute('''
        INSERT INTO reviews (gym_id, user_id, rating, comment)
        VALUES (?, ?, ?, ?)
        ''', r)

    # 8. Seed Equipment
    equipment_data = [
        (1, 'Eleiko Olympic Power Rack', 'Free Weights', 'Legs & Back', 8, 'Pristine', 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=80'),
        (1, 'Hammer Strength Iso-Lateral Chest Press', 'Machines', 'Chest', 3, 'Excellent', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&auto=format&fit=crop&q=80'),
        (1, 'Concept2 Model D Rower', 'Cardio', 'Full Body Cardio', 6, 'Excellent', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&auto=format&fit=crop&q=80'),
        (1, 'Adjustable Dumbbell Rack (5lbs - 150lbs)', 'Free Weights', 'Full Body', 4, 'Pristine', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500&auto=format&fit=crop&q=80'),
        (2, 'Balanced Body Allegro 2 Reformer', 'Pilates', 'Core & Mobility', 12, 'Pristine', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80'),
        (5, 'Century Martial Arts Heavy Bag 100lb', 'Combat', 'Upper Body & Cardio', 10, 'Excellent', 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=500&auto=format&fit=crop&q=80')
    ]
    for eq in equipment_data:
        cursor.execute('''
        INSERT INTO equipment (gym_id, name, category, target_muscle, quantity, condition, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', eq)

    # 9. Seed Workouts
    workouts_data = [
        (
            'High-Intensity Upper Body Hypertrophy',
            'Strength Training',
            'Intermediate',
            50,
            420,
            'Chest, Shoulders, Triceps',
            'A battle-tested hypertrophy routine focusing on progressive barbell pressing combined with strict cable flyes.',
            json.dumps([
                'Warmup: 5 mins light dynamic mobility & band pull-aparts',
                'Barbell Flat Bench Press: 4 sets of 6-8 reps (2 min rest)',
                'Incline Dumbbell Press: 3 sets of 10-12 reps',
                'Cable Lateral Raises: 4 sets of 15 reps',
                'Overhead Cable Triceps Extensions: 3 sets to failure',
                'Cooldown: Chest doorway stretch & deep breathing'
            ])
        ),
        (
            'Metabolic Conditioning & Heavy Bag Blast',
            'Boxing',
            'Advanced',
            40,
            550,
            'Full Body, Cardiovascular, Core',
            'Simulate three-minute championship rounds to maximize anaerobic endurance and fast-twitch power output.',
            json.dumps([
                'Round 1: Shadowboxing with 2lb weights (3 mins)',
                'Round 2: Jab-Cross-Hook heavy bag power combos (3 mins)',
                'Round 3: Speed punching & duck under drills (3 mins)',
                'Round 4: Burpee box jumps & medicine ball slams (3 mins)',
                'Round 5: Core rotational twists & plank finishes (3 mins)'
            ])
        ),
        (
            'Athletic Mobility & Hip Decompression',
            'Yoga & Mobility',
            'Beginner',
            35,
            180,
            'Hips, Hamstrings, Thoracic Spine',
            'Essential restorative flow for lifters and office workers to restore hip flexor length and lumbar health.',
            json.dumps([
                'Deep Diaphragmatic Breath in Child’s Pose (3 mins)',
                'Cat-Cow with Thoracic Needle Threading (10 reps each side)',
                'Pigeon Pose with active forward reach (2 mins per side)',
                'Couch Stretch against wall for quad decompression (90 sec per side)',
                'Seated Spinal Twist with extended exhale'
            ])
        ),
        (
            'Iron Leg Power & Quad Builder',
            'Strength Training',
            'Advanced',
            55,
            510,
            'Quadriceps, Glutes, Hamstrings',
            'Build unshakeable lower body drive with heavy compound squats and unilateral Bulgarian split squats.',
            json.dumps([
                'Warmup: 5 mins stationary bike + 20 bodyweight squats',
                'Barbell Back Squats: 4 sets of 6 reps (3 min rest)',
                'Bulgarian Split Squats: 3 sets of 10 reps per leg',
                'Leg Press (Foot placed low for Quad bias): 3 sets of 12 reps',
                'Seated Hamstring Curls: 4 sets of 12-15 reps (hold peak contraction 1s)',
                'Standing Calf Raises: 4 sets of 15 reps with full stretch'
            ])
        ),
        (
            'Calisthenics Foundation & Bar Mastery',
            'Calisthenics',
            'Intermediate',
            45,
            380,
            'Lats, Biceps, Core, Grip',
            'Develop superhuman relative strength, bar control, and hollow body stabilization.',
            json.dumps([
                'Dead Hang & Active Scapular Pull-ups: 3 sets of 10 reps',
                'Strict Chest-to-Bar Pull-ups: 4 sets of 6-8 reps',
                'Parallel Bar Dips with forward torso lean: 4 sets of 10-12 reps',
                'Hanging Leg Raises (to toes-to-bar if able): 3 sets of 10 reps',
                'L-Sit Hold on parallettes: 4 sets of 15-20 seconds'
            ])
        )
    ]
    for w in workouts_data:
        cursor.execute('''
        INSERT INTO workouts (title, category, difficulty, duration_mins, calories_burn, target_muscles, description, steps)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', w)

    conn.commit()
    print("[FitSphere 360] Database successfully initialized with all tables and realistic demo data.")

if __name__ == '__main__':
    init_db()
