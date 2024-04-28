import * as THREE from 'three';

export default class ViewGL{
    constructor(canvasRef) {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasRef,
            antialias: false,
        });

        // Create meshes, materials, etc.
        this.scene.add(myNewMesh);

        this.update();
    }

    // ******************* PUBLIC EVENTS ******************* //
    updateValue(value) {
      // Whatever you need to do with React props
    }

    onMouseMove() {
      // Mouse moves
    }

    onWindowResize(vpW, vpH) {
        this.renderer.setSize(vpW, vpH);
    }

    // ******************* RENDER LOOP ******************* //
    update(t) {
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.update.bind(this));
    }
}