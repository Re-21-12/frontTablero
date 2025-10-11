# Integración de Keycloak con Angular

## 📋 Resumen

Esta implementación proporciona una integración completa de Keycloak con tu aplicación Angular, incluyendo autenticación híbrida que puede funcionar tanto con Keycloak como con el sistema de autenticación local existente.

## 🚀 Características Implementadas

### 1. **Servicios Principales**

- **`AuthService`**: Servicio extendido con métodos híbridos para Keycloak
- **`KeycloakInitService`**: Inicialización de Keycloak
- **`KeycloakConfigService`**: Configuración y manejo de eventos de Keycloak

### 2. **Guards de Protección**

- **`KeycloakGuard`**: Protección de rutas usando Keycloak
- Compatible con el `PermissionGuard` existente

### 3. **Interceptores HTTP**

- **`AuthInterceptor`**: Actualizado para usar tokens de Keycloak automáticamente
- Fallback al sistema local si Keycloak no está disponible

### 4. **Componentes de UI**

- **Login Component**: Interfaz híbrida con opción de Keycloak
- **User Profile Component**: Vista completa de información de usuario

## 🔧 Configuración

### 1. **Ambiente de Desarrollo**

```typescript
// environment.ts
dev: {
  apiBaseUrl: 'http://localhost:5232/api',
  keycloak: {
    url: 'http://localhost:8080/auth',
    realm: 'master',
    clientId: 'frontend',
  },
}
```

### 2. **Inicialización en app.config.ts**

```typescript
{
  provide: APP_INITIALIZER,
  useFactory: KeycloakInitService.initializeKeycloak,
  multi: true,
  deps: [KeycloakService]
}
```

## 💻 Uso del Sistema Híbrido

### 1. **Autenticación**

```typescript
// Login con Keycloak
await this.authService.loginWithKeycloak();

// Login tradicional
this.authService.login(loginData).subscribe();

// Login híbrido (intenta Keycloak primero)
await this.authService.hybridLogin(loginData);
```

### 2. **Verificación de Autenticación**

```typescript
// Solo Keycloak
const isKeycloakAuth = await this.authService.isAuthenticatedWithKeycloak();

// Solo local
const isLocalAuth = this.authService.isAuthenticated();

// Híbrido (cualquiera de los dos)
const isAuth = await this.authService.isFullyAuthenticated();
```

### 3. **Obtención de Tokens**

```typescript
// Token de Keycloak (se actualiza automáticamente)
const keycloakToken = await this.authService.getKeycloakToken();

// Token local
const localToken = this.authService.getToken();
```

### 4. **Manejo de Roles y Permisos**

```typescript
// Roles de Keycloak
const hasRole = this.authService.hasKeycloakRole("admin");

// Permisos locales
const hasPermission = this.authService.hasPermission("Usuario:Crear");

// Híbrido
const hasHybridPermission = await this.keycloakConfigService.hasHybridPermission("admin");
```

## 🛡️ Protección de Rutas

### Usando KeycloakGuard

```typescript
{
  path: 'admin-keycloak',
  loadComponent: () => import('./admin.component'),
  canActivate: [KeycloakGuard],
  data: {
    roles: ['admin', 'moderator'] // Roles requeridos
  }
}
```

### Combinando Guards

```typescript
{
  path: 'secure-area',
  loadComponent: () => import('./secure.component'),
  canActivate: [KeycloakGuard, PermissionGuard],
  data: {
    roles: ['user'],
    requiredPermissions: ['Area:Consultar']
  }
}
```

## 🔄 Sincronización de Datos

### Automática

- El sistema sincroniza automáticamente los datos de Keycloak con el almacenamiento local
- Los tokens se actualizan automáticamente antes de expirar

### Manual

```typescript
// Sincronizar datos de Keycloak con localStorage
await this.authService.syncKeycloakWithLocal();

// Verificar y sincronizar estado
await this.keycloakConfigService.checkAndSyncAuthState();
```

## 📱 Componente de Login

El componente de login ahora incluye:

- **Toggle** entre login tradicional y Keycloak
- **Interfaz intuitiva** para cada método
- **Manejo de errores** específico para cada sistema
- **Verificación automática** de autenticación existente

## 👤 Componente de Perfil de Usuario

Muestra información completa:

- **Datos de Keycloak**: perfil, roles, etc.
- **Datos locales**: permisos, información del sistema
- **Vista consolidada**: información híbrida
- **Acciones**: sincronizar, actualizar, cerrar sesión

## 🔧 Configuración del Interceptor

El interceptor HTTP maneja automáticamente:

1. **Prioridad a Keycloak**: Intenta usar el token de Keycloak primero
2. **Actualización automática**: Renueva tokens próximos a expirar
3. **Fallback local**: Usa el token local si Keycloak no está disponible
4. **Manejo de errores**: Continúa sin token si ambos fallan

## 🚨 Manejo de Errores

### Eventos de Keycloak

```typescript
// Token expirado
keycloakInstance.onTokenExpired = () => {
  // Actualización automática
};

// Error de autenticación
keycloakInstance.onAuthError = () => {
  // Limpieza y redirección
};
```

### Estrategias de Recuperación

1. **Token expirado**: Actualización automática
2. **Error de conexión**: Fallback al sistema local
3. **Fallo general**: Limpieza completa y redirección al login

## 📋 Checklist de Implementación

- [x] ✅ Instalar dependencias (`keycloak-angular`, `keycloak-js`)
- [x] ✅ Configurar environment con datos de Keycloak
- [x] ✅ Crear servicios de inicialización y configuración
- [x] ✅ Implementar guard de Keycloak
- [x] ✅ Actualizar interceptor HTTP
- [x] ✅ Extender AuthService con métodos híbridos
- [x] ✅ Crear interfaz de login híbrida
- [x] ✅ Implementar componente de perfil de usuario
- [x] ✅ Agregar estilos CSS
- [x] ✅ Configurar APP_INITIALIZER

## 🔄 Próximos Pasos Recomendados

1. **Configurar el servidor Keycloak** con el realm y cliente apropiados
2. **Ajustar los roles y permisos** según tu estructura organizacional
3. **Personalizar la sincronización** de datos entre Keycloak y el sistema local
4. **Implementar logout global** si usas múltiples aplicaciones
5. **Agregar refresh token handling** más sofisticado si es necesario

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install keycloak-angular keycloak-js

# Ejecutar aplicación
npm start

# Verificar tipos
npm run type-check
```

## 📚 Recursos Adicionales

- [Documentación de Keycloak](https://www.keycloak.org/documentation)
- [keycloak-angular en GitHub](https://github.com/mauriciovigolo/keycloak-angular)
- [Configuración de Realm en Keycloak](https://www.keycloak.org/docs/latest/server_admin/#configuring-realms)

---

**¡La integración está completa y lista para usar!** 🎉
