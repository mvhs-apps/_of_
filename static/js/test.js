import * as THREE from '../js/three.js-master/build/three.module.js';
import { EffectComposer } from '../js/three.js-master/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './three.js-master/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './three.js-master/examples/jsm/postprocessing/UnrealBloomPass.js';
let scene, camera, renderer, sphere, pointLight, composer;
var stars = [];
var starOver;
var raycaster = new THREE.Raycaster();
let starGeo = new THREE.SphereGeometry(1, 16, 16);
const material = new THREE.MeshLambertMaterial({color: 0xffffff});
material.emissive=new THREE.Color(0xffffff);
class Star {

    constructor()
    {
        this.geometry = new THREE.SphereGeometry(1,64,64);
        this.material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent:true,
            opacity: .8,
            side: THREE.DoubleSide});
        this.material.side = 1;
        this.material.emissive=new THREE.Color(0x000000);
        this.material.emissiveIntensity=1;
        this.sphere = new THREE.Mesh(this.geometry, this.material);
        stars.push(this.sphere);
        scene.add(this.sphere);
        var distance = 150+Math.random()*100;
        let u = Math.random();
        let v = Math.random();

        var ang1 = 2*Math.PI*u;
        var ang2 = Math.acos(2*v-1);
        u = Math.cos(ang2);
        this.pointLight = new THREE.PointLight(0xffffff, .1, 10, 500000);
        this.sphere.position.x = distance*Math.sqrt(1-u*u)*Math.cos(ang1);
        this.sphere.position.y = distance*Math.sqrt(1-u*u)*Math.sin(ang1);
        this.sphere.position.z = distance*u;
        this.pointLight.position.x = this.sphere.position.x;
        this.pointLight.position.y = this.sphere.position.y;
        this.pointLight.position.z = this.sphere.position.z;
        scene.add(this.pointLight);
    }
}
function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, .007);
    camera = new THREE.PerspectiveCamera(70, window.innerWidth/(window.innerHeight*.9), 0.1, 1000);
    camera.position.y=50;
    camera.position.z = 750;
    renderer = new THREE.WebGLRenderer({antialias:true});

    renderer.setSize(window.innerWidth, window.innerHeight*.9);
    document.body.appendChild(renderer.domElement);
    const geometry = new THREE.IcosahedronGeometry(49.5, 8);
    const material = new THREE.MeshLambertMaterial({color: 0xffffff});
    material.side = 2;
    material.wireframe=false;
    
    sphere = new THREE.Mesh(geometry, material);
    const outlineMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
    outlineMaterial.wireframe=true;
    outlineMaterial.opacity = .5;
    var sphereOutline = new THREE.Mesh(geometry, outlineMaterial);
    scene.add(sphere);
    //scene.add(sphereOutline);
    var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0);
    pointLight = new THREE.PointLight(0xffffff, 1);
    for (var i = 0; i<100; i++)
    {
        new Star();
    }
    scene.add(pointLight);
    //scene.add(ambientLight);
    //sphere.position.z = -.1;
}

function animate() {
    requestAnimationFrame(animate);
    if (camera.position.z>0.0001)
    {
        camera.position.z = camera.position.z*.99;
    }else {
        camera.position.z = 0;
    }
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);
var xRot = 0;
var yRot = 0;
var startPt = {
    'clientX':null,
    'clientY':null
};
document.addEventListener('pointerdown', e=>
{
    startPt.clientX = e.clientX;
    startPt.clientY = e.clientY;
})
document.addEventListener('pointermove', e=>
{
    if (startPt.clientX && startPt.clientY)
    {
        xRot += (startPt.clientX - e.clientX)/window.innerWidth*Math.PI*2;
        var changeInY=startPt.clientY-e.clientY;
        if ((!(yRot > Math.PI/2) || (changeInY)<0) && (!(yRot<-Math.PI/2) || (changeInY>0)))
        {
            yRot += (changeInY)/window.innerHeight*Math.PI*2;
        }
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = yRot;
        euler.y = xRot;
        camera.quaternion.setFromEuler(euler);
        startPt.clientX = e.clientX;
        startPt.clientY = e.clientY;
        raycaster.setFromCamera(new THREE.Vector2(.5, .5), camera);
        for(var i=0; i<stars.length; i++)
        {
            raycaster.intersectObject(stars[i], false, starOver);
            if (starOver)
            {
                console.log(starOver);
                starOver.object.material.emissive=new THREE.Color(0xFF0000);
            }
        }
    }
    //camera.rotation.x = Math.min(Math.max(this.camera.rotation.x, -1.0472), 1.0472);
});
document.addEventListener('pointerup', e=>
{
    startPt = {
        'clientX':null,
        'clientY':null
    };
})
init();
animate();