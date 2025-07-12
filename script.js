const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
const maxParticleSize = 6; // Increased dot size
const minParticleSize = 2; // Increased dot size
const maxSpeed = 0.4; // Increased speed for faster movement and interaction
// connectionDistance will now be dynamically set based on screen size
const mouseRadius = 200; // Increased radius for more noticeable mouse interaction
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

                // Adjusted push strength multiplier to make repulsion more noticeable
                let pushStrength = 15; // Kept at 15 for stronger repulsion
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
    let currentConnectionDistance;
    let gridSpacing;

    // Dynamically adjust number of particles and grid spacing based on screen width
    if (window.innerWidth > 900) {
        currentNumParticles = 60; // Keep particles for larger screens
        currentConnectionDistance = 220; // Adjusted connection distance
        gridSpacing = 150; // Spacing for larger screens
    } else if (window.innerWidth <= 900 && window.innerWidth > 600) {
        currentNumParticles = 45; // Keep particles for tablets
        currentConnectionDistance = 180; // Adjusted connection distance
        gridSpacing = 120; // Spacing for tablets
    } else {
        currentNumParticles = 30; // Keep particles for mobile
        currentConnectionDistance = 150; // Default connection distance
        gridSpacing = 100; // Spacing for mobile
    }

    // Initialize particles in a grid-like pattern with a slight random offset
    for (let y = 0; y < canvas.height; y += gridSpacing) {
        for (let x = 0; x < canvas.width; x += gridSpacing) {
            if (particles.length >= currentNumParticles) break; // Stop if max particles reached

            let size = Math.random() * (maxParticleSize - minParticleSize) + minParticleSize;
            // Add a small random offset to grid positions for a more natural look
            let randomOffsetX = (Math.random() - 0.5) * (gridSpacing * 0.5);
            let randomOffsetY = (Math.random() - 0.5) * (gridSpacing * 0.5);

            let newX = x + randomOffsetX;
            let newY = y + randomOffsetY;

            // Ensure particles are within canvas boundaries after offset
            newX = Math.max(size, Math.min(newX, canvas.width - size));
            newY = Math.max(size, Math.min(newY, canvas.height - size));

            let directionX = (Math.random() * maxSpeed * 2) - maxSpeed;
            let directionY = (Math.random() * maxSpeed * 2) - maxSpeed;
            let color = 'rgba(255, 255, 255, 0.8)';

            particles.push(new Particle(newX, newY, size, directionX, directionY, color));
        }
        if (particles.length >= currentNumParticles) break;
    }

    // If for some reason we didn't reach currentNumParticles, add more randomly
    while (particles.length < currentNumParticles) {
        let size = Math.random() * (maxParticleSize - minParticleSize) + minParticleSize;
        let x = Math.random() * (canvas.width - size * 2) + size;
        let y = Math.random() * (canvas.height - size * 2) + size;
        let directionX = (Math.random() * maxSpeed * 2) - maxSpeed;
        let directionY = (Math.random() * maxSpeed * 2) - maxSpeed;
        let color = 'rgba(255, 255, 255, 0.8)';
        particles.push(new Particle(x, y, size, directionX, directionY, color));
    }

    // Store the dynamically set connectionDistance for use in animate()
    canvas.connectionDistance = currentConnectionDistance;
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

            // Use the dynamically set connectionDistance
            if (distance < canvas.connectionDistance) {
                ctx.beginPath();
                // Line opacity decreases as distance increases
                ctx.strokeStyle = `rgba(255, 255, 255, ${1 - (distance / canvas.connectionDistance)})`;
                ctx.lineWidth = 1; // Line thickness
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

// Function to simulate typing text
function typeText(element, text, speed) {
    let i = 0;
    element.textContent = ''; // Clear existing text
    element.style.borderRight = '3px solid white'; // Add typing cursor

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            element.style.borderRight = 'none'; // Remove cursor after typing
        }
    }
    type();
}


// Preloader and main content elements
const preloader = document.getElementById('preloader');
const preloaderNameColorizeElement = document.getElementById('preloader-name-colorize');
const mainContent = document.querySelector('.content-overlay');

// Function to handle the preloader animation sequence
function handlePreloaderAnimation() {
    // Step 1: Start the colorization animation for "Prasanna"
    preloaderNameColorizeElement.classList.add('colorized');

    // Step 2: After colorization, trigger the preloader slide-up and fade-out
    // The duration of the colorization animation is 2s (from style.css)
    setTimeout(() => {
        preloader.classList.add('slide-up');

        // Step 3: After preloader slides up and fades out, show the main content
        // The duration of the slide-up/fade-out animation is 1s (from style.css)
        setTimeout(() => {
            mainContent.style.opacity = '1';
            mainContent.style.visibility = 'visible';

            // --- INTRO SECTION ANIMATION LOGIC ---
            const introSection = document.querySelector('.intro-section');
            const profilePicContainer = document.querySelector('.profile-pic-container');
            const textContent = document.querySelector('.text-content');

            // Desktop and Mobile animation: Profile pic slides left, then text content slides in
            // Initial state is already set in CSS for absolute positioning and centering

            // Delay before starting the intro animation
            setTimeout(() => {
                // Animate profile pic to slide left and fade out
                profilePicContainer.classList.add('slide-left');

                // After profile pic starts moving, delay the text content animation
                // Adjust this delay (e.g., 800ms) to synchronize with profile pic's movement
                setTimeout(() => {
                    textContent.classList.add('slide-in');

                    // Typing effect for "Prasanna Raj Poudel"
                    const typingNameElement = document.getElementById('typing-name');
                    if (typingNameElement) {
                        const textToType = typingNameElement.textContent; // Get the full text
                        typeText(typingNameElement, textToType, 75); // Call typing function with desired speed (ms per char)
                    }

                }, 100); // This delay determines when text starts appearing after pic starts moving

            }, 500); // Delay before intro animation starts after preloader is gone


            // --- ALL OTHER MAIN WEBSITE JAVASCRIPT INITIALIZATION AFTER PRELOADER ---

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

            // Lazy loading for images
            const lazyLoadImages = document.querySelectorAll('.lazy-load-img');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src; // Set the actual src from data-src
                        img.onload = () => {
                            // Optional: Add a class for a fade-in effect after loading
                            img.classList.add('loaded');
                        };
                        img.onerror = () => {
                            // Fallback for image loading error
                            img.src = 'https://placehold.co/400x200/cccccc/333333?text=Error';
                        };
                        observer.unobserve(img); // Stop observing once loaded
                    }
                });
            }, {
                root: null,
                rootMargin: '0px',
                threshold: 0.1 // Load image when 10% visible
            });
            // Observe each lazy-load image
            lazyLoadImages.forEach(img => {
                imageObserver.observe(img);
            });

            // --- END MAIN WEBSITE JAVASCRIPT INITIALIZATION ---

        }, 1000); // Wait for the slide-up animation to complete
    }, 2000); // Wait for the colorization animation to complete
}


// Initial setup:
// Ensure animation starts after the window has loaded
window.onload = function () {
    setCanvasSize(); // Set canvas size on page load
    init();          // Create initial particles
    animate();       // Start the animation loop

    // Start the preloader animation sequence
    handlePreloaderAnimation();
};
