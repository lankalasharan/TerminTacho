# Cloudflare DDoS Protection Setup

## ✅ Why This Matters
Cloudflare adds a global Anycast network in front of your app, mitigating L3/L4 DDoS attacks, blocking malicious bots, and providing WAF rules.

## ✅ Quick Setup (10–15 minutes)

1. **Create a Cloudflare account**
   - https://dash.cloudflare.com

2. **Add your domain**
   - Select the Free plan (good enough for DDoS protection).

3. **Update nameservers**
   - Cloudflare will give you 2 nameservers.
   - Update them at your domain registrar.

4. **Enable the proxy (orange cloud)**
   - In DNS settings, make sure your A/CNAME record is proxied.

5. **Turn on security essentials**
   - Security → Settings:
     - Set Security Level to **Medium** or **High**
     - Enable **Bot Fight Mode**
     - Enable **Browser Integrity Check**

6. **Optional: Add WAF rules**
   - Security → WAF → Custom Rules
   - Block suspicious paths or countries if needed.

7. **Verify your app still works**
   - Check pages and APIs respond normally.

## ✅ Recommended Later
- Enable **Rate Limiting** rules for public APIs
- Add **Page Rules** or **Cache Rules** for static content

---
If you want, tell me your domain and I can provide exact DNS entries and rules.

