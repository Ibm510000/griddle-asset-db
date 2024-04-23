import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useEffect, useRef } from "react";

interface ThreeProps {
  selectedFile: string;
}

function MyThree({ selectedFile } : ThreeProps) {
  const refContainer = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth / 3, window.innerHeight / 3);
    refContainer.current && refContainer.current.appendChild(renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1000)
    light.position.set(2.5, 7.5, 15)
    scene.add(light)

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controls.enablePan = true;

    const loader = new OBJLoader();

    try {
      // Assume selectedFile is already the content of the OBJ file as a string
      const object = loader.parse(selectedFile);
      scene.add(object);
      object.position.set(0, 0, 0);
    } catch (error) {
      console.error('Error parsing OBJ data:', error);
    }

    camera.position.z = 5;

    function render() {
      renderer.render(scene, camera);
    }

    render();


    return () => {
      renderer.domElement.remove();
    };
  }, [selectedFile]); // React to changes in selectedFile

  return <div ref={refContainer}>
  </div>;
}

export default MyThree;
