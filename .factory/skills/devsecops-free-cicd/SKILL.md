---
name: devsecops-free-cicd
description: "Find free CI/CD pipelines, build systems, and artifact repositories for DevSecOps workflows"
---

# Skill: DevSecOps Free CI/CD

## Goal
Identify free CI/CD services, build systems, and artifact repositories suitable for development and security pipelines.

## Use This Skill When
- Setting up build pipelines without infrastructure costs
- Comparing CI/CD platform free tiers
- Needing secure artifact storage on free tiers

## Do Not Use This Skill When
- Large enterprise CI/CD with many concurrent jobs
- Self-hosted runner requirements

## Inputs
- Build complexity (language, build time)
- Concurrent job requirements
- Artifact storage needs
- Integration requirements (SCM, deployment targets)

## Steps

1. **Inventory CI/CD Services**

   - **GitHub Actions**
     - Free: Unlimited minutes for public repos
     - Free: 2000 minutes/month for private repos
     - Free: 500MB artifact storage
     - Self-hosted runners: Unlimited free

   - **GitLab CI/CD**
     - Free: 400 CI minutes/month (private repos)
     - Free: 50K CI minutes/month shared runners
     - Free: Public repos unlimited
     - Self-hosted runners: Free unlimited

   - **Azure Pipelines**
     - Free: 1800 minutes/month (Microsoft-hosted)
     - Free: Unlimited minutes (self-hosted)
     - Free: 1 parallel job

   - **Bitbucket Pipelines**
     - Free: 50 minutes/month (small team)
     - Free: Unlimited for public repos

   - **CircleCI**
     - Free: 6000 build credits/month
     - Free: 1 container, 1 concurrent job

   - **Travis CI**
     - Free: Unlimited for public repos
     - Free: 1000 minutes/month private repos

   - **Drone Cloud**
     - Free: Unlimited for open source
     - Community edition for self-hosted

2. **Inventory Build Services**

   - **Cloud Build (GCP)**
     - 120 build-minutes/day free

   - **AWS CodeBuild**
     - 100 build-minutes/month free

   - **GitHub Codespaces**
     - 60 hours/month free (user)

3. **Inventory Artifact Repositories**

   - **GitHub Packages**
     - Free: 500MB storage for public repos
     - Docker/ npm/ Maven/ NuGet registries

   - **GitLab Container Registry**
     - Free: 10GB storage
     - Integrated Docker registry

   - **GitHub Container Registry**
     - Free: 500MB storage (public repos)
     - Integrated with Actions

   - **Docker Hub**
     - Free: 1 private repo
     - Free: Unlimited public repos
     - 200 pulls/6 hours (rate limited)

   - **Quay.io**
     - Free: Unlimited public repos
     - Vulnerability scanning

   - **JFrog Artifactory (Cloud)**
     - Free tier available for small teams

4. **Security Scanner Integration**
   - GitHub Advanced Security (public repos free)
   - SonarCloud (public repos free)
   - Snyk (limited free tier)
   - Dependabot (free)
   - CodeQL (free for public repos)

## Output
- CI/CD platform comparison matrix
- Build time and concurrency limits
- Artifact repository recommendations
- Security scanner integration options

## Key Considerations
- GitHub Actions best for GitHub-hosted projects
- GitLab CI/CD best integrated all-in-one
- Self-hosted runners bypass minute limits
- Public repos often have unlimited CI time