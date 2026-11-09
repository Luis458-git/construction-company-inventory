# 🛠️ Especificaciones Técnicas y Checklist de Desarrollo (Parte B)
**Proyecto:** API de Control de Inventario y Detección de Fugas para Constructora Del Valle S.A.  
**Stack Sugerido:** Node.js (Express / Fastify), PostgreSQL, Prisma ORM / Knex.js.

---

## 📋 1. Requerimientos Funcionales y Arquitectura de Código

### 1.1 Estructura del Proyecto (Camino 2 - Backend Propio)
inventario-constructora/
│
├── 📁 frontend/                         # Interfaz de Usuario (React + Vite + Tailwind)
│   ├── public/
│   │   ├── favicon.ico
│   │   └── mock-data/                   # Fallbacks JSON para desarrollo local
│   ├── src/
│   │   ├── assets/                      # Logotipos, imágenes e íconos SVG
│   │   ├── components/
│   │   │   ├── ui/                      # Componentes atómicos (Button, Card, Badge, Modal, Table)
│   │   │   ├── layout/                  # Sidebar, Navbar, Footer, Layout Wrapper
│   │   │   └── dashboard/               # KpiCards, StockChart, RecentMovementsTable, AlertBanner
│   │   ├── pages/                       # Vistas principales:
│   │   │   ├── Dashboard.jsx            # Resumen de métricas y gráficos
│   │   │   ├── Inventory.jsx            # Lista completa de materiales y stock
│   │   │   ├── Movements.jsx            # Registro de Entradas, Salidas y Traslados
│   │   │   ├── PurchaseOrders.jsx       # Gestión de OC y Módulo de Duplicados (A3)
│   │   │   └── Alerts.jsx               # Historial de alertas de reorden (A5)
│   │   ├── services/                    # Conectores HTTP con el Backend:
│   │   │   ├── api.js                   # Instancia base de Axios / Fetch
│   │   │   ├── materialsService.js      # Consume GET /materiales/:id/stock
│   │   │   ├── movementsService.js      # Consume POST /movimientos
│   │   │   ├── alertsService.js         # Consume GET /alertas/reorden
│   │   │   └── ordersService.js         # Consume GET /ordenes/posibles-duplicados
│   │   ├── context/                     # Estado global (InventoryContext, NotificationContext)
│   │   ├── hooks/                       # Custom Hooks (useMaterials, useMovements, useAlerts)
│   │   ├── utils/                       # Formateadores (¢, fechas) y constantes
│   │   ├── App.jsx                      # Enrutador principal de la aplicación
│   │   ├── main.jsx                     # Punto de entrada de React
│   │   └── index.css                    # Estilos globales de Tailwind CSS
│   ├── tailwind.config.js               # Tema de diseño oscuro/industrial (#0B0F19, #38BDF8)
│   ├── vite.config.js                   # Configuración del empaquetador Vite
│   └── package.json                     # Dependencias del Frontend
│
├── 📁 backend/                          # Servidor de API REST (Node.js + Express + PostgreSQL)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js              # Conexión a PostgreSQL (Pool / Client)
│   │   ├── controllers/                 # Gestión de peticiones y respuestas HTTP:
│   │   │   ├── materialController.js    # Maneja consultas de stock y catálogo
│   │   │   ├── movimientoController.js  # Maneja registros de Entradas/Salidas
│   │   │   ├── alertaController.js      # Maneja vistas de materiales en punto de reorden
│   │   │   └── ordenController.js       # Maneja detección de duplicados
│   │   ├── services/                    # Lógica de Negocio y Reglas Agronómicas/Logísticas:
│   │   │   ├── reordenService.js        # Cálculo dinámico de SS, PR y disparo de alertas
│   │   │   └── duplicadosService.js     # Algoritmo de detección de OC sospechosas (72h)
│   │   └── routes/                      # Definición de Endpoints REST:
│   │       ├── materialRoutes.js        # GET /materiales y /materiales/:id/stock
│   │       ├── movimientoRoutes.js      # POST /movimientos
│   │       ├── alertaRoutes.js          # GET /alertas/reorden
│   │       └── ordenRoutes.js           # GET /ordenes/posibles-duplicados
│   ├── server.js                        # Punto de entrada del servidor Express (Puerto 3000)
│   ├── .env.example                     # Variables de entorno (DB_HOST, DB_USER, DB_NAME, PORT)
│   └── package.json                     # Dependencias del Backend (express, pg, cors, dotenv)
│
├── 📁 database/                         # Scripts de Base de Datos
│   ├── schema.sql                       # Tablas: materiales, movimientos, proveedores, ordenes_compra, alertas
│   └── seed.sql                         # Datos iniciales (Cemento, Varilla, Block, Arena, Proveedores)
│
├── .gitignore                           # Exclusión de node_modules y .env
└── README.md                            # Guía global de ejecución del sistema completo

### 1.2 Base de Datos (DDL - Script SQL Sugerido)

```sql
-- 1. Tabla de Materiales
CREATE TABLE materiales (
    id SERIAL PRIMARY KEY,
    codigo_estandar VARCHAR(20) UNIQUE NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    stock_minimo INT DEFAULT 0,
    stock_maximo INT NOT NULL,
    demanda_promedio_diaria INT NOT NULL,
    tiempo_entrega_dias INT NOT NULL,
    stock_seguridad INT GENERATED ALWAYS AS ((demanda_promedio_diaria) * tiempo_entrega_dias) STORED, -- O calculado por API
    punto_reorden INT NOT NULL
);

-- 2. Tabla de Proveedores
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(50)
);

-- 3. Tabla de Órdenes de Compra (OC)
CREATE TABLE ordenes_compra (
    id SERIAL PRIMARY KEY,
    numero_oc VARCHAR(20) UNIQUE NOT NULL,
    proveedor_id INT REFERENCES proveedores(id),
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    area_solicitante VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'APROBADA', -- APROBADA, PENDIENTE
    monto_total DECIMAL(12,2)
);

-- 4. Detalle de Orden de Compra
CREATE TABLE detalle_orden (
    id SERIAL PRIMARY KEY,
    orden_compra_id INT REFERENCES ordenes_compra(id),
    material_id INT REFERENCES materiales(id),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL
);

-- 5. Tabla de Movimientos de Inventario (Trazabilidad)
CREATE TABLE movimientos (
    id SERIAL PRIMARY KEY,
    material_id INT REFERENCES materiales(id),
    tipo_movimiento VARCHAR(20) NOT NULL, -- ENTRADA, SALIDA, TRASLADO, AJUSTE
    cantidad INT NOT NULL,
    bodega_origen VARCHAR(50),
    bodega_destino VARCHAR(50),
    documento_referencia VARCHAR(50), -- ej. OC-1041, VALE-502
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id VARCHAR(50) NOT NULL
);

-- 6. Tabla de Alertas de Reorden
CREATE TABLE alertas_reorden (
    id SERIAL PRIMARY KEY,
    material_id INT REFERENCES materiales(id),
    stock_al_disparar INT NOT NULL,
    punto_reorden_calculado INT NOT NULL,
    fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_resolucion VARCHAR(20) DEFAULT 'PENDIENTE' -- PENDIENTE, RESUELTA
);
```

---

### 1.3 Contrato de Endpoints API (Backend)

#### 1. Consulta de Stock y Punto de Reorden
* **Endpoint:** `GET /api/materiales/:id/stock`
* **Lógica:** Suma todas las entradas y resta las salidas asociadas al `material_id`. Calcula si `stockActual <= punto_reorden`.
* **Respuesta Esperada (200 OK):**
```json
{
  "material_id": 3,
  "codigo_estandar": "MAT-CEM-01",
  "descripcion": "Cemento gris 50 kg",
  "stock_actual": 190,
  "punto_reorden": 165,
  "estado": "OK",
  "requiere_reposicion": false
}
```

#### 2. Registrar Movimiento (Entrada/Salida/Traslado)
* **Endpoint:** `POST /api/movimientos`
* **Cuerpo de la Petición:**
```json
{
  "material_id": 3,
  "tipo_movimiento": "SALIDA",
  "cantidad": 30,
  "bodega_origen": "Bodega Central",
  "bodega_destino": "Obra A",
  "documento_referencia": "VALE-890",
  "usuario_id": "usr_juan_perez"
}
```
* **Lógica de Negocio:** Inserta el movimiento en BD. Recalcula el stock actual. Si el nuevo stock es menor al `punto_reorden`, inserta automáticamente un registro en `alertas_reorden` o envía notificación.

#### 3. Consultar Alertas de Reorden Activas
* **Endpoint:** `GET /api/alertas/reorden`
* **Respuesta Esperada (200 OK):** Muestra materiales cuyo stock actual cayó por debajo del $PR$.

#### 4. Detección de Compras Duplicadas
* **Endpoint:** `GET /api/ordenes/posibles-duplicados`
* **Regla de Detección (Servicio `duplicados.js`):** Busca en la base de datos órdenes de compra que coincidan en:
  1. Mismo `proveedor_id`
  2. Mismo `material_id` en el detalle
  3. Misma `cantidad` (o variación $\pm 5\%$)
  4. Emitidas dentro de un rango de tiempo menor o igual a **72 horas**.
* **Respuesta Esperada (200 OK):**
```json
{
  "duplicados_detectados": [
    {
      "orden_original": "OC-1041",
      "orden_sospechosa": "OC-1042",
      "proveedor": "Proveedor A",
      "articulo": "Cemento gris 50 kg",
      "cantidad": 200,
      "diferencia_horas": 0,
      "fuga_potencial_monto": 1290000.00
    }
  ]
}
```

---

## 📌 2. Checklist de Verificación y Control de Calidad

Usen esta lista de cotejo antes de realizar la entrega final el viernes 6 de noviembre.

### 🔷 A. Código y Arquitectura Técnica (28 pts)
- [ ] **Conexión a BD Real:** La app se conecta exitosamente a PostgreSQL, MySQL, SQLite o MongoDB (nada en memoria temporal).
- [ ] **Scripts de Migración/Seed:** Existe un archivo `seed.sql` o script inicial con los datos de la Constructora Del Valle (cementos, varillas, órdenes de octubre OC-1041 a OC-1061).
- [ ] **Cálculo Automático de PR:** El punto de reorden **NO** es editable en el frontend/API, sino que se calcula dinámicamente con las fórmulas del informe ($PR = d \times L + SS$).
- [ ] **Manejo de Variables de Entorno:** Las credenciales de la base de datos están en un archivo `.env` que **NO** está subido a GitHub (usar `.env.example`).
- [ ] **Manejo de Errores:** Peticiones con datos inválidos (ej. enviar cantidad negativa o IDs inexistentes) devuelven respuestas de error HTTP claras (`400 Bad Request` o `440 Not Found`).

### 🔷 B. Lógica de Negocio y Reglas Especiales (12 pts)
- [ ] **Trazabilidad de Movimientos:** Cada registro guarda usuario, tipo de transacción, origen/destino y documento fuente.
- [ ] **Disparo de Alertas:** Probar manualmente que al hacer un `POST /movimientos` de SALIDA que baje el stock por debajo del PR, se cree la alerta de reposición.
- [ ] **Algoritmo de Duplicados Funcional:** El endpoint `/ordenes/posibles-duplicados` identifica correctamente las órdenes `OC-1041` y `OC-1042` ingresadas en la semilla.

### 🔷 C. Entregables y Repositorio (20 pts)
- [ ] **README.md Reproducible:** El README explica claramente:
  1. Requisitos previos (`Node.js v18+`, `PostgreSQL`).
  2. Pasos para clonar e instalar dependencias (`npm install`).
  3. Pasos para ejecutar migraciones y poblar la base de datos.
  4. Comando para iniciar la API (`npm start` / `npm run dev`).
  5. Ejemplos de llamadas a los endpoints (`cURL` o JSON de colección de Postman).
- [ ] **Video Demo (Máx 5 minutos):** Muestra:
  - Registro de un movimiento en vivo.
  - Generación de la alerta de reorden.
  - Consulta del endpoint de detección de compras duplicadas.
- [ ] **Informe PDF:** Completado con la Parte A, la arquitectura y el diagrama DER (máximo 15 páginas).

---

## 🚀 3. Opciones de Puntaje Extra (Hasta +10 Puntos)

Si les queda tiempo antes de la entrega, completen al menos uno de los siguientes puntos:

1. **Dashboard Web Sencillo (+3 a +4 pts):** Crear una interfaz HTML/JS básica (usando Bootstrap o React) que consuma la API y muestre en rojo los materiales bajo el punto de reorden y las OC duplicadas.
2. **Pruebas Automatizadas (+3 pts):** Implementar al menos 3 pruebas unitarias o de integración usando **Jest** o **Vitest** para testear el servicio `duplicados.js` y el cálculo de $PR$.
3. **Aplicación de Matriz de Aprobación (+3 pts):** Agregar un middleware que si la OC supera ¢250.000 la deje en estado `'PENDIENTE_APROBACION'` hasta que se llame al endpoint `PUT /ordenes/:id/aprobar`.