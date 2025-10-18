import { EventEmitter } from './EventEmitter.js';

export class GameState extends EventEmitter {
    constructor() {
        super();
        
        this.state = {
            // Player stats
            score: 0,
            level: 1,
            health: 100,
            stamina: 100,
            
            // Mission
            currentMission: null,
            missionProgress: 0,
            missionItems: [],
            collectedItems: [],
            
            // Game stats
            playTime: 0,
            totalItems: 0,
            combo: 0,
            maxCombo: 0,
            
            // Achievements
            achievements: [],
            statistics: {
                itemsCollected: 0,
                missionsCompleted: 0,
                distanceTraveled: 0,
                jumps: 0,
                timePlayed: 0
            }
        };
        
        this.saveKey = 'gameState';
        this.autoSaveInterval = 30000; // 30 seconds
        this.autoSaveTimer = null;
    }

    reset() {
        this.state = {
            score: 0,
            level: 1,
            health: 100,
            stamina: 100,
            currentMission: null,
            missionProgress: 0,
            missionItems: [],
            collectedItems: [],
            playTime: 0,
            totalItems: 0,
            combo: 0,
            maxCombo: 0,
            achievements: [],
            statistics: {
                itemsCollected: 0,
                missionsCompleted: 0,
                distanceTraveled: 0,
                jumps: 0,
                timePlayed: 0
            }
        };
        
        this.emit('reset');
    }

    update(deltaTime) {
        // Update play time
        this.state.playTime += deltaTime / 1000;
        this.state.statistics.timePlayed = this.state.playTime;
        
        // Check for level up
        const requiredScore = this.state.level * 100;
        if (this.state.score >= requiredScore) {
            this.levelUp();
        }
        
        // Update mission timer if active
        if (this.state.currentMission && this.state.currentMission.timeLimit) {
            this.state.currentMission.timeRemaining -= deltaTime / 1000;
            
            if (this.state.currentMission.timeRemaining <= 0) {
                this.failMission();
            }
        }
    }

    setMission(mission) {
        this.state.currentMission = {
            ...mission,
            timeRemaining: mission.timeLimit || Infinity,
            startTime: Date.now()
        };
        
        this.state.missionProgress = 0;
        this.state.missionItems = [];
        this.state.collectedItems = [];
        
        this.emit('missionStart', mission);
    }

    collectItem(itemType) {
        this.state.collectedItems.push(itemType);
        this.state.missionProgress++;
        this.state.totalItems++;
        this.state.statistics.itemsCollected++;
        
        // Update combo
        this.updateCombo();
        
        this.emit('itemCollected', itemType);
        
        // Check mission completion
        if (this.isMissionComplete()) {
            this.completeMission();
        }
    }

    updateCombo() {
        this.state.combo++;
        
        if (this.state.combo > this.state.maxCombo) {
            this.state.maxCombo = this.state.combo;
        }
        
        // Reset combo after time
        clearTimeout(this.comboTimer);
        this.comboTimer = setTimeout(() => {
            this.state.combo = 0;
            this.emit('comboReset');
        }, 5000);
        
        this.emit('comboUpdate', this.state.combo);
    }

    isMissionComplete() {
        if (!this.state.currentMission) return false;
        return this.state.missionProgress >= this.state.currentMission.count;
    }

    completeMission() {
        if (!this.state.currentMission) return;
        
        // Calculate bonus
        const timeBonus = Math.max(0, Math.floor(this.state.currentMission.timeRemaining));
        const comboBonus = this.state.combo * 10;
        const totalPoints = this.state.currentMission.points + timeBonus + comboBonus;
        
        // Add score
        this.addScore(totalPoints);
        
        // Update statistics
        this.state.statistics.missionsCompleted++;
        
        // Emit event
        this.emit('missionComplete', {
            mission: this.state.currentMission,
            timeBonus,
            comboBonus,
            totalPoints
        });
        
        // Check for achievements
        this.checkAchievements();
    }

    failMission() {
        this.emit('missionFailed', this.state.currentMission);
        this.state.currentMission = null;
        this.state.combo = 0;
    }

    addScore(points) {
        const multiplier = 1 + (this.state.combo * 0.1);
        const finalPoints = Math.floor(points * multiplier);
        
        this.state.score += finalPoints;
        this.emit('scoreUpdate', this.state.score, finalPoints);
    }

    levelUp() {
        this.state.level++;
        this.state.health = 100; // Restore health on level up
        this.state.stamina = 100;
        
        this.emit('levelUp', this.state.level);
        
        // Unlock achievement
        this.unlockAchievement('level_' + this.state.level);
    }

    getMissionProgress() {
        if (!this.state.currentMission) return { current: 0, total: 0 };
        
        return {
            current: this.state.missionProgress,
            total: this.state.currentMission.count
        };
    }

    checkAchievements() {
        // Check various achievement conditions
        const achievements = [
            {
                id: 'first_item',
                name: 'First Steps',
                description: 'Collect your first item',
                condition: () => this.state.totalItems >= 1
            },
            {
                id: 'collector_10',
                name: 'Collector',
                description: 'Collect 10 items',
                condition: () => this.state.totalItems >= 10
            },
            {
                id: 'collector_50',
                name: 'Super Collector',
                description: 'Collect 50 items',
                condition: () => this.state.totalItems >= 50
            },
            {
                id: 'combo_5',
                name: 'Combo Master',
                description: 'Achieve a 5x combo',
                condition: () => this.state.maxCombo >= 5
            },
            {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Complete a mission in under 30 seconds',
                condition: () => {
                    if (!this.state.currentMission) return false;
                    const elapsed = (Date.now() - this.state.currentMission.startTime) / 1000;
                    return elapsed < 30;
                }
            }
        ];
        
        achievements.forEach(achievement => {
            if (!this.state.achievements.includes(achievement.id)) {
                if (achievement.condition()) {
                    this.unlockAchievement(achievement.id, achievement);
                }
            }
        });
    }

    unlockAchievement(id, data = {}) {
        if (this.state.achievements.includes(id)) return;
        
        this.state.achievements.push(id);
        this.emit('achievementUnlocked', { id, ...data });
    }

    save() {
        const saveData = {
            state: this.state,
            timestamp: Date.now(),
            version: '1.0.0'
        };
        
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            this.emit('gameSaved');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    load() {
        try {
            const savedData = localStorage.getItem(this.saveKey);
            if (!savedData) return false;
            
            const parsed = JSON.parse(savedData);
            
            // Validate version
            if (parsed.version !== '1.0.0') {
                console.warn('Save version mismatch');
                return false;
            }
            
            this.state = parsed.state;
            this.emit('gameLoaded');
            return true;
            
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }

    enableAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            this.save();
        }, this.autoSaveInterval);
    }

    disableAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    getStatistics() {
        return { ...this.state.statistics };
    }

    getAchievements() {
        return [...this.state.achievements];
    }

    dispose() {
        this.disableAutoSave();
        clearTimeout(this.comboTimer);
        this.removeAllListeners();
    }
}