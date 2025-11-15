from django.contrib import admin
from django.urls import path, include
from .views import analyze_text, health_check, get_models, test_claim, home

urlpatterns = [
    path("", home, name="home"),
    path("admin/", admin.site.urls),
    path("analyze/", analyze_text, name="analyze_text"),
    path("health/", health_check, name="health_check"),
    path("models/", get_models, name="get_models"),
    path("test_claim/", test_claim, name="test_claim"),

  
    path("api/", include("truthlens.api.urls")),
]