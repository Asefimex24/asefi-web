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

// Reemplaza esta constante con la URL de tu API de Apps Script
const URL_API_CONSULTA_CREDITO = "TU_URL_DE_APPS_SCRIPT_GET_AQUI";

document.addEventListener("DOMContentLoaded", () => {
  const inputCredito = document.getElementById("credito");
  
  if (inputCredito) {
    inputCredito.addEventListener("keydown", async function (e) {
      // Validar si se presionó la tecla TAB (key === "Tab" o keyCode 9) o Enter (key === "Enter")
      if (e.key === "Tab" || e.key === "Enter") {
        const tipoSolicitud = document.getElementById("tipoSolicitud").value;
        const numCredito = this.value.trim();

        // Solo ejecutar si es una Solventación y si hay un número de crédito escrito
        if (tipoSolicitud === "Solventación" && numCredito !== "") {
          // Previene el cambio de foco inmediato para dar tiempo a realizar la consulta
          e.preventDefault(); 
          
          await consultarCreditoAPI(numCredito);
          
          // Mover manualmente el foco al siguiente campo disponible (Comentario o Nombre Factura)
          document.getElementById("comentario").focus();
        }
      }
    });
  }
});

/**
 * Realiza la consulta GET a la API de Apps Script para obtener los datos del crédito
 * @param {string} credito 
 */
async function consultarCreditoAPI(credito) {
  // Mostrar feedback visual de carga con SweetAlert2
  Swal.fire({
    title: "Consultando crédito...",
    text: "Por favor espere mientras recuperamos la información.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    // Petición GET enviando el número de crédito como parámetro URL
    const url = `${URL_API_CONSULTA_CREDITO}?action=buscarCredito&credito=${encodeURIComponent(credito)}`;
    const respuesta = await fetch(url);
    const resultado = await respuesta.json();

    if (resultado.status === "success" && resultado.data) {
      const data = resultado.data;

      // Autocompletar los campos con los datos devueltos por la API
      document.getElementById("producto").value = data.producto || "";
      document.getElementById("nombreCliente").value = data.nombreCliente || "";
      document.getElementById("sucursal").value = data.sucursal || "";
      document.getElementById("distribuidor").value = data.distribuidor || "";
      document.getElementById("xpAzul").value = data.xpAzul || "";
      document.getElementById("nombreFactura").value = data.nombreFactura || "";
      document.getElementById("folioFactura").value = data.folioFactura || "";

      Swal.fire({
        icon: "success",
        title: "¡Crédito localizado!",
        text: "Los datos del crédito se han cargado automáticamente.",
        timer: 1800,
        showConfirmButton: false
      });
    } else {
      throw new Error(resultado.message || "No se encontraron registros para este número de crédito.");
    }
  } catch (error) {
    console.error("Error al consultar el crédito:", error);
    
    // Limpiar los campos si hubo un fallo en la búsqueda
    const camposLimpiar = ["producto", "nombreCliente", "sucursal", "distribuidor", "xpAzul", "nombreFactura", "folioFactura"];
    camposLimpiar.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) elem.value = "";
    });

    Swal.fire({
      icon: "warning",
      title: "Sin resultados",
      text: error.message || "No se pudo consultar la información del crédito.",
      confirmButtonColor: "#2563eb"
    });
  }
}
