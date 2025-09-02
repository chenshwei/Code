import { _decorator, Component, EventTouch, Node, Vec2, UITransform, Vec3 } from 'cc';
import { SceneLightSector } from './comp/SceneLightSector';
const { ccclass, property } = _decorator;

/**
 * 节点触摸移动组件 - 给扇形光源使用的
 */
@ccclass('NodeTouchMoveComp2')
export class NodeTouchMoveComp2 extends Component {
    private parentUI: UITransform;

    @property(SceneLightSector)
    lightSector: SceneLightSector;

    start() {
        this.parentUI = this.node.parent.getComponent(UITransform);

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchStart, this);
    }

    //#region 节点触摸移动
    private _pos: Vec2 = new Vec2(0, 0);
    private _oldPos: Vec2 = new Vec2(0, 0);
    private _tempV2: Vec2 = new Vec2(0, 0);
    onTouchStart(e: EventTouch) {
        
        e.getUILocation(this._pos);
        this.updateMoveNode();


        this._tempV2.set(this._pos.x - this._oldPos.x, this._pos.y - this._oldPos.y);
        if (this._tempV2.lengthSqr() > 900) {
            
            let rad = Math.atan2(this._pos.y - this._oldPos.y, this._pos.x - this._oldPos.x);
            let degree = rad * 180 / Math.PI;
            this.lightSector.direction = degree - 90;
            
            this._oldPos.set(this._pos);
        }
    }

    private _tempV3: Vec3 = new Vec3();   
    private updateMoveNode(){
        this._tempV3.set(this._pos.x, this._pos.y, 0);
        this._tempV3 = this.parentUI.convertToNodeSpaceAR(this._tempV3)
        this.node.setPosition(this._tempV3.x, this._tempV3.y);
    }
    //#endregion 节点触摸移动
}


