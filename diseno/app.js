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



// 1. Reemplaza esta constante con la URL de despliegue que copiaste de Google Apps Script (debe terminar en /exec)
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbz0TPjzsSLlQuh7yQScxQ3sZcL1Cwzt6mP9it8xLruT5LHSCd_cZN6HwQHHcOUqncUpgw/exec";

document.addEventListener("DOMContentLoaded", () => {

  const formulario = document.getElementById("frmSolicitudDiseno");
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

    // 2. Construir objeto de datos con los valores del formulario
    const datosFormulario = {

      fechaHora: document.getElementById("fechaHora").value,
      nombreColaborador: document.getElementById("nombreColaborador").value.trim(),
      sucursal: document.getElementById("sucursal").value,
      telefonoColaborador: document.getElementById("telefonoColaborador").value.trim(),
      correoColaborador: document.getElementById("emailColaborador").value.trim(),
      tipoSolicitud: document.getElementById("tipoSolicitud").value,
      descripcion: document.getElementById("descripcion").value.trim(),
    };

    // 3. Enviar los datos a la Web App de Google Apps Script mediante POST
    const respuesta = await fetch(URL_WEB_APP, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8" // Usar text/plain evita bloqueos por CORS en Google Apps Script
      },
      body: JSON.stringify(datosFormulario)
    });

    const resultado = await respuesta.json();

    if (resultado.status === "success") {
      // Notificación de éxito con SweetAlert2
      Swal.fire({
        icon: "success",
        title: "¡Solicitud Registrada!",
        showConfirmButton: false,
        timer: 1500,
      });

      // Limpiar formulario y restablecer la fecha actual
      document.getElementById("frmSolicitudDiseno").reset();
      document.getElementById("fechaHora").value = new Date().toISOString().split("T")[0];

    } else {
      throw new Error(resultado.message || "Ocurrió un error inesperado en el servidor.");
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