import { SceneLightMgr } from './comp/SceneLightMgr';
const { ccclass, property } = cc._decorator;

/**
 * 2D灯光 demo
 */
@ccclass
export class LightScene extends cc.Component {
    @property(cc.Sprite)
    topSprite: cc.Sprite = undefined;

    //#region  mesh方案参数
    @property(cc.Camera)
    meshCamera: cc.Camera = undefined; 

    @property(cc.Node)
    meshParentNode: cc.Node = undefined;

    @property(cc.Material)
    meshMat: cc.Material = undefined;

    @property(cc.Sprite)
    meshTestGM: cc.Sprite = undefined;
    //#endregion  mesh方案参数

    protected onLoad(): void {
        SceneLightMgr.meshMaterial = this.meshMat;
        SceneLightMgr.meshParentNode = this.meshParentNode;
        if (this.meshCamera) {
            SceneLightMgr.isMesh = true;
        } else {
            SceneLightMgr.isMesh = false;
        }

        let mat = this.topSprite?.getMaterial(0);

        // RT方案
        if (this.meshCamera) {
            const rtScale = 1;
            const rtWidth = cc.winSize.width / rtScale;
            const reHeight = cc.winSize.height / rtScale;
            
            let newRTTex = new cc.RenderTexture();
            newRTTex.initWithSize(rtWidth, reHeight);
            this.meshCamera.targetTexture = newRTTex;
            this.meshCamera.ortho = true;
            this.meshCamera.orthoSize = cc.winSize.height / 2;
            mat.setProperty("lightTexture", newRTTex)

            if (this.meshTestGM) {
                const sp = new cc.SpriteFrame();
                sp.setTexture(newRTTex);
                this.meshTestGM.spriteFrame = sp;
                this.meshTestGM.node.setContentSize(cc.winSize.width, cc.winSize.height);
            } 
        }

        SceneLightMgr.initMat(mat);
        this.topSprite.node.setContentSize(cc.winSize.width, cc.winSize.height);
    }
}


