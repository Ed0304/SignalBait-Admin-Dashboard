from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from .models import Ticket


# =========================
# LOGIN
# =========================

@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Only POST Requests are allowed."},
            status=405
        )

    data = json.loads(request.body)

    username = data.get("username")
    password = data.get("password")

    user = authenticate(
        username=username,
        password=password
    )

    if user is not None:
        django_login(request, user)

        return JsonResponse({
            "message": "Login successful",
            "username": user.username
        })

    return JsonResponse(
        {"message": "Invalid username or password"},
        status=401
    )


# =========================
# LOGOUT
# =========================

@csrf_exempt
def logout(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Only POST requests are allowed"},
            status=405
        )

    django_logout(request)

    return JsonResponse({
        "message": "Logout successful"
    })


# =========================
# CURRENT USER
# =========================

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


# =========================
# TICKETS
# =========================

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


# =========================
# UPDATE / DELETE TICKET
# =========================

@csrf_exempt
def ticket_detail(request, ticket_id):

    # Check authentication
    if not request.user.is_authenticated:
        return JsonResponse(
            {"message": "Authentication required"},
            status=401
        )

    # Find ticket
    try:
        ticket = Ticket.objects.get(
            ticket_id=ticket_id
        )
    except Ticket.DoesNotExist:
        return JsonResponse(
            {"message": "Ticket not found."},
            status=404
        )


    # =========================
    # UPDATE STATUS
    # =========================

    if request.method == "PATCH":

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse(
                {"message": "Invalid JSON."},
                status=400
            )

        new_status = data.get("ticket_status")

        if not new_status:
            return JsonResponse(
                {"message": "ticket_status is required."},
                status=400
            )

        ticket.ticket_status = new_status
        ticket.save(update_fields=["ticket_status"])

        return JsonResponse({
            "message": "Ticket status updated successfully.",
            "ticket_id": ticket.ticket_id,
            "ticket_status": ticket.ticket_status
        })


    # =========================
    # DELETE TICKET
    # =========================

    if request.method == "DELETE":

        ticket.delete()

        return JsonResponse({
            "message": "Ticket deleted successfully.",
            "ticket_id": ticket_id
        })


    # =========================
    # INVALID METHOD
    # =========================

    return JsonResponse(
        {"message": "Method not allowed."},
        status=405
    )

from django.db.models import Count
from django.db.models.functions import TruncDate

def analytics(request):
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

    analyse_by = request.GET.get("analyse_by", "issue_type")
    sort_order = request.GET.get("sort_order", "ascending")

    # Determine sorting direction
    if sort_order == "descending":
        prefix = "-"
    else:
        prefix = ""

    # Issue type statistics
    issue_data = (
        Ticket.objects
        .values("issue_type")
        .annotate(count=Count("ticket_id"))
        .order_by(f"{prefix}count")
    )

    # Ticket status statistics
    status_data = (
        Ticket.objects
        .values("ticket_status")
        .annotate(count=Count("ticket_id"))
        .order_by(f"{prefix}count")
    )

    # Daily ticket statistics
    daily_data = (
        Ticket.objects
        .annotate(date=TruncDate("created_at"))
        .values("date")
        .annotate(count=Count("ticket_id"))
        .order_by(f"{prefix}date")
    )

    return JsonResponse({
        "status": list(status_data),
        "issues": list(issue_data),
        "daily": list(daily_data),
    })