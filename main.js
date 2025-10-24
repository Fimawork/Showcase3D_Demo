import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {CameraManager,UpdateCameraPosition, InputEvent,Camera_Inspector,SetDefaultCameraStatus,InstFBXLoader,InstGLTFLoader,FindMataterialByName,posData} from 'https://cdn.jsdelivr.net/gh/Fimawork/threejs_tools/fx_functions.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { TIFFLoader } from 'three/addons/loaders/TIFFLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

	InstGLTFLoader("./models/iphone_17_pro_revised.glb",modelPosition,modelRotation,modeScale,"iphone",null,scene);
	InstGLTFLoader_Transparent("./models/iphone_case.glb",modelPosition,modelRotation,modeScale,"case",null,scene); 

	setTimeout(() => { threeContainer.classList.remove("SceneCrossEffect_anim");}, 3000);//避免為正確執行FadeIn動畫

	function InstGLTFLoader_Transparent(filePath,thisPos,thisRot,thisScale,thisName,thisParent,thisScene)
	{
		const loader = new GLTFLoader();
		loader.load( filePath, function ( gltf ) {

			const model = gltf.scene;
			model.position.copy(thisPos);
			model.rotation.set(thisRot.x, thisRot.y, thisRot.z);
			model.scale.set(thisScale,thisScale,thisScale);
			model.name=thisName;

			const glassMaterial = new THREE.MeshPhysicalMaterial( {
			color: 0xffffff, 
			transparent:true,//沒設定，畫面會出錯
			transmission: 1,
			metalness: 0.5, 
			roughness: 0, 
			ior:1,//<1畫面會不穩定
			depthWrite:false
			} );


			model.traverse( function ( object ) {				
				if ( object.isMesh )
				{
					object.material=glassMaterial;
				}
			})

			if(thisParent!=null)
			{
				thisParent.add(model)
			}

			else
			{
				thisScene.add( model );
			}

		});
	}
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

	///桌布

	let HUD = new THREE.Object3D();

	const loader_HUD = new TIFFLoader();

	const geometry_HUD = new THREE.PlaneGeometry();

	loader_HUD.load( './images/iphone_wallpaper.tif', function ( texture ) {

		texture.colorSpace = THREE.SRGBColorSpace;

		const material_HUD = new THREE.MeshBasicMaterial( { map: texture, transparent: true,blending: THREE.AdditiveBlending,opacity:0.9 ,depthWrite: false } );

		const mesh_HUD = new THREE.Mesh( geometry_HUD, material_HUD );
		const img_scale =0.16;

		mesh_HUD.position.set( 0.09, 0, 0 );
		mesh_HUD.scale.set(img_scale*8.4,img_scale*18.17,1);
		mesh_HUD.rotation.y=Math.PI/2;
		HUD.add(mesh_HUD);

		scene.add( HUD );
	} );

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


























