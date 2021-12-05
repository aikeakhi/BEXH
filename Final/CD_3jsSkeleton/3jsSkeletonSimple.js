// The Body Everywhere and Here Class 3: Kinectron in three.js - skeleton basics
// https://github.com/lisajamhoury/The-Body-Everywhere-And-Here-2021/

// This example uses the Kinectron camera joint positioning
// in three.js to draw joint poisitions

// Three.js scene variables
//////////////////// VARIABLES  ////////////////////////////
//let kinectron = null;
let camera, scene, renderer;
let joints = []; // Variable to hold the joints

////////////////////// STARTS UP SKETCH ////////////////////////////


//window.addEventListener('load', function () {
    //initThreeJS();// Create three.js scene
    //initKinectron(); // Start kinectron
    //initSkeleton();
  //});

//let width = window.innerWidth;// Set global width and height
//let height = window.innerHeight;

///////////////////// KINECTRON ////////////////////////////

function initKinectron() {
const kinectronServerIPAddress = '192.168.1.186';
kinectron = new Kinectron(kinectronServerIPAddress); // Define and create an instance of kinectron
kinectron.setKinectType("azure"); // Set kinect type
kinectron.makeConnection();  // Connect to server application
kinectron.startTrackedBodies(drawJoints);  // Start tracked bodies feed and set function for incoming data
}

function drawJoints(data) { // Runs each time we get data from kinectron
    const newJoints = data.skeleton.joints;  // Get the new joints
    
    for (let j = 0; j < joints.length; j++) {  // Update all the box joint positions with t he incoming data // Update all the box joint positions with t he incoming data
    joints[j].position.x = newJoints[j].cameraX * -1; 
    joints[j].position.y = newJoints[j].cameraY * -1;
    joints[j].position.z = newJoints[j].cameraZ * -1;
      }
    }

///////////////////// ENVIRONMENT SETUP ////////////////////////////
 
// Create three.js renderer
function initThreeJs() {
renderer = new THREE.WebGLRenderer(); // Three.js renderer
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Camera
camera = new THREE.PerspectiveCamera(70, renderer.domElement.width / renderer.domElement.height, 1, 10000);
camera.position.set(0, 300, 3000);
scene.add(camera);

//controls = new THREE.OrbitControls(camera, renderer.domElement);
controls = new THREE.TrackballControls(camera, renderer.domElement);
  
// Three.js scene
scene = new THREE.Scene(); 
//scene.background = new THREE.Color(0x000000);
//scene.fog = new THREE.FogExp2( 0xcccccc, 0.0025 );
    
// Three.js light
let light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(0, 10, 100).normalize();
scene.add(light);
}
 

///////////////////// KINECT AVATAR //////////////////////////// 
function initSkeleton() {
  
for (let i = 0; i < 32; i++) {// Create cubes for joints
let material = new THREE.MeshPhongMaterial({ // Create a material // This gives the cube its color and look
      color: 0x000000,
      specular: 0x666666,
      emissive: 0xee82ee,
      shininess: 10,
      opacity: 0.8,
      transparent: true,
    });

    
let geometry = new THREE.BoxBufferGeometry(30, 30, 30);  // This gives the cube its shape
geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0));

let mesh = new THREE.Mesh(geometry, material); // The mesh is made from the shape and the material   // https://en.wikipedia.org/wiki/Polygon_mesh
joints.push(mesh);  // Create an array of joint meshes for easy manipulation
scene.add(mesh); // Put the mesh in the scene
  }
}

///////////////////// STARTS UP SKETCH //////////////////////////// 

function init(){
    initKinectron();
    initThreeJs();
    initSkeleton();
  
  window.addEventListener("resize", onWindowResize, false);  // Listen for window resize
  }

// Resize graphics when user resizes window
function onWindowResize() { 
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth / window.innerHeight);
}

function animate() {
requestAnimationFrame(animate);
renderer.render(scene, camera);
controls.update(); // Update the controls with each frame
}

init();
animate();



