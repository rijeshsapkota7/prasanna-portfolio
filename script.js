const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');

  let particles = [];
  const numParticles = 70;
  const maxParticleSize = 4;
  const minParticleSize = 1;
  const maxSpeed = 0.5;
  const connectionDistance = 150;
  const mouseRadius = 55;
  let mouse = { x: null, y: null, active: false };

  function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor(x, y, size, directionX, directionY, color) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.directionX = directionX;
      this.directionY = directionY;
      this.color = color;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    update() {
      if (this.x + this.size > canvas.width || this.x - this.size < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y + this.size > canvas.height || this.y - this.size < 0) {
        this.directionY = -this.directionY;
      }

      this.x += this.directionX;
      this.y += this.directionY;

      if (mouse.active && mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseRadius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouseRadius - distance) / mouseRadius;
          const pushStrength = 25;

          this.x -= forceDirectionX * force * pushStrength;
          this.y -= forceDirectionY * force * pushStrength;
        }
      }

      this.draw();
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
      const size = Math.random() * (maxParticleSize - minParticleSize) + minParticleSize;
      const x = Math.random() * (canvas.width - size * 2) + size;
      const y = Math.random() * (canvas.height - size * 2) + size;
      const directionX = (Math.random() * maxSpeed * 2) - maxSpeed;
      const directionY = (Math.random() * maxSpeed * 2) - maxSpeed;
      const color = 'rgba(255, 255, 255, 0.8)';
      particles.push(new Particle(x, y, size, directionX, directionY, color));
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
    }

    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const distA = Math.hypot(particles[a].x - mouse.x, particles[a].y - mouse.y);
        const distB = Math.hypot(particles[b].x - mouse.x, particles[b].y - mouse.y);

        if (mouse.active && (distA < mouseRadius || distB < mouseRadius)) {
          continue; // Skip drawing line near the mouse
        }

        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - (distance / connectionDistance)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  window.addEventListener('resize', () => {
    setCanvasSize();
    init();
  });

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    mouse.active = true;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = null;
    mouse.y = null;
  });

  window.onload = function () {
    setCanvasSize();
    init();
    animate();
  };