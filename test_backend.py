#!/usr/bin/env python3
"""
Quick test script to verify backend AI functionality
"""
import requests
import json

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:8002/api/health")
        print(f"Health Check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_ai_analysis():
    """Test the AI symptom analysis"""
    try:
        payload = {
            "symptoms": [
                {"name": "headache", "severity": "moderate"},
                {"name": "fever", "severity": "mild"}
            ],
            "patientInfo": {"age": 25, "gender": "male"}
        }
        
        response = requests.post(
            "http://localhost:8002/api/symptoms/analyze",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"AI Analysis: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            analysis = data.get("data", {}).get("analysis", {})
            print(f"Confidence: {analysis.get('confidence', 'N/A')}")
            print(f"Risk Level: {analysis.get('riskLevel', 'N/A')}")
            print("AI Analysis working! ✅")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"AI analysis failed: {e}")
        return False

if __name__ == "__main__":
    print("🩺 Testing Health Beacon Backend...")
    print("=" * 40)
    
    health_ok = test_health()
    ai_ok = test_ai_analysis()
    
    print("=" * 40)
    if health_ok and ai_ok:
        print("✅ Backend is fully operational with AI!")
    else:
        print("❌ Backend has issues")