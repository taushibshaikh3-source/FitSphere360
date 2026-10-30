import requests
import json
import os

BASE_URL = "http://127.0.0.1:5000"

def test_system():
    print("==================================================")
    print("Testing FitSphere 360 Authentication After Demo Removal")
    print("==================================================")

    # 1. Verify bundle contains NO demo login or viva UI strings
    print("\n[1/5] Inspecting compiled frontend bundle for demo strings...")
    dist_dir = os.path.join("frontend", "dist", "assets")
    js_files = [f for f in os.listdir(dist_dir) if f.endswith(".js")]
    assert len(js_files) > 0, "No JS files found in dist"
    
    js_content = ""
    for jf in js_files:
        with open(os.path.join(dist_dir, jf), "r", encoding="utf-8") as f:
            js_content += f.read()

    forbidden_phrases = [
        "1-Click Viva Demonstration Login",
        "⚡ Demo Login",
        "1-Click Viva Testing Roles",
        "Quick Fill Demo Email",
        "Viva / Testing Simulation Mode",
        "Instant Viva Role Demonstration"
    ]

    for phrase in forbidden_phrases:
        assert phrase not in js_content, f"Forbidden phrase '{phrase}' still present in compiled bundle!"
        clean_phrase = phrase.encode('ascii', errors='replace').decode('ascii')
        print(f"  PASS: '{clean_phrase}' is completely absent.")

    # 2. Test Trainee Credential Login
    print("\n[2/5] Testing Trainee credential login...")
    res_trainee = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "trainee@fitsphere360.com",
        "password": "trainee123"
    })
    assert res_trainee.status_code == 200, f"Expected 200, got {res_trainee.status_code}"
    user_t = res_trainee.json()["user"]
    assert user_t["role"] == "trainee", f"Expected role trainee, got {user_t['role']}"
    print(f"  PASS: Logged in as Trainee ({user_t['email']}) -> Role: {user_t['role']}")

    # 3. Test Gym Owner Credential Login
    print("\n[3/5] Testing Gym Owner credential login...")
    res_owner = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "owner@fitsphere360.com",
        "password": "owner123"
    })
    assert res_owner.status_code == 200, f"Expected 200, got {res_owner.status_code}"
    user_o = res_owner.json()["user"]
    assert user_o["role"] == "owner", f"Expected role owner, got {user_o['role']}"
    print(f"  PASS: Logged in as Gym Owner ({user_o['email']}) -> Role: {user_o['role']}")

    # 4. Test Trainer Credential Login
    print("\n[4/5] Testing Trainer credential login...")
    res_trainer = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "trainer@fitsphere360.com",
        "password": "trainer123"
    })
    assert res_trainer.status_code == 200, f"Expected 200, got {res_trainer.status_code}"
    user_tr = res_trainer.json()["user"]
    assert user_tr["role"] == "trainer", f"Expected role trainer, got {user_tr['role']}"
    print(f"  PASS: Logged in as Trainer ({user_tr['email']}) -> Role: {user_tr['role']}")

    # 5. Test Invalid Credentials Protection
    print("\n[5/5] Testing invalid credentials rejection...")
    res_bad = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "trainee@fitsphere360.com",
        "password": "wrongpassword999"
    })
    assert res_bad.status_code == 401, f"Expected 401, got {res_bad.status_code}"
    print("  PASS: Invalid password correctly rejected with HTTP 401.")

    print("\n==================================================")
    print("ALL AUTH & DEMO REMOVAL TESTS PASSED (5/5)!")
    print("==================================================")

if __name__ == "__main__":
    test_system()
