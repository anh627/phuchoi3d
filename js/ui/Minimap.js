export class Minimap {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.canvas = null;
        this.ctx = null;
        this.isVisible = false;
        
        this.mapSize = 200;
        this.worldSize = 60;
        this.scale = this.mapSize / this.worldSize;
        
        this.colors = {
            background: 'rgba(0, 0, 0, 0.7)',
            walls: '#666666',
            floor: '#333333',
            player: '#00ff00',
            playerDirection: '#00ff00',
            items: '#ffff00',
            objectives: '#ff0000',
            shelves: '#8B7355',
            checkout: '#4169E1'
        };
    }

    init() {
        this.canvas = document.getElementById('minimapCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = this.mapSize;
            this.canvas.height = this.mapSize;
        }
    }

    show() {
        const container = document.querySelector('.minimap-container');
        if (container) {
            container.style.display = 'block';
            this.isVisible = true;
        }
    }

    hide() {
        const container = document.querySelector('.minimap-container');
        if (container) {
            container.style.display = 'none';
            this.isVisible = false;
        }
    }

    update() {
        if (!this.isVisible || !this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.mapSize, this.mapSize);
        
        // Draw background
        this.drawBackground();
        
        // Draw environment
        this.drawWalls();
        this.drawShelves();
        this.drawCheckout();
        
        // Draw items
        this.drawItems();
        
        // Draw player
        this.drawPlayer();
        
        // Draw border
        this.drawBorder();
    }

    drawBackground() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.mapSize, this.mapSize);
        
        // Grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= 10; i++) {
            const pos = (i / 10) * this.mapSize;
            
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.mapSize);
            this.ctx.stroke();
            
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.mapSize, pos);
            this.ctx.stroke();
        }
    }

    drawWalls() {
        this.ctx.strokeStyle = this.colors.walls;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(5, 5, this.mapSize - 10, this.mapSize - 10);
        
        // Draw entrance
        this.ctx.strokeStyle = this.colors.walls;
        this.ctx.lineWidth = 2;
        
        // Left side of entrance
        this.ctx.beginPath();
        this.ctx.moveTo(5, 5);
        this.ctx.lineTo(this.mapSize/2 - 20, 5);
        this.ctx.stroke();
        
        // Right side of entrance
        this.ctx.beginPath();
        this.ctx.moveTo(this.mapSize/2 + 20, 5);
        this.ctx.lineTo(this.mapSize - 5, 5);
        this.ctx.stroke();
    }

    drawShelves() {
        this.ctx.fillStyle = this.colors.shelves;
        
        // Draw shelf positions
        const shelfPositions = this.getShelfPositions();
        shelfPositions.forEach(pos => {
            const x = this.worldToMapX(pos.x);
            const y = this.worldToMapY(pos.z);
            const width = 8 * this.scale;
            const height = 2 * this.scale;
            
            this.ctx.fillRect(x - width/2, y - height/2, width, height);
        });
    }

    drawCheckout() {
        this.ctx.fillStyle = this.colors.checkout;
        
        const checkoutX = this.worldToMapX(0);
        const checkoutY = this.worldToMapY(-20);
        const width = 4 * this.scale;
        const height = 8 * this.scale;
        
        this.ctx.fillRect(checkoutX - width/2, checkoutY - height/2, width, height);
        
        // Draw checkout icon
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('💰', checkoutX, checkoutY);
    }

    drawItems() {
        this.ctx.fillStyle = this.colors.items;
        
        // Get items from scene
        const items = this.getSceneItems();
        items.forEach(item => {
            if (item.userData && !item.userData.collected) {
                const x = this.worldToMapX(item.position.x);
                const y = this.worldToMapY(item.position.z);
                
                // Draw item as small circle
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Pulse effect for mission items
                if (item.userData.isMissionItem) {
                    this.ctx.strokeStyle = this.colors.objectives;
                    this.ctx.lineWidth = 1;
                    const pulseRadius = 3 + Math.sin(Date.now() * 0.005) * 2;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
            }
        });
    }

    drawPlayer() {
        if (!this.player || !this.player.mesh) return;
        
        const x = this.worldToMapX(this.player.mesh.position.x);
        const y = this.worldToMapY(this.player.mesh.position.z);
        
        // Player circle
        this.ctx.fillStyle = this.colors.player;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Player direction indicator
        const dirLength = 10;
        const angle = this.player.mesh.rotation.y;
        const dirX = x + Math.sin(angle) * dirLength;
        const dirY = y - Math.cos(angle) * dirLength;
        
        this.ctx.strokeStyle = this.colors.playerDirection;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(dirX, dirY);
        this.ctx.stroke();
        
        // View cone
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.arc(x, y, 20, angle - Math.PI/4, angle + Math.PI/4);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawBorder() {
        // Outer border
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.mapSize, this.mapSize);
        
        // Corner decorations
        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        const cornerSize = 10;
        
        // Top-left
        this.ctx.beginPath();
        this.ctx.moveTo(0, cornerSize);
        this.ctx.lineTo(0, 0);
        this.ctx.lineTo(cornerSize, 0);
        this.ctx.stroke();
        
        // Top-right
        this.ctx.beginPath();
        this.ctx.moveTo(this.mapSize - cornerSize, 0);
        this.ctx.lineTo(this.mapSize, 0);
        this.ctx.lineTo(this.mapSize, cornerSize);
        this.ctx.stroke();
        
        // Bottom-left
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.mapSize - cornerSize);
        this.ctx.lineTo(0, this.mapSize);
        this.ctx.lineTo(cornerSize, this.mapSize);
        this.ctx.stroke();
        
        // Bottom-right
        this.ctx.beginPath();
        this.ctx.moveTo(this.mapSize - cornerSize, this.mapSize);
        this.ctx.lineTo(this.mapSize, this.mapSize);
        this.ctx.lineTo(this.mapSize, this.mapSize - cornerSize);
        this.ctx.stroke();
    }

    worldToMapX(worldX) {
        return (worldX + this.worldSize/2) * this.scale;
    }

    worldToMapY(worldZ) {
        return (worldZ + this.worldSize/2) * this.scale;
    }

    getShelfPositions() {
        // Return shelf positions based on environment layout
        const positions = [];
        const rows = 4;
        const cols = 5;
        const spacing = 12;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                positions.push({
                    x: -20 + col * spacing,
                    z: -15 + row * spacing
                });
            }
        }
        
        return positions;
    }

    getSceneItems() {
        // Get all collectible items from scene
        const items = [];
        
        this.scene.traverse((child) => {
            if (child.userData && child.userData.type === 'missionItem') {
                items.push(child);
            }
        });
        
        return items;
    }

    onResize() {
        // Handle responsive adjustments if needed
    }

    dispose() {
        this.canvas = null;
        this.ctx = null;
    }
}