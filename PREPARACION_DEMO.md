# Preparación de la demo

Esta variante mantiene el sistema original y activa una capa de presentación mediante variables de entorno.

## 1. Modo demo

El archivo `.env.local` incluido contiene:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_APP_NAME=Gestión Drugstore
NEXT_PUBLIC_DEMO_MODE=true
```

Con `NEXT_PUBLIC_DEMO_MODE=true`:

- se oculta el asistente IA;
- se oculta recuperación de contraseña en el login;
- no se muestran las acciones de eliminar ventas y compras;
- los tickets se presentan como vista previa y no se ofrece impresión física;
- se usa un nombre neutro y no se muestran referencias técnicas en el login.

Para volver al comportamiento normal basta con cambiar `NEXT_PUBLIC_DEMO_MODE=false` y reiniciar Next.js.

## 2. Instalar y arrancar el frontend

```bash
pnpm install
pnpm dev
```

El backend debe estar disponible en `http://127.0.0.1:8000/api` o en la URL configurada en `NEXT_PUBLIC_API_URL`.

## 3. Cargar datos ficticios

Con el backend ya iniciado:

```bash
pnpm demo:datos
```

El script solicita las credenciales de un usuario existente. Conviene usar un usuario con rol `jefe` para poder mostrar Reportes.

La carga se hace usando la API normal del sistema y prepara:

- 5 categorías;
- Efectivo, Transferencia y Tarjeta;
- 2 proveedores;
- 24 productos ficticios con código de barras;
- stock inicial mediante una compra real;
- 3 ventas de ejemplo si la base todavía no tiene ventas.

Los precios son únicamente datos ficticios de demostración.

## 4. Recorrido recomendado en el local

1. **Productos:** mostrar que existe inventario y stock.
2. **Ventas:** buscar por nombre o código, agregar 2 o 3 productos y finalizar una venta.
3. **Productos:** volver para enseñar que el stock disminuyó.
4. **Historial:** enseñar el movimiento recién registrado y la vista previa del ticket.
5. **Reportes:** con usuario jefe, mostrar el total y movimientos del día.
6. Sólo si preguntan cómo ingresa mercadería: mostrar **Compras** y explicar que aumenta el stock.

No conviene recorrer todos los CRUD durante la primera conversación.
