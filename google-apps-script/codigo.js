/**
 * Google Apps Script - Servidor RSVP Organizado por Hojas
 * 
 * Este código divide las confirmaciones en dos pestañas diferentes:
 * 1. "Asistentes": Guarda a los que confirmaron "Sí", su Nombre y Apellido, y si llevan acompañantes ("Sí (N - Nombres)" o "No").
 * 2. "No Asistentes": Guarda a los que confirmaron "No", registrando solo su Nombre y Apellido.
 * 
 * El contador (doGet) suma automáticamente los invitados principales de la pestaña "Asistentes"
 * más la cantidad de acompañantes que se extrae del formato "Sí (N)".
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Asistentes");
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ confirmedCount: 0 }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = sheet.getDataRange().getValues();
  var totalConfirmed = 0;
  
  // Headers: [Nombre y Apellido, ¿Lleva Acompañantes?]
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim() !== "") {
      totalConfirmed += 1; // Cuenta al invitado principal
      
      var companionsVal = data[i][1] ? data[i][1].toString() : "";
      
      // Si la celda empieza con "Sí (", buscamos el número entre paréntesis: e.g. "Sí (2 - Nombre1, Nombre2)"
      if (companionsVal.indexOf("Sí (") === 0) {
        var match = companionsVal.match(/\((\d+)\)/);
        if (match) {
          totalConfirmed += parseInt(match[1]) || 0;
        }
      }
    }
  }
  
  var response = {
    confirmedCount: totalConfirmed
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var params;
  try {
    params = JSON.parse(e.postData.contents);
  } catch (err) {
    params = e.parameter;
  }
  
  var name = params.name || "";
  var attending = params.attending || "";
  var companions = parseInt(params.companions) || 0;
  var companionNames = params.companionNames || "";
  
  // Determinar en qué hoja guardar
  var sheetName = (attending === "Sí" || attending === "Si") ? "Asistentes" : "No Asistentes";
  var sheet = ss.getSheetByName(sheetName);
  
  // Crear la hoja si no existe y configurar sus cabeceras
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (sheetName === "Asistentes") {
      sheet.appendRow(["Nombre y Apellido", "¿Lleva Acompañantes?"]);
    } else {
      sheet.appendRow(["Nombre y Apellido"]);
    }
  }
  
  // Escribir los datos simplificados según el caso
  if (sheetName === "Asistentes") {
    // Si no lleva acompañantes, escribimos "No" en lugar de 0.
    // Si lleva, escribimos "Sí (N - Nombres)" para que doGet pueda sumar la cantidad.
    var companionsText = companions > 0 ? "Sí (" + companions + " - " + companionNames + ")" : "No";
    sheet.appendRow([name, companionsText]);
  } else {
    // Si no asiste, solo guardamos el Nombre y Apellido
    sheet.appendRow([name]);
  }
  
  var response = {
    result: "success",
    message: "Registro guardado en la hoja " + sheetName
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
