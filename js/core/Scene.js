export class Scene extends THREE.Scene {
    constructor() {
        super();
        this.lights = [];
        this.helpers = [];
        this.debugMode = false;
    }

    init() {
        // Set background
        this.background = new THREE.Color(0x87CEEB);
        
        // Add fog
        this.fog = new THREE.FogExp2(0xcccccc, 0.002);
        
        // Setup lighting
        this.setupLighting();
        
        // Add grid helper in debug mode
        if (this.debugMode) {
            this.addHelpers();
        }
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.HemisphereLight(
            0xffffff, // Sky color
            0x444444, // Ground color
            0.6
        );
        this.add(ambientLight);
        this.lights.push(ambientLight);

        // Main directional light (sun)
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        dirLight.shadow.camera.left = -30;
        dirLight.shadow.camera.right = 30;
        dirLight.shadow.camera.top = 30;
        dirLight.shadow.camera.bottom = -30;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 100;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.add(dirLight);
        this.lights.push(dirLight);

        // Store main light reference
        this.mainLight = dirLight;

        // Add point lights for indoor effect
        const pointLightPositions = [
            [-15, 6, -15],
            [15, 6, -15],
            [-15, 6, 15],
            [15, 6, 15]
        ];

        pointLightPositions.forEach(pos => {
            const pointLight = new THREE.PointLight(0xfff5e6, 0.5, 20);
            pointLight.position.set(...pos);
            pointLight.castShadow = true;
            this.add(pointLight);
            this.lights.push(pointLight);
        });
    }

    addHelpers() {
        // Grid
        const gridHelper = new THREE.GridHelper(100, 50);
        this.add(gridHelper);
        this.helpers.push(gridHelper);

        // Axes
        const axesHelper = new THREE.AxesHelper(5);
        this.add(axesHelper);
        this.helpers.push(axesHelper);

        // Light helpers
        this.lights.forEach(light => {
            if (light instanceof THREE.DirectionalLight) {
                const helper = new THREE.DirectionalLightHelper(light, 5);
                this.add(helper);
                this.helpers.push(helper);
            } else if (light instanceof THREE.PointLight) {
                const helper = new THREE.PointLightHelper(light, 1);
                this.add(helper);
                this.helpers.push(helper);
            }
        });
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
        
        if (this.debugMode) {
            this.addHelpers();
        } else {
            this.helpers.forEach(helper => {
                this.remove(helper);
            });
            this.helpers = [];
        }
    }

    setTimeOfDay(hour) {
        // Adjust lighting based on time of day
        const intensity = Math.sin((hour / 24) * Math.PI);
        
        this.mainLight.intensity = Math.max(0.2, intensity);
        
        // Adjust fog color
        const fogColor = new THREE.Color();
        if (hour < 6 || hour > 20) {
            // Night
            fogColor.setHex(0x001133);
            this.fog.density = 0.03;
        } else if (hour < 12) {
            // Morning
            fogColor.setHex(0xffd4a3);
            this.fog.density = 0.02;
        } else if (hour < 18) {
            // Afternoon
            fogColor.setHex(0xcccccc);
            this.fog.density = 0.015;
        } else {
            // Evening
            fogColor.setHex(0xff6b35);
            this.fog.density = 0.025;
        }
        
        this.fog.color = fogColor;
        this.background = fogColor.clone().lerp(new THREE.Color(0x87CEEB), 0.5);
    }

    dispose() {
        // Clean up resources
        this.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }
}