/**
 * Lógica RSVP y Persistencia - Invitación Fiorella Díaz
 * Maneja el envío del formulario, la integración con Google Sheets y el fallback local.
 */

document.addEventListener("DOMContentLoaded", () => {
  initRSVPForm();
  updateAttendeeCounter();
});

// Obtener el contador de confirmados en base a la configuración (Sheets o Local)
async function updateAttendeeCounter() {
  const counterText = document.getElementById("confirmed-counter-text");
  if (!counterText) return;

  // 1. Si hay una URL de Google Sheets configurada, intentamos consultar en tiempo real
  if (CONFIG.GOOGLE_SHEETS_URL && CONFIG.GOOGLE_SHEETS_URL.trim() !== "") {
    try {
      // Hacer petición GET al Apps Script
      const response = await fetch(CONFIG.GOOGLE_SHEETS_URL);
      if (response.ok) {
        const data = await response.json();
        const count = data.confirmedCount || 0;
        renderCounterText(count);
        return;
      }
    } catch (err) {
      console.warn("Error al conectar con Google Sheets para obtener el contador. Usando local storage.", err);
    }
  }

  // 2. Si no hay URL o si la petición falló, usamos el Local Storage
  const localGuests = getLocalGuests();
  let localCount = 0;
  localGuests.forEach(guest => {
    if (guest.attending === "Sí") {
      localCount += 1 + (parseInt(guest.companions) || 0);
    }
  });

  // Mostramos el conteo real acumulado localmente
  renderCounterText(localCount);
}

// Renderiza el texto del contador de forma elegante
function renderCounterText(count) {
  const counterText = document.getElementById("confirmed-counter-text");
  if (!counterText) return;

  if (count === 0) {
    counterText.innerText = "¡Sé el primero en confirmar asistencia!";
  } else if (count === 1) {
    counterText.innerText = "1 persona confirmada";
  } else {
    counterText.innerText = `${count} personas confirmadas`;
  }
}

// Obtener lista de invitados de Local Storage
function getLocalGuests() {
  const data = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Guardar un invitado en Local Storage
function saveLocalGuest(guest) {
  const guests = getLocalGuests();
  guests.push(guest);
  localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(guests));
}

/* ==========================================================================
   MANEJO DEL FORMULARIO RSVP
   ========================================================================== */
function initRSVPForm() {
  const form = document.getElementById("rsvp-form");
  const successBox = document.getElementById("success-message");
  const submitBtn = document.getElementById("submit-btn");
  const btnSpinner = submitBtn ? submitBtn.querySelector(".loading-spinner") : null;
  const btnText = submitBtn ? submitBtn.querySelector(".btn-text") : null;
  
  // Elementos del formulario dinámicos
  const rsvps = document.getElementsByName("attending");
  const companionsWrapper = document.getElementById("companions-wrapper");
  const companionsSelect = document.getElementById("companions-count");
  const segmentBtns = document.querySelectorAll(".segment-btn");
  const companionNamesGroup = document.getElementById("companion-names-group");
  const companionNamesInput = document.getElementById("companion-names");
  const resetBtn = document.getElementById("reset-form-btn");

  if (!form || !successBox || !submitBtn) return;

  // 1. Mostrar/Ocultar campos según la respuesta del invitado
  function handleAttendingChange() {
    let isAttending = "Sí";
    for (const radio of rsvps) {
      if (radio.checked) {
        isAttending = radio.value;
        break;
      }
    }

    if (isAttending === "Sí") {
      companionsWrapper.classList.remove("hidden");
      handleCompanionsChange(); // Actualizar el estado del campo de nombres
    } else {
      // Si dice que No va a asistir, ocultamos opciones de acompañantes
      companionsWrapper.classList.add("hidden");
      companionNamesGroup.classList.add("hidden");
      companionNamesInput.required = false;
      companionNamesInput.value = "";
      companionsSelect.value = "0";
      
      // Restablecer botones de segmentos a 0
      segmentBtns.forEach(b => {
        if (b.getAttribute("data-value") === "0") b.classList.add("active");
        else b.classList.remove("active");
      });
    }
  }

  // 2. Mostrar/Ocultar entrada de nombres según la cantidad de acompañantes
  function handleCompanionsChange() {
    const count = parseInt(companionsSelect.value) || 0;
    if (count > 0) {
      companionNamesGroup.classList.remove("hidden");
      companionNamesInput.required = true;
      companionNamesInput.placeholder = count === 1 ? "Ej: María Gómez" : "Ej: María Gómez, Carlos Pérez";
    } else {
      companionNamesGroup.classList.add("hidden");
      companionNamesInput.required = false;
      companionNamesInput.value = "";
    }
  }

  // Asignar listeners a eventos
  rsvps.forEach(radio => radio.addEventListener("change", handleAttendingChange));

  // Asignar clicks a los botones segmentados de acompañantes
  segmentBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      segmentBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      companionsSelect.value = btn.getAttribute("data-value");
      handleCompanionsChange();
    });
  });

  // 3. Envío del Formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Obtener datos del formulario
    const guestName = document.getElementById("guest-name").value.trim();
    let attending = "Sí";
    for (const radio of rsvps) {
      if (radio.checked) {
        attending = radio.value;
        break;
      }
    }
    const companionsCount = attending === "Sí" ? parseInt(companionsSelect.value) : 0;
    const companionNames = attending === "Sí" ? companionNamesInput.value.trim() : "";

    const payload = {
      name: guestName,
      attending: attending,
      companions: companionsCount,
      companionNames: companionNames
    };

    // UI: Cambiar a estado de carga
    submitBtn.disabled = true;
    if (btnText) btnText.innerText = "Guardando...";
    if (btnSpinner) btnSpinner.classList.remove("hidden");

    let savedSuccessfully = false;

    // A. Intentar guardar en Google Sheets si la URL está definida
    if (CONFIG.GOOGLE_SHEETS_URL && CONFIG.GOOGLE_SHEETS_URL.trim() !== "") {
      try {
        const response = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
          method: "POST",
          mode: "no-cors", // Requerido para evitar problemas de preflight en algunos servidores
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        
        // Con "no-cors" la respuesta puede venir vacía o tipo opaque, consideramos éxito si no hay catch
        savedSuccessfully = true;
        console.log("Datos enviados exitosamente a Google Sheets.");
      } catch (err) {
        console.error("Error al enviar a Google Sheets. Guardando localmente.", err);
      }
    }

    // B. Siempre guardamos una copia local como respaldo y simulación
    saveLocalGuest(payload);
    if (!savedSuccessfully) {
      console.log("Datos guardados en almacenamiento local del dispositivo.");
    }

    // Esperar unos milisegundos para simular el envío elegante
    setTimeout(async () => {
      // UI: Mostrar mensaje de éxito
      form.classList.add("hidden");
      successBox.classList.remove("hidden");
      
      // Restablecer botón
      submitBtn.disabled = false;
      if (btnText) btnText.innerText = "Confirmar asistencia";
      if (btnSpinner) btnSpinner.classList.add("hidden");

      // Actualizar el contador de asistentes
      await updateAttendeeCounter();
    }, 800);
  });

  // 4. Botón para reiniciar formulario (si quieren confirmar otro invitado)
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      
      // Restablecer botones de segmentos a 0
      segmentBtns.forEach(b => {
        if (b.getAttribute("data-value") === "0") b.classList.add("active");
        else b.classList.remove("active");
      });

      handleAttendingChange();
      successBox.classList.add("hidden");
      form.classList.remove("hidden");
      
      // Enfocar el primer input
      const nameInput = document.getElementById("guest-name");
      if (nameInput) nameInput.focus();
    });
  }
}
