# Teatro Mora Virtual

Plataforma de eventos teatrales con cola virtual y foros interactivos.

Desarrollado por:

- Sebastián Alvarado ([GitHub](https://github.com/Sealra))
- Maximiliano Ponce ([GitHub](https://github.com/massi-ponce))
- Camilo Vera ([GitHub](https://github.com/caverav))
- Joanna Da Silva ([GitHub](https://github.com/JoannaDaSilva))

## Índice

- [Wiki del proyecto](#wiki-del-proyecto)
- [Videos de entregas](#videos-de-entregas)
- [Levantamiento](#levantamiento)
  - [Requisitos previos](#requisitos-previos)
  - [Instalación](#instalación)
  - [Configuración de Supabase](#configuración-de-supabase)
    - [Creación de proyecto](#creación-de-proyecto)
    - [Estructura de la base de datos](#estructura-de-la-base-de-datos)
    - [Configuración de autenticación](#configuración-de-autenticación)
  - [Variables de entorno](#variables-de-entorno)
  - [Ejecución del proyecto](#ejecución-del-proyecto)

## Wiki del proyecto

[Aquí](https://github.com/QAlityDevs/mora-virtual/wiki) se encuentra toda la documentación relevante del sistema desarrollado, incluyendo detalles técnicos, estrategia de pruebas, evidencia del trabajo y mucho más.

## Videos de entregas

- [Video entrega 1](https://www.youtube.com/watch?v=aY0UqvGblqA)
- [Video entrega 2](https://www.youtube.com/watch?v=ky4bXkyZnF4)
- [Video entrega 3](https://www.youtube.com/watch?v=1elRaPjRCO8)

## Levantamiento

### Requisitos previos

- Node.js 18.x o superior
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)

### Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/QAlityDevs/mora-virtual
cd mora-virtual
```

2. Instala las dependencias:

```bash
npm install
# o
yarn install
```

### Configuración de Supabase

#### Creación de proyecto

1. Crea una cuenta en [Supabase](https://supabase.com) si aún no tienes una.
2. Crea un nuevo proyecto desde el dashboard.
3. Anota la URL del proyecto y la anon key (clave anónima) que usarás más adelante.

#### Estructura de la base de datos

Ejecuta el siguiente script SQL en el Editor SQL de Supabase o ocupar pg_restore para reestablecer las tablas predeterminadas para el proyecto:

[dump.sql](./dump.sql)

#### Configuración de autenticación

1. En el panel de Supabase, ve a "Authentication" > "Providers".
2. Asegúrate de que el proveedor "Email" esté habilitado.
3. Puedes configurar otros proveedores como Google, Facebook, etc. si lo deseas.

### Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-publica
```

Reemplaza los valores con los de tu proyecto de Supabase.

### Ejecución del proyecto

1. Inicia el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
```

2. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
