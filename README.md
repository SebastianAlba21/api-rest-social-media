# API RESTful para Red Social en JavaScript con Express

Esta API RESTful está diseñada para ser utilizada en una red social y está desarrollada en JavaScript con Express.

## Rutas Disponibles

- `GET /prueba-follow`: Ruta de prueba para seguimiento.
- `POST /save`: Guarda una nueva relación de seguimiento. Requiere autenticación.
- `DELETE /unfollow/:id`: Elimina una relación de seguimiento existente. Requiere autenticación.
- `GET /following/:id?/:page?`: Obtiene la lista de usuarios que sigue el usuario dado por id. También se puede especificar una página para paginación. Requiere autenticación.
- `GET /followers/:id?/:page?`: Obtiene la lista de seguidores del usuario dado por id. También se puede especificar una página para paginación. Requiere autenticación.
- `GET /prueba-publi`: Ruta de prueba para publicaciones.
- `POST /save`: Crea una nueva publicación. Requiere autenticación.
- `GET /detail/:id`: Obtiene los detalles de una publicación dada por id. Requiere autenticación.
- `DELETE /remove/:id`: Elimina una publicación existente. Requiere autenticación.
- `GET /user/:id/:page?`: Obtiene las publicaciones del usuario dado por id. También se puede especificar una página para paginación. Requiere autenticación.
- `POST /upload/:id`: Carga un archivo de imagen para una publicación dada por id. Requiere autenticación y un archivo de imagen.
- `GET /media/:file`: Obtiene una imagen cargada en una publicación dada por file.
- `GET /feed/:page?`: Obtiene las publicaciones de los usuarios que sigue el usuario autenticado. También se puede especificar una página para paginación. Requiere autenticación.
- `GET /prueba-usuario`: Ruta de prueba para usuarios.
- `POST /register`: Registra un nuevo usuario.
- `POST /login`: Inicia sesión con un usuario existente.
- `GET /profile/:id`: Obtiene el perfil del usuario dado por id. Requiere autenticación.
- `GET /list/:page?`: Obtiene una lista de usuarios. También se puede especificar una página para paginación. Requiere autenticación.
- `PUT /update`: Actualiza los datos de un usuario. Requiere autenticación.
- `POST /upload`: Carga un archivo de imagen para el perfil del usuario autenticado. Requiere autenticación y un archivo de imagen.
- `GET /avatar/:file`: Obtiene la imagen de perfil cargada por un usuario dada por file.
- `GET /counters/:id`: Obtiene las estadísticas de seguimiento del usuario dado por id. Requiere autenticación.

## Requerimientos

- Node.js
- Express
- JWT para autenticación
- Multer para cargar archivos
- Bcrypt para encriptar contraseñas

## Instalación y Configuración

1. Clonar el repositorio: `git clone https://github.com/tu-usuario/repositorio.git`
2. Instalar dependencias: `npm install`
3. Configurar las variables de entorno en un archivo .env en la raíz del proyecto.
4. Ejecutar la aplicación: npm start.
5. La aplicación estará disponible en http://localhost:3000.
   
## Variables de Entorno

Las variables de entorno necesarias para la aplicación son las siguientes:
 
1. PORT: Puerto en el que se ejecutará la aplicación.
2. MONGO_URI: URL de conexión a la base de datos MongoDB.
3. JWT_SECRET: Clave secreta para la autenticación JWT.
4. UPLOADS_FOLDER: Carpeta donde se almacenarán los archivos cargados.
5. MAX_FILE_SIZE: Tamaño máximo permitido para cargar un archivo en bytes.

## Contribuciones

Las contribuciones son bienvenidas y agradecidas. Si desea contribuir, puede enviar un pull request con sus cambios o informar de algún problema o sugerencia en la sección de issues.
Licencia

## Licencia

Este proyecto está bajo la Licencia MIT. Puede consultar el archivo LICENSE para más detalles.
