# Sistema de Guías de Inspección

Sistema web para gestionar formularios de inspección, impresión de PDF, historial, configuración de usuarios y métricas del sistema. Está desarrollado con Next.js, React y Supabase, pensado para uso interno en entornos de inspección y cumplimiento.

## Descripción general

Este proyecto permite:

- gestionar un catálogo de formularios PDF
- buscar, filtrar y seleccionar formularios para impresión
- imprimir archivos desde el navegador con flujo secuencial
- mantener un historial de impresiones por usuario
- administrar usuarios y perfiles
- consultar métricas de uso del sistema por actividad e impresiones
- diferenciar acceso entre usuarios normales y administradores

## Stack tecnológico

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Base UI / Radix-style primitives
- ESLint

## Requisitos previos

Antes de ejecutar el proyecto, necesitas:

- Node.js 20 o superior
- npm
- una cuenta de Supabase con proyecto creado
- acceso a las claves del proyecto Supabase

## Estructura del proyecto

```text
.
├── public/
│   └── formularios/                  # PDFs usados por la app
├── scripts/
│   └── generar-seed-formularios.mjs  # genera seed de formularios desde archivos PDF
├── src/
│   ├── app/                          # rutas de Next.js App Router
│   ├── components/                   # UI reutilizable por módulo
│   ├── hooks/                        # hooks de negocio
│   ├── lib/                          # utilidades, Supabase y printing
│   ├── types/                        # tipos TS
│   └── ...
├── .env.example                      # plantilla de variables de entorno
├── .gitignore                        # excluye secretos y archivos locales
├── components.json                   # configuración de shadcn-like UI
├── eslint.config.mjs                 # configuración de lint
├── next.config.ts                    # configuración de Next.js
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── README.md
└── middleware.ts
```

## Variables de entorno

Crea un archivo local `.env.local` basándote en `.env.example` y completa tus valores reales.

Ejemplo de variables necesarias:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

Importante:

- nunca subas `.env.local` a GitHub
- no compartas claves de Supabase ni tokens de acceso
- mantén el `SUPABASE_SERVICE_ROLE_KEY` solo en entornos locales o seguros

## Instalación

1. Clona el proyecto:

```bash
git clone https://github.com/jpatryck04/sistema-guias.git
cd sistema-guias
```

2. Instala dependencias:

```bash
npm install
```

3. Crea tus variables de entorno:

```bash
cp .env.example .env.local
```

4. Completa los valores de Supabase en `.env.local`.

5. Ejecuta el proyecto:

```bash
npm run dev
```

Luego abre:

```text
http://localhost:3000
```

## Scripts disponibles

```bash
npm run dev        # desarrollo local
npm run build      # build de producción
npm run start      # ejecutar build compilado
npm run lint       # lint del proyecto
npm run generar-seed-formularios  # genera seed desde los PDFs de public/formularios
```

## Funcionalidades principales

### Autenticación y usuarios

- login con Supabase Auth
- perfiles en `profiles`
- roles `ADMINISTRADOR` y `OPERADOR`
- control de acceso por rutas y permisos

### Catálogo de formularios

- listado de formularios PDF
- búsqueda por nombre
- filtro por categoría
- estado activo/inactivo
- selección para impresión

### Impresión

- impresión secuencial de PDFs con flujo del navegador
- manejo de cola de documentos
- registro de historial de impresiones
- almacenamiento del nombre del usuario que imprimió

### Historial

- registro de impresiones con fecha, usuario, formulario y copias
- visualización para administración y usuarios

### Dashboard administrativo

- conteo de formularios activos
- impresiones por hora
- copias producidas
- usuarios activos
- top de formularios más utilizados

## Base de datos y seguridad

Este repositorio no incluye la carpeta completa de Supabase ni secretos de base de datos. La estructura de la base de datos debe manejarse desde tu proyecto de Supabase o desde un entorno controlado.

Se recomienda:

- mantener la base de datos en Supabase
- usar migraciones en un entorno seguro
- no subir dumps ni backups completos
- no incluir `.env.local` ni claves reales en GitHub

## Repositorio limpio para GitHub

Este proyecto fue preparado para no publicar información sensible. En particular:

- `.env.local` queda fuera del control de versiones
- la carpeta `supabase/` queda fuera del repositorio público
- solo se incluye código y estructura de la app, no credenciales ni datos internos

## Contribución

Si quieres colaborar:

1. crea una rama desde `main`
2. implementa tu cambio
3. valida con `npm run lint` y `npm run build`
4. abre un pull request con descripción clara

## Licencia

Este proyecto se entrega para uso interno o según la política de tu organización.

Si necesitas un tipo de licencia específica, puedes añadirla en un archivo `LICENSE` adicional.

## Nota final

Este README fue redactado para ser público en GitHub sin exponer secretos ni la información real de la base de datos. Si vas a publicar el repositorio, recomendamos revisar también:

- `.gitignore`
- variables de entorno
- configuración de Supabase
- archivos estáticos sensibles
