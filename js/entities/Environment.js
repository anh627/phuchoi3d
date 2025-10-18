export class Environment {
    constructor(scene, assets) {
        this.scene = scene;
        this.assets = assets;
        
        this.floor = null;
        this.walls = [];
        this.shelves = [];
        this.decorations = [];
        this.checkoutCounter = null;
        
        this.gridSize = { width: 60, depth: 60 };
        this.wallHeight = 8;
    }

    async init() {
        this.createFloor();
        this.createWalls();
        this.createShelves();
        this.createCheckout();
        this.createDecorations();
        this.createSkybox();
    }

    createFloor() {
        const geometry = new THREE.BoxGeometry(
            this.gridSize.width,
            0.5,
            this.gridSize.depth
        );
        
        const material = new THREE.MeshStandardMaterial({
            color: 0xe8e8e8,
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Add texture if available
        if (this.assets?.textures?.floor) {
            material.map = this.assets.textures.floor;
            material.map.wrapS = THREE.RepeatWrapping;
            material.map.wrapT = THREE.RepeatWrapping;
            material.map.repeat.set(10, 10);
        }
        
        this.floor = new THREE.Mesh(geometry, material);
        this.floor.position.y = -0.25;
        this.floor.receiveShadow = true;
        
        this.scene.add(this.floor);
        
        // Add tile pattern
        this.createTilePattern();
    }

    createTilePattern() {
        const tileSize = 2;
        const tileGeometry = new THREE.BoxGeometry(tileSize, 0.01, tileSize);
        
        for (let x = -30; x < 30; x += tileSize * 2) {
            for (let z = -30; z < 30; z += tileSize * 2) {
                const tileMaterial = new THREE.MeshStandardMaterial({
                    color: (x + z) % (tileSize * 4) === 0 ? 0xffffff : 0xf0f0f0,
                    roughness: 0.9,
                    metalness: 0
                });
                
                const tile = new THREE.Mesh(tileGeometry, tileMaterial);
                tile.position.set(x + tileSize/2, 0.01, z + tileSize/2);
                tile.receiveShadow = true;
                
                this.scene.add(tile);
            }
        }
    }

    createWalls() {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9,
            metalness: 0
        });
        
        const wallThickness = 0.5;
        
        // Front wall (with entrance)
        this.createWallWithDoor(
            new THREE.Vector3(0, this.wallHeight/2, -30),
            new THREE.Vector3(this.gridSize.width, this.wallHeight, wallThickness),
            wallMaterial
        );
        
        // Back wall
        const backWall = this.createWall(
            new THREE.Vector3(0, this.wallHeight/2, 30),
            new THREE.Vector3(this.gridSize.width, this.wallHeight, wallThickness),
            wallMaterial
        );
        
        // Left wall
        const leftWall = this.createWall(
            new THREE.Vector3(-30, this.wallHeight/2, 0),
            new THREE.Vector3(wallThickness, this.wallHeight, this.gridSize.depth),
            wallMaterial
        );
        
        // Right wall
        const rightWall = this.createWall(
            new THREE.Vector3(30, this.wallHeight/2, 0),
            new THREE.Vector3(wallThickness, this.wallHeight, this.gridSize.depth),
            wallMaterial
        );
        
        // Add windows
        this.addWindows();
    }

    createWall(position, size, material) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const wall = new THREE.Mesh(geometry, material);
        wall.position.copy(position);
        wall.castShadow = true;
        wall.receiveShadow = true;
        
        this.scene.add(wall);
        this.walls.push(wall);
        
        return wall;
    }

    createWallWithDoor(position, size, material) {
        const doorWidth = 10;
        const doorHeight = 5;
        
        // Left part
        const leftSize = new THREE.Vector3((size.x - doorWidth) / 2, size.y, size.z);
        const leftPos = position.clone();
        leftPos.x -= (doorWidth / 2 + leftSize.x / 2);
        this.createWall(leftPos, leftSize, material);
        
        // Right part
        const rightPos = position.clone();
        rightPos.x += (doorWidth / 2 + leftSize.x / 2);
        this.createWall(rightPos, leftSize, material);
        
        // Top part
        const topSize = new THREE.Vector3(doorWidth, size.y - doorHeight, size.z);
        const topPos = position.clone();
        topPos.y += (size.y - topSize.y) / 2;
        this.createWall(topPos, topSize, material);
        
        // Door frame
        this.createDoorFrame(position, doorWidth, doorHeight);
    }

    createDoorFrame(position, width, height) {
        const frameThickness = 0.3;
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.7,
            metalness: 0.1
        });
        
        // Create frame pieces
        const frameGeometry = new THREE.BoxGeometry(frameThickness, height, frameThickness);
        
        // Left frame
        const leftFrame = new THREE.Mesh(frameGeometry, frameMaterial);
        leftFrame.position.set(position.x - width/2, position.y - 1.5, position.z);
        this.scene.add(leftFrame);
        
        // Right frame
        const rightFrame = new THREE.Mesh(frameGeometry, frameMaterial);
        rightFrame.position.set(position.x + width/2, position.y - 1.5, position.z);
        this.scene.add(rightFrame);
        
        // Top frame
        const topFrameGeometry = new THREE.BoxGeometry(width, frameThickness, frameThickness);
        const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
        topFrame.position.set(position.x, position.y + 1, position.z);
        this.scene.add(topFrame);
    }

    addWindows() {
        const windowMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.9,
            thickness: 0.1
        });
        
        // Add windows to side walls
        for (let i = -20; i <= 20; i += 10) {
            // Left wall windows
            const leftWindow = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 3, 4),
                windowMaterial
            );
            leftWindow.position.set(-29.8, 4, i);
            this.scene.add(leftWindow);
            
            // Right wall windows
            const rightWindow = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 3, 4),
                windowMaterial
            );
            rightWindow.position.set(29.8, 4, i);
            this.scene.add(rightWindow);
        }
    }

    createShelves() {
        const shelfRows = 4;
        const shelfCols = 5;
        const spacing = 12;
        const shelfSize = { width: 8, height: 4, depth: 2 };
        
        for (let row = 0; row < shelfRows; row++) {
            for (let col = 0; col < shelfCols; col++) {
                const shelf = this.createShelf(
                    -20 + col * spacing,
                    2,
                    -15 + row * spacing,
                    shelfSize
                );
                
                this.shelves.push(shelf);
            }
        }
    }

    createShelf(x, y, z, size) {
        const group = new THREE.Group();
        
        // Shelf frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B7355,
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Vertical supports
        const supportGeometry = new THREE.BoxGeometry(0.2, size.height, 0.2);
        const positions = [
            [-size.width/2, 0, -size.depth/2],
            [size.width/2, 0, -size.depth/2],
            [-size.width/2, 0, size.depth/2],
            [size.width/2, 0, size.depth/2]
        ];
        
        positions.forEach(pos => {
            const support = new THREE.Mesh(supportGeometry, frameMaterial);
            support.position.set(...pos);
            support.castShadow = true;
            group.add(support);
        });
        
        // Shelves (3 levels)
        const shelfBoardGeometry = new THREE.BoxGeometry(size.width, 0.1, size.depth);
        
        for (let level = 0; level < 3; level++) {
            const shelfBoard = new THREE.Mesh(shelfBoardGeometry, frameMaterial);
            shelfBoard.position.y = -size.height/2 + (level + 1) * (size.height / 3);
            shelfBoard.castShadow = true;
            shelfBoard.receiveShadow = true;
            group.add(shelfBoard);
        }
        
        // Add sign
        this.addShelfSign(group, size);
        
        group.position.set(x, y, z);
        this.scene.add(group);
        
        return group;
    }

    addShelfSign(shelfGroup, size) {
        const signColors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0x6c5ce7];
        const signGeometry = new THREE.BoxGeometry(size.width - 0.5, 0.8, 0.1);
        const signMaterial = new THREE.MeshStandardMaterial({
            color: signColors[Math.floor(Math.random() * signColors.length)],
            emissive: signColors[Math.floor(Math.random() * signColors.length)],
            emissiveIntensity: 0.2
        });
        
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, size.height/2 + 0.5, -size.depth/2);
        shelfGroup.add(sign);
    }

    createCheckout() {
        const group = new THREE.Group();
        
        // Counter
        const counterGeometry = new THREE.BoxGeometry(4, 1.5, 8);
        const counterMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.3,
            metalness: 0.5
        });
        
        const counter = new THREE.Mesh(counterGeometry, counterMaterial);
        counter.position.y = 0.75;
        counter.castShadow = true;
        counter.receiveShadow = true;
        group.add(counter);
        
        // Conveyor belt
        const beltGeometry = new THREE.BoxGeometry(1.5, 0.1, 8);
        const beltMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.8
        });
        
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.set(-1, 1.55, 0);
        group.add(belt);
        
        // Cash register
        const registerGeometry = new THREE.BoxGeometry(1, 0.8, 1);
        const registerMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.4,
            metalness: 0.6
        });
        
        const register = new THREE.Mesh(registerGeometry, registerMaterial);
        register.position.set(1.5, 2, 0);
        group.add(register);
        
        // Position checkout
        group.position.set(0, 0, -20);
        this.scene.add(group);
        
        this.checkoutCounter = group;
    }

    createDecorations() {
        // Add plants
        this.addPlants();
        
        // Add signs
        this.addSigns();
        
        // Add lighting fixtures
        this.addLightingFixtures();
    }

    addPlants() {
        const plantPositions = [
            [-25, 0, -25],
            [25, 0, -25],
            [-25, 0, 25],
            [25, 0, 25]
        ];
        
        plantPositions.forEach(pos => {
            const pot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.8, 0.6, 1, 8),
                new THREE.MeshStandardMaterial({ color: 0x8B4513 })
            );
            pot.position.set(...pos);
            pot.position.y = 0.5;
            pot.castShadow = true;
            this.scene.add(pot);
            
            const plant = new THREE.Mesh(
                new THREE.ConeGeometry(1.5, 3, 8),
                new THREE.MeshStandardMaterial({ color: 0x228B22 })
            );
            plant.position.set(...pos);
            plant.position.y = 2.5;
            plant.castShadow = true;
            this.scene.add(plant);
            
            this.decorations.push(pot, plant);
        });
    }

    addSigns() {
        // Entrance sign
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#667eea';
        ctx.fillRect(0, 0, 512, 128);
        
        ctx.fillStyle = 'white';
        ctx.font = 'Bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🛒 SUPERMARKET', 256, 80);
        
        const texture = new THREE.CanvasTexture(canvas);
        const signMaterial = new THREE.MeshStandardMaterial({ map: texture });
        
        const signGeometry = new THREE.BoxGeometry(10, 2.5, 0.2);
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 6, -29.5);
        this.scene.add(sign);
        
        this.decorations.push(sign);
    }

    addLightingFixtures() {
        // Ceiling lights
        for (let x = -20; x <= 20; x += 10) {
            for (let z = -20; z <= 20; z += 10) {
                const fixture = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8),
                    new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        emissive: 0xffffaa,
                        emissiveIntensity: 0.5
                    })
                );
                fixture.position.set(x, 7.5, z);
                this.scene.add(fixture);
                
                this.decorations.push(fixture);
            }
        }
    }

    createSkybox() {
        // Simple gradient skybox
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x87CEEB) },
                bottomColor: { value: new THREE.Color(0xffffff) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }

    update(deltaTime) {
        // Animate decorations
        this.decorations.forEach((decoration, index) => {
            if (decoration.material?.emissive) {
                // Pulse emissive objects
                const intensity = Math.sin(Date.now() * 0.001 + index) * 0.2 + 0.3;
                decoration.material.emissiveIntensity = intensity;
            }
        });
    }

    getWalls() {
        return this.walls;
    }

    getShelves() {
        return this.shelves;
    }

    dispose() {
        // Clean up all meshes
        [...this.walls, ...this.shelves, ...this.decorations].forEach(mesh => {
            if (mesh) {
                this.scene.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => m.dispose());
                    } else {
                        mesh.material.dispose();
                    }
                }
            }
        });
    }
}