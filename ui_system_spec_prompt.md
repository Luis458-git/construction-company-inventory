# 🎨 UI/UX Design Specification & Prompt for AI Code Generation

> **Instrucciones de uso:** Copia y pega todo el contenido de este documento en tu generador de interfaz (v0.dev, Cursor, Claude, ChatGPT, Tailwind Builder, etc.) para que cree una interfaz web impactante y moderna.

---

## 🎯 Prompt Principal para la IA Generadora de Front-End

```text
Actúa como un Diseñador UI/UX Senior y Desarrollador Front-End experto en Tailwind CSS y React. Necesito que crees una interfaz web dashboard moderna, limpia y sumamente atractiva para un sistema de "Control de Inventario y Gestión de Fugas de Valor" llamado "Constructora Del Valle S.A.".

Sigue al pie de la letra el sistema de diseño, la paleta de colores, la tipografía y los componentes detallados a continuación.
```

---

## 🎨 Sistema de Diseño y Paleta de Colores

### Concepto Estético: *Industrial Modern / Premium Construction Tech*
Una mezcla entre un software SaaS corporativo de alto nivel y la precisión de la ingeniería civil. Uso de bordes sutiles, vidrio esmerilado (*glassmorphism* fino), contrastes oscuros profundos en navegación y tarjetas limpias con tipografía impecable.

### Paleta de Colores (Tailwind CSS Config)

* **Primary / Brand (Azul Marino Industrial):** `#0F172A` (`slate-900`), `#1E3A8A` (`blue-900`), `#2563EB` (`blue-600`)
* **Background (Fondo General):** `#F8FAFC` (`slate-50`) o `#0B0F17` para modo oscuro.
* **Surface (Tarjetas y Contenedores):** `#FFFFFF` (`white`) con bordes en `#E2E8F0` (`slate-200`) y sombras suaves `shadow-sm hover:shadow-md`.
* **Accent / Alertas (Semáforo de Estado):**
  * 🔴 **Critical / Stock bajo PR / Duplicados:** `#EF4444` (`red-500`) / Fondo: `#FEF2F2` (`red-50`)
  * 🟠 **Warning / Reposición Próxima:** `#F59E0B` (`amber-500`) / Fondo: `#FFFBEB` (`amber-50`)
  * 🟢 **Success / Stock Conforme:** `#10B981` (`emerald-500`) / Fondo: `#ECFDF5` (`emerald-50`)
  * 🔵 **Info / Trazabilidad:** `#6366F1` (`indigo-500`) / Fondo: `#EEF2FF` (`indigo-50`)

---

## 📐 Estructura de la Interfaz (Layout & Vistas)

### 1. Sidebar de Navegación Lateral (Fijo)
* **Header Sidebar:** Logo de *Constructora Del Valle S.A.* con ícono de casco/grúa futurista y badge `v2.4 Live`.
* **Menú Principal:**
  * 📊 **Dashboard General** (KPIs de stock, alertas rápidas, accesos directos).
  * 📦 **Inventario de Materiales** (Tabla de insumos, estado de $PR$ y $SS$).
  * 🔄 **Movimientos & Trazabilidad** (Historial de entradas, salidas y traslados).
  * ⚠️ **Alertas de Reorden** (Alertas activas que requieren compra inmediata).
  * 🔍 **Auditoría de Fugas (OC)** (Detector inteligente de compras duplicadas y sobreprecios).

---

### 2. Vistas Principales a Generar

#### A. Dashboard Principal (Vista General de KPIs)
* **4 Tarjetas de Métricas Superiores (KPI Cards):**
  1. **Stock Total en Bodegas:** `3.850 unidades` (Ícono de bodega + gráfica pequeña *sparkline*).
  2. **Materiales Críticos (Bajo PR):** `2 Insumos` (Badge rojo parpadeante "Atención requerida").
  3. **Fuga de Valor Detectada (Mes):** `¢1.513.000` (Alerta visual con ícono de fuga de presupuesto).
  4. **Órdenes Duplicadas:** `1 Sospecha Activa` (Badge de riesgo alto).

#### B. Seccion: "Alertas Activas de Reposición" (Vista Prioritaria A5)
* Tarjetas estilo "Health Card" mostrando el material en estado crítico:
  * **Ejemplo 1 (Block 12x20x40):** Stock Actual: `2.800` | Punto Reorden: `3.600` | **Déficit: -800 unid** $\rightarrow$ [Boton Accion: *Emitir Orden de Compra*]
  * **Ejemplo 2 (Arena m³):** Stock Actual: `14` | Punto Reorden: `20` | **Déficit: -6 m³** $\rightarrow$ [Boton Accion: *Emitir Orden de Compra*]

#### C. Sección: "Detector de Fugas y Compras Duplicadas" (Vista Especial A3)
* Un banner de alerta destacada en rojo/amarillo que compare dos órdenes sospechosas cara a cara:
  * **OC-1041** vs **OC-1042** (Ambas de Proveedor A, 200 sacos de cemento, emitidas el 02/10 por `¢1.290.000`).
  * Muestra el cálculo del sobreprecio y un botón interactivo: `[Aprobar OC-1041]` | `[Anular Duplicado OC-1042]`.

#### D. Tabla Interactiva de Inventario de Materiales
* Columnas: `Código`, `Descripción`, `Categoría`, `Stock Actual`, `Punto Reorden (PR)`, `Stock Seguridad (SS)`, `Estado`, `Acciones`.
* Barra de búsqueda con filtros por categoría (`Cementos`, `Acero`, `Mampostería`, `Agregados`, `EPP`).

---

## 🛠️ Tecnologías Sugeridas para el Front-End

* **Framework:** React / Next.js o HTML5 Vanilla con Tailwind CSS.
* **Componentes UI:** Shadcn/UI, Radix UI o TailwindUI.
* **Íconos:** Lucide-React (`Box`, `AlertTriangle`, `TrendingDown`, `Truck`, `ShieldCheck`, `Layers`).
* **Gráficos:** Recharts o Chart.js (Gráfica de barras mostrando Stock Actual vs Punto de Reorden).

---

## 🤖 Prompt Corto para Copiar y Pegar en IAs de Código (v0.dev / Cursor / ChatGPT)

> *"Genera un Dashboard UI en React usando Tailwind CSS y Lucide Icons para un sistema de inventarios de construcción llamado 'Constructora Del Valle S.A.'. La pantalla debe incluir: 1) Un sidebar lateral oscuro elegante. 2) Cuatro tarjetas KPI superiores con sombras suaves. 3) Una tabla de inventario interactiva que resalte en rojo los productos bajo el punto de reorden (Block y Arena). 4) Una sección de alerta en la parte superior que muestre una compra duplicada detectada entre la OC-1041 y la OC-1042 por ¢1.290.000. Usa una paleta de colores azul marino profesional (`slate-900`), blanco puro, rojo de alerta y verde para insumos conformes. El diseño debe ser limpio, moderno y de calidad SaaS empresarial."*