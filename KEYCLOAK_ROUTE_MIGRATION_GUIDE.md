# Guía de Migración de Rutas - Keycloak Angular v19

## 📍 **Cómo Migrar Rutas del Guard Deprecated al Funcional**

### **Antes (Guard Deprecated)**

```typescript
// app.routes.ts - ANTES
import { Routes } from '@angular/router';
import { KeycloakGuard } from './core/guards/keycloak.guard'; // ❌ DEPRECATED

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminPageComponent,
    canActivate: [KeycloakGuard], // ❌ Guard basado en clase
    data: { roles: ['admin', 'super-admin'] }
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [KeycloakGuard], // ❌ Guard basado en clase
    data: { roles: ['admin'] }
  }
];
```

### **Después (Guard Funcional)**

```typescript
// app.routes.ts - DESPUÉS
import { Routes } from '@angular/router';
import {
  canActivateKeycloakAuth,
  canActivateChildKeycloakAuth
} from './core/guards/keycloak-functional.guard'; // ✅ MODERNO

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminPageComponent,
    canActivate: [canActivateKeycloakAuth], // ✅ Guard funcional
    data: { roles: ['admin', 'super-admin'] }
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [canActivateKeycloakAuth], // ✅ Guard funcional
    data: { roles: ['admin'] }
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [canActivateKeycloakAuth], // ✅ Sin roles = solo autenticado
    canActivateChild: [canActivateChildKeycloakAuth], // ✅ Para rutas hijas
    children: [
      {
        path: 'stats',
        component: StatsComponent,
        data: { roles: ['viewer', 'admin'] }
      }
    ]
  }
];
```

## 🔄 **Pasos de Migración**

### **Paso 1: Identificar Rutas que Usan el Guard Deprecated**

```bash
# Buscar archivos que importan el guard deprecated
grep -r "keycloak.guard" src/app/
```

### **Paso 2: Actualizar Importaciones**

```typescript
// Cambiar esto:
import { KeycloakGuard } from './core/guards/keycloak.guard';

// Por esto:
import { canActivateKeycloakAuth } from './core/guards/keycloak-functional.guard';
```

### **Paso 3: Actualizar Referencias en Rutas**

```typescript
// Cambiar esto:
canActivate: [KeycloakGuard]

// Por esto:
canActivate: [canActivateKeycloakAuth]
```

### **Paso 4: Verificar Funcionalidad**

1. ✅ Login/logout funciona correctamente
2. ✅ Verificación de roles funciona
3. ✅ Redirecciones funcionan correctamente
4. ✅ Página de acceso denegado (/forbidden) funciona

## 🛡️ **Configuración de Roles**

### **Roles de Realm**
```typescript
// Para roles que vienen directamente del realm
data: { roles: ['admin', 'user', 'moderator'] }
```

### **Roles de Resource/Client**
```typescript
// Para roles específicos del cliente/aplicación
data: { roles: ['frontend-admin', 'frontend-user'] }
```

### **Solo Autenticación (Sin Roles)**
```typescript
// Solo verificar que esté autenticado, sin roles específicos
canActivate: [canActivateKeycloakAuth]
// NO incluir data: { roles: [...] }
```

## ⚡ **Ventajas del Guard Funcional**

### ✅ **Mejores Prácticas de Angular**
- Alineado con Angular moderno (v14+)
- Funciones en lugar de clases
- Mejor tree-shaking

### ✅ **Más Flexible**
- Fácil de testear
- Lógica reutilizable
- Mejor composición

### ✅ **Compatible con Keycloak v19+**
- Usa `createAuthGuard` oficial
- Acceso directo a `AuthGuardData`
- Compatible con futuras actualizaciones

## 🧪 **Testing del Guard Funcional**

```typescript
// Ejemplo de test para el guard funcional
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { canActivateKeycloakAuth } from './keycloak-functional.guard';

describe('Keycloak Functional Guard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // configuración de testing
    });
    router = TestBed.inject(Router);
  });

  it('should allow access for authenticated users with correct roles', () => {
    // test implementation
  });
});
```

## 🚨 **Problemas Comunes y Soluciones**

### **Error: Cannot find name 'canActivateKeycloakAuth'**
```typescript
// Solución: Verificar importación
import { canActivateKeycloakAuth } from './core/guards/keycloak-functional.guard';
```

### **Error: Redirección infinita**
```typescript
// Problema: Guard mal configurado
// Solución: Verificar que la lógica de autenticación sea correcta
```

### **Error: Roles no reconocidos**
```typescript
// Problema: Nombres de roles incorrectos
// Solución: Verificar roles en Keycloak Admin Console
```

---

**Nota:** Una vez completada la migración de todas las rutas, el archivo `keycloak.guard.ts` puede ser eliminado completamente.
