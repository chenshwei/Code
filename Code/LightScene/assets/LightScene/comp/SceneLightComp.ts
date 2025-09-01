import { _decorator, CCFloat, Component, NodeEventType } from 'cc';
import { SceneLightMgr } from './SceneLightMgr';
const { ccclass, property } = _decorator;

/**
 * 2D简易光照-点光源
 */
@ccclass('SceneLightComp')
export class SceneLightComp extends Component {
    @property({type:CCFloat, tooltip: '内圈半径'})
    radius: number = 100;

    @property({type:CCFloat, tooltip: '外扩宽度'})
    outLen: number = 30;

    public onUpdatePos() {
        if (!this.node.active) return;
        
        SceneLightMgr.addLightPos(this.node.uuid, this.node.worldPosition, this.radius, this.outLen);
    }

    private _timer = null;
    public onEnable(): void {
        this._timer = setTimeout(() => {
            this._timer = null;
            this.onUpdatePos();
        }, 100);
        // this.onUpdatePos();

        // 节点位置变化监听(可根据自己项目实际调整)
        // 出于性能和操作简便考虑，目前仅监听自己和父节点
        this.node.on(NodeEventType.TRANSFORM_CHANGED, this.onUpdatePos, this);
        this.node.parent.on(NodeEventType.TRANSFORM_CHANGED, this.onUpdatePos, this);
    }
    public onDisable(): void {
        SceneLightMgr.removeLight(this.node.uuid);

        this.node.off(NodeEventType.TRANSFORM_CHANGED, this.onUpdatePos, this);
        this.node.parent.off(NodeEventType.TRANSFORM_CHANGED, this.onUpdatePos, this);
    }
    public onDestroy(): void {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        SceneLightMgr.removeLight(this.node.uuid);
    }
}


