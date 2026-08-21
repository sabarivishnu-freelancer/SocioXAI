# SocioX AI

SocioX AI is an AI-assisted civic intelligence platform with citizen reporting, ward-scoped satellite maps, complaint tracking, department operations, and role-based administration.

## One-command demo setup

Requirements: Docker Desktop running and Node.js 20 or newer.

After downloading or cloning the project, open PowerShell in the project folder and run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-demo.ps1
```

This command starts PostgreSQL, waits for it to be ready, creates `.env.local`, installs dependencies, applies the database schema, creates demo accounts and sample data, and starts the Next.js frontend and backend at http://localhost:3000. It also binds the app to the local network and prints a Wi-Fi URL.

Demo password for all accounts: `Demo@12345`

| Role | Demo login |
| --- | --- |
| Super admin | `superadmin@demo.sociox.local` |
| District admin | `admin@demo.sociox.local` |
| Ward counsellor | `counsellor@demo.sociox.local` |
| Department officer | `officer@demo.sociox.local` |
| Citizen | `citizen@demo.sociox.local` |

You can also run the same workflow with:

```powershell
npm run demo
```

Do not commit `.env.local`. To stop the database after the demo, run `docker compose down`. Use `docker compose down -v` only when you intentionally want to delete local database data.

## Manual development commands

```powershell
docker compose up -d
npm install
npm run dev
```

The application uses PostgreSQL for authentication, sessions, complaints, districts, departments, and wards.

## Open from another device on the same Wi-Fi

Run the demo launcher on the host computer and note the printed Wi-Fi address, for example:

```text
http://192.168.1.25:3000
```

Open that address from the jury laptop or phone connected to the same Wi-Fi network. Allow Node.js through Windows Firewall if Windows shows a network access prompt. Do not use `localhost` on the other device because it refers to that device itself.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
