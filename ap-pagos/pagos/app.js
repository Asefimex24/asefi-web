document.getElementById("frmPagos").addEventListener("submit", async function (e) {
  e.preventDefault();

  await enviarFormulario();
});

async function enviarFormulario() {
  //obtener elemtno spinner
  const btn = document.getElementById("btnEnvio");
  const textoBoton = document.getElementById("btnTexto");
  const spinner = document.getElementById("btnSpinner");

  //obtener el archivo de ficha de comprobante para cobnvertirloa base64
  const archivo = document.getElementById("comprobante").files[0];
  let archivoBase64 = "";
  let archivoNombre = "";
  let archivoMime = "";

  if (archivo) {
    archivoBase64 = await convertirBase64(archivo);
    archivoNombre = archivo.name;
    archivoMime = archivo.type;
  }

  const ineAclara = document.getElementById("ineAclaracion").files[0];
  let ineBase64 = "";
  let ineNombre = "";
  let ineMime = "";

  if (ineAclara) {
    ineBase64 = await convertirBase64(ineAclara);
    ineNombre = ineAclara.name;
    ineMime = ineAclara.type;
  }

  //generar array datos
  const datos = {
    fechaHora: document.getElementById("fechaHora").value,
    tipoPago: document.getElementById("tipoPago").value,
    telEjecutivo: document.getElementById("telEjecutivo").value,
    nombreCliente: document.getElementById("nombreCliente").value,
    fechaPago: document.getElementById("fechaPago").value,
    referenciaPago: document.getElementById("referenciaPago").value,
    credito: document.getElementById("credito").value,
    importe: document.getElementById("importe").value,
    oficinaPago: document.getElementById("oficinaPago").value,
    folioPago: document.getElementById("folioPago").value,
    chPago: document.getElementById("chPago").value,
    correoEjecutivo: document.getElementById("correoEjecutivo").value,
    nombreEjecutivo: document.getElementById("nombreEjecutivo").value,
    comentario: document.getElementById("comentario").value,
    archivoNombre: archivoNombre,
    archivoMime: archivoMime,
    archivoBase64: archivoBase64,
    ineBase64: ineBase64,
    ineNombre: ineNombre,
    ineMime: ineMime,
  };

  const API_URL = "https://script.google.com/macros/s/AKfycbxdV8ZqaA7zG16f6EHM2XDxoPKhmQP7oShOIuug-qyrKJ73frgCd9eM8mkwTBgYa_Xd/exec";

  try {
    // Desactivar botón y mostrar animación
    btn.disabled = true;
    textoBoton.textContent = "Procesando...";
    spinner.classList.remove("d-none");

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
        position: "top-center",
        icon: "success",
        title: "Solicitud Registrada",
        showConfirmButton: false,
        timer: 1500,
      });

      // alert(`Solicitud enviada correctamente para el cliente ${resultado.cliente}. Fila guardada: ${resultado.fila}`);
      document.getElementById("frmPagos").reset();
      establecerFechaActual();
    } else {
      // Muestra el mensaje de error si ocurrió una excepción en Apps Script
      alert("Error en el servidor: " + (resultado.error || "Ocurrió un problema desconocido"));
    }
  } catch (error) {
    console.error("Error al realizar el fetch:", error);
    alert("Ocurrió un error al enviar la solicitud.");
  } finally {
    // Reactivar botón
    btn.disabled = false;
    textoBoton.textContent = "Registrar Pago";
    spinner.classList.add("d-none");
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

window.onload = establecerFechaActual;

function convertirBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

document.getElementById("tipoPago").addEventListener("change", mostrarCamposPago);

function mostrarCamposPago() {
  const tipoPago = document.getElementById("tipoPago").value;

  const divReferencia = document.getElementById("divReferenciaPago");
  const txtReferencia = document.getElementById("referenciaPago");

  const divOficinaPago = document.getElementById("divOficinaPago");
  const txtoficinaPago = document.getElementById("oficinaPago");

  const divFolioPago = document.getElementById("divFolioPago");
  const txtFolioPago = document.getElementById("folioPago");

  const divChPago = document.getElementById("divChPago");
  const txtchPago = document.getElementById("chPago");

  const divAclaracion = document.getElementById("divAclaracion");
  const fileAclaracion = document.getElementById("ineAclaracion");

  // Ocultar todos los grupos
  divReferencia.style.display = "none";
  divOficinaPago.style.display = "none";
  divFolioPago.style.display = "none";
  divChPago.style.display = "none";
  divAclaracion.style.display = "none";

  // Quitar required
  txtReferencia.removeAttribute("required");
  txtoficinaPago.removeAttribute("required");
  txtFolioPago.removeAttribute("required");
  txtchPago.removeAttribute("required");

  // Limpiar valores opcionalmente
  txtReferencia.value = "";
  txtoficinaPago.value = "";
  txtFolioPago.value = "";
  txtchPago.value = "";
  fileAclaracion.value = "";

  // OXXO y TELECOMM
  if (tipoPago === "OXXO" || tipoPago === "TELECOMM") {
    divReferencia.style.display = "block";
    txtReferencia.setAttribute("required", "required");
  }
  // BANSEFI
  if (tipoPago === "BANSEFI") {
    divOficinaPago.style.display = "block";
    divFolioPago.style.display = "block";
    divChPago.style.display = "block";
    txtoficinaPago.setAttribute("required", "required");
    txtFolioPago.setAttribute("required", "required");
    txtchPago.setAttribute("required", "required");
  }
  if (tipoPago === "PAGO-TERCEROS") {
    divAclaracion.style.display = "block";
    fileAclaracion.setAttribute("required", "required");
  }
}
