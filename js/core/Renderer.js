export class Renderer {
    constructor() {
        this.renderer = null;
        this.composer = null;
        this.effects = {};
        this.stats = null;
    }

    init(canvas = null) {
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas || document.getElementById('gameCanvas'),
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false
        });

        // Configure renderer
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Setup post-processing
        this.setupPostProcessing();

        // Setup performance stats
        if (typeof Stats !== 'undefined') {
            this.stats = new Stats();
            this.stats.showPanel(0); // FPS
            document.body.appendChild(this.stats.dom);
            this.stats.dom.style.position = 'absolute';
            this.stats.dom.style.left = '10px';
            this.stats.dom.style.top = '10px';
        }

        // Handle resize
        window.addEventListener('resize', () => this.onResize());

        return this.renderer;
    }

    setupPostProcessing() {
        // This would require importing post-processing libraries
        // For now, we'll use the standard renderer
        // In production, you'd use:
        // - EffectComposer
        // - RenderPass
        // - UnrealBloomPass
        // - SSAOPass
        // - FXAAShaderPass
    }

    render(scene, camera) {
        if (this.stats) this.stats.begin();

        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(scene, camera);
        }

        if (this.stats) this.stats.end();
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);

        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }

    setQuality(quality) {
        switch (quality) {
            case 'low':
                this.renderer.setPixelRatio(1);
                this.renderer.shadowMap.enabled = false;
                break;
            case 'medium':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.BasicShadowMap;
                break;
            case 'high':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                break;
            case 'ultra':
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                break;
        }
    }

    screenshot() {
        this.renderer.render();
        const dataURL = this.renderer.domElement.toDataURL('image/png');
        
        // Download the screenshot
        const link = document.createElement('a');
        link.download = `screenshot_${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    }

    dispose() {
        this.renderer.dispose();
        if (this.stats) {
            document.body.removeChild(this.stats.dom);
        }
    }
}