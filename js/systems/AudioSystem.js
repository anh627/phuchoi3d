export class AudioSystem {
    constructor() {
        this.enabled = true;
        this.masterVolume = 1.0;
        this.bgmVolume = 0.5;
        this.sfxVolume = 0.7;
        
        this.audioContext = null;
        this.sounds = new Map();
        this.bgmSource = null;
        this.currentBGM = null;
        
        this.init();
    }

    init() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain node
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = this.masterVolume;
        
        // Create separate gain nodes for BGM and SFX
        this.bgmGain = this.audioContext.createGain();
        this.bgmGain.connect(this.masterGain);
        this.bgmGain.gain.value = this.bgmVolume;
        
        this.sfxGain = this.audioContext.createGain();
        this.sfxGain.connect(this.masterGain);
        this.sfxGain.gain.value = this.sfxVolume;
        
        // Handle audio context resume on user interaction
        document.addEventListener('click', () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });
        
        // Load default sounds
        this.loadDefaultSounds();
    }

    async loadDefaultSounds() {
        const defaultSounds = [
            { name: 'click', url: 'assets/sounds/click.mp3', type: 'sfx' },
            { name: 'hover', url: 'assets/sounds/hover.mp3', type: 'sfx' },
            { name: 'collect', url: 'assets/sounds/collect.mp3', type: 'sfx' },
            { name: 'success', url: 'assets/sounds/success.mp3', type: 'sfx' },
            { name: 'fail', url: 'assets/sounds/fail.mp3', type: 'sfx' },
            { name: 'levelup', url: 'assets/sounds/levelup.mp3', type: 'sfx' },
            { name: 'footstep', url: 'assets/sounds/footstep.mp3', type: 'sfx' },
            { name: 'jump', url: 'assets/sounds/jump.mp3', type: 'sfx' },
            { name: 'bgm_menu', url: 'assets/sounds/bgm_menu.mp3', type: 'bgm' },
            { name: 'bgm_game', url: 'assets/sounds/bgm_game.mp3', type: 'bgm' },
            { name: 'bgm_victory', url: 'assets/sounds/bgm_victory.mp3', type: 'bgm' }
        ];

        for (const sound of defaultSounds) {
            await this.loadSound(sound.name, sound.url, sound.type);
        }
    }

    async loadSound(name, url, type = 'sfx') {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.sounds.set(name, {
                buffer: audioBuffer,
                type: type,
                url: url
            });
            
            console.log(`✅ Sound loaded: ${name}`);
        } catch (error) {
            console.error(`❌ Failed to load sound ${name}:`, error);
        }
    }

    playSound(name, options = {}) {
        if (!this.enabled) return;
        
        const sound = this.sounds.get(name);
        if (!sound) {
            console.warn(`Sound not found: ${name}`);
            return;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = sound.buffer;
        
        // Apply options
        const playbackRate = options.playbackRate || 1.0;
        const volume = options.volume || 1.0;
        const loop = options.loop || false;
        
        source.playbackRate.value = playbackRate;
        source.loop = loop;
        
        // Create gain node for this sound
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(sound.type === 'bgm' ? this.bgmGain : this.sfxGain);
        
        // Start playback
        source.start(0);
        
        return source;
    }

    playBGM(name, fadeIn = true) {
        if (!this.enabled) return;
        
        // Stop current BGM
        if (this.bgmSource) {
            this.stopBGM(true);
        }
        
        // Play new BGM
        this.bgmSource = this.playSound(name, {
            loop: true,
            volume: fadeIn ? 0 : this.bgmVolume
        });
        
        this.currentBGM = name;
        
        // Fade in
        if (fadeIn && this.bgmSource) {
            this.fadeIn(this.bgmGain, this.bgmVolume, 2000);
        }
    }

    stopBGM(fadeOut = true) {
        if (!this.bgmSource) return;
        
        if (fadeOut) {
            this.fadeOut(this.bgmGain, 1000, () => {
                if (this.bgmSource) {
                    this.bgmSource.stop();
                    this.bgmSource = null;
                }
            });
        } else {
            this.bgmSource.stop();
            this.bgmSource = null;
        }
        
        this.currentBGM = null;
    }

    pauseBGM() {
        if (this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    resumeBGM() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    fadeIn(gainNode, targetVolume, duration) {
        const startTime = this.audioContext.currentTime;
        const endTime = startTime + duration / 1000;
        
        gainNode.gain.cancelScheduledValues(startTime);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(targetVolume, endTime);
    }

    fadeOut(gainNode, duration, callback) {
        const startTime = this.audioContext.currentTime;
        const endTime = startTime + duration / 1000;
        
        gainNode.gain.cancelScheduledValues(startTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, startTime);
        gainNode.gain.linearRampToValueAtTime(0, endTime);
        
        if (callback) {
            setTimeout(callback, duration);
        }
    }

    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
        this.masterGain.gain.value = this.masterVolume;
    }

    setBGMVolume(value) {
        this.bgmVolume = Math.max(0, Math.min(1, value));
        this.bgmGain.gain.value = this.bgmVolume;
    }

    setSFXVolume(value) {
        this.sfxVolume = Math.max(0, Math.min(1, value));
        this.sfxGain.gain.value = this.sfxVolume;
    }

    toggleMute() {
        this.enabled = !this.enabled;
        this.masterGain.gain.value = this.enabled ? this.masterVolume : 0;
    }

    play3DSound(name, position, listenerPosition, options = {}) {
        if (!this.enabled) return;
        
        const sound = this.sounds.get(name);
        if (!sound) return;
        
        // Create source
        const source = this.audioContext.createBufferSource();
        source.buffer = sound.buffer;
        
        // Create panner for 3D positioning
        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = options.refDistance || 1;
        panner.maxDistance = options.maxDistance || 100;
        panner.rolloffFactor = options.rolloffFactor || 1;
        
        // Set position
        panner.positionX.value = position.x;
        panner.positionY.value = position.y;
        panner.positionZ.value = position.z;
        
        // Set listener position
        const listener = this.audioContext.listener;
        listener.positionX.value = listenerPosition.x;
        listener.positionY.value = listenerPosition.y;
        listener.positionZ.value = listenerPosition.z;
        
        // Connect nodes
        source.connect(panner);
        panner.connect(this.sfxGain);
        
        // Start playback
        source.start(0);
        
        return source;
    }

    stopAll() {
        this.stopBGM(false);
        
        // Stop all playing sounds
        if (this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
}