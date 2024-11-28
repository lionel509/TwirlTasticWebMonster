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
let collisionEnabled = false;
let gravityEnabled = false;

// Black hole settings
const blackHoleRadius = 50; // Smaller black hole
const vortexEffectRadius = 80; // Subtle glow effect

// Frame rate settings
let lastFrameTime = performance.now();
let frameRate = 0;

// Additional settings
let attractionEnabled = false;
let repulsionEnabled = false;
let windEnabled = false;
let windDirection = 1;
let groupingEnabled = false;
let groupCenterX = canvas.width / 2;
let groupCenterY = canvas.height / 2;

// Create particles
function createParticles() {
    const pipeX = window.innerWidth / 2;
    const pipeY = window.innerHeight - 25; // Adjust to match pipe position
    particles = Array.from({ length: 150 }, () => ({
        x: pipeX,
        y: pipeY,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * -4 - 2, // Particles move upwards
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 5 + 3,
        color: '#ffffff',
    }));
}

// Update particles
function updateParticles() {
    const now = performance.now();
    const delta = now - lastFrameTime;
    frameRate = Math.round(1000 / delta);
    lastFrameTime = now;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Increase opacity for more visible trails
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Draw the rectangle

    // Draw frame rate
    ctx.fillStyle = 'green';
    ctx.font = '16px Arial';
    ctx.fillText(`FPS: ${frameRate}`, canvas.width - 80, 20);

    // Draw black hole vortex if active
    if (blackHoleActive) {
        createVortex();
    }

    particles.forEach((p, index) => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Particle grouping
        if (groupingEnabled) {
            const dx = groupCenterX - p.x;
            const dy = groupCenterY - p.y;
            p.vx += dx * 0.001;
            p.vy += dy * 0.001;
        }

        // Particle attraction
        if (attractionEnabled) {
            const dx = centerX - p.x;
            const dy = centerY - p.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            if (distance > 20) {
                p.vx += (dx / distance) * 0.05;
                p.vy += (dy / distance) * 0.05;
            }
        }

        // Particle repulsion
        if (repulsionEnabled) {
            const dx = centerX - p.x;
            const dy = centerY - p.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            if (distance < 150) {
                p.vx -= (dx / distance) * 0.1;
                p.vy -= (dy / distance) * 0.1;
            }
        }

        // Wind effect
        if (windEnabled) {
            p.vx += windDirection * 0.02;
        }

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

        // Apply gravity
        if (gravityEnabled) {
            p.vy += 0.1; // Gravity force
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
            if (!gravityEnabled) {
                p.vy *= -1; // Reverse vertical velocity to bounce only if gravity is disabled
            } else {
                p.vy = 0; // Stop vertical movement due to gravity
            }
        }

        // Apply collision physics
        if (collisionEnabled) {
            for (let j = index + 1; j < particles.length; j++) {
                const other = particles[j];
                const dx = other.x - p.x;
                const dy = other.y - p.y;
                const distance = Math.sqrt(dx ** 2 + dy ** 2);
                const minDist = p.radius + other.radius;

                if (distance < minDist) {
                    const angle = Math.atan2(dy, dx);
                    const targetX = p.x + Math.cos(angle) * minDist;
                    const targetY = p.y + Math.sin(angle) * minDist;
                    const ax = (targetX - other.x) * 0.05;
                    const ay = (targetY - other.y) * 0.05;

                    p.vx -= ax;
                    p.vy -= ay;
                    other.vx += ax;
                    other.vy += ay;
                }
            }
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
let rgbEnabled = false;

document.getElementById('rgbButton').addEventListener('click', () => {
    rgbEnabled = !rgbEnabled;
    document.getElementById('rgbButton').classList.toggle('toggled', rgbEnabled);
    if (rgbEnabled) {
        particles.forEach(p => {
            p.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        });
        document.body.style.backgroundColor = '#000000'; // Change to black background
    } else {
        particles.forEach(p => {
            p.color = '#ffffff';
        });
        document.body.style.backgroundColor = '#ffffff'; // Change to white background
    }
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

// Function to add multiple particles
function addParticles(count) {
    const pipeX = window.innerWidth / 2;
    const pipeY = window.innerHeight - 25; // Adjust to match pipe position
    for (let i = 0; i < count; i++) {
        particles.push({
            x: pipeX,
            y: pipeY,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * -4 - 2, // Particles move upwards
            angle: Math.random() * Math.PI * 2,
            radius: Math.random() * 5 + 3,
            color: '#ffffff',
        });
    }
}

// Add button functionality
document.getElementById('addButton').addEventListener('click', () => addParticles(1));
document.getElementById('add10Button').addEventListener('click', () => addParticles(10));
document.getElementById('add100Button').addEventListener('click', () => addParticles(100));
document.getElementById('add1000Button').addEventListener('click', () => addParticles(1000));

// Remove button functionality
document.getElementById('removeButton').addEventListener('click', () => {
    particles.pop();
});

// Clear button functionality
document.getElementById('clearButton').addEventListener('click', () => {
    particles = [];
});

// Toggle collision physics
document.getElementById('collisionButton').addEventListener('click', () => {
    collisionEnabled = !collisionEnabled;
    document.getElementById('collisionButton').classList.toggle('toggled', collisionEnabled);
});

// Toggle gravity
document.getElementById('gravityButton').addEventListener('click', () => {
    gravityEnabled = !gravityEnabled;
    document.getElementById('gravityButton').classList.toggle('toggled', gravityEnabled);
});

// Firework one at a time button functionality
document.getElementById('fireworkOneButton').addEventListener('click', () => {
    collectParticlesAtBottom();
    shootParticlesUp(false);
    shootBigParticle();
});

// Firework all at once button functionality
document.getElementById('fireworkAllButton').addEventListener('click', () => {
    collectParticlesAtBottom();
    shootParticlesUp(true);
    shootBigParticle();
    shootSideParticles();
});

// Toggle particle attraction
function toggleAttraction() {
    attractionEnabled = !attractionEnabled;
    document.getElementById('attractionButton').classList.toggle('toggled', attractionEnabled);
}

document.getElementById('attractionButton').addEventListener('click', toggleAttraction);

// Toggle particle repulsion
function toggleRepulsion() {
    repulsionEnabled = !repulsionEnabled;
    document.getElementById('repulsionButton').classList.toggle('toggled', repulsionEnabled);
}

document.getElementById('repulsionButton').addEventListener('click', toggleRepulsion);

// Toggle wind effect
function toggleWind() {
    windEnabled = !windEnabled;
    document.getElementById('windButton').classList.toggle('toggled', windEnabled);
    if (windEnabled) {
        windDirection = Math.random() < 0.5 ? -1 : 1; // Random initial wind direction
    }
}

document.getElementById('windButton').addEventListener('click', toggleWind);

// Wind direction slider
document.getElementById('windDirectionSlider').addEventListener('input', (e) => {
    windDirection = parseFloat(e.target.value);
});

// Toggle particle grouping
function toggleGrouping() {
    groupingEnabled = !groupingEnabled;
    document.getElementById('groupingButton').classList.toggle('toggled', groupingEnabled);
    if (groupingEnabled) {
        groupCenterX = canvas.width / 2;
        groupCenterY = canvas.height / 2;
    }
}

document.getElementById('groupingButton').addEventListener('click', toggleGrouping);

// Resize handler
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
        p.vx = Math.random() * 20 - 10;
        p.vy = Math.random() * 20 - 10;
        p.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
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

// Function to collect particles at the bottom
function collectParticlesAtBottom() {
    const pipeX = window.innerWidth / 2;
    const pipeY = window.innerHeight - 25; // Adjust to match pipe position
    particles.forEach(p => {
        p.x = pipeX;
        p.y = pipeY;
        p.vx = 0;
        p.vy = 0;
    });
}

// Function to shoot particles up with RGB effect
function shootParticlesUp(allAtOnce) {
    particles.forEach((p, index) => {
        p.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        if (allAtOnce) {
            p.vx = Math.random() * 4 - 2;
            p.vy = Math.random() * -10 - 5; // Particles move upwards faster
        } else {
            setTimeout(() => {
                p.vx = Math.random() * 4 - 2;
                p.vy = Math.random() * -10 - 5; // Particles move upwards faster
            }, index * 100); // Delay each particle
        }
    });
}

// Function to shoot a big particle from the center pipe
function shootBigParticle() {
    const pipeX = window.innerWidth / 2;
    const pipeY = window.innerHeight - 25; // Adjust to match pipe position
    const bigParticle = {
        x: pipeX,
        y: pipeY,
        vx: 0,
        vy: -10, // Move upwards
        radius: 20,
        color: '#ffffff',
    };
    particles.push(bigParticle);

    // Check when the big particle reaches the center of the screen
    const interval = setInterval(() => {
        if (bigParticle.y <= window.innerHeight / 2) {
            clearInterval(interval);
            explodeBigParticle(bigParticle);
        }
    }, 30);
}

// Function to explode the big particle into smaller particles
function explodeBigParticle(bigParticle) {
    const explosionParticles = Array.from({ length: 50 }, () => ({
        x: bigParticle.x,
        y: bigParticle.y,
        vx: Math.random() * 8 - 4,
        vy: Math.random() * 8 - 4,
        radius: Math.random() * 5 + 3,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    }));
    particles = particles.filter(p => p !== bigParticle).concat(explosionParticles);
}

// Function to shoot particles from side barrels
function shootSideParticles() {
    const leftPipeX = window.innerWidth * 0.3;
    const rightPipeX = window.innerWidth * 0.7;
    const pipeY = window.innerHeight - 15; // Adjust to match pipe position

    const sideParticles = Array.from({ length: 50 }, () => ({
        x: Math.random() < 0.5 ? leftPipeX : rightPipeX,
        y: pipeY,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * -10 - 5, // Particles move upwards faster
        radius: Math.random() * 5 + 3,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    }));

    particles = particles.concat(sideParticles);
}

// Initialize particles and start animation
createParticles();
updateParticles();
