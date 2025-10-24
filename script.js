// Datos iniciales (puedes editar precios y rendimiento desde aquí)
const DATA = {
  invemanto: [
    { id: 'inv9', name: 'Invemanto 9 capas (incluye pega manto)', price: 120, rendimiento: null, note: 'Manto - rendimiento variable, especificar área' },
    { id: 'inv7', name: 'Invemanto 7 capas (incluye pega manto)', price: 95, rendimiento: null, note: 'Manto - rendimiento variable, especificar área' },
    { id: 'inv5', name: 'Invemanto 5 capas (incluye pega manto)', price: 75, rendimiento: null, note: 'Manto - rendimiento variable, especificar área' },
    { id: 'kit-tapa', name: 'Kit tapa goteras (1/4 pega manto + 10 parchos 15x15cm)', price: 18, rendimiento: null, note: 'Sin rendimiento especificado' }
  ],
  pintura: [
    { id: 'cuñete5', name: 'Cuñete 5/1', price: 80, rendimiento: 20, note: 'Rendimiento aproximado 20 m²' },
    { id: 'cuñete4', name: 'Cuñete 4/1', price: 65, rendimiento: 16, note: 'Rendimiento aproximado 16 m²' },
    { id: 'galon', name: 'Galón', price: 22, rendimiento: 5, note: 'Rendimiento aproximado 5 m²' },
    { id: 'kit-cun4', name: 'Kit cuñete 4/1 (con 18 m² de malla poliéster)', price: 120, rendimiento: 18, note: 'Incluye malla 18 m²' },
    { id: 'kit-gal1', name: 'Kit galón 1/1 (con 4.5 m² de malla poliéster)', price: 36, rendimiento: 4.5, note: 'Incluye malla 4.5 m²' },
    { id: 'malla', name: 'Malla poliéster (m²)', price: 4.5, rendimiento: 1, note: 'Precio por m²' }
  ],
  manoobra: {
    pintura: { label: 'Mano de obra aplicación Pintura impermeabilizante a dos manos', price_per_m2: 1.30, note: 'Desde $1.30 x M2. Previa inspección' },
    invemanto: { label: 'Mano de obra colocación de Invemanto', price_per_m2: 2.50, note: 'Desde $2.50 x M2. Previa inspección' }
  }
};

const PHONE = '584144415403'; // Reemplaza por tu número (sin + ni espacios para wa.me, ejemplo: 573001234567)

const productoSelect = document.getElementById('producto');
const presentacionesContainer = document.getElementById('presentaciones-container');
const manoobraSelect = document.getElementById('manoobra');
const areaInput = document.getElementById('area');
const resultadoDiv = document.getElementById('resultado');
const calcularBtn = document.getElementById('calcular');

// Inicializar
function init(){
  productoSelect.addEventListener('change', renderPresentaciones);
  renderPresentaciones();
  calcularBtn.addEventListener('click', calcularYEnviar);
}

function renderPresentaciones() {
  const prod = productoSelect.value;
  presentacionesContainer.innerHTML = '';
  const list = DATA[prod];
  list.forEach(item => {
    const div = document.createElement('div');
    div.className = 'presentacion';
    div.innerHTML = `
      <div class="left">
        <strong>${item.name}</strong>
        <div class="small">${item.note}</div>
        <div class="small">Precio unitario sugerido: $ <span class="price">${item.price}</span></div>
      </div>
      <div class="right">
        <label class="small">Cantidad</label>
        <input type="number" min="0" value="0" data-id="${item.id}" class="qty" style="width:80px;padding:6px;border-radius:6px;background:#07121a;color:#cfe"/>
      </div>
    `;
    presentacionesContainer.appendChild(div);
  });

  // ----- 👇 NUEVO BLOQUE DE MANO DE OBRA -----
  manoobraSelect.innerHTML = '';

  // Opción 1: con mano de obra (automática)
  const mo = DATA.manoobra[prod];
  const opt1 = document.createElement('option');
  opt1.value = JSON.stringify(mo);
  opt1.textContent = `${mo.label} — ${mo.note}`;
  manoobraSelect.appendChild(opt1);

  // Opción 2: sin mano de obra
  const sinMO = { label: 'Sin mano de obra (solo materiales)', price_per_m2: 0, note: 'Costo mano de obra = $0' };
  const opt2 = document.createElement('option');
  opt2.value = JSON.stringify(sinMO);
  opt2.textContent = sinMO.label;
  manoobraSelect.appendChild(opt2);
}


function calcularYEnviar(){
  const prod = productoSelect.value;
  const area = parseFloat(areaInput.value) || 0;
  const qtyInputs = Array.from(document.querySelectorAll('.qty'));
  const selected = [];
  qtyInputs.forEach(input=>{
    const q = parseFloat(input.value) || 0;
    if(q>0){
      const id = input.dataset.id;
      const item = DATA[prod].find(x=>x.id===id);
      selected.push({ ...item, qty: q });
    }
  });

  if(selected.length===0){
    alert('Seleccione al menos una presentación con cantidad mayor a 0.');
    return;
  }

  // Calcular materiales: si producto tiene rendimiento (m² por unidad), calcular unidades necesarias si user entered area and qty=0.
  // Here qty is treated as number of units user wants to include. We'll compute material subtotal:
  let matSubtotal = 0;
  const lines = [];
  selected.forEach(it=>{
    let units = it.qty;
    // If product has rendimiento, show how much m2 cubre la cantidad
    let covers = it.rendimiento ? (it.rendimiento * units) : null;
    lines.push({
      name: it.name,
      units,
      unitPrice: it.price,
      covers
    });
    matSubtotal += units * it.price;
  });

  // Mano de obra
  const manoobra = JSON.parse(manoobraSelect.value);
  const manoobraCost = manoobra.price_per_m2 * area;

  const total = matSubtotal + manoobraCost;

  // Mostrar resultado
  let html = `<h3>Presupuesto</h3>`;
  html += `<div class="small">Área solicitada: <strong>${area} m²</strong></div>`;
  html += '<ul>';
  lines.forEach(l=>{
    html += `<li>${l.name} — Cantidad: ${l.units} — Precio unitario: $${l.unitPrice.toFixed(2)}${l.covers ? ' — Cubre: '+l.covers+' m²' : ''} — Subtotal: $${(l.units*l.unitPrice).toFixed(2)}</li>`;
  });
  html += `</ul>`;
  html += `<div class="small">Mano de obra: ${manoobra.label} — $${manoobra.price_per_m2.toFixed(2)} x m² = $${manoobraCost.toFixed(2)}</div>`;
  html += `<h4>Total estimado: $${total.toFixed(2)}</h4>`;
  resultadoDiv.innerHTML = html;

  // Preparar mensaje para WhatsApp
  let mensaje = `*Solicitud de presupuesto - Invepinca*%0A`;
  mensaje += `Área: ${area} m²%0A`;
  mensaje += `Producto: ${productoSelect.options[productoSelect.selectedIndex].text}%0A`;
  selected.forEach(l=>{
    mensaje += `- ${l.name} | Cant: ${l.qty} | Precio unit: $${l.price.toFixed(2)}%0A`;
  });
  mensaje += `Mano de obra: ${manoobra.label} — $${manoobra.price_per_m2.toFixed(2)} x m² = $${manoobraCost.toFixed(2)}%0A`;
  mensaje += `Total estimado: $${total.toFixed(2)}%0A`;
  mensaje += `NOTA: Precios y rendimiento estimados. Previa inspección.`;

  // Abrir WhatsApp en nueva ventana (wa.me requires phone without +, but we keep PHONE as example)
  const phoneForWa = PHONE.replace('+','');
  const waUrl = `https://wa.me/${phoneForWa}?text=` + mensaje;
  window.open(waUrl,'_blank');
}

init();
