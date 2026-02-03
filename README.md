This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
# Instalación
npm install
npx prisma generate

# Ejecución
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

## Deploy on Azure

Esta aplicación está configurada para desplegarse en Azure usando:
- **Azure Static Web Apps** (hosting del frontend y APIs)
- **Azure PostgreSQL Flexible Server** (base de datos)

### Inicio Rápido

```bash
# 1. Verificar requisitos
./azure/verify-config.sh

# 2. Provisionar recursos en Azure
./azure/provision.sh

# 3. Configurar GitHub Secrets (sigue las instrucciones del script)

# 4. Desplegar
git push
```

### Costos estimados
- Azure Static Web Apps: $0-9/mes
- PostgreSQL B1ms: ~$12/mes
- **Total: $12-21/mes**

Para instrucciones detalladas, lee [azure/DEPLOYMENT.md](./azure/DEPLOYMENT.md)

## Deploy on Vercel

También puedes desplegar en [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
