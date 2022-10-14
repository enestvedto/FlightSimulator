import * as THREE from 'three';
import { TessellateModifier } from 'three/examples/jsm/modifiers/TessellateModifier';


/**
 * A pool of objects for the Graphics World. 
 * Holds Meshes that can be tweaked and put back.
 */
export class ObjectPool {
    freeObjects = [];
    lockedObjects = [];


    constructor(poolSize = 10) {
        this.poolSize = poolSize;

        var boxGeometry = new THREE.BoxGeometry(2, 2, 2).toNonIndexed();
        const tessellateModifier = new TessellateModifier(0.2, 5);
        var defaultGeometry = tessellateModifier.modify(boxGeometry);

        for (let i = 0; i < poolSize; i++) {

            const numFaces = defaultGeometry.attributes.position.count / 3;
            const displacement = new Float32Array(numFaces * 3 * 3);

            for (let f = 0; f < numFaces; f++) {
                const index = 9 * f;
                const d = 10 * (0.5 - Math.random());

                for (let i = 0; i < 3; i++) {
                    displacement[index + (3 * i)] = d;
                    displacement[index + (3 * i) + 1] = d;
                    displacement[index + (3 * i) + 2] = d;
                }
            }
            defaultGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 3));

            var customUniforms = {
                amplitude: { value: 0.0 },
                delta: { value: 0 },
            };

            var defaultMaterial = new THREE.ShaderMaterial({
                uniforms: customUniforms,
                vertexShader: document.getElementById('vertexShader').textContent,
            });

            let box = new THREE.Mesh(defaultGeometry.clone(), defaultMaterial);
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

        if (idx != undefined) {
            this.freeObjects.push(this.lockedObjects[idx]);
            this.lockedObjects.splice(idx, 1);
        }

    }

    getSize() {
        return this.poolSize;
    }

}