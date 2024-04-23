import * as THREE from "three";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { useEffect, useState} from "react";
import { MaterialXLoader } from 'three/examples/jsm/loaders/MaterialXLoader.js';
import {Canvas} from  'react-three-fiber';
import {OrbitControls} from '@react-three/drei'


interface ModelProps {
  selectedFile: string;
  materialFile: string;
}

function Model({ selectedFile, materialFile }: ModelProps) {
  // const obj = useLoader(OBJLoader, selectedFile);

  const [obj, setObj] = useState<THREE.Group<THREE.Object3DEventMap> | null>(null)

  useEffect(() => {
    // Load the OBJ file
    const objLoader = new OBJLoader();
    // objLoader.load(selectedFile, (object) => {
      setObj(objLoader.parse(selectedFile));

      // // Load the MaterialX file if the OBJ has been successfully loaded
      // const matLoader = new MaterialXLoader();
      // matLoader.load(materialFile, (material) => {
      //   // Apply the loaded MaterialX materials to the object
      //   object.traverse((child) => {
      //     if (child instanceof THREE.Mesh) {
      //       child.material = material;
      //     }
      //   });
      // });
    //});
  }, [selectedFile, materialFile]);

  return obj ? <primitive object={obj} /> : null;
}

function MyThree({ selectedFile, materialFile } : { selectedFile: string, materialFile: string }) {
  // const refContainer = useRef<HTMLDivElement>(null!);

  // useEffect(() => {
  //   const scene = new THREE.Scene();
  //   const camera = new THREE.PerspectiveCamera(
  //     75,
  //     window.innerWidth / window.innerHeight,
  //     0.1,
  //     1000
  //   );

  //   const renderer = new THREE.WebGLRenderer();
  //   renderer.setSize(window.innerWidth / 3, window.innerHeight / 3);
  //   refContainer.current && refContainer.current.appendChild(renderer.domElement);

  //   const light = new THREE.PointLight(0xffffff, 1000)
  //   light.position.set(2.5, 7.5, 15)
  //   scene.add(light)

  //   const controls = new OrbitControls(camera, renderer.domElement);
  //   controls.addEventListener('change', render);
  //   controls.minDistance = 1;
  //   controls.maxDistance = 100;
  //   controls.enablePan = true;

  //   const loader = new OBJLoader();

  //   try {
  //     // Assume selectedFile is already the content of the OBJ file as a string
  //     const object = loader.parse(selectedFile);
  //     scene.add(object);
  //     object.position.set(0, 0, 0);
  //   } catch (error) {
  //     console.error('Error parsing OBJ data:', error);
  //   }

  //   camera.position.z = 5;

  //   function render() {
  //     renderer.render(scene, camera);
  //   }

  //   render();


  //   return () => {
  //     renderer.domElement.remove();
  //   };
  // }, [selectedFile]); // React to changes in selectedFile

  // return <div ref={refContainer}>
  // </div>;

  return (
    <Canvas className="aspect-square bg-base-300 rounded-box">
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} />
        <Model selectedFile={selectedFile} materialFile={materialFile} />
      <OrbitControls />
      {/* <ContactShadows opacity={1} scale={80} blur={1} far={10} resolution={256} color="#000000" /> */}
    </Canvas>
  )
}

export default MyThree;
