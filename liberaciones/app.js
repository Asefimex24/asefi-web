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


// url de la web app para envio de información
const URL_WEB_APP_SEND = "https://script.google.com/macros/s/AKfycbxJZBKZp8YRyhmK452-H_drNf7ImQFZ19Fs8O0_PTW5YwcCmLy9CE1PUJf-ppz9LgE/exec";

document.addEventListener("DOMContentLoaded", () => {

  const formulario = document.getElementById("frmLiberacionUnidad");
  if (formulario) {
    formulario.addEventListener("submit", manejarEnvioFormulario);
  }
});


/**
 * Función principal para procesar y enviar los datos del formulario
 */
async function manejarEnvioFormulario(e) {
  e.preventDefault();

  const btnEnvio = document.getElementById("btnEnvio");
  const btnTexto = document.getElementById("btnTexto");
  const btnSpinner = document.getElementById("btnSpinner");

  // Bloquear botón y mostrar spinner de carga
  btnEnvio.disabled = true;
  btnTexto.textContent = "Enviando solicitud...";
  btnSpinner.classList.remove("d-none");

try {
    // Recopilar los 14 campos
    const datos = {
      fechaHora: document.getElementById("fechaHora").value,
      telefonoEjecutivo: document.getElementById("telefonoEjecutivo").value.trim(),
      nombreEjecutivo: document.getElementById("nombreEjecutivo").value.trim(),
      emailEjecutivo: document.getElementById("emailEjecutivo").value.trim(),
      tipoSolicitud: document.getElementById("tipoSolicitud").value,
      credito: document.getElementById("credito").value.trim(),
      producto: document.getElementById("producto").value,
      nombreCliente: document.getElementById("nombreCliente").value.trim(),
      sucursal: document.getElementById("sucursal").value,
      distribuidor: document.getElementById("distribuidor").value,
      xpAzul: document.getElementById("xpAzul").value.trim(),
      nombreFactura: document.getElementById("nombreFactura").value.trim(),
      folioFactura: document.getElementById("folioFactura").value.trim(),
      comentario: document.getElementById("comentario").value.trim()
    };

    // Enviar datos mediante POST
    const respuesta = await fetch(URL_WEB_APP_SEND, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8" // Evita errores de CORS en Apps Script
      },
      body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();

    if (resultado.status === "success") {
      Swal.fire({
        icon: "success",
        title: "¡Solicitud Registrada!",
        confirmButtonColor: "#2563eb"
      });

      document.getElementById("frmLiberacionUnidad").reset();
      establecerFechaActual();
    } else {
      throw new Error(resultado.message || "Ocurrió un error en el servidor.");
    }

  } catch (error) {
    console.error("Error al enviar la solicitud:", error);
    // Notificación de error con SweetAlert2
    Swal.fire({
      icon: "error",
      title: "Error al enviar",
      text: error.message || "No se pudo establecer conexión con el servidor. Intente de nuevo.",
      confirmButtonColor: "#ef4444"
    });
  } finally {
    // Restaurar estado del botón
    btnEnvio.disabled = false;
    btnTexto.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Enviar Solicitud';
    btnSpinner.classList.add("d-none");
  }
}



// url scrip para obtener info de crédito
const URL_API_GET = "https://script.google.com/macros/s/AKfycbzO1FxMPv3hLe91MTUHBloyyBkFad4Ea5QTB9SMK5bvvlM2FkGtdryJXYrF0Cs9jHQvzA/exec";

document.addEventListener("DOMContentLoaded", () => {
  const inputCredito = document.getElementById("credito");

  if (inputCredito) {
    // Variable para evitar consultas duplicadas si se disparan blur y enter al mismo tiempo
    let ejecutandoBusqueda = false;

    const procesarBusquedaCredito = async () => {
      const tipoSolicitud = document.getElementById("tipoSolicitud").value;
      const numCredito = inputCredito.value.trim();

      // Solo ejecutar si es "Solventación", hay texto y no hay una búsqueda en proceso
      if (tipoSolicitud === "Solventación" && numCredito !== "" && !ejecutandoBusqueda) {
        ejecutandoBusqueda = true;

        await consultarCreditoAPI(numCredito);
        
        // Enfocar en el campo de comentario al finalizar
        const campoComentario = document.getElementById("comentario");
        // if (campoComentario)
         campoComentario.focus();
        ejecutandoBusqueda = false;
      }
    };

    // 1. Evento BLUR: Se dispara automáticamente en Android cuando el usuario 
    // toca el siguiente campo o hace tap fuera del teclado.
    inputCredito.addEventListener("blur", () => {
      procesarBusquedaCredito();
    });

    // 2. Evento KEYDOWN: Soporte para escritorio (Tab / Enter) y teclados físicos
    inputCredito.addEventListener("keydown", (e) => {
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault(); // Evita salto no deseado antes de consultar
        inputCredito.blur(); // Dispara el blur y oculta el teclado en móviles
      }
    });
  }
});

/**
 * Consulta la API GET en Apps Script y asigna los valores devueltos
 */
async function consultarCreditoAPI(credito) {
  Swal.fire({
    title: "Consultando crédito...",
    text: "Consultando información ...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const url = `${URL_API_GET}?credito=${encodeURIComponent(credito)}`;
    const respuesta = await fetch(url);
    const resultado = await respuesta.json();

    if (resultado.status === "success" && resultado.data) {
      const d = resultado.data;

      // Autocompletar mapeando los nombres devueltos por la hoja
      if (d.PRODUCTO) document.getElementById("producto").value = d.PRODUCTO;
      if (d.CLIENTE) document.getElementById("nombreCliente").value = d.CLIENTE;
      if (d.SUCURSAL) document.getElementById("sucursal").value = d.SUCURSAL;
      if (d.DISTRIBUIDOR) document.getElementById("distribuidor").value = d.DISTRIBUIDOR;
      if (d.XP_AZUL) document.getElementById("xpAzul").value = d.XP_AZUL;
      if (d.NOMBRE_FACTURA) document.getElementById("nombreFactura").value = d.NOMBRE_FACTURA;
      if (d.FOLIO_FACTURA) document.getElementById("folioFactura").value = d.FOLIO_FACTURA;
     
      Swal.fire({
        icon: "success",
        title: "¡Crédito localizado!",
        text: "Los datos se han autocompletado correctamente.",
        timer: 1800,
        showConfirmButton: false
      });


    } else {
      throw new Error(resultado.message || "No se encontró información para el crédito ingresado.");
    }

  } catch (error) {
    console.error("Error al consultar el crédito:", error);

    // Limpiar campos en caso de no encontrar datos
    ["producto", "nombreCliente", "sucursal", "distribuidor", "xpAzul", "nombreFactura", "folioFactura"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    Swal.fire({
      icon: "warning",
      title: "Sin resultados",
      text: error.message || "No se pudo recuperar la información del crédito.",
      confirmButtonColor: "#2563eb"
    });
  }
}