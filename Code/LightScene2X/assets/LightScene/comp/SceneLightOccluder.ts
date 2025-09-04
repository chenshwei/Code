import { SceneLightMgr } from './SceneLightMgr';
const { ccclass, requireComponent } = cc._decorator;

/**
 * 2D简易光照-遮挡物
 */
@ccclass
@requireComponent(cc.PolygonCollider)
export class SceneLightOccluder extends cc.Component {
    private collider: cc.PolygonCollider = null;
    public onLoad(): void {
        this.collider = this.node.getComponent(cc.PolygonCollider);
    }

    private _tempV2 = new cc.Vec2(0, 0);
    public onUpdatePos() {
        if (!this.node.active) return;

        let posArr = []
        for (let i = 0; i < this.collider.points.length; i ++) {
            const pos = this.collider.points[i];
            this._tempV2.x = pos.x;
            this._tempV2.y = pos.y;
            this._tempV2 = this.node.convertToWorldSpaceAR(this._tempV2)
            posArr.push(cc.v2(this._tempV2.x, this._tempV2.y));
        }
        SceneLightMgr.addOccluder(this.node.uuid, posArr);
    }

    private _timer = null;
    public onEnable(): void {
        this._timer = setTimeout(() => {
            this._timer = null;
            this.onUpdatePos();
        }, 100);
        // this.onUpdatePos();

        this.node.on(cc.Node.EventType.POSITION_CHANGED, this.onUpdatePos, this);
        this.node.parent.on(cc.Node.EventType.POSITION_CHANGED, this.onUpdatePos, this);
    }
    public onDisable(): void {
        SceneLightMgr.removeOccluder(this.node.uuid);

        this.node.off(cc.Node.EventType.POSITION_CHANGED, this.onUpdatePos, this);
        this.node.parent.off(cc.Node.EventType.POSITION_CHANGED, this.onUpdatePos, this);
    }
    public onDestroy(): void {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        SceneLightMgr.removeOccluder(this.node.uuid);
    }
}


