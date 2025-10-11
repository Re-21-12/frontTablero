# Script de Verificación - Keycloak Angular v19

## 🧪 **Pruebas Manuales para Validar la Implementación**

### **1. Verificar que la Configuración Básica Funciona**

```bash
# 1. Compilar el proyecto para verificar errores de TypeScript
ng build --configuration development

# 2. Ejecutar el proyecto en modo desarrollo
ng serve
```

### **2. Pruebas de Funcionalidad Keycloak**

#### **Test 1: Verificar Inicialización de Keycloak**

1. Abrir DevTools (F12) → Console
2. Buscar logs de inicialización de Keycloak
3. ✅ **Esperado:** Sin errores de inicialización

#### **Test 2: Verificar Intercepción de Tokens**

1. Abrir DevTools → Network tab
2. Realizar una petición a la API
3. ✅ **Esperado:** Header `Authorization: Bearer <token>` en las peticiones

#### **Test 3: Verificar Guard Funcional**

1. Intentar acceder a una ruta protegida sin estar logueado
2. ✅ **Esperado:** Redirección automática al login de Keycloak

#### **Test 4: Verificar Verificación de Roles**

1. Loguearse con un usuario que NO tenga los roles requeridos
2. Intentar acceder a una ruta con roles específicos
3. ✅ **Esperado:** Redirección a `/forbidden`

### **3. Pruebas de Métodos del AuthService**

#### **Consola del Navegador (F12)**

```typescript
// Obtener referencia al servicio (en el constructor de algún componente)
constructor(private auth: AuthService) {
  // Test en ngOnInit o método
  this.testKeycloakMethods();
}

async testKeycloakMethods() {
  try {
    // Test 1: Verificar autenticación
    const isAuth = await this.auth.isAuthenticatedWithKeycloak();
    console.log('¿Autenticado con Keycloak?', isAuth);

    // Test 2: Obtener token
    if (isAuth) {
      const token = await this.auth.getKeycloakToken();
      console.log('Token obtenido:', token ? 'SÍ' : 'NO');
    }

    // Test 3: Obtener roles
    const roles = this.auth.getKeycloakUserRoles();
    console.log('Roles del usuario:', roles);

    // Test 4: Verificar rol específico
    const hasAdminRole = this.auth.hasKeycloakRole('admin');
    console.log('¿Tiene rol admin?', hasAdminRole);

    // Test 5: Obtener perfil
    const profile = this.auth.getKeycloakUserProfile();
    console.log('Perfil del usuario:', profile);

  } catch (error) {
    console.error('Error en pruebas:', error);
  }
}
```

### **4. Verificar Migración Correcta del Guard**

#### **Buscar Referencias al Guard Deprecated**

```bash
# En terminal PowerShell
grep -r "KeycloakGuard" src/app/ --include="*.ts"
grep -r "keycloak.guard" src/app/ --include="*.ts"
```

#### **Verificar Importaciones Correctas**

```bash
# Buscar si se usa el nuevo guard funcional
grep -r "canActivateKeycloakAuth" src/app/ --include="*.ts"
grep -r "keycloak-functional.guard" src/app/ --include="*.ts"
```

### **5. Checklist de Verificación**

#### **✅ Configuración (app.config.ts)**

- [ ] Usa `provideKeycloak` ✅
- [ ] Configuración de Keycloak correcta ✅
- [ ] AuthInterceptor configurado ✅

#### **✅ Guards**

- [ ] `keycloak-functional.guard.ts` existe y funciona ✅
- [ ] `keycloak.guard.ts` marcado como deprecated ✅
- [ ] Rutas usan el guard funcional (pendiente migración)

#### **✅ Interceptor**

- [ ] Usa `inject(Keycloak)` directamente ✅
- [ ] Maneja errores correctamente ✅
- [ ] Fallback al token local funciona ✅

#### **✅ AuthService**

- [ ] Métodos de Keycloak actualizados ✅
- [ ] Usa `inject(Keycloak)` directamente ✅
- [ ] Manejo de roles mejorado ✅

### **6. Comandos de Diagnóstico**

#### **Verificar Dependencias**

```bash
# Verificar versiones de Keycloak
npm list keycloak-angular keycloak-js
```

#### **Buscar Errores de Compilación**

```bash
# Compilación estricta para detectar errores
ng build --aot --build-optimizer
```

#### **Verificar Estructura de Archivos**

```bash
# Listar archivos relacionados con Keycloak
find src/app -name "*keycloak*" -type f
```

### **7. Errores Comunes y Soluciones**

#### **Error: "Cannot inject Keycloak"**

```typescript
// Solución: Verificar que provideKeycloak está en app.config.ts
providers: [
  // ... otros providers
  provideKeycloak({
    /* config */
  }),
];
```

#### **Error: "createAuthGuard is not a function"**

```typescript
// Solución: Verificar importación correcta
import { createAuthGuard, AuthGuardData } from "keycloak-angular";
```

#### **Error: "Token not found"**

```typescript
// Solución: Verificar inicialización de Keycloak
// En el interceptor, verificar keycloak.authenticated antes de keycloak.token
```

### **8. Pasos Siguientes**

1. **Migrar rutas restantes** del guard deprecated al funcional
2. **Probar todas las funcionalidades** con usuarios reales
3. **Configurar el interceptor nativo** para mayor seguridad
4. **Eliminar archivos deprecated** una vez completada la migración

---

**Nota:** Ejecutar estas pruebas después de cada cambio para asegurar que la migración no rompe funcionalidades existentes.
