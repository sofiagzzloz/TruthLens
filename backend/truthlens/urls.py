from django.contrib import admin
from django.urls import path, include
from truthlens.views import home, health_check

urlpatterns = [
    path("", home),
    path("health/", health_check),

    # API routes
    path("api/", include("truthlens.api.urls")),

    # Django admin
    path("admin/", admin.site.urls),
]