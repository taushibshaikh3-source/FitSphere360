import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_trainer_endpoints():
    session = requests.Session()

    print("=" * 60)
    print("TESTING TRAINER DASHBOARD BACKEND ENDPOINTS")
    print("=" * 60)

    # 1. Login as Trainer
    res = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "trainer@fitsphere360.com",
        "password": "trainer123"
    })
    assert res.status_code == 200, f"Login failed: {res.text}"
    user = res.json()['user']
    print(f"[OK] 1. Logged in as: {user['name']} (Role: {user['role']})")

    # 2. Get Trainer Overview (Metrics & Today Sessions)
    res = session.get(f"{BASE_URL}/api/trainer/overview")
    assert res.status_code == 200, f"Overview failed: {res.text}"
    overview = res.json()
    stats = overview['stats']
    print(f"[OK] 2. Overview Stats: Total Clients={stats['total_clients']}, Upcoming={stats['upcoming_sessions']}, Pending={stats['pending_requests']}, Completed={stats['completed_sessions']}")
    assert stats['total_clients'] >= 1, "Expected at least 1 client"

    # 3. Get Trainer Clients
    res = session.get(f"{BASE_URL}/api/trainer/clients")
    assert res.status_code == 200, f"Clients failed: {res.text}"
    clients = res.json()['clients']
    print(f"[OK] 3. My Clients count: {len(clients)}")
    for c in clients:
        print(f"     Client: {c['name']} ({c['email']}) - Total Bookings: {c['total_bookings']}, Latest Status: {c['latest_status']}")

    # 4. Get Trainer Schedule
    res = session.get(f"{BASE_URL}/api/trainer/schedule")
    assert res.status_code == 200, f"Get schedule failed: {res.text}"
    sched = res.json()
    print(f"[OK] 4. Schedule: Days={sched['available_days']}, Status={sched['status']}")

    # Update Schedule
    res = session.put(f"{BASE_URL}/api/trainer/schedule", json={
        "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "available_time_slots": ["06:00 AM - 10:00 AM", "05:00 PM - 09:00 PM"],
        "status": "active"
    })
    assert res.status_code == 200, f"Update schedule failed: {res.text}"
    print("[OK] 4b. Schedule updated successfully")

    # 5. Workout Plans CRUD
    res = session.get(f"{BASE_URL}/api/trainer/workout-plans")
    assert res.status_code == 200, f"Get workout plans failed: {res.text}"
    wp_list = res.json()['workout_plans']
    print(f"[OK] 5. Workout Plans count: {len(wp_list)}")

    # Create new workout plan
    create_wp_res = session.post(f"{BASE_URL}/api/trainer/workout-plans", json={
        "title": "High-Intensity Conditioning Blast",
        "category": "HIIT & Cardio",
        "difficulty": "Intermediate",
        "target_muscle": "Cardiovascular & Core",
        "duration_weeks": 4,
        "trainee_id": clients[0]['trainee_id'] if clients else None,
        "exercises": [
            {"name": "Kettlebell Swings", "sets": "4", "reps": "20", "notes": "Hinge at hips, explosive glute snap"},
            {"name": "Burpee Box Jump-Overs", "sets": "4", "reps": "12", "notes": "Soft landing on 24-inch box"},
            {"name": "Rowing Machine Sprints", "sets": "5", "reps": "250m", "notes": "Max effort sub-45s pace"}
        ],
        "instructions": "Keep rest intervals strictly to 60 seconds. Log heart rate recovery."
    })
    assert create_wp_res.status_code == 201, f"Create WP failed: {create_wp_res.text}"
    new_wp = create_wp_res.json()['workout_plan']
    print(f"[OK] 5b. Created Workout Plan '{new_wp['title']}' (ID: {new_wp['id']})")

    # Delete the created plan to verify delete
    del_res = session.delete(f"{BASE_URL}/api/trainer/workout-plans/{new_wp['id']}")
    assert del_res.status_code == 200, f"Delete WP failed: {del_res.text}"
    print(f"[OK] 5c. Successfully deleted workout plan ID {new_wp['id']}")

    # 6. Messages
    res = session.get(f"{BASE_URL}/api/trainer/messages")
    assert res.status_code == 200, f"Get messages failed: {res.text}"
    messages = res.json()['messages']
    print(f"[OK] 6. Messages thread count: {len(messages)}")

    # Send a message
    if clients:
        send_msg_res = session.post(f"{BASE_URL}/api/trainer/messages", json={
            "trainee_id": clients[0]['trainee_id'],
            "message": "Hey! Just reviewing your progress notes. Hydrate well tonight."
        })
        assert send_msg_res.status_code == 201, f"Send message failed: {send_msg_res.text}"
        print(f"[OK] 6b. Message sent to client {clients[0]['name']}")

    # 7. Update Trainer Profile
    res = session.put(f"{BASE_URL}/api/trainers/profile", json={
        "specialization": "Hypertrophy & Olympic Weightlifting",
        "hourly_rate": 1350.0,
        "experience_years": 9,
        "bio": "CSCS Certified Master Trainer specializing in biomechanics, Olympic weightlifting and elite strength."
    })
    assert res.status_code == 200, f"Profile update failed: {res.text}"
    updated_t = res.json()['trainer']
    assert updated_t['hourly_rate'] == 1350.0
    print(f"[OK] 7. Profile updated. New Rate: Rs. {updated_t['hourly_rate']}")

    # 8. Bookings filter and update
    res = session.get(f"{BASE_URL}/api/bookings/trainer?status=pending")
    assert res.status_code == 200
    pending_list = res.json()['bookings']
    print(f"[OK] 8. Trainer filtered pending bookings: {len(pending_list)}")
    if pending_list:
        b_id = pending_list[0]['id']
        status_res = session.put(f"{BASE_URL}/api/bookings/{b_id}/status", json={"status": "accepted"})
        assert status_res.status_code == 200
        print(f"[OK] 8b. Accepted booking ID {b_id}")

    print("=" * 60)
    print("ALL BACKEND ENDPOINTS VERIFIED AND WORKING 100%!")
    print("=" * 60)

if __name__ == '__main__':
    test_trainer_endpoints()
