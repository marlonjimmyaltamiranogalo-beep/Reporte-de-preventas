'use strict';
const reports = {
  movil: {title:'Ventas pospago NETMOBILE',id:'155DiYsdep38ObP5rEa0xeSskOv83lnS4j282zGJvpoA',gid:1070694366},
  home: {title:'Preventas Tigo Home',id:'1YyOwEsGHnyWKGt7wjupxMULIcakyNg-g7C5LTZirh-Y',gid:1205834616}
};
let current = 'movil';
let revision = 0;
const preview = document.getElementById('preview');
const status = document.getElementById('status');
const manual = document.getElementById('manual-text');
const copy = document.getElementById('copy');
const whatsapp = document.getElementById('whatsapp');
const refresh = document.getElementById('refresh');
const sheet = document.getElementById('sheet');

function endpoint() {
  try {
    const url = new URL(window.CORTES_ENDPOINT);
    return url.protocol === 'https:' && url.hostname === 'script.google.com' && /^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname) ? url : null;
  } catch (_) { return null; }
}

function queryReport(type) {
  return new Promise((resolve,reject) => {
    const url = endpoint();
    if (!url) { reject(new Error('Falta activar la conexión de Google.')); return; }
    const name = 'cortes_cb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const script = document.createElement('script');
    let timer;
    function cleanup() {
      clearTimeout(timer);
      delete window[name];
      script.remove();
    }
    window[name] = data => {
      cleanup();
      if (!data || data.ok !== true || data.tipo !== type || typeof data.text !== 'string' || !data.text.trim() || !Number.isSafeInteger(data.row) || data.row < 2) {
        reject(new Error(data && data.error || 'La conexión no devolvió un reporte válido.'));
      } else resolve(data);
    };
    script.onerror = () => { cleanup(); reject(new Error('No se pudo conectar con Google. Intenta actualizar.')); };
    timer = setTimeout(() => { cleanup(); reject(new Error('Google no respondió. Revisa que la conexión esté publicada para cualquier persona e intenta actualizar.')); },30000);
    url.searchParams.set('tipo',type);
    url.searchParams.set('callback',name);
    url.searchParams.set('_',String(Date.now()));
    script.src = url.href;
    document.head.append(script);
  });
}

function setAvailable(available) {
  copy.disabled = !available;
  whatsapp.hidden = !available;
  document.getElementById('manual').hidden = !available;
  if (!available) whatsapp.removeAttribute('href');
}

async function loadReport(type) {
  current = type;
  const request = ++revision;
  const report = reports[type];
  delete report.text;
  document.getElementById('report-title').textContent = report.title;
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active',tab.id === type);
    tab.setAttribute('aria-pressed',String(tab.id === type));
  });
  setAvailable(false);
  refresh.disabled = true;
  preview.textContent = 'Consultando el último corte guardado…';
  manual.value = '';
  status.textContent = 'Leyendo CORTE_HOY…';
  sheet.href = 'https://docs.google.com/spreadsheets/d/' + report.id + '/edit#gid=' + report.gid;
  document.getElementById('manual').open = false;
  try {
    const data = await queryReport(type);
    if (request !== revision) return;
    report.text = data.text;
    preview.textContent = data.text;
    manual.value = data.text;
    copy.textContent = 'Copiar para WhatsApp';
    whatsapp.href = 'https://wa.me/?text=' + encodeURIComponent(data.text);
    sheet.href += '&range=AJ' + data.row;
    const date = new Date(data.fetchedAt);
    status.textContent = 'Último corte guardado · Consulta: ' + (Number.isNaN(date.valueOf()) ? 'ahora' : date.toLocaleString('es-NI',{timeZone:'America/Managua'}));
    setAvailable(true);
  } catch (error) {
    if (request !== revision) return;
    preview.textContent = 'No se pudo cargar el reporte.';
    status.textContent = error.message;
  } finally {
    if (request === revision) refresh.disabled = false;
  }
}

copy.addEventListener('click',async () => {
  const text = reports[current].text;
  if (!text) return;
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('clipboard');
    await navigator.clipboard.writeText(text);
    copy.textContent = '✓ Reporte copiado';
    status.textContent = 'Abre WhatsApp y pega el texto en un mensaje.';
  } catch (_) {
    document.getElementById('manual').open = true;
    manual.focus(); manual.select(); manual.setSelectionRange(0,manual.value.length);
    let success = false;
    try { success = document.execCommand('copy'); } catch (_) {}
    status.textContent = success ? 'Copiado. Ya puedes pegarlo en WhatsApp.' : 'Mantén pulsado el texto seleccionado y elige Copiar.';
  }
});
document.getElementById('select').addEventListener('click',() => {
  manual.focus(); manual.select(); manual.setSelectionRange(0,manual.value.length);
});
refresh.addEventListener('click',() => loadReport(current));
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click',() => loadReport(tab.id)));
loadReport('movil');
