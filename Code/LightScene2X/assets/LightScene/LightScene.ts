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

        // 以下代码为测试2.x 生成mesh~
        //@ts-ignore
        // let gfx = cc.gfx;
        // const node: cc.Node = new cc.Node("======");
        // node.setParent(this.node.parent);
        // let renderer: cc.MeshRenderer = node.addComponent(cc.MeshRenderer);
        // renderer.receiveShadows = false;
        // renderer.setMaterial(0, this.meshMat);
        // const sss = 200;
        // let mats = renderer.getMaterial(0)
        // mats.setProperty('radius', sss/2);
        // mats.setProperty('outlen', sss/3);
        // var vfmtPosColor = new gfx.VertexFormat([
        //     {name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 3},
        // ]);
        // let mesh = new cc.Mesh();
        // mesh.init(vfmtPosColor, 8, true);
        // mesh.setVertices(gfx.ATTR_POSITION, [cc.v3(-sss, sss, 0), cc.v3(-sss, -sss, 0), cc.v3(sss, sss, 0), cc.v3(sss, -sss, 0),]);
        // mesh.setIndices([0, 1, 2, 1, 3, 2,]);
        // renderer.mesh = mesh;
    }
}


