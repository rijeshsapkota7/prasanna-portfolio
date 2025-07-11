const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
const maxParticleSize = 4;
const minParticleSize = 1;
const maxSpeed = 0.5;
const connectionDistance = 150; // Max distance for particles to connect
const mouseRadius = 55; // Radius around mouse for interaction (particles inside this radius will react)
let mouse = { x: null, y: null, active: false }; // Tracks mouse position and activity

// Set canvas dimensions to fill the window
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Particle class definition
class Particle {
    constructor(x, y, size, directionX, directionY, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.directionX = directionX;
        this.directionY = directionY;
        this.color = color;
    }

    // Draw the particle on the canvas
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    // Update particle position and handle interactions/boundaries
    update() {
        // Reverse direction if particle hits canvas edges (bounce effect)
        if (this.x + this.size > canvas.width || this.x - this.size < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y + this.size > canvas.height || this.y - this.size < 0) {
            this.directionY = -this.directionY;
        }

        // Move the particle
        this.x += this.directionX;
        this.y += this.directionY;

        // Mouse interaction (REPEL FROM MOUSE - "break and spread")
        if (mouse.active && mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.x; // Distance in X from mouse to particle
            let dy = mouse.y - this.y; // Distance in Y from mouse to particle
            let distance = Math.sqrt(dx * dx + dy * dy); // Total distance

            // If particle is within the mouse interaction radius
            if (distance < mouseRadius) {
                let forceDirectionX = dx / distance; // Normalized force direction X
                let forceDirectionY = dy / distance; // Normalized force Direction Y

                // Calculate force strength (stronger when closer to mouse)
                let force = (mouseRadius - distance) / mouseRadius;

                // Adjust push strength multiplier (increased for more noticeable repulsion)
                let pushStrength = 25; // This value controls how strongly particles are pushed
                let pushX = forceDirectionX * force * pushStrength;
                let pushY = forceDirectionY * force * pushStrength;

                // Apply the push force to the particle's position
                this.x -= pushX; // Subtract to move away from the mouse
                this.y -= pushY; // Subtract to move away from the mouse
            }
        }

        // Redraw the particle in its new position
        this.draw();
    }
}

// Initialize particles array
function init() {
    particles = []; // Clear existing particles
    let currentNumParticles;

    // Dynamically adjust number of particles based on screen width
    if (window.innerWidth > 900) {
        currentNumParticles = 70; // More particles for larger screens
    } else if (window.innerWidth <= 900 && window.innerWidth > 600) {
        currentNumParticles = 50; // Medium particles for tablets
    } else {
        currentNumParticles = 30; // Fewer particles for mobile
    }

    for (let i = 0; i < currentNumParticles; i++) {
        // Random size within defined range
        let size = Math.random() * (maxParticleSize - minParticleSize) + minParticleSize;
        // Random position, ensuring particles start fully within canvas
        let x = Math.random() * (canvas.width - size * 2) + size;
        let y = Math.random() * (canvas.height - size * 2) + size;
        // Random direction and speed
        let directionX = (Math.random() * maxSpeed * 2) - maxSpeed; // From -maxSpeed to +maxSpeed
        let directionY = (Math.random() * maxSpeed * 2) - maxSpeed;
        // Particle color (white with some transparency)
        let color = 'rgba(255, 255, 255, 0.8)';

        particles.push(new Particle(x, y, size, directionX, directionY, color));
    }
}

// Main animation loop
function animate() {
    requestAnimationFrame(animate); // Request next animation frame
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

    // Update and draw each particle
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }

    // Connect particles with lines if they are close enough
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) { // Start from 'a' to avoid duplicate checks and self-connection
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Check if either particle is near the mouse, if so, skip drawing the line
            const distA = Math.hypot(particles[a].x - mouse.x, particles[a].y - mouse.y);
            const distB = Math.hypot(particles[b].x - mouse.x, particles[b].y - mouse.y);

            if (mouse.active && (distA < mouseRadius || distB < mouseRadius)) {
                continue; // Skip drawing line near the mouse
            }

            if (distance < connectionDistance) {
                ctx.beginPath();
                // Line opacity decreases as distance increases
                ctx.strokeStyle = `rgba(255, 255, 255, ${1 - (distance / connectionDistance)})`;
                ctx.lineWidth = 1; // Line thickness
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

// Event Listeners for responsiveness and interactivity

// Resize canvas and re-initialize particles when window is resized
window.addEventListener('resize', () => {
    setCanvasSize();
    init(); // Re-initialize particles to adapt to new dimensions
});

// Update mouse coordinates when mouse moves over the canvas
canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
    mouse.active = true; // Indicate mouse is over the canvas
});

// Reset mouse activity when mouse leaves the canvas
canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = null; // Clear mouse position
    mouse.y = null;
});

// Scroll to Top Button Logic
const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) { // Show button after scrolling 300px
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scroll to top
    });
});

// Hamburger menu logic
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
    hamburger.classList.toggle('active'); // Toggle hamburger animation
});

// Close nav menu when a link is clicked (for mobile usability)
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('nav-active')) {
            navLinks.classList.remove('nav-active');
            hamburger.classList.remove('active');
        }
    });
});

// Typing effect for the name
const typingNameElement = document.getElementById('typing-name');
const nameToType = "Prasanna Raj Neupane"; // The full name to be typed
let charIndex = 0;
const typingSpeed = 100; // milliseconds per character

function typeWriter() {
    // Reset charIndex and textContent to restart typing
    charIndex = 0;
    typingNameElement.textContent = "";
    
    function type() {
        if (charIndex < nameToType.length) {
            typingNameElement.textContent += nameToType.charAt(charIndex);
            charIndex++;
            setTimeout(type, typingSpeed);
        }
    }
    type(); // Start the typing
}

// Intersection Observer for fade-up animation
const fadeUpElements = document.querySelectorAll('.fade-up');

const observerOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.1 // 10% of the element must be visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Stop observing once visible
        }
    });
}, observerOptions);

// Observe each fade-up element
fadeUpElements.forEach(element => {
    observer.observe(element);
});


// Initial setup:
// Ensure animation starts after the window has loaded
window.onload = function () {
    setCanvasSize(); // Set canvas size on page load
    init();          // Create initial particles
    animate();       // Start the animation loop

    // Run typing animation every time the page loads
    typeWriter();
};
