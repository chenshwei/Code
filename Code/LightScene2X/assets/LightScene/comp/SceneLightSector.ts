import { SceneLightMgr } from './SceneLightMgr';
const { ccclass, property } = cc._decorator;

/**
 * 2D简易光照-扇形光源
 */
@ccclass
export class SceneLightSector extends cc.Component {
    @property({ serializable: true })
    private _direction: number = 0;
    @property({ serializable: true })
    private _radius: number = 100;
    @property({ serializable: true })
    private _outerWidth: number = 100;
    @property({ serializable: true })
    private _angle: number = 90;
    @property({ serializable: true })
    private _angleEx: number = 10;
    @property({ serializable: true })
    private _isShadow: boolean = false;

    @property({type:cc.Float, tooltip: '朝向 (0-360)'})
    get direction(): number {
        return this._direction;
    }
    set direction(value: number) {
        if (this._direction !== value) {
            this._direction = value;
            this.onUpdatePos();
        }
    }

    @property({type:cc.Float, tooltip: '半径'})
    get radius(): number {
        return this._radius;
    }
    set radius(value: number) {
        if (this._radius !== value) {
            this._radius = value;
            this.onUpdatePos();
        }
    }

    @property({type:cc.Float, tooltip: '外扩宽度'})
    get outerWidth(): number {
        return this._outerWidth;
    }
    set outerWidth(value: number) {
        if (this._outerWidth !== value) {
            this._outerWidth = value;
            this.onUpdatePos();
        }
    }

    @property({type:cc.Float, tooltip: '张开角度'})
    get angle(): number {
        return this._angle;
    }
    set angle(value: number) {
        if (this._angle !== value) {
            this._angle = value;
            this.onUpdatePos();
        }
    }

    @property({type:cc.Float, tooltip: '外拓角度'})
    get angleEx(): number {
        return this._angleEx;
    }
    set angleEx(value: number) {
        if (this._angleEx !== value) {
            this._angleEx = value;
            this.onUpdatePos();
        }
    }

    @property({type:cc.Boolean, tooltip: '是否产生阴影'})
    get isShadow(): boolean {
        return this._isShadow;
    }
    set isShadow(value: boolean) {
        if (this._isShadow !== value) {
            this._isShadow = value;
            this.onUpdatePos();
        }
    }

    private _tempV2 = new cc.Vec2(0, 0);
    public onUpdatePos() {
        if (!this.node.active) return;
        
        this._tempV2.x = this.node.position.x;
        this._tempV2.y = this.node.position.y;
        this._tempV2 = this.node.parent.convertToWorldSpaceAR(this._tempV2)
        SceneLightMgr.addLightSector(this.node.uuid, this._tempV2, this._direction, this.radius
            , this.outerWidth, this.angle, this.angleEx, this.isShadow);
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
        SceneLightMgr.removeLightSector(this.node.uuid);

        this.node.off(cc.Node.EventType.POSITION_CHANGED, this.onUpdatePos, this);
        this.node.parent.off(cc.Node.EventType.POSITION_CHANGED, this.onUpdatePos, this);
    }
    public onDestroy(): void {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        SceneLightMgr.removeLightSector(this.node.uuid);
    }
}


