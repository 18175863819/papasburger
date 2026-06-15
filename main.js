// 1. 注册平滑传送组件 (必须放在最前面)
AFRAME.registerComponent("smooth-teleport", {
    schema: { target: { type: "vec3" } },
    init: function () {
        this.el.addEventListener("click", () => {
            var data = this.data;
            var rig = document.querySelector("#rig");
            
            // 移除可能正在运行的动画，防止冲突
            rig.removeAttribute("animation");
            
            // 给 rig 添加位移动画
            rig.setAttribute("animation", {
                property: "position",
                to: `${data.target.x} ${data.target.y} ${data.target.z}`,
                dur: 1200,
                easing: "easeInOutQuad"
            });
        });
    }
});

// 2. 原有的触屏/长按移动组件
AFRAME.registerComponent('touch-to-move', {
    schema: {
        speed: { type: 'number', default: 0.05 }
    },
    init: function () {
        this.isMoving = false;
        this.direction = new THREE.Vector3();
        
        window.addEventListener('touchstart', () => { this.isMoving = true; });
        window.addEventListener('touchend', () => { this.isMoving = false; });
        window.addEventListener('mousedown', () => { this.isMoving = true; });
        window.addEventListener('mouseup', () => { this.isMoving = false; });
    },
    tick: function () {
        if (!this.isMoving) return;
        
        const rig = this.el;
        const camera = document.getElementById('camera');
        if (!camera) return;

        camera.object3D.getWorldDirection(this.direction);
        this.direction.y = 0; 
        this.direction.normalize();

        const currentPos = rig.getAttribute('position');
        const newPos = {
            x: currentPos.x - this.direction.x * this.data.speed,
            y: currentPos.y,
            z: currentPos.z - this.direction.z * this.data.speed
        };
        
        rig.setAttribute('position', newPos);
    }
});

// 3. 原有的边界碰撞控制
document.addEventListener('DOMContentLoaded', () => {
    const rig = document.getElementById('rig');
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

        if (outOfBounds) {
            rig.setAttribute('position', { x: targetX, y: pos.y, z: targetZ });
        }
        
        requestAnimationFrame(enforceBounds);
    }
    enforceBounds();
});