import { SceneLightMgr } from './SceneLightMgr';
const {ccclass, property} = cc._decorator;

/**
 * 2D简易光照-点光源
 */
@ccclass
export class SceneLightComp extends cc.Component {
    @property({type:cc.Float, tooltip: '内圈半径'})
    radius: number = 100;

    @property({type:cc.Float, tooltip: '外扩宽度'})
    outLen: number = 30;

    @property({tooltip: '是否生成阴影'})
    isShadow: boolean = false;

    private _tempV2 = new cc.Vec2(0, 0);
    public onUpdatePos() {
        if (!this.node.active) return;

        this._tempV2.x = this.node.position.x;
        this._tempV2.y = this.node.position.y;
        this._tempV2 = this.node.parent.convertToWorldSpaceAR(this._tempV2)
        SceneLightMgr.addLightPos(this.node.uuid, this._tempV2, this.radius, this.outLen, this.isShadow);
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
        this.node.on(cc.Node.EventType.POSITION_CHANGED, this.onUpdatePos, this);
        this.node.parent.on(cc.Node.EventType.POSITION_CHANGED, this.onUpdatePos, this);
    }
    public onDisable(): void {
        SceneLightMgr.removeLight(this.node.uuid);

        this.node.off(cc.Node.EventType.POSITION_CHANGED, this.onUpdatePos, this);
        this.node.parent.off(cc.Node.EventType.POSITION_CHANGED, this.onUpdatePos, this);
    }
    public onDestroy(): void {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        SceneLightMgr.removeLight(this.node.uuid);
    }
}


