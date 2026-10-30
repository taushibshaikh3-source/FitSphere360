import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_all():
    print("==================================================")
    print("Testing FitSphere 360 Role Selection & Verification")
    print("==================================================")

    # 1. Matching Trainee Login
    print("\n[1/6] Testing Trainee role match...")
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "trainee@fitsphere360.com",
        "password": "trainee123",
        "role": "trainee"
    })
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    user = res.json()["user"]
    assert user["role"] == "trainee"
    print(f"  PASS: Trainee logged in successfully as {user['name']} (Role: {user['role']})")

    # 2. Matching Gym Owner Login
    print("\n[2/6] Testing Gym Owner role match...")
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "owner@fitsphere360.com",
        "password": "owner123",
        "role": "owner"
    })
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    user = res.json()["user"]
    assert user["role"] == "owner"
    print(f"  PASS: Gym Owner logged in successfully as {user['name']} (Role: {user['role']})")

    # 3. Matching Trainer Login
    print("\n[3/6] Testing Trainer role match...")
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "trainer@fitsphere360.com",
        "password": "trainer123",
        "role": "trainer"
    })
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    user = res.json()["user"]
    assert user["role"] == "trainer"
    print(f"  PASS: Trainer logged in successfully as {user['name']} (Role: {user['role']})")

    # 4. Mismatched Role 1: Trainee account trying to log in under Trainer role
    print("\n[4/6] Testing Trainee account with selected role 'trainer' (Mismatch)...")
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "trainee@fitsphere360.com",
        "password": "trainee123",
        "role": "trainer"
    })
    assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
    err = res.json().get("error", "")
    assert "Role Mismatch" in err, f"Expected Role Mismatch message, got: {err}"
    print(f"  PASS: Mismatch rejected with HTTP 403: {err}")

    # 5. Mismatched Role 2: Gym Owner account trying to log in under Trainee role
    print("\n[5/6] Testing Owner account with selected role 'trainee' (Mismatch)...")
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "owner@fitsphere360.com",
        "password": "owner123",
        "role": "trainee"
    })
    assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
    err = res.json().get("error", "")
    assert "Role Mismatch" in err, f"Expected Role Mismatch message, got: {err}"
    print(f"  PASS: Mismatch rejected with HTTP 403: {err}")

    # 6. Mismatched Role 3: Trainer account trying to log in under Gym Owner role
    print("\n[6/6] Testing Trainer account with selected role 'owner' (Mismatch)...")
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "trainer@fitsphere360.com",
        "password": "trainer123",
        "role": "owner"
    })
    assert res.status_code == 403, f"Expected 403, got {res.status_code}: {res.text}"
    err = res.json().get("error", "")
    assert "Role Mismatch" in err, f"Expected Role Mismatch message, got: {err}"
    print(f"  PASS: Mismatch rejected with HTTP 403: {err}")

    print("\n==================================================")
    print("ALL ROLE VERIFICATION TESTS PASSED (6/6)!")
    print("==================================================")

if __name__ == "__main__":
    test_all()
