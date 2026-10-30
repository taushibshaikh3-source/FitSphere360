import os
import json
import urllib.request
import urllib.error

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://jwpkhewvoyogmagurfka.supabase.co')
SUPABASE_ANON_KEY = os.environ.get(
    'SUPABASE_ANON_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cGtoZXd2b3lvZ21hZ3VyZmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjgxNDgsImV4cCI6MjEwODk0NDE0OH0.-PW4uz987B64NCMCptr7YVmhbFcONxX8i-IlrHNm3FY'
)

def _get_headers():
    return {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
    }

def sync_trainer_to_supabase(trainer):
    """Syncs a trainer record from SQLite to Supabase trainers table."""
    try:
        url = f"{SUPABASE_URL}/rest/v1/trainers"
        
        # Prepare days and slots
        available_days = trainer.get('available_days')
        if isinstance(available_days, str):
            try:
                available_days = json.loads(available_days)
            except Exception:
                available_days = [available_days]
        if not isinstance(available_days, list):
            available_days = ['Monday', 'Wednesday', 'Friday']

        available_time_slots = trainer.get('available_time_slots')
        if isinstance(available_time_slots, str):
            try:
                available_time_slots = json.loads(available_time_slots)
            except Exception:
                available_time_slots = [available_time_slots]
        if not isinstance(available_time_slots, list):
            available_time_slots = ['07:00 AM - 11:00 AM', '04:00 PM - 08:00 PM']

        payload = {
            'name': trainer.get('name') or trainer.get('full_name') or 'Trainer',
            'full_name': trainer.get('full_name') or trainer.get('name') or 'Trainer',
            'email': trainer.get('email') or '',
            'phone': trainer.get('phone') or '',
            'specialization': trainer.get('specialization') or 'General Fitness',
            'qualifications': trainer.get('qualifications') or 'Certified Coach',
            'experience': str(trainer.get('experience') or f"{trainer.get('experience_years', 1)} years"),
            'experience_years': int(trainer.get('experience_years') or 1),
            'hourly_rate': float(trainer.get('hourly_rate') or 1000.0),
            'salary': float(trainer.get('salary') or 45000.0),
            'status': trainer.get('status') or 'active',
            'gender': trainer.get('gender') or 'Male',
            'age': int(trainer.get('age') or 28) if trainer.get('age') else None,
            'bio': trainer.get('bio') or '',
            'available_days': available_days,
            'available_time_slots': available_time_slots,
            'avatar_url': trainer.get('avatar_url') or trainer.get('profile_image'),
            'profile_image': trainer.get('profile_image') or trainer.get('avatar_url')
        }

        # Check if already exists in Supabase by email
        email = trainer.get('email')
        if email:
            check_url = f"{SUPABASE_URL}/rest/v1/trainers?email=eq.{urllib.parse.quote(email)}&select=id"
            req_check = urllib.request.Request(check_url, headers=_get_headers())
            with urllib.request.urlopen(req_check) as resp:
                existing = json.loads(resp.read().decode())
                if existing and len(existing) > 0:
                    # Update
                    sb_id = existing[0]['id']
                    patch_url = f"{SUPABASE_URL}/rest/v1/trainers?id=eq.{sb_id}"
                    req_patch = urllib.request.Request(
                        patch_url,
                        data=json.dumps(payload).encode('utf-8'),
                        headers=_get_headers(),
                        method='PATCH'
                    )
                    with urllib.request.urlopen(req_patch) as patch_resp:
                        return patch_resp.status in (200, 204)

        # Insert new
        req_post = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=_get_headers(),
            method='POST'
        )
        with urllib.request.urlopen(req_post) as post_resp:
            return post_resp.status in (200, 201)
    except Exception as e:
        print(f"[Supabase Sync Error]: {e}")
        return False

def delete_trainer_from_supabase(email):
    """Deletes or marks trainer inactive in Supabase by email."""
    if not email:
        return False
    try:
        url = f"{SUPABASE_URL}/rest/v1/trainers?email=eq.{urllib.parse.quote(email)}"
        req = urllib.request.Request(url, headers=_get_headers(), method='DELETE')
        with urllib.request.urlopen(req) as resp:
            return resp.status in (200, 204)
    except Exception as e:
        print(f"[Supabase Delete Error]: {e}")
        return False

def sync_all_from_sqlite():
    """Initial bulk sync of SQLite trainers to Supabase."""
    import sqlite3
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fitsphere360.db')
    if not os.path.exists(db_path):
        return
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM trainers")
    rows = cursor.fetchall()
    conn.close()

    count = 0
    for r in rows:
        d = dict(r)
        if sync_trainer_to_supabase(d):
            count += 1
    print(f"[Supabase Sync] Synced {count}/{len(rows)} trainers to Supabase.")
    return count

if __name__ == '__main__':
    sync_all_from_sqlite()
