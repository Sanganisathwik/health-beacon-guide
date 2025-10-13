import os
from typing import List, Dict, Any
import logging
import httpx
import json
import asyncio

# Remove mock mode entirely - always use real APIs
USE_MOCK = False

try:
    import google.generativeai as genai  # type: ignore
except Exception:  # pragma: no cover
    genai = None

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Configure Gemini if API key is available
gemini_api_key = os.getenv("GEMINI_API_KEY", "")
if genai and gemini_api_key and gemini_api_key != "your_actual_gemini_api_key":
    try:
        genai.configure(api_key=gemini_api_key)
        logging.info(f"Gemini AI configured successfully with key ending in: ...{gemini_api_key[-4:]}")
    except Exception as e:
        logging.error(f"Failed to configure Gemini AI: {e}")
        genai = None
else:
    logging.warning(f"Gemini AI not configured - genai={genai is not None}, key_length={len(gemini_api_key)}")

async def fetch_from_openfda_api(symptoms: List[str]) -> List[Dict[str, Any]]:
    """Fetch real drug information from OpenFDA API with shorter timeout"""
    medications = []
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            for symptom in symptoms[:1]:  # Limit to 1 symptom to reduce timeout
                # Search for drugs related to the symptom
                symptom_clean = symptom.lower().replace(' ', '+')
                url = f"https://api.fda.gov/drug/label.json?search=indications_and_usage:{symptom_clean}&limit=2"
                
                try:
                    response = await client.get(url)
                    if response.status_code == 200:
                        data = response.json()
                        results = data.get('results', [])
                        
                        for result in results:
                            openfda = result.get('openfda', {})
                            brand_names = openfda.get('brand_name', [])
                            generic_names = openfda.get('generic_name', [])
                            
                            if brand_names or generic_names:
                                name = brand_names[0] if brand_names else generic_names[0] if generic_names else "Unknown"
                                
                                # Get dosage information
                                dosage_info = result.get('dosage_and_administration', [''])
                                dosage = dosage_info[0][:100] + "..." if dosage_info and dosage_info[0] else "Follow package instructions"
                                
                                medications.append({
                                    'name': name,
                                    'type': 'over-the-counter' if 'otc' in str(result).lower() else 'prescription',
                                    'dosage': dosage,
                                    'frequency': 'As directed',
                                    'source': 'OpenFDA',
                                    'indication': symptom
                                })
                
                except Exception as e:
                    logging.warning(f"OpenFDA API error for {symptom}: {e}")
                    continue
                    
                # Small delay between requests
                await asyncio.sleep(0.2)
                
    except Exception as e:
        logging.error(f"OpenFDA API general error: {e}")
    
    return medications

async def fetch_from_umls_api(symptoms: List[str]) -> List[Dict[str, Any]]:
    """Fetch conditions from UMLS Terminology Services"""
    conditions = []
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            for symptom in symptoms[:2]:
                # Search UMLS for conditions related to symptom
                url = f"https://uts-ws.nlm.nih.gov/rest/search/current"
                params = {
                    'string': symptom,
                    'searchType': 'words',
                    'returnIdType': 'concept',
                    'pageSize': 3
                }
                
                try:
                    response = await client.get(url, params=params)
                    if response.status_code == 200:
                        data = response.json()
                        results = data.get('result', {}).get('results', [])
                        
                        for result in results:
                            name = result.get('name', 'Unknown condition')
                            ui = result.get('ui', '')
                            
                            conditions.append({
                                'name': name,
                                'probability': 60,  # Default probability
                                'description': f"Medical condition related to {symptom}",
                                'source': 'UMLS',
                                'concept_id': ui
                            })
                            
                except Exception as e:
                    logging.warning(f"UMLS API error for {symptom}: {e}")
                    continue
                    
                await asyncio.sleep(0.5)
                
    except Exception as e:
        logging.error(f"UMLS API general error: {e}")
    
    return conditions

async def fetch_from_mesh_api(symptoms: List[str]) -> List[Dict[str, Any]]:
    """Fetch medical conditions from MeSH (Medical Subject Headings) API"""
    conditions = []
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            for symptom in symptoms:
                # Search MeSH terms
                url = f"https://id.nlm.nih.gov/mesh/lookup/term"
                params = {
                    'label': symptom,
                    'match': 'contains',
                    'limit': 3
                }
                
                try:
                    response = await client.get(url, params=params)
                    if response.status_code == 200:
                        data = response.json()
                        
                        for item in data:
                            label = item.get('label', 'Unknown')
                            concept = item.get('concept', '')
                            
                            conditions.append({
                                'name': label,
                                'probability': 65,
                                'description': f"MeSH medical term: {label}",
                                'source': 'MeSH',
                                'mesh_id': concept
                            })
                            
                except Exception as e:
                    logging.warning(f"MeSH API error for {symptom}: {e}")
                    continue
                    
                await asyncio.sleep(0.5)
                
    except Exception as e:
        logging.error(f"MeSH API general error: {e}")
    
    return conditions

async def analyze_symptoms_basic(symptoms: List[str]) -> List[Dict[str, Any]]:
    """Basic symptom analysis when external APIs fail"""
    conditions = []
    
    # Symptom to condition mapping for basic analysis
    symptom_mapping = {
        'fever': {'name': 'Viral Infection', 'probability': 70, 'description': 'Common viral illness'},
        'headache': {'name': 'Tension Headache', 'probability': 60, 'description': 'Most common type of headache'},
        'cough': {'name': 'Upper Respiratory Infection', 'probability': 65, 'description': 'Infection of respiratory tract'},
        'fatigue': {'name': 'General Fatigue Syndrome', 'probability': 50, 'description': 'General tiredness'},
        'nausea': {'name': 'Gastric Upset', 'probability': 55, 'description': 'Stomach irritation'},
        'dizziness': {'name': 'Vertigo', 'probability': 45, 'description': 'Balance disorder'},
        'chest pain': {'name': 'Musculoskeletal Pain', 'probability': 40, 'description': 'Muscle or joint pain'},
        'shortness of breath': {'name': 'Respiratory Condition', 'probability': 60, 'description': 'Breathing difficulty'}
    }
    
    for symptom in symptoms:
        symptom_lower = symptom.lower()
        for key, condition in symptom_mapping.items():
            if key in symptom_lower:
                conditions.append({
                    'name': condition['name'],
                    'probability': condition['probability'],
                    'description': condition['description'],
                    'source': 'Basic Analysis'
                })
                break
    
    return conditions

def generate_recommendations(symptoms: List[str], severity: str) -> List[str]:
    """Generate recommendations based on symptoms and severity"""
    recommendations = []
    
    if severity == "high":
        recommendations.extend([
            "Seek immediate medical attention",
            "Consider visiting an emergency room",
            "Do not delay medical care"
        ])
    elif severity == "medium":
        recommendations.extend([
            "Schedule an appointment with your healthcare provider",
            "Monitor symptoms closely",
            "Rest and stay hydrated"
        ])
    else:
        recommendations.extend([
            "Rest and monitor symptoms",
            "Stay hydrated",
            "Consider over-the-counter remedies if appropriate"
        ])
    
    # Add symptom-specific recommendations
    symptoms_lower = [s.lower() for s in symptoms]
    
    if any('fever' in s for s in symptoms_lower):
        recommendations.append("Take temperature regularly and use fever reducers if needed")
    
    if any('cough' in s for s in symptoms_lower):
        recommendations.append("Use honey or throat lozenges for cough relief")
    
    if any('headache' in s for s in symptoms_lower):
        recommendations.append("Rest in a dark, quiet room")
    
    return recommendations

# Remove the old static medical knowledge base functions
async def get_medical_conditions_from_symptoms(symptoms: List[str]) -> List[Dict[str, Any]]:
    """Replaced by external API calls - this function is deprecated"""
    return await analyze_symptoms_basic(symptoms)

async def get_medications_for_symptoms(symptoms: List[str], conditions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Deprecated - replaced by external API calls"""
    return await get_basic_medications(symptoms)

async def analyze_symptoms(symptoms: List[Dict[str, Any]], patient_info: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze symptoms using external medical APIs and Gemini AI"""
    
    # Extract symptom names and severities
    symptom_names = [s.get("name", "").lower() for s in symptoms]
    severities = [s.get("severity", "moderate") for s in symptoms]
    
    # Try Gemini AI first if available
    gemini_api_key = os.getenv("GEMINI_API_KEY", "")
    if genai and gemini_api_key and gemini_api_key != "your_actual_gemini_api_key":
        try:
            logging.info("Attempting Gemini AI analysis...")
            model = genai.GenerativeModel(DEFAULT_MODEL)
            
            prompt = f"""
            As a medical AI assistant, analyze these symptoms: {', '.join(symptom_names)}
            Patient information: Age {patient_info.get('age', 'unknown')}, Medical conditions: {patient_info.get('medical_conditions', 'none')}
            
            Provide a detailed medical analysis in JSON format with:
            1. riskLevel: "low", "medium", or "high"
            2. confidence: numerical confidence score (0-100)
            3. possibleConditions: Array of conditions with name, probability, description
            4. recommendations: Array of medical recommendations with type, action, priority
            5. warningFlags: Array of warning messages
            6. medicationSuggestions: Array of medication suggestions with name, type, dosage
            7. specialistRecommendation: Object with recommended, specialty, urgency
            
            Be factual and recommend consulting healthcare professionals for proper diagnosis.
            
            Return only valid JSON format.
            """
            
            response = model.generate_content(prompt)
            result_text = response.text
            logging.info(f"Gemini response received: {len(result_text)} characters")
            
            # Try to parse JSON from the response
            try:
                import re
                json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                    result['model'] = 'Gemini AI'
                    result['source'] = 'Google Gemini AI'
                    result['disclaimer'] = "This information is for educational purposes only and should not replace professional medical advice. Always consult a healthcare professional for proper diagnosis and treatment."
                    logging.info("Successfully parsed Gemini AI response")
                    return result
                else:
                    logging.warning("No JSON found in Gemini response")
            except Exception as parse_error:
                logging.warning(f"Failed to parse Gemini response as JSON: {parse_error}")
                
        except Exception as e:
            logging.error(f"Gemini API error: {e}")
    else:
        logging.info(f"Gemini AI not available - genai={genai is not None}, key_available={bool(gemini_api_key)}")
    
    # Fallback to external medical APIs
    try:
        # Fetch from multiple external APIs concurrently
        conditions_umls = await fetch_from_umls_api(symptom_names)
        conditions_mesh = await fetch_from_mesh_api(symptom_names)
        medications_fda = await fetch_from_openfda_api(symptom_names)
        
        # Combine results from different APIs
        all_conditions = conditions_umls + conditions_mesh
        
        # If no external data, use basic analysis
        if not all_conditions:
            all_conditions = await analyze_symptoms_basic(symptom_names)
        
        # Calculate risk level based on symptoms and severities
        severe_count = sum(1 for s in severities if s == "severe")
        moderate_count = sum(1 for s in severities if s == "moderate")
        
        if severe_count > 0 or len(symptoms) > 4:
            risk_level = "high"
        elif moderate_count > 1 or len(symptoms) > 2:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        # Generate recommendations based on risk level
        recommendations = generate_recommendations(symptom_names, risk_level)
        
        # Generate warning flags
        warning_flags = []
        for symptom_name in symptom_names:
            if "chest pain" in symptom_name:
                warning_flags.append("Seek emergency care immediately for chest pain")
            elif "difficulty breathing" in symptom_name or "shortness of breath" in symptom_name:
                warning_flags.append("Seek emergency care for breathing difficulties")
            elif "severe headache" in symptom_name or any(s == "severe" for s in severities):
                warning_flags.append("Monitor for worsening symptoms and seek care if concerned")
        
        if not warning_flags:
            warning_flags = [
                "Seek immediate medical attention if symptoms worsen rapidly",
                "Contact healthcare provider if fever exceeds 103°F (39.4°C)",
                "Get emergency care for severe pain, difficulty breathing, or chest pain"
            ]
        
        # Specialist recommendation
        specialist_needed = risk_level == "high" or len(symptoms) > 3
        specialist_type = "Emergency Medicine" if risk_level == "high" else "Family Medicine"
        urgency = "emergency" if risk_level == "high" else "urgent" if risk_level == "medium" else "routine"
        
        return {
            "riskLevel": risk_level,
            "confidence": 75,  # External API confidence
            "possibleConditions": all_conditions[:5],  # Top 5 conditions
            "recommendations": [{"type": "medical-attention", "action": rec, "priority": risk_level} for rec in recommendations],
            "warningFlags": warning_flags,
            "medicationSuggestions": medications_fda[:6],  # Top 6 medications from FDA
            "specialistRecommendation": {
                "recommended": specialist_needed,
                "specialty": specialist_type,
                "urgency": urgency
            },
            "model": "External Medical APIs",
            "source": "UMLS, MeSH, OpenFDA APIs",
            "disclaimer": "This information is for educational purposes only and should not replace professional medical advice. Always consult a healthcare professional for proper diagnosis and treatment."
        }
        
    except Exception as e:
        logging.error(f"External API error: {e}")
        # Last resort fallback
        return {
            "error": f"Failed to fetch from external APIs: {e}",
            "riskLevel": "unknown",
            "confidence": 0,
            "possibleConditions": [],
            "recommendations": [{"type": "medical-attention", "action": "Consult a healthcare provider for proper diagnosis", "priority": "high"}],
            "warningFlags": ["Unable to analyze symptoms - seek medical attention"],
            "medicationSuggestions": [],
            "specialistRecommendation": {
                "recommended": True,
                "specialty": "Family Medicine",
                "urgency": "urgent"
            },
            "model": "Error - External APIs failed",
            "source": "Fallback",
            "disclaimer": "This system encountered an error. Please consult a healthcare professional immediately."
        }

async def get_medications(input_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Get medication recommendations using external APIs"""
    
    symptoms = input_payload.get('symptoms', [])
    if isinstance(symptoms, list) and len(symptoms) > 0:
        # If symptoms is a list of strings
        if isinstance(symptoms[0], str):
            symptom_names = symptoms
        else:
            # If symptoms is a list of dicts
            symptom_names = [s.get('name', '') if isinstance(s, dict) else str(s) for s in symptoms]
    else:
        symptom_names = []
    
    # Try to get medications from external APIs
    try:
        medications_fda = await fetch_from_openfda_api(symptom_names)
        
        if not medications_fda:
            # Fallback to basic medication recommendations
            medications_fda = await get_basic_medications(symptom_names)
        
        # Additional general advice based on symptoms
        general_advice = []
        if any('fever' in s.lower() for s in symptom_names):
            general_advice.extend([
                "Stay well hydrated with water, clear broths, or electrolyte solutions",
                "Rest and avoid strenuous activities",
                "Use light clothing and maintain comfortable room temperature"
            ])
        
        if any('headache' in s.lower() for s in symptom_names):
            general_advice.extend([
                "Apply cold or warm compress to head/neck area",
                "Practice relaxation techniques to reduce stress",
                "Maintain regular sleep schedule"
            ])
        
        if any('cough' in s.lower() for s in symptom_names):
            general_advice.extend([
                "Use a humidifier or breathe steam from hot shower",
                "Stay hydrated to help thin mucus",
                "Avoid smoke and other irritants"
            ])
        
        if not general_advice:
            general_advice = [
                "Maintain adequate rest and hydration",
                "Monitor symptoms and seek medical care if they worsen",
                "Follow medication instructions carefully"
            ]
        
        # Generate warnings
        warnings = [
            "Do not exceed recommended dosages",
            "Read all medication labels carefully",
            "Check for drug interactions with current medications",
            "Consult pharmacist or healthcare provider with questions",
            "Stop medication and seek medical care if allergic reactions occur"
        ]
        
        # Add specific warnings based on symptoms
        if any('stomach' in s.lower() or 'nausea' in s.lower() for s in symptom_names):
            warnings.append("Take medications with food if stomach upset occurs")
        
        return {
            "medications": medications_fda[:6],  # Top 6 from external APIs
            "generalAdvice": general_advice,
            "warnings": warnings,
            "source": "External APIs (OpenFDA)",
            "notes": "Consult healthcare provider before starting any new medication regimen, especially if you have existing medical conditions or take other medications.",
            "disclaimer": "This information is for educational purposes only. Always consult a healthcare professional before taking any medications."
        }
        
    except Exception as e:
        logging.error(f"Medication API error: {e}")
        return {
            "error": f"Failed to fetch medication data: {e}",
            "medications": [],
            "generalAdvice": ["Consult a healthcare provider for medication recommendations"],
            "warnings": ["Unable to provide medication suggestions - seek professional medical advice"],
            "source": "Error - External APIs failed",
            "disclaimer": "This system encountered an error. Please consult a healthcare professional for medication advice."
        }

async def get_basic_medications(symptom_names: List[str]) -> List[Dict[str, Any]]:
    """Basic medication recommendations when external APIs fail"""
    medications = []
    
    # Basic medication mappings
    basic_meds = {
        'headache': {
            'name': 'Acetaminophen',
            'type': 'over-the-counter',
            'dosage': '500-1000mg every 4-6 hours',
            'frequency': 'As needed',
            'source': 'Basic recommendation'
        },
        'fever': {
            'name': 'Ibuprofen',
            'type': 'over-the-counter',
            'dosage': '200-400mg every 6-8 hours',
            'frequency': 'As needed',
            'source': 'Basic recommendation'
        },
        'cough': {
            'name': 'Dextromethorphan',
            'type': 'over-the-counter',
            'dosage': '15-30mg every 4 hours',
            'frequency': 'As needed',
            'source': 'Basic recommendation'
        },
        'nausea': {
            'name': 'Ginger supplements',
            'type': 'natural',
            'dosage': '250mg 4 times daily',
            'frequency': 'With meals',
            'source': 'Basic recommendation'
        }
    }
    
    for symptom in symptom_names:
        symptom_lower = symptom.lower()
        for key, med in basic_meds.items():
            if key in symptom_lower:
                medications.append(med)
                break
    
    return medications
