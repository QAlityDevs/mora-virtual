# Teatro Virtual Mora

Este proyecto es una aplicación web desarrollada con Next.js que permite la gestión de eventos y actores para el Teatro Mora. Utiliza Supabase como backend para la autenticación y el almacenamiento de datos.

## Características

- **Autenticación de Usuarios**: Implementada con Supabase para gestionar el acceso a las rutas de administración.
- **Gestión de Actores**: Permite crear, editar y eliminar actores.

## Requisitos Previos

- Node.js (se utilizó versión 22)
- Una cuenta de Supabase
- Yarn o npm para la gestión de paquetes

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/QAlityDevs/mora-virtual.git
   cd mora-virtual
   ```

2. Instala las dependencias:

   ```bash
   npm install
   # o
   yarn install
   ```

3. Configura las variables de entorno:

   Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Supabase:

   ```plaintext
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

## Uso

Ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Contribución

Si deseas contribuir al proyecto, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -am 'feat(scope): description'`).
4. Sube tus cambios a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## Contacto

Para cualquier pregunta o comentario, por favor contacta a [camilo.verav@usm.cl](mailto:camilo.verav@usm.cl).
