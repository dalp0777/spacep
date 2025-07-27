@@ .. @@
 const hero = new Hero(0, 0);
-const WIDTH = 1024;
-const HEIGHT = 768;
+let WIDTH = 1024;
+let HEIGHT = 768;
 let gameObjects = [];
@@ .. @@
 let monsterImg;
 
 let coolDown = 0;
+let isMobile = false;
+let gameScale = 1;
 
 const game = new Game();
@@ .. @@
   }, 100);
 }

+function detectMobile() {
+  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
+         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
+}
+
+function setupCanvas() {
+  const container = canvas.parentElement;
+  const containerWidth = container.clientWidth - 20; // Account for padding
+  const containerHeight = window.innerHeight * 0.6; // Use 60% of viewport height
+  
+  // Calculate scale to fit container while maintaining aspect ratio
+  const scaleX = containerWidth / 1024;
+  const scaleY = containerHeight / 768;
+  gameScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond original size
+  
+  // Set canvas display size
+  canvas.style.width = (1024 * gameScale) + 'px';
+  canvas.style.height = (768 * gameScale) + 'px';
+  
+  // Set canvas internal resolution
+  canvas.width = 1024;
+  canvas.height = 768;
+  
+  // Update game dimensions
+  WIDTH = 1024;
+  HEIGHT = 768;
+  
+  // Scale context for high DPI displays
+  const dpr = window.devicePixelRatio || 1;
+  if (dpr > 1) {
+    canvas.width = 1024 * dpr;
+    canvas.height = 768 * dpr;
+    ctx.scale(dpr, dpr);
+    canvas.style.width = (1024 * gameScale) + 'px';
+    canvas.style.height = (768 * gameScale) + 'px';
+  }
+}
+
+function setupMobileControls() {
+  if (!isMobile) return;
+  
+  const mobileControls = document.getElementById('mobileControls');
+  const upBtn = document.getElementById('upBtn');
+  const downBtn = document.getElementById('downBtn');
+  const leftBtn = document.getElementById('leftBtn');
+  const rightBtn = document.getElementById('rightBtn');
+  const fireBtn = document.getElementById('fireBtn');
+  const startBtn = document.getElementById('startBtn');
+  
+  // Prevent default touch behaviors
+  [upBtn, downBtn, leftBtn, rightBtn, fireBtn, startBtn].forEach(btn => {
+    btn.addEventListener('touchstart', (e) => {
+      e.preventDefault();
+      btn.style.transform = 'scale(0.9)';
+    });
+    
+    btn.addEventListener('touchend', (e) => {
+      e.preventDefault();
+      btn.style.transform = 'scale(1)';
+    });
+  });
+  
+  // Movement controls
+  upBtn.addEventListener('touchstart', () => eventEmitter.emit(Messages.KEY_EVENT_UP));
+  downBtn.addEventListener('touchstart', () => eventEmitter.emit(Messages.KEY_EVENT_DOWN));
+  leftBtn.addEventListener('touchstart', () => {
+    eventEmitter.emit(Messages.HERO_SPEED_LEFT);
+    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
+  });
+  rightBtn.addEventListener('touchstart', () => {
+    eventEmitter.emit(Messages.HERO_SPEED_RIGHT);
+    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
+  });
+  
+  // Stop movement on touch end
+  leftBtn.addEventListener('touchend', () => eventEmitter.emit(Messages.HERO_SPEED_ZERO));
+  rightBtn.addEventListener('touchend', () => eventEmitter.emit(Messages.HERO_SPEED_ZERO));
+  
+  // Fire and start controls
+  fireBtn.addEventListener('touchstart', () => eventEmitter.emit(Messages.HERO_FIRE));
+  startBtn.addEventListener('touchstart', () => eventEmitter.emit(Messages.GAME_START));
+  
+  // Also add click events for desktop testing
+  upBtn.addEventListener('click', () => eventEmitter.emit(Messages.KEY_EVENT_UP));
+  downBtn.addEventListener('click', () => eventEmitter.emit(Messages.KEY_EVENT_DOWN));
+  leftBtn.addEventListener('click', () => {
+    eventEmitter.emit(Messages.HERO_SPEED_LEFT);
+    setTimeout(() => eventEmitter.emit(Messages.HERO_SPEED_ZERO), 100);
+  });
+  rightBtn.addEventListener('click', () => {
+    eventEmitter.emit(Messages.HERO_SPEED_RIGHT);
+    setTimeout(() => eventEmitter.emit(Messages.HERO_SPEED_ZERO), 100);
+  });
+  fireBtn.addEventListener('click', () => eventEmitter.emit(Messages.HERO_FIRE));
+  startBtn.addEventListener('click', () => eventEmitter.emit(Messages.GAME_START));
+}
+
+function updateUIElements() {
+  const scoreDisplay = document.getElementById('score-display');
+  const livesDisplay = document.getElementById('lives-display');
+  
+  if (scoreDisplay) scoreDisplay.textContent = `Score: ${game.points}`;
+  if (livesDisplay) livesDisplay.textContent = `Lives: ${game.life}`;
+}
+
 function displayGameScore(message) {
-  ctx.font = "30px Arial";
+  const fontSize = Math.max(20, 30 * gameScale);
+  ctx.font = `${fontSize}px Arial`;
   ctx.fillStyle = "red";
   ctx.textAlign = "right";
-  ctx.fillText(message, canvas.width - 90, canvas.height - 30);
+  ctx.fillText(message, WIDTH - 90, HEIGHT - 30);
+  
+  // Update UI element as well
+  updateUIElements();
 }
 
 function displayLife() {
-  // should show tree ships.. 94 * 3
-  const START_X = canvas.width - 150 - 30;
+  const START_X = WIDTH - 150 - 30;
   for (let i = 0; i < game.life; i++) {
-    ctx.drawImage(lifeImg, START_X + (i + 1) * 35, canvas.height - 90);
+    ctx.drawImage(lifeImg, START_X + (i + 1) * 35, HEIGHT - 90);
   }
+  
+  // Update UI element as well
+  updateUIElements();
 }
 
 function displayMessage(message, color = "red") {
-  ctx.font = "30px Arial";
+  const fontSize = Math.max(20, 30 * gameScale);
+  ctx.font = `${fontSize}px Arial`;
   ctx.fillStyle = color;
   ctx.textAlign = "center";
-  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
+  ctx.fillText(message, WIDTH / 2, HEIGHT / 2);
 }
 
 function createMonsters(monsterImg) {
-  // 98 * 5     canvas.width - (98*5 /2)
   const MONSTER_TOTAL = 5;
   const MONSTER_WIDTH = MONSTER_TOTAL * 98;
-  const START_X = (canvas.width - MONSTER_WIDTH) / 2;
+  const START_X = (WIDTH - MONSTER_WIDTH) / 2;
   const STOP_X = START_X + MONSTER_WIDTH;
 
   for (let x = START_X; x < STOP_X; x += 98) {
@@ .. @@
 function createHero(heroImg) {
   hero.dead = false;
   hero.img = heroImg;
-  hero.y = (canvas.height / 4) * 3;
-  hero.x = canvas.width / 2;
+  hero.y = (HEIGHT / 4) * 3;
+  hero.x = WIDTH / 2;
   gameObjects.push(hero);
 }
@@ .. @@
   let gameLoopId = setInterval(() => {
-    ctx.clearRect(0, 0, canvas.width, canvas.height);
+    ctx.clearRect(0, 0, WIDTH, HEIGHT);
     ctx.fillStyle = "black";
-    ctx.fillRect(0, 0, canvas.width, canvas.height);
+    ctx.fillRect(0, 0, WIDTH, HEIGHT);
     displayGameScore("Score: " + game.points);
     displayLife();
     checkGameState(gameLoopId);
@@ .. @@
 window.onload = async () => {
   canvas = document.getElementById("myCanvas");
   ctx = canvas.getContext("2d");
+  
+  // Detect mobile and setup responsive features
+  isMobile = detectMobile();
+  
+  // Setup canvas responsiveness
+  setupCanvas();
+  
+  // Setup mobile controls if needed
+  setupMobileControls();
+  
+  // Handle window resize
+  window.addEventListener('resize', () => {
+    setupCanvas();
+  });
+  
+  // Handle orientation change
+  window.addEventListener('orientationchange', () => {
+    setTimeout(() => {
+      setupCanvas();
+    }, 100);
+  });
 
   heroImg = await loadTexture("spaceArt/png/player.png");
@@ .. @@
   game.ready = true;
   game.end = true;
-  ctx.clearRect(0, 0, canvas.width, canvas.height);
+  ctx.clearRect(0, 0, WIDTH, HEIGHT);
   ctx.fillStyle = "black";
-  ctx.fillRect(0, 0, canvas.width, canvas.height);
+  ctx.fillRect(0, 0, WIDTH, HEIGHT);
   displayMessage("Press [Enter] to start the game Captain Pew Pew", "blue");
+  
+  // Initialize UI elements
+  updateUIElements();
 
   // CHECK  draw 5 * 5 monsters