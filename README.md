# Proyecto de Microservicios con Spring Cloud + Angular

Aplicación distribuida de gestión con:

- **Frontend**: Angular 22 (RC en `localhost:4200`)
- **Backend**: Spring Boot 4 + Spring Cloud 2025.1 (Java 17), organizado en microservicios

## Arquitectura

```
                    +----------------------------------------------+
Browser (Angular) ->|  API Gateway  (puerta de enlace)  :8080      |
                    +----------------------------------------------+
                        |                    |                    |
                 lb://alumnos         lb://administracion   (descubrimiento)
                        |                    |
              +------------------+  +---------------------+
              |  alumnos :8101   |  | administracion :8102 |
              |  H2 ./data/alumnos|  | H2 ./data/administracion |
              +--------+---------+  +----------+----------+
                       |                        |
                       +---- RabbitMQ (5672) ---+
                             (mensajería)

  Registry (Eureka) :8761  <- todos los servicios se registran aqui
  Config Server     :8888  <- centraliza la configuracion de cada microservicio
```

### Componentes del backend

| Módulo              | Carpeta                 | Puerto | Descripción |
|---------------------|-------------------------|--------|-------------|
| Registry (Eureka)   | `backend/registry`      | 8761   | Descubrimiento de servicios. Todos se registran aquí y el gateway los localiza |
| Config Server       | `backend/config-server` | 8888   | Centraliza la configuración (`alumnos.yml`, `administracion.yml`, `gateway.yml`) |
| API Gateway         | `backend/gateway`       | 8080   | Puerta de enlace con rutas `/api/alumnos/**` y `/api/administracion/**`, CORS y balanceo `lb://` |
| microservicio alumnos | `backend/alumnos`     | 8101   | CRUD de alumnos (tabla `ALUMNOS` en H2). Publica eventos `alumno.creado` |
| microservicio administracion | `backend/administracion` | 8102 | CRUD de docentes (tabla `DOCENTES` en H2). Publica eventos `docente.creado` |
| RabbitMQ            | `docker-compose.yml`    | 5672 / 15672 | Broker de mensajería. Los microservicios publican y consumen eventos entre sí |

### Mensajería (RabbitMQ)

- Exchange `microservicios.exchange` (topic).
- **alumnos** publica `alumno.creado`; **administracion** consume ese evento (cola `microservicios.cola.administracion`, binding `alumno.*`).
- **administracion** publica `docente.creado`; **alumnos** consume ese evento (cola `microservicios.cola.alumnos`, binding `docente.*`).
- Los eventos se ven en la consola de cada servicio (`ADMINISTRACION | Evento recibido desde RabbitMQ: ...`).

## Requisitos

- Java 17 (JDK)
- Node.js 18.19+ (npm)
- Docker (para RabbitMQ)
- Maven se descarga solo con el wrapper `mvnw`

## Puesta en marcha

### 1) RabbitMQ

```powershell
docker compose up -d
```

Consola de gestión: http://localhost:15672 (`guest` / `guest`)

### 2) Compilar el backend (primera vez)

```powershell
backend\registry\mvnw.cmd package -DskipTests
backend\config-server\mvnw.cmd package -DskipTests
backend\alumnos\mvnw.cmd package -DskipTests
backend\administracion\mvnw.cmd package -DskipTests
backend\gateway\mvnw.cmd package -DskipTests
```

### 3) Levantar los microservicios

**Opción A – Script automático** (recomendado: usa las bases H2 de la carpeta `data\`):

```powershell
.\iniciar-backend.ps1           # levanta los 5 servicios
.\detener-backend.ps1           # los detiene (y opcionalmente RabbitMQ)
```

**Opción B – Individual desde cada IDE** (Eclipse/IntelliJ/VS Code): ejecutar la clase `*Application` de cada proyecto. Orden sugerido: `registry` → `config-server` → `alumnos` + `administracion` → `gateway`.

### 4) Frontend Angular

```powershell
cd frontend
npm install
npm start        # http://localhost:4200
```

El frontend consume siempre el **API Gateway** (`http://localhost:8080`), nunca los microservicios directamente.

## Prueba rápida

```powershell
# Listar alumnos a través del gateway
curl http://localhost:8080/api/alumnos

# Crear un alumno (dispara el evento alumno.creado en RabbitMQ)
curl -X POST http://localhost:8080/api/alumnos -H "Content-Type: application/json" `-d '{"nombre":"Lucia","apellido":"Fernandez","curso":"Quimica"}'

# Crear un docente (dispara el evento docente.creado en RabbitMQ)
curl -X POST http://localhost:8080/api/administracion -H "Content-Type: application/json" `-d '{"nombre":"Juan","apellido":"Paredes","especialidad":"Historia"}'
```

Luego revisar la consola de `administracion` (recibió `alumno.creado`) y de `alumnos` (recibió `docente.creado`).

## Configuración centralizada

La configuración real de cada microservicio vive en `backend/config-server/src/main/resources/config/`:

- `application.yml` → valores compartidos (RabbitMQ, Eureka)
- `alumnos.yml`, `administracion.yml`, `gateway.yml` → puertos, datasource, rutas del gateway

Cada servicio la consume al arrancar vía `spring.config.import: optional:configserver:http://localhost:8888`.

## Puertos

| Servicio | URL |
|---|---|
| Frontend Angular | http://localhost:4200 |
| API Gateway | http://localhost:8080 |
| Registry (Eureka) | http://localhost:8761 |
| Config Server | http://localhost:8888 |
| Alumnos (directo) | http://localhost:8101/api/alumnos |
| Administración (directo) | http://localhost:8102/api/administracion |
| RabbitMQ (UI) | http://localhost:15672 |