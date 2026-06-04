# gifcards-frontend

SPA de Gifcards — React + TypeScript + Vite + Chakra UI.

## Requisitos

- [Node.js](https://nodejs.org/) 20+ (LTS recomendado)
- npm 10+

## Desarrollo local

Desde la raíz de este proyecto (`gifcards-frontend/`):

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (HMR)
npm run dev
```

La app queda disponible en [http://localhost:5173](http://localhost:5173) (puerto por defecto de Vite).

### Otros comandos útiles

```bash
# Build de producción
npm run build

# Previsualizar el build localmente
npm run preview

# Linter
npm run lint
```

### Backend local (opcional)

Para levantar el API en paralelo, en otra terminal desde `gifcards-backend/`:

```bash
cd ../gifcards-backend
npm install
npm run dev
```

El API queda en [http://localhost:8787](http://localhost:8787). Health check:

```bash
curl http://localhost:8787/health
```

Configura la URL en un archivo `.env` en la raíz del frontend cuando la integración esté activa:

```bash
VITE_API_URL=http://localhost:8787
```

Más detalle en [gifcards-backend/README.md](../gifcards-backend/README.md).

## Stack

- React 19 + TypeScript
- Vite
- Chakra UI
- React Router, Zustand, i18next (estructura preparada para implementación)
