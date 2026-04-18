---
name: devsecops-free-cloud
description: "Discover free IaaS/PaaS compute, storage, and networking from major cloud providers"
---

# Skill: DevSecOps Free Cloud

## Goal
Identify and catalog free tier cloud compute, storage, and networking offerings suitable for DevSecOps infrastructure.

## Use This Skill When
- Planning cloud infrastructure with zero budget
- Comparing free tiers across GCP, AWS, Azure, Oracle Cloud, IBM Cloud
- Setting up development/test environments at no cost

## Do Not Use This Skill When
- Production workloads requiring SLAs
- Enterprise compliance requirements

## Inputs
- Compute requirements (vCPU, RAM, hours/month)
- Storage requirements (GB, IOPS)
- Network requirements (bandwidth, regions)

## Steps

1. **Inventory Major Cloud Free Tiers**

   - **Google Cloud Platform (GCP)**
     - Compute: 1 e2-micro instance (certain regions only)
     - Storage: 5GB Cloud Storage, 30GB HDD
     - Cloud Run: 2M requests/month
     - Cloud Functions: 2M invocations/month
     - BigQuery: 1TB queries/month, 10GB storage
     - GKE: 1 zonal cluster free (nodes charged)

   - **Amazon Web Services (AWS)**
     - EC2: 750 hours/month t2/t3.micro (12 months)
     - Lambda: 1M requests/month (forever)
     - S3: 5GB storage (12 months)
     - DynamoDB: 25GB NoSQL (forever)
     - CloudFront: 1TB egress/month (forever)
     - CodeBuild: 100 build-minutes/month

   - **Microsoft Azure**
     - VMs: 1 B1S Linux/Windows (12 months)
     - Functions: 1M requests/month (forever)
     - Cosmos DB: 25GB, 1000 RUs
     - App Service: 10 apps (60 CPU-min/day)
     - Azure DevOps: 5 users, unlimited repos
     - Static Web Apps: free tier with auth

   - **Oracle Cloud**
     - Compute: 2 AMD VMs (1/8 OCPU, 1GB), 4 Arm cores/24GB
     - Storage: 200GB block, 10GB object
     - Bandwidth: 10TB egress/month
     - Always Free (no time limit)

   - **IBM Cloud**
     - Cloudant: 1GB NoSQL
     - Db2: 100MB
     - API Connect: 50K calls/month
     - Log Analysis: 500MB/day

   - **Cloudflare**
     - Workers: 100K requests/day
     - Pages: 500 builds/month, unlimited static
     - R2: 10GB storage, 1M Class A ops, 10M Class B ops
     - D1: 5M rows read/day, 100K writes/day

2. **Document Limitations**
   - Credit card requirements for signup
   - Region restrictions (GCP e2-micro limited regions)
   - Time limits (12-month trials vs forever free)
   - Idle instance reclamation (Oracle Cloud)

3. **Compare for Use Case**
   - Development vs staging environments
   - CI/CD runners
   - Database hosting
   - Static site hosting

## Output
- Comparison table of free cloud resources
- Service selection recommendations
- Limitations and caveats

## Key Considerations
- Oracle Cloud offers the most generous "always free" tier
- AWS/Azure free tiers expire after 12 months
- GCP free tier has regional restrictions
- Cloudflare excellent for edge compute/CDN