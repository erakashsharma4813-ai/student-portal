# SMS Integration Guide - MSG91

This guide explains how to integrate MSG91 for OTP SMS verification.

## Prerequisites

1. **MSG91 Account**
   - Sign up at https://msg91.com
   - Complete KYC verification (Aadhhar, PAN, business docs)
   - Add credits to your account

2. **Required Credentials**
   - Authentication Key (API Key)
   - Sender ID (6-character alphanumeric, e.g., "STUAPP")
   - Template ID (pre-approved OTP template)

## Setup Steps

### 1. Create OTP Template in MSG91

1. Log in to MSG91 dashboard
2. Go to "SMS" > "Templates"
3. Create a new template:
   ```
   Your verification code is ##OTP##. Valid for ##EXPIRY## minutes. - ##SENDER_ID##
   ```
4. Submit for approval (takes 2-4 hours)
5. Note down the Template ID once approved

### 2. Get Authentication Key

1. Go to MSG91 Dashboard
2. Navigate to "API" section
3. Copy your Authentication Key (authkey)

### 3. Configure Environment Variables

Update your `.env` file:

```env
# Enable OTP verification
ENABLE_OTP_VERIFICATION=true

# OTP Settings
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6

# MSG91 Configuration
MSG91_AUTH_KEY=your-authentication-key-here
MSG91_SENDER_ID=STUAPP
MSG91_TEMPLATE_ID=your-template-id-here
MSG91_ROUTE=4
```

### 4. Install Required Package

The MSG91 integration uses the `requests` library:

```bash
pip install requests
```

### 5. Test the Integration

1. Start your backend server
2. Try registering a new user
3. Check the console/logs for success messages
4. Verify you receive the OTP on your phone

## MSG91 Pricing

### Trial Account
- **Free Credits**: ₹20-50 (approximately 50-125 SMS)
- **Daily Limit**: 100-200 SMS/day
- **Restrictions**: May require phone number verification

### Production Pricing
- **Transactional SMS**: ₹0.15-0.40 per SMS
- **OTP Route**: ₹0.20-0.30 per SMS
- **Bulk Packages**: ₹0.10-0.25 per SMS (better rates)

### Recharge Options
- Minimum recharge: ₹500
- Available in packages: ₹500, ₹1000, ₹5000, ₹10000+
- Custom enterprise plans available

## Phone Number Format

MSG91 accepts:
- Indian numbers: `9876543210` or `+919876543210`
- International: `+{country_code}{number}`

The system automatically handles both formats.

## Troubleshooting

### OTP Not Received
1. Check MSG91 dashboard for delivery status
2. Verify template is approved
3. Check if number is in DND (Do Not Disturb) list
4. Verify sufficient credits in account

### API Errors
- **401 Unauthorized**: Check AUTH_KEY
- **403 Forbidden**: Template not approved or inactive
- **422 Invalid Number**: Check phone number format
- **429 Rate Limit**: Too many requests, wait and retry

### Console Mode (Development)
If MSG91 is not configured, the system automatically falls back to console mode:
- OTP is printed in terminal
- No SMS is sent
- Useful for local development/testing

## Alternative SMS Providers

If MSG91 doesn't work for you, consider:

1. **Twilio** (International)
   - $15 free credit (~500 SMS)
   - Better international coverage
   - More expensive for India (₹0.50-1.00 per SMS)

2. **AWS SNS** (Amazon)
   - 100 free SMS/month for 12 months
   - Good reliability
   - Requires AWS account

3. **2Factor.in** (India)
   - Similar pricing to MSG91
   - Good for Indian market

## Security Best Practices

1. **Never commit credentials**
   - Keep `.env` in `.gitignore`
   - Use environment variables only

2. **Rate Limiting**
   - Implement rate limits on OTP requests
   - Max 3-5 OTP attempts per phone/hour

3. **OTP Expiry**
   - Keep it short (5-10 minutes)
   - Clear expired OTPs regularly

4. **Phone Validation**
   - Validate phone format before sending
   - Check for duplicate requests

## Production Deployment

Before going live:

1. ✅ Get MSG91 account fully verified (KYC)
2. ✅ Approve OTP template
3. ✅ Add sufficient credits (recommended: ₹1000+ to start)
4. ✅ Set `ENABLE_OTP_VERIFICATION=true`
5. ✅ Test with real phone numbers
6. ✅ Monitor delivery rates in MSG91 dashboard
7. ✅ Set up alerts for low credit balance

## Support

- MSG91 Support: support@msg91.com
- MSG91 Docs: https://docs.msg91.com
- Project Issues: Check your project's issue tracker
