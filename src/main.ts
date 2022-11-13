import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { CubeTextureLoader } from "three";

const gui = new GUI();

// init

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camera.position.set(-2, 5, -14);

const cameraFolder = gui.addFolder("Camera");

cameraFolder.add(
  {
    Randomize() {
      let x = Math.random();
      let y = Math.random();
      let z = Math.random();
      const len = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      const scale = 15 / len;
      camera.position.set(x * scale, y * scale, z * scale);
    },
  },
  "Randomize"
);

(window as any).camera = camera;

const scene = new THREE.Scene();

const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

let actualWrench: THREE.Mesh;

const wrench = new THREE.Group();
scene.add(wrench);

new GLTFLoader().load(
  "./combination_wrench_cleandirty.glb",
  (gltf) => {
    let addScene = gltf.scene ?? gltf.scenes[0];
    let mesh = addScene.children[0].children[0].children[2]
      .children[0] as THREE.Mesh;

    actualWrench = new THREE.Mesh(mesh.geometry, cubeMaterial);
    actualWrench.scale.set(4, 4, 4);
    // actualWrench.position.set(0.03, -0.2, 1.41);
    actualWrench.rotation.set(0, 0, 0.5 * Math.PI);

    wrench.add(actualWrench);

    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    // scene.add(mesh);

    // camera.position.set(0, 50, 100);
    camera.lookAt(gltf.scene.position); //add this line
  },
  (xhr) => {
    // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("An error happened");
    console.error(error);
  }
);

new THREE.CubeTextureLoader().load(
  [
    "./space/hdr/crab/cube/px.png",
    "./space/hdr/crab/cube/nx.png",
    "./space/hdr/crab/cube/py.png",
    "./space/hdr/crab/cube/ny.png",
    "./space/hdr/crab/cube/pz.png",
    "./space/hdr/crab/cube/nz.png",
  ],
  (cubeMap) => {
    // 1
    // const texture = pmremGenerator.fromCubemap(cubeMap).texture;
    // texture.mapping = THREE.EquirectangularReflectionMapping;
    // pillMaterial.envMap = texture;
    // pmremGenerator.dispose();

    // 2
    scene.background = cubeMap;
  }
);

const canvas = document.querySelector("#c")!;
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
// renderer.setPixelRatio(window.devicePixelRatio ?? 1);
renderer.setClearColor(0x000000);

const pillGeometry = new THREE.CapsuleGeometry(3, 3, 32, 32);

const pillMaterial = new THREE.MeshPhysicalMaterial({
  envMap: new CubeTextureLoader().load([
    "./space/w6-sq.jpg",
    "./space/w6-sq.jpg",
    "./space/w6-sq.jpg",
    "./space/w6-sq.jpg",
    "./space/w6-sq.jpg",
    "./space/w6-sq.jpg",
  ]),
  transparent: true,
  roughness: 0,
  metalness: 0,
  clearcoat: 0.3,
  clearcoatRoughness: 0.25,
});

const pill = new THREE.Mesh(pillGeometry, pillMaterial);
scene.add(pill);

const pillFolder = gui.addFolder("Pill");
pillFolder.close();

pillFolder.add(pill, "visible");

pillMaterial.transmission = 1;
pillFolder.add(pillMaterial, "transmission", 0.5, 1.5);

pillMaterial.ior = 1.2;
pillFolder.add(pillMaterial, "ior", 0, 2);

pillMaterial.reflectivity = 0.33;
pillFolder.add(pillMaterial, "reflectivity", 0, 2);

pillMaterial.thickness = 4.06;
pillFolder.add(pillMaterial, "thickness", 0, 7);

pill.rotation.x = 2.79;
pillFolder.add(pill.rotation, "x", 0, Math.PI);

pill.rotation.y = 0.24;
pillFolder.add(pill.rotation, "y", 0, Math.PI);

pill.rotation.z = 1.2;
pillFolder.add(pill.rotation, "z", 0, Math.PI);

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const cubeFolder = gui.addFolder("Cube");
cubeFolder.close();

cube.visible = true;
cubeFolder.add(cube, "visible");

cube.rotation.x = 2.177;
cubeFolder.add(cube.rotation, "x", 0, Math.PI);

cube.rotation.y = 0.128;
cubeFolder.add(cube.rotation, "y", 0, Math.PI);

cube.rotation.z = 1055;
cubeFolder.add(cube.rotation, "z", 0, Math.PI);

const wrenchFolder = gui.addFolder("Wrench");
wrenchFolder.close();

wrench.visible = false;
wrenchFolder.add(wrench, "visible");

wrench.rotation.x = 2.79;
wrenchFolder.add(wrench.rotation, "x", 0, Math.PI);

wrench.rotation.y = 0.24;
wrenchFolder.add(wrench.rotation, "y", 0, Math.PI);

wrench.rotation.z = 1.2;
wrenchFolder.add(wrench.rotation, "z", 0, Math.PI);

wrench.position.x = 0.046;
// wrenchFolder.add(wrench.position, "x", -3, 3);

wrench.position.y = -0.318;
// wrenchFolder.add(wrench.position, "y", -3, 3);

wrench.position.z = -1.056;
// wrenchFolder.add(wrench.position, "z", -3, 3);

function resizeRendererToDisplaySize() {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = (canvas.clientWidth * pixelRatio) | 0;
  const height = (canvas.clientHeight * pixelRatio) | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

renderer.setAnimationLoop((time) => {
  if (resizeRendererToDisplaySize()) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  controls.update();
  renderer.render(scene, camera);
});
