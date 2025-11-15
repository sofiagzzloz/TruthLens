from django.http import JsonResponse, HttpResponse

def home(request):
    return HttpResponse("<h1>TruthLens Backend is Running 🎉</h1>")

def health_check(request):
    return JsonResponse({
        "status": "healthy",
    })