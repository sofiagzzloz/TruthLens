from django.urls import path
from .views import analyze_text, health_check, get_models, test_claim

urlpatterns = [
    path("analyze/", analyze_text),
    path("health/", health_check),
    path("models/", get_models),
    path("test-claim/", test_claim)
]