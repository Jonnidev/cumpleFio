# Invitación de Cumpleaños - Fiorella Díaz 🌸

Página web de alta gama, responsiva y elegante para la invitación al cumpleaños de Fiorella Díaz. El diseño cuenta con una estética premium basada en tonos azules y plateados, partículas animadas flotantes de fondo, una cuenta regresiva interactiva y persistencia de confirmaciones directa en Google Sheets.

## 🚀 Cómo funciona la persistencia en Google Sheets

Para registrar los datos de tus invitados en tiempo real y mostrarlos en el contador, sigue estos sencillos pasos:

### Paso 1: Configurar la Hoja de Google Sheets
1. Entra a [Google Sheets](https://sheets.google.com) y crea una **hoja de cálculo nueva**.
2. Ponle un nombre descriptivo (por ejemplo: `Cumpleaños Fiorella - Invitados`).
3. Deja la hoja en blanco (el script creará automáticamente las columnas al recibir el primer registro).

### Paso 2: Pegar el código en Google Apps Script
1. En el menú superior de tu hoja de cálculo, haz clic en **Extensiones** > **Apps Script**.
2. Borra todo el código que aparezca por defecto en el editor.
3. Abre el archivo de este proyecto: [google-apps-script/codigo.js](file:///c:/Users/Tokyotech/Documents/cumpleFiorella/google-apps-script/codigo.js) y copia todo su contenido.
4. Pégalo en el editor de Apps Script.
5. Haz clic en el botón de **Guardar** (el icono de disquete en la barra de herramientas).

### Paso 3: Publicar como Aplicación Web
1. En la esquina superior derecha, haz clic en **Implementar** > **Nueva implementación**.
2. En la ventana emergente, haz clic en la rueda dentada de "Seleccionar tipo" y elige **Aplicación web**.
3. Configura los siguientes campos:
   * **Descripción**: `RSVP Fiorella`
   * **Ejecutar como**: `Yo (tu_correo@gmail.com)`
   * **Quién tiene acceso**: `Cualquiera` *(Importante: Debe ser "Cualquiera" para que los invitados puedan enviar sus datos a la hoja sin tener que iniciar sesión)*.
4. Haz clic en el botón azul **Implementar**.
5. Si es la primera vez, Google te pedirá que autorices permisos. Haz clic en **Autorizar acceso**, selecciona tu cuenta de correo, haz clic en **Configuración avanzada** (abajo a la izquierda) y luego en **Ir a Proyecto (no seguro)**. Acepta los permisos de escritura y lectura.
6. Una vez completado, copia la **URL de la aplicación web** que te proporciona Google (es un enlace largo que termina en `/exec`).

### Paso 4: Enlazar con tu Página Web
1. Abre el archivo [js/config.js](file:///c:/Users/Tokyotech/Documents/cumpleFiorella/js/config.js).
2. Busca la línea: `GOOGLE_SHEETS_URL: "",`
3. Pega la URL que copiaste entre las comillas. Ejemplo:
   ```javascript
   GOOGLE_SHEETS_URL: "https://script.google.com/macros/s/AKfycb.../exec",
   ```
4. Guarda el archivo. ¡Listo! A partir de ahora, cada invitado que confirme asistencia se registrará al instante en tu hoja de Google Sheets.

*Nota: Si dejas la URL vacía, la página funcionará en **modo simulación (fallback)** usando el almacenamiento local del navegador (`localStorage`) para que puedas probarla sin configurar nada.*

---


---

## 🌐 Cómo desplegar tu invitación en Internet gratis

Puedes subir tu invitación para que tus amigos la abran desde su móvil o WhatsApp usando cualquiera de estas dos opciones gratuitas:

### Opción A: Netlify (La más rápida - Recomendado)
1. Entra a [Netlify Drop](https://app.netlify.com/drop).
2. Arrastra la carpeta completa del proyecto (`cumpleFiorella`) al recuadro de la página.
3. En unos segundos, Netlify compilará tu web y te dará un enlace público para compartir.
4. Puedes ir a la configuración del sitio en Netlify para personalizar la URL (por ejemplo: `cumple-fiorella.netlify.app`).

### Opción B: GitHub Pages (Ideal si usas Git)
1. Sube esta carpeta a un nuevo repositorio público en tu cuenta de GitHub.
2. Ve a la pestaña **Settings** (Configuración) de tu repositorio.
3. Desliza hasta la sección **Pages** (a la izquierda).
4. En **Source**, selecciona la rama `main` (o `master`) y la carpeta `/ (root)`.
5. Haz clic en **Save** (Guardar).
6. Tu página estará publicada en un par de minutos bajo la URL: `https://tu-usuario.github.io/tu-repositorio/`.
