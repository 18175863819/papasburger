// 1. 注册自定义触屏/长按移动组件
AFRAME.registerComponent('touch-to-move', {
    schema: {
        speed: { type: 'number', default: 0.05 } // 调整移动速度
    },
    init: function () {
        this.isMoving = false;
        this.direction = new THREE.Vector3();
        
        // 监听触摸事件 (适配移动端)
        window.addEventListener('touchstart', () => { this.isMoving = true; });
        window.addEventListener('touchend', () => { this.isMoving = false; });
        
        // 监听鼠标长按事件 (适配电脑端测试或某些手柄的点击)
        window.addEventListener('mousedown', () => { this.isMoving = true; });
        window.addEventListener('mouseup', () => { this.isMoving = false; });
    },
    tick: function () {
        if (!this.isMoving) return;
        
        const rig = this.el;
        const camera = document.getElementById('camera');
        if (!camera) return;

        // 获取相机当前的世界朝向（你眼睛看的方向）
        camera.object3D.getWorldDirection(this.direction);
        
        // 将 Y 轴归零，确保玩家只能在水平地面上移动，不会飞天或遁地
        this.direction.y = 0; 
        this.direction.normalize();

        // 计算新位置（注意：getWorldDirection 得到的是相机看向的前方向量，A-Frame 中前方是 -Z 轴，所以要减去）
        const currentPos = rig.getAttribute('position');
        const newPos = {
            x: currentPos.x - this.direction.x * this.data.speed,
            y: currentPos.y,
            z: currentPos.z - this.direction.z * this.data.speed
        };
        
        rig.setAttribute('position', newPos);
    }
});

// 2. 原有的边界碰撞控制
document.addEventListener('DOMContentLoaded', () => {
    const rig = document.getElementById('rig');
    
    // 根据你的模型调整实际店铺的物理边界
    const BOUNDS = { minX: -6, maxX: 6, minZ: -8, maxZ: 8 };

    function enforceBounds() {
        if (!rig) return;
        const pos = rig.getAttribute('position');
        
        let targetX = pos.x;
        let targetZ = pos.z;
        let outOfBounds = false;

        if (pos.x < BOUNDS.minX) { targetX = BOUNDS.minX; outOfBounds = true; }
        if (pos.x > BOUNDS.maxX) { targetX = BOUNDS.maxX; outOfBounds = true; }
        if (pos.z < BOUNDS.minZ) { targetZ = BOUNDS.minZ; outOfBounds = true; }
        if (pos.z > BOUNDS.maxZ) { targetZ = BOUNDS.maxZ; outOfBounds = true; }

        // 只有出界时才强制修正
        if (outOfBounds) {
            rig.setAttribute('position', { x: targetX, y: pos.y, z: targetZ });
        }
        
        requestAnimationFrame(enforceBounds);
    }
    enforceBounds();
});