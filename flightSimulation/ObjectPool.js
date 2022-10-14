import * as THREE from 'three';

/**
 * A pool of objects for the Graphics World. 
 * Holds Meshes that can be tweaked and put back.
 */
export class ObjectPool {

    freeObjects = [];
    lockedObjects = [];

    defaultGeometry = new THREE.BoxGeometry(2, 2, 2).toNonIndexed();
    
    defaultMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        emissive: 0x110000
    });
 
    constructor(poolSize = 10) {
        this.poolSize = poolSize;

        for (let i = 0; i < poolSize; i++) {

            let box = new THREE.Mesh(this.defaultGeometry.clone(), this.defaultMaterial.clone());
            this.freeObjects.push(box);

        }
    }

    getObject() {
        let object = this.freeObjects.pop();

        if (object != undefined)
            this.lockedObjects.push(object);

        return object;

    }

    releaseObject(object) {
        let idx = this.lockedObjects.indexOf(object);
        
        if (idx != undefined)
        {
            this.freeObjects.push( this.lockedObjects[idx] );
            this.lockedObjects.splice(idx, 1);
        }

    }

    getSize() {
        return this.poolSize;
    }

}