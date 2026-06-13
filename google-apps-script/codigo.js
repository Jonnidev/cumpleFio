/**
 * Google Apps Script - Servidor para la invitación de Fiorella Díaz.
 * 
 * Instrucciones:
 * 1. Abre tu hoja de Google Sheets.
 * 2. Ve a Extensiones > Apps Script.
 * 3. Borra el código existente y pega este archivo.
 * 4. Guarda con el icono de disco.
 * 5. Haz clic en "Implementar" > "Nueva implementación".
 * 6. Selecciona tipo: "Aplicación web".
 * 7. Configura:
 *    - Descripción: "Servidor RSVP Fiorella"
 *    - Ejecutar como: "Yo" (tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquiera" (necesario para que los invitados puedan enviar sus datos).
 * 8. Haz clic en "Implementar", autoriza los permisos requeridos.
 * 9. Copia la URL de la aplicación web que te proporciona y pégala en js/config.js.
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var totalConfirmed = 0;
  
  // [Marca temporal, Nombre y Apellido, ¿Asistirá?, Acompañantes, Nombres de Acompañantes]
  for (var i = 1; i < data.length; i++) {
    var attending = data[i][2]; // Columna C: ¿Asistirá?
    var companions = parseInt(data[i][3]) || 0; // Columna D: Acompañantes
    
    // Si la persona confirma asistencia
    if (attending === "Sí" || attending === "Si" || attending === "yes" || attending === true) {
      totalConfirmed += 1 + companions;
    }
  }
  
  var response = {
    confirmedCount: totalConfirmed
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Asegurarnos de que existan encabezados si la hoja está vacía
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Marca temporal", 
      "Nombre y Apellido", 
      "¿Asistirá?", 
      "Acompañantes", 
      "Nombres de Acompañantes"
    ]);
  }
  
  var params;
  try {
    params = JSON.parse(e.postData.contents);
  } catch (err) {
    params = e.parameter;
  }
  
  var timestamp = new Date();
  var name = params.name || "";
  var attending = params.attending || "";
  var companions = parseInt(params.companions) || 0;
  var companionNames = params.companionNames || "";
  
  sheet.appendRow([timestamp, name, attending, companions, companionNames]);
  
  var response = {
    result: "success",
    message: "Registro guardado correctamente"
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
