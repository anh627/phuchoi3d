export class HUD {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {};
        this.notifications = [];
        this.isVisible = false;
    }

    init() {
        this.createHUDStructure();
        this.bindEvents();
        this.hide();
    }

    createHUDStructure() {
        // Create main HUD container
        const hudContainer = document.createElement('div');
        hudContainer.id = 'game-hud';
        hudContainer.className = 'hud';
        hudContainer.innerHTML = `
            <!-- Top HUD -->
            <div class="hud-top">
                <!-- Mission Panel -->
                <div class="mission-panel glass-effect animate-slideInDown">
                    <div class="mission-header">
                        <span class="mission-label">NHIỆM VỤ</span>
                        <span class="mission-timer" id="missionTimer">00:00</span>
                    </div>
                    <div class="mission-content">
                        <span class="mission-icon" id="missionIcon">🎯</span>
                        <div class="mission-info">
                            <div class="mission-name" id="missionName">Loading...</div>
                            <div class="mission-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="missionProgress" style="width: 0%"></div>
                                </div>
                                <span class="progress-text" id="progressText">0 / 0</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats Panel -->
                <div class="stats-panel glass-effect animate-slideInDown delay-100">
                    <div class="stat-item">
                        <span class="stat-icon">💰</span>
                        <span class="stat-label">Điểm</span>
                        <span class="stat-value" id="scoreValue">0</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-icon">⭐</span>
                        <span class="stat-label">Cấp</span>
                        <span class="stat-value" id="levelValue">1</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-icon">⏱️</span>
                        <span class="stat-label">Thời gian</span>
                        <span class="stat-value" id="timeValue">00:00</span>
                    </div>
                </div>
            </div>

            <!-- Side Left -->
            <div class="hud-side-left">
                <!-- Health Bar -->
                <div class="health-container glass-effect animate-slideInLeft">
                    <div class="bar-header">
                        <span class="bar-icon">❤️</span>
                        <span class="bar-label">Sức khỏe</span>
                    </div>
                    <div class="bar-wrapper">
                        <div class="bar-bg">
                            <div class="bar-fill health-fill" id="healthBar" style="width: 100%"></div>
                        </div>
                        <span class="bar-value" id="healthValue">100/100</span>
                    </div>
                </div>

                <!-- Stamina Bar -->
                <div class="stamina-container glass-effect animate-slideInLeft delay-100">
                    <div class="bar-header">
                        <span class="bar-icon">⚡</span>
                        <span class="bar-label">Thể lực</span>
                    </div>
                    <div class="bar-wrapper">
                        <div class="bar-bg">
                            <div class="bar-fill stamina-fill" id="staminaBar" style="width: 100%"></div>
                        </div>
                        <span class="bar-value" id="staminaValue">100/100</span>
                    </div>
                </div>

                <!-- Inventory Quick Slots -->
                <div class="inventory-quick glass-effect animate-slideInLeft delay-200">
                    <div class="quick-slots" id="quickSlots">
                        ${this.createQuickSlots(5)}
                    </div>
                </div>
            </div>

            <!-- Side Right -->
            <div class="hud-side-right">
                <!-- Minimap Container -->
                <div class="minimap-container glass-effect animate-slideInRight">
                    <canvas id="minimapCanvas" width="200" height="200"></canvas>
                    <div class="minimap-overlay">
                        <span class="minimap-label">Bản đồ</span>
                    </div>
                </div>

                <!-- Objectives List -->
                <div class="objectives-list glass-effect animate-slideInRight delay-100">
                    <div class="objectives-header">
                        <span class="objectives-icon">📋</span>
                        <span class="objectives-title">Mục tiêu</span>
                    </div>
                    <ul class="objectives-items" id="objectivesList">
                        <!-- Dynamic objectives -->
                    </ul>
                </div>
            </div>

            <!-- Bottom HUD -->
            <div class="hud-bottom">
                <!-- Item Collection Indicator -->
                <div class="collection-indicator" id="collectionIndicator" style="display: none;">
                    <span class="collection-icon">✨</span>
                    <span class="collection-text">Nhấn E để nhặt</span>
                </div>

                <!-- Combo Display -->
                <div class="combo-display" id="comboDisplay" style="display: none;">
                    <div class="combo-number animate-bounceIn" id="comboNumber">x2</div>
                    <div class="combo-text">COMBO!</div>
                </div>
            </div>

            <!-- Center Notifications -->
            <div class="center-notifications" id="centerNotifications">
                <!-- Dynamic notifications -->
            </div>

            <!-- FPS Counter -->
            <div class="fps-counter" id="fpsCounter">
                <span class="fps-label">FPS:</span>
                <span class="fps-value" id="fpsValue">60</span>
            </div>

            <!-- Mission Intro Overlay -->
            <div class="mission-intro-overlay" id="missionIntroOverlay" style="display: none;">
                <div class="mission-intro-content animate-scaleIn">
                    <div class="mission-intro-icon" id="introIcon">🎯</div>
                    <h2 class="mission-intro-title" id="introTitle">Nhiệm vụ mới!</h2>
                    <p class="mission-intro-desc" id="introDesc">Tìm và thu thập các vật phẩm</p>
                    <div class="mission-intro-timer">
                        <span id="introTimer">3</span>
                    </div>
                </div>
            </div>

            <!-- Achievement Popup -->
            <div class="achievement-popup" id="achievementPopup" style="display: none;">
                <div class="achievement-content animate-bounceInRight">
                    <div class="achievement-icon">🏆</div>
                    <div class="achievement-info">
                        <div class="achievement-title" id="achievementTitle">Thành tựu mở khóa!</div>
                        <div class="achievement-desc" id="achievementDesc">Hoàn thành nhiệm vụ đầu tiên</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(hudContainer);
        
        // Store element references
        this.cacheElements();
    }

    createQuickSlots(count) {
        let slots = '';
        for (let i = 1; i <= count; i++) {
            slots += `
                <div class="quick-slot" data-slot="${i}">
                    <span class="slot-number">${i}</span>
                    <div class="slot-item" id="slot${i}"></div>
                    <span class="slot-count" id="slotCount${i}"></span>
                </div>
            `;
        }
        return slots;
    }

    cacheElements() {
        // Mission elements
        this.elements.missionTimer = document.getElementById('missionTimer');
        this.elements.missionIcon = document.getElementById('missionIcon');
        this.elements.missionName = document.getElementById('missionName');
        this.elements.missionProgress = document.getElementById('missionProgress');
        this.elements.progressText = document.getElementById('progressText');

        // Stats elements
        this.elements.scoreValue = document.getElementById('scoreValue');
        this.elements.levelValue = document.getElementById('levelValue');
        this.elements.timeValue = document.getElementById('timeValue');

        // Bars
        this.elements.healthBar = document.getElementById('healthBar');
        this.elements.healthValue = document.getElementById('healthValue');
        this.elements.staminaBar = document.getElementById('staminaBar');
        this.elements.staminaValue = document.getElementById('staminaValue');

        // Other elements
        this.elements.objectivesList = document.getElementById('objectivesList');
        this.elements.collectionIndicator = document.getElementById('collectionIndicator');
        this.elements.comboDisplay = document.getElementById('comboDisplay');
        this.elements.comboNumber = document.getElementById('comboNumber');
        this.elements.centerNotifications = document.getElementById('centerNotifications');
        this.elements.fpsValue = document.getElementById('fpsValue');
        this.elements.fpsCounter = document.getElementById('fpsCounter');
        
        // Overlays
        this.elements.missionIntroOverlay = document.getElementById('missionIntroOverlay');
        this.elements.achievementPopup = document.getElementById('achievementPopup');
    }

    bindEvents() {
        // Keyboard shortcuts for quick slots
        document.addEventListener('keydown', (e) => {
            const key = parseInt(e.key);
            if (key >= 1 && key <= 5) {
                this.useQuickSlot(key);
            }
        });
    }

    show() {
        const hud = document.getElementById('game-hud');
        if (hud) {
            hud.style.display = 'block';
            this.isVisible = true;
            
            // Animate elements
            this.animateShow();
        }
    }

    hide() {
        const hud = document.getElementById('game-hud');
        if (hud) {
            hud.style.display = 'none';
            this.isVisible = false;
        }
    }

    animateShow() {
        // Add entrance animations
        const elements = document.querySelectorAll('.glass-effect');
        elements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            el.classList.add('animate-fadeIn');
        });
    }

    update(deltaTime) {
        if (!this.isVisible) return;

        // Update timer
        this.updateTimer();

        // Update notifications
        this.updateNotifications(deltaTime);

        // Update animations
        this.updateAnimations();
    }

    updateTimer() {
        if (this.gameState) {
            const time = this.gameState.playTime || 0;
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            this.elements.timeValue.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateMission(mission) {
        if (!mission) return;

        this.elements.missionIcon.textContent = mission.icon || '🎯';
        this.elements.missionName.textContent = mission.name || 'Unknown Mission';
        
        // Animate mission update
        this.elements.missionIcon.classList.add('animate-bounce');
        setTimeout(() => {
            this.elements.missionIcon.classList.remove('animate-bounce');
        }, 1000);
    }

    updateProgress(current, total) {
        const percentage = (current / total) * 100;
        this.elements.missionProgress.style.width = `${percentage}%`;
        this.elements.progressText.textContent = `${current} / ${total}`;

        // Add pulse effect on progress
        if (current > 0) {
            this.elements.missionProgress.classList.add('animate-pulse');
            setTimeout(() => {
                this.elements.missionProgress.classList.remove('animate-pulse');
            }, 500);
        }
    }

    updateScore(score) {
        const currentScore = parseInt(this.elements.scoreValue.textContent) || 0;
        
        // Animate score change
        this.animateNumber(this.elements.scoreValue, currentScore, score, 500);
        
        // Add visual feedback
        this.elements.scoreValue.classList.add('score-increase');
        setTimeout(() => {
            this.elements.scoreValue.classList.remove('score-increase');
        }, 500);
    }

    updateLevel(level) {
        this.elements.levelValue.textContent = level;
        
        // Level up animation
        this.elements.levelValue.classList.add('animate-bounceIn');
        setTimeout(() => {
            this.elements.levelValue.classList.remove('animate-bounceIn');
        }, 1000);
    }

    updateHealth(current, max = 100) {
        const percentage = (current / max) * 100;
        this.elements.healthBar.style.width = `${percentage}%`;
        this.elements.healthValue.textContent = `${Math.round(current)}/${max}`;

        // Change color based on health
        if (percentage <= 25) {
            this.elements.healthBar.style.background = 'linear-gradient(90deg, #ff4444, #cc0000)';
        } else if (percentage <= 50) {
            this.elements.healthBar.style.background = 'linear-gradient(90deg, #ffaa00, #ff6600)';
        } else {
            this.elements.healthBar.style.background = 'linear-gradient(90deg, #44ff44, #00cc00)';
        }

        // Low health warning
        if (percentage <= 25) {
            this.elements.healthBar.classList.add('low-health-pulse');
        } else {
            this.elements.healthBar.classList.remove('low-health-pulse');
        }
    }

    updateStamina(current, max = 100) {
        const percentage = (current / max) * 100;
        this.elements.staminaBar.style.width = `${percentage}%`;
        this.elements.staminaValue.textContent = `${Math.round(current)}/${max}`;
    }

    updateFPS(fps) {
        this.elements.fpsValue.textContent = fps;
        
        // Color code FPS
        if (fps >= 60) {
            this.elements.fpsValue.style.color = '#44ff44';
        } else if (fps >= 30) {
            this.elements.fpsValue.style.color = '#ffaa00';
        } else {
            this.elements.fpsValue.style.color = '#ff4444';
        }
    }

    showMissionIntro(mission) {
        const overlay = this.elements.missionIntroOverlay;
        const icon = document.getElementById('introIcon');
        const title = document.getElementById('introTitle');
        const desc = document.getElementById('introDesc');
        const timer = document.getElementById('introTimer');

        icon.textContent = mission.icon;
        title.textContent = 'Nhiệm vụ mới!';
        desc.textContent = mission.description || `Thu thập ${mission.count} ${mission.name}`;

        overlay.style.display = 'flex';

        // Countdown
        let countdown = 3;
        timer.textContent = countdown;

        const interval = setInterval(() => {
            countdown--;
            timer.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(interval);
                overlay.style.display = 'none';
            }
        }, 1000);
    }

    showNotification(options) {
        const notification = this.createNotification(options);
        this.notifications.push(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, options.duration || 3000);
    }

    createNotification(options) {
        const notif = document.createElement('div');
        notif.className = `notification notification-${options.type} animate-slideInRight`;
        notif.innerHTML = `
            <div class="notification-icon">${this.getNotificationIcon(options.type)}</div>
            <div class="notification-content">
                <div class="notification-title">${options.title}</div>
                ${options.message ? `<div class="notification-message">${options.message}</div>` : ''}
            </div>
        `;

        this.elements.centerNotifications.appendChild(notif);

        return {
            element: notif,
            timestamp: Date.now()
        };
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            levelup: '⭐',
            achievement: '🏆',
            collect: '✨'
        };
        return icons[type] || '📢';
    }

    removeNotification(notification) {
        if (notification && notification.element) {
            notification.element.classList.add('animate-fadeOut');
            setTimeout(() => {
                notification.element.remove();
                const index = this.notifications.indexOf(notification);
                if (index > -1) {
                    this.notifications.splice(index, 1);
                }
            }, 300);
        }
    }

    updateNotifications(deltaTime) {
        const now = Date.now();
        this.notifications = this.notifications.filter(notif => {
            if (now - notif.timestamp > 5000) {
                this.removeNotification(notif);
                return false;
            }
            return true;
        });
    }

    showCombo(multiplier) {
        const display = this.elements.comboDisplay;
        const number = this.elements.comboNumber;

        number.textContent = `x${multiplier}`;
        display.style.display = 'block';

        // Animate combo
        number.classList.remove('animate-bounceIn');
        void number.offsetWidth; // Trigger reflow
        number.classList.add('animate-bounceIn');

        // Hide after delay
        clearTimeout(this.comboTimeout);
        this.comboTimeout = setTimeout(() => {
            display.style.display = 'none';
        }, 2000);
    }

    showCollectionIndicator(show = true) {
        this.elements.collectionIndicator.style.display = show ? 'block' : 'none';
        
        if (show) {
            this.elements.collectionIndicator.classList.add('animate-pulse');
        }
    }

    showAchievement(achievement) {
        const popup = this.elements.achievementPopup;
        const title = document.getElementById('achievementTitle');
        const desc = document.getElementById('achievementDesc');

        title.textContent = achievement.title;
        desc.textContent = achievement.description;

        popup.style.display = 'block';

        // Hide after delay
        setTimeout(() => {
            popup.style.display = 'none';
        }, 5000);
    }

    updateObjectives(objectives) {
        const list = this.elements.objectivesList;
        list.innerHTML = '';

        objectives.forEach(objective => {
            const item = document.createElement('li');
            item.className = `objective-item ${objective.completed ? 'completed' : ''}`;
            item.innerHTML = `
                <span class="objective-check">${objective.completed ? '✅' : '⭕'}</span>
                <span class="objective-text">${objective.text}</span>
            `;
            list.appendChild(item);
        });
    }

    updateQuickSlot(slot, item) {
        const slotElement = document.getElementById(`slot${slot}`);
        const countElement = document.getElementById(`slotCount${slot}`);

        if (item) {
            slotElement.innerHTML = `<span class="slot-icon">${item.icon}</span>`;
            countElement.textContent = item.count > 1 ? item.count : '';
        } else {
            slotElement.innerHTML = '';
            countElement.textContent = '';
        }
    }

    useQuickSlot(slot) {
        // Trigger quick slot usage
        const slotElement = document.querySelector(`[data-slot="${slot}"]`);
        if (slotElement) {
            slotElement.classList.add('slot-used');
            setTimeout(() => {
                slotElement.classList.remove('slot-used');
            }, 300);
        }
    }

    animateNumber(element, start, end, duration) {
        const startTime = Date.now();
        const diff = end - start;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(start + diff * this.easeOutCubic(progress));
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    updateAnimations() {
        // Update any ongoing animations
    }

    onResize() {
        // Handle responsive adjustments
    }

    dispose() {
        // Clean up HUD
        const hud = document.getElementById('game-hud');
        if (hud) {
            hud.remove();
        }
        
        // Clear timeouts
        clearTimeout(this.comboTimeout);
        
        // Clear notifications
        this.notifications = [];
    }
}