# FrontCruDrugstore

Frontend del sistema de gestion para drugstore. Construido con Next.js, React y Tailwind CSS.

Se conecta a un backend FastAPI para autenticacion, CRUD de productos, ventas, compras, clientes, proveedores, categorias, medios de pago, usuarios y reportes.

## Requisitos

- Node.js 18 o superior
- pnpm (si no lo tenes: `npm install -g pnpm`)
- El backend corriendo en `http://127.0.0.1:8000` (o la URL que configures)

## Instalacion

```bash
pnpm install
```

## Variables de entorno

Crear un archivo `.env.local` en la raiz del proyecto:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_CHATBOT_URL=http://127.0.0.1:8007
```

- `NEXT_PUBLIC_API_URL` — URL base del backend FastAPI (por defecto `http://127.0.0.1:8000/api`)
- `NEXT_PUBLIC_CHATBOT_URL` — URL del servicio de chatbot/IA (por defecto `http://127.0.0.1:8007`). Si no tenes el servicio del chatbot, el sistema funciona igual, solo que el boton flotante muestra un mensaje de contacto.

## Levantar el proyecto

Para desarrollo (con hot-reload):

```bash
pnpm dev
```

Se levanta en `http://localhost:3000`.

Para produccion:

```bash
pnpm build
pnpm start
```

## Estructura del proyecto

```
src/
  app/
    login/                  Pagina de login
    recuperar-password/     Recuperar contrasena
    dashboard/              Layout y paginas del panel principal
      ventas/               Punto de venta e historial
      compras/              Registro de compras a proveedores
      productos/            ABM de productos
      categorias/           ABM de categorias
      clientes/             ABM de clientes
      proveedores/          ABM de proveedores
      medios-pago/          ABM de medios de pago
      usuarios/             ABM de usuarios (solo jefe)
      reportes/             Reportes diarios de ventas/compras (solo jefe)
  components/
    Sidebar.js              Navegacion lateral
    PaginaCrud.js           Componente reutilizable para todas las pantallas CRUD
    Modal.js                Modal base
    ChatBot.js              Asistente IA flotante
    TicketPreview.js        Vista previa e impresion de tickets
    Toast.js                Notificaciones
  context/
    AuthContext.js           Manejo de autenticacion y sesion
    ToastContext.js          Manejo de notificaciones toast
  lib/
    api.js                  Cliente HTTP centralizado para el backend
```

## Roles

El sistema tiene dos roles:

- **empleado** — Acceso a ventas, compras, productos, categorias, clientes, proveedores y medios de pago.
- **jefe** — Todo lo del empleado mas gestion de usuarios y reportes diarios.

## Stack

- Next.js 16 (App Router)
- React 18
- Tailwind CSS 3
- Heroicons
- Plus Jakarta Sans (tipografia)
