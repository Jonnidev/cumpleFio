/**
 * Google Apps Script - Servidor RSVP Organizado por Hojas con Autodiseño Premium
 * 
 * Este código divide las confirmaciones en dos pestañas diferentes:
 * 1. "Asistentes": Guarda a los que confirmaron "Sí" y aplica diseño con cabeceras azul marino.
 * 2. "No Asistentes": Guarda a los que confirmaron "No", registrando solo Nombre y Apellido.
 * 
 * Además, da formato automático a la hoja de cálculo (fuentes, alineación, colores,
 * tamaños de celda y autoajuste con flush) para que la cumpleañera pueda revisarla cómodamente desde su móvil.
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
      
      // Buscamos el número entre paréntesis: e.g. "Sí (2 - Nombre1, Nombre2)"
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
  var isNewSheet = false;
  
  // Crear la hoja si no existe
  if (!sheet) {
    isNewSheet = true;
    sheet = ss.insertSheet(sheetName);
  }
  
  // Escribir las cabeceras si la hoja está vacía (independiente de si es nueva o ya existía)
  if (sheet.getLastRow() === 0) {
    if (sheetName === "Asistentes") {
      sheet.appendRow(["Nombre y Apellido", "¿Lleva Acompañantes?"]);
    } else {
      sheet.appendRow(["Nombre y Apellido"]);
    }
  }
  
  // Eliminar la "Hoja 1" inicial si queda vacía y ya creamos nuestras pestañas
  var defaultSheet = ss.getSheetByName("Hoja 1") || ss.getSheetByName("Sheet 1");
  if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch(err) {
      // Ignorar si no se puede borrar
    }
  }
  
  // Escribir los datos según el caso
  if (sheetName === "Asistentes") {
    var companionsText = companions > 0 ? "Sí (" + companions + " - " + companionNames + ")" : "No";
    sheet.appendRow([name, companionsText]);
  } else {
    sheet.appendRow([name]);
  }
  
  // Aplicar formato de diseño a la tabla
  formatTable(sheet, sheetName, isNewSheet);
  
  var response = {
    result: "success",
    message: "Registro guardado y formateado en la hoja " + sheetName
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Da formato elegante a la hoja para visualización en computadoras y celulares.
 */
function formatTable(sheet, sheetName, isNewSheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  // 1. Configurar fila de Cabecera (Fila 1)
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1); // Mantiene las cabeceras fijas al hacer scroll
  
  var headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange.setBackground("#0d1b2a") // Azul Marino Oscuro
             .setFontColor("#f1f5f9")  // Plata Claro
             .setFontWeight("bold")
             .setFontFamily("Arial")
             .setFontSize(11)
             .setHorizontalAlignment("center")
             .setVerticalAlignment("middle");
  
  // 2. Dar formato a la fila que acabamos de agregar
  if (lastRow > 1) {
    sheet.setRowHeight(lastRow, 30); // Filas más altas para presionar fácil en móviles
    var rowRange = sheet.getRange(lastRow, 1, 1, lastCol);
    rowRange.setFontSize(10)
            .setFontFamily("Arial")
            .setVerticalAlignment("middle")
            .setFontColor("#1e293b"); // Gris Oscuro para texto legible
            
    // Alternar colores de fila para mejorar lectura (Filas pares vs impares)
    if (lastRow % 2 === 0) {
      rowRange.setBackground("#f8fafc"); // Gris/Azul muy claro
    } else {
      rowRange.setBackground("#ffffff"); // Blanco
    }
    
    // Alinear el Nombre a la izquierda
    sheet.getRange(lastRow, 1).setHorizontalAlignment("left");
    
    // Alinear la columna de Acompañantes al centro
    if (sheetName === "Asistentes" && lastCol >= 2) {
      var companionsCell = sheet.getRange(lastRow, 2);
      companionsCell.setHorizontalAlignment("center");
      
      // Resaltar en azul si lleva acompañantes
      if (companionsCell.getValue().toString().indexOf("Sí") === 0) {
        companionsCell.setFontWeight("bold")
                      .setFontColor("#1d4ed8"); // Azul Rey
      }
    }
  }
  
  // 3. Habilitar cuadrícula
  sheet.setGridlines(true);
  
  // 4. Forzar renderizado inmediato (flush) para que el autoajuste de columnas calcule el tamaño real
  SpreadsheetApp.flush();
  
  // Autoajustar las columnas al contenido con un margen generoso
  for (var c = 1; c <= lastCol; c++) {
    sheet.autoResizeColumn(c);
    var width = sheet.getColumnWidth(c);
    sheet.setColumnWidth(c, Math.max(width + 35, 180)); // Margen de +35px y ancho mínimo de 180px
  }
}
