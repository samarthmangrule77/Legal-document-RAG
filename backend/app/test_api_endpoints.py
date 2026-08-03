import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def test_api():
    print("=" * 60)
    print("TESTING FASTAPI BACKEND REST ENDPOINTS WITH DATABASE")
    print("=" * 60)

    try:
        # 1. Docs list
        res = requests.get(f"{BASE_URL}/docs/list")
        assert res.status_code == 200, f"Docs list failed: {res.status_code}"
        docs = res.json()
        print(f"[OK] GET /api/docs/list -> Found {len(docs)} documents")

        # 2. Auth login
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": "alex.rivera@nexuscorp.com", "password": "password123"})
        assert res.status_code == 200, f"Auth login failed: {res.status_code}"
        auth_data = res.json()
        token = auth_data["access_token"]
        print(f"[OK] POST /api/auth/login -> Logged in user '{auth_data['user']['name']}' ({auth_data['user']['email']})")

        # 3. Auth me
        headers = {"Authorization": f"Bearer {token}"}
        res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        assert res.status_code == 200, f"Auth me failed: {res.status_code}"
        print(f"[OK] GET /api/auth/me -> Verified user profile for '{res.json()['user']['name']}'")

        # 4. Billing subscription
        res = requests.get(f"{BASE_URL}/billing/subscription")
        assert res.status_code == 200, f"Billing subscription failed: {res.status_code}"
        sub_data = res.json()
        print(f"[OK] GET /api/billing/subscription -> Plan='{sub_data['subscription']['plan_name']}', PDF Count={sub_data['subscription']['current_pdf_count']}")

        # 5. Audit logs
        res = requests.get(f"{BASE_URL}/audit/logs")
        assert res.status_code == 200, f"Audit logs failed: {res.status_code}"
        audit_data = res.json()
        print(f"[OK] GET /api/audit/logs -> Total audit log count={audit_data['total_count']}")

        # 6. Settings
        res = requests.get(f"{BASE_URL}/settings")
        assert res.status_code == 200, f"Settings failed: {res.status_code}"
        settings_data = res.json()
        print(f"[OK] GET /api/settings -> Workspace='{settings_data['settings']['workspace_name']}', LLM='{settings_data['settings']['ai_llm_model']}'")

        # 7. RAG Chat Query
        chat_req = {
            "query": "What is the required notice period for voluntary termination?",
            "doc_ids": [docs[0]["id"]] if docs else []
        }
        res = requests.post(f"{BASE_URL}/chat/query", json=chat_req)
        assert res.status_code == 200, f"Chat query failed: {res.status_code}"
        chat_res = res.json()
        print(f"[OK] POST /api/chat/query -> Chat ID={chat_res.get('chat_id')}, Confidence='{chat_res.get('confidence_level')}'")

        print("=" * 60)
        print("ALL FASTAPI BACKEND API REST ENDPOINTS PASSED SUCCESSFULLY!")
        print("=" * 60)

    except Exception as e:
        print(f"[FAIL] API TEST FAILED: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_api()
