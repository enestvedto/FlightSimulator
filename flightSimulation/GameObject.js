import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Mesh } from 'three';
import { Vec3 } from 'cannon-es';



/**
 * Generic class for creating objects for game and physics world.
 * This aids in keeping track of what objects are where.
 */
export class GameObject {

    graphicsObject;
    physicsObject;

    constructor() {
        this.graphicsObject = new THREE.Object3D();
        this.physicsObject = new CANNON.Body();
    }

    setPosition(x, y, z) {
        this.physicsObject.position.set(x, y, z)
    }

    setScale() {

    }

    setQuaternion() {

    }

    setGraphicsObject(object) {
        this.graphicsObject = object;
    }

    setPhysicsObject(body) {
        this.physicsObject = body;
    }
}

export class BoxObject extends GameObject {

    #material = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        emissive: 0x110000
    });

    /**
     * @param {THREE.Vector3} scale 
     * @param {Integer} mass 
     * @param {THREE.Vector3} position 
     */
    constructor(scale = new THREE.Vector3(1, 1, 1), mass = 5, position = new THREE.Vector3(0, 0, 0)) {

        super();

        // graphics world
        this.graphicsObject = new THREE.Mesh(new THREE.BoxGeometry(scale.x, scale.y, scale.z), this.#material);
        this.graphicsObject.position.set(position.x, position.y, position.z);

        // physics world
        let boxShape = new CANNON.Box(new CANNON.Vec3(scale.x / 2, scale.y / 2, scale.z / 2));
        this.physicsObject = new CANNON.Body({ mass: mass, shape: boxShape });

        this.physicsObject.position.set(position.x, position.y, position.z);
    }
}