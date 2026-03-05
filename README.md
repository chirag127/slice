# Slice - Commission Management

A zero-cost, serverless, production-ready alternative to enterprise commission software. Slice processes complex deterministic commission math entirely in the client-side browser, bypassing any backend servers or serverless functions for the calculation engine.

## Features

- **Client-Side Commission Engine**: All tier checking, percentage calculations, and clawback deductions happen in React
- **Self-Signup with Admin Approval**: Users sign up and await admin approval
- **Role-Based Access Control**: Admins manage users, plans, and transactions
- **CSV Import**: Bulk upload transactions via CSV
- **Automated Clawback Handling**: Refunded deals automatically deduct from rep payouts
- **PWA Support**: Installable as a native app
- **100% Light Mode**: Clean, high-density data interface

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Light mode only)
- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **Database**: Firebase Firestore (Spark Free Tier)
- **Hosting**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Firestore and Authentication enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/chirag127/slice.git
cd slice

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_PUBLIC_FIREBASE_API_KEY=your_api_key
VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Firestore Schema

### users
```json
{
  "uid": "string",
  "email": "string",
  "role": "admin | manager | rep | pending",
  "plan_id": "string",
  "status": "active | pending | suspended"
}
```

### commission_plans
```json
{
  "plan_id": "string",
  "name": "string",
  "base_rate": "number",
  "is_cumulative": "boolean",
  "tiers": [
    { "threshold": 0, "rate": 5 },
    { "threshold": 50000, "rate": 10 },
    { "threshold": 100000, "rate": 15 }
  ],
  "quota": "number",
  "accelerator_rate": "number"
}
```

### transactions
```json
{
  "transaction_id": "string",
  "rep_id": "string",
  "amount": "number",
  "type": "sale | clawback | bonus | adjustment",
  "date": "ISO string",
  "description": "string"
}
```

### payouts
```json
{
  "payout_id": "string",
  "rep_id": "string",
  "cycle_month": "string",
  "total_gross": "number",
  "total_commission": "number",
  "status": "pending | paid"
}
```

## Security Rules

The application uses Firestore Security Rules for all access control. See [`firestore.rules`](firestore.rules) for the complete RBAC configuration.

## Deployment

### Cloudflare Pages

```bash
# Install wrangler
npm install -D wrangler

# Build the application
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

## License

MIT License - Part of the Oriz Suite Applications.

---

Built with ❤️ using React, Firebase, and Cloudflare
