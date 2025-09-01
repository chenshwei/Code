import { _decorator, Component, NodeEventType, Node, PolygonCollider2D } from 'cc';
import { SceneLightMgr } from './SceneLightMgr';
const { ccclass, requireComponent } = _decorator;

/**
 * 2D简易光照-遮挡物
 */
@ccclass('SceneLightOccluder')
@requireComponent(PolygonCollider2D)
export class SceneLightOccluder extends Component {
    private collider: PolygonCollider2D = null;
    public onLoad(): void {
        this.collider = this.node.getComponent(PolygonCollider2D);
    }

    public onUpdatePos() {
        if (!this.node.active) return;
        SceneLightMgr.addOccluder(this.node.uuid, this.collider.worldPoints);
    }

    public onPosChange(type) {
        if (type & Node.TransformBit.POSITION) {
            this.onUpdatePos();
        }
    }

    private _timer = null;
    public onEnable(): void {
        this._timer = setTimeout(() => {
            this._timer = null;
            this.onUpdatePos();
        }, 100);
        // this.onUpdatePos();

        this.node.on(NodeEventType.TRANSFORM_CHANGED, this.onUpdatePos, this);
        this.node.parent.on(NodeEventType.TRANSFORM_CHANGED, this.onUpdatePos, this);
    }
    public onDisable(): void {
        SceneLightMgr.removeOccluder(this.node.uuid);

        this.node.off(NodeEventType.TRANSFORM_CHANGED, this.onUpdatePos, this);
        this.node.parent.off(NodeEventType.TRANSFORM_CHANGED, this.onUpdatePos, this);
    }
    public onDestroy(): void {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        SceneLightMgr.removeOccluder(this.node.uuid);
    }
}


