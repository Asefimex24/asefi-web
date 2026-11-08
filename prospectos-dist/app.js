window.onload = establecerFechaActual;
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


document.getElementById("prospectoFormDist").addEventListener("submit", async function (e) {
  e.preventDefault();

  await enviarFormulario();
});


async function enviarFormulario() {
  //obtener elemtno spinner
   const form = document.getElementById("prospectoFormDist");
  const btn = form.querySelector('button[type="submit"]');
  const spanBoton = btn.querySelector("span");
  const textoOriginal = spanBoton ? spanBoton.textContent : "Registrar Prospecto";

  // Procesar archivo INE Frente (si fue cargado)
  const inputIne = document.getElementById("ineFrente");
  let archivoInePayload = null;

  if (inputIne && inputIne.files.length > 0) {
    const archivo = inputIne.files[0];
    const base64 = await convertirBase64(archivo);

    archivoInePayload = {
      base64: base64,
      nombre: archivo.name,
      mimeType: archivo.type || "application/octet-stream"
    };
  }
  //generar array datos
  const datos = {
    fechaHora: document.getElementById("fechaHora").value,
    nombreProspecto: document.getElementById("nombreProspecto").value.trim(),
    telefonoVendedor: document.getElementById("telefonoVendedor").value.trim(),    
    correoVendedor: document.getElementById("correoVendedor").value.trim(),    
    sucursal: document.getElementById("sucursal").value,
    distribuidor: document.getElementById("distribuidor").value,
    especificaciones: document.getElementById("especificaciones").value.trim(),
    archivoIne: archivoInePayload
  };

  const API_URL = "https://script.google.com/macros/s/AKfycbzvjHm2UiJ5puPwtGRU_ykPduKq8jYOYMiOmaMSxVHy8ZWxLpB2eYNa_FB7i26W2Uxb/exec";

  try {
    // Desactivar botón y mostrar animación
    btn.disabled=true;
    spanBoton.textContent = "Procesando...";
    // spinner.classList.remove("d-none");

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

    if (resultado.status=="success") {
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: `Registro Enviado`,
        html:`Fecha: ${datos.fechaHora} <br>Nombre: ${datos.nombreProspecto} <br>Sucursal: ${datos.sucursal} <br>Distribuidor: ${datos.distribuidor} <br>CorreoVendedor: ${datos.correoVendedor}`,        
        showConfirmButton: true,
        // timer: 1500,
      });

      // alert(`Solicitud enviada correctamente para el cliente ${resultado.cliente}. Fila guardada: ${resultado.fila}`);
      document.getElementById("prospectoFormDist").reset();
      establecerFechaActual();

    } else {
      // Muestra el mensaje de error si ocurrió una excepción en Apps Script
      alert("Error en el servidor: " + (resultado.error || "Ocurrió un problema desconocido"));
    }
  } 
  catch (error) {
    console.error("Error al realizar el fetch:", error);
    alert("Ocurrió un error al enviar la solicitud.");
  } 
  finally {
    // Reactivar botón
    btn.disabled = false;
    spanBoton.textContent = textoOriginal;
    // spinner.classList.add("d-none");
  }
}