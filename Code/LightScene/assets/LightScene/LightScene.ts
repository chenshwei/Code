import { _decorator, Camera, Component, Sprite, UITransform, screen, Size, view, RenderTexture, SpriteFrame, Node, Material } from 'cc';
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

    //#region  mesh方案参数
    @property(Camera)
    meshCamera: Camera; 

    @property(Node)
    meshParentNode: Node;

    @property(Material)
    meshMat: Material;

    @property(Sprite)
    meshTestGM: Sprite;
    //#region  mesh方案参数

    protected onLoad(): void {
        SceneLightMgr.meshMaterial = this.meshMat;
        SceneLightMgr.meshParentNode = this.meshParentNode;

        let winSize = new Size(screen.windowSize.width / view.getScaleX(), screen.windowSize.height / view.getScaleY());
        let mat = this.topSprite?.getSharedMaterial(0);
        SceneLightMgr.initMat(mat, this.camera);

        this.topSprite.getComponent(UITransform).setContentSize(winSize.width, winSize.height);

        // RT方案
        if (this.meshCamera) {
            const rtScale = 1;
            const rtWidth = winSize.width / rtScale;
            const reHeight = winSize.height / rtScale;
            
            let newRTTex = new RenderTexture();
            newRTTex.initialize({width: rtWidth, height: reHeight});
            this.meshCamera.targetTexture = newRTTex;
            this.meshCamera.orthoHeight = winSize.height / 2;
            if (SceneLightMgr.isMesh) {
                mat.setProperty("lightTexture", newRTTex)
            }

            // if (this.meshTestGM) {
            //     const sp = new SpriteFrame();
            //     sp.texture = newRTTex;
            //     this.meshTestGM.spriteFrame = sp;
            //     this.meshTestGM.getComponent(UITransform).setContentSize(winSize.width, winSize.height);
            // } 
        } 
    }

    public onDestroy() {
        
    }
}


