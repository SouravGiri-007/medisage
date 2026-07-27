import pytest
from agents.chat_agent import ChatAgent

@pytest.fixture
def agent():
    return ChatAgent()

# ─── _is_medical_query tests ─────────────────────────────────────────

def test_detects_blood_report_question(agent):
    assert agent._is_medical_query("What does my hemoglobin level mean?")

def test_detects_symptom_question(agent):
    assert agent._is_medical_query("Why is my blood pressure high?")

def test_detects_treatment_question(agent):
    assert agent._is_medical_query("How can I lower my cholesterol?")

def test_detects_lab_value_question(agent):
    assert agent._is_medical_query("Is my glucose level normal?")

def test_detects_health_advice(agent):
    assert agent._is_medical_query("Should I be concerned about my HbA1c?")

def test_detects_diet_question(agent):
    assert agent._is_medical_query("What diet should I follow for diabetes?")

def test_rejects_weather_question(agent):
    assert not agent._is_medical_query("What is the weather today?")

def test_rejects_greeting(agent):
    assert not agent._is_medical_query("Hello, how are you?")

def test_rejects_general_knowledge(agent):
    assert not agent._is_medical_query("Who won the World Cup?")

def test_rejects_programming_question(agent):
    assert not agent._is_medical_query("Write me a Python function to sort a list")

def test_rejects_math_question(agent):
    assert not agent._is_medical_query("What is 2+2?")

def test_rejects_music_question(agent):
    assert not agent._is_medical_query("Play me a song")

def test_rejects_short_query(agent):
    assert not agent._is_medical_query("Hi")

def test_detects_report_analysis(agent):
    assert agent._is_medical_query("Analyze my blood test results")

def test_detects_medication_question(agent):
    assert agent._is_medical_query("What is the dose for Vitamin D?")

def test_detects_vaccine_question(agent):
    assert agent._is_medical_query("Do I need a booster shot?")

# ─── get_response medical guardrail ──────────────────────────────────

def test_get_response_rejects_non_medical(agent):
    response = agent.get_response("Tell me a joke")
    assert "I can only answer questions related to health" in response

def test_get_response_rejects_programming(agent):
    response = agent.get_response("Write JavaScript code")
    assert "I can only answer questions related to health" in response

def test_get_response_allows_medical(agent):
    # Without API key, it should still try the guardrail first then hit "not configured"
    response = agent.get_response("What does high cholesterol mean?")
    assert "I can only answer questions related to health" not in response

def test_get_response_short_query(agent):
    response = agent.get_response("ok")
    assert "I can only answer questions related to health" in response
