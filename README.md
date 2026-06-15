# Multi-Seller Marketplace

A full-featured marketplace where a single buyer order can span multiple sellers, with automatic payment splitting via Stripe Connect.

## Stack

- **Backend**: .NET 10 Web API (C#) — clean layered architecture
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL 16 (via EF Core + Npgsql)
- **Payments**: Stripe Connect (separate charges + transfers)

## Architecture

```
frontend/       Next.js — storefront (SSR) + seller/admin dashboards (CSR)
backend/
  src/
    Marketplace.Api             Controllers, middleware, DI, webhook endpoints
    Marketplace.Application     Services, DTOs, business logic
    Marketplace.Domain          Entities, enums, domain rules
    Marketplace.Infrastructure  EF Core DbContext, migrations, Stripe client
  tests/
    Marketplace.Tests           xUnit — checkout & payment split logic
docker-compose.yml              Local Postgres
```

## Key Design Decisions

**Order → SubOrder → OrderItem split**: One checkout creates one `Order`. That order splits into one `SubOrder` per seller involved. Money flows at the `SubOrder` level — each seller's payout is tracked independently with its own Stripe Transfer ID.

**Inventory locking**: Stock is decremented atomically at the DB level (`UPDATE ... WHERE stock >= qty`). Zero rows affected = out of stock. App-level "check then write" would oversell under load.

**Webhook idempotency**: Every Stripe webhook is logged to `WebhookEvents` with a unique index on `stripe_event_id`. Duplicate deliveries return 200 immediately without reprocessing.

**Price snapshots**: `unit_price_at_purchase` is captured on `OrderItem` at checkout time. Later price edits on products never affect historical orders.

**Sellers cannot sell until onboarded**: `payout_enabled = true` is only set after Stripe's `account.updated` webhook confirms KYC + banking are complete.

## Local Setup

### Prerequisites

- .NET 10 SDK
- Node.js 20+
- Docker Desktop

### 1. Start Postgres

```bash
docker compose up -d
```

### 2. Run API migrations

```bash
dotnet ef database update \
  --project backend/src/Marketplace.Infrastructure \
  --startup-project backend/src/Marketplace.Api
```

### 3. Start the API

```bash
cd backend/src/Marketplace.Api
dotnet run
# API: http://localhost:5000
# Health: http://localhost:5000/health
```

### 4. Start the frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your Stripe publishable key
npm install
npm run dev
# Frontend: http://localhost:3000
```

### 5. Stripe webhooks (local)

```bash
stripe listen --forward-to http://localhost:5000/webhooks/stripe
```

## Build Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | ✅ | Foundations — repo, API skeleton, DB, health check, Next.js |
| 1 | 🔄 | Auth — registration, login, JWT, roles |
| 2 | ⬜ | Catalog — products, variants, stock, categories |
| 3 | ⬜ | Storefront — SSR product pages, cart |
| 4 | ⬜ | Checkout & payments — Stripe Connect, splits, webhooks |
| 5 | ⬜ | Fulfillment — order history, SubOrder status |
| 6 | ⬜ | Admin dashboard, reviews, refunds |
| 7 | ⬜ | Deploy |

## Environment Variables

Copy `backend/src/Marketplace.Api/appsettings.json` values into environment-specific config or secrets. **Never commit real keys.**

| Variable | Purpose |
|----------|---------|
| `ConnectionStrings__DefaultConnection` | Postgres connection string |
| `Jwt__Key` | JWT signing secret (min 32 chars) |
| `Stripe__SecretKey` | Stripe secret key (`sk_test_...`) |
| `Stripe__WebhookSecret` | Stripe webhook signing secret |
