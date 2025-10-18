export class PhysicsSystem {
    constructor() {
        this.gravity = new THREE.Vector3(0, -9.81, 0);
        this.bodies = [];
        this.colliders = [];
        this.raycaster = new THREE.Raycaster();
    }

    init(scene) {
        this.scene = scene;
    }

    addBody(object, options = {}) {
        const body = {
            object: object,
            velocity: options.velocity || new THREE.Vector3(),
            acceleration: options.acceleration || new THREE.Vector3(),
            mass: options.mass || 1,
            friction: options.friction || 0.98,
            restitution: options.restitution || 0.5,
            isStatic: options.isStatic || false,
            collider: options.collider || 'box'
        };
        
        this.bodies.push(body);
        return body;
    }

    addCollider(object, type = 'box') {
        const collider = {
            object: object,
            type: type,
            bounds: this.calculateBounds(object, type)
        };
        
        this.colliders.push(collider);
        return collider;
    }

    calculateBounds(object, type) {
        const bounds = new THREE.Box3().setFromObject(object);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        
        switch (type) {
            case 'sphere':
                return {
                    radius: Math.max(size.x, size.y, size.z) / 2,
                    center: center
                };
            case 'box':
            default:
                return {
                    min: bounds.min,
                    max: bounds.max,
                    size: size,
                    center: center
                };
        }
    }

    update(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds
        
        this.bodies.forEach(body => {
            if (body.isStatic) return;
            
            // Apply gravity
            body.acceleration.add(
                this.gravity.clone().multiplyScalar(body.mass)
            );
            
            // Update velocity
            body.velocity.add(
                body.acceleration.clone().multiplyScalar(dt)
            );
            
            // Apply friction
            body.velocity.multiplyScalar(body.friction);
            
            // Update position
            body.object.position.add(
                body.velocity.clone().multiplyScalar(dt)
            );
            
            // Reset acceleration
            body.acceleration.set(0, 0, 0);
            
            // Check collisions
            this.checkCollisions(body);
        });
    }

    checkCollisions(body) {
        this.colliders.forEach(collider => {
            if (collider.object === body.object) return;
            
            if (this.detectCollision(body, collider)) {
                this.resolveCollision(body, collider);
            }
        });
    }

    detectCollision(body, collider) {
        const bodyBounds = this.calculateBounds(body.object, body.collider);
        const colliderBounds = collider.bounds;
        
        if (body.collider === 'sphere' && collider.type === 'sphere') {
            // Sphere-sphere collision
            const distance = bodyBounds.center.distanceTo(colliderBounds.center);
            return distance < (bodyBounds.radius + colliderBounds.radius);
        } else if (body.collider === 'box' && collider.type === 'box') {
            // Box-box collision (AABB)
            return bodyBounds.min.x <= colliderBounds.max.x &&
                   bodyBounds.max.x >= colliderBounds.min.x &&
                   bodyBounds.min.y <= colliderBounds.max.y &&
                   bodyBounds.max.y >= colliderBounds.min.y &&
                   bodyBounds.min.z <= colliderBounds.max.z &&
                   bodyBounds.max.z >= colliderBounds.min.z;
        } else {
            // Mixed collision (simplified)
            return this.detectMixedCollision(bodyBounds, colliderBounds);
        }
    }

    detectMixedCollision(bounds1, bounds2) {
        // Simplified mixed collision detection
        const distance = bounds1.center.distanceTo(bounds2.center);
        const maxDistance = Math.max(
            bounds1.radius || bounds1.size.length() / 2,
            bounds2.radius || bounds2.size.length() / 2
        );
        return distance < maxDistance;
    }

    resolveCollision(body, collider) {
        const bodyBounds = this.calculateBounds(body.object, body.collider);
        const colliderBounds = collider.bounds;
        
        // Calculate collision normal
        const normal = bodyBounds.center.clone()
            .sub(colliderBounds.center)
            .normalize();
        
        // Reflect velocity
        const velocityDotNormal = body.velocity.dot(normal);
        body.velocity.sub(
            normal.clone().multiplyScalar(2 * velocityDotNormal)
        );
        
        // Apply restitution
        body.velocity.multiplyScalar(body.restitution);
        
        // Separate objects
        const overlap = this.calculateOverlap(bodyBounds, colliderBounds);
        body.object.position.add(normal.multiplyScalar(overlap));
    }

    calculateOverlap(bounds1, bounds2) {
        // Simplified overlap calculation
        const distance = bounds1.center.distanceTo(bounds2.center);
        const minDistance = (bounds1.radius || bounds1.size.length() / 2) +
                          (bounds2.radius || bounds2.size.length() / 2);
        return Math.max(0, minDistance - distance);
    }

    checkWallCollisions(player, walls) {
        const playerPos = player.mesh.position;
        const playerRadius = 0.5;
        
        walls.forEach(wall => {
            const wallBounds = new THREE.Box3().setFromObject(wall);
            
            // Check if player is colliding with wall
            const closestPoint = wallBounds.clampPoint(
                playerPos,
                new THREE.Vector3()
            );
            
            const distance = playerPos.distanceTo(closestPoint);
            
            if (distance < playerRadius) {
                // Push player away from wall
                const pushDirection = playerPos.clone()
                    .sub(closestPoint)
                    .normalize();
                
                const pushDistance = playerRadius - distance;
                playerPos.add(pushDirection.multiplyScalar(pushDistance));
            }
        });
    }

    raycast(origin, direction, maxDistance = 100) {
        this.raycaster.set(origin, direction);
        this.raycaster.far = maxDistance;
        
        const intersects = this.raycaster.intersectObjects(
            this.scene.children,
            true
        );
        
        return intersects;
    }

    checkGroundCollision(object, groundY = 0) {
        const objectBottom = object.position.y - 1; // Assuming height of 2
        
        if (objectBottom <= groundY) {
            object.position.y = groundY + 1;
            return true;
        }
        
        return false;
    }

    applyForce(body, force) {
        if (body && !body.isStatic) {
            body.acceleration.add(
                force.clone().divideScalar(body.mass)
            );
        }
    }

    applyImpulse(body, impulse) {
        if (body && !body.isStatic) {
            body.velocity.add(
                impulse.clone().divideScalar(body.mass)
            );
        }
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    removeCollider(collider) {
        const index = this.colliders.indexOf(collider);
        if (index > -1) {
            this.colliders.splice(index, 1);
        }
    }

    clear() {
        this.bodies = [];
        this.colliders = [];
    }
}