/**
 * Lógica Principal - Invitación Fiorella Díaz
 * Cuenta regresiva, fondo de partículas y controladores del modal de video.
 */

document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initCountdown();
});

/* ==========================================================================
   PARTÍCULAS LUMINOSAS (HTML5 CANVAS)
   ========================================================================== */
function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  let particlesArray = [];
  
  // Ajustar tamaño del canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Clase Partícula
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height + canvas.height; // Comienzan abajo
      this.size = Math.random() * 2.5 + 0.5; // Pequeñas y sutiles
      this.speedY = Math.random() * 0.4 + 0.1; // Lentas
      this.speedX = (Math.random() - 0.5) * 0.15; // Leve movimiento horizontal
      
      // Colores alternando entre azul claro, plata y blanco translúcido
      const colors = [
        "rgba(147, 197, 253, ", // Azul claro
        "rgba(203, 213, 225, ", // Plata
        "rgba(255, 255, 255, ", // Blanco
        "rgba(59, 130, 246, "   // Azul rey
      ];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = Math.random() * 0.5 + 0.15;
      this.fadeSpeed = Math.random() * 0.005 + 0.002;
      this.maxOpacity = this.opacity;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      
      // Efecto de desvanecimiento en los bordes superiores
      if (this.y < canvas.height * 0.8) {
        this.opacity -= this.fadeSpeed;
      }
      
      // Si sale de la pantalla o se desvanece por completo, se reinicia abajo
      if (this.y < 0 || this.opacity <= 0 || this.x < 0 || this.x > canvas.width) {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 50;
        this.opacity = Math.random() * 0.5 + 0.15;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedY = Math.random() * 0.4 + 0.1;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.colorBase + this.opacity + ")";
      ctx.shadowBlur = this.size * 2;
      ctx.shadowColor = "rgba(147, 197, 253, 0.3)";
      ctx.fill();
    }
  }

  // Inicializar arreglo
  const numberOfParticles = Math.min(60, Math.floor((canvas.width * canvas.height) / 15000));
  for (let i = 0; i < numberOfParticles; i++) {
    particlesArray.push(new Particle());
    // Distribuirlos verticalmente al inicio
    particlesArray[i].y = Math.random() * canvas.height;
  }

  // Ciclo de animación
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar y actualizar partículas
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

/* ==========================================================================
   CUENTA REGRESIVA
   ========================================================================== */
function initCountdown() {
  const targetDate = new Date(CONFIG.EVENT_DATE).getTime();
  
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const countdownContainer = document.getElementById("countdown");
  
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateTimer() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      // Si la fecha ya pasó
      daysEl.innerText = "00";
      hoursEl.innerText = "00";
      minutesEl.innerText = "00";
      secondsEl.innerText = "00";
      
      const label = document.querySelector(".countdown-label");
      if (label) label.innerText = "¡EL DÍA HA LLEGADO!";
      
      clearInterval(timerInterval);
      return;
    }

    // Cálculos de tiempo
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Renderizar con ceros a la izquierda
    daysEl.innerText = days < 10 ? "0" + days : days;
    hoursEl.innerText = hours < 10 ? "0" + hours : hours;
    minutesEl.innerText = minutes < 10 ? "0" + minutes : minutes;
    secondsEl.innerText = seconds < 10 ? "0" + seconds : seconds;
  }

  // Ejecutar inmediatamente y luego cada segundo
  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);
}
