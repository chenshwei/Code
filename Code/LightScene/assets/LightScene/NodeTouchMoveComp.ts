import { _decorator, Component, EventTouch, Node, Vec2, UITransform, Vec3 } from 'cc';
const { ccclass } = _decorator;

/**
 * 节点触摸移动组件
 */
@ccclass('NodeTouchMoveComp')
export class NodeTouchMoveComp extends Component {
    private parentUI: UITransform;

    start() {
        this.parentUI = this.node.parent.getComponent(UITransform);

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchStart, this);
    }

    //#region 节点触摸移动
    private _pos: Vec2 = new Vec2();
    onTouchStart(e: EventTouch) {
        e.getUILocation(this._pos);
        this.updateMoveNode();
    }

    private _tempV3: Vec3 = new Vec3();   
    private updateMoveNode(){
        this._tempV3.set(this._pos.x, this._pos.y, 0);
        this._tempV3 = this.parentUI.convertToNodeSpaceAR(this._tempV3)
        this.node.setPosition(this._tempV3.x, this._tempV3.y);
    }
    //#endregion 节点触摸移动
    
}


