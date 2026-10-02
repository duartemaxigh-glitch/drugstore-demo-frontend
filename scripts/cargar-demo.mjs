import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const API_URL = process.env.DEMO_API_URL || 'http://127.0.0.1:8000/api';

const categoriasDemo = ['Bebidas', 'Golosinas', 'Galletitas', 'Snacks', 'Almacén'];
const mediosDemo = ['Efectivo', 'Transferencia', 'Tarjeta'];

const proveedoresDemo = [
  {
    razon_social: 'Distribuidora Norte',
    cuit_cuil: null,
    contacto_nombre: 'Ventas',
    telefono: null,
    email: null,
  },
  {
    razon_social: 'Mayorista Centro',
    cuit_cuil: null,
    contacto_nombre: 'Pedidos',
    telefono: null,
    email: null,
  },
];

// Precios exclusivamente de ejemplo para la demostración.
const productosDemo = [
  ['Coca-Cola 500 ml', 1500, 2200, '7790895000011', 'Bebidas', 32],
  ['Coca-Cola 1.5 L', 2600, 3800, '7790895000028', 'Bebidas', 24],
  ['Sprite 500 ml', 1450, 2150, '7790895000035', 'Bebidas', 26],
  ['Fanta 500 ml', 1450, 2150, '7790895000042', 'Bebidas', 22],
  ['Agua mineral 500 ml', 800, 1300, '7790895000059', 'Bebidas', 36],
  ['Agua saborizada 500 ml', 1100, 1700, '7790895000066', 'Bebidas', 24],
  ['Energizante lata', 1800, 2700, '7790895000073', 'Bebidas', 18],
  ['Alfajor Jorgito', 700, 1100, '7790895000080', 'Golosinas', 40],
  ['Alfajor Guaymallén', 550, 900, '7790895000097', 'Golosinas', 42],
  ['Chocolate con leche', 1200, 1900, '7790895000103', 'Golosinas', 20],
  ['Chicle Beldent', 450, 750, '7790895000110', 'Golosinas', 35],
  ['Caramelos surtidos', 250, 450, '7790895000127', 'Golosinas', 50],
  ['Oreo 118 g', 1300, 2000, '7790895000134', 'Galletitas', 28],
  ['Chocolinas 170 g', 1200, 1850, '7790895000141', 'Galletitas', 26],
  ['Pepitos 119 g', 1250, 1900, '7790895000158', 'Galletitas', 24],
  ['Papas fritas clásicas', 1500, 2300, '7790895000165', 'Snacks', 22],
  ['Palitos salados', 950, 1500, '7790895000172', 'Snacks', 20],
  ['Maní salado', 900, 1450, '7790895000189', 'Snacks', 25],
  ['Yerba mate 500 g', 2200, 3100, '7790895000196', 'Almacén', 18],
  ['Azúcar 1 kg', 1300, 1900, '7790895000202', 'Almacén', 16],
  ['Leche larga vida 1 L', 1600, 2300, '7790895000219', 'Almacén', 18],
  ['Fideos secos 500 g', 1100, 1700, '7790895000226', 'Almacén', 20],
  ['Arroz 1 kg', 1800, 2600, '7790895000233', 'Almacén', 17],
  ['Atún en lata', 2100, 3000, '7790895000240', 'Almacén', 14],
];

let token = '';

async function api(endpoint, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const data = response.status === 204
    ? null
    : contentType.includes('application/json')
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    const detail = data?.detail || data || `${response.status} ${response.statusText}`;
    throw new Error(`${endpoint}: ${detail}`);
  }
  return data;
}

const get = (endpoint) => api(endpoint);
const post = (endpoint, body, options = {}) => api(endpoint, {
  method: 'POST',
  body: JSON.stringify(body),
  ...options,
});

function normalizar(texto) {
  return String(texto ?? '').trim().toLocaleLowerCase('es');
}

async function asegurarPorNombre({ endpoint, existentes, nombreCampo, datos }) {
  for (const item of datos) {
    const nombre = typeof item === 'string' ? item : item[nombreCampo];
    if (existentes.some((x) => normalizar(x[nombreCampo]) === normalizar(nombre))) continue;
    const payload = typeof item === 'string' ? { [nombreCampo]: item } : item;
    const creado = await post(endpoint, payload);
    existentes.push(creado);
    console.log(`  + ${nombre}`);
  }
}

async function main() {
  const rl = readline.createInterface({ input, output });
  try {
    console.log('\n=== Preparación de datos para demo ===');
    console.log(`Backend: ${API_URL}\n`);

    if (process.env.DEMO_CONFIRM !== 'yes') {
      const confirmar = await rl.question('Esto agregará datos ficticios a esta base. ¿Continuar? [s/N]: ');
      if (!['s', 'si', 'sí', 'y', 'yes'].includes(confirmar.trim().toLocaleLowerCase('es'))) {
        console.log('Carga cancelada.');
        return;
      }
      console.log('');
    }

    const email = process.env.DEMO_EMAIL || await rl.question('Email de usuario jefe: ');
    const password = process.env.DEMO_PASSWORD || await rl.question('Contraseña: ');

    const login = await post('/auth/login', { email: email.trim(), password }, { headers: {} });
    token = login.token;
    console.log(`\nSesión iniciada como: ${login.rol}`);
    if (login.rol !== 'jefe') {
      console.log('Aviso: conviene ejecutar la carga con un usuario jefe para poder mostrar reportes.');
    }

    console.log('\nCategorías:');
    const categorias = await get('/categorias');
    await asegurarPorNombre({ endpoint: '/categorias', existentes: categorias, nombreCampo: 'nombre', datos: categoriasDemo });

    console.log('\nMedios de pago:');
    const medios = await get('/medios-pago');
    await asegurarPorNombre({ endpoint: '/medios-pago', existentes: medios, nombreCampo: 'nombre', datos: mediosDemo });

    console.log('\nProveedores:');
    const proveedores = await get('/proveedores');
    await asegurarPorNombre({ endpoint: '/proveedores', existentes: proveedores, nombreCampo: 'razon_social', datos: proveedoresDemo });

    console.log('\nProductos:');
    let productos = await get('/productos');
    const categoriaPorNombre = new Map(categorias.map((c) => [normalizar(c.nombre), c]));

    for (const [nombre, compra, venta, codigo, categoria, stockObjetivo] of productosDemo) {
      let existente = productos.find((p) =>
        normalizar(p.nombre) === normalizar(nombre) ||
        (p.codigo_barras && p.codigo_barras === codigo)
      );
      if (!existente) {
        const cat = categoriaPorNombre.get(normalizar(categoria));
        existente = await post('/productos', {
          nombre,
          precio_compra: compra,
          precio_venta: venta,
          codigo_barras: codigo,
          id_categoria: cat?.id_categoria ?? null,
        });
        productos.push(existente);
        console.log(`  + ${nombre}`);
      }
    }

    // Volver a leer para tener stock e IDs definitivos.
    productos = await get('/productos');
    const proveedor = proveedores.find((p) => normalizar(p.razon_social) === normalizar(proveedoresDemo[0].razon_social)) || proveedores[0];
    const detallesCompra = [];

    for (const [nombre, compra, , codigo, , stockObjetivo] of productosDemo) {
      const p = productos.find((x) => normalizar(x.nombre) === normalizar(nombre) || x.codigo_barras === codigo);
      if (!p) continue;
      // Se deja un pequeño colchón sobre el stock objetivo para que las ventas demo no lo agoten.
      const objetivoCarga = stockObjetivo + 5;
      const faltante = Math.max(0, objetivoCarga - Number(p.stock || 0));
      if (faltante > 0) {
        detallesCompra.push({
          id_producto: p.id_producto,
          cantidad: faltante,
          precio_unitario: compra,
        });
      }
    }

    if (detallesCompra.length > 0) {
      await post('/compras', {
        id_proveedor: proveedor.id_proveedor,
        detalles: detallesCompra,
      });
      console.log(`\nStock inicial cargado mediante una compra de ${detallesCompra.length} productos.`);
    } else {
      console.log('\nEl stock demo ya estaba cargado.');
    }

    productos = await get('/productos');
    const ventas = await get('/ventas');
    const fechaAR = (valor) => {
      const partes = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Argentina/Cordoba',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(new Date(valor));
      const map = Object.fromEntries(partes.map((p) => [p.type, p.value]));
      return `${map.year}-${map.month}-${map.day}`;
    };
    const hoyAR = fechaAR(new Date());
    const hayVentasHoy = ventas.some((v) => v.fecha && fechaAR(v.fecha) === hoyAR);

    if (!hayVentasHoy) {
      const medioEfectivo = medios.find((m) => normalizar(m.nombre) === 'efectivo') || medios[0];
      const medioTransferencia = medios.find((m) => normalizar(m.nombre) === 'transferencia') || medios[0];
      const idProd = (nombre) => productos.find((p) => normalizar(p.nombre) === normalizar(nombre))?.id_producto;

      const ventasDemo = [
        {
          id_medio_pago: medioEfectivo.id_medio_pago,
          id_cliente: null,
          detalles: [
            { id_producto: idProd('Coca-Cola 500 ml'), cantidad: 2 },
            { id_producto: idProd('Alfajor Jorgito'), cantidad: 1 },
          ],
        },
        {
          id_medio_pago: medioTransferencia.id_medio_pago,
          id_cliente: null,
          detalles: [
            { id_producto: idProd('Agua mineral 500 ml'), cantidad: 2 },
            { id_producto: idProd('Oreo 118 g'), cantidad: 1 },
          ],
        },
        {
          id_medio_pago: medioEfectivo.id_medio_pago,
          id_cliente: null,
          detalles: [
            { id_producto: idProd('Papas fritas clásicas'), cantidad: 1 },
            { id_producto: idProd('Coca-Cola 1.5 L'), cantidad: 1 },
          ],
        },
      ];

      for (const venta of ventasDemo) {
        if (venta.detalles.every((d) => d.id_producto)) await post('/ventas', venta);
      }
      console.log('Se crearon 3 ventas de ejemplo para poblar historial y reportes.');
    } else {
      console.log('Ya existen ventas de hoy; no se agregaron ventas ficticias adicionales.');
    }

    console.log('\n✅ Datos de demo preparados.');
    console.log('Recorrido sugerido: Productos → Ventas → Historial → Reportes.\n');
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(`\n❌ No se pudo preparar la demo: ${error.message}`);
  process.exitCode = 1;
});
