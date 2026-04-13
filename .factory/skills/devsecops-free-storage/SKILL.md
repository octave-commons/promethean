---
name: devsecops-free-storage
description: "Find free object storage, databases, and file hosting for DevSecOps infrastructure"
---

# Skill: DevSecOps Free Storage

## Goal
Identify free object storage, database services, and file hosting suitable for DevSecOps pipelines and infrastructure.

## Use This Skill When
- Setting up data storage at zero cost
- Finding free database tiers for development
- Need artifact or backup storage without infrastructure

## Do Not Use This Skill When
- Production data with SLA requirements
- Large-scale data workloads

## Inputs
- Storage type (object, block, database)
- Data volume requirements
- Query/access patterns
- Backup requirements

## Steps

1. **Inventory Object Storage**

   - **AWS S3**
     - Free: 5GB storage (12 months)
     - Free: 20K GET, 2K PUT requests

   - **Google Cloud Storage**
     - Free: 5GB storage
     - Free: 1GB egress/month

   - **Azure Blob Storage**
     - Free: 5GB LRS (12 months)

   - **Cloudflare R2**
     - Free: 10GB storage
     - Free: 1M Class A ops, 10M Class B ops
     - No egress fees

   - **Backblaze B2**
     - Free: 10GB storage
     - Free: 1GB/day download

   - **Wasabi**
     - No free tier
     - Low-cost storage

   - **Supabase Storage**
     - Free: 1GB storage
     - Auth integration

   - **Firebase Storage**
     - Free: 5GB storage
     - Free: 1GB/day download

2. **Inventory Databases**

   - **PostgreSQL**
     - **Supabase**: Free 500MB Postgres
     - **Neon**: Free 0.5GB Postgres
     - **Railway**: Free $5 credit/month
     - **Render**: Free tier Postgres
     - **ElephantSQL**: Free 20MB (discontinued)

   - **MySQL/MariaDB**
     - **PlanetScale**: Free 1 branch, 1B rows read/month
     - **Railway**: Free tier MySQL

   - **MongoDB**
     - **MongoDB Atlas**: Free 512MB
     - **Free tier:** M0 cluster, no credit card
     - Shared cluster, 1GB

   - **Redis**
     - **Upstash**: Free 256MB, 10K commands/day
     - **Railway**: Free tier Redis

   - **SQLite/Serverless**
     - **Turso**: Free libSQL platform
     - **Cloudflare D1**: Free 5M rows/day read

   - **Graph Database**
     - **Neo4j Aura**: Free tier available

   - **Key-Value**
     - **Cloudflare KV**: Free 100K reads/day
     - **Upstash Redis**: Free tier

3. **Inventory Block Storage**

   - **AWS EBS**
     - Free: 30GB/month (12 months)

   - **GCP Persistent Disk**
     - Free: 30GB HDD

   - **Azure Disk Storage**
     - Free: 2 x 64GB (12 months)

4. **Inventory Relational/Analytics**

   - **BigQuery**
     - Free: 1TB queries/month
     - Free: 10GB storage

   - **Snowflake**
     - Free: 30-day trial
     - Free tier limited

   - **Databricks Community**
     - Free community edition

5. **Inventory File/Backup Storage**

   - **GitHub Releases**
     - Free: 2GB per file
     - Unlimited artifacts for public repos

   - **GitLab Package Registry**
     - Free: 10GB storage
     - Package hosting

   - **Google Drive**
     - Free: 15GB personal storage
     - API access for automation

   - **Dropbox**
     - Free: 2GB storage
     - API access

## Output
- Storage provider comparison by type
- Volume and operation limits
- Database tier comparison
- Recommendations by use case

## Key Considerations
- Cloudflare R2 has no egress fees
- Free database tiers often have sleep policies
- MongoDB Atlas requires no credit card
- Supabase provides generous Postgres free tier
- Object storage egress costs can surprise - prefer R2/local zones