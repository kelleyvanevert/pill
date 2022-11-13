import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { OrbitControls } from "three/examples/jsm/controls/Trans";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Vector2 } from "three";

const hdrEquirect = new RGBELoader().load("./rathaus_4k.hdr", () => {
  hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
});

const gltfLoader = new GLTFLoader();

const gui = new GUI();

// init

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camera.position.z = 20;

const scene = new THREE.Scene();

const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

let actualWrench: THREE.Mesh;

const wrench = new THREE.Group();
scene.add(wrench);

gltfLoader.load(
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
    console.log(size, center);

    // scene.add(mesh);

    // camera.position.set(0, 50, 100);
    camera.lookAt(gltf.scene.position); //add this line
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("An error happened");
    console.error(error);
  }
);

const cubeMap = new THREE.CubeTextureLoader().load(
  [
    "./space/hdr/crab/cube/px.png",
    "./space/hdr/crab/cube/nx.png",
    "./space/hdr/crab/cube/py.png",
    "./space/hdr/crab/cube/ny.png",
    "./space/hdr/crab/cube/pz.png",
    "./space/hdr/crab/cube/nz.png",
  ],
  () => {
    cubeMap.rotation = 2;

    // 1
    // const texture = pmremGenerator.fromCubemap(cubeMap).texture;
    // texture.mapping = THREE.EquirectangularReflectionMapping;
    // pillMaterial.envMap = texture;
    // pmremGenerator.dispose();

    // 2
    scene.background = cubeMap;
  }
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio ?? 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);

const pmremGenerator = new THREE.PMREMGenerator(renderer);

const pillGeometry = new THREE.CapsuleGeometry(3, 3, 32, 32);

const pillMaterial = new THREE.MeshPhysicalMaterial({
  envMap: hdrEquirect,
  transparent: true,
  roughness: 0,
  metalness: 0,
  clearcoat: 0.3,
  clearcoatRoughness: 0.25,
});

const pill = new THREE.Mesh(pillGeometry, pillMaterial);
scene.add(pill);

const pillFolder = gui.addFolder("Pill");

pillFolder.add(pill, "visible");

pillMaterial.transmission = 1;
pillFolder.add(pillMaterial, "transmission", 0.5, 1.5);

pillMaterial.ior = 1.2;
pillFolder.add(pillMaterial, "ior", 0, 2);

pillMaterial.reflectivity = 0.33;
pillFolder.add(pillMaterial, "reflectivity", 0, 2);

pillMaterial.thickness = 2.66;
pillFolder.add(pillMaterial, "thickness", 0, 5);

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

cube.visible = false;
cubeFolder.add(cube, "visible");

cube.rotation.x = 2.79;
cubeFolder.add(cube.rotation, "x", 0, Math.PI);

cube.rotation.y = 0.24;
cubeFolder.add(cube.rotation, "y", 0, Math.PI);

cube.rotation.z = 1.2;
cubeFolder.add(cube.rotation, "z", 0, Math.PI);

const wrenchFolder = gui.addFolder("Wrench");

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

// animation

renderer.setAnimationLoop((time) => {
  controls.update();
  renderer.render(scene, camera);
});
