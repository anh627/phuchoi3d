export class AssetLoader {
    constructor() {
        this.assets = new Map();
        this.loadingManager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.audioLoader = new THREE.AudioLoader(this.loadingManager);
        this.gltfLoader = null;
        
        this.onProgress = null;
        this.onComplete = null;
        this.onError = null;
        
        this.setupLoadingManager();
    }

    setupLoadingManager() {
        this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
            console.log(`Started loading: ${url}`);
        };

        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = itemsLoaded / itemsTotal;
            console.log(`Loading: ${Math.round(progress * 100)}%`);
            
            if (this.onProgress) {
                this.onProgress(progress);
            }
        };

        this.loadingManager.onLoad = () => {
            console.log('All assets loaded!');
            
            if (this.onComplete) {
                this.onComplete();
            }
        };

        this.loadingManager.onError = (url) => {
            console.error(`Error loading: ${url}`);
            
            if (this.onError) {
                this.onError(url);
            }
        };
    }

    async loadAll(assetList) {
        const promises = assetList.map(asset => this.load(asset));
        await Promise.all(promises);
        return this.assets;
    }

    async load(asset) {
        try {
            let result;
            
            switch (asset.type) {
                case 'texture':
                    result = await this.loadTexture(asset.url);
                    break;
                case 'model':
                    result = await this.loadModel(asset.url);
                    break;
                case 'audio':
                    result = await this.loadAudio(asset.url);
                    break;
                case 'json':
                    result = await this.loadJSON(asset.url);
                    break;
                default:
                    throw new Error(`Unknown asset type: ${asset.type}`);
            }
            
            this.assets.set(asset.name, result);
            return result;
            
        } catch (error) {
            console.error(`Failed to load ${asset.name}:`, error);
            throw error;
        }
    }

    loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => {
                    // Configure texture
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.encoding = THREE.sRGBEncoding;
                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    }

    loadModel(url) {
        return new Promise((resolve, reject) => {
            // Lazy load GLTFLoader
            if (!this.gltfLoader) {
                // In production, you'd import GLTFLoader properly
                // For now, we'll create a placeholder
                resolve(this.createPlaceholderModel());
                return;
            }
            
            this.gltfLoader.load(
                url,
                (gltf) => resolve(gltf),
                undefined,
                reject
            );
        });
    }

    loadAudio(url) {
        return new Promise((resolve, reject) => {
            this.audioLoader.load(
                url,
                (buffer) => resolve(buffer),
                undefined,
                reject
            );
        });
    }

    async loadJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    createPlaceholderModel() {
        // Create a simple placeholder geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
        const mesh = new THREE.Mesh(geometry, material);
        
        return {
            scene: mesh,
            animations: []
        };
    }

    get(name) {
        return this.assets.get(name);
    }

    dispose() {
        this.assets.forEach((asset, name) => {
            if (asset.dispose) {
                asset.dispose();
            }
        });
        this.assets.clear();
    }
}