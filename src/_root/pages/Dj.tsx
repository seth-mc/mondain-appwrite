import { useState, useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { CubeLoader, PlayerComponent } from  '@/components/shared'

/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { useGLTF, useAnimations } from '@react-three/drei'

export function Model() {
  const group = useRef<THREE.Group | null>(null);
  const { nodes, materials, animations } = useGLTF('/assets/dj.glb')
  const { actions } = useAnimations(animations, group)
  useEffect(() => {
    if (actions.ArmatureAction) {
      actions.ArmatureAction.play();
    }
    if (actions.vinylAction) {
      actions.vinylAction.play()
    }

  })
  return (
    <group ref={group} scale= {0.3} dispose={null}>
      <group name="Scene">
        <group name="Armature" position={[-0.01, -1.18, 0.03]} rotation={[0, 0, -0.26]} scale={[1, 2.09, 1.95]}>
          <primitive object={nodes.upperarml} />
          <primitive object={nodes.upperarmr} />
          <primitive object={nodes.upperlegr} />
          <primitive object={nodes.neutral_bone} />
          <skinnedMesh name="human" geometry={(nodes.human as THREE.Mesh).geometry} material={materials.person} skeleton={(nodes.human as THREE.SkinnedMesh).skeleton} />
        </group>
        <mesh name="player" geometry={(nodes.player as THREE.Mesh).geometry} material={materials.player} position={[2.01, -2.55, -0.06]} />
        <mesh name="vinyl" geometry={(nodes.vinyl as THREE.Mesh).geometry} material={materials.vinyl} position={[1.99, -1.45, -0.06]} scale={[0.81, 0.01, 0.81]} />
      </group>
    </group>
  )
}


// Hides elements in div when the element is not actively clicked
const useComponentVisible = (initialIsVisible: boolean) => {
    const [isComponentVisible, setIsComponentVisible] = useState(initialIsVisible);
    const ref = useRef(null);

    const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && (ref.current as HTMLElement).contains(event.target as Node)) {
        setIsComponentVisible(false);
      }
    };

    useEffect(() => {
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }, []);

  return { ref, isComponentVisible, setIsComponentVisible };
}


// Heading component of the website
const HeadingBlock = () => {
  const {
    ref,
    isComponentVisible,
    setIsComponentVisible
  } = useComponentVisible(false);

  return (
    <div>
      <ul className="d">
        
        <div ref={ref} onClick={() => setIsComponentVisible(true)}>{isComponentVisible && <DialogBox />}</div> 
        
      </ul>
    </div>

  )
}

//DialogBox that appears when the running man is clicked
const DialogBox = () => {

  const colors  = {
    "Light": ['#fff', '#000', '#fff', '#C7D6F1'],
    "Dark": ['#000', '#fff', '#000', '#C7D6F1'],
    "Blue": ['#8CCAE1', '#FCFFF2', '#9B9AA1', '#1A0C84'],
    "Green": ['#A1DFB4', '#1C6C34', '#fff', '#f85823']
  };
  const variables = ['--primary', '--secondary', '--detail', '--detail2'];


  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).textContent as keyof typeof colors;

    for (let i=0; i < colors[target].length; i++) {
      document.documentElement.style.setProperty(variables[i],colors[target][i]);
    } 
  }
  
  return (
    <div className="dialogbox">
        <div className="body">
          <div className="message">
            <div className="dropline" onClick={handleClick}>Dark</div>
            <div className="dropline" onClick={handleClick}>Light</div>
            <div className="dropline" onClick={handleClick}>Blue</div>
            <div className="dropline" onClick={handleClick}>Green</div>
          </div>
        </div>
      </div>
  )
}

const Scene = () => {
  const scene = useRef<THREE.Group>(null);
  useFrame(() => {
    if (scene.current) {
      scene.current.rotation.y += 0.001;
      scene.current.rotation.x += 0.0001;
    }
  });
  return (
    <group ref={scene}>
      <directionalLight intensity={0.5} />
        <ambientLight intensity={0.1} />
        <Suspense fallback={null}>
        <Model />
        </Suspense>
    </group>
  );
};

// APP
const Dj = () => {


  const [loading, setLoading] = useState(false); 
  const [cube, setCube] = useState("");

  useEffect(() => {
    setLoading(true);
    const interval = setInterval(() => {
      setCube(CubeLoader());
    }, 3);

    

    setTimeout(() => {
      setLoading(false);   
     }, 3000)

     useGLTF.preload('/assets/dj.glb')

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
       {loading ? (
        <div className="loading">
        <div className="container d">
          <pre className="cube">{cube}</pre>
        </div>
      </div>
    ) : (
      <div className="w-full">
      <div className="heading">
      <HeadingBlock></HeadingBlock>
      </div>
      <div id="root" style={{ height: "100vh" }}> 
      <Canvas camera={{ position: [0, 2, -5] }}>
       <OrbitControls enableZoom={false}/>
        <PerspectiveCamera makeDefault position={[0, 1, 1]} />
        <directionalLight intensity={0.5} />
        <Scene />
    </Canvas>
    </div>
    </div>
      )}
      <PlayerComponent></PlayerComponent>
      <iframe title="frame01" className="sc-widget" frameBorder="no" allow="autoplay"  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1822931166&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>
    </div>
  );
}


export default Dj