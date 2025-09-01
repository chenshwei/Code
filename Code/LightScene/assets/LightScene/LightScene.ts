import { _decorator, Camera, Component, Sprite, UITransform, screen, Size, view } from 'cc';
import { SceneLightMgr } from './comp/SceneLightMgr';
const { ccclass, property } = _decorator;

/**
 * 2D灯光 demo
 */
@ccclass('LightScene')
export class LightScene extends Component {
    @property(Sprite)
    topSprite: Sprite;

    @property(Camera)
    camera: Camera; 

    protected onLoad(): void {
        let winSize = new Size(screen.windowSize.width / view.getScaleX(), screen.windowSize.height / view.getScaleY());
        let mat = this.topSprite?.getSharedMaterial(0);
        SceneLightMgr.initMat(mat, winSize.width, winSize.height, this.camera);
        this.topSprite.getComponent(UITransform).setContentSize(winSize.width, winSize.height);
    }
}


