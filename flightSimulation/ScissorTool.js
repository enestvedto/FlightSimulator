import { Vector2, Vector4} from "three";

export class ScissorTool {

    point = new Vector2(0, 100);
    width = 100;
    height = 100;
    renderer;

    constructor(renderer)
    {
        this.renderer = renderer;
    }

    setHeight(height) {
        this.height = height;

        this.updateContext();
    }

    setWidth(width) {
        this.width = width;

        this.updateContext();
    }

    setPosFromBottomLeft( x, y ) {
        this.point.x = x;
        this.point.y = y;

        this.updateContext();
    }

    setPosFromCenter(x, y) {
        this.point.x = x - this.width / 2;
        this.point.y = y - this.height / 2;

        this.updateContext();
    }

    setPosFromTopRight(x, y) {
        this.point.x = x - this.width;
        this.point.y = y - this.height;

        this.updateContext();
    }

    updateContext() {

        this.renderer.setScissor( this.point.x, this.point.y , this.width , this.height );
    }

    toggleScissor() {
        this.renderer.setScissorTest( !( this.renderer.getScissorTest()) );
    }
}