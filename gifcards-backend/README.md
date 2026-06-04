# gifcards-backend

API de Gifcards — Cloudflare Workers + Hono.

## Requisitos

- [Node.js](https://nodejs.org/) 20+ (LTS recomendado)
- npm 10+
- Cuenta [Cloudflare](https://dash.cloudflare.com/) (solo para deploy; no es necesaria para desarrollo local)

## Desarrollo local

Desde la raíz de este proyecto (`gifcards-backend/`):

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar Worker en modo desarrollo (Wrangler)
npm run dev
```

El API queda disponible en [http://localhost:8787](http://localhost:8787).

Comprobar que responde:

```bash
curl http://localhost:8787/health
# → {"status":"ok"}
```

### Variables de entorno locales (opcional)

Para secrets en desarrollo, copia el ejemplo y rellena los valores:

```bash
cp .dev.vars.example .dev.vars
```

Wrangler carga `.dev.vars` automáticamente en `npm run dev`. **No commitees** `.dev.vars`.

### Otros comandos útiles

```bash
# Verificación de tipos TypeScript
npm run typecheck

# Deploy a Cloudflare Workers
npm run deploy
```

## Stack

- Cloudflare Workers + Wrangler
- Hono
- TypeScript

## Frontend

El SPA vive en `../gifcards-frontend/`. Con ambos proyectos en marcha, configura en el frontend:

```bash
VITE_API_URL=http://localhost:8787
```
