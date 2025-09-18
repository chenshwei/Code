import { _decorator, Camera, Component, Sprite, UITransform, screen, Size, view, CCInteger, ccenum, CCFloat, RenderTexture, SpriteFrame, math } from 'cc';
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

    //#region  RT方案参数
    @property(Camera)
    rtCamera: Camera; 

    @property(CCFloat)
    scale: number = 1.0;

    @property(Sprite)
    topSpriteUseRT: Sprite;
    //#endregion  RT方案参数

    protected onLoad(): void {
        
        SceneLightMgr.rtcamera = this.rtCamera;

        let winSize = new Size(screen.windowSize.width / view.getScaleX(), screen.windowSize.height / view.getScaleY());
        let mat = this.topSprite?.getSharedMaterial(0);
        SceneLightMgr.initMat(mat, winSize.width, winSize.height, this.camera);

        // RT方案
        if (this.rtCamera) {
            // 显示的顶层图片
            this.topSpriteUseRT.getComponent(UITransform).setContentSize(winSize.width, winSize.height);
            // 
            const rtWidth = winSize.width/ this.scale;
            const reHeight = winSize.height/ this.scale;
            this.topSprite.getComponent(UITransform).setContentSize(rtWidth, reHeight);
            // 
            let newRTTex = new RenderTexture();
            newRTTex.initialize({width: rtWidth, height: reHeight});
            this.rtCamera.targetTexture = newRTTex;
            this.rtCamera.orthoHeight = reHeight / 2;

            const sp = new SpriteFrame();
            sp.texture = newRTTex;
            this.topSpriteUseRT.spriteFrame = sp;
        } 
        // 默认方案
        else {
            this.topSprite.getComponent(UITransform).setContentSize(winSize.width, winSize.height);
        }
    }

    public onDestroy() {
        if (this.rtCamera) {
            SceneLightMgr.cleanTimer();
        }
    }
}


