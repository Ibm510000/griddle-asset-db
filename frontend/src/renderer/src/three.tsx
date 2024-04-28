import * as THREE from "three";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader.js';
import { useEffect, useState} from "react";
import { MaterialXLoader } from 'three/examples/jsm/loaders/MaterialXLoader.js';
import {Canvas} from  'react-three-fiber';
import {OrbitControls} from '@react-three/drei'

interface ModelProps {
  selectedFile: Buffer;
  materialFile: string;
}

function Model({ selectedFile, materialFile }: ModelProps) {
  // const obj = useLoader(OBJLoader, selectedFile);

  const [obj, setObj] = useState<THREE.Group<THREE.Object3DEventMap> | null>(null)

  useEffect(() => {
    // Load the OBJ file
    const objLoader = new OBJLoader();
    const usdLoader = new USDZLoader();

    
    // objLoader.load(selectedFile, (object) => {
      
      if (selectedFile !== undefined) {
        setObj(usdLoader.parse(selectedFile));
      } else {
        console.log(`empty`);
      }
      

      // objLoader.load('../assets/carrot.usdz', (model) => {
      //   setObj(model);
      // })

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

function MyThree({ selectedFile, materialFile } : { selectedFile: Buffer, materialFile: string }) {


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
