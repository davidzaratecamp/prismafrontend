/**
 * Documento "Procedimiento de borrado — retención 24 h" (pedido de Legal de
 * Claro), generado en el navegador desde la pestaña demo. Se abre en una
 * ventana nueva lista para imprimir / "Guardar como PDF".
 *
 * Responde punto por punto a la solicitud de Claro. Lo que sale de la demo va
 * marcado como EJEMPLO (datos ficticios): las evidencias reales las produce el
 * proceso real cuando se active, y la certificación es un formato para firmar.
 */

import logoAsiste from '@/assets/asiste-logo.png?inline'

export interface DocLocation {
  nombre: string
  detalle: string
  responsable: string
}

export interface DocLogEntry {
  run: number
  ts: number
  ubicacion: string
  eliminados: number
  restantes: number
  responsable: string
}

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string)

function fmt(ms: number) {
  return new Date(ms).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function openRetentionDoc({
  ubicaciones,
  log,
  generadoPor,
}: {
  ubicaciones: readonly DocLocation[]
  log: DocLogEntry[]
  generadoPor: string
}) {
  const ahora = fmt(Date.now())
  const ejemplo = log.slice(0, 25)

  const ubicRows = ubicaciones
    .map((u) => `<tr><td><b>${esc(u.nombre)}</b></td><td>${esc(u.detalle)}</td><td>${esc(u.responsable)}</td></tr>`)
    .join('')

  const logRows = ejemplo.length
    ? ejemplo
        .map(
          (l) =>
            `<tr><td>#${l.run}</td><td>${esc(fmt(l.ts))}</td><td>${esc(l.ubicacion)}</td><td class="n">${l.eliminados}</td><td class="n">${l.restantes}</td><td>${esc(l.responsable)}</td><td>${l.restantes === 0 ? 'OK' : 'REVISAR'}</td></tr>`,
        )
        .join('')
    : `<tr><td colspan="7" class="muted">Sin ejecuciones en la demostración al momento de generar el documento.</td></tr>`

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Procedimiento de borrado - retención 24 h - Prisma</title>
<style>
  @page {
    size: Letter; margin: 18mm 16mm;
    @top-left-corner { content: ""; background: linear-gradient(135deg, #1b54a3 0%, #1572b6 30%, #04aed1 50%, transparent 50%); }
    @bottom-right-corner { content: ""; background: linear-gradient(315deg, #1b54a3 0%, #1572b6 30%, #04aed1 50%, transparent 50%); }
    @top-right { content: ""; background: url(${logoAsiste}) right 4mm / auto 12mm no-repeat; }
    @bottom-left { content: "ASISTE ING S.A.S  ·  Prisma — Procedimiento de borrado, retención 24 h"; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 7.5pt; color: #1572b6; letter-spacing: 0.04em; }
    @bottom-right { content: counter(page); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 8pt; color: #1572b6; }
  }
  @page :first { @top-right { content: none; } }
  .brand-head { display: flex; align-items: center; gap: 5mm; margin-bottom: 6mm; }
  .brand-head img { height: 22mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1c2330; font-size: 10pt; line-height: 1.5; margin: 0; }
  h1 { font-size: 18pt; margin: 0 0 2mm; }
  h2 { font-size: 12.5pt; margin: 7mm 0 2mm; padding-bottom: 1.5mm; border-bottom: 2px solid #1b5ea8; page-break-after: avoid; }
  p { margin: 0 0 2.5mm; }
  ul { margin: 0 0 3mm; padding-left: 5mm; } li { margin-bottom: 1mm; }
  table { width: 100%; border-collapse: collapse; margin: 2mm 0 4mm; font-size: 8.8pt; }
  th { background: #f3f5f9; text-align: left; font-weight: 600; }
  th, td { border-bottom: 1px solid #d9dee7; padding: 1.4mm 2mm; vertical-align: top; }
  tr { page-break-inside: avoid; }
  .n { text-align: right; }
  .muted { color: #5b6475; }
  .meta { display: grid; grid-template-columns: repeat(3, auto); gap: 1mm 10mm; justify-content: start; font-size: 9pt; color: #5b6475; margin: 3mm 0 5mm; }
  .meta b { color: #1c2330; display: block; }
  .note { border-left: 3px solid #b7791f; background: #fbf1e1; padding: 2.5mm 3.5mm; margin: 3mm 0; font-size: 9pt; page-break-inside: avoid; }
  .info { border-left: 3px solid #1b5ea8; background: #e6f1fa; padding: 2.5mm 3.5mm; margin: 3mm 0; font-size: 9pt; page-break-inside: avoid; }
  .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 12mm; margin-top: 12mm; page-break-inside: avoid; }
  .sign div { border-top: 1px solid #1c2330; padding-top: 1.5mm; font-size: 9pt; }
  .field { border-bottom: 1px solid #9aa3b2; display: inline-block; min-width: 55mm; }
  .brand { font-size: 9pt; font-weight: 700; letter-spacing: .2em; color: #1b5ea8; }
  @media screen { body { max-width: 190mm; margin: 10mm auto; } .noprint { display: block; } }
  @media print { .noprint { display: none; } }
  .noprint { background: #1c2330; color: #fff; padding: 3mm 4mm; border-radius: 2mm; margin-bottom: 6mm; font-size: 9.5pt; }
  .noprint button { margin-left: 3mm; padding: 1.5mm 4mm; border: 0; border-radius: 1.5mm; background: #1b5ea8; color: #fff; font-weight: 600; cursor: pointer; }
</style></head>
<body>
<div class="noprint">Para guardar como PDF elige "Guardar como PDF" en el destino de impresión. <button onclick="window.print()">Imprimir / Guardar PDF</button></div>

<div class="brand-head"><img src="${logoAsiste}" alt="Asiste Ing"><div class="brand">PRISMA</div></div>
<h1>Procedimiento de borrado — retención máxima de 24 horas</h1>
<p class="muted">Número telefónico real del cliente · Inbound Claro Hogar y Claro TyT</p>
<div class="meta">
  <div><b>Documento generado</b>${esc(ahora)}</div>
  <div><b>Generado por</b>${esc(generadoPor)}</div>
  <div><b>Estado</b>Diseño del procedimiento (previo a la activación)</div>
</div>

<div class="note"><b>Importante:</b> este documento describe el procedimiento de borrado que se aplicará cuando Claro entregue el número real del cliente. Las tablas de ejecución del Anexo A provienen de la <b>demostración con datos ficticios</b> y se incluyen solo como ejemplo del formato de evidencia. Las evidencias reales se generarán automáticamente con cada ejecución del proceso una vez activado.</div>

<h2>1. Descripción del mecanismo de borrado y su alcance</h2>
<p><b>Alcance.</b> El número telefónico real del cliente que Claro entregue para cada llamada de las campañas inbound Claro Hogar y Claro TyT. Hasta la fecha de activación, la plataforma solo ha recibido un identificador genérico asignado por la plataforma de contact center, no el número real. Por eso <b>no existe información histórica con números reales</b> y el borrado aplica desde la activación en adelante.</p>
<p><b>Regla de retención.</b> Cada número tiene una vigencia máxima de <b>24 horas</b>, contadas desde la hora de la llamada. Para garantizarlo, el número se elimina al cumplir <b>23 horas y 50 minutos</b>, de forma definitiva, en todas las ubicaciones listadas en la sección 2.</p>
<p><b>Mecanismo.</b></p>
<ul>
  <li><b>Proceso automático programado</b> que se ejecuta cada <b>10 minutos</b> (a las :00, :10, :20, :30, :40 y :50 de cada hora). Como el corte es a las 23 h 50 min y el proceso corre cada 10 minutos, ningún número llega a cumplir 24 horas.</li>
  <li>En cada ejecución identifica los registros con 23 h 50 min o más y <b>elimina el número</b> en cada ubicación. El resto de la llamada (fecha, hora, campaña, resultado) se conserva sin el número, para la analítica agregada.</li>
  <li>Después del borrado, el proceso <b>verifica</b> que en cada ubicación queden <b>0 números</b> con 23 h 50 min o más. Si encuentra alguno, la ejecución queda marcada como "REVISAR" y se reintenta en la siguiente ejecución.</li>
  <li>Cada ejecución deja un <b>registro de auditoría</b> con fecha y hora, ubicación, cantidad eliminada, cantidad restante y responsable. <b>El registro de auditoría nunca contiene el número.</b></li>
</ul>

<h2>2. Ambientes, repositorios, bases de datos, servidores, respaldos y medios de almacenamiento</h2>
<table><tr><th style="width:32%">Ubicación</th><th>Qué contiene / control</th><th style="width:20%">Responsable</th></tr>${ubicRows}
<tr><td><b>Ambientes de desarrollo y pruebas</b></td><td>No reciben números reales. Se trabaja con datos ficticios.</td><td>Asiste Ing</td></tr>
<tr><td><b>Repositorios de código</b></td><td>Contienen únicamente código fuente. No almacenan datos de clientes.</td><td>Asiste Ing</td></tr>
<tr><td><b>Archivos de audio</b></td><td>Prisma reproduce las grabaciones desde el servidor de la plataforma de contact center y las convierte al vuelo. No guarda archivos de audio ni temporales.</td><td>Asiste Ing</td></tr>
<tr><td><b>Exportaciones descargadas por usuarios</b></td><td>Las exportaciones del Consolidado muestran el número enmascarado. Los usuarios no pueden descargar el número completo.</td><td>Asiste Ing</td></tr>
</table>

<h2>3. Evidencias de ejecución del proceso de eliminación</h2>
<ul>
  <li><b>Registro de auditoría por ejecución</b> (fecha y hora, ubicación, eliminados, restantes, responsable, resultado), consultable en Prisma y exportable en CSV y PDF.</li>
  <li><b>Verificación posterior</b> de 0 registros restantes en cada ubicación, incluida en el mismo registro.</li>
  <li><b>Capturas de pantalla</b> de la pestaña de retención en Prisma, a solicitud.</li>
  <li><b>Constancia de borrado de la plataforma de contact center</b> (Aware), emitida por el proveedor con la periodicidad que se acuerde.</li>
</ul>

<h2>4. Fecha y hora de ejecución del procedimiento</h2>
<p>Cada ejecución registra su fecha y hora exacta, en hora de Colombia. El proceso se ejecuta cada 10 minutos de forma continua. El Anexo A muestra el formato con datos de demostración.</p>

<h2>5. Responsable que realizó la actividad</h2>
<p>La ejecución es automática; el registro indica "Proceso automático Prisma" o el proveedor correspondiente. Los responsables del procedimiento son:</p>
<table>
<tr><th style="width:30%">Rol</th><th>Nombre</th><th>Cargo</th></tr>
<tr><td>Responsable del procedimiento (Asiste Ing)</td><td><span class="field">&nbsp;</span></td><td><span class="field">&nbsp;</span></td></tr>
<tr><td>Responsable por la plataforma de contact center (Aware)</td><td><span class="field">&nbsp;</span></td><td><span class="field">&nbsp;</span></td></tr>
</table>

<h2>6. Confirmación de eliminación de respaldos, temporales, caché, registros de prueba y réplicas</h2>
<table>
<tr><th style="width:30%">Elemento</th><th>Tratamiento</th></tr>
<tr><td>Copias de respaldo</td><td>Los respaldos de la base de datos de Prisma excluyen el número real. No se generan réplicas con el número fuera de las ubicaciones de la sección 2.</td></tr>
<tr><td>Caché</td><td>La memoria temporal del servidor vence en minutos y nunca supera la vigencia de 24 horas.</td></tr>
<tr><td>Archivos temporales</td><td>No se generan archivos temporales con el número. Los audios se convierten al vuelo sin almacenarse.</td></tr>
<tr><td>Registros del servidor (logs)</td><td>El número no se escribe en los registros del servidor. Cada ejecución lo verifica.</td></tr>
<tr><td>Registros de prueba</td><td>Las pruebas usan datos ficticios. No se usan números reales en pruebas.</td></tr>
<tr><td>Copia en Prisma (réplica de Aware)</td><td>El número se elimina al cumplir 23 h 50 min, igual que en la fuente.</td></tr>
</table>

<h2>7. Certificación formal del proveedor</h2>
<div class="info">Formato para firmar una vez activado el procedimiento.</div>
<p>Asiste Ing, en calidad de proveedor de la plataforma Prisma, certifica que, a la fecha <span class="field">&nbsp;</span>, el número telefónico real de los clientes suministrado por Claro se conserva por un máximo de 24 horas y se elimina de forma definitiva conforme al procedimiento descrito en este documento, y que no conserva copias de dicho dato en respaldos, archivos temporales, caché, registros de prueba ni réplicas.</p>
<div class="sign">
  <div>Firma — Representante Asiste Ing<br><span class="muted">Nombre y cargo:</span></div>
  <div>Firma — Representante Aware (plataforma de contact center)<br><span class="muted">Nombre y cargo:</span></div>
</div>

<h2>8. Validación del cumplimiento de los controles de seguridad y protección de datos</h2>
<table>
<tr><th style="width:34%">Control</th><th>Cómo se cumple</th></tr>
<tr><td>Retención máxima de 24 horas</td><td>Proceso automático cada 10 minutos, corte a las 23 h 50 min y verificación de 0 restantes.</td></tr>
<tr><td>Trazabilidad</td><td>Registro de auditoría por ejecución, sin datos personales.</td></tr>
<tr><td>Minimización</td><td>El número se muestra enmascarado en pantalla y en exportaciones. Solo se conserva lo necesario para la analítica agregada.</td></tr>
<tr><td>Control de acceso</td><td>Usuarios personales con contraseña cifrada, sesión con vencimiento, límite de intentos, restricción por campaña y permisos por pestaña.</td></tr>
<tr><td>Transporte seguro</td><td>Toda la comunicación con Prisma se realiza sobre HTTPS.</td></tr>
<tr><td>Acceso a la fuente</td><td>Prisma accede a la plataforma de contact center en modo de solo lectura.</td></tr>
</table>

<h2 style="page-break-before: always">Anexo A — Ejemplo de registro de ejecución (datos de demostración)</h2>
<p class="muted">Últimas ${ejemplo.length} entradas de la demostración al ${esc(ahora)}. Datos ficticios: solo ilustran el formato de evidencia.</p>
<table><tr><th>Ejecución</th><th>Fecha y hora</th><th>Ubicación</th><th class="n">Eliminados</th><th class="n">Restantes</th><th>Responsable</th><th>Resultado</th></tr>${logRows}</table>

<script>setTimeout(function () { window.print() }, 400)</script>
</body></html>`

  const w = window.open('', '_blank')
  if (!w) return false
  w.document.open()
  w.document.write(html)
  w.document.close()
  return true
}
