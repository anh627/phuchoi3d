import { Scene } from './Scene.js';
import { Renderer } from './Renderer.js';
import { Player } from '../entities/Player.js';
import { Environment } from '../entities/Environment.js';
import { ItemManager } from '../entities/ItemManager.js';
import { AnimationSystem } from '../systems/AnimationSystem.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { InputManager } from '../systems/InputManager.js';
import { HUD } from '../ui/HUD.js';
import { Menu } from '../ui/Menu.js';
import { Minimap } from '../ui/Minimap.js';
import { AssetLoader } from '../utils/AssetLoader.js';
import { GameState } from '../utils/GameState.js';
import { CONFIG } from '../config/config.js';

export class Game {
    constructor() {
        this.isInitialized = false;
        this.isPlaying = false;
        this.isPaused = false;
        
        // Core components
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        
        // Game entities
        this.player = null;
        this.environment = null;
        this.itemManager = null;
        
        // Systems
        this.animationSystem = null;
        this.physicsSystem = null;
        this.audioSystem = null;
        this.particleSystem = null;
        this.inputManager = null;
        
        // UI
        this.hud = null;
        this.menu = null;
        this.minimap = null;
        
        // Game state
        this.gameState = null;
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
        this.elapsedTime = 0;
        
        // Performance
        this.stats = null;
        this.performanceMonitor = {
            fps: 0,
            frameTime: 0,
            lastTime: performance.now(),
            frames: 0
        };
    }

    async init() {
        try {
            console.log('🎮 Initializing Cognitive Supermarket...');
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Load assets
            await this.loadAssets();
            
            // Initialize core components
            this.initializeCore();
            
            // Initialize systems
            this.initializeSystems();
            
            // Initialize entities
            await this.initializeEntities();
            
            // Initialize UI
            this.initializeUI();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ Game initialized successfully!');
            
            // Show main menu
            this.showMainMenu();
            
            // Start game loop
            this.animate();
            
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            this.showErrorScreen(error.message);
        }
    }

    async loadAssets() {
        const loader = new AssetLoader();
        
        // Update loading progress
        loader.onProgress = (progress) => {
            this.updateLoadingProgress(progress);
        };
        
        // Load all assets
        const assets = await loader.loadAll([
            // Textures
            { type: 'texture', url: 'assets/textures/floor.jpg', name: 'floor' },
            { type: 'texture', url: 'assets/textures/wall.jpg', name: 'wall' },
            { type: 'texture', url: 'assets/textures/shelf.jpg', name: 'shelf' },
            
            // Models
            { type: 'model', url: 'assets/models/cart.glb', name: 'cart' },
            { type: 'model', url: 'assets/models/apple.glb', name: 'apple' },
            { type: 'model', url: 'assets/models/milk.glb', name: 'milk' },
            
            // Sounds
            { type: 'audio', url: 'assets/sounds/bgm.mp3', name: 'bgm' },
            { type: 'audio', url: 'assets/sounds/collect.mp3', name: 'collect' },
            { type: 'audio', url: 'assets/sounds/success.mp3', name: 'success' },
            { type: 'audio', url: 'assets/sounds/footstep.mp3', name: 'footstep' }
        ]);
        
        this.assets = assets;
        return assets;
    }

    initializeCore() {
        // Scene
        this.scene = new Scene();
        this.scene.init();
        
        // Renderer
        this.renderer = new Renderer();
        this.renderer.init();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        this.camera.position.set(...CONFIG.camera.position);
        
        // Add fog
        this.scene.fog = new THREE.FogExp2(CONFIG.scene.fogColor, CONFIG.scene.fogDensity);
        
        // Add lights
        this.setupLighting();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.HemisphereLight(
            0xffffff, // Sky color
            0x444444, // Ground color
            0.6
        );
        this.scene.add(ambientLight);
        
        // Main directional light
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        dirLight.shadow.camera.left = -20;
        dirLight.shadow.camera.right = 20;
        dirLight.shadow.camera.top = 20;
        dirLight.shadow.camera.bottom = -20;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);
        
        // Store light reference
        this.mainLight = dirLight;
    }

    initializeSystems() {
        // Animation System
        this.animationSystem = new AnimationSystem();
        
        // Physics System
        this.physicsSystem = new PhysicsSystem();
        this.physicsSystem.init(this.scene);
        
        // Audio System
        this.audioSystem = new AudioSystem();
        this.audioSystem.init();
        
        // Particle System
        this.particleSystem = new ParticleSystem(this.scene);
        
        // Input Manager
        this.inputManager = new InputManager();
        this.inputManager.init();
        
        // Game State
        this.gameState = new GameState();
    }

    async initializeEntities() {
        // Environment
        this.environment = new Environment(this.scene, this.assets);
        await this.environment.init();
        
        // Player
        this.player = new Player(this.scene, this.camera);
        this.player.init();
        
        // Item Manager
        this.itemManager = new ItemManager(this.scene, this.assets);
        await this.itemManager.init();
    }

    initializeUI() {
        // HUD
        this.hud = new HUD(this.gameState);
        this.hud.init();
        
        // Menu
        this.menu = new Menu();
        this.menu.init();
        
        // Minimap
        this.minimap = new Minimap(this.scene, this.player);
        this.minimap.init();
        
        // Bind menu callbacks
        this.menu.onStart = () => this.startGame();
        this.menu.onResume = () => this.resumeGame();
        this.menu.onRestart = () => this.restartGame();
        this.menu.onSettings = () => this.showSettings();
        this.menu.onQuit = () => this.quitGame();
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isPlaying) {
                this.pauseGame();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPlaying) {
                this.togglePause();
            }
            if (e.key === 'F11') {
                this.toggleFullscreen();
            }
            if (e.key === 'M' || e.key === 'm') {
                this.audioSystem.toggleMute();
            }
        });
        
        // Game events
        this.player.on('collect', (item) => this.onItemCollect(item));
        this.player.on('damage', (amount) => this.onPlayerDamage(amount));
        this.gameState.on('missionComplete', () => this.onMissionComplete());
        this.gameState.on('levelUp', () => this.onLevelUp());
    }

    // ===== GAME FLOW =====
    
    startGame() {
        if (!this.isInitialized) return;
        
        console.log('🎮 Starting game...');
        
        // Reset game state
        this.gameState.reset();
        
        // Reset player position
        this.player.reset();
        this.player.mesh.position.set(0, 0, -20);
        
        // Generate first mission
        this.generateMission();
        
        // Hide menu
        this.menu.hide();
        
        // Show HUD
        this.hud.show();
        this.minimap.show();
        
        // Start background music
        this.audioSystem.playBGM('bgm');
        
        // Set flags
        this.isPlaying = true;
        this.isPaused = false;
        
        // Reset clock
        this.clock.start();
        
        // Show mission intro
        this.showMissionIntro();
    }

    pauseGame() {
        if (!this.isPlaying) return;
        
        this.isPaused = true;
        this.clock.stop();
        
        // Pause systems
        this.audioSystem.pauseBGM();
        this.animationSystem.pauseAll();
        
        // Show pause menu
        this.menu.showPauseMenu();
    }

    resumeGame() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        this.clock.start();
        
        // Resume systems
        this.audioSystem.resumeBGM();
        this.animationSystem.resumeAll();
        
        // Hide menu
        this.menu.hide();
    }

    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    restartGame() {
        // Stop current game
        this.stopGame();
        
        // Start new game
        this.startGame();
    }

    stopGame() {
        this.isPlaying = false;
        this.isPaused = false;
        
        // Stop systems
        this.audioSystem.stopAll();
        this.animationSystem.stopAll();
        this.particleSystem.clear();
        
        // Reset entities
        this.player.reset();
        this.itemManager.reset();
        
        // Hide UI
        this.hud.hide();
        this.minimap.hide();
    }

    quitGame() {
        this.stopGame();
        this.showMainMenu();
    }

    // ===== MISSIONS =====
    
    generateMission() {
        const missions = CONFIG.missions;
        const randomMission = missions[Math.floor(Math.random() * missions.length)];
        
        // Set current mission
        this.gameState.setMission(randomMission);
        
        // Generate items for mission
        this.itemManager.generateMissionItems(randomMission);
        
        // Update HUD
        this.hud.updateMission(randomMission);
    }

    onItemCollect(item) {
        // Play collect sound
        this.audioSystem.playSound('collect');
        
        // Add score
        this.gameState.addScore(item.points || 10);
        
        // Update mission progress
        this.gameState.collectItem(item.type);
        
        // Create collect effect
        this.particleSystem.createCollectEffect(item.position);
        
        // Update HUD
        this.hud.updateScore(this.gameState.score);
        this.hud.updateProgress(this.gameState.getMissionProgress());
        
        // Check mission completion
        if (this.gameState.isMissionComplete()) {
            this.onMissionComplete();
        }
    }

    onMissionComplete() {
        console.log('🎉 Mission Complete!');
        
        // Play success sound
        this.audioSystem.playSound('success');
        
        // Show success notification
        this.hud.showNotification({
            type: 'success',
            title: 'Mission Complete!',
            message: `+${this.gameState.currentMission.points} points`,
            duration: 3000
        });
        
        // Create celebration effect
        this.particleSystem.createCelebrationEffect(this.player.mesh.position);
        
        // Player celebrate animation
        this.player.celebrate();
        
        // Generate next mission after delay
        setTimeout(() => {
            this.generateMission();
        }, 3000);
    }

    onLevelUp() {
        console.log('⭐ Level Up!');
        
        // Show level up notification
        this.hud.showNotification({
            type: 'levelup',
            title: 'LEVEL UP!',
            message: `Welcome to Level ${this.gameState.level}`,
            duration: 4000
        });
        
        // Create level up effect
        this.particleSystem.createLevelUpEffect(this.player.mesh.position);
        
        // Increase difficulty
        this.increaseDifficulty();
    }

    onPlayerDamage(amount) {
        // Update health
        this.gameState.health -= amount;
        
        // Update HUD
        this.hud.updateHealth(this.gameState.health);
        
        // Check game over
        if (this.gameState.health <= 0) {
            this.gameOver();
        }
    }

    increaseDifficulty() {
        // Increase movement speed requirement
        CONFIG.difficulty.speedMultiplier += 0.1;
        
        // Add more items to collect
        CONFIG.difficulty.itemCount += 1;
        
        // Reduce time limit
        CONFIG.difficulty.timeLimit *= 0.95;
    }

    gameOver() {
        console.log('💀 Game Over!');
        
        this.isPlaying = false;
        
        // Stop game
        this.stopGame();
        
        // Show game over screen
        this.menu.showGameOver({
            score: this.gameState.score,
            level: this.gameState.level,
            time: this.gameState.playTime
        });
    }

    // ===== UI METHODS =====
    
    showMainMenu() {
        this.menu.showMainMenu();
    }

    showSettings() {
        this.menu.showSettings();
    }

    showMissionIntro() {
        const mission = this.gameState.currentMission;
        
        this.hud.showMissionIntro({
            icon: mission.icon,
            name: mission.name,
            count: mission.count,
            description: mission.description
        });
    }

    showLoadingScreen() {
        const loadingHTML = `
            <div id="loading-screen" class="loading-screen">
                <div class="loading-content">
                    <div class="logo-loader">
                        <span class="logo-icon animate-bounce">🛒</span>
                    </div>
                    <h2 class="loading-title animate-pulse">Cognitive Supermarket</h2>
                    <div class="loading-bar">
                        <div class="loading-progress" id="loading-progress"></div>
                    </div>
                    <div class="loading-text" id="loading-text">Loading assets...</div>
                    <div class="loading-tips">
                        <p class="tip animate-fadeIn">💡 Tip: Collect items quickly to earn bonus points!</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }

    updateLoadingProgress(progress) {
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress * 100}%`;
        }
        
        if (loadingText) {
            loadingText.textContent = `Loading... ${Math.round(progress * 100)}%`;
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('animate-fadeOut');
            setTimeout(() => loadingScreen.remove(), 500);
        }
    }

    showErrorScreen(message) {
        const errorHTML = `
            <div class="error-screen">
                <div class="error-content">
                    <span class="error-icon">⚠️</span>
                    <h2>Oops! Something went wrong</h2>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Reload Game
                    </button>
                </div>
            </div>
        `;
        
        document.body.innerHTML = errorHTML;
    }

    // ===== GAME LOOP =====
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Calculate delta time
        this.deltaTime = this.clock.getDelta() * 1000; // Convert to ms
        this.elapsedTime = this.clock.getElapsedTime();
        
        // Update performance monitor
        this.updatePerformance();
        
        if (this.isPlaying && !this.isPaused) {
            // Update game state
            this.gameState.update(this.deltaTime);
            
            // Update systems
            this.animationSystem.update(this.deltaTime);
            this.physicsSystem.update(this.deltaTime);
            this.particleSystem.update(this.deltaTime);
            
            // Update entities
            const input = this.inputManager.getInput();
            this.player.update(this.deltaTime, input);
            this.environment.update(this.deltaTime);
            this.itemManager.update(this.deltaTime);
            
            // Update UI
            this.hud.update(this.deltaTime);
            this.minimap.update();
            
            // Check collisions
            this.checkCollisions();
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
        
        // Update stats display
        if (this.stats) {
            this.stats.update();
        }
    }

    checkCollisions() {
        // Player vs Items
        const nearbyItems = this.itemManager.getNearbyItems(this.player.mesh.position, 5);
        
        nearbyItems.forEach(item => {
            const distance = this.player.mesh.position.distanceTo(item.position);
            
            if (distance < CONFIG.player.collectRadius) {
                // Collect item
                this.itemManager.collectItem(item);
                this.onItemCollect(item);
            }
        });
        
        // Player vs Walls
        const walls = this.environment.getWalls();
        this.physicsSystem.checkWallCollisions(this.player, walls);
    }

    updatePerformance() {
        const now = performance.now();
        this.performanceMonitor.frames++;
        
        if (now >= this.performanceMonitor.lastTime + 1000) {
            this.performanceMonitor.fps = Math.round(
                (this.performanceMonitor.frames * 1000) / (now - this.performanceMonitor.lastTime)
            );
            this.performanceMonitor.frameTime = (now - this.performanceMonitor.lastTime) / this.performanceMonitor.frames;
            this.performanceMonitor.frames = 0;
            this.performanceMonitor.lastTime = now;
            
            // Update FPS display
            this.hud.updateFPS(this.performanceMonitor.fps);
        }
    }

    onWindowResize() {
        // Update camera
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update UI
        this.hud.onResize();
        this.minimap.onResize();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}