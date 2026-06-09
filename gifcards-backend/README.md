# gifcards-backend

API de Gifcards — Cloudflare Workers + Hono.

## Requisitos

- [Node.js](https://nodejs.org/) 20+ (LTS recomendado)
- npm 10+
- Cuenta [Cloudflare](https://dash.cloudflare.com/) (solo para deploy)
- Firebase project con Firestore
- Stripe (test mode) para checkout

## Desarrollo local

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

API: [http://localhost:8787](http://localhost:8787)

```bash
curl http://localhost:8787/health
# → {"status":"ok"}
```

## Variables de entorno (`.dev.vars`)

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `FIREBASE_PROJECT_ID` | Sí | Proyecto Firebase |
| `FIREBASE_SERVICE_ACCOUNT` | Sí | JSON service account (una línea) |
| `CORS_ORIGIN` | Sí | Origen frontend, ej. `http://localhost:5173` |
| `APP_URL` | Sí | URL pública del SPA |
| `STRIPE_SECRET_KEY` | Checkout | Clave secreta Stripe test |
| `STRIPE_WEBHOOK_SECRET` | Checkout | Secret del webhook (Stripe CLI en local) |
| `WALLET_JWT_SECRET` | Wallet | Secret para tokens magic link |
| `AWS_ACCESS_KEY_ID` | Uploads | S3 presign logos |
| `AWS_SECRET_ACCESS_KEY` | Uploads | S3 presign logos |
| `S3_BUCKET` | Uploads | Bucket S3 |
| `BEELY_API_KEY` | Opcional | Email post-compra |

## Stripe local (webhook)

```bash
stripe listen --forward-to localhost:8787/api/v1/webhooks/stripe
```

Usa la tarjeta test `4242 4242 4242 4242`.

## API (`/api/v1`)

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/auth/session` | Firebase |
| POST | `/merchants` | Firebase |
| PATCH | `/merchants/:id` | Owner |
| GET | `/merchants/:id` | Owner |
| GET | `/merchants/:id/payments` | Owner |
| GET | `/merchants/slug/:slug/availability` | Owner |
| POST | `/gift-cards` | Owner |
| GET | `/gift-cards` | Owner |
| GET | `/gift-cards/:id` | Owner |
| PATCH | `/gift-cards/:id` | Owner |
| GET | `/storefront/:slug` | Public |
| GET | `/storefront/:slug/cards/:cardId` | Public |
| POST | `/checkout/sessions` | Public |
| GET | `/checkout/sessions/:id` | Public |
| POST | `/webhooks/stripe` | Stripe signature |
| GET | `/gift/:token` | Public |
| GET | `/redeem/validate?code=` | Owner |
| POST | `/redeem` | Owner |
| GET | `/dashboard` | Owner |
| GET | `/transactions` | Owner |
| GET | `/analytics` | Owner |
| POST | `/wallet/magic-link` | Public |
| GET | `/wallet/cards` | Wallet JWT |
| POST | `/uploads/presign` | Owner |

## Índices Firestore

Crear en Firebase Console → Firestore → Indexes:

| Colección | Campos |
|-----------|--------|
| `giftCards` | `merchantId` ASC, `status` ASC, `createdAt` DESC |
| `issuedCards` | `code` ASC |
| `issuedCards` | `token` ASC |
| `issuedCards` | `ownerEmail` ASC |
| `issuedCards` | `recipientEmail` ASC |
| `transactions` | `merchantId` ASC, `createdAt` DESC |
| `merchants` | `slug` ASC |

## Flujo E2E de validación

1. Landing → Signup → Onboarding (slug + colores)
2. Crear gift card en `/gift-cards/new`
3. Abrir `/{slug}` → comprar → Stripe test → webhook mint
4. Abrir `/gift/:token` → ver saldo
5. Merchant `/redeem` → validar código → confirmar monto
6. Dashboard y `/transactions` muestran compra + redención
7. Wallet: POST magic-link → `/wallet?token=...`

## Comandos

```bash
npm run typecheck
npm run deploy
```

## Frontend

`../gifcards-frontend/` — `VITE_API_URL=http://localhost:8787`
