const canvas = document.getElementById('spaghettiCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Particle setup
let particles = [];
let isTwirlActive = false;
let isMouseDown = false;
let blackHoleActive = false;
let twirlTimer = null;

// Black hole settings
const blackHoleRadius = 50; // Smaller black hole
const vortexEffectRadius = 80; // Subtle glow effect

// Create particles
function createParticles() {
    particles = Array.from({ length: 150 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 - 2,
        angle: Math.random() * Math.PI * 2, // Angle for spinning
        radius: Math.random() * 5 + 3,
        color: '#ffffff',
    }));
}

// Update particles
function updateParticles() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Semi-transparent fill for trails
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Draw the rectangle

    // Draw black hole vortex if active
    if (blackHoleActive) {
        createVortex();
    }

    particles.forEach(p => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        if (isTwirlActive) {
            // Spin particles around the center
            const dx = centerX - p.x;
            const dy = centerY - p.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            if (blackHoleActive && distance < blackHoleRadius) {
                // Absorb particles into the black hole
                p.x = centerX;
                p.y = centerY;
                p.vx = Math.random() * 4 - 2; // Reset velocity
                p.vy = Math.random() * 4 - 2; // Reset velocity
            } else {
                // Spin around center
                const angle = Math.atan2(dy, dx);
                const force = 0.05;
                p.vx += Math.cos(angle) * force;
                p.vy += Math.sin(angle) * force;
                p.x += p.vx;
                p.y += p.vy;
            }
        } else {
            // Regular movement
            p.x += p.vx;
            p.y += p.vy;
        }

        // Boundary checks
        if (p.x < 0) {
            p.x = 0;
            p.vx *= -1;
        }
        if (p.x > canvas.width) {
            p.x = canvas.width;
            p.vx *= -1;
        }
        if (p.y < 0) {
            p.y = 0;
            p.vy *= -1;
        }
        if (p.y > canvas.height) {
            p.y = canvas.height;
            p.vy *= -1;
        }

        // Draw particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(updateParticles);
}

// Create a swirling vortex for black hole mode
function createVortex() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw glowing effect
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, vortexEffectRadius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, vortexEffectRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw spinning vortex lines
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((Date.now() % 360) * Math.PI / 180);
    ctx.strokeStyle = 'rgba(255, 0, 150, 0.8)';
    for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(30, 0); // Shorter lines
        ctx.stroke();
    }
    ctx.restore();
}

// RGB mode functionality
document.getElementById('rgbButton').addEventListener('click', () => {
    // Toggle RGB mode
    particles.forEach(p => {
        p.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    });
    document.body.style.backgroundColor = '#000000'; // Change to black background
});

// Twirl button functionality
document.getElementById('twirlButton').addEventListener('mousedown', () => {
    isMouseDown = true;
    isTwirlActive = true;

    // Start black hole timer
    twirlTimer = setTimeout(() => {
        if (isMouseDown) {
            blackHoleActive = true;
        }
    }, 3000);
});

document.getElementById('twirlButton').addEventListener('mouseup', () => {
    isMouseDown = false;
    isTwirlActive = false;
    blackHoleActive = false;

    // Reset twirl timer
    clearTimeout(twirlTimer);

    // Release particles with random velocity
    particles.forEach(p => {
        p.vx = Math.random() * 6 - 3; // Reduced velocity for better control
        p.vy = Math.random() * 6 - 3;
    });
});

// Resize handler
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
});

// Cursor interaction
canvas.addEventListener('mousemove', e => {
    particles.forEach(p => {
        const dx = e.clientX - p.x;
        const dy = e.clientY - p.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        if (distance < 100) {
            p.vx += dx * 0.01;
            p.vy += dy * 0.01;
        }
    });
});

// Initialize particles and start animation
createParticles();
updateParticles();
