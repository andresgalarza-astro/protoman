// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Audio System - Retro style sounds using Web Audio API
class AudioSystem {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = 0.3;
    }

    playShoot() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playJump() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(this.masterVolume * 0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    playHit() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.type = 'sawtooth';
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(this.masterVolume * 0.6, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playEnemyHit() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.type = 'square';
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    playWin() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(this.masterVolume * 0.5, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
            }, i * 100);
        });
    }

    playGameOver() {
        const notes = [523.25, 493.88, 440.00, 392.00];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(this.masterVolume * 0.5, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.4);
            }, i * 150);
        });
    }
}

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = 12;
        this.gravity = 0.6;
        this.onGround = false;
        this.facingRight = true;
        this.health = 100;
        this.maxHealth = 100;
        this.shootCooldown = 0;
        this.animationFrame = 0;
        this.animationTick = 0;
        this.invulnerable = 0;
    }

    update() {
        this.velocityY += this.gravity;
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityX *= 0.85;
        
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        
        this.onGround = false;
        platforms.forEach(platform => {
            if (this.checkCollision(platform)) {
                if (this.velocityY > 0) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                }
            }
        });
        
        this.animationTick++;
        if (this.animationTick % 8 === 0 && Math.abs(this.velocityX) > 0.5) {
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
        
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.invulnerable > 0) this.invulnerable--;
    }

    checkCollision(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }

    moveLeft() {
        this.velocityX = -this.speed;
        this.facingRight = false;
    }

    moveRight() {
        this.velocityX = this.speed;
        this.facingRight = true;
    }

    jump() {
        if (this.onGround) {
            this.velocityY = -this.jumpPower;
            audio.playJump();
        }
    }

    shoot() {
        if (this.shootCooldown === 0) {
            const bulletX = this.facingRight ? this.x + this.width : this.x;
            bullets.push(new Bullet(bulletX, this.y + this.height / 2, this.facingRight));
            this.shootCooldown = 15;
            audio.playShoot();
        }
    }

    takeDamage(amount) {
        if (this.invulnerable === 0) {
            this.health -= amount;
            this.invulnerable = 60;
            audio.playHit();
            if (this.health <= 0) {
                gameState = 'gameover';
                audio.playGameOver();
            }
        }
    }

    draw() {
        if (this.invulnerable > 0 && Math.floor(this.invulnerable / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        ctx.save();
        ctx.fillStyle = '#00b8ff';
        ctx.fillRect(this.x, this.y + 5, this.width, this.height - 5);
        ctx.fillStyle = '#0080ff';
        ctx.fillRect(this.x + 2, this.y, this.width - 4, 12);
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(this.x + 8, this.y + 8, this.width - 16, 10);
        ctx.fillStyle = '#000';
        if (this.facingRight) {
            ctx.fillRect(this.x + 18, this.y + 10, 8, 4);
        } else {
            ctx.fillRect(this.x + 4, this.y + 10, 8, 4);
        }
        ctx.fillStyle = '#0066cc';
        if (this.facingRight) {
            ctx.fillRect(this.x + this.width - 5, this.y + 20, 12, 8);
        } else {
            ctx.fillRect(this.x - 7, this.y + 20, 12, 8);
        }
        ctx.fillStyle = '#006699';
        const legOffset = Math.sin(this.animationFrame) * 2;
        ctx.fillRect(this.x + 5, this.y + this.height - 15, 8, 15);
        ctx.fillRect(this.x + this.width - 13, this.y + this.height - 15 + legOffset, 8, 15 - legOffset);
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}

// Bullet class
class Bullet {
    constructor(x, y, right) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 6;
        this.speed = right ? 10 : -10;
        this.active = true;
    }

    update() {
        this.x += this.speed;
        if (this.x < 0 || this.x > canvas.width) {
            this.active = false;
        }
        enemies.forEach(enemy => {
            if (this.active && this.checkCollision(enemy)) {
                enemy.takeDamage(25);
                this.active = false;
                audio.playEnemyHit();
            }
        });
    }

    checkCollision(enemy) {
        return this.x < enemy.x + enemy.width &&
               this.x + this.width > enemy.x &&
               this.y < enemy.y + enemy.height &&
               this.y + this.height > enemy.y;
    }

    draw() {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 2, this.y + 1, 4, 4);
    }
}

// Enemy class
class Enemy {
    constructor(x, y, type = 'walker') {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.health = 50;
        this.maxHealth = 50;
        this.velocityX = 2;
        this.velocityY = 0;
        this.gravity = 0.6;
        this.onGround = false;
        this.animationFrame = 0;
        this.animationTick = 0;
    }

    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        
        if (this.type === 'walker') {
            this.x += this.velocityX;
            if (this.x < 50 || this.x > canvas.width - 50) {
                this.velocityX *= -1;
            }
        } else if (this.type === 'flyer') {
            this.velocityY = Math.sin(Date.now() * 0.003) * 2;
            this.x += this.velocityX;
            if (this.x < 50 || this.x > canvas.width - 50) {
                this.velocityX *= -1;
            }
        }
        
        platforms.forEach(platform => {
            if (this.checkCollision(platform)) {
                if (this.velocityY > 0) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                }
            }
        });
        
        if (this.checkPlayerCollision()) {
            player.takeDamage(10);
        }
        
        this.animationTick++;
        if (this.animationTick % 10 === 0) {
            this.animationFrame = (this.animationFrame + 1) % 2;
        }
    }

    checkCollision(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }

    checkPlayerCollision() {
        return this.x < player.x + player.width &&
               this.x + this.width > player.x &&
               this.y < player.y + player.height &&
               this.y + this.height > player.y;
    }

    takeDamage(amount) {
        this.health -= amount;
    }

    draw() {
        if (this.health < this.maxHealth) {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x, this.y - 8, this.width, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x, this.y - 8, this.width * (this.health / this.maxHealth), 4);
        }
        
        if (this.type === 'walker') {
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(this.x + 8, this.y + 10, 6, 6);
            ctx.fillRect(this.x + this.width - 14, this.y + 10, 6, 6);
            ctx.fillStyle = '#cc0000';
            const legOffset = this.animationFrame * 3;
            ctx.fillRect(this.x + 8, this.y + this.height - 5, 5, 5);
            ctx.fillRect(this.x + this.width - 13, this.y + this.height - 5 + legOffset, 5, 5);
        } else if (this.type === 'flyer') {
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(this.x + 8, this.y + 8, this.width - 16, this.height - 16);
            ctx.fillStyle = '#cc00cc';
            const wingFlap = this.animationFrame === 0 ? 8 : 4;
            ctx.fillRect(this.x, this.y + 10, 8, wingFlap);
            ctx.fillRect(this.x + this.width - 8, this.y + 10, 8, wingFlap);
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(this.x + 12, this.y + 12, 6, 6);
        }
    }
}

// Platform class
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = '#444444';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#666666';
        for (let i = 0; i < this.width; i += 20) {
            ctx.fillRect(this.x + i, this.y, 15, 3);
        }
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// Game state
let gameState = 'playing';
let audio;
let player;
let bullets = [];
let enemies = [];
let platforms = [];
let keys = {};

// Initialize game
function init() {
    audio = new AudioSystem();
    player = new Player(100, 100);
    bullets = [];
    enemies = [];
    gameState = 'playing';
    
    platforms = [
        new Platform(0, canvas.height - 40, canvas.width, 40),
        new Platform(150, 450, 150, 20),
        new Platform(400, 400, 150, 20),
        new Platform(600, 350, 150, 20),
        new Platform(250, 300, 120, 20),
        new Platform(500, 250, 120, 20),
        new Platform(100, 200, 120, 20)
    ];
    
    enemies = [
        new Enemy(300, 400, 'walker'),
        new Enemy(500, 300, 'walker'),
        new Enemy(650, 200, 'flyer'),
        new Enemy(200, 150, 'walker')
    ];
    
    updateUI();
}

// Input handling
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (gameState === 'playing') player.jump();
    }
    if (e.key.toLowerCase() === 'x' && gameState === 'playing') {
        player.shoot();
    }
    if (e.key.toLowerCase() === 'r') {
        init();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Update UI
function updateUI() {
    document.getElementById('enemyCount').textContent = `Enemigos: ${enemies.length}`;
    document.getElementById('health').textContent = `Vida: ${Math.max(0, player.health)}`;
    const statusEl = document.getElementById('gameStatus');
    if (gameState === 'win') {
        statusEl.textContent = '¡VICTORIA! Presiona R para reiniciar';
        statusEl.style.color = '#00ff00';
    } else if (gameState === 'gameover') {
        statusEl.textContent = 'GAME OVER - Presiona R para reiniciar';
        statusEl.style.color = '#ff0000';
    } else {
        statusEl.textContent = '¡Derrota a todos los enemigos!';
        statusEl.style.color = '#ffff00';
    }
}

// Game loop
function gameLoop() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    if (gameState === 'playing') {
        if (keys['arrowleft'] || keys['a']) {
            player.moveLeft();
        }
        if (keys['arrowright'] || keys['d']) {
            player.moveRight();
        }
        
        player.update();
        bullets = bullets.filter(b => b.active);
        bullets.forEach(bullet => bullet.update());
        enemies = enemies.filter(enemy => enemy.health > 0);
        enemies.forEach(enemy => enemy.update());
        
        if (enemies.length === 0 && gameState === 'playing') {
            gameState = 'win';
            audio.playWin();
        }
        
        updateUI();
    }
    
    platforms.forEach(platform => platform.draw());
    bullets.forEach(bullet => bullet.draw());
    enemies.forEach(enemy => enemy.draw());
    player.draw();
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 10, 204, 24);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(12, 12, 200, 20);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(12, 12, 200 * (player.health / player.maxHealth), 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 200, 20);
    
    requestAnimationFrame(gameLoop);
}

init();
gameLoop();
