import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const hdrEquirect = new RGBELoader().load("./rathaus_4k.hdr", () => {
  hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
});

const gltfLoader = new GLTFLoader();

const gui = new GUI();

const config = {
  rotationX: 1.71,
  rotationY: 1.25,
  rotationZ: 1.86,
  boxRotX: 2.79,
  boxRotY: 0.36,
  boxRotZ: 0.7,
  posX: 0.03,
  posY: -0.2,
  posZ: 1.41,
  showPill: true,
  pillThickness: 2.88,
};

gui.add(config, "rotationX", 0, Math.PI);
gui.add(config, "rotationY", 0, Math.PI);
gui.add(config, "rotationZ", 0, Math.PI);
gui.add(config, "boxRotX", 0, Math.PI);
gui.add(config, "boxRotY", 0, Math.PI);
gui.add(config, "boxRotZ", 0, Math.PI);
gui.add(config, "posX", -2, 2);
gui.add(config, "posY", -2, 2);
gui.add(config, "posZ", -2, 2);
gui.add(config, "pillThickness", 0, 5, 0.01);
gui.add(config, "showPill");

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

const pillGeometry = new THREE.CapsuleGeometry(3, 3, 32, 32);
const pillMaterial = new THREE.MeshPhysicalMaterial({
  envMap: hdrEquirect,
  roughness: 0,
  transmission: 1,
  // thickness: 2
});
const pill = new THREE.Mesh(pillGeometry, pillMaterial);
// mesh.position.set(0, 0, 0);
scene.add(pill);

let actualWrench: THREE.Mesh;
let wrench: THREE.Group;

gltfLoader.load(
  "./combination_wrench_cleandirty.glb",
  (gltf) => {
    let addScene = gltf.scene ?? gltf.scenes[0];
    let mesh = addScene.children[0].children[0].children[2]
      .children[0] as THREE.Mesh;

    actualWrench = new THREE.Mesh(mesh.geometry, cubeMaterial);
    actualWrench.scale.set(4, 4, 4);
    actualWrench.position.set(0, 0, 0);
    actualWrench.rotation.set(0, 0, 0.5 * Math.PI);

    wrench = new THREE.Group();
    wrench.add(actualWrench);

    // scene.add(wrench);

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

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio ?? 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// animation

renderer.setAnimationLoop((time) => {
  pill.rotation.x = config.rotationX;
  pill.rotation.x = config.rotationY;
  pill.rotation.z = config.rotationZ;

  cube.rotation.x = config.boxRotX;
  cube.rotation.x = config.boxRotY;
  cube.rotation.z = config.boxRotZ;

  if (wrench) {
    wrench.rotation.x = config.rotationX;
    wrench.rotation.x = config.rotationY;
    wrench.rotation.z = config.rotationZ;
  }

  if (actualWrench) {
    actualWrench.position.set(config.posX, config.posY, config.posZ);
  }

  controls.update();

  pillMaterial.thickness = config.pillThickness;
  pill.visible = config.showPill;

  renderer.render(scene, camera);
});
