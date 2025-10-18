export const CONFIG = {
    // Game settings
    game: {
        name: 'Cognitive Supermarket',
        version: '1.0.0',
        debug: false,
        showFPS: true,
        autoSave: true,
        saveInterval: 30000 // 30 seconds
    },
    
    // Graphics settings
    graphics: {
        quality: 'high', // low, medium, high, ultra
        shadows: true,
        antialiasing: true,
        postProcessing: true,
        particleCount: 100,
        viewDistance: 100
    },
    
    // Camera settings
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        position: [0, 10, 20],
        lookAt: [0, 0, 0]
    },
    
    // Scene settings
    scene: {
        fogColor: 0xf0f0f0,
        fogDensity: 0.02,
        ambientLightColor: 0xffffff,
        ambientLightIntensity: 0.6,
        directionalLightColor: 0xffffff,
        directionalLightIntensity: 1
    },
    
    // Player settings
    player: {
        moveSpeed: 10,
        runSpeed: 15,
        jumpForce: 15,
        collectRadius: 2,
        health: 100,
        stamina: 100,
        cameraOffset: { x: 0, y: 5, z: 8 },
        modelScale: 1
    },
    
    // Environment settings
    environment: {
        supermarketSize: { width: 60, height: 8, depth: 60 },
        shelfRows: 4,
        shelfCols: 5,
        shelfSpacing: 12,
        wallThickness: 0.5,
        floorTextureRepeat: 10
    },
    
    // Mission settings
    missions: [
        {
            id: 1,
            icon: '🍎',
            name: 'Apple',
            count: 3,
            points: 10,
            timeLimit: 60,
            description: 'Collect fresh red apples'
        },
        {
            id: 2,
            icon: '🥛',
            name: 'Milk',
            count: 2,
            points: 15,
            timeLimit: 45,
            description: 'Find milk cartons'
        },
        {
            id: 3,
            icon: '🍞',
            name: 'Bread',
            count: 4,
            points: 20,
            timeLimit: 90,
            description: 'Gather fresh bread'
        },
        {
            id: 4,
            icon: '🥕',
            name: 'Carrot',
            count: 5,
            points: 25,
            timeLimit: 120,
            description: 'Pick up carrots'
        },
        {
            id: 5,
            icon: '🧀',
            name: 'Cheese',
            count: 2,
            points: 30,
            timeLimit: 60,
            description: 'Find cheese blocks'
        },
        {
            id: 6,
            icon: '🥚',
            name: 'Eggs',
            count: 1,
            points: 35,
            timeLimit: 30,
            description: 'Get egg cartons carefully'
        },
        {
            id: 7,
            icon: '🍊',
            name: 'Orange',
            count: 6,
            points: 40,
            timeLimit: 150,
            description: 'Collect fresh oranges'
        },
        {
            id: 8,
            icon: '🥩',
            name: 'Meat',
            count: 2,
            points: 45,
            timeLimit: 75,
            description: 'Find meat packages'
        }
    ],
    
    // Difficulty settings
    difficulty: {
        easy: {
            speedMultiplier: 1,
            itemCount: 1,
            timeMultiplier: 1.5,
            scoreMultiplier: 0.8
        },
        normal: {
            speedMultiplier: 1,
            itemCount: 1,
            timeMultiplier: 1,
            scoreMultiplier: 1
        },
        hard: {
            speedMultiplier: 1.2,
            itemCount: 1.5,
            timeMultiplier: 0.8,
            scoreMultiplier: 1.5
        }
    },
    
    // UI settings
    ui: {
        showMinimap: true,
        minimapSize: 200,
        minimapOpacity: 0.8,
        hudScale: 1,
        notificationDuration: 3000,
        animationSpeed: 300
    },
    
    // Audio settings
    audio: {
        masterVolume: 1.0,
        bgmVolume: 0.5,
        sfxVolume: 0.7,
        enabled: true,
        positionalAudio: true
    },
    
    // Controls
    controls: {
        keyboard: {
            forward: ['w', 'W', 'ArrowUp'],
            backward: ['s', 'S', 'ArrowDown'],
            left: ['a', 'A', 'ArrowLeft'],
            right: ['d', 'D', 'ArrowRight'],
            jump: [' ', 'Space'],
            sprint: ['Shift'],
            interact: ['e', 'E'],
            pause: ['Escape', 'p', 'P']
        },
        mouse: {
            sensitivity: 0.002,
            invertY: false,
            smoothing: true
        },
        touch: {
            joystickSize: 150,
            joystickPosition: 'left',
            buttonSize: 60,
            swipeThreshold: 50
        }
    },
    
    // Performance
    performance: {
        targetFPS: 60,
        adaptiveQuality: true,
        maxParticles: 1000,
        shadowMapSize: 2048,
        textureQuality: 'high'
    },
    
    // Localization
    locale: {
        language: 'vi',
        currency: 'VND',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
    },
    
    // API endpoints
    api: {
        baseURL: 'https://api.cognitive-supermarket.com',
        endpoints: {
            leaderboard: '/leaderboard',
            saveGame: '/save',
            loadGame: '/load',
            analytics: '/analytics'
        }
    },
    
    // Social features
    social: {
        enableMultiplayer: false,
        enableLeaderboard: true,
        enableAchievements: true,
        shareURL: 'https://cognitive-supermarket.com/share'
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);