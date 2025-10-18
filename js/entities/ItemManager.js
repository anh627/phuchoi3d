export class ItemManager {
    constructor(scene, assets) {
        this.scene = scene;
        this.assets = assets;
        
        this.items = [];
        this.collectedItems = [];
        this.missionItems = [];
        this.itemTypes = this.initItemTypes();
    }

    initItemTypes() {
        return {
            apple: {
                icon: '🍎',
                name: 'Apple',
                color: 0xff0000,
                points: 10,
                size: 0.5,
                shape: 'sphere'
            },
            milk: {
                icon: '🥛',
                name: 'Milk',
                color: 0xffffff,
                points: 15,
                size: { width: 0.4, height: 0.8, depth: 0.4 },
                shape: 'box'
            },
            bread: {
                icon: '🍞',
                name: 'Bread',
                color: 0xD2691E,
                points: 20,
                size: { width: 0.6, height: 0.3, depth: 0.8 },
                shape: 'box'
            },
            carrot: {
                icon: '🥕',
                name: 'Carrot',
                color: 0xFFA500,
                points: 25,
                size: { radius: 0.2, height: 0.8 },
                shape: 'cylinder'
            },
            cheese: {
                icon: '🧀',
                name: 'Cheese',
                color: 0xFFD700,
                points: 30,
                size: { width: 0.5, height: 0.3, depth: 0.5 },
                shape: 'box'
            },
            egg: {
                icon: '🥚',
                name: 'Egg',
                color: 0xFFFAFA,
                points: 35,
                size: 0.4,
                shape: 'sphere'
            },
            orange: {
                icon: '🍊',
                name: 'Orange',
                color: 0xFFA500,
                points: 40,
                size: 0.5,
                shape: 'sphere'
            },
            meat: {
                icon: '🥩',
                name: 'Meat',
                color: 0x8B0000,
                points: 45,
                size: { width: 0.8, height: 0.2, depth: 0.6 },
                shape: 'box'
            }
        };
    }

    async init() {
        // Load any 3D models for items if available
        // For now, we'll use procedural geometry
    }

    generateMissionItems(mission) {
        // Clear previous mission items
        this.clearMissionItems();
        
        // Get item type from mission
        const itemType = this.getItemTypeFromMission(mission);
        if (!itemType) return;
        
        // Generate required number of items
        for (let i = 0; i < mission.count; i++) {
            const item = this.createItem(itemType);
            
            // Random position on shelves
            const position = this.getRandomShelfPosition();
            item.position.copy(position);
            
            // Add to scene
            this.scene.add(item);
            this.missionItems.push(item);
            this.items.push(item);
            
            // Add floating animation
            this.addItemAnimation(item);
        }
    }

    getItemTypeFromMission(mission) {
        // Find item type that matches mission name
        for (const [key, type] of Object.entries(this.itemTypes)) {
            if (type.name.toLowerCase() === mission.name.toLowerCase()) {
                return key;
            }
        }
        return 'apple'; // Default
    }

    createItem(typeName) {
        const type = this.itemTypes[typeName];
        if (!type) return null;
        
        let geometry;
        
        // Create geometry based on shape
        switch (type.shape) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(type.size, 16, 16);
                break;
            case 'box':
                geometry = new THREE.BoxGeometry(
                    type.size.width,
                    type.size.height,
                    type.size.depth
                );
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(
                    type.size.radius,
                    type.size.radius,
                    type.size.height,
                    16
                );
                break;
            default:
                geometry = new THREE.SphereGeometry(0.5, 16, 16);
        }
        
        // Create material
        const material = new THREE.MeshPhongMaterial({
            color: type.color,
            emissive: type.color,
            emissiveIntensity: 0.2,
            shininess: 100
        });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Add item data
        mesh.userData = {
            type: typeName,
            itemType: type,
            points: type.points,
            collected: false,
            baseY: 0
        };
        
        // Add glow effect
        this.addGlowEffect(mesh, type.color);
        
        // Add icon sprite
        this.addIconSprite(mesh, type.icon);
        
        return mesh;
    }

    addGlowEffect(item, color) {
        const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        item.add(glow);
        
        // Store reference
        item.userData.glow = glow;
    }

    addIconSprite(item, icon) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.font = '64px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(1, 1, 1);
        sprite.position.y = 1;
        
        item.add(sprite);
        item.userData.sprite = sprite;
    }

    addItemAnimation(item) {
        item.userData.baseY = item.position.y;
        item.userData.floatOffset = Math.random() * Math.PI * 2;
        item.userData.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    getRandomShelfPosition() {
        // Get random position on top of shelves
        const x = (Math.random() - 0.5) * 40;
        const y = 4.5 + Math.random() * 0.5;
        const z = (Math.random() - 0.5) * 40;
        
        // Make sure it's near a shelf
        const shelfX = Math.round(x / 12) * 12;
        const shelfZ = Math.round(z / 12) * 12;
        
        return new THREE.Vector3(
            shelfX + (Math.random() - 0.5) * 6,
            y,
            shelfZ + (Math.random() - 0.5) * 2
        );
    }

    update(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Update all items
        this.items.forEach(item => {
            if (item.userData.collected) return;
            
            // Floating animation
            if (item.userData.baseY !== undefined) {
                item.position.y = item.userData.baseY + 
                    Math.sin(time * 2 + item.userData.floatOffset) * 0.1;
            }
            
            // Rotation
            if (item.userData.rotationSpeed) {
                item.rotation.y += item.userData.rotationSpeed;
            }
            
            // Glow pulsing
            if (item.userData.glow) {
                const scale = 1 + Math.sin(time * 3) * 0.1;
                item.userData.glow.scale.set(scale, scale, scale);
                item.userData.glow.material.opacity = 0.3 + Math.sin(time * 2) * 0.1;
            }
            
            // Sprite billboard
            if (item.userData.sprite) {
                item.userData.sprite.material.rotation = -item.rotation.y;
            }
        });
    }

    collectItem(item) {
        if (item.userData.collected) return false;
        
        item.userData.collected = true;
        this.collectedItems.push(item);
        
        // Collection animation
        const startPos = item.position.clone();
        const startScale = item.scale.clone();
        const duration = 500;
        const startTime = Date.now();
        
        const animateCollection = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Scale down
            const scale = 1 - progress;
            item.scale.set(
                startScale.x * scale,
                startScale.y * scale,
                startScale.z * scale
            );
            
            // Move up
            item.position.y = startPos.y + progress * 2;
            
            // Rotate
            item.rotation.y += 0.2;
            
            // Fade out
            if (item.material) {
                item.material.opacity = 1 - progress;
                item.material.transparent = true;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animateCollection);
            } else {
                this.removeItem(item);
            }
        };
        
        animateCollection();
        
        return true;
    }

    removeItem(item) {
        const index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
        }
        
        const missionIndex = this.missionItems.indexOf(item);
        if (missionIndex > -1) {
            this.missionItems.splice(missionIndex, 1);
        }
        
        this.scene.remove(item);
        
        // Dispose of resources
        if (item.geometry) item.geometry.dispose();
        if (item.material) {
            if (Array.isArray(item.material)) {
                item.material.forEach(m => m.dispose());
            } else {
                item.material.dispose();
            }
        }
    }

    getNearbyItems(position, radius) {
        return this.items.filter(item => {
            if (item.userData.collected) return false;
            const distance = item.position.distanceTo(position);
            return distance <= radius;
        });
    }

    clearMissionItems() {
        this.missionItems.forEach(item => {
            this.removeItem(item);
        });
        this.missionItems = [];
    }

    reset() {
        this.items.forEach(item => {
            this.removeItem(item);
        });
        this.items = [];
        this.missionItems = [];
        this.collectedItems = [];
    }

    dispose() {
        this.reset();
    }
}