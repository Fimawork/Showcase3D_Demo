import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {CameraManager,UpdateCameraPosition, InputEvent,Camera_Inspector,SetDefaultCameraStatus,InstFBXLoader,InstGLTFLoader,FindMataterialByName,posData} from 'https://cdn.jsdelivr.net/gh/Fimawork/threejs_tools/fx_functions.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';




let scene, camera, renderer, stats, mixer;
let controls;
let idleTime=0;
let threeContainer = document.getElementById("threeContainer");

const clock = new THREE.Clock();

const modelPosition=new THREE.Vector3(0,0,0);
const modelRotation=new THREE.Vector3(0,-Math.PI*0.5, 0);
const modeScale=0.2;

const CameraDefaultPos=new THREE.Vector3(-5,0,0);
const ControlsTargetDefaultPos=new THREE.Vector3(0,0,0);

const hold_time=4.5;


init();
animate();
EventListener();
//Camera_Inspector(camera,controls);

//Material_Inspector(item_01);

function init()
{
  	scene = new THREE.Scene();

  	camera = new THREE.PerspectiveCamera( 45, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 1000 );//非全螢幕比例設定
  	renderer = new THREE.WebGLRenderer({ antialias: true });
  	renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);

  	renderer.setClearColor(0x000000, 0.0);//需加入這一條，否則看不到CSS的底圖
  	renderer.toneMapping = THREE.ACESFilmicToneMapping;
  	renderer.toneMappingExposure = 0.5;
  	//document.body.appendChild( renderer.domElement );
  	threeContainer.appendChild( renderer.domElement );

	
  	camera.position.copy(CameraDefaultPos);
  	posData[0]={ camera_pos:CameraDefaultPos, controlsTarget_pos:ControlsTargetDefaultPos};

	InstGLTFLoader("./models/iphone_17_pro_revised.glb",modelPosition,modelRotation,modeScale,"test",null,scene);
  	///利用座標設定旋轉中心及鏡頭焦點，camera不須另外設定初始角度
  	controls = new OrbitControls( camera, renderer.domElement );
  	controls.enablePan = false;//右鍵平移效果
  	controls.panSpeed = 0.4;
  	controls.enableDamping = true;
  	controls.dampingFactor =0.015;
  	controls.maxDistance = 500;
  	controls.target.copy( ControlsTargetDefaultPos );
  	controls.zoomSpeed=0.5;
  	controls.update();

  	///hdri 環境光源
  	new RGBELoader()
		.setPath( 'textures/hdri/' )
		.load( 'studio_small_09_2k.hdr', function ( texture ) {

		texture.mapping = THREE.EquirectangularReflectionMapping;

		//scene.background = texture;
		scene.environment = texture;

	} );


	///光源
	

	const pointLight = new THREE.PointLight( 0xffffff, 15 );
	pointLight.position.set(-0.3,2.1,-1);

	const helper = new THREE.PointLightHelper(pointLight);
	//scene.add(helper);

	scene.add( pointLight );

	///EventListener
  	window.addEventListener( 'resize', onWindowResize );  

  	renderer.domElement.addEventListener("pointerdown", (event) => {
    	InputEvent();
		idleTime=0;
  	});

	renderer.domElement.addEventListener( 'pointermove', function(e) {idleTime=0;});
  	renderer.domElement.addEventListener("wheel", (event) => {idleTime=0;});
}


function onWindowResize() 
{
    camera.aspect = threeContainer.clientWidth/threeContainer.clientHeight;//非全螢幕比例設定
	camera.updateProjectionMatrix();
    renderer.setSize( threeContainer.clientWidth, threeContainer.clientHeight);
}

function animate() 
{
  	requestAnimationFrame( animate );

  	controls.update();
  	renderer.render( scene, camera );
  	UpdateCameraPosition(camera,controls);


	const delta = clock.getDelta();

	if ( mixer ) mixer.update( delta );

	idleTime+=delta;

	if(idleTime>hold_time)
	{
		idleTime=0;
		CameraManager(0);
	}
}





function EventListener()
{
  window.addEventListener("keydown",function (event) {

      switch (event.code) 
      {

        case "Space":
        //MoveModelOFF();

		console.log("YES");

        break;

        case "ArrowDown":

       //console.log(scene);

        break;

        case "ArrowUp":
        
        
        break;

        case "ArrowLeft":

        break;

        case "ArrowRight":


        break;
      }
      
  });

  ///滑鼠點擊accessory可啟用模型移動面板
  window.addEventListener("pointerdown", function(e) {
    
  });


 
}

























