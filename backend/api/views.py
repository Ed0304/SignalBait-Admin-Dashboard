from django.shortcuts import render
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Ticket

# Create your views here.
@csrf_exempt
def login(request):
    if request.method!="POST":
        return JsonResponse(
            {"message": "Only POST Requests are allowed.",},
            status= 405)

    data = json.loads(request.body)

    username = data.get("username")
    password = data.get("password")

    user = authenticate(
        username=username,
        password=password
    )   

    if user is not None:
        django_login(request, user) # Stores the session
        return JsonResponse({
            "message": "Login successful",
            "username": user.username
        })

    return JsonResponse(
        {"message": "Invalid username or password"},
        status=401
    )

@csrf_exempt
def logout(request):
    if request.method != "POST":
        return JsonResponse({"message": "Only POST requests are allowed"},status=405)

    django_logout(request)
    return JsonResponse({
        "message": "Logout successful"
    })


def me(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"message": "Authentication required"},
            status=401
        )

    return JsonResponse({
        "username": request.user.username,
        "is_authenticated": True
    })


def tickets(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"message": "Authentication required"},
            status=401
        )

    if request.method != "GET":
        return JsonResponse(
            {"message": "Only GET requests are allowed."},
            status=405
        )

    ticket_list = Ticket.objects.all()

    data = [
        {
            "ticket_id": ticket.ticket_id,
            "created_at": ticket.created_at,
            "issue_type": ticket.issue_type,
            "reporter_email": ticket.reporter_email,
            "ticket_status": ticket.ticket_status,
        }
        for ticket in ticket_list
    ]

    return JsonResponse(data, safe=False)