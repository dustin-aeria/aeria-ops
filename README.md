# Aeria Ops

RPAS Operations Management System for Aeria Solutions Ltd.

## Overview

Aeria Ops is a custom web application that integrates HSE (Health, Safety, and Environment) protocols with RPAS operational workflows. It replaces SiteDocs with a purpose-built system featuring:

- Unified Operations Plans with modular sections
- JARUS SORA 2.5 compliant risk assessment
- Offline-capable field forms
- AI-powered tailgate briefing generation
- Professional PDF exports

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Hosting:** Vercel
- **AI:** Claude API (for briefing generation)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/aeria-ops.git
cd aeria-ops

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your Firebase config to .env.local

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase configuration:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (auth, etc.)
├── hooks/          # Custom React hooks
├── lib/            # Utilities and Firebase config
├── pages/          # Page components
└── styles/         # Global styles
```

## License

Proprietary - Aeria Solutions Ltd.
