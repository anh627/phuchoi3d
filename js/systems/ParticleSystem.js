export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particlePools = new Map();
        this.maxParticles = 1000;
        
        this.init();
    }

    init() {
        // Create particle pools for different effects
        this.createPool('collect', 50, {
            geometry: new THREE.SphereGeometry(0.1, 8, 8),
            material: new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 1
            })
        });
        
        this.createPool('explosion', 100, {
            geometry: new THREE.BoxGeometry(0.2, 0.2, 0.2),
            material: new THREE.MeshBasicMaterial({
                color: 0xff6b6b,
                transparent: true,
                opacity: 1
            })
        });
        
        this.createPool('sparkle', 30, {
            geometry: new THREE.TetrahedronGeometry(0.15, 0),
            material: new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 1
            })
        });
    }

    createPool(name, size, config) {
        const pool = {
            available: [],
            active: [],
            config: config
        };
        
        // Pre-create particles
        for (let i = 0; i < size; i++) {
            const particle = new THREE.Mesh(
                config.geometry.clone(),
                config.material.clone()
            );
            particle.visible = false;
            this.scene.add(particle);
            pool.available.push(particle);
        }
        
        this.particlePools.set(name, pool);
    }

    getParticle(poolName) {
        const pool = this.particlePools.get(poolName);
        if (!pool) return null;
        
        if (pool.available.length > 0) {
            const particle = pool.available.pop();
            pool.active.push(particle);
            particle.visible = true;
            return particle;
        }
        
        // If no particles available, reuse the oldest active one
        if (pool.active.length > 0) {
            const particle = pool.active.shift();
            pool.active.push(particle);
            return particle;
        }
        
        return null;
    }

    returnParticle(poolName, particle) {
        const pool = this.particlePools.get(poolName);
        if (!pool) return;
        
        const index = pool.active.indexOf(particle);
        if (index !== -1) {
            pool.active.splice(index, 1);
            pool.available.push(particle);
            particle.visible = false;
        }
    }

    createCollectEffect(position) {
        const particleCount = 20;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle('collect');
            if (!particle) continue;
            
            particle.position.copy(position);
            particle.scale.set(1, 1, 1);
            particle.material.opacity = 1;
            
            // Random velocity
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.5 + 0.2,
                (Math.random() - 0.5) * 0.3
            );
            
            particles.push({
                mesh: particle,
                velocity: velocity,
                life: 1.0,
                decay: 0.02,
                poolName: 'collect'
            });
        }
        
        this.particles.push(...particles);
    }

    createExplosionEffect(position, color = 0xff6b6b) {
        const particleCount = 30;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle('explosion');
            if (!particle) continue;
            
            particle.position.copy(position);
            particle.material.color.setHex(color);
            particle.material.opacity = 1;
            
            // Spherical distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = Math.random() * 0.5 + 0.3;
            
            const velocity = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.cos(phi) * speed,
                Math.sin(phi) * Math.sin(theta) * speed
            );
            
            particles.push({
                mesh: particle,
                velocity: velocity,
                life: 1.0,
                decay: 0.03,
                gravity: -0.01,
                poolName: 'explosion'
            });
        }
        
        this.particles.push(...particles);
    }

    createSparkleEffect(position) {
        const particleCount = 15;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle('sparkle');
            if (!particle) continue;
            
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
            
            particle.position.copy(position).add(offset);
            particle.material.opacity = 1;
            particle.scale.set(0.5, 0.5, 0.5);
            
            particles.push({
                mesh: particle,
                velocity: new THREE.Vector3(0, 0.02, 0),
                life: 1.0,
                decay: 0.02,
                spin: new THREE.Vector3(
                    Math.random() * 0.1,
                    Math.random() * 0.1,
                    Math.random() * 0.1
                ),
                poolName: 'sparkle',
                pulse: true
            });
        }
        
        this.particles.push(...particles);
    }

    createCelebrationEffect(position) {
        // Multiple bursts
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const burstPos = position.clone();
                burstPos.x += (Math.random() - 0.5) * 4;
                burstPos.z += (Math.random() - 0.5) * 4;
                
                const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0x6c5ce7];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                this.createExplosionEffect(burstPos, color);
                this.createSparkleEffect(burstPos);
            }, i * 200);
        }
    }

    createLevelUpEffect(position) {
        // Ring of particles expanding outward
        const particleCount = 36;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle('sparkle');
            if (!particle) continue;
            
            const angle = (i / particleCount) * Math.PI * 2;
            
            particle.position.copy(position);
            particle.material.color.setHex(0xffff00);
            particle.material.opacity = 1;
            particle.scale.set(1, 1, 1);
            
            const velocity = new THREE.Vector3(
                Math.cos(angle) * 0.3,
                0.1,
                Math.sin(angle) * 0.3
            );
            
            particles.push({
                mesh: particle,
                velocity: velocity,
                life: 1.0,
                decay: 0.015,
                scale: 1.5,
                poolName: 'sparkle'
            });
        }
        
        this.particles.push(...particles);
        
        // Add vertical beam
        this.createBeamEffect(position);
    }

    createBeamEffect(position) {
        const geometry = new THREE.CylinderGeometry(0.5, 2, 10, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.5
        });
        
        const beam = new THREE.Mesh(geometry, material);
        beam.position.copy(position);
        beam.position.y += 5;
        
        this.scene.add(beam);
        
        // Animate beam
        const startScale = 1;
        const endScale = 3;
        const duration = 1000;
        const startTime = Date.now();
        
        const animateBeam = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            beam.scale.x = startScale + (endScale - startScale) * progress;
            beam.scale.z = startScale + (endScale - startScale) * progress;
            beam.material.opacity = 0.5 * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animateBeam);
            } else {
                this.scene.remove(beam);
            }
        };
        
        animateBeam();
    }

    createTrailEffect(position, color = 0x4ecdc4) {
        const particle = this.getParticle('sparkle');
        if (!particle) return;
        
        particle.position.copy(position);
        particle.material.color.setHex(color);
        particle.material.opacity = 0.8;
        particle.scale.set(0.3, 0.3, 0.3);
        
        this.particles.push({
            mesh: particle,
            velocity: new THREE.Vector3(0, 0, 0),
            life: 0.5,
            decay: 0.02,
            scale: 0.95,
            poolName: 'sparkle'
        });
    }

    update(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            if (particle.velocity) {
                particle.mesh.position.add(
                    particle.velocity.clone().multiplyScalar(dt)
                );
                
                // Apply gravity
                if (particle.gravity) {
                    particle.velocity.y += particle.gravity;
                }
            }
            
            // Update rotation
            if (particle.spin) {
                particle.mesh.rotation.x += particle.spin.x;
                particle.mesh.rotation.y += particle.spin.y;
                particle.mesh.rotation.z += particle.spin.z;
            }
            
            // Update scale
            if (particle.scale && particle.scale !== 1) {
                particle.mesh.scale.multiplyScalar(particle.scale);
            }
            
            // Pulse effect
            if (particle.pulse) {
                const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
                particle.mesh.scale.set(pulse, pulse, pulse);
            }
            
            // Update life
            particle.life -= particle.decay;
            particle.mesh.material.opacity = particle.life;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.returnParticle(particle.poolName, particle.mesh);
                this.particles.splice(i, 1);
            }
        }
    }

    clear() {
        // Return all particles to pools
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            this.returnParticle(particle.poolName, particle.mesh);
        }
        
        this.particles = [];
    }
}