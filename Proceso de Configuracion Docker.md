# Proceso de Configuracion Docker

Guia para levantar este proyecto de Odoo 14 con Docker y Docker Compose en Windows.

## 1. Prerrequisitos

- Tener Docker Desktop instalado.
- Tener Docker Desktop iniciado antes de correr los comandos.
- Ejecutar los comandos desde la raiz del proyecto:

```powershell
cd <RUTA_DEL_PROYECTO>
```

Verificar que Docker esta disponible:

```powershell
docker --version
docker compose version
docker info
```

Si `docker info` falla con un mensaje parecido a `failed to connect to the docker API`, inicia Docker Desktop:

```powershell
docker desktop start
```

## 2. Archivos principales

El proyecto usa estos archivos para ejecutar Odoo:

- `.env`: variables de entorno del stack.
- `docker-compose.yaml`: servicios de Odoo y PostgreSQL.
- `Dockerfile`: imagen personalizada basada en `odoo:14.0`.
- `config/odoo.conf`: configuracion interna de Odoo.
- `addons/`: modulos personalizados incluidos en el proyecto.
- `addons-customize/`: carpeta adicional montada en Odoo para futuros modulos.

## 3. Configuracion

Crear o validar el archivo `.env` a partir de la plantilla `copy.env`.

```powershell
copy copy.env .env
```

En `.env` se deben revisar y ajustar estos campos segun el ambiente.

Ejemplo de estructura:

```env
WEB_HOST=odoo_web
WEB_IMAGE_NAME=odoo_custom
WEB_IMAGE_TAG=dev
WEB_PORT=8069

DB_IMAGE=postgres
DB_TAG=10
DB_HOST=odoo_db
DB_PORT=5432
DB_NAME=odoo_dev
DB_USER=odoo_user
DB_PASSWD=<DEFINIR_PASSWORD_SEGURO>
```

Notas:

- Los nombres de contenedores, imagenes, versiones y puertos no suelen ser sensibles, pero pueden cambiar segun el equipo o ambiente.
- `DB_PASSWD` si es sensible: no lo documentes con el valor real.
- Evita subir `.env` al repositorio.

Crear o validar el archivo `config/odoo.conf` a partir de la plantilla `config/copy.odoo.conf`.

```powershell
copy config\copy.odoo.conf config\odoo.conf
```

En `config/odoo.conf` se deben revisar estos campos.

Ejemplo de estructura:

```ini
addons_path = /mnt/extra-addons,/mnt/extra-addons-customize
admin_passwd = <DEFINIR_CLAVE_MAESTRA_ODOO>
db_host = odoo_db
db_user = odoo_user
db_password = <MISMO_VALOR_DE_DB_PASSWD>
db_port = 5432
```

Importante:

- `DB_HOST` en `.env` debe coincidir con `db_host` en `config/odoo.conf`.
- `DB_PASSWD` en `.env` debe coincidir con `db_password` en `config/odoo.conf`.
- `admin_passwd` es sensible porque permite crear, restaurar y administrar bases de datos desde Odoo.
- Evita subir `config/odoo.conf` al repositorio.

## 4. Levantar el proyecto

Construir la imagen y levantar los contenedores:

```powershell
docker compose up -d --build
```

Verificar que los contenedores estan corriendo:

```powershell
docker compose ps
```

El resultado esperado debe mostrar:

- El servicio de PostgreSQL corriendo.
- El servicio de Odoo corriendo.
- Los puertos locales publicados segun lo definido en `.env`.

## 5. Abrir Odoo

Abrir en el navegador:

```text
http://127.0.0.1:<PUERTO_LOCAL_ODOO>
```

Ejemplo, si `WEB_PORT` es `8069`:

```text
http://127.0.0.1:8069
```

Si es la primera ejecucion, Odoo mostrara la pantalla para crear o restaurar una base de datos.

## 6. Ver logs

Logs del servicio web de Odoo:

```powershell
docker compose logs -f web
```

Logs de PostgreSQL:

```powershell
docker compose logs -f db
```

Ultimas lineas de logs:

```powershell
docker compose logs --tail=80 web
```

## 7. Detener el proyecto

Detener y remover los contenedores, conservando los volumenes de datos:

```powershell
docker compose down
```

Volver a levantar:

```powershell
docker compose up -d
```

## 8. Reiniciar desde cero

Usar este comando solo si quieres borrar la base de datos y los datos persistentes de Odoo:

```powershell
docker compose down -v
docker compose up -d --build
```

Esto elimina los volumenes:

- Volumen de datos de PostgreSQL.
- Volumen de datos de Odoo.

## 9. Problemas comunes

### Docker Desktop no esta iniciado

Error comun:

```text
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
```

Solucion:

```powershell
docker desktop start
docker info
```

Despues vuelve a correr:

```powershell
docker compose up -d --build
```

### Un puerto ya esta ocupado

Si el puerto local configurado para Odoo ya esta ocupado, cambia `WEB_PORT` en `.env`.

Ejemplo:

```env
WEB_PORT=8070
```

Luego recrea los contenedores:

```powershell
docker compose up -d
```

### Odoo no conecta con PostgreSQL

Revisar que `DB_HOST` en `.env` coincida con `db_host` en `config/odoo.conf`.

Configuracion esperada, usando el mismo valor en ambos archivos.

Ejemplo:

```env
DB_HOST=odoo_db
```

```ini
db_host = odoo_db
```

## 10. Comandos rapidos

```powershell
docker compose ps
docker compose logs -f web
docker compose down
docker compose up -d --build
```
