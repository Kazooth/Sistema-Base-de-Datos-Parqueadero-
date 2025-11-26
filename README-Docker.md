# Dockerización del proyecto Parqueadero

Pasos para construir y ejecutar localmente usando Docker Compose.

1) Construir y levantar los servicios (backend + MySQL):

```bash
docker compose build
docker compose up -d
```

2) Ver logs del backend:

```bash
docker compose logs -f app
```

3) Parar y eliminar contenedores:

```bash
docker compose down
```

```markdown
# Dockerización del proyecto Parqueadero

Este documento explica cómo ejecutar el proyecto (backend Spring Boot + frontend Vite + MySQL) con Docker Compose, cómo funcionan los healthchecks, el script `wait-for` y cómo conectarse desde herramientas externas (por ejemplo DBeaver).

Requisitos
- Docker (20+) y Docker Compose.

Archivos relevantes
- `Dockerfile` — multi-stage build: construye el frontend (Node/Vite), copia `dist` dentro de `src/main/resources/static/app` y compila el JAR.
- `docker-compose.yml` — define servicios `app` y `db` (MySQL). Ahora usa `env_file: .env` y `healthcheck` para la base de datos.
- `.env` — variables de entorno usadas por `docker-compose` (credenciales, nombre de la BD). **No** comprometer en repositorios públicos.
- `scripts/wait-for.sh` — script que hace que el contenedor `app` espere a que `db:3306` esté disponible antes de ejecutar el JAR.

Quick start (entorno local)
1. Asegúrate de tener el archivo `.env` con las credenciales (ya existe una plantilla en el repo). Ejemplo mínimo:

```env
MYSQL_DATABASE=parqueadero_db
MYSQL_USER=Kevinfelipe
MYSQL_PASSWORD=123456Kevinf!09
MYSQL_ROOT_PASSWORD=rootpass
SERVER_PORT=8081
```

2. Construir imágenes y levantar contenedores:

```bash
docker compose build --no-cache
docker compose up -d
```

3. Verificar que la app esté accesible (el endpoint raíz redirige a la SPA):

```bash
curl -I http://localhost:8081/
# debe responder 302 Location: /app/index.html
curl http://localhost:8081/app/index.html
```

4. Ver logs del backend en tiempo real:

```bash
docker compose logs -f app
```

5. Parar y (opcionalmente) eliminar contenedores/volúmenes:

```bash
docker compose down
```

Notas sobre el arranque y robustez
- El servicio `db` tiene un `healthcheck` (comando `mysqladmin ping`). El contenedor `app` usa `scripts/wait-for.sh` para esperar a que `db:3306` acepte conexiones antes de lanzar el JAR — esto reduce errores de conexión durante la inicialización.
- Si quieres más robustez puedes aumentar `retries`/`interval` del `healthcheck` en `docker-compose.yml`.

Frontend
- El resultado del `npm run build` en `frontend/` se incluye en el JAR en `static/app`. La SPA se sirve desde `/app/index.html` y los assets se referencian con la base `/app/`.
- Para desarrollo rápido del frontend sin reconstruir el contenedor:

```bash
cd frontend
npm install
npm run dev   # Vite dev server (habitualmente http://localhost:5173)
```

Si desarrollas el frontend y quieres ver los cambios integrados en el backend dockerizado, reconstruye la imagen:

```bash
docker compose build --no-cache
docker compose up -d
```

API y paginación
- El endpoint paginado para vehículos activos es:

```
GET /api/vehiculos/activos?page=0&size=10
```

Dev Tools / DB (DBeaver)
- Conexión MySQL (desde tu máquina):
	- Host: `localhost`
	- Puerto: `3306`
	- Base de datos: `parqueadero_db`
	- Usuario: `Kevinfelipe`
	- Contraseña: `123456Kevinf!09`
	- JDBC URL: `jdbc:mysql://localhost:3306/parqueadero_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`

Seguridad y buenas prácticas
- Actualmente `.env` se encuentra en el workspace para conveniencia. No lo subas a repositorios públicos; usa `docker secret` o variables CI/CD en entornos de producción.
- Puedes mover credenciales a un gestor de secretos y mantener un `.env.example` con valores ficticios en el repo.

Problemas comunes
- Si la app intenta conectarse a la BD antes de que ésta esté lista verás errores JDBC. El `wait-for.sh` y el `healthcheck` minimizan este problema; revisa `docker compose logs db` para ver la inicialización de MySQL.
- Si los assets del frontend no cargan desde `/`, asegúrate de que `frontend/vite.config.ts` tiene `base: '/app/'` y que reconstruiste la imagen.

¿Quieres que añada a este README instrucciones para desplegar en producción (ej. variables extra, optimizaciones, uso de Docker Swarm/Kubernetes) o prefieres que añada un apartado de troubleshooting con comandos concretos que ya te sean útiles?
```
