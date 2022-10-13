import * as THREE from 'three';

/**
 * A pool of objects for the Graphics World. 
 * Holds Meshes that can be tweaked and put back.
 */
export class ObjectPool {

    free_objects = [];
    locked_objects = [];

    poolSize = 10;

    defaultGeometry = new THREE.BoxGeometry(2, 2, 2).toNonIndexed();
    
    defaultMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        emissive: 0x110000
    });
 
    constructor(poolSize) {
        this.poolSize = poolSize;

        for (let i = 0; i < poolSize; i++) {

            let box = new THREE.Mesh(this.defaultGeometry, this.defaultMaterial);
            this.free_objects.push(box);

        }
    }

    getObject() {
        let object = this.free_objects.pop();

        if (object != undefined)
            this.locked_objects.push(object);

        return object;

    }

    releaseObject(object) {
        let idx = this.locked_objects.indexOf(object);
        
        if (idx != undefined)
        {
            this.free_objects.push( this.locked_objects[idx] );
            this.locked_objects.splice(idx, 1)
        }

    }

    getSize() {
        return this.poolSize;
    }

}

/**
 * A pool of objects for the Physics World. 
 * Holds Box3 that can be tweaked and put back.
 */
export class PhysicsPool {

    free_objects = [];
    locked_objects = [];

    poolSize = 10;

    #MIN_VECTOR = new THREE.Vector3(-0.5,-0.5,-0.5);
    #MAX_VECTOR = new THREE.Vector3(0.5, 0.5, 0.5);

    defaultGeometry = new THREE.Box3(this.MIN_VECTOR, this.MAX_VECTOR);


    constructor(poolSize) {
        this.poolSize = poolSize;

        for (let i = 0; i < poolSize; i++) {

            let bb = this.defaultGeometry.clone();

            this.free_objects.push(bb);

        }
    }

    getObject() {
        let object = this.free_objects.pop();

        if (object != undefined)
            this.locked_objects.push(object);

        return object;

    }

    releaseObject(object) {
        let idx = this.locked_objects.indexOf(object);
        
        if (idx != undefined)
        {
            this.free_objects.push( this.locked_objects[idx] );
            this.locked_objects.splice(idx, 1)
        }

    }

    getSize() {
        return this.poolSize;
    }

}
