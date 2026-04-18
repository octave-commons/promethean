---
name: devsecops-free-auth
description: "Find free authentication, authorization, and identity services for DevSecOps applications"
---

# Skill: DevSecOps Free Auth

## Goal
Identify free authentication, authorization, and identity management services for DevSecOps applications and infrastructure.

## Use This Skill When
- Adding authentication to applications at zero cost
- Setting up SSO without enterprise tools
- Implementing identity management

## Do Not Use This Skill When
- Enterprise SSO with SAML for many users
- SOC2/HIPAA compliance requirements

## Inputs
- User count requirements
- SSO/identity provider requirements
- Social login needs
- API authentication needs

## Steps

1. **Inventory Authentication Platforms**

   - **Auth0**
     - Free: 7K MAU
     - Unlimited logins
     - Social connections
     - Passwordless auth

   - **Okta Developer Edition**
     - Free: 1000 MAU
     - SSO for up to 5 apps
     - API access

   - **Clerk**
     - Free: 10K MAU
     - Email/password, social login
     - MFA included

   - **Supabase Auth**
     - Free: 50K MAU
     - Row-level security
     - Social login

   - **Firebase Auth**
     - Free: Unlimited
     - Email/password, social
     - Phone auth (paid after threshold)

   - **AWS Cognito**
     - Free: 50K MAU
     - Unlimited users
     - SAML/Social login

   - **Keycloak**
     - Free, open source
     - Self-hosted identity management
     - SAML, OIDC, Social login

   - **ORY Kratos/Hydra**
     - Free, open source
     - Self-hosted identity system
     - OAuth2/OIDC server

   - **PocketBase**
     - Free, open source
     - Self-hosted backend
     - Auth included

   - **Appwrite**
     - Free, open source
     - Self-hosted BaaS
     - Auth included

2. **Inventory Passwordless/Auth Options**

   - **Magic.link**
     - Free: 10K MAU
     - Passwordless login

   - **Passkeys/WebAuthn**
     - Many providers support free
     - Biometrics-based

   - **OTP Services**
     - Built into most auth platforms
     - AWS SNS, Twilio Verify

3. **Inventory API Authentication**

   - **API Keys**
     - No cost (self-managed)
     - Simplest approach

   - **JWT**
     - No cost (self-managed)
     - Stateless authentication

   - **OAuth2**
     - Self-hosted Keycloak/Hydra
     - Auth0 free tier

4. **Inventory Single Sign-On**

   - **Keycloak**
     - Free, open source
     - SAML 2.0, OIDC
     - Self-hosted

   - **Authentik**
     - Free, open source
     - Self-hosted SSO
     - LDAP/OAuth/SAML

   - **Dex**
     - Free, open source
     - OIDC provider
     - Self-hosted

   - **Bunkum**
     - Free, open source
     - Self-hosted auth server

5. **Inventory Enterprise Identity**

   - **FreeIPA**
     - Free, open source
     - Self-hosted directory
     - Linux-based

   - **Zitadel**
     - Free, open source
     - Cloud-native IAM
     - Self-hosted option

6. **Inventory Secrets/Token Management**

   - **HashiCorp Vault**
     - Free, open source
     - Self-hosted secrets management
     - Identity integration

## Output
- Auth platform comparison
- MAU (Monthly Active User) limits
- SSO and social login support
- Self-hosted vs SaaS recommendations
- Integration complexity assessment

## Key Considerations
- Auth0 and Clerk have generous free tiers
- Self-hosted Keycloak eliminates usage limits
- Cognito free tier excellent for AWS integrations
- Firebase Auth very generous limits
- Consider data residency requirements