document.getElementById("frmCondonacion").addEventListener("submit", async function (e) {
  e.preventDefault();

  await enviarFormulario();
});

async function enviarFormulario() {
  //obtener el archivo de ficha de comprobante para cobnvertirloa base64
  const archivo = document.getElementById("fichaDeposito").files[0];
  let archivoBase64 = "";
  let archivoNombre = "";
  let archivoMime = "";

  if (archivo) {
    archivoBase64 = await convertirBase64(archivo);
    archivoNombre = archivo.name;
    archivoMime = archivo.type;
  }

  const archivo2 = document.getElementById("convenio").files[0];
  let archivo2Base64 = "";
  let archivo2Nombre = "";
  let archivo2Mime = "";

  if (archivo) {
    archivo2Base64 = await convertirBase64(archivo2);
    archivo2Nombre = archivo.name;
    archivo2Mime = archivo.type;
  }

  // Estructura del objeto con todos los datos a enviar
  const datos = {
    fechaHora: document.getElementById("fechaHora").value,
    telefonoEjecutivo: document.getElementById("telefonoEjecutivo").value,
    nombreCliente: document.getElementById("nombreCliente").value,
    credito: document.getElementById("credito").value,
    producto: document.getElementById("producto").value,
    diasAtraso: document.getElementById("diasAtraso").value,
    importe: document.getElementById("importe").value,
    fechaDeposito: document.getElementById("fechaDeposito").value,
    nombreEjecutivo: document.getElementById("nombreEjecutivo").value,
    correoEjecutivo: document.getElementById("correoEjecutivo").value,
    comentario: document.getElementById("comentario").value,
    fichaBase64: archivoBase64,
    fichaNombre: archivoNombre,
    fichaMime: archivoMime,
    convenioBase64: archivo2Base64,
    convenioNombre: archivo2Nombre,
    convenioMime: archivo2Mime,
  };

  // Envío por medio de Fetch API a la WebApp de Google Apps Script
  const API_URL = "https://script.google.com/macros/s/AKfycbzMgD_UPRCid4KE9Ud1eAZPSas1G6CYmSaJtnqZfBFyaY3nHtSWohXZ-v5uEBP-TOwGeg/exec";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      // Usamos text/plain para evitar el preflight de CORS y permitir leer la respuesta
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(datos),
    });

    // Obtenemos el texto/JSON devuelto por Apps Script
    const resultado = await response.json();

    if (resultado.success) {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Solicitud Registrada",
        showConfirmButton: false,
        timer: 1500,
      });

      // alert(`Solicitud enviada correctamente para el cliente ${resultado.cliente}. Fila guardada: ${resultado.fila}`);
      document.getElementById("frmCondonacion").reset();
      establecerFechaActual();
    } else {
      // Muestra el mensaje de error si ocurrió una excepción en Apps Script
      alert("Error en el servidor: " + (resultado.error || "Ocurrió un problema desconocido"));
    }
  } catch (error) {
    console.error("Error al realizar el fetch:", error);
    alert("Ocurrió un error al enviar la solicitud.");
  }
}

function establecerFechaActual() {
  const ahora = new Date();

  const anio = ahora.getFullYear();

  const mes = String(ahora.getMonth() + 1).padStart(2, "0");

  const dia = String(ahora.getDate()).padStart(2, "0");

  const hora = String(ahora.getHours()).padStart(2, "0");

  const minutos = String(ahora.getMinutes()).padStart(2, "0");

  const segundos = String(ahora.getSeconds()).padStart(2, "0");

  const fechaCompleta = `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;

  document.getElementById("fechaHora").value = fechaCompleta;
}

function convertirBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = reject;
  });
}

window.onload = establecerFechaActual;
