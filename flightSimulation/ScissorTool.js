import { Vector2, Vector4 } from "three";

/**
 * A simple class to make sciccoring a peice of cake!
 * 
 * Author: Tone_Man (Antonio Craveiro)
 */
export class ScissorTool {

    point = new Vector2(0, 100);
    width = 100;
    height = 100;
    renderer;

    /**
     * Creates a new ScissorTool for a given renderer.
     * @param {THREE.WebGLRenderer} renderer 
     */
    constructor(renderer) {
        this.renderer = renderer;
    }

    /**
     * Sets the height of the scissor to a new height
     * @param {number} height 
     */
    setHeight(height) {
        this.height = height;

        this.updateContext();
    }

    /**
     * Sets the width of the scissor width
     * @param {*} width 
     */
    setWidth(width) {
        this.width = width;

        this.updateContext();
    }

    /**
     * Sets the scissor bottom left corner to x , y
     * @param {number} x 
     * @param {number} y 
     */
    setPosFromBottomLeft(x, y) {
        this.point.x = x;
        this.point.y = y;

        this.updateContext();
    }

    /**
     * Sets the scissor to be centered to x , y
     * @param {number} x 
     * @param {number} y 
     */
    setPosFromCenter(x, y) {
        this.point.x = x - this.width / 2;
        this.point.y = y - this.height / 2;

        this.updateContext();
    }

    /**
     * Sets the scissor top right corner to x , y
     * @param {number} x 
     * @param {number} y 
     */
    setPosFromTopRight(x, y) {
        this.point.x = x - this.width;
        this.point.y = y - this.height;

        this.updateContext();
    }

    /**
     * Updates the context of the renderer. 
     */
    updateContext() {

        this.renderer.setScissor(this.point.x, this.point.y, this.width, this.height);
    }

    /**
     * Toggles the renderer to scissor
     */
    toggleScissor() {
        this.renderer.setScissorTest(!(this.renderer.getScissorTest()));
    }
}