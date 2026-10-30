import requests
import json
import sqlite3

BASE_URL = "http://127.0.0.1:5000"

def test_full_workflow():
    print("=" * 60)
    print("FITSPHERE 360: TESTING FULL TRAINER MANAGEMENT MODULE")
    print("=" * 60)

    # 1. Gym Owner Logs In
    owner_session = requests.Session()
    login_resp = owner_session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "owner@fitsphere360.com",
        "password": "owner123"
    })
    assert login_resp.status_code == 200, f"Owner login failed: {login_resp.text}"
    owner_data = login_resp.json()
    print("[OK] Step 1: Gym owner logged in successfully:", owner_data['user']['name'])

    # 2. Open Manage Trainers / View Owner Trainers List
    owner_trainers_resp = owner_session.get(f"{BASE_URL}/api/trainers/owner")
    assert owner_trainers_resp.status_code == 200, f"Fetch owner trainers failed: {owner_trainers_resp.text}"
    initial_trainers = owner_trainers_resp.json()['trainers']
    print(f"[OK] Step 2: Owner opened Manage Trainers. Initial roster count: {len(initial_trainers)}")
    assert any('salary' in t for t in initial_trainers), "Owner must be able to view confidential salary!"

    # 3. Add New Trainer
    new_trainer_payload = {
        "full_name": "Vikram Malhotra",
        "name": "Vikram Malhotra",
        "email": "vikram.malhotra@fitsphere360.com",
        "phone": "+91 98111 22334",
        "profile_image": "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600&auto=format&fit=crop&q=80",
        "gender": "Male",
        "age": 31,
        "experience_years": 7,
        "specialization": "Olympic Weightlifting & Biomechanics",
        "qualifications": "USAW Senior Coach, CSCS Master Instructor",
        "bio": "Olympic weightlifting specialist focusing on snatch, clean & jerk trajectory, and power production.",
        "salary": 65000.0,
        "hourly_rate": 1500.0,
        "gym_id": 1,
        "status": "active",
        "available_days": ["Monday", "Wednesday", "Friday", "Saturday"],
        "available_time_slots": ["07:00 AM - 11:00 AM", "04:00 PM - 08:00 PM"]
    }

    add_resp = owner_session.post(f"{BASE_URL}/api/trainers", json=new_trainer_payload)
    assert add_resp.status_code == 201, f"Add trainer failed: {add_resp.text}"
    new_trainer = add_resp.json()['trainer']
    trainer_id = new_trainer['id']
    print(f"[OK] Step 3: Added new trainer '{new_trainer['name']}' (ID: {trainer_id})")

    # 4. Verify trainer is saved in SQLite and appears in owner's list
    owner_trainers_resp2 = owner_session.get(f"{BASE_URL}/api/trainers/owner")
    updated_trainers = owner_trainers_resp2.json()['trainers']
    assert any(t['id'] == trainer_id for t in updated_trainers), "New trainer not in owner list!"
    print(f"[OK] Step 4 & 5: Trainer appears in Owner Roster! Total: {len(updated_trainers)}. Confidential Salary: Rs. {new_trainer['salary']}")

    # 6. Trainee Logs In & Opens Find Trainers
    trainee_session = requests.Session()
    trainee_login_resp = trainee_session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "trainee@fitsphere360.com",
        "password": "trainee123"
    })
    assert trainee_login_resp.status_code == 200, f"Trainee login failed: {trainee_login_resp.text}"
    print("[OK] Step 6: Trainee logged in successfully")

    # Trainee calls Find Trainers
    find_trainers_resp = trainee_session.get(f"{BASE_URL}/api/trainers?specialization=Olympic")
    assert find_trainers_resp.status_code == 200
    found_trainers = find_trainers_resp.json()['trainers']
    assert any(t['id'] == trainer_id for t in found_trainers), "Vikram not found under specialization filter!"
    vikram_public = next(t for t in found_trainers if t['id'] == trainer_id)
    assert 'salary' not in vikram_public, "SECURITY BREACH: Salary must NOT be exposed to trainee!"
    print(f"[OK] Step 7: Trainee found trainer '{vikram_public['name']}' via filter. Salary safely hidden (Confirmed!)")

    # 7. Trainee Views Trainer Profile
    profile_resp = trainee_session.get(f"{BASE_URL}/api/trainers/{trainer_id}")
    assert profile_resp.status_code == 200
    t_profile = profile_resp.json()['trainer']
    assert 'salary' not in t_profile, "SECURITY BREACH: Salary exposed in profile view!"
    print(f"[OK] Step 7 (cont): Trainee viewed trainer profile for '{t_profile['name']}' - Gym: {t_profile['gym_name']}")

    # 8. Trainee Books the Trainer
    booking_resp = trainee_session.post(f"{BASE_URL}/api/bookings", json={
        "trainer_id": trainer_id,
        "gym_id": 1,
        "booking_date": "2026-11-05",
        "time_slot": "07:00 AM - 11:00 AM",
        "notes": "Looking to improve snatch lockout and hip speed."
    })
    assert booking_resp.status_code == 201, f"Booking creation failed: {booking_resp.text}"
    booking = booking_resp.json()['booking']
    booking_id = booking['id']
    assert booking['status'] == 'pending', f"Initial booking status should be pending, got {booking['status']}"
    print(f"[OK] Step 8: Booking request created (ID: {booking_id}) with Status='{booking['status']}'")

    # 9. Booking Appears in Trainee and Owner Dashboards
    trainee_bookings_resp = trainee_session.get(f"{BASE_URL}/api/bookings/my")
    t_bookings = trainee_bookings_resp.json()['bookings']
    assert any(b['id'] == booking_id for b in t_bookings), "Booking not in trainee bookings!"
    print("[OK] Step 9a: Booking confirmed in Trainee Dashboard")

    owner_bookings_resp = owner_session.get(f"{BASE_URL}/api/bookings/owner")
    o_bookings = owner_bookings_resp.json()['bookings']
    assert any(b['id'] == booking_id for b in o_bookings), "Booking not in owner bookings!"
    print("[OK] Step 9b: Booking confirmed in Owner Bookings Dashboard!")

    # Owner confirms the booking
    confirm_resp = owner_session.put(f"{BASE_URL}/api/bookings/{booking_id}/status", json={"status": "accepted"})
    assert confirm_resp.status_code == 200
    print("[OK] Step 9c: Owner accepted booking!")

    # 10. Owner Can Edit or Deactivate the Trainer
    # Deactivate trainer
    deact_resp = owner_session.put(f"{BASE_URL}/api/trainers/{trainer_id}/status", json={"status": "inactive"})
    assert deact_resp.status_code == 200, f"Deactivate failed: {deact_resp.text}"
    print("[OK] Step 10a: Owner deactivated trainer (status='inactive')")

    # Verify trainer is no longer in public trainee search
    public_active_resp = trainee_session.get(f"{BASE_URL}/api/trainers")
    public_list = public_active_resp.json()['trainers']
    assert not any(t['id'] == trainer_id for t in public_list), "Inactive trainer should NOT appear in public list!"
    print("[OK] Step 10b: Inactive trainer successfully omitted from public directory")

    # Edit trainer info and reactivate
    edit_resp = owner_session.put(f"{BASE_URL}/api/trainers/{trainer_id}", json={
        "specialization": "Olympic Weightlifting & Master Mobility",
        "salary": 70000.0,
        "status": "active"
    })
    assert edit_resp.status_code == 200
    edited_t = edit_resp.json()['trainer']
    assert edited_t['salary'] == 70000.0
    assert edited_t['status'] == 'active'
    print(f"[OK] Step 10c: Owner edited trainer info. New Salary: Rs. {edited_t['salary']}, Status='{edited_t['status']}'")

    # 11. Workflow 2: Trainer Authentication Account Linking Test
    register_trainer_resp = requests.post(f"{BASE_URL}/api/auth/register", json={
        "name": "Vikram Malhotra",
        "email": "vikram.malhotra@fitsphere360.com",
        "password": "vikrampassword123",
        "role": "trainer",
        "phone": "+91 98111 22334"
    })
    assert register_trainer_resp.status_code == 201, f"Trainer registration failed: {register_trainer_resp.text}"
    reg_user = register_trainer_resp.json()['user']
    print(f"[OK] Step 11: Trainer registered account with email: {reg_user['email']}")

    # Check that the trainer record in DB was linked to this new user_id
    conn = sqlite3.connect("fitsphere360.db")
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM trainers WHERE id = ?", (trainer_id,))
    linked_user_id = cursor.fetchone()[0]
    conn.close()
    assert linked_user_id == reg_user['id'], f"Expected linked user_id {reg_user['id']}, got {linked_user_id}"
    print(f"[OK] Step 11 (cont): Existing trainer profile successfully linked to new user account ID {linked_user_id}!")

    print("=" * 60)
    print("ALL 11 WORKFLOW STEPS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    test_full_workflow()
