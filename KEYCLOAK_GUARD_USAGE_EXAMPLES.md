# Ejemplos de Uso - Guards Funcionales de Keycloak Angular v19+

## 🎯 **Guías de Implementación Basadas en el Ejemplo Oficial**

### **1. Guard para Un Solo Rol (canActivateAuthRole)**

Basado en el ejemplo oficial que proporcionaste, ideal para rutas que requieren exactamente un rol específico.

#### **Configuración en Rutas:**

```typescript
// app.routes.ts
import { Routes } from "@angular/router";
import { canActivateAuthRole } from "./core/guards/keycloak-functional.guard";

export const routes: Routes = [
  {
    path: "admin",
    component: AdminComponent,
    canActivate: [canActivateAuthRole],
    data: { role: "admin" }, // ⚠️ Nota: 'role' (singular)
  },
  {
    path: "moderator",
    component: ModeratorComponent,
    canActivate: [canActivateAuthRole],
    data: { role: "moderator" },
  },
  {
    path: "super-admin",
    component: SuperAdminComponent,
    canActivate: [canActivateAuthRole],
    data: { role: "super-admin" },
  },
];
```

#### **Características:**

- ✅ Requiere exactamente **un rol específico**
- ✅ Redirección automática a `/forbidden` si no tiene el rol
- ✅ Manejo automático de autenticación
- ✅ Verifica tanto realm roles como resource roles

---

### **2. Guard para Múltiples Roles (canActivateKeycloakAuth)**

Para rutas que pueden ser accedidas por usuarios con cualquiera de varios roles.

#### **Configuración en Rutas:**

```typescript
// app.routes.ts
import { canActivateKeycloakAuth } from "./core/guards/keycloak-functional.guard";

export const routes: Routes = [
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [canActivateKeycloakAuth],
    data: { roles: ["admin", "moderator", "user"] }, // ⚠️ Nota: 'roles' (plural)
  },
  {
    path: "reports",
    component: ReportsComponent,
    canActivate: [canActivateKeycloakAuth],
    data: { roles: ["admin", "analyst"] },
  },
  {
    path: "profile",
    component: ProfileComponent,
    canActivate: [canActivateKeycloakAuth],
    // Sin data.roles = solo requiere autenticación
  },
];
```

#### **Características:**

- ✅ El usuario necesita tener **AL MENOS UNO** de los roles especificados
- ✅ Si no se especifican roles, solo verifica autenticación
- ✅ Redirección automática a login si no está autenticado

---

### **3. Comparación de Implementaciones**

| Aspecto                    | `canActivateAuthRole`    | `canActivateKeycloakAuth`    |
| -------------------------- | ------------------------ | ---------------------------- |
| **Data Key**               | `role` (singular)        | `roles` (plural)             |
| **Tipo de Valor**          | `string`                 | `string[]`                   |
| **Lógica de Verificación** | Rol exacto requerido     | Cualquier rol de la lista    |
| **Sin Roles**              | Retorna `false`          | Retorna `true` (solo auth)   |
| **Uso Recomendado**        | Rutas con rol específico | Rutas con múltiples opciones |

---

### **4. Ejemplos Prácticos de Migración**

#### **Antes (Guard Deprecated):**

```typescript
// ❌ DEPRECATED - NO USAR
import { KeycloakGuard } from "./core/guards/keycloak.guard";

const routes: Routes = [
  {
    path: "admin",
    canActivate: [KeycloakGuard],
    data: { roles: ["admin"] },
  },
];
```

#### **Después (Guard Funcional):**

**Opción A: Para un solo rol específico**

```typescript
// ✅ RECOMENDADO para roles únicos
import { canActivateAuthRole } from "./core/guards/keycloak-functional.guard";

const routes: Routes = [
  {
    path: "admin",
    canActivate: [canActivateAuthRole],
    data: { role: "admin" }, // Cambio: role (singular)
  },
];
```

**Opción B: Para múltiples roles posibles**

```typescript
// ✅ RECOMENDADO para múltiples roles
import { canActivateKeycloakAuth } from "./core/guards/keycloak-functional.guard";

const routes: Routes = [
  {
    path: "admin",
    canActivate: [canActivateKeycloakAuth],
    data: { roles: ["admin", "super-admin"] }, // Mantener: roles (plural)
  },
];
```

---

### **5. Casos de Uso Específicos**

#### **Caso 1: Área Administrativa Estricta**

```typescript
// Solo administradores exactos
{
  path: 'system-admin',
  canActivate: [canActivateAuthRole],
  data: { role: 'system-administrator' }
}
```

#### **Caso 2: Área de Gestión Flexible**

```typescript
// Admins o moderadores
{
  path: 'management',
  canActivate: [canActivateKeycloakAuth],
  data: { roles: ['admin', 'moderator', 'supervisor'] }
}
```

#### **Caso 3: Área Solo Autenticada**

```typescript
// Solo verificar login, sin roles específicos
{
  path: 'user-area',
  canActivate: [canActivateKeycloakAuth]
  // Sin data = solo autenticación requerida
}
```

#### **Caso 4: Rutas Hijas con Diferentes Permisos**

```typescript
{
  path: 'dashboard',
  canActivate: [canActivateKeycloakAuth],
  canActivateChild: [canActivateChildKeycloakAuth],
  children: [
    {
      path: 'stats',
      component: StatsComponent,
      data: { roles: ['viewer', 'analyst'] }
    },
    {
      path: 'settings',
      component: SettingsComponent,
      data: { role: 'admin' } // Usar canActivateAuthRole si es muy restrictivo
    }
  ]
}
```

---

### **6. Configuración de Roles en Keycloak**

#### **Realm Roles:**

- `admin`, `user`, `moderator`
- Roles globales del realm

#### **Client/Resource Roles:**

- `frontend-admin`, `frontend-user`
- Roles específicos de la aplicación

#### **El guard verifica ambos tipos automáticamente:**

```typescript
// En el guard funcional:
const hasRequiredRole = (role: string): boolean => {
  // Primero verifica realm roles
  if (grantedRoles.realmRoles && grantedRoles.realmRoles.includes(role)) {
    return true;
  }

  // Luego verifica resource roles
  return Object.values(grantedRoles.resourceRoles).some((roles) => roles.includes(role));
};
```

---

### **7. Testing de los Guards**

```typescript
// Ejemplo de prueba en componente
export class TestComponent {
  constructor(private auth: AuthService) {}

  async testRoles() {
    const roles = this.auth.getKeycloakUserRoles();
    console.log("Roles disponibles:", roles);

    const hasAdmin = this.auth.hasKeycloakRole("admin");
    console.log("¿Tiene rol admin?", hasAdmin);
  }
}
```

---

**📝 Nota:** El ejemplo que proporcionaste sigue exactamente las mejores prácticas de Keycloak Angular v19+, y ahora está implementado en tu guard funcional como `canActivateAuthRole`.
