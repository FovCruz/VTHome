# VTHome OS - Gestión de Suscripciones

**VTHome OS** es una plataforma integral para la administración y mantenimiento de clientes de servicios de streaming y suscripciones. Diseñada con un enfoque en la agilidad operativa, permite gestionar renovaciones, datos técnicos y estados de cuenta en tiempo real mediante un dashboard que refleja la cantidad de usuarios suscritos, ventas totales, alerta de stock (optimo o bajo), graficos de cantidad de ventas por meses, comparativa, productos mas vendidos y ventas del mes en curso.

## Stack Tecnológico

* **Frontend:** Next.js 15+ (App Router) con Turbopack.
* **Backend:** Laravel 11 (API Rest).
* **Estilos:** Tailwind CSS (Dark Mode nativo).
* **Base de Datos:** MySQL.
* **Infraestructura:** Docker (Laravel Sail).

## Características Principales

* **Módulo de Mantención Clientes:** CRUD completo (Crear, Ver, Editar, Eliminar).
* **Filtros Inteligentes:** Búsqueda reactiva por nombre/usuario y filtrado por plataforma o estado (Activo/Expirado).
* **Sistema de Renovaciones:** Gestión de planes predefinidos (1,2,3,4,6 meses, anual) y opción de ajuste manual.
* **Control Técnico:** Almacenamiento de direcciones MAC, Keys y credenciales de acceso para plataformas como Duplex, Magis e Ibo Player.
* **Interfaz Pro:** Dashboard oscuro optimizado para productividad.

## Instalación y Configuración

### Requisitos
* Docker & Docker Desktop.
* Node.js (v18+).
