# W3 Social Frontend (Vite + React)

## Prerequisites

1. Node.js 18+
2. Backend Django API running locally

## Install

```bash
npm install
```

## Configure API Proxy (optional)

By default, Vite proxies `/api` and `/media` requests to `http://127.0.0.1:8000`.

If your backend uses a different port, set:

```bash
VITE_BACKEND_URL=http://127.0.0.1:8001
```

PowerShell example:

```powershell
$env:VITE_BACKEND_URL = "http://127.0.0.1:8001"
npm run dev
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```
