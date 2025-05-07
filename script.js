document.addEventListener('DOMContentLoaded', function () {
  // Variables globales
  let ingredients = [];
  let operationalCosts = [];
  let dishImage = null;

  // Elementos del DOM
  const platoImage = document.getElementById('platoImage');
  const imagePreview = document.getElementById('imagePreview');
  const ingredienteNombre = document.getElementById('ingredienteNombre');
  const ingredienteCantidad = document.getElementById('ingredienteCantidad');
  const ingredienteUnidad = document.getElementById('ingredienteUnidad');
  const ingredientePresentacion = document.getElementById('ingredientePresentacion');
  const ingredientePrecio = document.getElementById('ingredientePrecio');
  const agregarIngrediente = document.getElementById('agregarIngrediente');
  const ingredientesBody = document.getElementById('ingredientesBody');
  const totalIngredientes = document.getElementById('totalIngredientes');
  const costoConcepto = document.getElementById('costoConcepto');
  const costoValor = document.getElementById('costoValor');
  const agregarCosto = document.getElementById('agregarCosto');
  const costosBody = document.getElementById('costosBody');
  const totalCostos = document.getElementById('totalCostos');
  const costoPlato = document.getElementById('costoPlato');
  const margenGanancia = document.getElementById('margenGanancia');
  const comensales = document.getElementById('comensales');
  const precioPersona = document.getElementById('precioPersona');
  const precioTotal = document.getElementById('precioTotal');
  const numComensales = document.getElementById('numComensales');
  const exportarPDF = document.getElementById('exportarPDF');
  const compartirReceta = document.getElementById('compartirReceta');

  // Inicialización
  init();

  function init() {
    setupEventListeners();
    renderIngredients();
    renderOperationalCosts();
    calculateTotals();
  }

  function setupEventListeners() {
    imagePreview.addEventListener('click', () => platoImage.click());
    platoImage.addEventListener('change', handleImageUpload);
    agregarIngrediente.addEventListener('click', addIngredient);
    agregarCosto.addEventListener('click', addOperationalCost);
    margenGanancia.addEventListener('input', calculateTotals);
    comensales.addEventListener('input', calculateTotals);
    exportarPDF.addEventListener('click', exportToPDF);
    compartirReceta.addEventListener('click', shareRecipe);
  }

  // Manejo de imagen
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        dishImage = event.target.result;
        imagePreview.innerHTML = `<img src="${dishImage}" alt="Foto del plato">`;
        imagePreview.classList.add('has-image');
      };
      reader.readAsDataURL(file);
    }
  }

  // Ingredientes
  function addIngredient() {
    const name = ingredienteNombre.value.trim();
    const amount = parseFloat(ingredienteCantidad.value);
    const unit = ingredienteUnidad.value;
    const presentation = ingredientePresentacion.value.trim();
    const price = parseFloat(ingredientePrecio.value);

    if (!name || isNaN(amount) || isNaN(price)) {
      alert('Completá todos los campos del ingrediente');
      return;
    }

    ingredients.push({
      id: Date.now(),
      name,
      amount,
      unit,
      presentation,
      price,
      portionCost: calculatePortionCost(amount, unit, presentation, price) });


    renderIngredients();
    calculateTotals();
    clearIngredientForm();
  }

  function calculatePortionCost(amount, unit, presentation, price) {
    if (unit === 'gr' || unit === 'kg') {
      const match = presentation.match(/(\d+)\s*(kg|gr)/i);
      if (match) {
        const presentationAmount = parseFloat(match[1]);
        const presentationUnit = match[2].toLowerCase();
        const totalGrams = unit === 'kg' ? amount * 1000 : amount;
        const presentationGrams = presentationUnit === 'kg' ? presentationAmount * 1000 : presentationAmount;
        return totalGrams / presentationGrams * price;
      }
      return unit === 'kg' ? amount * price : amount / 1000 * price;
    } else
    if (unit === 'un') {
      const match = presentation.match(/(\d+)\s*un/i);
      if (match) {
        const presentationAmount = parseFloat(match[1]);
        return amount / presentationAmount * price;
      }
      return amount * price;
    }
    return 0;
  }

  function renderIngredients() {
    ingredientesBody.innerHTML = ingredients.map(ing => `
      <tr>
        <td>${ing.name}</td>
        <td>${ing.amount} ${ing.unit}</td>
        <td>$${ing.price.toFixed(2)}</td>
        <td>$${ing.portionCost.toFixed(2)}</td>
        <td><button class="delete-btn" data-id="${ing.id}"><i class="fas fa-trash"></i></button></td>
      </tr>
    `).join('');

    totalIngredientes.textContent = `$${ingredients.reduce((sum, ing) => sum + ing.portionCost, 0).toFixed(2)}`;

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        ingredients = ingredients.filter(i => i.id !== parseInt(this.getAttribute('data-id')));
        renderIngredients();
        calculateTotals();
      });
    });
  }

  function clearIngredientForm() {
    ingredienteNombre.value = '';
    ingredienteCantidad.value = '';
    ingredientePresentacion.value = '';
    ingredientePrecio.value = '';
    ingredienteNombre.focus();
  }

  // Costos operativos
  function addOperationalCost() {
    const description = costoConcepto.value.trim();
    const amount = parseFloat(costoValor.value);

    if (!description || isNaN(amount)) {
      alert('Completá todos los campos del costo');
      return;
    }

    operationalCosts.push({
      id: Date.now(),
      description,
      amount });


    renderOperationalCosts();
    calculateTotals();
    clearOperationalCostForm();
  }

  function renderOperationalCosts() {
    costosBody.innerHTML = operationalCosts.map(cost => `
      <tr>
        <td>${cost.description}</td>
        <td>$${cost.amount.toFixed(2)}</td>
        <td><button class="delete-btn" data-id="${cost.id}"><i class="fas fa-trash"></i></button></td>
      </tr>
    `).join('');

    totalCostos.textContent = `$${operationalCosts.reduce((sum, cost) => sum + cost.amount, 0).toFixed(2)}`;

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        operationalCosts = operationalCosts.filter(c => c.id !== parseInt(this.getAttribute('data-id')));
        renderOperationalCosts();
        calculateTotals();
      });
    });
  }

  function clearOperationalCostForm() {
    costoConcepto.value = '';
    costoValor.value = '';
    costoConcepto.focus();
  }

  // Cálculos
  function calculateTotals() {
    const ingredientsTotal = ingredients.reduce((sum, ing) => sum + ing.portionCost, 0);
    const operationalTotal = operationalCosts.reduce((sum, cost) => sum + cost.amount, 0) / 30;
    const costPerPlate = ingredientsTotal + operationalTotal;
    const margin = parseInt(margenGanancia.value) || 100;
    const diners = parseInt(comensales.value) || 1;
    const pricePerDiner = costPerPlate * (1 + margin / 100);

    costoPlato.textContent = `$${costPerPlate.toFixed(2)}`;
    precioPersona.textContent = `$${pricePerDiner.toFixed(2)}`;
    precioTotal.textContent = `$${(pricePerDiner * diners).toFixed(2)}`;
    numComensales.textContent = diners;
  }

  // Exportar PDF (Solución definitiva)
  async function exportToPDF() {
    try {
      // Verificar carga de librerías
      if (!window.jspdf || !window.html2canvas) {
        throw new Error("Librerías no cargadas");
      }

      const { jsPDF } = window.jspdf;
      const appContainer = document.querySelector('.app-container');

      // Capturar como imagen
      const canvas = await html2canvas(appContainer, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true });


      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = canvas.height * pdfWidth / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receta_${document.getElementById('platoNombre').value || 'SinNombre'}.pdf`);

    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert(`Error al generar PDF: ${error.message}. Verifica la consola para más detalles.`);
    }
  }

  // Compartir receta (Versión mejorada)
  async function shareRecipe() {
    const platoName = document.getElementById('platoNombre').value || 'Receta sin nombre';
    const platoDesc = document.getElementById('platoDescripcion').value || 'Sin descripción';
    const shareText = `${platoName}\n\n${platoDesc}\n\n💲 Precio por persona: ${precioPersona.textContent}\n\nIngredientes:\n${ingredients.map(i => `- ${i.name} (${i.amount} ${i.unit})`).join('\n')}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Receta: ${platoName}`,
          text: shareText,
          url: window.location.href });

      } else {
        await navigator.clipboard.writeText(shareText);
        alert('✅ Receta copiada al portapapeles. Pégala donde quieras compartirla.');
      }
    } catch (error) {
      console.log('Error al compartir:', error);
      prompt('📋 Copia este texto para compartir:', shareText);
    }
  }
});