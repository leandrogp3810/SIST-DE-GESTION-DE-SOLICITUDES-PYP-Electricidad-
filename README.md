# Sistema de Gestión de Solicitudes — P&P Electricidad S.R.L.

![Astro](https://img.shields.io/badge/Astro-Framework-orange?style=flat&logo=astro)
![Status](https://img.shields.io/badge/Deploy-Netlify-blue?style=flat&logo=netlify)


Sistema web desarrollado con **Astro** para la gestión integral de solicitudes, pedidos, reclamos, productos y usuarios de **P&P Electricidad S.R.L.**

El sistema brinda herramientas tanto para **Clientes** como para **Administradores**, optimizando los procesos internos y externos con una arquitectura moderna, rápida y fácil de mantener.

---

## 🌐 **Demo en Producción**

👉 **Sitio Web:**  
https://pypelectricidad.netlify.app/

*(La versión desplegada se actualiza automáticamente con cada commit a la rama configurada en Netlify.)*

---

## 🚀 **Funcionalidades Principales**

### 👤 Cliente
- Registro e inicio de sesión.
- Catálogo de productos con imágenes, precios y stock actualizado.
- Carrito de compras para generar solicitudes.
- Seguimiento de estado del pedido:
  - Pendiente  
  - Aprobado  
  - Rechazado  
  - En distribución
- Sistema de reclamos:
  - Creación de reclamos asociados a pedidos.
  - Adjuntar imágenes como evidencia.
  - Ver respuesta y resolución del administrador.

### 🛡️ Administrador
- Gestión de solicitudes (aprobar, rechazar, eliminar).
- Gestión completa del catálogo de productos (CRUD).
- Control de stock, precios e imágenes.
- Gestión de reclamos con evidencia adjunta.
- Administración de usuarios:
  - Cambiar roles.
  - Eliminar usuarios con borrado en cascada.
- Sección de reportes y control de despachos.

---

## 🛠️ **Tecnologías Utilizadas**
- **Astro** — Framework principal basado en arquitectura de islas.
- **Nanostores** / `@nanostores/persistent` — Gestión global del estado + persistencia en `localStorage`.
- **JavaScript / TypeScript** — Lógica del cliente.
- **CSS3** — Estilos personalizados, livianos y responsivos.

---

## 📦 **Estructura del Proyecto**

src/
├── components/
│ ├── admin/
│ ├── client/
│ └── shared/
├── layouts/
│ └── Layout.astro
├── pages/
│ ├── index.astro
│ ├── register.astro
│ ├── admin.astro
│ └── client.astro
├── stores/
│ ├── appStore.ts
│ └── products.ts
└── styles/
└── global.css


---

## 🔧 **Instalación y Ejecución Local**



1 Instalar dependencias
npm install

2 Ejecutar en modo desarrollo
npm run dev


La aplicación correrá en:

👉 http://localhost:4321

📦 Persistencia de Datos

El sistema utiliza localStorage mediante Nanostores para simular una base de datos local.

Usuario administrador por defecto:

Usuario: admin
Contraseña: admin123


Para testear como usuario nuevo, usar modo incógnito o limpiar localStorage.
