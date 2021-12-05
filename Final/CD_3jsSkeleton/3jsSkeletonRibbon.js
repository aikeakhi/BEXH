// The Body Everywhere and Here Class 3: Kinectron in three.js with Three.Meshline ribbons
// https://github.com/lisajamhoury/The-Body-Everywhere-And-Here-2021/

// This example uses the Kinectron camera joint positioning
// in three.js with Three.Meshline to draw ribbons with hands

// line material from THREE.MeshLine spinner example
// https://github.com/spite/THREE.MeshLine/blob/master/demo/spinner.html

// Set up three.js scene and camera
let container = document.getElementById("container");
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  80,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
camera.position.z = -1000;
camera.lookAt(scene.position);

// Set up three.js renderer
let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);




// Create the orbit controller for user mouse control
let controls = new THREE.OrbitControls(camera, renderer.domElement);

// Load the texture for the lines
let loader = new THREE.TextureLoader();
let strokeTexture;
loader.load("assets/stroke.png", function (texture) {
  strokeTexture = texture;
  strokeTexture.wrapS = strokeTexture.wrapT = THREE.RepeatWrapping;
  init();
});

// Set the resolution for lines
let resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

// Create a raycaster
// https://threejs.org/docs/#api/en/core/Raycaster
// Coding Train Raycaster
// https://www.youtube.com/watch?v=TOEi6T2mtHo
let raycaster = new THREE.Raycaster();

// Objects to hold new and old point positions
let pos = {}; // old position
let nPos = {}; // new positiosn

// Variable for rotation angle
let angle = 0;

// Object to hold line meshes
let meshes = {};

// Variable for line mesh material
let material;

// How many kinect points we are using
const numJoints = 8;

// Object to order joint positions
let azureJointPos = {};

// Global array to hold joints
let joints = [];

// Create plane for Raycaster intersections
const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1000, 1000),
  new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
);
plane.material.visible = false;
scene.add(plane);

// Starts up the sketch
function init() {
  initMeshes();
  initKinectron();
  onWindowResize();
  render();
  checkTimer();

  window.addEventListener("resize", onWindowResize);
}

// Create all meshes and past and current positions for ribbons
function initMeshes() {
  for (let i = 0; i < numJoints; i++) {
    meshes[i] = prepareMesh(i);
    nPos[i] = new THREE.Vector3();
    pos[i] = new THREE.Vector3();
  }

  // Use only select joints
  // Order them how we want them in the array
  // The order is so the color gradient works correctly
  azureJointPos[0] = 7; // left wrist
  azureJointPos[1] = 8; // left hand
  azureJointPos[2] = 9; // left handtip
  azureJointPos[3] = 10; // left thumb
  azureJointPos[4] = 14; // right wrist
  azureJointPos[5] = 15; //  right hand
  azureJointPos[6] = 16; // right handtip
  azureJointPos[7] = 17; // right thumb
}

// Create material and geometry for ribbons
function prepareMesh(colorIndex) {
  // Create 600 positions
  let geo = new Float32Array(200 * 3);

  // Make them all equal 0
  for (let j = 0; j < geo.length; j += 3) {
    geo[j] = geo[j + 1] = geo[j + 2] = 0;
  }

  // Create a new meshline
  let meshLine = new MeshLine();

  // Give it the geometry
  meshLine.setGeometry(geo);

  // Get color for ribbon, use hsl color
  // Try 0-255
  const clr = map(colorIndex, 0, numJoints, 150, 200);

  // Create ribon material
  material = new MeshLineMaterial({
    useMap: true, // turn to false for no texture
    map: strokeTexture, // adds the texture from the stroke image file
    color: new THREE.Color(`hsl(${clr}, 100%, 50%)`), // sets color using hsl
    opacity: 1, // alter the alpha of the lines
    resolution: resolution, // screen resolution
    lineWidth: 25, // how thick are the lines
    depthTest: false, // must be off for blending to work // https://stackoverflow.com/questions/37647853/three-js-depthwrite-vs-depthtest-for-transparent-canvas-texture-map-on-three-p/37651610
    blending: THREE.NormalBlending, // see threejs blending modes
    transparent: true, // allows transparency
    repeat: new THREE.Vector2(1, 2),
  });

  // Create a three.js mesh to hold meshline ribbon
  // add geo and line to the mesh for later access
  let mesh = new THREE.Mesh(meshLine.geometry, material);
  mesh.geo = geo;
  mesh.g = meshLine;

  // Add it to the scene
  scene.add(mesh);

  // Return the mesh
  return mesh;
}

function initKinectron() {
const kinectron = new Kinectron("192.168.1.186");// Create kinectron with specified ip address
kinectron.setKinectType("azure");// Choose kinect type
kinectron.makeConnection();  // Connect to the server
kinectron.startTrackedBodies(getJoints); // Start the bodies feed and set a callback to use for incoming data
}

function getJoints(data) { // Runs every time we get data from the kinectron server
joints = data.skeleton.joints;   // Set global joints array to incoming data
}

function checkIntersection(id) {  // From https://github.com/spite/THREE.MeshLine/blob/master/demo/spinner.html
let tmpVector = new THREE.Vector3();   // Create a vector to hold the joint position

tmpVector.copy(nPos[id]).sub(pos[id]).multiplyScalar(0.05); // Use past position to smooth the movement
Maf.clamp(tmpVector.x, -1, 1);  // Multiplyscalar controls the smoothing.
Maf.clamp(tmpVector.y, -1, 1);
Maf.clamp(tmpVector.z, -1, 1);


pos[id].add(tmpVector);   // Add vector as current position
raycaster.setFromCamera(pos[id], camera);   // Set the raycaster to the curent position

let intersects = raycaster.intersectObject(plane);   // See if the ray from the camera into the world hits one of the meshes


if (intersects.length > 0) { // If there is an intersection
let mesh = meshes[id];
let geo = mesh.geo;
let g = mesh.g;

   
let iX = intersects[0].point.x;   // Get the intersection x position


for (let j = 0; j < geo.length; j += 3) { // Advance all of the mesh points
geo[j] = geo[j + 3] * 1.001;
geo[j + 1] = geo[j + 4] * 1.001;
geo[j + 2] = geo[j + 5] * 1.001;
}

geo[geo.length - 3] = iX * Math.cos(angle); // Create curve based on intersection and point position
geo[geo.length - 2] = intersects[0].point.y;
geo[geo.length - 1] = iX * Math.sin(angle);


g.setGeometry(geo); // Update geometry
  }
}

function checkTimer() {// Check raycaster intersections every 20 milliseconds // From // https://github.com/spite/THREE.MeshLine/blob/master/demo/spinner.html
for (let i in nPos) { // For all of the new positions
checkIntersection(i);
 }
 setTimeout(checkTimer, 20);
 }

function render() {
requestAnimationFrame(render);  // Request anim frame  // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
if (joints.length > 0) { // Update all the joint positions
for (let i = 0; i < numJoints; i++) {
const jointNo = azureJointPos[i];  // Find the corresponding joint number
nPos[i].x = (joints[jointNo].cameraX / 1000) * -1; // Azure Kinect camera positioning is in mm
nPos[i].y = (joints[jointNo].cameraY / 1000) * -1; // Divide by 1000 to get smaller numbers
nPos[i].z = (joints[jointNo].cameraZ / 1000) * -1; // Flip the rotaion with -1 to mirror user
  }
}

  
  angle += 0.005; // Rotate the ribbons

  for (let i in meshes) {
    let mesh = meshes[i];
    mesh.rotation.y = angle;
  }

  controls.update(); // Update the controls

  // Render the scene
  // https://stackoverflow.com/questions/41077723/what-is-the-exact-meaning-for-renderer-in-programming
  renderer.render(scene, camera);
}

// Resize scene based on window size
function onWindowResize() {
  let w = container.clientWidth;
  let h = container.clientHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);

  resolution.set(w, h);
}

// Map function to easily map values
function map(value, inputMin, inputMax, outputMin, outputMax) {
  return (
    ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) +
    outputMin
  );
}