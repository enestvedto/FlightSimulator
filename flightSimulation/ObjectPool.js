import * as THREE from 'three';
import { MathUtils } from 'three';

import { TessellateModifier } from 'three/examples/jsm/modifiers/TessellateModifier';


/**
 * A pool of objects for the Graphics World. 
 * Holds Meshes that can be tweaked and put back.
 * 
 * Unfortunately I (Tones) did not have the time, but if the opportunity 
 * was there the object generation would be done in main.
 * 
 * Authors: Tone_Man and Owen
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

            const count = randomGeometry.attributes.position.count;
            const randoms = new Float32Array(count);
            for (let i = 0; i < count; i++) {
                randoms[i] = Math.random();
            }
            randomGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

            var customUniforms = {
                amplitude: { value: 0.0 },
                delta: { value: 0 },
                uColor: { value: new THREE.Color(0x31c48D) },
                uColor1: { value: new THREE.Color(0x6C63FF) },
                u_resolution: { type: "v2", value: new THREE.Vector2() },
            };
            var rndColor1 = this.getRandomColor();
            var rndColor2 = this.getRandomColor();
            customUniforms.uColor.value = new THREE.Color(rndColor1);
            customUniforms.uColor1.value = new THREE.Color(rndColor2);

            var defaultMaterial = new THREE.ShaderMaterial({
                uniforms: customUniforms,
                vertexShader: document.getElementById('vertexShader').textContent,
                fragmentShader: document.getElementById('fragShader').textContent,
            });
            defaultMaterial.blending = THREE.CustomBlending;
            defaultMaterial.blendEquation = THREE.AddEquation;


            var rndColor = this.getRandomColor();
            var defaultMaterialWithLight = new THREE.MeshStandardMaterial({
                color: rndColor,
                emissive: 0x110000
            });
            defaultMaterialWithLight.blending = THREE.CustomBlending;
            defaultMaterialWithLight.blendEquation = THREE.AddEquation;
            defaultMaterialWithLight.blendSrc = THREE.SrcAlphaFactor;
            defaultMaterialWithLight.blendDst = THREE.OneMinusDstAlphaFactor;

            let obj = new THREE.Mesh(randomGeometry.clone(), defaultMaterial);

            //allows object movement
            obj.userData = {};
            obj.userData['velocity'] = new THREE.Vector3(MathUtils.randFloatSpread(4), MathUtils.randFloatSpread(4), MathUtils.randFloatSpread(4));
            obj.userData['rotation'] = new THREE.Vector3(MathUtils.randFloatSpread(Math.PI), MathUtils.randFloatSpread(Math.PI), MathUtils.randFloatSpread(Math.PI));

            this.freeObjects.push(obj);

        }
    }//end of constructor

    /**
     * Gives user an object
     * @returns Mesh
     */
    getObject() {
        let object = this.freeObjects.pop();

        if (object != undefined)
            this.lockedObjects.push(object);

        return object;

    } //end of getObject

    /**
     * Returns user the object
     * @param {Mesh} object 
     */
    releaseObject(object) {
        let idx = this.lockedObjects.indexOf(object);

        if (idx != undefined) {
            this.freeObjects.push(this.lockedObjects[idx]);
            this.lockedObjects.splice(idx, 1);
        }

    }// end of releaseObject

    /**
     * Gives size of thredpool
     * @returns Size of thredpool
     */
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