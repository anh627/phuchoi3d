import { EventEmitter } from '../utils/EventEmitter.js';

export class Player extends EventEmitter {
    constructor(scene, camera) {
        super();
        this.scene = scene;
        this.camera = camera;
        
        this.mesh = null;
        this.mixer = null;
        this.animations = {};
        this.currentAnimation = 'idle';
        
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.speed = 10;
        this.runSpeed = 15;
        this.jumpForce = 15;
        this.isGrounded = true;
        this.isRunning = false;
        
        this.health = 100;
        this.stamina = 100;
        this.inventory = [];
        
        this.bodyParts = {};
        this.cameraOffset = new THREE.Vector3(0, 5, 8);
        this.cameraRotation = { horizontal: 0, vertical: 0 };
    }

    init() {
        this.createPlayerModel();
        this.setupAnimations();
        this.setupCamera();
    }

    createPlayerModel() {
        const group = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x4169E1,
            shininess: 100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        this.bodyParts.body = body;
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFDBB4,
            shininess: 30
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.1;
        head.castShadow = true;
        group.add(head);
        this.bodyParts.head = head;
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 2.15, 0.3);
        group.add(leftEye);
        this.bodyParts.leftEye = leftEye;
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 2.15, 0.3);
        group.add(rightEye);
        this.bodyParts.rightEye = rightEye;
        
        // Arms
        const armGeometry = new THREE.CapsuleGeometry(0.12, 0.6, 4, 8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0x4169E1 });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.5, 1.2, 0);
        leftArm.rotation.z = Math.PI / 8;
        leftArm.castShadow = true;
        group.add(leftArm);
        this.bodyParts.leftArm = leftArm;
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.5, 1.2, 0);
        rightArm.rotation.z = -Math.PI / 8;
        rightArm.castShadow = true;
        group.add(rightArm);
        this.bodyParts.rightArm = rightArm;
        
        // Legs
        const legGeometry = new THREE.CapsuleGeometry(0.15, 0.7, 4, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x1e3a8a });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, 0.3, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);
        this.bodyParts.leftLeg = leftLeg;
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, 0.3, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);
        this.bodyParts.rightLeg = rightLeg;
        
        this.mesh = group;
        this.scene.add(this.mesh);
        
        // Add name tag
        this.addNameTag('Player');
    }

    addNameTag(name) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, 256, 64);
        
        context.font = 'Bold 32px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.fillText(name, 128, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2, 0.5, 1);
        sprite.position.y = 3;
        
        this.mesh.add(sprite);
        this.nameTag = sprite;
    }

    setupAnimations() {
        this.animations = {
            idle: () => {
                const time = Date.now() * 0.001;
                // Breathing
                this.bodyParts.body.scale.x = 1 + Math.sin(time * 2) * 0.02;
                this.bodyParts.body.scale.z = 1 + Math.sin(time * 2) * 0.02;
                // Slight sway
                this.bodyParts.body.rotation.z = Math.sin(time) * 0.02;
            },
            
            walk: () => {
                const time = Date.now() * 0.003;
                // Arm swing
                this.bodyParts.leftArm.rotation.x = Math.sin(time * 2) * 0.5;
                this.bodyParts.rightArm.rotation.x = -Math.sin(time * 2) * 0.5;
                // Leg movement
                this.bodyParts.leftLeg.rotation.x = -Math.sin(time * 2) * 0.5;
                this.bodyParts.rightLeg.rotation.x = Math.sin(time * 2) * 0.5;
                // Body bob
                this.mesh.position.y = Math.abs(Math.sin(time * 2)) * 0.1;
            },
            
            run: () => {
                const time = Date.now() * 0.005;
                // Faster arm swing
                this.bodyParts.leftArm.rotation.x = Math.sin(time * 2) * 0.8;
                this.bodyParts.rightArm.rotation.x = -Math.sin(time * 2) * 0.8;
                // Faster leg movement
                this.bodyParts.leftLeg.rotation.x = -Math.sin(time * 2) * 0.8;
                this.bodyParts.rightLeg.rotation.x = Math.sin(time * 2) * 0.8;
                // More body bob
                this.mesh.position.y = Math.abs(Math.sin(time * 2)) * 0.15;
                // Lean forward
                this.bodyParts.body.rotation.x = 0.1;
            },
            
            jump: () => {
                // Arms up
                this.bodyParts.leftArm.rotation.x = -Math.PI / 3;
                this.bodyParts.rightArm.rotation.x = -Math.PI / 3;
                // Legs bent
                this.bodyParts.leftLeg.rotation.x = Math.PI / 6;
                this.bodyParts.rightLeg.rotation.x = Math.PI / 6;
            }
        };
    }

    setupCamera() {
        // Third person camera setup
        this.updateCamera();
    }

    update(deltaTime, input) {
        const dt = deltaTime / 1000; // Convert to seconds
        
        // Handle input
        this.handleMovement(input, dt);
        this.handleJump(input, dt);
        
        // Apply gravity
        if (!this.isGrounded) {
            this.velocity.y -= 30 * dt;
        }
        
        // Update position
        this.mesh.position.add(this.velocity.clone().multiplyScalar(dt));
        
        // Ground check
        if (this.mesh.position.y <= 0) {
            this.mesh.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
        }
        
        // Update animation
        if (this.animations[this.currentAnimation]) {
            this.animations[this.currentAnimation]();
        }
        
        // Update camera
        this.updateCamera();
        
        // Update stamina
        this.updateStamina(dt);
    }

    handleMovement(input, dt) {
        const moveSpeed = this.isRunning ? this.runSpeed : this.speed;
        const movement = new THREE.Vector3();
        
        if (input.forward) movement.z -= 1;
        if (input.backward) movement.z += 1;
        if (input.left) movement.x -= 1;
        if (input.right) movement.x += 1;
        
        if (movement.length() > 0) {
            movement.normalize();
            movement.multiplyScalar(moveSpeed);
            
            // Apply camera rotation to movement
            const cameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);
            const angle = Math.atan2(cameraDirection.x, cameraDirection.z);
            
            const rotatedMovement = new THREE.Vector3();
            rotatedMovement.x = movement.x * Math.cos(angle) - movement.z * Math.sin(angle);
            rotatedMovement.z = movement.x * Math.sin(angle) + movement.z * Math.cos(angle);
            
            this.velocity.x = rotatedMovement.x;
            this.velocity.z = rotatedMovement.z;
            
            // Rotate player to face movement direction
            const moveAngle = Math.atan2(rotatedMovement.x, rotatedMovement.z);
            this.mesh.rotation.y = moveAngle;
            
            // Set animation
            this.currentAnimation = this.isRunning ? 'run' : 'walk';
        } else {
            this.velocity.x *= 0.9; // Friction
            this.velocity.z *= 0.9;
            this.currentAnimation = 'idle';
        }
        
        // Handle sprint
        this.isRunning = input.shift && this.stamina > 0;
    }

    handleJump(input, dt) {
        if (input.jump && this.isGrounded && this.stamina > 10) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            this.currentAnimation = 'jump';
            this.stamina -= 10;
            this.emit('jump');
        }
    }

    updateCamera() {
        // Calculate camera position based on player position and rotation
        const idealOffset = this.cameraOffset.clone();
        const idealLookat = new THREE.Vector3(0, 2, 0);
        
        // Apply player rotation to offset
        idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
        
        // Set camera position
        const idealPosition = this.mesh.position.clone().add(idealOffset);
        this.camera.position.lerp(idealPosition, 0.1);
        
        // Look at player
        const lookAtPosition = this.mesh.position.clone().add(idealLookat);
        this.camera.lookAt(lookAtPosition);
    }

    updateStamina(dt) {
        if (this.isRunning) {
            this.stamina = Math.max(0, this.stamina - 20 * dt);
            if (this.stamina === 0) {
                this.isRunning = false;
            }
        } else {
            this.stamina = Math.min(100, this.stamina + 10 * dt);
        }
    }

    collectItem(item) {
        this.inventory.push(item);
        this.emit('collect', item);
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.emit('damage', amount);
        
        // Visual feedback
        this.bodyParts.body.material.emissive = new THREE.Color(0xff0000);
        this.bodyParts.body.material.emissiveIntensity = 0.5;
        
        setTimeout(() => {
            this.bodyParts.body.material.emissiveIntensity = 0;
        }, 200);
        
        if (this.health <= 0) {
            this.emit('death');
        }
    }

    heal(amount) {
        this.health = Math.min(100, this.health + amount);
        this.emit('heal', amount);
    }

    celebrate() {
        // Victory animation
        this.currentAnimation = 'idle';
        
        // Jump
        this.velocity.y = this.jumpForce * 0.7;
        
        // Spin
        const spinDuration = 2000;
        const startRotation = this.mesh.rotation.y;
        const startTime = Date.now();
        
        const spin = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            
            this.mesh.rotation.y = startRotation + progress * Math.PI * 4;
            
            if (progress < 1) {
                requestAnimationFrame(spin);
            }
        };
        
        spin();
        
        this.emit('celebrate');
    }

    reset() {
        this.health = 100;
        this.stamina = 100;
        this.inventory = [];
        this.velocity.set(0, 0, 0);
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.set(0, 0, 0);
        this.currentAnimation = 'idle';
        this.isGrounded = true;
        this.isRunning = false;
    }

    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            
            this.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }
}