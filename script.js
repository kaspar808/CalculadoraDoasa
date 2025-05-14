// ====================== [CONFIGURACIÓN INICIAL] ======================
let ingredients = [];
let operationalCosts = [];
let currentCalcInput = "";
const STORAGE_KEY = "costeoData";

// ====================== [INICIALIZACIÓN] ======================
document.addEventListener("DOMContentLoaded", function() {
  // ====================== [1. ELEMENTOS DEL DOM] ======================
  const elementos = {
    // Sección Principal
    appContainer: document.querySelector(".app-container"),
    
    // Formularios
    platoNombre: document.getElementById("platoNombre"),
    platoDescripcion: document.getElementById("platoDescripcion"),
    margenGanancia: document.getElementById("margenGanancia"),
    imagePreview: document.getElementById("imagePreview"),
    imageInput: document.getElementById("platoImage"),
    
    // Tablas
    ingredientesBody: document.getElementById("ingredientesBody"),
    costosBody: document.getElementById("costosBody"),
    totalIngredientes: document.getElementById("totalIngredientes"),
    totalCostos: document.getElementById("totalCostos"),
    costoPlato: document.getElementById("costoPlato"),
    precioPersona: document.getElementById("precioPersona"),
    
    // Menú y Modales
    abrirAjustes: document.getElementById("abrirAjustes"),
    menuAjustes: document.getElementById("menuAjustes"),
    calcModal: document.getElementById("modalCalculadora"),
    display: document.getElementById("calcDisplay"),
    modalHistorial: document.getElementById("modalHistorial"),
    listaRecetas: document.getElementById("listaRecetas")
  };

  // Validación de elementos críticos
  if (!elementos.appContainer) {
    console.error("Error: No se encontró el contenedor principal");
    return;
  }

  // ====================== [2. FUNCIONES CORE] ======================
  
  // ----- [2.1] Sistema de Guardado -----
  function cargarDatos() {
    try {
      const datosGuardados = localStorage.getItem(STORAGE_KEY);
      if (!datosGuardados) return;

      const datos = JSON.parse(datosGuardados);
      
      // Migración desde versiones antiguas
      if (!datos.version) {
        ingredients = datos.ingredients || [];
        operationalCosts = datos.operationalCosts || [];
      } else {
        ingredients = datos.ingredientes || datos.ingredients || [];
        operationalCosts = datos.costosOperativos || datos.operationalCosts || [];
      }

      if (elementos.platoNombre) elementos.platoNombre.value = datos.platoNombre || datos.nombre || "";
      if (elementos.platoDescripcion) elementos.platoDescripcion.value = datos.platoDescripcion || datos.descripcion || "";
      if (elementos.margenGanancia) elementos.margenGanancia.value = datos.margenGanancia || datos.margen || 100;
      if (elementos.imagePreview && datos.imageData) {
        elementos.imagePreview.innerHTML = `<img src="${datos.imageData}" alt="${datos.platoNombre || 'Plato'}">`;
      }

      renderIngredientes();
      renderCostos();
      calcularTotales();
    } catch (error) {
      console.error("Error al cargar datos:", error);
      localStorage.removeItem(STORAGE_KEY); // Limpia datos corruptos
    }
  }

  function guardarDatos() {
    try {
      const imageData = elementos.imagePreview?.querySelector("img")?.src || "";
      const datos = {
        version: 2,
        nombre: elementos.platoNombre?.value || "",
        descripcion: elementos.platoDescripcion?.value || "",
        ingredientes: ingredients,
        costosOperativos: operationalCosts,
        margen: parseFloat(elementos.margenGanancia?.value) || 100,
        imageData,
        fechaActualizacion: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  }

  // ----- [2.2] Sistema de Exportación/Importación -----
  function exportarAJson() {
    try {
      const datos = {
        version: 2,
        nombre: elementos.platoNombre?.value || "",
        descripcion: elementos.platoDescripcion?.value || "",
        ingredientes: ingredients,
        costosOperativos: operationalCosts,
        margen: parseFloat(elementos.margenGanancia?.value) || 100,
        imagen: elementos.imagePreview?.querySelector("img")?.src || "",
        fechaExportacion: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(datos, null, 2)], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `costeo_${elementos.platoNombre?.value || "receta"}_${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al exportar la receta");
    }
  }

  function importarDesdeJson(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const datos = JSON.parse(e.target.result);
        
        // Validación básica
        if (!datos.ingredientes && !datos.ingredients) {
          throw new Error("Formato inválido: No se encontraron ingredientes");
        }

        // Migración desde versiones antiguas
        ingredients = datos.ingredientes || datos.ingredients || [];
        operationalCosts = datos.costosOperativos || datos.operationalCosts || [];
        
        if (elementos.platoNombre) elementos.platoNombre.value = datos.nombre || datos.platoNombre || "";
        if (elementos.platoDescripcion) elementos.platoDescripcion.value = datos.descripcion || datos.platoDescripcion || "";
        if (elementos.margenGanancia) elementos.margenGanancia.value = datos.margen || datos.margenGanancia || 100;
        
        if (elementos.imagePreview) {
          elementos.imagePreview.innerHTML = datos.imagen ? 
            `<img src="${datos.imagen}" alt="${datos.nombre || 'Plato'}">` : 
            `<i class="fas fa-camera"></i><span>+ Agregar foto</span>`;
        }

        renderIngredientes();
        renderCostos();
        calcularTotales();
        guardarDatos();
        
        alert(`Receta "${datos.nombre || datos.platoNombre || 'sin nombre'}" cargada correctamente`);
      } catch (error) {
        console.error("Error al importar:", error);
        alert(`Error al importar: ${error.message}`);
      }
    };
    reader.readAsText(file);
  }

  // ----- [2.3] Renderizado -----
  function renderIngredientes() {
    if (!elementos.ingredientesBody) return;
    
    elementos.ingredientesBody.innerHTML = "";
    let total = 0;
    
    ingredients.forEach((ing, i) => {
      total += ing.costo || 0;
      const row = document.createElement("tr");
      row.dataset.index = i;
      row.innerHTML = `
        <td>${ing.nombre || "Sin nombre"}</td>
        <td>${ing.cantidad || 0} ${ing.unidad || "gr"}</td>
        <td>$${(ing.precio || 0).toFixed(2)}</td>
        <td>$${(ing.costo || 0).toFixed(2)}</td>
        <td><button class="btn-eliminar"><i class="fas fa-trash"></i></button></td>
      `;
      elementos.ingredientesBody.appendChild(row);
    });
    
    if (elementos.totalIngredientes) {
      elementos.totalIngredientes.textContent = `$${total.toFixed(2)}`;
    }
  }

  function renderCostos() {
    if (!elementos.costosBody) return;
    
    elementos.costosBody.innerHTML = "";
    let total = 0;
    
    operationalCosts.forEach((costo, i) => {
      total += costo.valor || 0;
      const row = document.createElement("tr");
      row.dataset.index = i;
      row.innerHTML = `
        <td>${costo.concepto || "Sin concepto"}</td>
        <td>$${(costo.valor || 0).toFixed(2)}</td>
        <td><button class="btn-eliminar"><i class="fas fa-trash"></i></button></td>
      `;
      elementos.costosBody.appendChild(row);
    });
    
    if (elementos.totalCostos) {
      elementos.totalCostos.textContent = `$${total.toFixed(2)}`;
    }
  }

  // ----- [2.4] Cálculos -----
  function calcularTotales() {
    const totalIng = ingredients.reduce((sum, ing) => sum + (ing.costo || 0), 0);
    const totalOps = operationalCosts.reduce((sum, costo) => sum + (costo.valor || 0), 0);
    const costoTotal = totalIng + totalOps;
    const margen = parseFloat(elementos.margenGanancia?.value) || 0;
    const precio = costoTotal * (1 + margen / 100);

    if (elementos.costoPlato) elementos.costoPlato.textContent = `$${costoTotal.toFixed(2)}`;
    if (elementos.precioPersona) elementos.precioPersona.textContent = `$${precio.toFixed(2)}`;
    
    guardarDatos();
  }

  // ====================== [3. EVENTOS] ======================
  
  // ----- [3.1] Eventos Globales -----
  function setupEventListeners() {
    // Eliminación segura de items
    document.addEventListener("click", function(e) {
      if (!e.target.closest(".btn-eliminar")) return;
      
      const row = e.target.closest("tr");
      if (!row) return;
      
      const index = parseInt(row.dataset.index);
      if (isNaN(index)) return;
      
      if (row.parentElement === elementos.ingredientesBody) {
        ingredients.splice(index, 1);
        renderIngredientes();
      } else if (row.parentElement === elementos.costosBody) {
        operationalCosts.splice(index, 1);
        renderCostos();
      }
      
      calcularTotales();
    });

    // Menú de ajustes
    if (elementos.abrirAjustes && elementos.menuAjustes) {
      elementos.abrirAjustes.addEventListener("click", function(e) {
        e.stopPropagation();
        elementos.menuAjustes.classList.toggle("oculto");
      });

      document.addEventListener("click", function(e) {
        if (elementos.menuAjustes.contains(e.target) || e.target === elementos.abrirAjustes) return;
        elementos.menuAjustes.classList.add("oculto");
      });
    }

    // Calculadora
    if (elementos.calcModal && elementos.display) {
      const calcButtons = document.querySelectorAll(".calc-buttons button");
      calcButtons.forEach(btn => {
        btn.addEventListener("click", function() {
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
          elementos.display.value = currentCalcInput;
        });
      });
    }

    // Imagen
    if (elementos.imagePreview && elementos.imageInput) {
      elementos.imagePreview.addEventListener("click", () => elementos.imageInput.click());
      elementos.imageInput.addEventListener("change", function() {
        const file = this.files[0];
        if (!file || !file.type.startsWith("image/")) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
          elementos.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Imagen del plato">`;
          guardarDatos();
        };
        reader.readAsDataURL(file);
      });
    }

    // Margen
    if (elementos.margenGanancia) {
      elementos.margenGanancia.addEventListener("input", calcularTotales);
    }
  }

  // ----- [3.2] Botones de Acción -----
  function setupActionButtons() {
    const actionButtons = document.querySelector(".action-buttons");
    if (!actionButtons) return;

    // Botón Exportar
    const exportBtn = document.createElement("button");
    exportBtn.className = "btn-action";
    exportBtn.innerHTML = '<i class="fas fa-file-export"></i> Exportar';
    exportBtn.addEventListener("click", exportarAJson);

    // Botón Importar
    const importInput = document.createElement("input");
    importInput.type = "file";
    importInput.accept = ".json";
    importInput.style.display = "none";
    importInput.addEventListener("change", importarDesdeJson);

    const importBtn = document.createElement("button");
    importBtn.className = "btn-action";
    importBtn.innerHTML = '<i class="fas fa-file-import"></i> Importar';
    importBtn.addEventListener("click", () => importInput.click());

    // Insertar botones
    actionButtons.prepend(importInput);
    actionButtons.prepend(importBtn);
    actionButtons.prepend(exportBtn);
  }

  // ====================== [INICIALIZACIÓN FINAL] ======================
  function init() {
    setupEventListeners();
    setupActionButtons();
    cargarDatos();
  }

  init();
// CORRECCIÓN PARA MENÚ DE AJUSTES
document.addEventListener('DOMContentLoaded', function() {
  const menuAjustes = document.getElementById('menuAjustes');
  const abrirAjustes = document.getElementById('abrirAjustes');
  
  if (abrirAjustes && menuAjustes) {
    abrirAjustes.addEventListener('click', function(e) {
      e.stopPropagation();
      menuAjustes.classList.toggle('oculto');
    });
    
    document.addEventListener('click', function(e) {
      if (e.target !== abrirAjustes && !menuAjustes.contains(e.target)) {
        menuAjustes.classList.add('oculto');
      }
    });
  }
});
});
