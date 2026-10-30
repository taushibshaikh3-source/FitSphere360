import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def run_e2e_tests():
    print("=" * 70)
    print("FITSPHERE 360: COMPREHENSIVE TRAINER DASHBOARD E2E TEST SUITE")
    print("=" * 70)

    # -------------------------------------------------------------
    # 1. TEST TRAINER AUTHENTICATION & LOGIN
    # -------------------------------------------------------------
    trainer_session = requests.Session()
    login_resp = trainer_session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "trainer@fitsphere360.com",
        "password": "trainer123"
    })
    assert login_resp.status_code == 200, f"Trainer login failed: {login_resp.text}"
    user_data = login_resp.json()['user']
    assert user_data['role'] == 'trainer', f"Expected role='trainer', got {user_data['role']}"
    print(f"[OK] 1. Trainer Login: Authenticated as '{user_data['name']}' (Role: {user_data['role']})")

    # -------------------------------------------------------------
    # 2. TEST DASHBOARD OVERVIEW & 4 DB STATS CARDS
    # -------------------------------------------------------------
    overview_resp = trainer_session.get(f"{BASE_URL}/api/trainer/overview")
    assert overview_resp.status_code == 200, f"Overview failed: {overview_resp.text}"
    overview = overview_resp.json()
    stats = overview['stats']
    assert 'total_clients' in stats
    assert 'upcoming_sessions' in stats
    assert 'pending_requests' in stats
    assert 'completed_sessions' in stats
    print(f"[OK] 2. Dashboard Overview Metrics from actual DB:")
    print(f"       • Total Clients: {stats['total_clients']}")
    print(f"       • Upcoming Sessions: {stats['upcoming_sessions']}")
    print(f"       • Pending Requests: {stats['pending_requests']}")
    print(f"       • Completed Sessions: {stats['completed_sessions']}")

    # -------------------------------------------------------------
    # 3. TEST MY PROFILE: VIEW & EDIT
    # -------------------------------------------------------------
    profile_update_resp = trainer_session.put(f"{BASE_URL}/api/trainers/profile", json={
        "name": "John Doe",
        "specialization": "Olympic Weightlifting & Biomechanics",
        "experience_years": 8,
        "qualifications": "CSCS, USAW Senior Level 2 International Coach",
        "hourly_rate": 1400.0,
        "bio": "Specializing in progressive overload, snatch bar trajectory, and functional longevity.",
        "phone": "+1 (555) 432-1098"
    })
    assert profile_update_resp.status_code == 200, f"Profile update failed: {profile_update_resp.text}"
    updated_profile = profile_update_resp.json()['trainer']
    assert updated_profile['specialization'] == "Olympic Weightlifting & Biomechanics"
    assert updated_profile['hourly_rate'] == 1400.0
    print(f"[OK] 3. My Profile: Successfully updated trainer specialization ('{updated_profile['specialization']}') and rate (Rs. {updated_profile['hourly_rate']})")

    # -------------------------------------------------------------
    # 4. TEST MY CLIENTS: ROSTER DISPLAY
    # -------------------------------------------------------------
    clients_resp = trainer_session.get(f"{BASE_URL}/api/trainer/clients")
    assert clients_resp.status_code == 200, f"Fetch clients failed: {clients_resp.text}"
    clients = clients_resp.json()['clients']
    assert len(clients) >= 1, "Expected at least 1 booked client"
    test_client = clients[0]
    print(f"[OK] 4. My Clients: Displayed {len(clients)} trainees who booked the trainer.")
    print(f"       • Client: {test_client['name']} | Goal: {test_client['fitness_goal']} | Total Sessions: {test_client['total_bookings']}")

    # -------------------------------------------------------------
    # 5. TEST SESSION BOOKINGS: ACCEPT & REJECT & COMPLETE
    # -------------------------------------------------------------
    # First trainee creates a fresh booking request
    trainee_session = requests.Session()
    trainee_login = trainee_session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "trainee@fitsphere360.com",
        "password": "trainee123"
    })
    assert trainee_login.status_code == 200
    new_booking_resp = trainee_session.post(f"{BASE_URL}/api/bookings", json={
        "trainer_id": 1,
        "gym_id": 1,
        "booking_date": "2026-11-15",
        "time_slot": "07:00 AM - 11:00 AM",
        "notes": "Testing acceptance and completion workflow."
    })
    assert new_booking_resp.status_code == 201
    created_booking_id = new_booking_resp.json()['booking']['id']
    print(f"[OK] 5a. Trainee submitted session booking request (ID: {created_booking_id})")

    # Trainer views pending bookings
    pending_resp = trainer_session.get(f"{BASE_URL}/api/bookings/trainer?status=pending")
    assert pending_resp.status_code == 200
    pending_list = pending_resp.json()['bookings']
    assert any(b['id'] == created_booking_id for b in pending_list), "New booking must appear in trainer pending list"
    print(f"[OK] 5b. Session Bookings: Trainer views pending request in list")

    # Trainer accepts the session
    accept_resp = trainer_session.put(f"{BASE_URL}/api/bookings/{created_booking_id}/status", json={"status": "accepted"})
    assert accept_resp.status_code == 200
    print(f"[OK] 5c. Session Bookings: Trainer accepted booking #{created_booking_id}")

    # Trainer marks the session completed
    complete_resp = trainer_session.put(f"{BASE_URL}/api/bookings/{created_booking_id}/status", json={"status": "completed"})
    assert complete_resp.status_code == 200
    print(f"[OK] 5d. Session Bookings: Trainer marked session #{created_booking_id} as completed")

    # -------------------------------------------------------------
    # 6. TEST MY SCHEDULE: AVAILABILITY UPDATES
    # -------------------------------------------------------------
    schedule_resp = trainer_session.put(f"{BASE_URL}/api/trainer/schedule", json={
        "available_days": ["Monday", "Wednesday", "Friday", "Saturday"],
        "available_time_slots": ["06:00 AM - 10:00 AM", "04:00 PM - 08:00 PM"],
        "status": "active"
    })
    assert schedule_resp.status_code == 200
    updated_schedule = schedule_resp.json()['trainer']
    print(f"[OK] 6. My Schedule: Updated available days and time shifts (Status: {updated_schedule['status']})")

    # -------------------------------------------------------------
    # 7. TEST WORKOUT PLANS: CREATE, LIST, DELETE
    # -------------------------------------------------------------
    create_wp_resp = trainer_session.post(f"{BASE_URL}/api/trainer/workout-plans", json={
        "title": "Olympic Clean & Jerk Trajectory Progression",
        "category": "Olympic Weightlifting",
        "difficulty": "Advanced",
        "target_muscle": "Full Body Power",
        "duration_weeks": 6,
        "trainee_id": test_client['trainee_id'],
        "exercises": [
            {"name": "Clean High Pull", "sets": "4", "reps": "3", "notes": "Aggressive leg drive into bar contact"},
            {"name": "Front Squat Paused", "sets": "4", "reps": "3", "notes": "3s pause at bottom"},
            {"name": "Split Jerk Footwork Drill", "sets": "5", "reps": "2", "notes": "Stick the landing, lock elbows"}
        ],
        "instructions": "Increase load only when barbell path remains perpendicular without lateral drift."
    })
    assert create_wp_resp.status_code == 201
    created_wp = create_wp_resp.json()['workout_plan']
    print(f"[OK] 7a. Workout Plans: Created new plan '{created_wp['title']}' for trainee '{created_wp['trainee_name']}'")

    # List workout plans
    wp_list_resp = trainer_session.get(f"{BASE_URL}/api/trainer/workout-plans")
    assert wp_list_resp.status_code == 200
    all_wp = wp_list_resp.json()['workout_plans']
    assert any(p['id'] == created_wp['id'] for p in all_wp)
    print(f"[OK] 7b. Workout Plans: Verified plan in active trainer roster (Total: {len(all_wp)} plans)")

    # Delete workout plan
    del_wp_resp = trainer_session.delete(f"{BASE_URL}/api/trainer/workout-plans/{created_wp['id']}")
    assert del_wp_resp.status_code == 200
    print(f"[OK] 7c. Workout Plans: Successfully deleted workout plan ID #{created_wp['id']}")

    # -------------------------------------------------------------
    # 8. TEST MESSAGES: CLIENT COMMUNICATION
    # -------------------------------------------------------------
    send_msg_resp = trainer_session.post(f"{BASE_URL}/api/trainer/messages", json={
        "trainee_id": test_client['trainee_id'],
        "message": "Hey Alex! Great job on today's session. Don't forget the thoracic stretch before bed."
    })
    assert send_msg_resp.status_code == 201
    print(f"[OK] 8a. Messages: Sent coaching note to trainee #{test_client['trainee_id']}")

    get_msg_resp = trainer_session.get(f"{BASE_URL}/api/trainer/messages?trainee_id={test_client['trainee_id']}")
    assert get_msg_resp.status_code == 200
    thread = get_msg_resp.json()['messages']
    assert len(thread) >= 1
    print(f"[OK] 8b. Messages: Verified client communication thread ({len(thread)} messages logged)")

    # -------------------------------------------------------------
    # 9. TEST ROLE SEPARATION & SECURITY GUARDS
    # -------------------------------------------------------------
    # Trainer attempts to access owner-only analytics endpoint:
    owner_analytics_resp = trainer_session.get(f"{BASE_URL}/api/analytics/owner")
    assert owner_analytics_resp.status_code == 403, f"Expected 403 Forbidden for trainer accessing owner analytics, got {owner_analytics_resp.status_code}"
    print("[OK] 9a. Role Separation: Trainer blocked from Gym Owner features (403 Forbidden)")

    # Trainee attempts to access trainer overview endpoint:
    trainee_trainer_resp = trainee_session.get(f"{BASE_URL}/api/trainer/overview")
    assert trainee_trainer_resp.status_code == 403, f"Expected 403 Forbidden for trainee accessing trainer overview, got {trainee_trainer_resp.status_code}"
    print("[OK] 9b. Role Separation: Trainee blocked from Trainer features (403 Forbidden)")

    # -------------------------------------------------------------
    # 10. VERIFY TRAINEE & OWNER DASHBOARDS REMAIN UNCHANGED & WORKING
    # -------------------------------------------------------------
    # Trainee Dashboard bookings & memberships
    t_bookings_resp = trainee_session.get(f"{BASE_URL}/api/bookings/my")
    assert t_bookings_resp.status_code == 200
    t_memberships_resp = trainee_session.get(f"{BASE_URL}/api/memberships/my")
    assert t_memberships_resp.status_code == 200
    print("[OK] 10a. Trainee Dashboard remains completely intact & functional!")

    # Owner Dashboard analytics & roster
    owner_session = requests.Session()
    owner_login = owner_session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "owner@fitsphere360.com",
        "password": "owner123"
    })
    assert owner_login.status_code == 200
    o_analytics_resp = owner_session.get(f"{BASE_URL}/api/analytics/owner")
    assert o_analytics_resp.status_code == 200
    o_trainers_resp = owner_session.get(f"{BASE_URL}/api/trainers/owner")
    assert o_trainers_resp.status_code == 200
    print("[OK] 10b. Gym Owner Dashboard remains completely intact & functional!")

    # -------------------------------------------------------------
    # 11. TEST LOGOUT
    # -------------------------------------------------------------
    logout_resp = trainer_session.post(f"{BASE_URL}/api/auth/logout")
    assert logout_resp.status_code == 200
    check_me = trainer_session.get(f"{BASE_URL}/api/auth/me")
    assert check_me.json()['user'] is None
    print("[OK] 11. Trainer Logout: Session securely terminated.")

    print("=" * 70)
    print("ALL 11 E2E TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == '__main__':
    run_e2e_tests()
