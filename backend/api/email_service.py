import logging
import os

import requests

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_status_update_email(
    recipient_email,
    ticket_id,
    new_status,
):
    api_key = os.environ.get("BREVO_API_KEY")
    from_email = os.environ.get("MAIL_FROM")

    if not api_key or not from_email:
        logger.error("Brevo configuration is missing.")
        return False

    payload = {
        "sender": {
            "name": "SignalBait",
            "email": from_email,
        },
        "to": [{"email": recipient_email}],
        "subject": f"SignalBait ticket #{ticket_id} status updated",
        "textContent": (
            "Your SignalBait report has a status update.\n\n"
            f"Ticket number: {ticket_id}\n"
            f"New status: {new_status}\n\n"
            "Thank you for helping improve SignalBait."
        ),
    }

    try:
        response = requests.post(
            BREVO_API_URL,
            headers={
                "api-key": api_key,
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=10,
        )
        response.raise_for_status()

        logger.info(
            "Brevo accepted status email for ticket #%s",
            ticket_id,
        )
        return True

    except requests.RequestException:
        logger.exception(
            "Brevo failed to send status email for ticket #%s",
            ticket_id,
        )
        return False