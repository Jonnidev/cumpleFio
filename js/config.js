/**
 * Configuración de la invitación para el cumpleaños de Fiorella Díaz
 */
const CONFIG = {
  // Pon aquí la URL que te da Google Apps Script al implementar como Aplicación Web.
  // Si se deja vacío (""), la página usará el simulador local (guardando en el navegador)
  // para que puedas probarla inmediatamente.
  GOOGLE_SHEETS_URL: "",

  // Fecha del evento para la cuenta regresiva (formato: YYYY-MM-DDTHH:mm:ss)
  EVENT_DATE: "2026-07-18T20:00:00",

  // Datos del evento para el mapa y otros textos
  EVENT_ADDRESS: "Guacolda 1866, La Pintana",
  EVENT_MAPS_URL: "https://www.google.com/maps/search/?api=1&query=Guacolda+1866,+La+Pintana",
  
  // Clave usada para persistir en localStorage cuando no hay URL de Google Sheets activa
  LOCAL_STORAGE_KEY: "rsvp_guests_fiorella"
};
