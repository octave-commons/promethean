---
name: devsecops-free-dns
description: "Find free DNS, CDN, SSL, and DDoS protection services for DevSecOps infrastructure"
---

# Skill: DevSecOps Free DNS

## Goal
Identify free DNS management, CDN, SSL/TLS, and DDoS protection services.

## Use This Skill When
- Setting up domain infrastructure at zero cost
- Adding CDN/SSL without infrastructure
- Implementing DDoS protection for free

## Do Not Use This Skill When
- Enterprise DNS with SLA requirements
- Complex DNS routing rules

## Inputs
- Domain count
- Traffic volume
- SSL certificate needs
- DDoS protection requirements

## Steps

1. **Inventory DNS Providers**

   - **Cloudflare DNS**
     - Free: Unlimited domains
     - Fast propagation
     - DNSSEC support
     - Proxy available

   - **Amazon Route 53**
     - Free: 12 months on new accounts (limited)
     - Otherwise paid

   - **Google Cloud DNS**
     - Free: 25GB egress (limited)

   - **Hurricane Electric**
     - Free secondary DNS
     - DNSSEC support

   - **DuckDNS**
     - Free dynamic DNS
     - Subdomain only

   - **No-IP**
     - Free dynamic DNS
     - 3 hostnames, 30-day confirm

   - **Afraid.org Free DNS**
     - Free DNS hosting
     - Dynamic DNS available

2. **Inventory CDN Services**

   - **Cloudflare CDN**
     - Free: Unlimited bandwidth
     - Global CDN
     - SSL included
     - DDoS protection included

   - **Fastly**
     - Free tier available
     - Edge computing

   - **jsDelivr**
     - Free CDN for npm/GitHub
     - Open source focused

   - **Statically.io**
     - Free CDN for GitHub/GitLab
     - Image optimization

   - **CDN77**
     - Free tier available

3. **Inventory SSL/TLS Providers**

   - **Cloudflare SSL**
     - Free Universal SSL
     - Works with proxy enabled
     - Edge certificates

   - **Let's Encrypt**
     - Free certificates
     - ACME automation
     - 90-day certs, auto-renew

   - **ZeroSSL**
     - Free 90-day certificates
     - Online tool + API

   - **Caddy Server**
     - Free, auto-HTTPS
     - Uses Let's Encrypt
     - Self-hosted

4. **Inventory DDoS Protection**

   - **Cloudflare**
     - Free DDoS protection at Layer 3/4/7
     - "I'm Under Attack" mode
     - Bot mitigation

   - **AWS Shield Standard**
     - Free for AWS customers
     - Network layer protection

   - **Google Cloud Armor**
     - Free DDoS for GCP
     - Layer 3/4 protection

5. **Inventory Web Application Firewall**

   - **Cloudflare WAF**
     - Free with proxy
     - OWASP core ruleset
     - Bot management

   - **AWS WAF**
     - Free tier not available
     - Paid service

## Output
- DNS provider comparison
- CDN feature matrix
- SSL automation options
- DDoS protection capabilities
- Integration recommendations

## Key Considerations
- Cloudflare DNS + CDN + SSL + DDoS is best all-in-one free solution
- Let's Encrypt for non-Cloudflare SSL
- Dynamic DNS for home lab setups
- Free tiers excellent for dev/test