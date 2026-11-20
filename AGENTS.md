# Project Guidance

## User Preferences

- Estética de alto impacto con profundidad 3D, tarjetas con relieve y micro-interacciones táctiles
- Paleta azul profundo y eléctrico, blancos limpios, verde esmeralda para estados activos y ámbar suave para pendientes o cortes
- Diseño optimizado para móviles con navegación inferior fija tipo aplicación nativa
- Interfaz y textos en español de Venezuela

## Accepted Requirements

- Portada con emblema 3D interactivo y accesos Ingresar, Solicitar Instalación y Recuperar Contraseña
- Ingreso de cliente por cédula, teléfono o usuario
- Recuperación de contraseña por WhatsApp con código e instrucciones
- Panel administrador protegido por clave maestra
- Estado de cuenta, megas contratadas y estado del servicio en el panel del cliente
- Cuentas de pago configurables por el administrador y visibles al cliente
- Reporte de pago con referencia, monto, fecha y método
- Factura con número correlativo y recibo de confirmación compartible por WhatsApp
- Tasa BCV automática con respaldo manual del administrador
- Cobertura jerárquica del Municipio Cajigal con parroquias, pueblos y sectores
- Solicitud de instalación con selección de parroquia, pueblo y sector
- Suspender y reactivar el servicio de un cliente con un clic
- Tickets de falla técnica con seguimiento
- Dashboard con indicadores financieros y buscador de clientes
- Exportación de reportes

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend session guards: AccessLib.requireAdmin protects administrative methods and AccessLib.requireClient expects a CLI-<id>-<expiresAt> token, so client-scoped reads must use getMyClient with a minted token instead of the raw id.
- A backend fetch method is only automatic when a frontend hook invokes it; useBcvRate in src/frontend/src/hooks/useQueries.ts calls refreshBcvRate when the stored rate is missing or older than twelve hours.
- jayson decodeOptField returns a double option; use decodeField with a default for a plain Text field, and bcv.today api/v1/rate.json returns USD as a JSON float with effective_date as the value date.
- Local e2e flows that sign in need credentials the tester cannot invent; a Sign in step without provided credentials reports AUTH_CREDENTIAL_UNAVAILABLE and leaves the flow unverified.
- The installation request form requires Nombre y apellido, Cédula, Teléfono, Parroquia, Pueblo and Sector before Enviar solicitud enables, and its confirmation screen shows the reference number SOL-1.
