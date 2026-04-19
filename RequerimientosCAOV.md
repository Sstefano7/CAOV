# **Especificación de Requerimientos de Software (ERS)**

**Proyecto:** Plataforma Web e Intranet \- Club Atlético Oro Verde (C.A.O.V.)

## **1\. Introducción**

El propósito de este documento es definir las especificaciones funcionales y no funcionales para el desarrollo de la plataforma web oficial del **Club Atlético Oro Verde (C.A.O.V.)**. El sistema actuará como la cara visible del club hacia el mundo (portal de noticias e historia) y como una herramienta de gestión interna para administrar disciplinas, jugadores, socios y el cobro de cuotas.

## **2\. Descripción General**

La aplicación tendrá una arquitectura híbrida:

* **Portal Público:** Accesible para cualquier visitante sin necesidad de registro. Mostrará la vida social y deportiva del club.  
* **Intranet/Portal Privado:** Un área de acceso restringido para usuarios autenticados, divididos en tres roles principales: **Administradores**, **Jugadores** (pertenecientes a distintas disciplinas) y **Socios** (hinchas o miembros que pagan una cuota social).

## **3\. Reglas de Negocio**

* **Acceso Público:** La información institucional (noticias, sponsors, fixtures, historia, tienda) debe ser de acceso libre para fomentar el engagement.  
* **Gestión de Disciplinas:** Un jugador debe estar estrictamente asignado a una o más disciplinas/categorías (ej. Fútbol Primera, Básquet U19) para aparecer en la "Grilla de Jugadores".  
* **Estado de Socios:** Los usuarios pueden registrarse y solicitar ser "Socios". Su estado cambiará a "Activo" únicamente tras la validación del pago de la cuota correspondiente.  
* **Control Administrativo:** Solo los usuarios con rol de `Admin` pueden publicar noticias, actualizar resultados, modificar el estado de los pagos de socios y gestionar el alta/baja de jugadores.  
* **Beneficios Exclusivos:** Ciertas secciones (como descuentos en el Shop o contenido exclusivo) pueden estar limitadas solo a Socios con cuota al día.

## **4\. Requerimientos Funcionales**

* **RF-01: Portal Público Institucional:** Visualización sin registro de: Noticias, Sponsors, Próximos Partidos / Fixture, Títulos Obtenidos (Palmarés), Galería de Imágenes, Enlaces a Redes Sociales y Canales oficiales.  
* **RF-02: Grilla de Jugadores (Roster):** Sección pública filtrable por disciplina y categoría que muestra la foto, nombre, posición y estadísticas básicas de los jugadores del club.  
* **RF-03: Shop Oficial (E-commerce):** Catálogo público de indumentaria y merchandising del C.A.O.V., con redirección a WhatsApp o carrito de compras básico.  
* **RF-04: Autenticación y Roles:** Registro y login mediante Supabase Auth diferenciando entre `Admin`, `Socio` y `Jugador`.  
* **RF-05: Panel de Asociación y Cuotas:** Interfaz para que un usuario invitado se registre, ingrese sus datos y pague su cuota social (integración con pasarela de pago o comprobante manual).  
* **RF-06: Panel de Administración (CMS):** CRUD (Crear, Leer, Actualizar, Borrar) para noticias, partidos, disciplinas, jugadores y control del estado de los socios.  
* **RF-07: Perfil de Jugador/Socio:** Área privada donde el usuario puede ver su estado de cuenta, carnet digital y notificaciones del club o de su disciplina.

## **5\. Requerimientos No Funcionales**

* **RNF-01: Mobile First:** Interfaz web optimizada (Responsive Design) asegurando que los hinchas puedan ver resultados y noticias cómodamente desde sus celulares.  
* **RNF-02: Seguridad de Datos (RLS):** Configuración estricta de *Row Level Security* en Supabase. Ejemplo: Cualquiera puede leer la tabla `news`, pero solo los `Admins` pueden insertar o borrar; un usuario solo puede ver su propio estado de deuda en `payments`.  
* **RNF-03: Rendimiento Multimedia:** Las imágenes de la galería, jugadores y noticias deben estar optimizadas (uso de Supabase Storage con transformación/compresión de imágenes).  
* **RNF-04: Integración de Pagos:** Preparación del sistema para interactuar de forma asíncrona (Webhooks) con pasarelas de pago (ej. MercadoPago) para automatizar el estado de la cuota social.

## **6\. Modelo de Datos (Esquema Sugerido en Supabase)**

**Tabla `profiles`:**

* `id` (PK, references auth.users)  
* `full_name`  
* `avatar_url`  
* `role` (enum: 'admin', 'socio', 'jugador', 'user\_basico')  
* `member_status` (enum: 'al\_dia', 'moroso', 'no\_socio')

**Tabla `disciplines`:**

* `id` (PK)  
* `name` (ej: 'Fútbol', 'Básquet', 'Vóley')  
* `category` (ej: 'Primera', 'Reserva', 'U15')

**Tabla `players`:**

* `id` (PK, references profiles)  
* `discipline_id` (FK, references disciplines)  
* `position`  
* `shirt_number`  
* `stats_summary` (JSONB)

**Tabla `news_and_events`:**

* `id` (PK)  
* `title`  
* `content` (Texto rico / HTML)  
* `image_url`  
* `published_at` (timestamp)

**Tabla `matches`:**

* `id` (PK)  
* `discipline_id` (FK)  
* `opponent_name`  
* `match_date` (timestamp)  
* `location` (Local/Visitante)  
* `result` (ej: '2-1', 'Pendiente')

## **7\. Casos de Uso**

**Actor:** Visitante Público **Caso:** Explorar el club y asociarse **Flujo:**

1. El usuario ingresa a la página de inicio del C.A.O.V.  
2. Visualiza las últimas noticias del fin de semana y los próximos partidos.  
3. Ingresa a la sección "Hacete Socio".  
4. Crea una cuenta con su correo o Google.  
5. El sistema lo redirige a su panel privado, donde se le solicita completar sus datos (DNI, Dirección) y realizar el pago de la cuota inscripción.  
6. Tras el pago, el sistema actualiza su `member_status` a 'al\_dia' y genera su Carnet Digital.

## **8\. Manejo de Errores**

* **Fallo en el Pago de Cuota:** Si la pasarela de pago rechaza la tarjeta, el estado del usuario queda en 'Pendiente' y se muestra un mensaje claro con opciones alternativas (transferencia, pago en secretaría).  
* **Accesos Denegados:** Si un usuario no administrador intenta entrar a la ruta `/admin`, el sistema lo debe redirigir a la página de inicio (Home) con una alerta de "Permisos insuficientes".  
* **Contenido Inexistente:** Si no hay próximos partidos programados o imágenes en una galería, el sistema debe mostrar *Empty States* amigables (ej. "¡El fixture se sorteará pronto\! Mantente atento").

  **Anexo ERS: Sistema de Cobros y Gestión de Socios**

  #### **1\. Arquitectura de Pagos**

El sistema manejará dos modalidades de cobro de la cuota social:

1. **Automatizado (MercadoPago):** A través de suscripciones recurrentes (API de *Preapproval* de MercadoPago) o pagos únicos mensuales.  
2. **Manual (Transferencia/Efectivo):** El socio sube un comprobante o el administrador registra el pago físico en secretaría.

Para que esto sea seguro y automático, usaremos **Supabase Edge Functions**. El frontend nunca actualizará el estado de pago directamente; solo la pasarela de pagos (vía Webhook) o un Administrador tendrán el poder de hacerlo.

#### **2\. Ampliación del Modelo de Datos**

Necesitamos agregar tablas específicas para mantener un historial contable y auditable.

**Tabla `subscriptions` (Suscripciones MP):**

* `id` (PK)  
* `profile_id` (FK, references `profiles`)  
* `mp_subscription_id` (ID de la suscripción en MercadoPago)  
* `plan_type` (enum: 'cuota\_individual', 'grupo\_familiar', 'jugador')  
* `status` (enum: 'active', 'paused', 'cancelled')  
* `next_billing_date` (timestamp)

**Tabla `payments_history` (Historial de transacciones):**

* `id` (PK)  
* `profile_id` (FK, references `profiles`)  
* `amount` (decimal)  
* `payment_method` (enum: 'mercadopago', 'transferencia', 'efectivo')  
* `status` (enum: 'pending', 'approved', 'rejected')  
* `mp_payment_id` (ID del pago en MP, nullable)  
* `receipt_url` (URL del comprobante subido a Supabase Storage, nullable)  
* `created_at` (timestamp)

  #### **3\. Flujo Automatizado (El "Camino Feliz" con MercadoPago)**

1. **Generación del Link:** El socio ingresa a su panel y hace clic en "Adherirme al débito automático". El frontend llama a una *Supabase Edge Function* (`create-mp-subscription`).  
2. **Creación en MP:** La Edge Function se comunica con la API de MercadoPago, crea la preferencia de suscripción y devuelve una URL de pago al frontend.  
3. **Checkout:** El usuario es redirigido a MercadoPago, ingresa su tarjeta y acepta el cobro.  
4. **El Webhook (La Magia):** MercadoPago cobra con éxito y envía una petición POST silenciosa a otra Edge Function nuestra (`mp-webhook-receiver`).  
5. **Actualización de Base de Datos:**  
   * La Edge Function verifica que la firma del Webhook sea legítima (seguridad).  
   * Busca a qué socio pertenece ese pago.  
   * Actualiza el campo `member_status` a `'al_dia'` en la tabla `profiles`.  
   * Inserta un registro de éxito en `payments_history`.  
6. **Notificación:** El sistema dispara un email transaccional al socio: *"¡Tu pago fue procesado\! Ya tienes tu carnet habilitado para este mes."*

   #### **4\. Flujo Manual (Transferencia o Pago en Secretaría)**

1. **Reporte del Socio:** El socio hace una transferencia bancaria. En su panel, elige "Informar Pago", ingresa el monto, la fecha y sube el comprobante (PDF o Foto) a **Supabase Storage**.  
2. **Registro Pendiente:** Se crea un registro en `payments_history` con estado `'pending'` y la `receipt_url` apuntando al comprobante.  
3. **Revisión del Admin:** El administrador del C.A.O.V. entra a su panel (CMS). Ve una alerta de "Pagos pendientes de revisión".  
4. **Aprobación:** El Admin visualiza el comprobante. Si el dinero está en el banco, hace clic en "Aprobar".  
5. **Actualización de Estado:** El frontend del Admin hace un UPDATE (permitido por RLS para su rol) cambiando el pago a `'approved'` y el estado del socio a `'al_dia'`.

   #### **5\. Manejo de Morosidad (Cron Jobs)**

Para no depender de que el administrador revise manualmente quién pagó y quién no, usaremos **pg\_cron** (una extensión nativa de la base de datos PostgreSQL en Supabase):

* El día 10 de cada mes a las 00:00, se ejecuta una función en la base de datos.  
* Esta función revisa la tabla `subscriptions` y `payments_history`.  
* A todos los socios que no tengan un pago registrado y aprobado para el mes en curso, se les cambia automáticamente el `member_status` a `'moroso'`.  
* Esto bloquea inmediatamente el acceso a sus beneficios o restringe la visibilidad del carnet digital.  
* 

¡Excelente\! Vamos a estructurar el Panel de Administración (CMS). Este panel será el "centro de mando" del C.A.O.V.

El objetivo principal aquí es que la comisión directiva (que no necesariamente tiene conocimientos técnicos) pueda gestionar el club de forma intuitiva, sin miedo a romper la página web, delegando los permisos correctos a cada persona.

Aquí tienes la especificación para el CMS.

---

### **Anexo ERS: Panel de Administración (CMS) del C.A.O.V.**

#### **1\. Arquitectura y Acceso**

El CMS será una ruta protegida dentro de la misma aplicación web (por ejemplo, oroverdecaov.com/admin). Supabase validará el token de sesión del usuario; si su campo role no es admin (o un sub-rol autorizado), el acceso será denegado inmediatamente, redirigiéndolo al inicio.

#### **2\. Vistas y Funcionalidades por Módulo**

**A. Dashboard (Resumen General)**

* **Métricas en tiempo real:** Tarjetas visuales mostrando la cantidad total de socios, porcentaje de morosidad, ingresos del mes actual e inscripciones recientes.  
* **Centro de Alertas:** Notificaciones destacadas sobre transferencias manuales que requieren aprobación urgente.  
* **Agenda Deportiva:** Un calendario o lista rápida con los próximos eventos y partidos de la semana en todas las disciplinas.

**B. Módulo de Socios y Tesorería**

* **Padrón de Socios:** Una tabla interactiva para buscar usuarios por nombre o DNI, y filtrar por su estado financiero (Al día, Moroso, Pendiente).  
* **Auditoría de Pagos:** Vista para revisar comprobantes de transferencias subidos por los socios a Supabase Storage y botones de acción rápida: "Aprobar Pago" o "Rechazar".  
* **Gestión Manual:** Capacidad del administrador para registrar un pago en efectivo realizado físicamente en la secretaría del club, actualizando el estado del socio al instante.  
* **Exportación:** Botón para descargar el padrón de socios activos en formato CSV para utilizar en asambleas o controles de puerta.

**C. Módulo de Comunicación (Noticias e Institucional)**

* **Gestor de Noticias:** Un editor de texto enriquecido (WYSIWYG) similar a Word, donde el equipo de prensa puede redactar artículos, aplicar negritas y crear listas sin tocar código.  
* **Gestor de Archivos:** Interfaz para subir imágenes de portada y galerías de fotos de los partidos, conectada directamente a los *buckets* públicos de Supabase Storage.  
* **Sponsors:** Un panel simple para subir el logo de las marcas que apoyan al club, colocar su enlace web y activar/desactivar su visibilidad en el portal público.

**D. Módulo de Gestión Deportiva (Disciplinas y Jugadores)**

* **Configuración de Categorías:** Interfaz para crear o eliminar divisiones (ej. "Fútbol Femenino Primera", "Básquet U15").  
* **Grilla de Jugadores (Roster):** Formulario para dar de alta a nuevos deportistas, subiendo su foto de perfil, asignando su número de camiseta, posición y vinculándolos a su disciplina correspondiente.  
* **Gestor de Bajas:** Opción para archivar jugadores que ya no pertenecen al club sin borrar su historial de las bases de datos.

**E. Módulo de Partidos (Fixture y Resultados)**

* **Programación:** Formulario para agendar nuevos encuentros definiendo fecha, hora, disciplina, nombre del rival y condición (Local o Visitante).  
* **Actualización Rápida:** Campo para ingresar el marcador final una vez concluido el partido. Al guardarse, Supabase Realtime disparará la actualización instantánea en la web pública sin que los hinchas tengan que recargar la página.

  #### **3\. Matriz de Permisos (Sub-Roles Sugeridos)**

Para mayor seguridad, se puede implementar un sistema de permisos detallado mediante las políticas de Supabase (RLS), evitando que un entrenador modifique temas contables.

| Rol Administrativo | Módulo Tesorería | Módulo Prensa | Módulo Deportes |
| :---- | :---- | :---- | :---- |
| **Admin General / Presidente** | Acceso Total | Acceso Total | Acceso Total |
| **Tesorero** | Acceso Total | Solo Lectura | Solo Lectura |
| **Prensa / Community Manager** | Sin Acceso | Acceso Total | Solo Lectura |
| **Coordinador Deportivo** | Sin Acceso | Sin Acceso | Acceso Total |

