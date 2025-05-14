/* ======================== */
/*  CONFIGURACIÓN INICIAL   */
/* ======================== */

// Elementos del DOM
const elementos = {
  // Header y ajustes
  menuAjustes: document.getElementById('menuAjustes'),
  abrirAjustes: document.getElementById('abrirAjustes'),
  alternarTema: document.getElementById('alternarTema'),
  verHistorial: document.getElementById('verHistorial'),
  abrirCalculadora: document.getElementById('abrirCalculadora'),

  // Sección Plato
  platoImage: document.getElementById('platoImage'),
  imagePreview: document.getElementById('imagePreview'),
  platoNombre: document.getElementById('platoNombre'),
  platoDescripcion: document.getElementById('platoDescripcion'),
  dificultad: document.getElementById('dificultad'),
  tiempoPreparacion: document.getElementById('tiempoPreparacion'),
  tipoCoccion: document.getElementById('tipoCoccion'),

  // Sección Ingredientes
  ingredienteNombre: document.getElementById('ingredienteNombre'),
  ingredienteCantidad: document.getElementById('ingredienteCantidad'),
  ingredienteUnidad: document.getElementById('ingredienteUnidad'),
  ingredientePresentacion: document.getElementById('ingredientePresentacion'),
  ingredientePrecio: document.getElementById('ingredientePrecio'),
  agregarIngrediente: document.getElementById('agregarIngrediente'),
  ingredientesBody: document.getElementById('ingredientesBody'),
  totalIngredientes: document.getElementById('totalIngredientes'),

  // Sección Costos Operativos
  costoConcepto: document.getElementById('costoConcepto'),
  costoValor: document.getElementById('costoValor'),
  costoProrratear: document.getElementById('costoProrratear'),
  agregarCosto: document.getElementById('agregarCosto'),
  costosBody: document.getElementById('costosBody'),
  totalCostos: document.getElementById('totalCostos'),

  // Resultados
  margenGanancia: document.getElementById('margenGanancia'),
  costoPlato: document.getElementById('costoPlato'),
  precioPersona: document.getElementById('precioPersona'),
  exportarPDF: document.getElementById('exportarPDF'),
  compartirCosteo: document.getElementById('compartirCosteo'),
  guardarCosteo: document.getElementById('guardarCosteo'),

  // Modales
  modalHistorial: document.getElementById('modalHistorial'),
  listaRecetas: document.getElementById('listaRecetas'),
  modalCalculadora: document.getElementById('modalCalculadora')
};

// Variables de estado
const estado = {
  ingredientes: [],
  costosOperativos: [],
  historial: JSON.parse(localStorage.getItem('historial')) || []
};

/* ======================== */
/*  FUNCIONES PRINCIPALES   */
/* ======================== */

/**
 * Inicializa todos los event listeners
 */
function initEventListeners() {
  // Header
  elementos.abrirAjustes.addEventListener('click', toggleMenuAjustes);
  elementos.alternarTema.addEventListener('click', toggleTema);
  elementos.verHistorial.addEventListener('click', abrirHistorial);
  elementos.abrirCalculadora.addEventListener('click', abrirCalculadora);

  // Imagen del plato
  elementos.platoImage.addEventListener('change', cargarImagenPlato);

  // Ingredientes
  elementos.agregarIngrediente.addEventListener('click', agregarIngredienteALista);

  // Costos operativos
  elementos.agregarCosto.addEventListener('click', agregarCostoOperativo);

  // Resultados
  elementos.margenGanancia.addEventListener('input', calcularResultados);
  elementos.exportarPDF.addEventListener('click', exportarAPDF);
  elementos.guardarCosteo.addEventListener('click', guardarEnHistorial);

  // Modales
  document.querySelector('.close-modal').addEventListener('click', cerrarModales);
  document.querySelector('.close-calculadora').addEventListener('click', cerrarModales);
};

/**
 * Agrega un ingrediente a la lista y actualiza cálculos
 */
function agregarIngredienteALista() {
  // Validación básica
  if (!elementos.ingredienteNombre.value || !elementos.ingredientePrecio.value) return;

  const nuevoIngrediente = {
    nombre: elementos.ingredienteNombre.value,
    cantidad: parseFloat(elementos.ingredienteCantidad.value),
    unidad: elementos.ingredienteUnidad.value,
    presentacion: elementos.ingredientePresentacion.value,
    precio: parseFloat(elementos.ingredientePrecio.value),
    // Cálculo del costo unitario por porción
    costo: (parseFloat(elementos.ingredientePrecio.value) / parseFloat(elementos.ingredientePresentacion.match(/\d+/)[0])) * parseFloat(elementos.ingredienteCantidad.value)
  };

  estado.ingredientes.push(nuevoIngrediente);
  actualizarTablaIngredientes();
  calcularResultados();
  limpiarFormularioIngredientes();
};

/**
 * Actualiza la tabla de ingredientes en el DOM
 */
function actualizarTablaIngredientes() {
  elementos.ingredientesBody.innerHTML = '';
  let total = 0;

  estado.ingredientes.forEach(ing => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${ing.nombre}</td>
      <td>${ing.cantidad} ${ing.unidad}</td>
      <td>$${ing.precio.toFixed(2)}</td>
      <td>$${ing.costo.toFixed(2)}</td>
      <td><button class="btn-eliminar" data-id="${ing.nombre}"><i class="fas fa-trash"></i></button></td>
    `;
    elementos.ingredientesBody.appendChild(fila);
    total += ing.costo;
  });

  elementos.totalIngredientes.textContent = `$${total.toFixed(2)}`;
  agregarEventosEliminar();
};

/**
 * Calcula costos totales y precio sugerido
 */
function calcularResultados() {
  // Costo ingredientes
  const totalIngredientes = estado.ingredientes.reduce((sum, ing) => sum + ing.costo, 0);
  
  // Costos operativos (con prorrateo si aplica)
  const totalCostos = estado.costosOperativos.reduce((sum, costo) => {
    return costo.prorrateado ? sum + (costo.valor / 30) : sum + costo.valor;
  }, 0);

  const costoTotal = totalIngredientes + totalCostos;
  const margen = parseFloat(elementos.margenGanancia.value) / 100;
  const precioSugerido = costoTotal * (1 + margen);

  // Actualizar DOM
  elementos.costoPlato.textContent = `$${costoTotal.toFixed(2)}`;
  elementos.precioPersona.textContent = `$${precioSugerido.toFixed(2)}`;
};

/* ======================== */
/*  FUNCIONES SECUNDARIAS   */
/* ======================== */

function toggleMenuAjustes() {
  elementos.menuAjustes.classList.toggle('oculto');
};

function cargarImagenPlato(e) {
  // Lógica original para previsualización
};

function agregarEventosEliminar() {
  // Eventos para botones de eliminar
};

function exportarAPDF() {
  // Lógica original con jsPDF
};

/* ======================== */
/*       INICIALIZACIÓN     */
/* ======================== */

document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  cargarHistorial();
});
