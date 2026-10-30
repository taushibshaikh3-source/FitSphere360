import requests
import json
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

BASE_URL = "http://127.0.0.1:5000"
SUPABASE_URL = "https://jwpkhewvoyogmagurfka.supabase.co"
SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cGtoZXd2b3lvZ21hZ3VyZmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjgxNDgsImV4cCI6MjEwODk0NDE0OH0.-PW4uz987B64NCMCptr7YVmhbFcONxX8i-IlrHNm3FY"

def test_all():
    print("==================================================")
    print("Testing FitSphere 360 Forgot Password & Reset Flow")
    print("==================================================")

    session = requests.Session()

    # 1. Test Supabase Auth Recovery Endpoint
    print("\n[1/5] Testing Supabase Auth recovery endpoint (/auth/v1/recover)...")
    headers = {
        "apikey": SUPABASE_ANON,
        "Authorization": f"Bearer {SUPABASE_ANON}",
        "Content-Type": "application/json"
    }
    rec_resp = requests.post(
        f"{SUPABASE_URL}/auth/v1/recover",
        headers=headers,
        json={"email": "trainee@fitsphere360.com"}
    )
    assert rec_resp.status_code == 200, f"Expected 200 from Supabase recover, got {rec_resp.status_code}: {rec_resp.text}"
    print(f"  PASS: Supabase Auth recovery request accepted (HTTP {rec_resp.status_code}).")

    # 2. Test Backend Sync Endpoint Validation
    print("\n[2/5] Testing /api/auth/reset-password-sync validation...")
    bad_req1 = requests.post(f"{BASE_URL}/api/auth/reset-password-sync", json={})
    assert bad_req1.status_code == 400, f"Expected 400 for empty body, got {bad_req1.status_code}"
    
    bad_req2 = requests.post(f"{BASE_URL}/api/auth/reset-password-sync", json={"email": "trainee@fitsphere360.com", "password": "123"})
    assert bad_req2.status_code == 400, f"Expected 400 for short password, got {bad_req2.status_code}"
    print("  PASS: Validation correctly rejects incomplete or weak passwords.")

    # 3. Test Password Reset Synchronization
    print("\n[3/5] Testing password reset synchronization & updated login...")
    test_email = "trainee@fitsphere360.com"
    new_test_password = "NewSecurePassword2026!"
    
    sync_resp = requests.post(
        f"{BASE_URL}/api/auth/reset-password-sync",
        json={"email": test_email, "password": new_test_password}
    )
    assert sync_resp.status_code == 200, f"Expected 200 from sync, got {sync_resp.status_code}: {sync_resp.text}"
    print("  PASS: /api/auth/reset-password-sync completed successfully.")

    # 4. Verify login with NEW password
    print("\n[4/5] Verifying login with newly reset password...")
    login_new = session.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": test_email, "password": new_test_password}
    )
    assert login_new.status_code == 200, f"Expected 200 login with new password, got {login_new.status_code}: {login_new.text}"
    user_data = login_new.json().get("user")
    assert user_data and user_data["email"] == test_email, "User data mismatch"
    print(f"  PASS: Successfully logged in as {user_data['name']} ({user_data['role']}) using NEW password!")

    # Old password should now fail
    old_login = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": test_email, "password": "trainee123"}
    )
    assert old_login.status_code == 401, f"Expected 401 for old password, got {old_login.status_code}"
    print("  PASS: Old password correctly rejected after reset.")

    # Restore default demo password so 1-click viva demo button continues working
    print("\n[5/5] Restoring default demo password ('trainee123') for ongoing demo buttons...")
    restore_resp = requests.post(
        f"{BASE_URL}/api/auth/reset-password-sync",
        json={"email": test_email, "password": "trainee123"}
    )
    assert restore_resp.status_code == 200
    demo_login = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": test_email, "password": "trainee123"}
    )
    assert demo_login.status_code == 200
    print("  PASS: Demo login verified working with restored credentials.")

    print("\n==================================================")
    print("ALL FORGOT PASSWORD BACKEND TESTS PASSED (5/5)!")
    print("==================================================")

if __name__ == "__main__":
    test_all()
