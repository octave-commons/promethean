---
name: devsecops-free-security
description: "Find free security tools: vulnerability scanners, SAST/DAST, secrets management, and PKI"
---

# Skill: DevSecOps Free Security

## Goal
Identify free security tools for DevSecOps: vulnerability scanning, SAST/DAST, secrets management, and PKI/certificates.

## Use This Skill When
- Building security into CI/CD pipelines at zero cost
- Setting up secrets management without enterprise tools
- Needing free SSL/TLS certificates

## Do Not Use This Skill When
- Enterprise compliance requirements (SOC2, PCI-DSS)
- Production secrets management at scale

## Inputs
- Security tool category (SAST, DAST, secrets, PKI)
- Language/technology stack
- Integration points (CI/CD, runtime)

## Steps

1. **Inventory SAST Tools (Static Analysis)**

   - **GitHub CodeQL**
     - Free for public repos
     - Supports many languages
     - Integrated with GitHub Actions

   - **SonarCloud**
     - Free for public repos
     - 15 languages supported
     - CI/CD integration

   - **Semgrep**
     - Free for small teams
     - Customizable rules
     - GitHub/GitLab integration

   - **ESLint (JS/TS)**
     - Open source, free
     - Extensive plugin ecosystem
     - Security plugins available

   - **Bandit (Python)**
     - Free, open source
     - Common security issues detection

   - **Safety (Python)**
     - Dependency vulnerability scanning
     - Free database access

2. **Inventory DAST Tools (Dynamic Analysis)**

   - **OWASP ZAP**
     - Free, open source
     - Automated scanning
     - CI/CD integration

   - **Nuclei**
     - Free, open source
     - Template-based scanning
     - Fast and extensible

   - **SSL Labs**
     - Free SSL/TLS assessment
     - Online tool + API

3. **Inventory Secrets Management**

   - **HashiCorp Vault**
     - Open source, self-hosted free
     - Cloud HSM integration

   - **Infisical**
     - Free for small teams
     - Open source
     - GitHub/GitLab integration

   - **Doppler**
     - Free for small teams (3 seats)
     - Secrets management platform

   - **1Password (Secrets Automation)**
     - Free for developers
     - GitHub Actions integration

   - **AWS Secrets Manager**
     - 30 secrets free for 1 year
     + Persecret/month after trial

   - **GitLab CI Variables**
     - Free with GitLab
     - Masked and protected variables

4. **Inventory PKI and Certificates**

   - **Let's Encrypt**
     - Free SSL/TLS certificates
     - Auto-renewal via certbot
     - Rate limits: 50 certificates/week per domain

   - **ZeroSSL**
     - Free 90-day certificates
     - 3 certificates per domain

   - **Cloudflare SSL**
     - Free Universal SSL
     - Works with Cloudflare proxy

   - **SSL For Free**
     - Free certificates via ACME
     - Multiple CA options

   - **Buypass**
     - Free SSL certificates
     - Norwegian CA

   - **DigiCert (Free Trial)**
     - Limited free trial

5. **Inventory Container Security**

   - **Trivy**
     - Free, open source
     - Container image scanning
     - CI/CD integration

   - **Clair**
     - Free, open source
     - Container vulnerability scanner

   - **Grype**
     - Free, open source
     - Syft-based SBOM scanning

   - **Docker Scout (via Docker Hub)**
     - Free vulnerability scanning
     - Integrated with Docker Hub

6. **Inventory Dependency Scanners**

   - **Dependabot**
     - Free on GitHub
     - Automated updates
     - Security alerts

   - **Snyk**
     - Free for small projects
     - Open source security
     - Container scanning

   - **WhiteSource Renovate**
     - Free for open source
     - Automated dependency updates

   - **OWASP Dependency-Check**
     - Free, open source
     - CVE database scanning

## Output
- Security tool comparison by category
- Integration recommendations for CI/CD
- Self-hosted vs SaaS trade-offs
- Certificate authority options

## Key Considerations
- Let's Encrypt is the gold standard for free SSL
- Self-hosted tools require infrastructure
- Free tiers often have usage limits
- Public repos get best free tool support