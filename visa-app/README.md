# Visa & Recruitment Management System

A complete visa and recruitment management system built with **Next.js 14**, **Tailwind CSS**, and **Supabase**.

## Features

### Dashboard
- Total Clients, Pending, Approval Pending, Approved, Visa Issued, Rejected counts
- Total Advance Payment, Due Payment, Total Payment, Balance
- Visual charts for status distribution and monthly trends

### Client Management
- Add/Edit/Delete clients
- Automatic Application ID generation
- Search by Name, Passport, Agency, Country
- Filter by Application Status
- View client details

### Agency Management
- Add/Edit/Delete agencies
- Track cases per agency (pending, approved, completed)
- Agency dropdown in client form

### Payment System
- Automatic Total Payment = Advance + Due
- Balance = Due Payment
- Payment reports with filters

### Other Features
- Follow-up date tracking
- Excel export
- Database backup/restore (JSON)
- Advanced search
- Reports with charts
- Job categories & Visa types management
- Secure single admin login
- Mobile responsive design

## Setup

### 1. Install Dependencies
```bash
cd visa-app
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Run the SQL from `supabase-schema.sql` in the Supabase SQL Editor
3. Go to Authentication > Providers > Email > Disable "Confirm email"
4. Copy your Supabase URL and anon key

### 3. Configure Environment Variables

Create `.env.local` in the `visa-app` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000/login`

## Default Login
- **Username:** admin
- **Password:** admin123

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Charts:** Recharts
- **Export:** XLSX

## Project Structure
```
src/
├── app/
│   ├── api/auth/          # Auth API
│   ├── dashboard/         # Dashboard page
│   ├── clients/           # Client list
│   ├── add-client/        # Add/Edit client
│   ├── agencies/          # Agency management
│   ├── payments/          # Payment reports
│   ├── follow-up/         # Follow-up tracking
│   ├── reports/           # Analytics
│   ├── search/            # Advanced search
│   ├── export/            # Excel export
│   ├── backup/            # Database backup
│   ├── settings/          # Settings
│   ├── login/             # Login page
│   ├── job-categories/    # Job categories
│   └── visa-types/        # Visa types
├── components/
│   └── AdminLayout.tsx    # Admin layout with sidebar
├── lib/
│   ├── supabase.ts        # Supabase client
│   └── store.ts           # Data management
└── styles/
    └── globals.css        # Global styles
```

## Deployment

Deploy to **Vercel** (free):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or use any other hosting that supports Next.js.

## License
MIT
