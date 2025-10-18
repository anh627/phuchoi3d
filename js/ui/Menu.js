export class Menu {
    constructor() {
        this.currentMenu = null;
        this.menuStack = [];
        this.callbacks = {
            onStart: null,
            onResume: null,
            onRestart: null,
            onSettings: null,
            onQuit: null
        };
        
        this.settings = this.loadSettings();
    }

    init() {
        this.createMenuStructure();
        this.bindEvents();
    }

    createMenuStructure() {
        const menuContainer = document.createElement('div');
        menuContainer.id = 'game-menu';
        menuContainer.className = 'game-menu';
        menuContainer.innerHTML = `
            <!-- Main Menu -->
            <div class="menu-screen main-menu" id="mainMenu">
                <div class="menu-background">
                    <div class="animated-bg"></div>
                    <div class="particle-bg"></div>
                </div>
                
                <div class="menu-content">
                    <div class="menu-header animate-fadeInDown">
                        <div class="logo-container">
                            <span class="logo-icon animate-float">🛒</span>
                            <h1 class="logo-text">Cognitive Supermarket</h1>
                        </div>
                        <p class="logo-subtitle animate-fadeIn delay-300">Rèn luyện trí nhớ và nhận thức không gian</p>
                    </div>

                    <div class="menu-buttons animate-fadeInUp delay-500">
                        <button class="menu-btn btn-primary" id="startBtn">
                            <span class="btn-icon">🎮</span>
                            <span class="btn-text">Chơi Mới</span>
                        </button>
                        
                        <button class="menu-btn btn-secondary" id="continueBtn">
                            <span class="btn-icon">▶️</span>
                            <span class="btn-text">Tiếp Tục</span>
                        </button>
                        
                        <button class="menu-btn btn-secondary" id="settingsBtn">
                            <span class="btn-icon">⚙️</span>
                            <span class="btn-text">Cài Đặt</span>
                        </button>
                        
                        <button class="menu-btn btn-secondary" id="leaderboardBtn">
                            <span class="btn-icon">🏆</span>
                            <span class="btn-text">Bảng Xếp Hạng</span>
                        </button>
                        
                        <button class="menu-btn btn-secondary" id="tutorialBtn">
                            <span class="btn-icon">📚</span>
                            <span class="btn-text">Hướng Dẫn</span>
                        </button>
                        
                        <button class="menu-btn btn-ghost" id="quitBtn">
                            <span class="btn-icon">🚪</span>
                            <span class="btn-text">Thoát</span>
                        </button>
                    </div>

                    <div class="menu-footer animate-fadeIn delay-700">
                        <div class="social-links">
                            <a href="#" class="social-link">
                                <span>📧</span>
                            </a>
                            <a href="#" class="social-link">
                                <span>🐦</span>
                            </a>
                            <a href="#" class="social-link">
                                <span>💬</span>
                            </a>
                        </div>
                        <p class="version-text">Version 1.0.0</p>
                    </div>
                </div>
            </div>

            <!-- Pause Menu -->
            <div class="menu-screen pause-menu" id="pauseMenu" style="display: none;">
                <div class="menu-overlay"></div>
                <div class="menu-content">
                    <div class="menu-header">
                        <h2 class="menu-title">Tạm Dừng</h2>
                    </div>
                    
                    <div class="menu-buttons">
                        <button class="menu-btn btn-primary" id="resumeBtn">
                            <span class="btn-icon">▶️</span>
                            <span class="btn-text">Tiếp Tục</span>
                        </button>
                        
                        <button class="menu-btn btn-secondary" id="pauseSettingsBtn">
                            <span class="btn-icon">⚙️</span>
                            <span class="btn-text">Cài Đặt</span>
                        </button>
                        
                        <button class="menu-btn btn-secondary" id="restartBtn">
                            <span class="btn-icon">🔄</span>
                            <span class="btn-text">Chơi Lại</span>
                        </button>
                        
                        <button class="menu-btn btn-danger" id="mainMenuBtn">
                            <span class="btn-icon">🏠</span>
                            <span class="btn-text">Menu Chính</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Settings Menu -->
            <div class="menu-screen settings-menu" id="settingsMenu" style="display: none;">
                <div class="menu-overlay"></div>
                <div class="menu-content settings-content">
                    <div class="menu-header">
                        <h2 class="menu-title">Cài Đặt</h2>
                        <button class="close-btn" id="closeSettingsBtn">✕</button>
                    </div>
                    
                    <div class="settings-tabs">
                        <button class="tab-btn active" data-tab="graphics">Đồ Họa</button>
                        <button class="tab-btn" data-tab="audio">Âm Thanh</button>
                        <button class="tab-btn" data-tab="controls">Điều Khiển</button>
                        <button class="tab-btn" data-tab="gameplay">Gameplay</button>
                    </div>
                    
                    <div class="settings-panels">
                        <!-- Graphics Settings -->
                        <div class="settings-panel active" id="graphicsPanel">
                            <div class="setting-group">
                                <label class="setting-label">Chất lượng đồ họa</label>
                                <select class="setting-select" id="qualitySelect">
                                    <option value="low">Thấp</option>
                                    <option value="medium">Trung bình</option>
                                    <option value="high" selected>Cao</option>
                                    <option value="ultra">Ultra</option>
                                </select>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">Độ phân giải</label>
                                <select class="setting-select" id="resolutionSelect">
                                    <option value="1280x720">1280x720</option>
                                    <option value="1920x1080" selected>1920x1080</option>
                                    <option value="2560x1440">2560x1440</option>
                                </select>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">
                                    <span>Bóng đổ</span>
                                    <input type="checkbox" class="setting-checkbox" id="shadowsToggle" checked>
                                </label>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">
                                    <span>Khử răng cưa</span>
                                    <input type="checkbox" class="setting-checkbox" id="antialiasingToggle" checked>
                                </label>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">
                                    <span>V-Sync</span>
                                    <input type="checkbox" class="setting-checkbox" id="vsyncToggle">
                                </label>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">Giới hạn FPS</label>
                                <div class="slider-container">
                                    <input type="range" class="setting-slider" id="fpsSlider" min="30" max="144" value="60">
                                    <span class="slider-value" id="fpsValue">60</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Audio Settings -->
                        <div class="settings-panel" id="audioPanel">
                            <div class="setting-group">
                                <label class="setting-label">Âm lượng tổng</label>
                                <div class="slider-container">
                                    <input type="range" class="setting-slider" id="masterVolumeSlider" min="0" max="100" value="100">
                                    <span class="slider-value" id="masterVolumeValue">100%</span>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">Nhạc nền</label>
                                <div class="slider-container">
                                    <input type="range" class="setting-slider" id="bgmVolumeSlider" min="0" max="100" value="50">
                                    <span class="slider-value" id="bgmVolumeValue">50%</span>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">Hiệu ứng âm thanh</label>
                                <div class="slider-container">
                                    <input type="range" class="setting-slider" id="sfxVolumeSlider" min="0" max="100" value="70">
                                    <span class="slider-value" id="sfxVolumeValue">70%</span>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">
                                    <span>Âm thanh 3D</span>
                                    <input type="checkbox" class="setting-checkbox" id="audio3dToggle" checked>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Controls Settings -->
                        <div class="settings-panel" id="controlsPanel">
                            <div class="setting-group">
                                <label class="setting-label">Độ nhạy chuột</label>
                                <div class="slider-container">
                                    <input type="range" class="setting-slider" id="sensitivitySlider" min="1" max="100" value="50">
                                    <span class="slider-value" id="sensitivityValue">50</span>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">
                                    <span>Đảo ngược trục Y</span>
                                    <input type="checkbox" class="setting-checkbox" id="invertYToggle">
                                </label>
                            </div>
                            
                            <div class="control-bindings">
                                <h3>Phím tắt</h3>
                                <div class="keybind-list">
                                    <div class="keybind-item">
                                        <span>Di chuyển</span>
                                        <span class="keybind-key">WASD</span>
                                    </div>
                                    <div class="keybind-item">
                                        <span>Nhảy</span>
                                        <span class="keybind-key">Space</span>
                                    </div>
                                    <div class="keybind-item">
                                        <span>Chạy</span>
                                        <span class="keybind-key">Shift</span>
                                    </div>
                                    <div class="keybind-item">
                                        <span>Tương tác</span>
                                        <span class="keybind-key">E</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Gameplay Settings -->
                        <div class="settings-panel" id="gameplayPanel">
                            <div class="setting-group">
                                <label class="setting-label">Độ khó</label>
                                <select class="setting-select" id="difficultySelect">
                                    <option value="easy">Dễ</option>
                                    <option value="normal" selected>Bình thường</option>
                                    <option value="hard">Khó</option>
                                </select>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">
                                    <span>Hiển thị hướng dẫn</span>
                                    <input type="checkbox" class="setting-checkbox" id="tutorialToggle" checked>
                                </label>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">
                                    <span>Hiển thị FPS</span>
                                    <input type="checkbox" class="setting-checkbox" id="showFpsToggle" checked>
                                </label>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">
                                    <span>Tự động lưu</span>
                                    <input type="checkbox" class="setting-checkbox" id="autosaveToggle" checked>
                                </label>
                            </div>
                            
                            <div class="setting-group">
                                <label class="setting-label">Ngôn ngữ</label>
                                <select class="setting-select" id="languageSelect">
                                    <option value="vi" selected>Tiếng Việt</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-footer">
                        <button class="menu-btn btn-secondary" id="resetSettingsBtn">
                            Đặt lại mặc định
                        </button>
                        <button class="menu-btn btn-primary" id="applySettingsBtn">
                            Áp dụng
                        </button>
                    </div>
                </div>
            </div>

            <!-- Game Over Menu -->
            <div class="menu-screen gameover-menu" id="gameOverMenu" style="display: none;">
                <div class="menu-overlay"></div>
                <div class="menu-content">
                    <div class="menu-header">
                        <h2 class="menu-title">Game Over</h2>
                    </div>
                    
                    <div class="gameover-stats">
                        <div class="stat-row">
                            <span class="stat-label">Điểm số:</span>
                            <span class="stat-value" id="finalScore">0</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Cấp độ:</span>
                            <span class="stat-value" id="finalLevel">1</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Thời gian:</span>
                            <span class="stat-value" id="finalTime">00:00</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Vật phẩm:</span>
                            <span class="stat-value" id="finalItems">0</span>
                        </div>
                    </div>
                    
                    <div class="menu-buttons">
                        <button class="menu-btn btn-primary" id="retryBtn">
                            <span class="btn-icon">🔄</span>
                            <span class="btn-text">Thử Lại</span>
                        </button>
                        
                        <button class="menu-btn btn-secondary" id="gameoverMainMenuBtn">
                            <span class="btn-icon">🏠</span>
                            <span class="btn-text">Menu Chính</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Loading Screen -->
            <div class="menu-screen loading-menu" id="loadingMenu" style="display: none;">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h2 class="loading-title">Đang tải...</h2>
                    <div class="loading-progress">
                        <div class="loading-bar" id="loadingBar"></div>
                    </div>
                    <p class="loading-tip" id="loadingTip">Mẹo: Thu thập vật phẩm nhanh để nhận điểm thưởng!</p>
                </div>
            </div>
        `;

        document.body.appendChild(menuContainer);
    }

    bindEvents() {
        // Main menu buttons
        document.getElementById('startBtn')?.addEventListener('click', () => {
            this.hide();
            if (this.onStart) this.onStart();
        });

        document.getElementById('continueBtn')?.addEventListener('click', () => {
            this.loadGame();
        });

        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('leaderboardBtn')?.addEventListener('click', () => {
            this.showLeaderboard();
        });

        document.getElementById('tutorialBtn')?.addEventListener('click', () => {
            this.showTutorial();
        });

        document.getElementById('quitBtn')?.addEventListener('click', () => {
            if (this.onQuit) this.onQuit();
        });

        // Pause menu buttons
        document.getElementById('resumeBtn')?.addEventListener('click', () => {
            this.hide();
            if (this.onResume) this.onResume();
        });

        document.getElementById('pauseSettingsBtn')?.addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('restartBtn')?.addEventListener('click', () => {
            this.hide();
            if (this.onRestart) this.onRestart();
        });

        document.getElementById('mainMenuBtn')?.addEventListener('click', () => {
            this.showMainMenu();
            if (this.onQuit) this.onQuit();
        });

        // Settings
        this.bindSettingsEvents();

        // Game over buttons
        document.getElementById('retryBtn')?.addEventListener('click', () => {
            this.hide();
            if (this.onRestart) this.onRestart();
        });

        document.getElementById('gameoverMainMenuBtn')?.addEventListener('click', () => {
            this.showMainMenu();
        });
    }

    bindSettingsEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchSettingsTab(tab);
            });
        });

        // Close settings
        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => {
            this.hideSettings();
        });

        // Apply settings
        document.getElementById('applySettingsBtn')?.addEventListener('click', () => {
            this.applySettings();
        });

        // Reset settings
        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => {
            this.resetSettings();
        });

        // Slider updates
        document.querySelectorAll('.setting-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueSpan = document.getElementById(e.target.id.replace('Slider', 'Value'));
                if (valueSpan) {
                    const value = e.target.value;
                    if (e.target.id.includes('Volume')) {
                        valueSpan.textContent = `${value}%`;
                    } else {
                        valueSpan.textContent = value;
                    }
                }
            });
        });
    }

    showMainMenu() {
        this.hideAll();
        const mainMenu = document.getElementById('mainMenu');
        const gameMenu = document.getElementById('game-menu');
        if (mainMenu && gameMenu) {
            gameMenu.style.display = 'block';
            mainMenu.style.display = 'flex';
            this.currentMenu = 'main';
        }
    }

    showPauseMenu() {
        this.hideAll();
        const pauseMenu = document.getElementById('pauseMenu');
        const gameMenu = document.getElementById('game-menu');
        if (pauseMenu && gameMenu) {
            gameMenu.style.display = 'block';
            pauseMenu.style.display = 'flex';
            this.currentMenu = 'pause';
        }
    }

    showSettings() {
        this.menuStack.push(this.currentMenu);
        this.hideAll();
        const settingsMenu = document.getElementById('settingsMenu');
        const gameMenu = document.getElementById('game-menu');
        if (settingsMenu && gameMenu) {
            gameMenu.style.display = 'block';
            settingsMenu.style.display = 'flex';
            this.currentMenu = 'settings';
        }
    }

    hideSettings() {
        const previousMenu = this.menuStack.pop();
        if (previousMenu === 'main') {
            this.showMainMenu();
        } else if (previousMenu === 'pause') {
            this.showPauseMenu();
        }
    }

    showGameOver(stats) {
        this.hideAll();
        const gameOverMenu = document.getElementById('gameOverMenu');
        const gameMenu = document.getElementById('game-menu');
        
        if (gameOverMenu && gameMenu) {
            // Update stats
            document.getElementById('finalScore').textContent = stats.score || 0;
            document.getElementById('finalLevel').textContent = stats.level || 1;
            document.getElementById('finalTime').textContent = this.formatTime(stats.time || 0);
            document.getElementById('finalItems').textContent = stats.items || 0;
            
            gameMenu.style.display = 'block';
            gameOverMenu.style.display = 'flex';
            this.currentMenu = 'gameover';
        }
    }

    showLoading(progress = 0) {
        this.hideAll();
        const loadingMenu = document.getElementById('loadingMenu');
        const gameMenu = document.getElementById('game-menu');
        
        if (loadingMenu && gameMenu) {
            gameMenu.style.display = 'block';
            loadingMenu.style.display = 'flex';
            
            // Update progress
            const loadingBar = document.getElementById('loadingBar');
            if (loadingBar) {
                loadingBar.style.width = `${progress * 100}%`;
            }
            
            // Random tips
            this.showRandomTip();
            
            this.currentMenu = 'loading';
        }
    }

    showRandomTip() {
        const tips = [
            'Thu thập vật phẩm nhanh để nhận điểm thưởng!',
            'Sử dụng phím Shift để chạy nhanh hơn',
            'Quan sát bản đồ nhỏ để định vị vị trí',
            'Hoàn thành combo để nhân đôi điểm số',
            'Ghi nhớ vị trí các kệ hàng để tìm vật phẩm nhanh hơn'
        ];
        
        const tipElement = document.getElementById('loadingTip');
        if (tipElement) {
            tipElement.textContent = tips[Math.floor(Math.random() * tips.length)];
        }
    }

    showTutorial() {
        // Create tutorial overlay
        const tutorial = document.createElement('div');
        tutorial.className = 'tutorial-overlay';
        tutorial.innerHTML = `
            <div class="tutorial-content">
                <h2>Hướng Dẫn Chơi</h2>
                <div class="tutorial-pages">
                    <div class="tutorial-page">
                        <h3>Di chuyển</h3>
                        <p>WASD hoặc mũi tên: Di chuyển</p>
                        <p>Chuột: Xoay camera</p>
                        <p>Shift: Chạy nhanh</p>
                        <p>Space: Nhảy</p>
                    </div>
                    <div class="tutorial-page">
                        <h3>Mục tiêu</h3>
                        <p>Thu thập các vật phẩm theo yêu cầu</p>
                        <p>Hoàn thành nhiệm vụ càng nhanh càng tốt</p>
                        <p>Tránh va chạm với chướng ngại vật</p>
                    </div>
                </div>
                <button class="close-tutorial-btn">Đóng</button>
            </div>
        `;
        
        document.body.appendChild(tutorial);
        
        tutorial.querySelector('.close-tutorial-btn').addEventListener('click', () => {
            tutorial.remove();
        });
    }

    showLeaderboard() {
        // Fetch and display leaderboard
        const leaderboard = this.getLeaderboard();
        
        const leaderboardModal = document.createElement('div');
        leaderboardModal.className = 'leaderboard-modal';
        leaderboardModal.innerHTML = `
            <div class="leaderboard-content">
                <h2>Bảng Xếp Hạng</h2>
                <div class="leaderboard-list">
                    ${leaderboard.map((entry, index) => `
                        <div class="leaderboard-entry">
                            <span class="rank">#${index + 1}</span>
                            <span class="name">${entry.name}</span>
                            <span class="score">${entry.score}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="close-leaderboard-btn">Đóng</button>
            </div>
        `;
        
        document.body.appendChild(leaderboardModal);
        
        leaderboardModal.querySelector('.close-leaderboard-btn').addEventListener('click', () => {
            leaderboardModal.remove();
        });
    }

    getLeaderboard() {
        // Get from localStorage or API
        const saved = localStorage.getItem('leaderboard');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default leaderboard
        return [
            { name: 'Player 1', score: 10000 },
            { name: 'Player 2', score: 8500 },
            { name: 'Player 3', score: 7200 },
            { name: 'Player 4', score: 6800 },
            { name: 'Player 5', score: 5500 }
        ];
    }

    switchSettingsTab(tab) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Add active class to selected tab and panel
        document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
        document.getElementById(`${tab}Panel`)?.classList.add('active');
    }

    applySettings() {
        // Gather all settings
        const settings = {
            graphics: {
                quality: document.getElementById('qualitySelect')?.value,
                resolution: document.getElementById('resolutionSelect')?.value,
                shadows: document.getElementById('shadowsToggle')?.checked,
                antialiasing: document.getElementById('antialiasingToggle')?.checked,
                vsync: document.getElementById('vsyncToggle')?.checked,
                fpsLimit: document.getElementById('fpsSlider')?.value
            },
            audio: {
                masterVolume: document.getElementById('masterVolumeSlider')?.value,
                bgmVolume: document.getElementById('bgmVolumeSlider')?.value,
                sfxVolume: document.getElementById('sfxVolumeSlider')?.value,
                audio3d: document.getElementById('audio3dToggle')?.checked
            },
            controls: {
                sensitivity: document.getElementById('sensitivitySlider')?.value,
                invertY: document.getElementById('invertYToggle')?.checked
            },
            gameplay: {
                difficulty: document.getElementById('difficultySelect')?.value,
                showTutorial: document.getElementById('tutorialToggle')?.checked,
                showFps: document.getElementById('showFpsToggle')?.checked,
                autosave: document.getElementById('autosaveToggle')?.checked,
                language: document.getElementById('languageSelect')?.value
            }
        };
        
        // Save settings
        this.saveSettings(settings);
        
        // Apply settings to game
        if (this.onSettings) {
            this.onSettings(settings);
        }
        
        // Show confirmation
        this.showNotification('Cài đặt đã được lưu!');
        
        // Close settings
        this.hideSettings();
    }

    resetSettings() {
        // Reset to default values
        document.getElementById('qualitySelect').value = 'high';
        document.getElementById('resolutionSelect').value = '1920x1080';
        document.getElementById('shadowsToggle').checked = true;
        document.getElementById('antialiasingToggle').checked = true;
        document.getElementById('vsyncToggle').checked = false;
        document.getElementById('fpsSlider').value = 60;
        document.getElementById('fpsValue').textContent = '60';
        
        document.getElementById('masterVolumeSlider').value = 100;
        document.getElementById('masterVolumeValue').textContent = '100%';
        document.getElementById('bgmVolumeSlider').value = 50;
        document.getElementById('bgmVolumeValue').textContent = '50%';
        document.getElementById('sfxVolumeSlider').value = 70;
        document.getElementById('sfxVolumeValue').textContent = '70%';
        document.getElementById('audio3dToggle').checked = true;
        
        document.getElementById('sensitivitySlider').value = 50;
        document.getElementById('sensitivityValue').textContent = '50';
        document.getElementById('invertYToggle').checked = false;
        
        document.getElementById('difficultySelect').value = 'normal';
        document.getElementById('tutorialToggle').checked = true;
        document.getElementById('showFpsToggle').checked = true;
        document.getElementById('autosaveToggle').checked = true;
        document.getElementById('languageSelect').value = 'vi';
        
        this.showNotification('Đã đặt lại cài đặt mặc định!');
    }

    saveSettings(settings) {
        localStorage.setItem('gameSettings', JSON.stringify(settings));
        this.settings = settings;
    }

    loadSettings() {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    }

    loadGame() {
        const saveData = localStorage.getItem('gameSave');
        if (saveData) {
            // Load saved game
            this.hide();
            if (this.onStart) {
                this.onStart(JSON.parse(saveData));
            }
        } else {
            this.showNotification('Không tìm thấy dữ liệu lưu!');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'menu-notification animate-slideInRight';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('animate-slideOutRight');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    hide() {
        const gameMenu = document.getElementById('game-menu');
        if (gameMenu) {
            gameMenu.style.display = 'none';
        }
    }

    hideAll() {
        document.querySelectorAll('.menu-screen').forEach(screen => {
            screen.style.display = 'none';
        });
    }

    dispose() {
        const gameMenu = document.getElementById('game-menu');
        if (gameMenu) {
            gameMenu.remove();
        }
    }
}