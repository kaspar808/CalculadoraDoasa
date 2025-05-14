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
      if (datos.platoDescripcion)
      platoDescripcion.value = datos.platoDescripcion;
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
    if (
    file &&
    file.type.startsWith("image/") &&
    file.size <= 2 * 1024 * 1024)
    {
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
  document.
  getElementById("agregarIngrediente").
  addEventListener("click", function () {
    const nombre = document.getElementById("ingredienteNombre").value.trim();
    const cantidad = parseFloat(
    document.getElementById("ingredienteCantidad").value);

    const unidad = document.getElementById("ingredienteUnidad").value;
    const presentacion = document.
    getElementById("ingredientePresentacion").
    value.trim();
    const precio = parseFloat(
    document.getElementById("ingredientePrecio").value);


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

    ingredients.push({
      nombre,
      cantidad,
      unidad,
      presentacion,
      precio,
      costo });

    renderIngredientes();
    guardarDatos();
  });

  // Mostrar ingredientes
  function renderIngredientes() {
    ingredientesBody.innerHTML = "";
    let total = 0;
    ingredients.forEach((ing, i) => {
      total += ing.costo;
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${ing.nombre}</td>
        <td>${ing.cantidad} ${ing.unidad}</td>
        <td>$${ing.precio.toFixed(2)}</td>
        <td>$${ing.costo.toFixed(2)}</td>
        <td><button class="btn-eliminar"><i class="fas fa-trash"></i></button></td>
      `;

      row.
      querySelector(".btn-eliminar").
      addEventListener("click", () => eliminarIngrediente(i));
      ingredientesBody.appendChild(row);
    });
    totalIngredientes.textContent = `$${total.toFixed(2)}`;
    calcularTotales();
  }

  // Eliminar ingrediente
  function eliminarIngrediente(i) {
    ingredients.splice(i, 1);
    renderIngredientes();
    guardarDatos();
  }

  // Agregar costo operativo
  document.
  getElementById("agregarCosto").
  addEventListener("click", function () {
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
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${costo.concepto}</td>
        <td>$${costo.valor.toFixed(2)}</td>
        <td><button class="btn-eliminar"><i class="fas fa-trash"></i></button></td>
      `;

      row.
      querySelector(".btn-eliminar").
      addEventListener("click", () => eliminarCosto(i));
      costosBody.appendChild(row);
    });
    totalCostos.textContent = `$${total.toFixed(2)}`;
    calcularTotales();
  }

  // Eliminar costo
  function eliminarCosto(i) {
    operationalCosts.splice(i, 1);
    renderCostos();
    guardarDatos();
  }

  // Calcular totales
  function calcularTotales() {
    const totalIng = ingredients.reduce((sum, ing) => sum + ing.costo, 0);
    const totalOps = operationalCosts.reduce(
    (sum, costo) => sum + costo.valor,
    0);

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
  document.
  getElementById("alternarTema").
  addEventListener("click", function () {
    document.body.classList.toggle("modo-oscuro");
    localStorage.setItem(
    "temaOscuro",
    document.body.classList.contains("modo-oscuro"));

  });

  if (localStorage.getItem("temaOscuro") === "true") {
    document.body.classList.add("modo-oscuro");
  }

  // Historial
  document.
  getElementById("verHistorial").
  addEventListener("click", function () {
    const modal = document.getElementById("modalHistorial");
    const lista = document.getElementById("listaRecetas");
    lista.innerHTML = "";
    const historial = JSON.parse(
    localStorage.getItem("historialCosteos") || "[]");


    historial.forEach((item, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}. ${item.nombre || "Plato sin nombre"} - ${
      item.fecha
      }`;
      lista.appendChild(li);
    });

    modal.style.display = "block";
  });

  document.querySelector(".close-modal").addEventListener("click", function () {
    document.getElementById("modalHistorial").style.display = "none";
  });

  // Calculadora
  document.
  getElementById("abrirCalculadora").
  addEventListener("click", function () {
    calcModal.style.display = "block";
    currentCalcInput = "";
    display.value = "";
  });

  document.
  querySelector(".close-calculadora").
  addEventListener("click", function () {
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
  document.
  getElementById("guardarCosteo").
  addEventListener("click", function () {
    guardarDatos();

    // Guardar en historial
    const historial = JSON.parse(
    localStorage.getItem("historialCosteos") || "[]");

    historial.unshift({
      nombre: platoNombre.value || "Plato sin nombre",
      fecha: new Date().toLocaleDateString(),
      costo: costoPlato.textContent,
      precio: precioPersona.textContent });


    localStorage.setItem("historialCosteos", JSON.stringify(historial));
    alert("Costeo guardado en el historial");
  });

  // Compartir costeo
  document.
  getElementById("compartirCosteo").
  addEventListener("click", function () {
    guardarDatos();

    const resumen =
    `🍽️ ${platoNombre.value || "Plato sin nombre"}\n` +
    `📝 ${platoDescripcion.value || "Sin descripción"}\n\n` +
    `💰 Costo: ${costoPlato.textContent}\n` +
    `💲 Precio: ${precioPersona.textContent}\n\n` +
    `📅 ${new Date().toLocaleDateString()}`;

    if (navigator.share) {
      navigator.
      share({
        title: "Mi costeo gastronómico",
        text: resumen,
        url: window.location.href }).

      catch(() => copiarAlPortapapeles(resumen));
    } else {
      copiarAlPortapapeles(resumen);
    }
  });

  function copiarAlPortapapeles(texto) {
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      alert(
      "Resumen copiado al portapapeles. Pégalo donde quieras compartirlo.");

    } catch (err) {
      alert(
      "No se pudo copiar automáticamente. Selecciona y copia manualmente este texto:\n\n" +
      texto);

    }

    document.body.removeChild(textarea);
  }

// Exportar a PDF
document.getElementById("exportarPDF").addEventListener("click", async function () {
  try {
    const { jsPDF } = window.jspdf;
    const app = document.querySelector(".app-container");
    const eraOscuro = document.body.classList.contains("modo-oscuro");
    const platoNombre = document.getElementById("nombrePlato"); // Asegura que esta ID exista

    // Cambiar temporalmente a modo claro para PDF
    if (eraOscuro) {
      document.body.classList.remove("modo-oscuro");
      document.body.classList.add("print-preview");
    }

    // Ocultar elementos no deseados
    document.querySelectorAll("button, .action-buttons, .app-header, .menu-ajustes")
      .forEach(el => {
        el.style.visibility = "hidden";
      });

    // Capturar imagen del contenedor
    const canvas = await html2canvas(app, {
      scale: 2,
      logging: false,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: "#FFFFFF"
    });

    // Restaurar visibilidad
    document.querySelectorAll("button, .action-buttons, .app-header, .menu-ajustes")
      .forEach(el => {
        el.style.visibility = "";
      });

    // Crear PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const imgWidth = 190; // A4 width - margins
    const imgHeight = canvas.height * imgWidth / canvas.width;

    // Si la imagen es más alta que una página, dividir
    if (imgHeight > 277) {
      let position = 10;
      let remainingHeight = imgHeight;
      const pageHeight = 287;

      while (remainingHeight > 0) {
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
        if (remainingHeight > 0) {
          pdf.addPage();
          position = 0;
        }
      }
    } else {
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    }

    // Guardar PDF
    const fileName =
      "costeo_" +
      (platoNombre?.value || "plato").trim().replace(/\s+/g, "_") +
      ".pdf";
    pdf.save(fileName);

    // Restaurar modo oscuro si estaba activo
    if (eraOscuro) {
      document.body.classList.add("modo-oscuro");
      document.body.classList.remove("print-preview");
    }
  } catch (error) {
    console.error("Error al generar PDF:", error);
    alert("Ocurrió un error al generar el PDF. Verifica la consola para más detalles.");
  }
});


  // Cargar datos al iniciar
  cargarDatos();
});
