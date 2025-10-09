import { SceneLightMgr } from './comp/SceneLightMgr';
const { ccclass, property } = cc._decorator;

/**
 * 2D灯光 demo
 */
@ccclass
export class LightScene extends cc.Component {
    @property(cc.Sprite)
    topSprite: cc.Sprite = undefined;

    protected onLoad(): void {
        let mat = this.topSprite?.getMaterial(0);
        SceneLightMgr.initMat(mat);
        this.topSprite.node.setContentSize(cc.winSize.width, cc.winSize.height);
    }
}


