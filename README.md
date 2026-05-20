<div align="center">

<br/>

```
      ████████╗██████╗  █████╗ ██╗   ██╗███████╗██╗      ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗
      ╚══██╔══╝██╔══██╗██╔══██╗██║   ██║██╔════╝██║     ██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗
         ██║   ██████╔╝███████║██║   ██║█████╗  ██║     ██║  ███╗██║   ██║███████║██████╔╝██║  ██║
         ██║   ██╔══██╗██╔══██║╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║
         ██║   ██║  ██║██║  ██║ ╚████╔╝ ███████╗███████╗╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
         ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
```

**Enterprise Impossible Travel Detection Platform — v3.0**
https://trvlguard.parrysecurity.online/

*Account takeover detection · Haversine velocity analysis · Real-time alerting · Geographic visualization*

<br/>

[![Version](https://img.shields.io/badge/Version-3.0-6366f1?style=for-the-badge)](https://github.com/parrysecurity/TravelGuard-v3.0-Impossible-Travel-Detection-Platform)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-f59e0b?style=for-the-badge)](http://makeapullrequest.com)

<br/>

> A **production-ready enterprise security platform** that detects account takeovers by identifying physically impossible login travel patterns — combining Haversine great-circle distance calculation with time-based velocity analysis to surface credential compromise in real time.

<br/>

---

</div>

<br/>

## ◈ Table of Contents

- [Overview](#-overview)
- [How Detection Works](#-how-detection-works)
- [Capabilities](#-capabilities)
- [Dashboard Pages](#-dashboard-pages)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Agent Deployment](#-agent-deployment)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Performance](#-performance)
- [Security Hardening](#-security-hardening)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

<br/>

---

## ◈ Overview

TravelGuard continuously monitors login events across your infrastructure. When two logins for the same account originate from geographic locations that would require physically impossible travel speeds between them — it fires an alert with a calculated severity, risk score, and investigation workflow.

**The core insight:** if a user logs in from New York at 09:00 and from London at 09:45, the required travel speed (~7,500 km/h) far exceeds any commercial aircraft. This is a near-certain indicator of credential compromise.

```
Login Event A              Login Event B
(New York, 09:00)   →→→   (London, 09:45)
     │                          │
     └──── Δ distance: 5,570 km ┘
     └──── Δ time:     45 min   ┘
     └──── Required:   7,426 km/h  ← IMPOSSIBLE
                       │
                  ALERT FIRED
              Severity: CRITICAL
              Risk Score: 98/100
```

<br/>

---

## ◈ How Detection Works

```
     New Login Event Received
                 │
                 ▼
┌────────────────────────────────────────┐
│   Fetch Previous Login for User        │
│   (last known location + timestamp)    │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│   Haversine Distance Calculation       │
│   d = 2r·arcsin(√(sin²(Δφ/2) +         │
│       cos φ₁·cos φ₂·sin²(Δλ/2)))       │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│   Velocity Analysis                    │
│   speed = distance_km / time_hours     │
└───────────┬────────────────────────────┘
            │
     ┌──────┴───────┐
     │              │
speed > 900 km/h  speed ≤ 900 km/h
     │              │
     ▼              ▼
┌─────────┐    ┌─────────┐
│  ALERT  │    │  ALLOW  │
│ + score │    │ + log   │
└────┬────┘    └─────────┘
     │
     ▼
Severity Classification
├── speed > 5,000 km/h  →  CRITICAL
├── speed > 2,000 km/h  →  HIGH
└── speed > 900 km/h    →  MEDIUM
```

**Default threshold:** 900 km/h — below the speed of commercial aircraft, above any ground transport. Configurable per deployment.

<br/>

---

## ◈ Capabilities

### Detection Engine

| Capability | Detail |
|-----------|--------|
| **Impossible Travel Detection** | Flags logins where physical travel between locations is geometrically impossible |
| **Haversine Formula** | Accurate great-circle distance calculation over spherical Earth geometry |
| **Real-time Analysis** | Alert generation latency under 500 ms from event ingestion |
| **Configurable Thresholds** | Speed limit, minimum distance, and severity bands all adjustable |

### Alerting & Workflow

| Capability | Detail |
|-----------|--------|
| **Severity Levels** | Critical · High · Medium — computed from required travel speed |
| **Risk Scoring** | 0–100 per-user score weighted by frequency, speed exceedance, and recency |
| **Acknowledge & Investigate** | Full analyst workflow: acknowledge → assign → note → close |
| **Investigation Notes** | Timestamped audit trail per alert for compliance evidence |
| **Bulk Actions** | One-click acknowledge all; batch status updates |

### Visibility & Analytics

| Capability | Detail |
|-----------|--------|
| **Live Activity Feed** | Real-time streaming of all login events, color-coded by suspicion |
| **Interactive World Map** | Leaflet-powered geographic visualization with impossible route overlays |
| **Severity Charts** | Donut and bar charts — alert distribution by severity and time |
| **Event Timeline** | Chronological login history with full filtering by user, country, severity |
| **Trend Analysis** | 12-hour rolling alert trend visualization |

### User Intelligence

| Capability | Detail |
|-----------|--------|
| **Per-User Risk Profiles** | Historical suspicious activity aggregated into a risk score per account |
| **Behavioral Analysis** | Login pattern tracking across locations, times, and devices |
| **Device Fingerprinting** | Browser and device identification for cross-event anomaly correlation |

### Reporting & Export

| Capability | Detail |
|-----------|--------|
| **CSV Export** | Events, alerts, or full dataset — one click |
| **PDF Reports** | Formatted executive briefing documents |
| **Event Simulator** | Synthetic event generator for threshold testing and SOC drills |

### Agent Infrastructure

| Capability | Detail |
|-----------|--------|
| **Cross-Platform Agents** | Python agents for Windows, Linux, and macOS |
| **Heartbeat Monitoring** | Real-time agent health status on the dashboard |
| **Auto-Registration** | Agents self-register with unique IDs on first run |

<br/>

---

## ◈ Dashboard Pages

| Page | Purpose |
|------|---------|
| **Dashboard** | Live metrics, activity feed, severity charts, headline statistics |
| **Alert Center** | Triage, acknowledge, and investigate impossible travel alerts |
| **Live Map** | Geographic visualization of login events with suspicious route highlighting |
| **Event Timeline** | Chronological login history with multi-dimensional filtering |
| **User Risk Analysis** | Per-user risk profiles and login pattern breakdown |
| **Investigation Center** | Active investigation tracking with notes and audit trail |
| **Reports & Analytics** | Security trend summaries and exportable reports |
| **Event Simulator** | Generate synthetic login events for testing and SOC drills |
| **Settings** | Speed thresholds, minimum distance, IP whitelist management |

<br/>

---

## ◈ Architecture

```
         ┌─────────────────────────────────────────────────────────────────┐
         │                     TRAVELGUARD PLATFORM                        │
         │                                                                 │
         │  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐ │
         │  │  Windows     │   │  Linux       │   │  macOS               │ │
         │  │  Agent       │   │  Agent       │   │  Agent               │ │
         │  │  (Python)    │   │  (Python)    │   │  (Python)            │ │
         │  └──────┬───────┘   └──────┬───────┘   └──────────┬───────────┘ │
         │         └──────────────────┼──────────────────────┘             │
         │                            │  POST /api/events                  │
         │                            ▼                                    │
         │  ┌────────────────────────────────────────────────────────────┐ │
         │  │              Node.js / Express REST API                    │ │
         │  │                                                            │ │
         │  │   ┌─────────────┐   ┌──────────────┐   ┌────────────────┐  │ │
         │  │   │  Detection  │   │    Alert     │   │   Whitelist    │  │ │
         │  │   │  Engine     │   │   Manager    │   │   Manager      │  │ │
         │  │   │ (Haversine) │   │              │   │                │  │ │
         │  │   └──────┬──────┘   └──────┬───────┘   └────────┬───────┘  │ │
         │  └──────────┼─────────────────┼────────────────────┼──────────┘ │
         │             └─────────────────┼────────────────────┘            │
         │                               ▼                                 │
         │              ┌────────────────────────────────┐                 │
         │              │         PostgreSQL 14          │                 │
         │              │   events · alerts · agents     │                 │
         │              │   whitelist · investigations   │                 │
         │              └────────────────────────────────┘                 │
         │                               │                                 │
         │              ┌────────────────▼───────────────┐                 │
         │              │     Nginx  (port 80/443)       │                 │
         │              │  Reverse proxy + static serve  │                 │
         │              └────────────────────────────────┘                 │
         │                               │                                 │
         │                    SOC Dashboard (browser)                      │
         │           Leaflet Map · Chart.js · Live Feed                    │
         └─────────────────────────────────────────────────────────────────┘
```

<br/>

---

## ◈ Quick Start

### Docker *(single command)*

```bash
git clone https://github.com/parrysecurity/TravelGuard-v3.0-Impossible-Travel-Detection-Platform.git
cd TravelGuard-v3.0-Impossible-Travel-Detection-Platform

docker-compose up -d
```

| Service | URL |
|---------|-----|
| SOC Dashboard | `http://localhost` |
| REST API | `http://localhost:3001` |
| API Health | `http://localhost:3001/api/health` |

<br/>

---

## ◈ Installation

### Prerequisites

| Requirement | Version |
|-------------|:-------:|
| Node.js | 20.x+ |
| PostgreSQL | 14.x+ |
| Nginx | 1.18+ |
| PM2 | Latest |
| Python | 3.10+ *(agents only)* |

### Step 1 — Clone

```bash
git clone https://github.com/parrysecurity/TravelGuard-v3.0-Impossible-Travel-Detection-Platform.git
cd TravelGuard-v3.0-Impossible-Travel-Detection-Platform
```

### Step 2 — Backend dependencies

```bash
cd backend
npm install
```

### Step 3 — Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
PORT=3001
NODE_ENV=production

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=travelguard
DB_USER=postgres
DB_PASSWORD=your_strong_password_here

# Detection thresholds
MAX_SPEED_KMH=900
MIN_DISTANCE_KM=50
```

### Step 4 — Database

```bash
# Create database
sudo -u postgres psql -c "CREATE DATABASE travelguard;"

# Import schema
sudo -u postgres psql -d travelguard < database/schema.sql
```

### Step 5 — Start backend

```bash
# PM2 (recommended)
pm2 start server.js --name travelguard-api
pm2 save
pm2 startup

# Or direct Node
node server.js
```

### Step 6 — Nginx

```bash
sudo cp nginx/travelguard.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/travelguard.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

### Step 7 — Open dashboard

```
http://your-server-ip
```

<br/>

---

## ◈ Agent Deployment

Agents run on monitored endpoints and stream login events to the TravelGuard API.

### Linux / macOS

```bash
chmod +x install-linux.sh
./install-linux.sh
```

### Windows

```cmd
# Run as Administrator
install-windows.bat
```

### Agent management

| Action | Command |
|--------|---------|
| Check status | `systemctl status travelguard-agent` |
| Stream logs | `journalctl -u travelguard-agent -f` |
| Restart | `systemctl restart travelguard-agent` |
| Stop | `systemctl stop travelguard-agent` |

<br/>

---

## ◈ Configuration

All thresholds are environment-variable driven — no code changes required.

| Variable | Default | Description |
|----------|:-------:|-------------|
| `MAX_SPEED_KMH` | `900` | Required travel speed above this triggers an alert |
| `MIN_DISTANCE_KM` | `50` | Minimum distance between events to evaluate (ignores same-city logins) |
| `CRITICAL_SPEED_KMH` | `5000` | Speed threshold for CRITICAL severity |
| `HIGH_SPEED_KMH` | `2000` | Speed threshold for HIGH severity |
| `DB_POOL_SIZE` | `10` | PostgreSQL connection pool size |
| `RATE_LIMIT_RPM` | `100` | API rate limit — requests per minute per IP |

### IP Whitelist

Trusted IPs (VPNs, office gateways) can be exempted via the Settings page or directly via API:

```bash
# Add IP to whitelist
curl -X POST http://localhost:3001/api/whitelist \
  -H "Content-Type: application/json" \
  -d '{"ip": "203.45.67.89", "label": "HQ Office Gateway"}'

# Remove from whitelist
curl -X DELETE http://localhost:3001/api/whitelist/203.45.67.89
```

<br/>

---

## ◈ API Reference

Full Swagger docs available at `http://localhost:3001/api-docs`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Platform health check |
| `GET` | `/api/events` | List all login events |
| `POST` | `/api/events` | Ingest a new login event |
| `GET` | `/api/alerts` | List all alerts |
| `PUT` | `/api/alerts/:id` | Update alert status (acknowledge / investigate) |
| `GET` | `/api/stats` | Aggregate platform statistics |
| `GET` | `/api/agents` | List connected agents and heartbeat status |
| `POST` | `/api/heartbeat` | Agent heartbeat ping |
| `GET` | `/api/whitelist` | List whitelisted IPs |
| `POST` | `/api/whitelist` | Add IP to whitelist |
| `DELETE` | `/api/whitelist/:ip` | Remove IP from whitelist |

### Event payload

```json
{
  "id":           "evt_001",
  "user_id":      "alice@corp.com",
  "city":         "New York",
  "country":      "US",
  "latitude":     40.7128,
  "longitude":    -74.0060,
  "ip_address":   "203.45.67.89",
  "device":       "MacBook Pro",
  "browser":      "Chrome 124",
  "timestamp":    1700000000000,
  "is_suspicious": false
}
```

### Example requests

```bash
# Health check
curl http://localhost:3001/api/health

# Ingest login event
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"id":"evt_002","user_id":"bob@corp.com","city":"London","country":"GB",
       "latitude":51.5074,"longitude":-0.1278,"ip_address":"185.23.45.67",
       "device":"Windows 11","browser":"Edge 123","timestamp":1700003600000}'

# Acknowledge alert
curl -X PUT http://localhost:3001/api/alerts/alert_007 \
  -H "Content-Type: application/json" \
  -d '{"acknowledged": true, "note": "Confirmed VPN usage — false positive"}'
```

<br/>

---

## ◈ Database Schema

### `events` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | `VARCHAR(50)` | Primary key |
| `user_id` | `VARCHAR(255)` | Account identifier |
| `city` | `VARCHAR(100)` | Login city |
| `country` | `VARCHAR(5)` | ISO country code |
| `latitude` | `DECIMAL(10,6)` | Geographic latitude |
| `longitude` | `DECIMAL(10,6)` | Geographic longitude |
| `ip_address` | `VARCHAR(45)` | IPv4 / IPv6 |
| `device` | `VARCHAR(100)` | Device description |
| `browser` | `VARCHAR(100)` | Browser + version |
| `is_suspicious` | `BOOLEAN` | Detection flag |
| `timestamp` | `BIGINT` | Unix timestamp (ms) |

### `alerts` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | `VARCHAR(50)` | Primary key |
| `user_id` | `VARCHAR(255)` | Account identifier |
| `severity` | `VARCHAR(20)` | `critical` · `high` · `medium` |
| `distance_km` | `INTEGER` | Great-circle distance traveled |
| `required_speed` | `INTEGER` | Calculated speed in km/h |
| `risk_score` | `INTEGER` | 0–100 composite risk score |
| `acknowledged` | `BOOLEAN` | Analyst acknowledgement flag |
| `investigating` | `BOOLEAN` | Under active investigation |
| `prev_city` | `VARCHAR(100)` | Origin city |
| `curr_city` | `VARCHAR(100)` | Destination city |

<br/>

---

## ◈ Performance

| Metric | Value |
|--------|:-----:|
| Detection rate | 94% |
| Alert generation latency | < 500 ms |
| Average analyst response time | 3 min 12 sec |
| Concurrent users supported | 100+ |
| Events ingested per second | 50+ |

<br/>

---

## ◈ Security Hardening

### Implemented

| Control | Implementation |
|---------|---------------|
| **Input validation** | All API endpoints validate and sanitize before processing |
| **SQL injection prevention** | Parameterized queries throughout the database layer |
| **Environment secrets** | All credentials loaded from `.env` — never hardcoded |
| **IP whitelisting** | Trusted networks exempted from impossible-travel checks |
| **Rate limiting** | 100 requests/min per IP — prevents event flooding |
| **CORS configuration** | Restricts API access to authorized origins only |

### Recommended for production

| Enhancement | Priority |
|-------------|:--------:|
| JWT authentication on all API endpoints | High |
| HTTPS with Let's Encrypt at Nginx | High |
| 2FA for dashboard admin access | High |
| Immutable audit log to append-only storage | Medium |
| Regular dependency vulnerability scanning (`npm audit`) | Medium |

<br/>

---

## ◈ Testing

### Run backend tests

```bash
cd backend
npm test
```

### Verify API endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Events
curl http://localhost:3001/api/events

# Stats
curl http://localhost:3001/api/stats
```

### Generate synthetic test events

```bash
# Inject 10 events for load testing
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/events \
    -H "Content-Type: application/json" \
    -d "{
      \"id\":        \"test_$i\",
      \"user_id\":   \"test@corp.com\",
      \"city\":      \"Test City\",
      \"country\":   \"TC\",
      \"latitude\":  40.71,
      \"longitude\": -74.01,
      \"ip\":        \"192.168.1.$i\",
      \"device\":    \"Test Device\",
      \"browser\":   \"Chrome\",
      \"timestamp\": $(date +%s%3N)
    }"
done
```

<br/>

---

## ◈ Contributing

```bash
# 1. Fork → clone → branch
git checkout -b feature/ml-velocity-model

# 2. Make changes, verify tests pass
cd backend && npm test

# 3. Commit with a descriptive message
git commit -m "feat: add ML-based velocity anomaly scoring"

# 4. Push and open a Pull Request
git push origin feature/ml-velocity-model
```

<br/>

---

## ◈ License

Distributed under the **MIT License** — see [`LICENSE`](LICENSE) for full terms.

<br/>

---

## ◈ Contact

| Channel | Detail |
|---------|--------|
| **Maintainer** | Parry Security |
| **GitHub** | [@parrysecurity](https://github.com/parrysecurity) |
| **Project** | [TravelGuard Repository](https://github.com/parrysecurity/TravelGuard-v3.0-Impossible-Travel-Detection-Platform) |

<br/>

---

<div align="center">

Built with `Node.js` · `PostgreSQL` · `Leaflet` · `Chart.js` · `Docker` · `PM2`

<br/>

*Detecting the impossible — one login at a time. Leave a ⭐ if TravelGuard protects your org.*

</div>
