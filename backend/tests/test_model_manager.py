from unittest.mock import patch, MagicMock
from agents.model_manager import ModelManager, ModelTier

@patch("agents.model_manager.os.getenv", return_value="fake-key")
def test_model_manager_init(mock_getenv):
    with patch("agents.model_manager.groq.Groq") as mock_groq:
        mm = ModelManager()
        assert mm.client is not None
        assert len(mm.TIERS) == 4

@patch("agents.model_manager.os.getenv", return_value="fake-key")
def test_generate_success(mock_getenv):
    mock_completion = MagicMock()
    mock_completion.choices[0].message.content = "Analysis result here"
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = mock_completion

    with patch("agents.model_manager.groq.Groq", return_value=mock_client):
        mm = ModelManager()
        result = mm.generate(
            data={"report": "test report"},
            system_prompt="Analyze this report"
        )
        assert result["success"] is True
        assert result["content"] == "Analysis result here"
        assert result["model_used"] == mm.MODEL_CONFIG[ModelTier.PRIMARY]["model"]

@patch("agents.model_manager.os.getenv", return_value="fake-key")
def test_generate_fallback_on_rate_limit(mock_getenv):
    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = Exception("rate limit exceeded")

    with patch("agents.model_manager.groq.Groq", return_value=mock_client):
        mm = ModelManager()
        result = mm.generate(
            data={"report": "test"},
            system_prompt="Analyze"
        )
        assert result["success"] is False
        assert "All models failed" in result["error"]

@patch("agents.model_manager.os.getenv", return_value="fake-key")
def test_generate_fallback_on_model_not_found(mock_getenv):
    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = Exception("model_not_found")

    with patch("agents.model_manager.groq.Groq", return_value=mock_client):
        mm = ModelManager()
        result = mm.generate(
            data={"report": "test"},
            system_prompt="Analyze"
        )
        assert result["success"] is False