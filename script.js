// script.js COMPLETO para CodePen - Junio 2024

// Variables globales
let ingredients = [];
let operationalCosts = [];
let currentCalcInput = "";
const STORAGE_KEY = "costeoData";

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {

  // Cargar elementos del DOM
  const ingredientesBody = document.getElementById("ingredientesBody");
  const costosBody = document.getElementById("costosBody");
  const totalIngredientes = document.getElementById("totalIngredientes");
  const totalCostos = document.getElementById("totalCostos");
  const costoPlato = document.getElementById("costoPlato");
  const precioPersona = document.getElementById("precioPersona");
  const margenGanancia = document.getElementById("margenGanancia");
  const platoNombre = document.getElementById("platoNombre");
  const platoDescripcion = document.getElementById("platoDescripcion");
  const imagePreview = document.getElementById("imagePreview");
  const imageInput = document.getElementById("platoImage");
  const abrirAjustes = document.getElementById("abrirAjustes");
  const menuAjustes = document.getElementById("menuAjustes");
  const calcModal = document.getElementById("modalCalculadora");
  const display = document.getElementById("calcDisplay");

  // Cargar datos guardados
  function cargarDatos() {
    const datosGuardados = localStorage.getItem(STORAGE_KEY);
    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados);
      ingredients = datos.ingredients || [];
      operationalCosts = datos.operationalCosts || [];
      if (datos.platoNombre) platoNombre.value = datos.platoNombre;
      if (datos.platoDescripcion) platoDescripcion.value = datos.platoDescripcion;
      if (datos.margenGanancia) margenGanancia.value = datos.margenGanancia;
      renderIngredientes();
      renderCostos();
      calcularTotales();
    }
  }

  // Guardar datos
  function guardarDatos() {
    const datos = {
      ingredients,
      operationalCosts,
      platoNombre: platoNombre.value,
      platoDescripcion: platoDescripcion.value,
      margenGanancia: margenGanancia.value };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  }

  // Manejo de imagen
  imagePreview.addEventListener("click", () => imageInput.click());
  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file && file.type.startsWith("image/") && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = function () {
        imagePreview.innerHTML = `<img src="${reader.result}" alt="Plato">`;
      };
      reader.readAsDataURL(file);
    } else {
      alert("Imagen inválida o demasiado grande (máx. 2MB)");
    }
  });

  // Agregar ingrediente
  document.getElementById("agregarIngrediente").addEventListener("click", function () {
    const nombre = document.getElementById("ingredienteNombre").value.trim();
    const cantidad = parseFloat(document.getElementById("ingredienteCantidad").value);
    const unidad = document.getElementById("ingredienteUnidad").value;
    const presentacion = document.getElementById("ingredientePresentacion").value.trim();
    const precio = parseFloat(document.getElementById("ingredientePrecio").value);

    if (!nombre || isNaN(cantidad) || isNaN(precio) || !presentacion) {
      alert("Completa todos los campos del ingrediente.");
      return;
    }

    const match = presentacion.match(/(\d+(?:\.\d+)?)(\s*)(kg|gr|un)/i);
    if (!match) {
      alert("Formato inválido. Ej: 1kg, 500gr, 12 un");
      return;
    }

    let valorPresentacion = parseFloat(match[1]);
    let unidadPres = match[3].toLowerCase();
    if (unidadPres === "kg") valorPresentacion *= 1000;
    let cantidadReal = unidad === "kg" ? cantidad * 1000 : cantidad;

    let precioUnitario = precio / valorPresentacion;
    const costo = cantidadReal * precioUnitario;

    ingredients.push({ nombre, cantidad, unidad, presentacion, precio, costo });
    renderIngredientes();
    guardarDatos();
  });

  // Mostrar ingredientes
  function renderIngredientes() {
    ingredientesBody.innerHTML = "";
    let total = 0;
    ingredients.forEach((ing, i) => {
      total += ing.costo;
      ingredientesBody.innerHTML += `
        <tr>
          <td>${ing.nombre}</td>
          <td>${ing.cantidad} ${ing.unidad}</td>
          <td>$${ing.precio.toFixed(2)}</td>
          <td>$${ing.costo.toFixed(2)}</td>
          <td><button onclick="(() => { const index = ${i}; ingredients.splice(index, 1); renderIngredientes(); })()"><i class="fas fa-trash"></i></button></td>
        </tr>`;
    });
    totalIngredientes.textContent = `$${total.toFixed(2)}`;
    calcularTotales();
  }

  // Eliminar ingrediente
  window.eliminarIngrediente = function (i) {
    ingredients.splice(i, 1);
    renderIngredientes();
    guardarDatos();
  };

  // Agregar costo operativo
  document.getElementById("agregarCosto").addEventListener("click", function () {
    const concepto = document.getElementById("costoConcepto").value.trim();
    const valor = parseFloat(document.getElementById("costoValor").value);
    const prorratear = document.getElementById("costoProrratear").checked;

    if (!concepto || isNaN(valor)) {
      alert("Completa los campos del costo operativo.");
      return;
    }

    const valorFinal = prorratear ? valor / 30 : valor;
    operationalCosts.push({ concepto, valor: valorFinal });
    renderCostos();
    guardarDatos();
  });

  // Mostrar costos
  function renderCostos() {
    costosBody.innerHTML = "";
    let total = 0;
    operationalCosts.forEach((costo, i) => {
      total += costo.valor;
      costosBody.innerHTML += `
        <tr>
          <td>${costo.concepto}</td>
          <td>$${costo.valor.toFixed(2)}</td>
          <td><button onclick="eliminarCosto(${i})"><i class="fas fa-trash"></i></button></td>
        </tr>`;
    });
    totalCostos.textContent = `$${total.toFixed(2)}`;
    calcularTotales();
  }

  // Eliminar costo
  window.eliminarCosto = function (i) {
    operationalCosts.splice(i, 1);
    renderCostos();
    guardarDatos();
  };

  // Calcular totales
  function calcularTotales() {
    const totalIng = ingredients.reduce((sum, ing) => sum + ing.costo, 0);
    const totalOps = operationalCosts.reduce((sum, costo) => sum + costo.valor, 0);
    const costoTotal = totalIng + totalOps;
    const margen = parseFloat(margenGanancia.value) || 0;
    const precio = costoTotal * (1 + margen / 100);

    costoPlato.textContent = `$${costoTotal.toFixed(2)}`;
    precioPersona.textContent = `$${precio.toFixed(2)}`;
    guardarDatos();
  }

  margenGanancia.addEventListener("input", calcularTotales);

  // Menú de ajustes
  abrirAjustes.addEventListener("click", function (e) {
    e.stopPropagation();
    menuAjustes.classList.toggle("oculto");
  });

  document.addEventListener("click", function (e) {
    if (!menuAjustes.contains(e.target) && e.target !== abrirAjustes) {
      menuAjustes.classList.add("oculto");
    }
  });

  // Modo oscuro
  document.getElementById("alternarTema").addEventListener("click", function () {
    document.body.classList.toggle("modo-oscuro");
    localStorage.setItem("temaOscuro", document.body.classList.contains("modo-oscuro"));
  });

  if (localStorage.getItem("temaOscuro") === "true") {
    document.body.classList.add("modo-oscuro");
  }

  // Historial
  document.getElementById("verHistorial").addEventListener("click", function () {
    const modal = document.getElementById("modalHistorial");
    const lista = document.getElementById("listaRecetas");
    lista.innerHTML = "";
    const historial = JSON.parse(localStorage.getItem("historialCosteos") || "[]");

    historial.forEach((item, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}. ${item.nombre || "Plato sin nombre"} - ${item.fecha}`;
      lista.appendChild(li);
    });

    modal.style.display = "block";
  });

  document.querySelector(".close-modal").addEventListener("click", function () {
    document.getElementById("modalHistorial").style.display = "none";
  });

  // Calculadora
  document.getElementById("abrirCalculadora").addEventListener("click", function () {
    calcModal.style.display = "block";
    currentCalcInput = "";
    display.value = "";
  });

  document.querySelector(".close-calculadora").addEventListener("click", function () {
    calcModal.style.display = "none";
  });

  window.addEventListener("click", function (e) {
    if (e.target === calcModal) {
      calcModal.style.display = "none";
    }
  });

  document.querySelectorAll(".calc-buttons button").forEach(btn => {
    btn.addEventListener("click", function () {
      const value = this.textContent;
      if (value === "=") {
        try {
          currentCalcInput = eval(currentCalcInput).toString();
        } catch {
          currentCalcInput = "Error";
        }
      } else if (value === "C") {
        currentCalcInput = "";
      } else {
        currentCalcInput += value;
      }
      display.value = currentCalcInput;
    });
  });

  // Guardar costeo
  document.getElementById("guardarCosteo").addEventListener("click", function () {
    guardarDatos();

    // Guardar en historial
    const historial = JSON.parse(localStorage.getItem("historialCosteos") || "[]");
    historial.unshift({
      nombre: platoNombre.value || "Plato sin nombre",
      fecha: new Date().toLocaleDateString(),
      costo: costoPlato.textContent,
      precio: precioPersona.textContent });


    localStorage.setItem("historialCosteos", JSON.stringify(historial));
    alert("Costeo guardado en el historial");
  });

  // Compartir costeo
  document.getElementById("compartirCosteo").addEventListener("click", function () {
    guardarDatos();

    const resumen = `🍽️ ${platoNombre.value || "Plato sin nombre"}\n` +
    `📝 ${platoDescripcion.value || "Sin descripción"}\n\n` +
    `💰 Costo: ${costoPlato.textContent}\n` +
    `💲 Precio: ${precioPersona.textContent}\n\n` +
    `📅 ${new Date().toLocaleDateString()}`;

    if (navigator.share) {
      navigator.share({
        title: 'Mi costeo gastronómico',
        text: resumen,
        url: window.location.href }).
      catch(() => copiarAlPortapapeles(resumen));
    } else {
      copiarAlPortapapeles(resumen);
    }
  });

  function copiarAlPortapapeles(texto) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      alert("Resumen copiado al portapapeles. Pégalo donde quieras compartirlo.");
    } catch (err) {
      alert("No se pudo copiar automáticamente. Selecciona y copia manualmente este texto:\n\n" + texto);
    }

    document.body.removeChild(textarea);
  }

  // Exportar a PDF - VERSIÓN MEJORADA
  document.getElementById("exportarPDF").addEventListener("click", async function () {
    try {
      const { jsPDF } = window.jspdf;
      const app = document.querySelector(".app-container");
      const eraOscuro = document.body.classList.contains("modo-oscuro");

      // Crear un clon del contenido para evitar problemas de renderizado
      const clone = app.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.width = '210mm'; // Ancho A4
      document.body.appendChild(clone);

      // Configuración mejorada de html2canvas
      // Reemplaza la configuración de html2canvas por:
const canvas = await html2canvas(app, {
  scale: 1.8, // ↑ Aumenté para mejor calidad
  useCORS: true,
  logging: false,
  ignoreElements: (el) => el.classList.contains('no-print'),
  onclone: (clonedDoc) => {
    clonedDoc.body.classList.add('printing-pdf');
    if (eraOscuro) clonedDoc.body.classList.remove('modo-oscuro');
  }
});


      const imgWidth = 190; // Ancho A4 menos márgenes (210 - 20)
      const imgHeight = canvas.height * imgWidth / canvas.width;

      // Margen superior de 10mm
      let position = 10;
      const pageHeight = 277; // Altura A4 menos márgenes (297 - 20)

      // Agregar primera página
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, undefined, 'FAST');

      // Si el contenido es más largo que una página
      let heightLeft = imgHeight + position - pageHeight;
      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, 'PNG', 10, -position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save("costeo_" + (platoNombre.value || "plato").replace(/\s+/g, '_') + ".pdf");

      if (eraOscuro) {
        document.body.classList.add("modo-oscuro");
      }
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Ocurrió un error al generar el PDF. Verifica la consola para más detalles.");
    }
  });

  // Cargar datos al iniciar
  cargarDatos();
});
// Ejemplo para el botón de PDF:
document.getElementById("exportarPDF").addEventListener("click", async function() {
  this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
  // ...lógica de generación...
  this.innerHTML = '<i class="fas fa-file-pdf"></i> Guardar PDF';
});
