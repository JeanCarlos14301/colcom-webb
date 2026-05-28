<div align="center">

<br/>

# 🌎 Latinoamérica Comparte — Frontend Web Client

**Plataforma colaborativa regional que conecta personas, empresas y comunidades**
en Colombia 🇨🇴 · Argentina 🇦🇷 · Chile 🇨🇱 · Ecuador 🇪🇨

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-EF0079?style=flat-square&logo=framer&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Stack Tecnológico](#-stack-tecnológico)
- [Características Principales](#-características-principales)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Uso Local](#️-instalación-y-uso-local)
- [Conexión con el Backend](#-conexión-con-el-backend)

---

## 📌 Acerca del Proyecto

**Latinoamérica Comparte** es una Single Page Application (SPA) diseñada con foco en experiencia de usuario premium, theming dinámico por país y un panel de administración robusto con control de acceso por roles.

El frontend consume la API **Colcom API** (NestJS) y está preparado para escalar junto a las comunidades de la región.

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Razón de elección |
|---|---|---|
| Framework | React 19 | Ecosistema maduro, Server Components ready |
| Build Tool | Vite 7 | HMR ultrarrápido, compilación optimizada |
| Estilos | Tailwind CSS 3.4 | Diseño responsivo con utilidades componibles |
| Animaciones | Framer Motion 12 | Transiciones fluidas y microinteracciones con física de resortes |
| Enrutamiento | Custom Router (state-based) | Sincronización estrecha con el backend |
| HTTP Client | Fetch API (modularizada) | Sin dependencias externas, patrón Axios-like |

---

## ✨ Características Principales

### 🗺 Sistema Multi-País Dinámico (Theming)

La interfaz reacciona y se adapta visualmente según el país activo — sin recargar la página.

- **Hook `useCountry`:** Cambia en tiempo real colores primarios, logos, métricas, textos y testimonios.
- **Componentes Dinámicos:** `CountryAboutSection` y `CountryMissionAndCTA` renderizan paletas exclusivas por país (ej. morado Latam vs. azul Argentina).
- **Países soportados:** Latinoamérica (Global), Colombia, Argentina, Chile y Ecuador.

---

### 🔐 Panel Administrativo Protegido (Dashboard)

Portal privado con autenticación JWT y Control de Acceso Basado en Roles (RBAC).

| Rol | Acceso |
|---|---|
| **Superadmin** | Gestión de contenido de todos los países + módulo global de Solicitudes |
| **Admin País** | Vista auto-filtrada (Scope) a su país; Solicitudes globales ocultas |
| **Editor** | Redacción y gestión básica de contenido |

- **`ProtectedRoute`:** El acceso a `/admin` está completamente restringido sin sesión activa.
- **Gestión de Contenido (CRUD):** Módulos para *Noticias*, *Testimonios* y *Usuarios*.

---

### 🎨 Componentes UI Premium

- **`PublicHeader` Inteligente:** Glassmorphism + detector de scroll + indicador animado con física de resortes (Framer Motion).
- **Modales y Alertas Reutilizables:** `ConfirmButton` con estados asíncronos (`LoadingState`, `ErrorState`, `EmptyState`) para un manejo elegante de errores de API.

---

## 📂 Estructura del Proyecto

```
colcom-web/
├── public/                  # Recursos estáticos directos (favicons, webmanifest)
├── src/
│   ├── api/                 # Servicios HTTP agrupados por dominio (noticias.api.js, auth.api.js…)
│   ├── assets/              # Recursos empaquetados por Vite (logos, imágenes, videos HD)
│   ├── components/
│   │   ├── admin/           # Componentes del Dashboard (formularios, tablas)
│   │   ├── common/          # Componentes transversales (botones, badges, loaders)
│   │   └── public/          # Secciones del Landing Page (Hero, Misión, CTA)
│   ├── data/                # Diccionarios estáticos (countryLogos.ts, config de países)
│   ├── hooks/               # Custom Hooks (useAuth.js, useCountry.js)
│   ├── layouts/             # Wrappers estructurales (AdminLayout + Sidebar, PublicLayout + Footer)
│   ├── pages/
│   │   ├── admin/           # DashboardPage.jsx, ContentListPage.jsx…
│   │   └── public/          # LandingPage.tsx, ContactPage.jsx…
│   ├── routes/              # Lógica central del Router y gestión de URLs
│   ├── utils/               # Formateadores de fecha, constantes y validadores
│   ├── index.css            # Punto de entrada de Tailwind y variables CSS globales
│   └── main.tsx             # Punto de montaje principal de React
├── index.html               # Plantilla HTML raíz
├── tailwind.config.js       # Design System (colores brand, breakpoints)
└── vite.config.js           # Configuración de Vite, plugins y proxy local
```

---

## ⚙️ Instalación y Uso Local

### Pre-requisitos

- **Node.js** v18 o superior
- **npm** o **pnpm**

### Pasos

**1. Clonar el repositorio**

```bash
git clone <url-del-repo>
cd frontendFullstack-web/colcom-web
```

**2. Instalar dependencias**

```bash
npm install
```

**3. Configurar variables de entorno** *(si aplica)*

Revisa si necesitas un archivo `.env` para apuntar a un backend diferente al de producción. El proxy de Vite ya redirige `/api/*` automáticamente en desarrollo.

**4. Levantar el servidor de desarrollo**

```bash
npm run dev
```

> La app correrá en `http://localhost:5173` (o el puerto disponible indicado en consola).

### Build de Producción

```bash
# Generar archivos estáticos optimizados en /dist
npm run build

# Previsualizar la build localmente antes de desplegar
npm run preview
```

---

## 🌐 Conexión con el Backend

El frontend consume la API **Colcom API** (NestJS). En desarrollo, Vite actúa como proxy para evitar problemas de CORS:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'https://colcom-api-web.onrender.com',
      changeOrigin: true,
    }
  }
}
```

En producción, asegúrate de que el frontend y el backend compartan dominio, o que el backend autorice los orígenes correspondientes en su configuración de CORS.

---

<div align="center">

Diseñado con pasión para escalar y evolucionar junto a las comunidades de la región 🌎

</div>
