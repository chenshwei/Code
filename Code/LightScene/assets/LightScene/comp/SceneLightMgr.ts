import { _decorator, Camera, screen, Material, Vec3, Vec4, Vec2 } from "cc";

/**
 * 2D简易光照-管理器
 */
export class SceneLightMgr  {

    static lightPosList: {}= {};

    static material: Material;
    static width: number = 1280;
    static height: number = 720;
    static camera: Camera;

    static radio: number = 1;

    //#region 初始化部分
    static initMat(material: Material, width: number, height: number, camera: Camera) {
        this.camera = camera;
        
        this.width = width;
        this.height = height;
        if (material) {
            this.material = material;
            this.material.setProperty("wh_ratio", width/height);
        } else {
            this.material = null;
        }

        this.radio = this.width / screen.windowSize.width;
        this.lightPosList = {};
        this.lightSectorList = {};
    }
    //#endregion 初始化部分


    //#region 光源部分-点光源
    static lightShadow: {} = {}
    static addLightPos(uuid: string, pos: Vec3, radius: number, outLen: number, isShadow: boolean = false) {
        // if (!this.camera) return;
        let screenPos = this.camera.worldToScreen(pos);

        this.lightPosList[uuid] = new Vec4(this.radio*screenPos.x/this.width, 1-this.radio*screenPos.y/this.height, radius/this.width, outLen/this.width);
        this.lightShadow[uuid] = new Vec4(isShadow ? 1 : 0, 0, 0, 0);
        this.updateMaterial();
    }

    static removeLight(uuid: string) {
        this.lightPosList[uuid] = null;
        this.updateMaterial();
    }

    static updateMaterial() {
        if (this.material) {
            let newArr = [];
            let shadowArr = [];
            for (const key in this.lightPosList) {
                const element = this.lightPosList[key];
                newArr.push(element);
                shadowArr.push(this.lightShadow[key]);
            }
            newArr.push(new Vec4(-1));
            this.material.setProperty("lights", newArr);
            this.material.setProperty("lightShadow", shadowArr);
        }
    }
    //#endregion 光源部分-点光源

    //#region 光源部分-扇形光源
    static lightSectorList: {} = {};

    /**
     * 插入扇形光源数据
     * @param pos 圆心位置
     * @param direction 朝向
     * @param radius 半径
     * @param outerWidth 外拓宽度
     * @param angle 张开角度
     * @param angleEx 外拓角度
     * @param isShadow 是否产生阴影
     */
    static addLightSector(uuid: string, pos: Vec3, direction: number, radius: number, outerWidth: number, 
        angle: number, angleEx: number, isShadow: boolean = false) {
        if (!this.camera) return;
        let screenPos = this.camera.worldToScreen(pos);
        this.lightSectorList[uuid] = [
            new Vec4(this.radio*screenPos.x/this.width, 1-this.radio*screenPos.y/this.height, direction, isShadow ? 1 : 0),
            new Vec4(radius/this.width, outerWidth/this.height, angle, angleEx),
        ];
        this.updateMatSector();
    }

    static removeLightSector(uuid: string) {
        this.lightSectorList[uuid] = null;
        this.updateMatSector();
    }

    static updateMatSector() { 
        if (this.material) {
            let newArr = [];
            for (const key in this.lightSectorList) {
                const element = this.lightSectorList[key];
                if (element) {
                    newArr.push(element[0]);
                    newArr.push(element[1]);
                }
            }
            newArr.push(new Vec4(-1));
            this.material.setProperty("lightSectors", newArr);
        }
    }
    //#endregion 光源部分-扇形光源

    //#region 遮挡物部分
    static occluderList: {}= {};

    private static _tmpVec3 = new Vec3();
    private static worldToScreen(pos: Vec2) { 
        this._tmpVec3.set(pos.x, pos.y, 0);
        let screenPos = this.camera.worldToScreen(this._tmpVec3);
        return new Vec2(this.radio*screenPos.x/this.width, 1-this.radio*screenPos.y/this.height);
    }

    static addOccluder(uuid: string, pos: readonly Readonly<Vec2>[]) {
        let arr = [];
        for (let i = 0; i < pos.length; i++) {
            let pos1 = this.worldToScreen(pos[i]);

            if (i == 0) {
                arr.push(new Vec4(Math.ceil(pos.length/2), (pos.length-1)%2, pos1.x, pos1.y));
            } else if (i + 1 < pos.length){
                let pos2 = this.worldToScreen(pos[i+1]);
                arr.push(new Vec4(pos1.x, pos1.y, pos2.x, pos2.y));
                i++;
            } else {
                arr.push(new Vec4(pos1.x, pos1.y));
                i++;
            }
        }
        this.occluderList[uuid] = arr;
        
        this.updateMatOccluder();
    }
    static removeOccluder(uuid: string) {
        this.occluderList[uuid] = null;
        this.updateMatOccluder();
    }
    static updateMatOccluder() {
        if (this.material) {
            let newArr = [];
            for (const key in this.occluderList) {
                const element = this.occluderList[key];
                if (element) {
                    for (let index = 0; index < element.length; index++) {
                        newArr.push(element[index]);
                    }
                }
            }
            newArr.push(new Vec4(-1)); // 避免因为节点隐藏导致计算还保留之前的值
            this.material.setProperty("occluders", newArr);
        }
    }
    //#endregion 遮挡物部分
}

