document.getElementById("frmGuardavalores").addEventListener("submit", async (e) => {
  e.preventDefault();
  await enviarFormulario();
});

async function enviarFormulario() {
  const btn = document.getElementById("btnSolicitar");
  const textoBoton = document.getElementById("btnTexto");
  const spinner = document.getElementById("btnSpinner");

  const datos = {
    fechaHora: document.getElementById("fechaHora").value,
    telefonoEjecutivo: document.getElementById("telEjecutivo").value,
    nombreEjecutivo: document.getElementById("nombreEjecutivo").value,
    correoEjecutivo: document.getElementById("correoEjecutivo").value,
    sucursal: document.getElementById("sucursal").value,
    nombreCliente: document.getElementById("nombreCliente").value,
    credito: document.getElementById("credito").value,
    tipoDocumento: document.getElementById("tipoDocumento").value,
    motivo: document.getElementById("motivo").value,
  };

  console.log("Datos a enviar:", datos);

  const API_URL = "https://script.google.com/macros/s/AKfycbw-1S_Tit2y1uvzBT40MIgrt5Ych4KsT42bfsW5gGoEhX3QFtJY7vt-3VdH_laOKo-g-w/exec";

  try {
    btn.disabled = true;
    textoBoton.textContent = "Procesando...";
    spinner.classList.remove("d-none");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(datos),
    });

    const resultado = await response.json();

    if (response.ok && resultado.success) {
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Solicitud Registrada",
        showConfirmButton: false,
        timer: 1500,
      });

      document.getElementById("frmGuardavalores").reset();
      establecerFechaActual();
    } else {
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar la solicitud",
        text: resultado.error || "Ocurrió un problema en el servidor.",
      });
    }
  } catch (error) {
    console.error("Error al realizar el fetch:", error);
    Swal.fire({
      icon: "error",
      title: "Error al enviar",
      text: "No fue posible enviar la solicitud. Verifica tu conexión e inténtalo de nuevo.",
    });
  } finally {
    btn.disabled = false;
    textoBoton.textContent = "Solicitar";
    spinner.classList.add("d-none");
  }
}

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
