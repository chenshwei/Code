const { ccclass } = cc._decorator;

/**
 * 节点触摸移动组件
 */
@ccclass
export class NodeTouchMoveComp extends cc.Component {
    private parentNode: cc.Node;

    start() {
        this.parentNode = this.node.parent;

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchStart, this);
    }

    //#region 节点触摸移动
    private _pos: cc.Vec2 = new cc.Vec2();
    onTouchStart(e: cc.Touch) {
        this._pos.x = e.getLocationX();
        this._pos.y = e.getLocationY();
        this.updateMoveNode();
    }
  
    private updateMoveNode(){
        this._pos = this.parentNode.convertToNodeSpaceAR(this._pos)
        this.node.setPosition(this._pos.x, this._pos.y);
    }
    //#endregion 节点触摸移动
    
}


