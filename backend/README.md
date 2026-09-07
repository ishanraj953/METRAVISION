# METRA-X — Legal Metrology Compliance System (Backend API)

METRA-X is an autonomous, AI-driven Legal Metrology Compliance and Inspection System designed to detect, track, manage, and enforce legal metrology regulations across physical product packaging and digital e-commerce listings.

---

## 🏗️ Architecture & Orchestration Flow

```
Frontend ──> FastAPI Backend ──> AI Service ──> Rule Engine ──> Compliance
               │
               ├──> Evidence ──> Risk Intelligence ──> Database (PostgreSQL / SQLite)
               │
               └──> Digital Twin ──> History / Drift ──> Reports
```

---

## 🔑 Three Core User Roles & RBAC Security

1. **ADMIN (`ADMIN`)** — *GOVERN*
   - Dashboard, user management, system-wide analytics, compliance statistics, risk intelligence, repeat offenders, audit logs, executive report generation.
2. **SHOPKEEPER (`SHOPKEEPER`)** — *COMPLY*
   - Create products, upload package scans, view compliance status, view own violations, manage online listings, view compliance history & drift, generate shopkeeper reports.
   - *Security Rule Enforced:* Strict backend product ownership validation (`shopkeeper_id`). Shopkeepers can **NEVER** access another Shopkeeper's products.
3. **CHECKER (`CHECKER`)** — *ENFORCE*
   - View assigned & priority inspections, scan package labels, review evidence chain, confirm/reject/request manual review on AI-detected violations, generate checker inspection reports.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python `3.11+`
- PostgreSQL (or SQLite default fallback for instant zero-config setup)

### Setup & Virtual Environment

```bash
# Navigate to backend directory
cd C:\Users\vinit\Downloads\metra-x\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install required dependencies
pip install -r requirements.txt
```

---

## ⚙️ Environment Variables (`.env`)

Copy `.env.example` to `.env`:

```env
DATABASE_URL=sqlite:///./metrax.db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=metrax_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

JWT_SECRET_KEY=metrax-super-secret-jwt-key-2026-hackathon-spec
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

AI_SERVICE_URL=http://localhost:8000/mock-ai
RULE_ENGINE_URL=http://localhost:8000/mock-rules
```

---

## 🛠️ Database Setup, Migrations & Seeding

```bash
# Initialize DB tables & seed demo data
python seed.py

# Run Alembic Database Migrations
alembic upgrade head
```

---

## 🚀 Server Execution

```bash
# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc API Reference:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🧪 Automated Testing

```bash
# Run complete backend integration test suite
pytest tests/
```

---

## 👥 Demo Credentials

| Role | Email | Password | Scope |
|---|---|---|---|
| **ADMIN** | `admin@metrax.gov.in` | `Admin123!` | System-wide admin access |
| **SHOPKEEPER** | `shopkeeper@metrax.com` | `Shop123!` | Shopkeeper compliance portal |
| **CHECKER** | `checker@metrax.gov.in` | `Checker123!` | Enforcement & inspection officer |

---

## 📁 Storage Directory Structure

```
storage/
├── original/    # Original uploaded package images (Immutable Evidence)
├── processed/   # Enhanced image for OCR processing
└── annotated/   # Bounding box & region annotation overlays
```
