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



const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxukEjE4f56MzLhzABPGOlhIffkZhRe8Zj8FkVZT5e2DjIkV1mBwcSKc9NIpgy-c33I/exec";


