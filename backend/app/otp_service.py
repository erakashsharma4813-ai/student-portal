import random
import string
from datetime import datetime, timedelta
from typing import Dict
from app.config import settings

# In-memory OTP storage (for development)
# In production, use Redis or database
otp_storage: Dict[str, Dict] = {}

def generate_otp() -> str:
    """Generate OTP based on configured length"""
    return ''.join(random.choices(string.digits, k=settings.OTP_LENGTH))

def store_otp(phone: str, otp: str) -> None:
    """Store OTP with expiry time"""
    otp_storage[phone] = {
        'otp': otp,
        'created_at': datetime.utcnow(),
        'expires_at': datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES),
        'verified': False
    }

def verify_otp(phone: str, otp: str) -> bool:
    """Verify OTP for a phone number"""
    if phone not in otp_storage:
        return False

    stored_data = otp_storage[phone]

    # Check if OTP is expired
    if datetime.utcnow() > stored_data['expires_at']:
        del otp_storage[phone]
        return False

    # Check if OTP matches
    if stored_data['otp'] != otp:
        return False

    # Mark as verified
    stored_data['verified'] = True
    return True

def is_phone_verified(phone: str) -> bool:
    """Check if phone number has been verified"""
    if phone not in otp_storage:
        return False
    return otp_storage[phone].get('verified', False)

def clear_otp(phone: str) -> None:
    """Clear OTP data for a phone number"""
    if phone in otp_storage:
        del otp_storage[phone]

def send_otp_sms(phone: str, otp: str) -> bool:
    """
    Send OTP via SMS
    - Development mode: Prints to console
    - Production mode: Sends via MSG91 (when configured)
    """
    # Check if MSG91 is configured
    if settings.MSG91_AUTH_KEY and settings.MSG91_SENDER_ID and settings.MSG91_TEMPLATE_ID:
        return _send_via_msg91(phone, otp)
    else:
        # Development mode: print OTP to console
        return _send_via_console(phone, otp)


def _send_via_console(phone: str, otp: str) -> bool:
    """Print OTP to console (for development/testing)"""
    print(f"\n{'='*50}")
    print(f"📱 OTP for {phone}: {otp}")
    print(f"⏰ Valid for {settings.OTP_EXPIRY_MINUTES} minutes")
    print(f"{'='*50}\n")
    return True


def _send_via_msg91(phone: str, otp: str) -> bool:
    """
    Send OTP via MSG91 SMS Gateway
    Documentation: https://docs.msg91.com/p/tf9GTextN/e/bklUvvZi0/MSG91
    """
    try:
        import requests

        # MSG91 SendOTP API endpoint
        url = "https://control.msg91.com/api/v5/otp"

        # Prepare headers
        headers = {
            "authkey": settings.MSG91_AUTH_KEY,
            "content-type": "application/json"
        }

        # Prepare payload
        payload = {
            "template_id": settings.MSG91_TEMPLATE_ID,
            "mobile": phone,
            "authkey": settings.MSG91_AUTH_KEY,
            "otp": otp,
            "otp_length": settings.OTP_LENGTH,
            "otp_expiry": settings.OTP_EXPIRY_MINUTES
        }

        # Send request
        response = requests.post(url, json=payload, headers=headers, timeout=10)

        # Check response
        if response.status_code == 200:
            result = response.json()
            if result.get("type") == "success":
                print(f"✅ OTP sent successfully to {phone} via MSG91")
                return True
            else:
                print(f"❌ MSG91 API Error: {result}")
                return False
        else:
            print(f"❌ MSG91 HTTP Error {response.status_code}: {response.text}")
            return False

    except ImportError:
        print("❌ 'requests' library not installed. Run: pip install requests")
        return False
    except Exception as e:
        print(f"❌ Error sending OTP via MSG91: {str(e)}")
        return False
