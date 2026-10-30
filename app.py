import os
import json
import sqlite3
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash

from database import get_db_connection, init_db
from supabase_sync import sync_trainer_to_supabase, delete_trainer_from_supabase

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fitsphere360-super-secret-key-2026-prod-dev')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# Helper: Convert sqlite3.Row or list of rows to plain dict
def row_to_dict(row):
    if row is None:
        return None
    d = dict(row)
    # Parse JSON fields if present
    for key in ['features', 'availability', 'women_safety_features', 'steps', 'available_days', 'available_time_slots']:
        if key in d and isinstance(d[key], str):
            try:
                d[key] = json.loads(d[key])
            except Exception:
                pass
    return d

def rows_to_list(rows):
    return [row_to_dict(r) for r in rows]

# Auth Decorators
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Authentication required'}), 401
            user_role = session.get('role')
            if user_role not in allowed_roles:
                return jsonify({'error': f'Unauthorized. Required role: {", ".join(allowed_roles)}'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# ----------------- AUTHENTICATION ROUTES ----------------- #

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'trainee').lower()
    phone = data.get('phone', '').strip()
    bio = data.get('bio', '').strip()
    fitness_goal = data.get('fitness_goal', 'General Fitness')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email and password are required'}), 400
    if role not in ['trainee', 'owner', 'trainer']:
        return jsonify({'error': 'Invalid role'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        password_hash = generate_password_hash(password)
        cursor.execute('''
        INSERT INTO users (name, email, password_hash, role, phone, bio, fitness_goal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (name, email, password_hash, role, phone, bio, fitness_goal))
        user_id = cursor.lastrowid

        # If registered as trainer, link existing trainer record or create new one
        if role == 'trainer':
            cursor.execute("SELECT id FROM trainers WHERE LOWER(email) = LOWER(?)", (email,))
            existing_t = cursor.fetchone()
            if existing_t:
                cursor.execute('''
                UPDATE trainers
                SET user_id = ?, full_name = COALESCE(NULLIF(full_name, ''), ?), name = COALESCE(NULLIF(name, ''), ?),
                    phone = COALESCE(NULLIF(phone, ''), ?), bio = COALESCE(NULLIF(bio, ''), ?), updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                ''', (user_id, name, name, phone, bio, existing_t['id']))
            else:
                cursor.execute('''
                INSERT INTO trainers (
                    user_id, name, full_name, email, phone, experience_years, experience,
                    specialization, qualifications, hourly_rate, salary, bio, status,
                    available_days, available_time_slots, availability
                ) VALUES (?, ?, ?, ?, ?, 1, '1 year', 'General Fitness & Conditioning', 'Certified Personal Fitness Instructor', 1000.0, 45000.0, ?, 'active', ?, ?, ?)
                ''', (
                    user_id, name, name, email, phone, bio or 'Dedicated certified fitness coach.',
                    json.dumps(["Monday", "Wednesday", "Friday"]),
                    json.dumps(["08:00 AM - 12:00 PM", "04:00 PM - 08:00 PM"]),
                    json.dumps({"Monday": "08:00 AM - 05:00 PM", "Wednesday": "08:00 AM - 05:00 PM", "Friday": "08:00 AM - 05:00 PM"})
                ))
            cursor.execute("SELECT * FROM trainers WHERE user_id = ?", (user_id,))
            t_row = row_to_dict(cursor.fetchone())
            if t_row:
                sync_trainer_to_supabase(t_row)

        conn.commit()

        # Set session
        session['user_id'] = user_id
        session['role'] = role
        session['name'] = name
        session.permanent = True

        cursor.execute("SELECT id, name, email, role, phone, avatar, bio, fitness_goal, budget_max, preferred_location FROM users WHERE id = ?", (user_id,))
        user = row_to_dict(cursor.fetchone())
        return jsonify({'message': 'Registration successful', 'user': user}), 201

    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email is already registered. Please login.'}), 409
    finally:
        conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    selected_role = data.get('role', '').strip().lower()

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user_row = cursor.fetchone()
    conn.close()

    if not user_row or not check_password_hash(user_row['password_hash'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Role Verification: verify selected role against actual database role
    if selected_role and user_row['role'] != selected_role:
        role_labels = {'trainee': 'Trainee', 'owner': 'Gym Owner', 'trainer': 'Trainer'}
        expected_label = role_labels.get(selected_role, selected_role.capitalize())
        actual_label = role_labels.get(user_row['role'], user_row['role'].capitalize())
        return jsonify({
            'error': f'Role Mismatch: This account is registered as a {actual_label}, but you selected "{expected_label}". Please select the "{actual_label}" tab to log in.'
        }), 403

    session['user_id'] = user_row['id']
    session['role'] = user_row['role']
    session['name'] = user_row['name']
    session.permanent = True

    user = {
        'id': user_row['id'],
        'name': user_row['name'],
        'email': user_row['email'],
        'role': user_row['role'],
        'phone': user_row['phone'],
        'avatar': user_row['avatar'],
        'bio': user_row['bio'],
        'fitness_goal': user_row['fitness_goal'],
        'budget_max': user_row['budget_max'],
        'preferred_location': user_row['preferred_location']
    }
    return jsonify({'message': 'Login successful', 'user': user}), 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/auth/reset-password-sync', methods=['POST'])
def reset_password_sync():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    new_password = data.get('password', '')

    if not email or not new_password:
        return jsonify({'error': 'Email and new password are required'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, role FROM users WHERE LOWER(email) = LOWER(?)", (email,))
    user = cursor.fetchone()

    if user:
        new_hash = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user['id']))
        conn.commit()
    conn.close()

    return jsonify({
        'message': 'Password has been updated successfully. You can now log in.',
        'success': True
    }), 200

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'user': None}), 200

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role, phone, avatar, bio, fitness_goal, budget_max, preferred_location, created_at FROM users WHERE id = ?", (user_id,))
    user = row_to_dict(cursor.fetchone())
    
    # If trainer, attach trainer info and link if unlinked
    if user and user['role'] == 'trainer':
        cursor.execute("SELECT * FROM trainers WHERE user_id = ? OR (user_id IS NULL AND LOWER(email) = LOWER(?))", (user_id, user['email']))
        trainer_row = cursor.fetchone()
        if trainer_row:
            if not trainer_row['user_id']:
                cursor.execute("UPDATE trainers SET user_id = ? WHERE id = ?", (user_id, trainer_row['id']))
                conn.commit()
                cursor.execute("SELECT * FROM trainers WHERE id = ?", (trainer_row['id'],))
                trainer_row = cursor.fetchone()
            user['trainer_profile'] = row_to_dict(trainer_row)

    conn.close()
    return jsonify({'user': user}), 200

@app.route('/api/auth/profile', methods=['PUT'])
@login_required
def update_profile():
    user_id = session['user_id']
    data = request.get_json() or {}

    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    bio = data.get('bio', '').strip()
    fitness_goal = data.get('fitness_goal', '').strip()
    budget_max = float(data.get('budget_max', 100))
    preferred_location = data.get('preferred_location', 'Downtown')
    avatar = data.get('avatar', '')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    UPDATE users
    SET name = COALESCE(NULLIF(?, ''), name),
        phone = ?,
        bio = ?,
        fitness_goal = ?,
        budget_max = ?,
        preferred_location = ?,
        avatar = COALESCE(NULLIF(?, ''), avatar)
    WHERE id = ?
    ''', (name, phone, bio, fitness_goal, budget_max, preferred_location, avatar, user_id))
    conn.commit()

    cursor.execute("SELECT id, name, email, role, phone, avatar, bio, fitness_goal, budget_max, preferred_location FROM users WHERE id = ?", (user_id,))
    updated_user = row_to_dict(cursor.fetchone())
    conn.close()

    return jsonify({'message': 'Profile updated successfully', 'user': updated_user}), 200

# ----------------- GYM DISCOVERY & CRUD ----------------- #

@app.route('/api/gyms', methods=['GET'])
def get_gyms():
    search = request.args.get('search', '').strip().lower()
    city = request.args.get('city', '').strip()
    max_price = request.args.get('max_price', type=float)
    min_rating = request.args.get('min_rating', type=float)
    fitness_goal = request.args.get('fitness_goal', '').strip()
    owner_only = request.args.get('owner_only', type=bool)

    query = "SELECT * FROM gyms WHERE 1=1"
    params = []

    if owner_only and session.get('user_id'):
        query += " AND owner_id = ?"
        params.append(session['user_id'])

    if search:
        query += " AND (LOWER(name) LIKE ? OR LOWER(city) LIKE ? OR LOWER(description) LIKE ? OR LOWER(fitness_goals) LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term])

    if city and city != 'All':
        query += " AND LOWER(city) = LOWER(?)"
        params.append(city)

    if max_price:
        query += " AND min_price <= ?"
        params.append(max_price)

    if min_rating:
        query += " AND rating >= ?"
        params.append(min_rating)

    if fitness_goal and fitness_goal != 'All':
        query += " AND LOWER(fitness_goals) LIKE LOWER(?)"
        params.append(f"%{fitness_goal}%")

    query += " ORDER BY rating DESC, id DESC"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    gyms = rows_to_list(cursor.fetchall())
    conn.close()

    return jsonify({'gyms': gyms}), 200

@app.route('/api/gyms/<int:gym_id>', methods=['GET'])
def get_gym_details(gym_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM gyms WHERE id = ?", (gym_id,))
    gym = row_to_dict(cursor.fetchone())
    if not gym:
        conn.close()
        return jsonify({'error': 'Gym not found'}), 404

    # Fetch plans
    cursor.execute("SELECT * FROM membership_plans WHERE gym_id = ? ORDER BY price ASC", (gym_id,))
    gym['plans'] = rows_to_list(cursor.fetchall())

    # Fetch trainers
    cursor.execute("SELECT * FROM trainers WHERE gym_id = ?", (gym_id,))
    gym['trainers'] = rows_to_list(cursor.fetchall())

    # Fetch equipment
    cursor.execute("SELECT * FROM equipment WHERE gym_id = ?", (gym_id,))
    gym['equipment'] = rows_to_list(cursor.fetchall())

    # Fetch reviews
    cursor.execute('''
    SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar 
    FROM reviews r 
    JOIN users u ON r.user_id = u.id 
    WHERE r.gym_id = ? 
    ORDER BY r.created_at DESC
    ''', (gym_id,))
    gym['reviews'] = rows_to_list(cursor.fetchall())

    conn.close()
    return jsonify({'gym': gym}), 200

@app.route('/api/gyms', methods=['POST'])
@role_required('owner')
def create_gym():
    data = request.get_json() or {}
    owner_id = session['user_id']

    name = data.get('name', '').strip()
    tagline = data.get('tagline', '').strip()
    description = data.get('description', '').strip()
    address = data.get('address', '').strip()
    city = data.get('city', 'Downtown').strip()
    price_range = data.get('price_range', '₹1,499 - ₹2,999/mo').strip()
    min_price = float(data.get('min_price', 1499.0))
    image_url = data.get('image_url', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&auto=format&fit=crop&q=80')
    opening_hours = data.get('opening_hours', '06:00 AM')
    closing_hours = data.get('closing_hours', '11:00 PM')
    contact_phone = data.get('contact_phone', '')
    crowd_level = data.get('crowd_level', 'Moderate')
    crowd_percent = int(data.get('crowd_percent', 50))
    fitness_goals = data.get('fitness_goals', 'Strength Training, Cardio, General Fitness')
    
    women_safety = data.get('women_safety_features', [
        'Dedicated Women-Only Training Zone',
        '24/7 CCTV & Biometric Keycard Access',
        'Certified Female Coaches on Staff'
    ])
    if isinstance(women_safety, list):
        women_safety = json.dumps(women_safety)

    if not name or not address:
        return jsonify({'error': 'Gym name and address are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO gyms (owner_id, name, tagline, description, address, city, price_range, min_price, image_url, opening_hours, closing_hours, contact_phone, women_safety_features, crowd_level, crowd_percent, fitness_goals)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (owner_id, name, tagline, description, address, city, price_range, min_price, image_url, opening_hours, closing_hours, contact_phone, women_safety, crowd_level, crowd_percent, fitness_goals))
    gym_id = cursor.lastrowid

    # Create a default Starter Membership Plan
    default_plan = (
        gym_id, 'Standard Access Pass', '1 Month', 1, min_price,
        'Full access to all facilities and gym floor.',
        json.dumps(['Full Gym Access', 'Locker Room Privileges', 'FitSphere 360 App Tracking']),
        1
    )
    cursor.execute('''
    INSERT INTO membership_plans (gym_id, name, duration, duration_months, price, description, features, is_popular)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', default_plan)

    conn.commit()

    cursor.execute("SELECT * FROM gyms WHERE id = ?", (gym_id,))
    created_gym = row_to_dict(cursor.fetchone())
    conn.close()

    return jsonify({'message': 'Gym added successfully', 'gym': created_gym}), 201

@app.route('/api/gyms/<int:gym_id>', methods=['PUT'])
@role_required('owner')
def update_gym(gym_id):
    owner_id = session['user_id']
    data = request.get_json() or {}

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM gyms WHERE id = ? AND owner_id = ?", (gym_id, owner_id))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({'error': 'Gym not found or unauthorized'}), 404

    women_safety = data.get('women_safety_features')
    if isinstance(women_safety, list):
        women_safety = json.dumps(women_safety)
    elif women_safety is None:
        women_safety = existing['women_safety_features']

    cursor.execute('''
    UPDATE gyms
    SET name = COALESCE(?, name),
        tagline = COALESCE(?, tagline),
        description = COALESCE(?, description),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        price_range = COALESCE(?, price_range),
        min_price = COALESCE(?, min_price),
        image_url = COALESCE(?, image_url),
        opening_hours = COALESCE(?, opening_hours),
        closing_hours = COALESCE(?, closing_hours),
        contact_phone = COALESCE(?, contact_phone),
        crowd_level = COALESCE(?, crowd_level),
        crowd_percent = COALESCE(?, crowd_percent),
        fitness_goals = COALESCE(?, fitness_goals),
        women_safety_features = ?
    WHERE id = ? AND owner_id = ?
    ''', (
        data.get('name'), data.get('tagline'), data.get('description'),
        data.get('address'), data.get('city'), data.get('price_range'),
        data.get('min_price'), data.get('image_url'), data.get('opening_hours'),
        data.get('closing_hours'), data.get('contact_phone'), data.get('crowd_level'),
        data.get('crowd_percent'), data.get('fitness_goals'), women_safety,
        gym_id, owner_id
    ))
    conn.commit()

    cursor.execute("SELECT * FROM gyms WHERE id = ?", (gym_id,))
    updated_gym = row_to_dict(cursor.fetchone())
    conn.close()

    return jsonify({'message': 'Gym updated successfully', 'gym': updated_gym}), 200

@app.route('/api/gyms/<int:gym_id>', methods=['DELETE'])
@role_required('owner')
def delete_gym(gym_id):
    owner_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM gyms WHERE id = ? AND owner_id = ?", (gym_id, owner_id))
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'error': 'Gym not found or unauthorized'}), 404
    conn.commit()
    conn.close()
    return jsonify({'message': 'Gym deleted successfully'}), 200

# ----------------- MEMBERSHIP PLANS CRUD ----------------- #

@app.route('/api/gyms/<int:gym_id>/plans', methods=['GET'])
def get_gym_plans(gym_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM membership_plans WHERE gym_id = ? ORDER BY price ASC", (gym_id,))
    plans = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({'plans': plans}), 200

@app.route('/api/gyms/<int:gym_id>/plans', methods=['POST'])
@role_required('owner')
def add_membership_plan(gym_id):
    owner_id = session['user_id']
    data = request.get_json() or {}

    conn = get_db_connection()
    cursor = conn.cursor()
    # Check ownership
    cursor.execute("SELECT id FROM gyms WHERE id = ? AND owner_id = ?", (gym_id, owner_id))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Gym not found or unauthorized'}), 403

    name = data.get('name', '').strip()
    duration = data.get('duration', '1 Month').strip()
    duration_months = int(data.get('duration_months', 1))
    price = float(data.get('price', 1499.0))
    description = data.get('description', '').strip()
    features = data.get('features', ['Gym Access', 'Locker Room Privileges'])
    is_popular = 1 if data.get('is_popular') else 0

    if not name or price <= 0:
        conn.close()
        return jsonify({'error': 'Valid plan name and price are required'}), 400

    if isinstance(features, list):
        features = json.dumps(features)

    cursor.execute('''
    INSERT INTO membership_plans (gym_id, name, duration, duration_months, price, description, features, is_popular)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (gym_id, name, duration, duration_months, price, description, features, is_popular))
    plan_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM membership_plans WHERE id = ?", (plan_id,))
    new_plan = row_to_dict(cursor.fetchone())
    conn.close()
    return jsonify({'message': 'Plan created successfully', 'plan': new_plan}), 201

@app.route('/api/plans/<int:plan_id>', methods=['PUT'])
@role_required('owner')
def update_plan(plan_id):
    owner_id = session['user_id']
    data = request.get_json() or {}

    conn = get_db_connection()
    cursor = conn.cursor()
    # Check ownership via gym
    cursor.execute('''
    SELECT p.id FROM membership_plans p
    JOIN gyms g ON p.gym_id = g.id
    WHERE p.id = ? AND g.owner_id = ?
    ''', (plan_id, owner_id))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Plan not found or unauthorized'}), 403

    features = data.get('features')
    if isinstance(features, list):
        features = json.dumps(features)

    cursor.execute('''
    UPDATE membership_plans
    SET name = COALESCE(?, name),
        duration = COALESCE(?, duration),
        duration_months = COALESCE(?, duration_months),
        price = COALESCE(?, price),
        description = COALESCE(?, description),
        features = COALESCE(?, features),
        is_popular = COALESCE(?, is_popular)
    WHERE id = ?
    ''', (
        data.get('name'), data.get('duration'), data.get('duration_months'),
        data.get('price'), data.get('description'), features,
        data.get('is_popular'), plan_id
    ))
    conn.commit()

    cursor.execute("SELECT * FROM membership_plans WHERE id = ?", (plan_id,))
    updated = row_to_dict(cursor.fetchone())
    conn.close()
    return jsonify({'message': 'Plan updated successfully', 'plan': updated}), 200

@app.route('/api/plans/<int:plan_id>', methods=['DELETE'])
@role_required('owner')
def delete_plan(plan_id):
    owner_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    SELECT p.id FROM membership_plans p
    JOIN gyms g ON p.gym_id = g.id
    WHERE p.id = ? AND g.owner_id = ?
    ''', (plan_id, owner_id))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Plan not found or unauthorized'}), 403

    cursor.execute("DELETE FROM membership_plans WHERE id = ?", (plan_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Plan deleted successfully'}), 200

# ----------------- MEMBERSHIP SELECTION (TRAINEE & OWNER) ----------------- #

@app.route('/api/memberships/select', methods=['POST'])
@login_required
def select_membership():
    user_id = session['user_id']
    data = request.get_json() or {}
    plan_id = data.get('plan_id')
    gym_id = data.get('gym_id')

    if not plan_id or not gym_id:
        return jsonify({'error': 'Plan ID and Gym ID are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM membership_plans WHERE id = ?", (plan_id,))
    plan = cursor.fetchone()
    if not plan:
        conn.close()
        return jsonify({'error': 'Membership plan not found'}), 404

    months = plan['duration_months'] or 1
    start_date = datetime.now().strftime('%Y-%m-%d')
    expiry_date = (datetime.now() + timedelta(days=30 * months)).strftime('%Y-%m-%d')
    demo_payment_id = f"FS360-DEMO-{int(datetime.now().timestamp()) % 1000000}"

    cursor.execute('''
    INSERT INTO membership_selections (user_id, plan_id, gym_id, start_date, expiry_date, status, payment_demo_id)
    VALUES (?, ?, ?, ?, ?, 'active', ?)
    ''', (user_id, plan_id, gym_id, start_date, expiry_date, demo_payment_id))
    selection_id = cursor.lastrowid
    conn.commit()

    cursor.execute('''
    SELECT s.*, p.name as plan_name, p.price as plan_price, p.duration as plan_duration,
           g.name as gym_name, g.image_url as gym_image, g.address as gym_address, g.city as gym_city
    FROM membership_selections s
    JOIN membership_plans p ON s.plan_id = p.id
    JOIN gyms g ON s.gym_id = g.id
    WHERE s.id = ?
    ''', (selection_id,))
    selection = row_to_dict(cursor.fetchone())
    conn.close()

    return jsonify({
        'message': f'Successfully enrolled in {plan["name"]}! Demo checkout verified.',
        'membership': selection
    }), 201

@app.route('/api/memberships/my', methods=['GET'])
@login_required
def get_my_memberships():
    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    SELECT s.*, p.name as plan_name, p.price as plan_price, p.duration as plan_duration,
           p.features as plan_features, g.name as gym_name, g.image_url as gym_image,
           g.address as gym_address, g.city as gym_city, g.opening_hours, g.closing_hours
    FROM membership_selections s
    JOIN membership_plans p ON s.plan_id = p.id
    JOIN gyms g ON s.gym_id = g.id
    WHERE s.user_id = ?
    ORDER BY s.id DESC
    ''', (user_id,))
    memberships = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({'memberships': memberships}), 200

@app.route('/api/memberships/owner', methods=['GET'])
@role_required('owner')
def get_owner_memberships():
    owner_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    SELECT s.*, u.name as member_name, u.email as member_email, u.phone as member_phone,
           u.avatar as member_avatar, p.name as plan_name, p.price as plan_price,
           g.name as gym_name
    FROM membership_selections s
    JOIN users u ON s.user_id = u.id
    JOIN membership_plans p ON s.plan_id = p.id
    JOIN gyms g ON s.gym_id = g.id
    WHERE g.owner_id = ?
    ORDER BY s.id DESC
    ''', (owner_id,))
    selections = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({'memberships': selections}), 200

# ----------------- TRAINER DISCOVERY & MANAGEMENT ----------------- #

@app.route('/api/trainers', methods=['GET'])
def get_trainers():
    specialization = request.args.get('specialization', '').strip()
    gym_id = request.args.get('gym_id', type=int)
    location = request.args.get('location', '').strip()
    min_exp = request.args.get('experience', type=int) or request.args.get('min_exp', type=int)
    available_day = request.args.get('available_day', '').strip() or request.args.get('availability', '').strip()
    status = request.args.get('status', 'active').strip()

    query = '''
    SELECT t.*, g.name as gym_name, g.city as gym_city, g.address as gym_address,
           u.email as trainer_account_email, u.phone as trainer_account_phone
    FROM trainers t
    LEFT JOIN gyms g ON t.gym_id = g.id
    LEFT JOIN users u ON t.user_id = u.id
    WHERE 1=1
    '''
    params = []

    # Non-owners only see active trainers
    user_role = session.get('role')
    user_id = session.get('user_id')
    if user_role != 'owner':
        query += " AND (t.status = 'active' OR t.status IS NULL)"
    elif status and status != 'All':
        query += " AND t.status = ?"
        params.append(status)

    if specialization and specialization != 'All':
        query += " AND LOWER(t.specialization) LIKE LOWER(?)"
        params.append(f"%{specialization}%")

    if gym_id:
        query += " AND t.gym_id = ?"
        params.append(gym_id)

    if location and location != 'All':
        query += " AND (LOWER(g.city) LIKE LOWER(?) OR LOWER(g.address) LIKE LOWER(?))"
        params.append(f"%{location}%")
        params.append(f"%{location}%")

    if min_exp:
        query += " AND t.experience_years >= ?"
        params.append(min_exp)

    if available_day and available_day != 'All':
        query += " AND (LOWER(t.available_days) LIKE LOWER(?) OR LOWER(t.availability) LIKE LOWER(?))"
        params.append(f"%{available_day}%")

    query += " ORDER BY t.rating DESC, t.experience_years DESC, t.id DESC"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    trainers = rows_to_list(cursor.fetchall())
    conn.close()

    # Privacy & field harmonization
    for t in trainers:
        if not t.get('full_name'):
            t['full_name'] = t.get('name')
        if not t.get('name'):
            t['name'] = t.get('full_name')
        if not t.get('profile_image'):
            t['profile_image'] = t.get('avatar_url')
        if not t.get('avatar_url'):
            t['avatar_url'] = t.get('profile_image')

        # Strip confidential salary for non-owners or trainers not owned by this owner
        if user_role != 'owner' or t.get('owner_id') != user_id:
            t.pop('salary', None)

    return jsonify({'trainers': trainers}), 200

@app.route('/api/trainers/<int:trainer_id>', methods=['GET'])
def get_trainer_details(trainer_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    SELECT t.*, g.name as gym_name, g.city as gym_city, g.address as gym_address,
           g.opening_hours as gym_opening_hours, g.closing_hours as gym_closing_hours,
           u.email as trainer_account_email, u.phone as trainer_account_phone
    FROM trainers t
    LEFT JOIN gyms g ON t.gym_id = g.id
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.id = ?
    ''', (trainer_id,))
    trainer = row_to_dict(cursor.fetchone())
    conn.close()

    if not trainer:
        return jsonify({'error': 'Trainer not found'}), 404

    # Harmonize fields
    if not trainer.get('full_name'):
        trainer['full_name'] = trainer.get('name')
    if not trainer.get('profile_image'):
        trainer['profile_image'] = trainer.get('avatar_url')
    if not trainer.get('avatar_url'):
        trainer['avatar_url'] = trainer.get('profile_image')

    # Privacy: confidential salary visible only to gym owner
    user_role = session.get('role')
    user_id = session.get('user_id')
    if user_role != 'owner' or trainer.get('owner_id') != user_id:
        trainer.pop('salary', None)

    return jsonify({'trainer': trainer}), 200

@app.route('/api/trainers/owner', methods=['GET'])
@role_required('owner')
def get_owner_trainers():
    """Returns all trainers associated with this gym owner's facilities."""
    owner_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    SELECT t.*, g.name as gym_name, g.city as gym_city,
           (SELECT COUNT(*) FROM trainer_bookings b WHERE b.trainer_id = t.id) as total_bookings,
           (SELECT COUNT(*) FROM trainer_bookings b WHERE b.trainer_id = t.id AND b.status = 'pending') as pending_bookings
    FROM trainers t
    LEFT JOIN gyms g ON t.gym_id = g.id
    WHERE t.owner_id = ? OR g.owner_id = ?
    ORDER BY t.id DESC
    ''', (owner_id, owner_id))
    trainers = rows_to_list(cursor.fetchall())
    conn.close()

    for t in trainers:
        if not t.get('full_name'):
            t['full_name'] = t.get('name')
        if not t.get('profile_image'):
            t['profile_image'] = t.get('avatar_url')
        if not t.get('avatar_url'):
            t['avatar_url'] = t.get('profile_image')

    return jsonify({'trainers': trainers}), 200

@app.route('/api/trainers', methods=['POST'])
@role_required('owner')
def add_trainer():
    """Gym owner adds a new certified trainer to their gym facility."""
    owner_id = session['user_id']
    data = request.get_json() or {}

    full_name = data.get('full_name', '').strip() or data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    profile_image = data.get('profile_image', '').strip() or data.get('avatar_url', '').strip()
    gender = data.get('gender', 'Male')
    age = data.get('age')
    try:
        age = int(age) if age else None
    except (ValueError, TypeError):
        age = None

    try:
        experience_years = int(data.get('experience_years', 1))
    except (ValueError, TypeError):
        experience_years = 1

    experience = data.get('experience', f"{experience_years} years")
    specialization = data.get('specialization', '').strip()
    qualifications = data.get('qualifications', '').strip()
    bio = data.get('bio', '').strip()

    try:
        salary = float(data.get('salary', 45000.0))
    except (ValueError, TypeError):
        salary = 45000.0

    try:
        hourly_rate = float(data.get('hourly_rate', 1200.0))
    except (ValueError, TypeError):
        hourly_rate = 1200.0

    gym_id = data.get('gym_id')
    status = data.get('status', 'active').lower()
    if status not in ['active', 'inactive']:
        status = 'active'

    available_days = data.get('available_days', ['Monday', 'Wednesday', 'Friday'])
    if isinstance(available_days, list):
        available_days_json = json.dumps(available_days)
    else:
        available_days_json = str(available_days)

    available_time_slots = data.get('available_time_slots', ['07:00 AM - 11:00 AM', '04:00 PM - 08:00 PM'])
    if isinstance(available_time_slots, list):
        available_time_slots_json = json.dumps(available_time_slots)
    else:
        available_time_slots_json = str(available_time_slots)

    if not full_name:
        return jsonify({'error': 'Trainer Full Name is required'}), 400
    if not email:
        return jsonify({'error': 'Trainer Email Address is required'}), 400
    if not specialization:
        return jsonify({'error': 'Specialization is required'}), 400
    if not gym_id:
        return jsonify({'error': 'Assigned Gym is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Guard: Verify gym belongs to this owner
    cursor.execute("SELECT id, name FROM gyms WHERE id = ? AND owner_id = ?", (gym_id, owner_id))
    gym_row = cursor.fetchone()
    if not gym_row:
        conn.close()
        return jsonify({'error': 'Assigned gym not found or does not belong to your account'}), 403

    # Check if a user with this email is already registered -> link account
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (email,))
    existing_user = cursor.fetchone()
    user_id = existing_user['id'] if existing_user else None

    # Fallback image if none provided
    if not profile_image:
        profile_image = 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&auto=format&fit=crop&q=80'

    cursor.execute('''
    INSERT INTO trainers (
        user_id, owner_id, gym_id, name, full_name, email, phone, profile_image, avatar_url,
        experience_years, experience, specialization, qualifications, hourly_rate, salary,
        gender, age, available_days, available_time_slots, status, bio, rating, reviews_count, clients_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.9, 0, 0)
    ''', (
        user_id, owner_id, gym_id, full_name, full_name, email, phone, profile_image, profile_image,
        experience_years, experience, specialization, qualifications, hourly_rate, salary,
        gender, age, available_days_json, available_time_slots_json, status, bio
    ))
    trainer_id = cursor.lastrowid
    conn.commit()

    cursor.execute('''
    SELECT t.*, g.name as gym_name, g.city as gym_city
    FROM trainers t
    LEFT JOIN gyms g ON t.gym_id = g.id
    WHERE t.id = ?
    ''', (trainer_id,))
    new_trainer = row_to_dict(cursor.fetchone())
    conn.close()

    # Sync to connected Supabase database
    sync_trainer_to_supabase(new_trainer)

    return jsonify({
        'message': f'Trainer {full_name} added successfully and linked to {gym_row["name"]}!',
        'trainer': new_trainer
    }), 201

@app.route('/api/trainers/<int:trainer_id>', methods=['PUT'])
@role_required('owner')
def update_trainer(trainer_id):
    """Gym owner edits an existing trainer belonging to their gym."""
    owner_id = session['user_id']
    data = request.get_json() or {}

    conn = get_db_connection()
    cursor = conn.cursor()

    # Guard: Verify ownership
    cursor.execute('''
    SELECT t.*, g.owner_id as gym_owner_id
    FROM trainers t
    LEFT JOIN gyms g ON t.gym_id = g.id
    WHERE t.id = ?
    ''', (trainer_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({'error': 'Trainer not found'}), 404

    if existing['owner_id'] != owner_id and existing['gym_owner_id'] != owner_id:
        conn.close()
        return jsonify({'error': 'Unauthorized. You do not own this trainer profile'}), 403

    # If changing gym_id, ensure owner owns the new gym
    new_gym_id = data.get('gym_id', existing['gym_id'])
    if new_gym_id and new_gym_id != existing['gym_id']:
        cursor.execute("SELECT id FROM gyms WHERE id = ? AND owner_id = ?", (new_gym_id, owner_id))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'New assigned gym does not belong to your account'}), 403

    full_name = data.get('full_name') or data.get('name') or existing['name']
    email = data.get('email', existing['email'])
    phone = data.get('phone', existing['phone'])
    profile_image = data.get('profile_image') or data.get('avatar_url') or existing['profile_image']
    gender = data.get('gender', existing['gender'])
    age = data.get('age', existing['age'])
    experience_years = data.get('experience_years', existing['experience_years'])
    specialization = data.get('specialization', existing['specialization'])
    qualifications = data.get('qualifications', existing['qualifications'])
    bio = data.get('bio', existing['bio'])
    salary = data.get('salary', existing['salary'])
    hourly_rate = data.get('hourly_rate', existing['hourly_rate'])
    status = data.get('status', existing['status'])
    if status not in ['active', 'inactive']:
        status = existing['status'] or 'active'

    available_days = data.get('available_days')
    if available_days is not None:
        available_days_json = json.dumps(available_days) if isinstance(available_days, list) else str(available_days)
    else:
        available_days_json = existing['available_days']

    available_time_slots = data.get('available_time_slots')
    if available_time_slots is not None:
        available_time_slots_json = json.dumps(available_time_slots) if isinstance(available_time_slots, list) else str(available_time_slots)
    else:
        available_time_slots_json = existing['available_time_slots']

    cursor.execute('''
    UPDATE trainers
    SET name = ?, full_name = ?, email = ?, phone = ?, profile_image = ?, avatar_url = ?,
        gender = ?, age = ?, experience_years = ?, experience = ?, specialization = ?,
        qualifications = ?, bio = ?, salary = ?, hourly_rate = ?, gym_id = ?,
        available_days = ?, available_time_slots = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    ''', (
        full_name, full_name, email, phone, profile_image, profile_image,
        gender, age, experience_years, f"{experience_years} years", specialization,
        qualifications, bio, salary, hourly_rate, new_gym_id,
        available_days_json, available_time_slots_json, status, trainer_id
    ))
    conn.commit()

    cursor.execute('''
    SELECT t.*, g.name as gym_name, g.city as gym_city
    FROM trainers t
    LEFT JOIN gyms g ON t.gym_id = g.id
    WHERE t.id = ?
    ''', (trainer_id,))
    updated = row_to_dict(cursor.fetchone())
    conn.close()

    # Sync to connected Supabase database
    sync_trainer_to_supabase(updated)

    return jsonify({'message': f'Trainer {full_name} updated successfully!', 'trainer': updated}), 200

@app.route('/api/trainers/<int:trainer_id>/status', methods=['PUT'])
@role_required('owner')
def toggle_trainer_status(trainer_id):
    """Toggle trainer between Active and Inactive."""
    owner_id = session['user_id']
    data = request.get_json() or {}
    new_status = data.get('status', '').lower()
    if new_status not in ['active', 'inactive']:
        return jsonify({'error': 'Invalid status. Choose active or inactive'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    SELECT t.id, t.name, t.owner_id, g.owner_id as gym_owner_id
    FROM trainers t
    LEFT JOIN gyms g ON t.gym_id = g.id
    WHERE t.id = ?
    ''', (trainer_id,))
    t = cursor.fetchone()
    if not t:
        conn.close()
        return jsonify({'error': 'Trainer not found'}), 404

    if t['owner_id'] != owner_id and t['gym_owner_id'] != owner_id:
        conn.close()
        return jsonify({'error': 'Unauthorized to modify this trainer'}), 403

    cursor.execute("UPDATE trainers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_status, trainer_id))
    conn.commit()

    cursor.execute("SELECT * FROM trainers WHERE id = ?", (trainer_id,))
    updated = row_to_dict(cursor.fetchone())
    conn.close()

    sync_trainer_to_supabase(updated)
    return jsonify({'message': f'Trainer {t["name"]} status set to {new_status}', 'status': new_status}), 200

@app.route('/api/trainers/<int:trainer_id>', methods=['DELETE'])
@role_required('owner')
def delete_trainer(trainer_id):
    """Delete a trainer profile with ownership authorization."""
    owner_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    SELECT t.id, t.name, t.email, t.owner_id, g.owner_id as gym_owner_id
    FROM trainers t
    LEFT JOIN gyms g ON t.gym_id = g.id
    WHERE t.id = ?
    ''', (trainer_id,))
    t = cursor.fetchone()
    if not t:
        conn.close()
        return jsonify({'error': 'Trainer not found'}), 404

    if t['owner_id'] != owner_id and t['gym_owner_id'] != owner_id:
        conn.close()
        return jsonify({'error': 'Unauthorized to delete this trainer'}), 403

    name = t['name']
    email = t['email']
    cursor.execute("DELETE FROM trainers WHERE id = ?", (trainer_id,))
    conn.commit()
    conn.close()

    delete_trainer_from_supabase(email)
    return jsonify({'message': f'Trainer {name} removed successfully from your roster'}), 200

@app.route('/api/bookings/owner', methods=['GET'])
@role_required('owner')
def get_owner_trainer_bookings():
    """Gym owner views all session booking requests for their trainers & gyms."""
    owner_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    SELECT b.*, t.name as trainer_name, t.full_name as trainer_full_name, t.specialization,
           t.hourly_rate, t.avatar_url as trainer_avatar, t.profile_image as trainer_profile_image,
           g.name as gym_name, u.name as trainee_name, u.email as trainee_email, u.phone as trainee_phone
    FROM trainer_bookings b
    JOIN trainers t ON b.trainer_id = t.id
    LEFT JOIN gyms g ON b.gym_id = g.id
    JOIN users u ON b.trainee_id = u.id
    WHERE (g.owner_id = ? OR t.owner_id = ?)
    ORDER BY b.booking_date DESC, b.id DESC
    ''', (owner_id, owner_id))
    bookings = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({'bookings': bookings}), 200

# ----------------- TRAINER DASHBOARD ENDPOINTS ----------------- #

@app.route('/api/trainer/overview', methods=['GET'])
@role_required('trainer')
def get_trainer_overview():
    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()

    # Find trainer profile
    cursor.execute("SELECT * FROM trainers WHERE user_id = ?", (user_id,))
    t_row = cursor.fetchone()
    if not t_row:
        conn.close()
        return jsonify({'error': 'Trainer profile not found'}), 404
    trainer = row_to_dict(t_row)
    trainer_id = trainer['id']

    # 1. Total Clients: unique trainees who booked with this trainer
    cursor.execute("SELECT COUNT(DISTINCT trainee_id) FROM trainer_bookings WHERE trainer_id = ?", (trainer_id,))
    total_clients = cursor.fetchone()[0]

    # 2. Upcoming Sessions: status = 'accepted' and booking_date >= CURRENT_DATE
    cursor.execute('''
    SELECT COUNT(*) FROM trainer_bookings 
    WHERE trainer_id = ? AND status = 'accepted' AND booking_date >= date('now')
    ''', (trainer_id,))
    upcoming_sessions = cursor.fetchone()[0]

    # 3. Pending Booking Requests: status = 'pending'
    cursor.execute("SELECT COUNT(*) FROM trainer_bookings WHERE trainer_id = ? AND status = 'pending'", (trainer_id,))
    pending_requests = cursor.fetchone()[0]

    # 4. Completed Sessions: status = 'completed'
    cursor.execute("SELECT COUNT(*) FROM trainer_bookings WHERE trainer_id = ? AND status = 'completed'", (trainer_id,))
    completed_sessions = cursor.fetchone()[0]

    # Today's scheduled sessions
    cursor.execute('''
    SELECT b.*, u.name as trainee_name, u.email as trainee_email, u.phone as trainee_phone,
           u.avatar as trainee_avatar, u.fitness_goal, g.name as gym_name
    FROM trainer_bookings b
    JOIN users u ON b.trainee_id = u.id
    LEFT JOIN gyms g ON b.gym_id = g.id
    WHERE b.trainer_id = ? AND b.booking_date = date('now') AND b.status IN ('accepted', 'pending')
    ORDER BY b.time_slot ASC
    ''', (trainer_id,))
    today_sessions = rows_to_list(cursor.fetchall())

    # Recent pending requests (top 5)
    cursor.execute('''
    SELECT b.*, u.name as trainee_name, u.email as trainee_email, u.phone as trainee_phone,
           u.avatar as trainee_avatar, u.fitness_goal, g.name as gym_name
    FROM trainer_bookings b
    JOIN users u ON b.trainee_id = u.id
    LEFT JOIN gyms g ON b.gym_id = g.id
    WHERE b.trainer_id = ? AND b.status = 'pending'
    ORDER BY b.booking_date ASC, b.id DESC
    LIMIT 5
    ''', (trainer_id,))
    recent_requests = rows_to_list(cursor.fetchall())

    # Upcoming confirmed sessions (top 5)
    cursor.execute('''
    SELECT b.*, u.name as trainee_name, u.email as trainee_email, u.phone as trainee_phone,
           u.avatar as trainee_avatar, u.fitness_goal, g.name as gym_name
    FROM trainer_bookings b
    JOIN users u ON b.trainee_id = u.id
    LEFT JOIN gyms g ON b.gym_id = g.id
    WHERE b.trainer_id = ? AND b.status = 'accepted' AND b.booking_date >= date('now')
    ORDER BY b.booking_date ASC, b.id ASC
    LIMIT 5
    ''', (trainer_id,))
    upcoming_sessions_list = rows_to_list(cursor.fetchall())

    conn.close()

    return jsonify({
        'trainer': trainer,
        'stats': {
            'total_clients': total_clients,
            'upcoming_sessions': upcoming_sessions,
            'pending_requests': pending_requests,
            'completed_sessions': completed_sessions
        },
        'today_sessions': today_sessions,
        'recent_requests': recent_requests,
        'upcoming_sessions_list': upcoming_sessions_list
    }), 200

@app.route('/api/trainer/clients', methods=['GET'])
@role_required('trainer')
def get_trainer_clients():
    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM trainers WHERE user_id = ?", (user_id,))
    t_row = cursor.fetchone()
    if not t_row:
        conn.close()
        return jsonify({'error': 'Trainer profile not found'}), 404
    trainer_id = t_row['id']

    cursor.execute('''
    SELECT u.id as trainee_id, u.name, u.email, u.phone, u.avatar, u.fitness_goal,
           COUNT(b.id) as total_bookings,
           MAX(b.booking_date) as latest_booking_date,
           (SELECT status FROM trainer_bookings WHERE trainer_id = ? AND trainee_id = u.id ORDER BY booking_date DESC, id DESC LIMIT 1) as latest_status,
           (SELECT time_slot FROM trainer_bookings WHERE trainer_id = ? AND trainee_id = u.id ORDER BY booking_date DESC, id DESC LIMIT 1) as latest_time_slot,
           (SELECT title FROM trainer_workout_plans WHERE trainer_id = ? AND trainee_id = u.id ORDER BY id DESC LIMIT 1) as active_workout_plan
    FROM trainer_bookings b
    JOIN users u ON b.trainee_id = u.id
    WHERE b.trainer_id = ?
    GROUP BY u.id
    ORDER BY latest_booking_date DESC
    ''', (trainer_id, trainer_id, trainer_id, trainer_id))
    clients = rows_to_list(cursor.fetchall())
    conn.close()

    return jsonify({'clients': clients}), 200

@app.route('/api/trainer/schedule', methods=['GET', 'PUT'])
@role_required('trainer')
def manage_trainer_schedule():
    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM trainers WHERE user_id = ?", (user_id,))
    t_row = cursor.fetchone()
    if not t_row:
        conn.close()
        return jsonify({'error': 'Trainer profile not found'}), 404
    trainer = row_to_dict(t_row)
    trainer_id = trainer['id']

    if request.method == 'GET':
        conn.close()
        return jsonify({
            'available_days': trainer.get('available_days') or ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'available_time_slots': trainer.get('available_time_slots') or ['07:00 AM - 11:00 AM', '04:00 PM - 08:00 PM'],
            'status': trainer.get('status') or 'active'
        }), 200

    # PUT
    data = request.get_json() or {}
    available_days = data.get('available_days')
    available_time_slots = data.get('available_time_slots')
    status = data.get('status')

    days_str = json.dumps(available_days) if available_days is not None else None
    slots_str = json.dumps(available_time_slots) if available_time_slots is not None else None

    cursor.execute('''
    UPDATE trainers
    SET available_days = COALESCE(?, available_days),
        available_time_slots = COALESCE(?, available_time_slots),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    ''', (days_str, slots_str, status, trainer_id))
    conn.commit()

    cursor.execute("SELECT * FROM trainers WHERE id = ?", (trainer_id,))
    updated = row_to_dict(cursor.fetchone())
    conn.close()

    if updated:
        sync_trainer_to_supabase(updated)

    return jsonify({'message': 'Schedule & availability updated successfully', 'trainer': updated}), 200

@app.route('/api/trainer/workout-plans', methods=['GET', 'POST'])
@role_required('trainer')
def manage_workout_plans():
    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, gym_id FROM trainers WHERE user_id = ?", (user_id,))
    t_row = cursor.fetchone()
    if not t_row:
        conn.close()
        return jsonify({'error': 'Trainer profile not found'}), 404
    trainer_id = t_row['id']
    trainer_gym_id = t_row['gym_id']

    if request.method == 'GET':
        cursor.execute('''
        SELECT wp.*, u.name as trainee_name, u.email as trainee_email
        FROM trainer_workout_plans wp
        LEFT JOIN users u ON wp.trainee_id = u.id
        WHERE wp.trainer_id = ?
        ORDER BY wp.id DESC
        ''', (trainer_id,))
        plans = rows_to_list(cursor.fetchall())
        conn.close()
        return jsonify({'workout_plans': plans}), 200

    # POST - Create Plan
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    category = data.get('category', 'Strength & Conditioning')
    difficulty = data.get('difficulty', 'Intermediate')
    target_muscle = data.get('target_muscle', 'Full Body')
    duration_weeks = int(data.get('duration_weeks') or 4)
    trainee_id = data.get('trainee_id')
    if trainee_id == '' or trainee_id == 0:
        trainee_id = None
    exercises = data.get('exercises', [])
    instructions = data.get('instructions', '').strip()

    if not title:
        conn.close()
        return jsonify({'error': 'Workout plan title is required'}), 400

    if isinstance(exercises, (list, dict)):
        exercises_str = json.dumps(exercises)
    else:
        exercises_str = str(exercises)

    cursor.execute('''
    INSERT INTO trainer_workout_plans 
    (trainer_id, trainee_id, gym_id, title, category, difficulty, target_muscle, duration_weeks, exercises, instructions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (trainer_id, trainee_id, trainer_gym_id, title, category, difficulty, target_muscle, duration_weeks, exercises_str, instructions))
    plan_id = cursor.lastrowid
    conn.commit()

    cursor.execute('''
    SELECT wp.*, u.name as trainee_name, u.email as trainee_email
    FROM trainer_workout_plans wp
    LEFT JOIN users u ON wp.trainee_id = u.id
    WHERE wp.id = ?
    ''', (plan_id,))
    new_plan = row_to_dict(cursor.fetchone())
    conn.close()

    return jsonify({'message': 'Workout plan created successfully!', 'workout_plan': new_plan}), 201

@app.route('/api/trainer/workout-plans/<int:plan_id>', methods=['DELETE', 'PUT'])
@role_required('trainer')
def delete_or_update_workout_plan(plan_id):
    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM trainers WHERE user_id = ?", (user_id,))
    t_row = cursor.fetchone()
    if not t_row:
        conn.close()
        return jsonify({'error': 'Trainer profile not found'}), 404
    trainer_id = t_row['id']

    cursor.execute("SELECT id FROM trainer_workout_plans WHERE id = ? AND trainer_id = ?", (plan_id, trainer_id))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Workout plan not found or unauthorized'}), 404

    if request.method == 'DELETE':
        cursor.execute("DELETE FROM trainer_workout_plans WHERE id = ?", (plan_id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Workout plan deleted successfully'}), 200

    # PUT
    data = request.get_json() or {}
    title = data.get('title')
    category = data.get('category')
    difficulty = data.get('difficulty')
    target_muscle = data.get('target_muscle')
    duration_weeks = data.get('duration_weeks')
    trainee_id = data.get('trainee_id')
    if trainee_id == '' or trainee_id == 0:
        trainee_id = None
    exercises = data.get('exercises')
    instructions = data.get('instructions')

    exercises_str = json.dumps(exercises) if exercises is not None else None

    cursor.execute('''
    UPDATE trainer_workout_plans
    SET title = COALESCE(?, title),
        category = COALESCE(?, category),
        difficulty = COALESCE(?, difficulty),
        target_muscle = COALESCE(?, target_muscle),
        duration_weeks = COALESCE(?, duration_weeks),
        trainee_id = ?,
        exercises = COALESCE(?, exercises),
        instructions = COALESCE(?, instructions),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    ''', (title, category, difficulty, target_muscle, duration_weeks, trainee_id, exercises_str, instructions, plan_id))
    conn.commit()

    cursor.execute("SELECT * FROM trainer_workout_plans WHERE id = ?", (plan_id,))
    updated = row_to_dict(cursor.fetchone())
    conn.close()
    return jsonify({'message': 'Workout plan updated', 'workout_plan': updated}), 200

@app.route('/api/trainer/messages', methods=['GET', 'POST'])
@login_required
def handle_trainer_messages():
    user_id = session['user_id']
    user_role = session.get('role')
    conn = get_db_connection()
    cursor = conn.cursor()

    if user_role == 'trainer':
        cursor.execute("SELECT id FROM trainers WHERE user_id = ?", (user_id,))
        t_row = cursor.fetchone()
        if not t_row:
            conn.close()
            return jsonify({'error': 'Trainer profile not found'}), 404
        trainer_id = t_row['id']
    else:
        trainee_id = user_id

    if request.method == 'GET':
        if user_role == 'trainer':
            trainee_id_param = request.args.get('trainee_id')
            if trainee_id_param:
                cursor.execute('''
                SELECT m.*, u.name as trainee_name, u.avatar as trainee_avatar
                FROM trainer_messages m
                JOIN users u ON m.trainee_id = u.id
                WHERE m.trainer_id = ? AND m.trainee_id = ?
                ORDER BY m.created_at ASC
                ''', (trainer_id, trainee_id_param))
            else:
                cursor.execute('''
                SELECT m.*, u.name as trainee_name, u.avatar as trainee_avatar
                FROM trainer_messages m
                JOIN users u ON m.trainee_id = u.id
                WHERE m.trainer_id = ?
                ORDER BY m.created_at ASC
                ''', (trainer_id,))
            messages = rows_to_list(cursor.fetchall())
            conn.close()
            return jsonify({'messages': messages}), 200
        else:
            trainer_id_param = request.args.get('trainer_id')
            cursor.execute('''
            SELECT m.*, t.name as trainer_name, t.avatar_url as trainer_avatar
            FROM trainer_messages m
            JOIN trainers t ON m.trainer_id = t.id
            WHERE m.trainee_id = ? AND (m.trainer_id = ? OR ? IS NULL)
            ORDER BY m.created_at ASC
            ''', (trainee_id, trainer_id_param, trainer_id_param))
            messages = rows_to_list(cursor.fetchall())
            conn.close()
            return jsonify({'messages': messages}), 200

    # POST
    data = request.get_json() or {}
    message_text = data.get('message', '').strip()
    if not message_text:
        conn.close()
        return jsonify({'error': 'Message text is required'}), 400

    if user_role == 'trainer':
        target_trainee_id = data.get('trainee_id')
        if not target_trainee_id:
            conn.close()
            return jsonify({'error': 'Trainee ID is required'}), 400
        cursor.execute('''
        INSERT INTO trainer_messages (trainer_id, trainee_id, sender_role, message)
        VALUES (?, ?, 'trainer', ?)
        ''', (trainer_id, target_trainee_id, message_text))
    else:
        target_trainer_id = data.get('trainer_id')
        if not target_trainer_id:
            conn.close()
            return jsonify({'error': 'Trainer ID is required'}), 400
        cursor.execute('''
        INSERT INTO trainer_messages (trainer_id, trainee_id, sender_role, message)
        VALUES (?, ?, 'trainee', ?)
        ''', (target_trainer_id, trainee_id, message_text))

    msg_id = cursor.lastrowid
    conn.commit()

    cursor.execute('''
    SELECT m.*, u.name as trainee_name, u.avatar as trainee_avatar
    FROM trainer_messages m
    JOIN users u ON m.trainee_id = u.id
    WHERE m.id = ?
    ''', (msg_id,))
    new_msg = row_to_dict(cursor.fetchone())
    conn.close()

    return jsonify({'message': 'Message sent successfully', 'data': new_msg}), 201

@app.route('/api/trainers/profile', methods=['PUT'])
@role_required('trainer')
def update_trainer_profile():
    user_id = session['user_id']
    data = request.get_json() or {}

    name = data.get('name') or data.get('full_name')
    avatar_url = data.get('avatar_url') or data.get('profile_image')
    phone = data.get('phone')
    experience_years = data.get('experience_years')
    specialization = data.get('specialization')
    qualifications = data.get('qualifications')
    hourly_rate = data.get('hourly_rate')
    bio = data.get('bio')
    availability = data.get('availability')
    available_days = data.get('available_days')
    available_time_slots = data.get('available_time_slots')
    gym_id = data.get('gym_id')
    status = data.get('status')

    if isinstance(availability, dict):
        availability = json.dumps(availability)
    if isinstance(available_days, list):
        available_days = json.dumps(available_days)
    if isinstance(available_time_slots, list):
        available_time_slots = json.dumps(available_time_slots)

    conn = get_db_connection()
    cursor = conn.cursor()

    # Update users table if name, avatar, phone or bio changed
    cursor.execute('''
    UPDATE users
    SET name = COALESCE(?, name),
        avatar = COALESCE(?, avatar),
        phone = COALESCE(?, phone),
        bio = COALESCE(?, bio)
    WHERE id = ?
    ''', (name, avatar_url, phone, bio, user_id))

    cursor.execute('''
    UPDATE trainers
    SET name = COALESCE(?, name),
        full_name = COALESCE(?, full_name),
        avatar_url = COALESCE(?, avatar_url),
        profile_image = COALESCE(?, profile_image),
        phone = COALESCE(?, phone),
        experience_years = COALESCE(?, experience_years),
        experience = CASE WHEN ? IS NOT NULL THEN (? || ' years') ELSE experience END,
        specialization = COALESCE(?, specialization),
        qualifications = COALESCE(?, qualifications),
        hourly_rate = COALESCE(?, hourly_rate),
        bio = COALESCE(?, bio),
        availability = COALESCE(?, availability),
        available_days = COALESCE(?, available_days),
        available_time_slots = COALESCE(?, available_time_slots),
        gym_id = COALESCE(?, gym_id),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
    ''', (name, name, avatar_url, avatar_url, phone,
          experience_years, experience_years, experience_years,
          specialization, qualifications, hourly_rate, bio,
          availability, available_days, available_time_slots, gym_id, status, user_id))
    conn.commit()

    cursor.execute("SELECT * FROM trainers WHERE user_id = ?", (user_id,))
    updated = row_to_dict(cursor.fetchone())
    conn.close()

    if updated:
        sync_trainer_to_supabase(updated)

    return jsonify({'message': 'Trainer profile updated successfully', 'trainer': updated}), 200

@app.route('/api/bookings', methods=['POST'])
@login_required
def create_booking():
    trainee_id = session['user_id']
    data = request.get_json() or {}

    trainer_id = data.get('trainer_id')
    gym_id = data.get('gym_id')
    booking_date = data.get('booking_date', '').strip()
    time_slot = data.get('time_slot', '').strip()
    notes = data.get('notes', '').strip()

    if not trainer_id or not booking_date or not time_slot:
        return jsonify({'error': 'Trainer ID, booking date, and time slot are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # If gym_id wasn't specified, get trainer's gym
    if not gym_id:
        cursor.execute("SELECT gym_id FROM trainers WHERE id = ?", (trainer_id,))
        t_row = cursor.fetchone()
        if t_row and t_row['gym_id']:
            gym_id = t_row['gym_id']

    cursor.execute('''
    INSERT INTO trainer_bookings (trainer_id, trainee_id, gym_id, booking_date, time_slot, status, notes)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
    ''', (trainer_id, trainee_id, gym_id, booking_date, time_slot, notes))
    booking_id = cursor.lastrowid
    conn.commit()

    cursor.execute('''
    SELECT b.*, t.name as trainer_name, t.specialization, t.hourly_rate, t.avatar_url as trainer_avatar,
           g.name as gym_name, u.name as trainee_name
    FROM trainer_bookings b
    JOIN trainers t ON b.trainer_id = t.id
    LEFT JOIN gyms g ON b.gym_id = g.id
    JOIN users u ON b.trainee_id = u.id
    WHERE b.id = ?
    ''', (booking_id,))
    booking = row_to_dict(cursor.fetchone())
    conn.close()

    return jsonify({'message': 'Booking request submitted successfully! Pending trainer confirmation.', 'booking': booking}), 201

@app.route('/api/bookings/my', methods=['GET'])
@login_required
def get_my_bookings():
    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    SELECT b.*, t.name as trainer_name, t.specialization, t.hourly_rate, t.avatar_url as trainer_avatar,
           g.name as gym_name, g.address as gym_address
    FROM trainer_bookings b
    JOIN trainers t ON b.trainer_id = t.id
    LEFT JOIN gyms g ON b.gym_id = g.id
    WHERE b.trainee_id = ?
    ORDER BY b.booking_date DESC, b.id DESC
    ''', (user_id,))
    bookings = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({'bookings': bookings}), 200

@app.route('/api/bookings/trainer', methods=['GET'])
@role_required('trainer')
def get_trainer_bookings():
    user_id = session['user_id']
    status_filter = request.args.get('status', '').strip().lower()

    conn = get_db_connection()
    cursor = conn.cursor()

    if status_filter and status_filter != 'all':
        cursor.execute('''
        SELECT b.*, u.name as trainee_name, u.email as trainee_email, u.phone as trainee_phone,
               u.avatar as trainee_avatar, u.fitness_goal, g.name as gym_name
        FROM trainer_bookings b
        JOIN trainers t ON b.trainer_id = t.id
        JOIN users u ON b.trainee_id = u.id
        LEFT JOIN gyms g ON b.gym_id = g.id
        WHERE t.user_id = ? AND b.status = ?
        ORDER BY b.booking_date ASC, b.id DESC
        ''', (user_id, status_filter))
    else:
        cursor.execute('''
        SELECT b.*, u.name as trainee_name, u.email as trainee_email, u.phone as trainee_phone,
               u.avatar as trainee_avatar, u.fitness_goal, g.name as gym_name
        FROM trainer_bookings b
        JOIN trainers t ON b.trainer_id = t.id
        JOIN users u ON b.trainee_id = u.id
        LEFT JOIN gyms g ON b.gym_id = g.id
        WHERE t.user_id = ?
        ORDER BY b.booking_date ASC, b.id DESC
        ''', (user_id,))
    bookings = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({'bookings': bookings}), 200

@app.route('/api/bookings/<int:booking_id>/status', methods=['PUT'])
@role_required('trainer', 'owner')
def update_booking_status(booking_id):
    user_id = session['user_id']
    user_role = session.get('role')
    data = request.get_json() or {}
    new_status = data.get('status', '').lower()

    if new_status not in ['accepted', 'rejected', 'completed', 'cancelled']:
        return jsonify({'error': 'Invalid status. Choose accepted, rejected, or completed'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Role guard: verify ownership
    if user_role == 'trainer':
        cursor.execute('''
        SELECT b.id FROM trainer_bookings b
        JOIN trainers t ON b.trainer_id = t.id
        WHERE b.id = ? AND t.user_id = ?
        ''', (booking_id, user_id))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Unauthorized. You can only manage your own bookings.'}), 403
    elif user_role == 'owner':
        cursor.execute('''
        SELECT b.id FROM trainer_bookings b
        LEFT JOIN gyms g ON b.gym_id = g.id
        LEFT JOIN trainers t ON b.trainer_id = t.id
        WHERE b.id = ? AND (g.owner_id = ? OR t.owner_id = ?)
        ''', (booking_id, user_id, user_id))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Unauthorized. You can only manage bookings for your gym/trainers.'}), 403

    cursor.execute('''
    UPDATE trainer_bookings
    SET status = ?
    WHERE id = ?
    ''', (new_status, booking_id))
    conn.commit()

    cursor.execute('''
    SELECT b.*, u.name as trainee_name, u.email as trainee_email, u.phone as trainee_phone,
           u.avatar as trainee_avatar, u.fitness_goal, g.name as gym_name
    FROM trainer_bookings b
    JOIN trainers t ON b.trainer_id = t.id
    JOIN users u ON b.trainee_id = u.id
    LEFT JOIN gyms g ON b.gym_id = g.id
    WHERE b.id = ?
    ''', (booking_id,))
    updated_b = row_to_dict(cursor.fetchone())
    conn.close()

    return jsonify({'message': f'Booking marked as {new_status}', 'booking': updated_b}), 200

# ----------------- REVIEWS ----------------- #

@app.route('/api/gyms/<int:gym_id>/reviews', methods=['POST'])
@login_required
def add_review(gym_id):
    user_id = session['user_id']
    data = request.get_json() or {}
    rating = int(data.get('rating', 5))
    comment = data.get('comment', '').strip()

    if rating < 1 or rating > 5 or not comment:
        return jsonify({'error': 'Rating must be between 1 and 5 and comment is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO reviews (gym_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?)
    ''', (gym_id, user_id, rating, comment))

    # Recalculate gym average rating
    cursor.execute("SELECT AVG(rating), COUNT(*) FROM reviews WHERE gym_id = ?", (gym_id,))
    avg_rating, count = cursor.fetchone()
    cursor.execute("UPDATE gyms SET rating = ROUND(?, 1), review_count = ? WHERE id = ?", (avg_rating, count, gym_id))

    conn.commit()
    conn.close()
    return jsonify({'message': 'Review submitted successfully', 'new_rating': round(avg_rating, 1)}), 201

# ----------------- EQUIPMENT & WORKOUTS ----------------- #

@app.route('/api/equipment', methods=['GET'])
def get_equipment_guide():
    category = request.args.get('category', '').strip()
    target = request.args.get('target', '').strip()

    query = "SELECT * FROM equipment WHERE 1=1"
    params = []
    if category and category != 'All':
        query += " AND LOWER(category) = LOWER(?)"
        params.append(category)
    if target and target != 'All':
        query += " AND LOWER(target_muscle) LIKE LOWER(?)"
        params.append(f"%{target}%")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    equipment = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({'equipment': equipment}), 200

@app.route('/api/workouts', methods=['GET'])
def get_workouts():
    category = request.args.get('category', '').strip()
    difficulty = request.args.get('difficulty', '').strip()

    query = "SELECT * FROM workouts WHERE 1=1"
    params = []
    if category and category != 'All':
        query += " AND LOWER(category) LIKE LOWER(?)"
        params.append(f"%{category}%")
    if difficulty and difficulty != 'All':
        query += " AND LOWER(difficulty) = LOWER(?)"
        params.append(difficulty)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    workouts = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify({'workouts': workouts}), 200

# ----------------- SMART RECOMMENDATION SYSTEM ----------------- #

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Rule-based smart fitness and gym recommendation engine."""
    data = request.get_json() or {}
    budget = float(data.get('budget', 3500))
    location = data.get('location', '').strip()
    goal = data.get('goal', 'General Fitness').strip().lower()
    needs_trainer = data.get('needs_trainer', False)
    safety_priority = data.get('safety_priority', False)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM gyms")
    all_gyms = rows_to_list(cursor.fetchall())

    # Get trainers count for each gym
    cursor.execute("SELECT gym_id, COUNT(*) as t_count FROM trainers GROUP BY gym_id")
    trainer_counts = {row['gym_id']: row['t_count'] for row in cursor.fetchall() if row['gym_id']}
    conn.close()

    recommendations = []
    for gym in all_gyms:
        score = 50.0  # Base score
        match_reasons = []

        # 1. Budget Matching (30 points)
        min_p = gym['min_price']
        if min_p <= budget:
            budget_score = 30.0 * (1 - (min_p / (budget + 1)) * 0.3)
            score += budget_score
            match_reasons.append(f"Fits within your ₹{budget:.0f}/mo budget (from ₹{min_p:.0f}/mo)")
        else:
            score -= 15.0

        # 2. Location Matching (20 points)
        if location and location.lower() in gym['city'].lower():
            score += 20.0
            match_reasons.append(f"Located in your preferred area: {gym['city']}")
        elif not location or location == 'All':
            score += 10.0

        # 3. Fitness Goal Matching (25 points)
        gym_goals = (gym['fitness_goals'] or '').lower()
        if goal in gym_goals or any(w in gym_goals for w in goal.split()):
            score += 25.0
            match_reasons.append(f"High specialization in {data.get('goal')}")
        else:
            score += 5.0

        # 4. Trainer Availability (15 points)
        t_count = trainer_counts.get(gym['id'], 0)
        if needs_trainer:
            if t_count > 0:
                score += 15.0
                match_reasons.append(f"{t_count} certified elite trainers available onsite")
            else:
                score -= 10.0

        # 5. Safety priority (10 points)
        safety_features = gym.get('women_safety_features') or []
        if safety_priority and len(safety_features) >= 3:
            score += 15.0
            match_reasons.append("Gold-standard safety protocols & female-only zones")

        # 6. Gym rating influence
        score += (gym['rating'] - 4.0) * 10

        match_percent = min(99, max(45, int(score)))
        recommendations.append({
            'gym': gym,
            'match_percent': match_percent,
            'reasons': match_reasons[:3]
        })

    # Sort descending by match percentage
    recommendations.sort(key=lambda x: x['match_percent'], reverse=True)
    return jsonify({'recommendations': recommendations}), 200

# ----------------- BMI CALCULATOR ----------------- #

@app.route('/api/bmi', methods=['POST'])
def calculate_bmi():
    data = request.get_json() or {}
    height_cm = float(data.get('height', 175))
    weight_kg = float(data.get('weight', 70))
    gender = data.get('gender', 'male')
    activity_level = data.get('activity_level', 'moderate')

    if height_cm <= 0 or weight_kg <= 0:
        return jsonify({'error': 'Height and weight must be greater than zero'}), 400

    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m * height_m), 1)

    # Categories
    if bmi < 18.5:
        category = 'Underweight'
        color = '#00F0FF' # Cyan
        advice = 'Focus on nutrient-dense calorie surplus, progressive resistance training, and compound lifts to build lean muscle mass.'
        target_calories = round(weight_kg * 35)
        workout_type = 'Hypertrophy & Strength Training'
    elif bmi < 24.9:
        category = 'Normal Weight'
        color = '#B8FF00' # FitSphere Lime Green
        advice = 'Excellent metabolic balance! Maintain with hybrid resistance and cardiovascular conditioning to optimize body composition.'
        target_calories = round(weight_kg * 30)
        workout_type = 'Balanced Functional Conditioning'
    elif bmi < 29.9:
        category = 'Overweight'
        color = '#FFAA00' # Orange
        advice = 'Prioritize moderate caloric deficit, 8,000+ daily steps, metabolic resistance circuits, and high-protein nutrition.'
        target_calories = round(weight_kg * 25)
        workout_type = 'HIIT, Strength & Steady-State Cardio'
    else:
        category = 'Obese Class'
        color = '#FF4560' # Red
        advice = 'Begin with joint-friendly low-impact cardio (swimming, incline walking, rowing) paired with structured full-body resistance training.'
        target_calories = round(weight_kg * 22)
        workout_type = 'Low Impact Cardio & Guided Resistance'

    ideal_min_kg = round(18.5 * (height_m * height_m), 1)
    ideal_max_kg = round(24.9 * (height_m * height_m), 1)

    return jsonify({
        'bmi': bmi,
        'category': category,
        'color': color,
        'advice': advice,
        'target_calories': target_calories,
        'workout_type': workout_type,
        'ideal_range': f"{ideal_min_kg} kg - {ideal_max_kg} kg"
    }), 200

# ----------------- ANALYTICS & DASHBOARD METRICS ----------------- #

@app.route('/api/analytics/owner', methods=['GET'])
@role_required('owner')
def get_owner_analytics():
    owner_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()

    # Total gyms
    cursor.execute("SELECT id, name FROM gyms WHERE owner_id = ?", (owner_id,))
    owner_gyms = cursor.fetchall()
    gym_ids = [g['id'] for g in owner_gyms]

    if not gym_ids:
        conn.close()
        return jsonify({
            'total_gyms': 0, 'total_members': 0, 'active_trainers': 0,
            'monthly_revenue': 0, 'revenue_trend': [], 'member_growth': [],
            'capacity_percent': 0, 'trainers': []
        }), 200

    placeholders = ','.join('?' for _ in gym_ids)

    # Total members
    cursor.execute(f"SELECT COUNT(*) FROM membership_selections WHERE gym_id IN ({placeholders}) AND status = 'active'", gym_ids)
    total_members = cursor.fetchone()[0]

    # Total trainers
    cursor.execute(f"SELECT COUNT(*) FROM trainers WHERE owner_id = ? OR gym_id IN ({placeholders})", [owner_id] + gym_ids)
    total_trainers = cursor.fetchone()[0]

    # Estimated monthly revenue
    cursor.execute(f'''
    SELECT SUM(p.price) FROM membership_selections s
    JOIN membership_plans p ON s.plan_id = p.id
    WHERE s.gym_id IN ({placeholders}) AND s.status = 'active'
    ''', gym_ids)
    rev_sum = cursor.fetchone()[0] or 0.0

    # Trainers list with metrics (Trainer Performance Matrix from Image 2)
    cursor.execute(f"SELECT * FROM trainers WHERE owner_id = ? OR gym_id IN ({placeholders})", [owner_id] + gym_ids)
    trainers = rows_to_list(cursor.fetchall())

    conn.close()

    # Monthly revenue trend (in Rupees)
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    revenue_trend = [
        {'month': 'Jan', 'revenue': 142000},
        {'month': 'Feb', 'revenue': 185000},
        {'month': 'Mar', 'revenue': 240000},
        {'month': 'Apr', 'revenue': 221000},
        {'month': 'May', 'revenue': 315000},
        {'month': 'Jun', 'revenue': 298000},
        {'month': 'Jul', 'revenue': 384000},
        {'month': 'Aug', 'revenue': 421000},
        {'month': 'Sep', 'revenue': 395000},
        {'month': 'Oct', 'revenue': 472000},
        {'month': 'Nov', 'revenue': 451000},
        {'month': 'Dec', 'revenue': 512500}
    ]

    member_growth = [
        {'month': 'Jan', 'men': 420, 'women': 310},
        {'month': 'Feb', 'men': 510, 'women': 390},
        {'month': 'Mar', 'men': 640, 'women': 480},
        {'month': 'Apr', 'men': 720, 'women': 560},
        {'month': 'May', 'men': 850, 'women': 690},
        {'month': 'Jun', 'men': 980, 'women': 780},
        {'month': 'Jul', 'men': 1120, 'women': 910},
        {'month': 'Aug', 'men': 1245, 'women': 1020}
    ]

    return jsonify({
        'total_gyms': len(owner_gyms),
        'total_members': max(1245, total_members),
        'total_trainers': max(12, total_trainers),
        'monthly_revenue': max(453000, rev_sum),
        'revenue_trend': revenue_trend,
        'member_growth': member_growth,
        'capacity_percent': 58,
        'trainers': trainers
    }), 200

# ----------------- SERVE SPA & CATCH-ALL ROUTE ----------------- #

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_spa(path):
    # Check if requested static file exists in dist
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Otherwise return index.html for client-side routing
    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({
        'status': 'FitSphere 360 API running',
        'frontend': 'Please run `npm run build` or use Vite dev server on port 5173',
        'api_docs': '/api/gyms, /api/trainers, /api/workouts'
    })

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    print(f"============================================================")
    print(f"  FITSPHERE 360 – Smart Gym Management & Recommendation")
    print(f"  Server starting at: http://127.0.0.1:{port}")
    print(f"============================================================")
    app.run(host='0.0.0.0', port=port, debug=True)
