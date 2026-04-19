---
trigger: always_on
---

### **. Arquitectura Frontend (React / UI)**

* **Abstracción de Datos (Regla de Hooks):** Los componentes visuales jamás deben importar ni ejecutar llamadas directas al cliente de Supabase. Toda interacción con la base de datos debe encapsularse en *Custom Hooks* (ej. `useSocios()`, `usePartidos()`) o servicios asíncronos (`sociosService.ts`).  
* **Gestión de Estado Asíncrono:** Para el manejo de datos provenientes del servidor (caché, revalidación, estados de *loading* y *error*), es obligatorio el uso de bibliotecas especializadas como **TanStack Query** (React Query) o **SWR**. Esto evita llenar los componentes con múltiples `useState` y `useEffect`.  
* **Tipado Estricto (TypeScript):** El proyecto debe usar TypeScript. Además, se debe utilizar la CLI de Supabase para generar y mantener actualizados los tipos de la base de datos de forma automática (`supabase gen types typescript`). Queda prohibido el uso de tipado implícito (`any`).  
* **Componentización Atómica:** Ningún componente debe superar las 300 líneas de código. Si lo hace, debe dividirse separando la lógica de presentación (UI pura) de la lógica de negocio (Contenedores).

### **2\. Supabase y Base de Datos (PostgreSQL)**

* **Row Level Security (RLS) por Defecto:** Al crear cualquier tabla nueva, el RLS debe activarse inmediatamente. La regla base es "Denegar Todo". Solo se permite el acceso a través de políticas explícitas.  
  * *Ejemplo RLS Socios:* `auth.uid() = id` para lectura de datos propios.  
  * *Ejemplo RLS Admin:* Comprobar que el `role` en la tabla `profiles` sea `'admin'` mediante una función de Postgres (ej. `is_admin()`).  
* **Lógica de Negocio en Edge Functions/Triggers:** Procesos críticos como la validación de pagos, asignación inicial de roles al registrarse, o actualización de morosidad, deben ejecutarse en el servidor (Supabase Edge Functions o Database Triggers/pg\_cron), nunca dependiendo del lado del cliente.  
* **Control de Migraciones:** Los cambios en el esquema de la base de datos no deben hacerse manualmente en la interfaz de producción de Supabase. Se debe utilizar el sistema de migraciones locales de Supabase (`supabase db push`) para mantener un control de versiones estricto de las tablas y políticas.

### **3\. Seguridad e Integración de Pagos (MercadoPago)**

* **Cero Confianza en el Cliente (Zero-Trust):** El monto a cobrar de la cuota social jamás debe enviarse desde el frontend hacia la pasarela de pagos. El frontend solo envía la intención ("Pagar Cuota Socio Activo"), y es la Edge Function del servidor la que consulta el precio real en la base de datos y genera el link de pago.  
* **Validación de Firmas en Webhooks:** El *endpoint* que reciba las notificaciones de MercadoPago (Webhook) debe validar criptográficamente la firma del *payload* (x-signature) antes de impactar el pago en la base de datos para evitar ataques de suplantación.  
* **Gestión de Secretos:** Las claves privadas (ej. `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN`) solo deben existir en el entorno del servidor (.env local no comiteado y variables de entorno cifradas en producción).

### **4\. Control de Versiones y Despliegue (DevOps)**

* **Flujo de Ramas (Git Flow Simplificado):** \* `main`: Producción, siempre estable.  
  * `develop`: Entorno de pruebas y pre-producción.  
  * `feature/nombre-de-tarea`: Para cada nueva funcionalidad o corrección.  
* **Integración Continua (CI Gateways):** Antes de permitir un *Merge* hacia la rama `develop` o `main`, el código debe pasar automáticamente por verificaciones de *Linting* (ESLint estricto) y formateo (Prettier) configurados en *Pre-commit hooks* (usando Husky).  
* **Commits Semánticos:** Todo mensaje de commit debe seguir la convención estándar para generar *changelogs* automáticos (ej. `feat: agregar pasarela mercadopago`, `fix: corregir RLS en tabla profiles`).

### **5\. Experiencia de Usuario (UX) y Rendimiento**

* **Retroalimentación Visual Obligatoria:** Toda acción del usuario que implique una petición de red (ej. Iniciar sesión, subir comprobante, guardar noticia) debe bloquear el botón de acción correspondiente y mostrar un indicador visual de carga (*spinner* o *skeleton*) para evitar clicks duplicados.  
* **Optimización Multimedia:** El módulo de prensa y galería del club no debe cargar imágenes en tamaño original. Se deben utilizar las transformaciones de URL de Supabase Storage para solicitar imágenes ya comprimidas y redimensionadas, asegurando tiempos de carga inferiores a 1.5 segundos en redes móviles 4G.

