// Configuración del canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 700;

// Variables del juego
let score = 0;
let missed = 0;
let gameRunning = true;
let objectsSpawned = 0;
let initialGoodObjectsSpawned = 0;
const INITIAL_GOOD_OBJECTS = 3;

// Objetos buenos (+5 puntos)
const GOOD_OBJECTS = [
    { emoji: '💻', name: 'Computadora' },
    { emoji: '📚', name: 'Libro' },
    { emoji: '🏠', name: 'Casa' },
    { emoji: '💼', name: 'Maletín' }
];

// Objetos malos (-15 puntos)
const BAD_OBJECTS = [
    { emoji: '🚗', name: 'Carro de Lujo' },
    { emoji: '🍬', name: 'Dulces' },
    { emoji: '🎮', name: 'Juego de Consola' },
    { emoji: '📱', name: 'Celular' }
];

// Clase del Tiburón
class Shark {
    constructor() {
        this.width = 80;
        this.height = 60;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = 5;
        this.color = '#4a90e2';
    }

    draw() {
        // Cuerpo del tiburón
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Aleta superior
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width / 2 - 15, this.y - 10);
        ctx.lineTo(this.x + this.width / 2 + 15, this.y - 10);
        ctx.closePath();
        ctx.fill();

        // Aleta inferior
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2 - 15, this.y + this.height + 10);
        ctx.lineTo(this.x + this.width / 2 + 15, this.y + this.height + 10);
        ctx.closePath();
        ctx.fill();

        // Ojo
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + 10, this.y + this.height / 2 - 5, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + 12, this.y + this.height / 2 - 5, 5, 0, Math.PI * 2);
        ctx.fill();

        // Boca
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 10, this.y + this.height / 2 + 5, 15, 0, Math.PI);
        ctx.stroke();
    }

    update() {
        // Movimiento con teclado
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Clase de Objetos que Caen
class FallingObject {
    constructor(type, isGood) {
        this.type = type;
        this.isGood = isGood;
        this.width = 50;
        this.height = 50;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 2 + Math.random() * 2;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.emoji, 0, 0);
        ctx.restore();
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isOffScreen() {
        return this.y > canvas.height;
    }
}

// Instancias
const shark = new Shark();
const fallingObjects = [];
let keys = {};

// Event Listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Función para generar un objeto
function spawnObject() {
    let isGood;
    let objectType;

    // Primero spawnear 3 objetos buenos
    if (initialGoodObjectsSpawned < INITIAL_GOOD_OBJECTS) {
        isGood = true;
        objectType = GOOD_OBJECTS[Math.floor(Math.random() * GOOD_OBJECTS.length)];
        initialGoodObjectsSpawned++;
    } else {
        // Después, objetos aleatorios (buenos o malos)
        isGood = Math.random() < 0.6; // 60% probabilidad de objetos buenos
        if (isGood) {
            objectType = GOOD_OBJECTS[Math.floor(Math.random() * GOOD_OBJECTS.length)];
        } else {
            objectType = BAD_OBJECTS[Math.floor(Math.random() * BAD_OBJECTS.length)];
        }
    }

    fallingObjects.push(new FallingObject(objectType, isGood));
    objectsSpawned++;
}

// Detección de colisiones
function checkCollision(obj1, obj2) {
    const bounds1 = obj1.getBounds();
    const bounds2 = obj2.getBounds();

    return bounds1.x < bounds2.x + bounds2.width &&
           bounds1.x + bounds1.width > bounds2.x &&
           bounds1.y < bounds2.y + bounds2.height &&
           bounds1.y + bounds1.height > bounds2.y;
}

// Actualizar puntuación
function updateScore(points) {
    score += points;
    if (score < 0) score = 0;
    document.getElementById('score').textContent = score;

    if (score === 0 && gameRunning) {
        gameOver();
    }
}

// Game Over
function gameOver() {
    gameRunning = false;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Reiniciar juego
function restartGame() {
    score = 0;
    missed = 0;
    objectsSpawned = 0;
    initialGoodObjectsSpawned = 0;
    gameRunning = true;
    fallingObjects.length = 0;
    shark.x = canvas.width / 2 - shark.width / 2;
    document.getElementById('score').textContent = score;
    document.getElementById('missed').textContent = missed;
    document.getElementById('gameOver').classList.add('hidden');
}

// Función principal del juego
function gameLoop() {
    if (!gameRunning) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar fondo (océano y arena)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#87CEEB');
    gradient.addColorStop(0.7, '#8B4513');
    gradient.addColorStop(1, '#8B4513');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar patrón de arena (checkered)
    ctx.fillStyle = '#A0522D';
    const checkSize = 20;
    for (let y = canvas.height * 0.7; y < canvas.height; y += checkSize) {
        for (let x = 0; x < canvas.width; x += checkSize * 2) {
            if (Math.floor(y / checkSize) % 2 === 0) {
                ctx.fillRect(x, y, checkSize, checkSize);
            } else {
                ctx.fillRect(x + checkSize, y, checkSize, checkSize);
            }
        }
    }

    // Spawnear objetos
    if (Math.random() < 0.02) { // Probabilidad de spawn
        spawnObject();
    }

    // Actualizar y dibujar tiburón
    shark.update();
    shark.draw();

    // Actualizar y dibujar objetos
    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        const obj = fallingObjects[i];
        obj.update();
        obj.draw();

        // Verificar colisión con tiburón
        if (checkCollision(shark, obj)) {
            if (obj.isGood) {
                updateScore(5);
            } else {
                updateScore(-15);
            }
            fallingObjects.splice(i, 1);
            continue;
        }

        // Si el objeto sale de pantalla
        if (obj.isOffScreen()) {
            if (obj.isGood) {
                missed++;
                document.getElementById('missed').textContent = missed;
            }
            fallingObjects.splice(i, 1);
        }
    }

    requestAnimationFrame(gameLoop);
}

// Iniciar el juego
gameLoop();

