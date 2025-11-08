### Manual-tecnico
### Estructura del Repositorio — frontTablero
frontTablero/
├── .github/
│   └── workflows/
│       └── docker-publish.yml
│
├── .vs/
│   ├── CopilotIndices/17.13.433.20974/
│   ├── CodeChunks.db
│   ├── SemanticSymbols.db
│   ├── FileContentIndex
│   ├── 86acaba6-6231-4d72-bbeb-bb022c54af82.vsidx
│   ├── v17/
│   ├── .wsuo
│   ├── DocumentLayout.json
│   ├── ProjectSettings.json
│   ├── VSWorkspaceState.json
│   └── slnx.sqlite
│
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
│
├── public/
│   ├── favicon.ico
│   └── silent-check-sso.html
│
├── src/
│   ├── index.html
│   ├── main.ts
│   ├── styles.css
│   │
│   ├── environments/
│   │   └── environment.ts
│   │
│   ├── app/
│   │   ├── app.component.css
│   │   ├── app.component.html
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── keycloak.config.ts
│   │
│   ├── core/
│   │   ├── guards/
│   │   │   ├── keycloak-functional.guard.ts
│   │   │   └── permission.guard.ts
│   │   │
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   │
│   │   ├── interfaces/
│   │   │   ├── auth-interface.ts
│   │   │   ├── imagen.ts
│   │   │   ├── models.ts
│   │   │   ├── navigation.interface.ts
│   │   │   ├── permiso.ts
│   │   │   ├── role.ts
│   │   │   └── usuario.ts
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── country.service.ts
│   │   │   ├── cuarto.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── equipo.service.ts
│   │   │   ├── imagen.service.ts
│   │   │   ├── importar.service.ts
│   │   │   ├── jugador.service.ts
│   │   │   ├── loading.service.ts
│   │   │   ├── localidad.service.ts
│   │   │   ├── navigation.service.ts
│   │   │   ├── partido.service.ts
│   │   │   ├── permiso.service.ts
│   │   │   ├── permission.service.ts
│   │   │   ├── reporte.service.ts
│   │   │   ├── rol.service.ts
│   │   │   ├── role.service.ts
│   │   │   ├── socket.service.ts
│   │   │   ├── tablero.service.ts
│   │   │   └── usuario.service.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── permissions.ts
│   │   │   └── tablero.facade.ts
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── admin-page.component.css
│   │   │   ├── admin-page.component.html
│   │   │   └── admin-page.component.ts
│   │   │
│   │   ├── bienvenida-page/
│   │   │   ├── bienvenida-page.component.css
│   │   │   ├── bienvenida-page.component.html
│   │   │   └── bienvenida-page.component.ts
│   │   │
│   │   ├── emails/
│   │   │   ├── emails.component.css
│   │   │   ├── emails.component.html
│   │   │   └── emails.component.ts
│   │   │
│   │   ├── equipos/
│   │   │   ├── equipos-page.component.css
│   │   │   ├── equipos-page.component.html
│   │   │   └── equipos-page.component.ts
│   │   │
│   │   ├── historial/
│   │   │   ├── historial.component.css
│   │   │   ├── historial.component.html
│   │   │   ├── historial.component.spec.ts
│   │   │   └── historial.component.ts
│   │   │
│   │   ├── home/
│   │   │   ├── home-page.component.css
│   │   │   ├── home-page.component.html
│   │   │   └── home-page.component.ts
│   │   │
│   │   ├── jugadores/
│   │   │   ├── jugadores-page.component.css
│   │   │   ├── jugadores-page.component.html
│   │   │   └── jugadores-page.component.ts
│   │   │
│   │   ├── localidades/
│   │   │   ├── localidades-page.component.css
│   │   │   ├── localidades-page.component.html
│   │   │   └── localidades-page.component.ts
│   │   │
│   │   ├── login/
│   │   │   ├── login.component.css
│   │   │   ├── login.component.html
│   │   │   ├── login.component.spec.ts
│   │   │   └── login.component.ts
│   │   │
│   │   ├── partidos/
│   │   │   ├── partidos-page.component.css
│   │   │   ├── partidos-page.component.html
│   │   │   └── partidos-page.component.ts
│   │   │
│   │   ├── recursos/
│   │   │   ├── imagenes/
│   │   │   │   ├── imagenes.component.css
│   │   │   │   ├── imagenes.component.html
│   │   │   │   └── imagenes.component.ts
│   │   │   │
│   │   │   ├── importar/
│   │   │   │   ├── importar.component.css
│   │   │   │   ├── importar.component.html
│   │   │   │   ├── importar.component.spec.ts
│   │   │   │   ├── importar.component.ts
│   │   │   │   └── importar.model.ts
│   │   │   │
│   │   │   ├── recursos-page.component.css
│   │   │   ├── recursos-page.component.html
│   │   │   └── recursos-page.component.ts
│   │   │
│   │   ├── register/
│   │   │   ├── register.component.css
│   │   │   ├── register.component.html
│   │   │   ├── register.component.spec.ts
│   │   │   └── register.component.ts
│   │   │
│   │   ├── resultado-page/
│   │   │   ├── resultado-page.component.css
│   │   │   ├── resultado-page.component.html
│   │   │   ├── resultado-page.component.spec.ts
│   │   │   └── resultado-page.component.ts
│   │   │
│   │   ├── seguridad-admin/
│   │   │   ├── permisos/
│   │   │   │   ├── permisos.component.css
│   │   │   │   ├── permisos.component.html
│   │   │   │   └── permisos.component.ts
│   │   │   │
│   │   │   ├── roles/
│   │   │   │   ├── roles.component.css
│   │   │   │   ├── roles.component.html
│   │   │   │   └── roles.component.ts
│   │   │   │
│   │   │   └── seguridad-admin-page/
│   │   │       ├── seguridad-admin-page.component.css
│   │   │       ├── seguridad-admin-page.component.html
│   │   │       └── seguridad-admin-page.component.ts
│   │   │
│   │   ├── usuarios/
│   │   │   ├── usuarios.component.css
│   │   │   ├── usuarios.component.html
│   │   │   └── usuarios.component.ts
│   │   │
│   │   └── seleccion/
│   │       ├── seleccion.component.css
│   │       ├── seleccion.component.html
│   │       ├── seleccion.component.spec.ts
│   │       └── seleccion.component.ts
│
│   ├── shared/
│   │   ├── notify.service.spec.ts
│   │   ├── notify.service.ts
│   │   └── shared/components/
│   │       ├── global-loader/
│   │       │   ├── global-loader.component.css
│   │       │   ├── global-loader.component.html
│   │       │   └── global-loader.component.ts
│   │       │
│   │       └── user-profile/
│   │           ├── user-profile.component.css
│   │           ├── user-profile.component.html
│   │           └── user-profile.component.ts
│
├── assets/
│   └── sounds/
│       ├── end.mp3
│       └── start.mp3
│
├── .editorconfig
├── .gitignore
├── Dockerfile
├── README.md
├── angular.json
├── nginx-default.conf
├── package.json
├── package-lock.json
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json

### Diagrama de arquitectura
flowchart LR
    A[Usuario<br>Web / Móvil] --> B[Front-Tablero<br>Angular 17+]
    B -->|HTTP / JSON| C[Back-Tablero<br>.NET 8 Web API]
    C --> D[(SQL Server 2022)]
    B -->|Auth Redirect| E[Keycloak<br>Identity Server]
    E -->|Token JWT| B
    B -->|WebSocket| C
- Representa:
  ● Frontend Angular
  ● Backend API .NET
  ● Base de datos SQL Server
  ● Autenticación con Keycloak
  ● WebSockets para tablero en tiempo real

### Detalle de microservicios y lenguajes
Este repositorio NO es un microservicio, sino un frontend Angular.
El sistema completo se compone así:
| Módulo                  | Tecnología             | Tipo                            |
| ----------------------- | ---------------------- | ------------------------------- |
| **frontTablero**        | Angular 17, TypeScript | Frontend UI                     |
| **backTablero**         | .NET 8 Web API         | Backend principal               |
| **mailer-service**      | Node/NestJS            | Microservicio de correos        |
| **admin-proxykeycloak** | NestJS                 | Proxy de autenticación Keycloak |
| **mcp-service**         | Ruby on Rails          | Microservicio MCP               |
| **websockets**          | .NET Service / Node    | Canal de tiempo real            |
  ● FrontTablero únicamente consume APIs
  ● No expone endpoints
  ● Se comunica con backend + Keycloak

### Cómo levantar el sistema localmente
- Requisitos
  ● Node.js 18+
  ● Angular CLI (npm install -g @angular/cli)
  ● Docker Desktop (opcional)
  ● Git
- Levantar sin Docker
Instalar dependencias
  npm install
- Ejecutar en desarrollo
  ng serve -o
- La aplicación estará disponible en:
`http://localhost:4200`
- Levantar con Docker
Construir la imagen
  docker build -t front-tablero .
- Ejecutar contenedor
  docker run -d -p 80:80 front-tablero
- Frontend disponible en:
`http://localhost`

### Especificación de endpoints por microservicio
Solo consume servicios del backend Back-Tablero (.NET 8)
Los servicios Angular consultan endpoints como:
| Servicio Angular   | Endpoint Backend           |
| ------------------ | -------------------------- |
| auth.service.ts    | `/api/Auth/login`          |
| equipo.service.ts  | `/api/Equipo`              |
| jugador.service.ts | `/api/Jugador`             |
| partido.service.ts | `/api/Partido`             |
| cuarto.service.ts  | `/api/Cuarto`              |
| tablero.service.ts | `/api/Tablero`             |
| usuario.service.ts | `/api/Usuario`             |
| reporte.service.ts | `/api/Reporte`             |
| permiso.service.ts | `/api/Permiso`             |
| rol.service.ts     | `/api/Rol`                 |

### Seguridad
FrontTablero usa Keycloak como proveedor de identidad.
Flujo de autenticación
  ● El usuario abre /login
  ● Angular redirige hacia Keycloak (OAuth2 + OpenID Connect)
  ● Keycloak devuelve un JWT Access Token
  ● El token se guarda temporalmente en memoria del navegador
  ● Cada petición HTTP usa el token mediante auth.interceptor.ts
Implementación
   auth.interceptor.ts
req = req.clone({
  setHeaders: {
    Authorization: `Bearer ${token}`
  }
});
- permission.guard.ts
  ● Bloquea rutas sin permisos
  ● Valida roles como "Admin", "Editor", "Tablero"

### Bibliotecas/librerías utilizadas
- Frontend Angular
| Tipo          | Librería                     |
| ------------- | ---------------------------- |
| Framework     | Angular 17                   |
| HTTP          | Angular HttpClient           |
| Autenticación | Keycloak JS Adapter          |
| Real-time     | WebSocket API                |
| Ruteo         | Angular Router               |
| UI            | CSS nativo + estilos propios |
| Utilidades    | RxJS                         |
| Configuración | Angular Environments         |
| Interceptores | auth / error / loading       |

### Posibles errores y soluciones
# "Failed to load resource: API 500 / 404"
- Backend no está activo → Levantar Back-Tablero
# "No autorizado (401)"
- Token expirado → recargar página
- Keycloak no responde → revisar keycloak.config.ts
# Angular no inicia
- Error:
  Cannot find module '@angular/core'
- Ejecutar:
  npm install
# Docker Sirve pantalla en blanco
- Revisar nginx-default.conf
- Compilar producción:
  ng build --configuration production
# WebSocket no conecta
- Verificar puerto en backTablero
- Revisar socket.service.ts
