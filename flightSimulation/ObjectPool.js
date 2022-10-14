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
        var geometries = [];

        this.poolSize = poolSize;
        const tessellateModifier = new TessellateModifier(0.2, 5);

        var boxGeometry = new THREE.BoxGeometry(2, 2, 2).toNonIndexed();
        var defaultGeometry = tessellateModifier.modify(boxGeometry);
        geometries.push(defaultGeometry);

        var sG = new THREE.SphereGeometry(2, 32, 16).toNonIndexed();
        var sphereGeometry = tessellateModifier.modify(sG);
        geometries.push(sphereGeometry);

        var cG = new THREE.CapsuleGeometry(2, 2, 4, 8);
        var capsuleGeometry = tessellateModifier.modify(cG);
        geometries.push(capsuleGeometry);

        var iG = new THREE.IcosahedronGeometry(2, 0);
        var icosahedronGeometry = tessellateModifier.modify(iG);
        geometries.push(icosahedronGeometry);

        var tG = new THREE.TetrahedronGeometry(2, 0);
        var tetrahedronGeometry = tessellateModifier.modify(tG);
        geometries.push(tetrahedronGeometry);

        var toG = new THREE.TorusGeometry(2, 1, 16, 100);
        var torusGeometry = tessellateModifier.modify(toG);
        geometries.push(torusGeometry);


        for (let i = 0; i < poolSize; i++) {

            var idx = this.getRndInteger(0, geometries.length);
            var randomGeometry = geometries[idx];

            const numFaces = randomGeometry.attributes.position.count / 3;
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

            randomGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 3));

            var customUniforms = {
                amplitude: { value: 0.0 },
                delta: { value: 0 },
            };

            var defaultMaterial = new THREE.ShaderMaterial({
                uniforms: customUniforms,
                vertexShader: document.getElementById('vertexShader').textContent,
            });

            /*
             var rndColor = this.getRandomColor();
             var defaultMaterial = new THREE.MeshStandardMaterial({
                 color: rndColor,
                 emissive: 0x110000
             });
 */
            let box = new THREE.Mesh(randomGeometry.clone(), defaultMaterial);
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


    getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // code grabbed from https://stackoverflow.com/questions/1484506/random-color-generator
    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}