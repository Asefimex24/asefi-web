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

document.getElementById("frmLiquidaciones").addEventListener("submit", async function (e) {
  e.preventDefault();

  await enviarFormulario();
});

async function enviarFormulario() {
  //obtener elemtno spinner
  const btn = document.getElementById("btnEnvio");
  const textoBoton = document.getElementById("btnTexto");
  const spinner = document.getElementById("btnSpinner");

  //obtener los archivos para convertirlo a b64
  const ficha = document.getElementById("fichaDeposito").files[0];
  const captura = document.getElementById("capturaSafi").files[0];
  const dor = document.getElementById("adjuntaDor").files[0];

  let fichaBase64 = "";
  let fichaoNombre = "";
  let fichavoMime = "";

  if (ficha) {
    fichaBase64 = await convertirBase64(ficha);
    fichaNombre = ficha.name;
    fichaMime = ficha.type;
  }

  let capturaBase64 = "";
  let capturaNombre = "";
  let capturaeMime = "";

  if (captura) {
    capturaBase64 = await convertirBase64(captura);
    capturaNombre = captura.name;
    capturaMime = captura.type;
  }

  let dorBase64 = "";
  let dorNombre = "";
  let dorMime = "";

  if (dor) {
    dorBase64 = await convertirBase64(dor);
    dorNombre = dor.name;
    dorMime = dor.type;
  }

  //generar array datos
  const datos = {
    fechaHora: document.getElementById("fechaHora").value,
    tipoDeposito: document.getElementById("tipoDeposito").value,
    telEjecutivo: document.getElementById("telEjecutivo").value,
    correoEjecutivo: document.getElementById("correoEjecutivo").value,
    nombreEjecutivo: document.getElementById("nombreEjecutivo").value,
    nombreCliente: document.getElementById("nombreCliente").value,
    fechaDeposito: document.getElementById("fechaDeposito").value,
    referenciaPago: document.getElementById("referenciaPago").value,
    credito: document.getElementById("credito").value,
    importe: document.getElementById("importe").value,
    producto: document.getElementById("producto").value,
    oficinaDeposito: document.getElementById("oficinaPago").value,
    folioDeposito: document.getElementById("folioPago").value,
    chDeposito: document.getElementById("chPago").value,
    vistoBueno: document.getElementById("vistoBueno").value,
    comentario: document.getElementById("comentario").value,
    fichaNombre: fichaNombre,
    fichaMime: fichaMime,
    fichaBase64: fichaBase64,
    capturaBase64: capturaBase64,
    capturaNombre: capturaNombre,
    capturaMime: capturaMime,
    dorBase64: dorBase64,
    dorNombre: dorNombre,
    dorMime: dorMime,
  };

  const API_URL = "https://script.google.com/macros/s/AKfycbwxgaREjMSGsNz5rRy3tRNwfsxJTRfHgrIFJDhfOrtpvq2vEOpKWdbrsCOCtbTaEmJF/exec";

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

      document.getElementById("frmLiquidaciones").reset();
      establecerFechaActual();
      mostrarCamposPago();
    } else {
      // Muestra el mensaje de error si ocurrió una excepción en Apps Script
      // alert("Error en el servidor: " + (resultado.error || "Ocurrió un problema desconocido"));
      Swal.fire({
        position: "top-center",
        icon: "error",
        title: "Error en el servidor: " + (resultado.error || "Ocurrió un problema desconocido"),
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Error al realizar el fetch:", error);
    // alert("Ocurrió un error al enviar la solicitud.");
    Swal.fire({
      position: "top-center",
      icon: "error",
      title: "Ocurrió un error al enviar la solicitud.",
      showConfirmButton: false,
      timer: 1500,
    });
  } finally {
    // Reactivar botón
    btn.disabled = false;
    textoBoton.textContent = "Registrar Pago";
    spinner.classList.add("d-none");
  }
}

function convertirBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

document.getElementById("tipoDeposito").addEventListener("change", mostrarCamposPago);

function mostrarCamposPago() {
  const tipoPago = document.getElementById("tipoDeposito").value;

  const divOficinaPago = document.getElementById("divOficinaPago");
  const txtoficinaPago = document.getElementById("oficinaPago");

  const divFolioPago = document.getElementById("divFolioPago");
  const txtFolioPago = document.getElementById("folioPago");

  const divChPago = document.getElementById("divChPago");
  const txtchPago = document.getElementById("chPago");

  // Ocultar todos los grupos
  divOficinaPago.style.display = "none";
  divFolioPago.style.display = "none";
  divChPago.style.display = "none";

  // Quitar required
  txtoficinaPago.removeAttribute("required");
  txtFolioPago.removeAttribute("required");
  txtchPago.removeAttribute("required");

  // Limpiar valores opcionalmente
  txtoficinaPago.value = "";
  txtFolioPago.value = "";
  txtchPago.value = "";

  // BANSEFI
  if (tipoPago === "BANSEFI") {
    divOficinaPago.style.display = "block";
    divFolioPago.style.display = "block";
    divChPago.style.display = "block";
    txtoficinaPago.setAttribute("required", "required");
    txtFolioPago.setAttribute("required", "required");
    txtchPago.setAttribute("required", "required");
  }
}
