
/**
 * 2D简易光照-管理器
 */
export class SceneLightMgr  {

    static lightPosList: {}= {};

    static material: cc.Material;
    static width: number = 1280;
    static height: number = 720;

    static radio: number = 1;

    //#region 初始化部分
    static initMat(material: cc.Material, width: number, height: number) {
        this.width = width;
        this.height = height;
        if (material) {
            this.material = material;
            this.material.setProperty("whRatio", width/height);
        } else {
            this.material = null;
        }

        // this.radio = this.width / screen.width;
        this.lightPosList = {};
        this.lightSectorList = {};
    }
    //#endregion 初始化部分

    //#region 辅助部分

    // 2.4 shader传入数据需要处理下
    static vecArr2FloatArr(vecArr: cc.Vec4[]) {
        let floatArr = [];
        for (let i = 0; i < vecArr.length; i++) {
            const vec = vecArr[i];
            floatArr.push(vec.x)
            floatArr.push(vec.y)
            floatArr.push(vec.z)
            floatArr.push(vec.w)
        }
        return new Float32Array(floatArr);
    }
    //#endregion 辅助部分


    //#region 光源部分-点光源
    static lightShadow: {} = {}
    static addLightPos(uuid: string, screenPos: cc.Vec2, radius: number, outLen: number, isShadow: boolean = false) {
        this.lightPosList[uuid] = new cc.Vec4(this.radio*screenPos.x/this.width, 1-this.radio*screenPos.y/this.height, radius/this.width, outLen/this.width);
        this.lightShadow[uuid] = new cc.Vec4(isShadow ? 1 : 0, 0, 0, 0);
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
            newArr.push(new cc.Vec4(-1));
            shadowArr.push(new cc.Vec4(-1));
            this.material.setProperty("lights", this.vecArr2FloatArr(newArr));
            this.material.setProperty("lightShadow", this.vecArr2FloatArr(shadowArr));
        }
    }
    //#endregion 光源部分-点光源

    //#region 光源部分-扇形光源
    static lightSectorList: {} = {};

    /**
     * 插入扇形光源数据
     * @param screenPos 圆心位置
     * @param direction 朝向
     * @param radius 半径
     * @param outerWidth 外拓宽度
     * @param angle 张开角度
     * @param angleEx 外拓角度
     * @param isShadow 是否产生阴影
     */
    static addLightSector(uuid: string, screenPos: cc.Vec2, direction: number, radius: number, outerWidth: number, 
        angle: number, angleEx: number, isShadow: boolean = false) {
        
        this.lightSectorList[uuid] = [
            new cc.Vec4(this.radio*screenPos.x/this.width, 1-this.radio*screenPos.y/this.height, direction, isShadow ? 1 : 0),
            new cc.Vec4(radius/this.width, outerWidth/this.height, angle, angleEx),
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
            newArr.push(new cc.Vec4(-1));
            this.material.setProperty("lightSectors", this.vecArr2FloatArr(newArr));
        }
    }
    //#endregion 光源部分-扇形光源

    //#region 遮挡物部分
    static occluderList: {}= {};

    static addOccluder(uuid: string, pos: cc.Vec2[]) {
        let arr = [];
        let sX = 1.0 * this.radio / this.width;
        let sY = 1.0 * this.radio / this.height;
        for (let i = 0; i < pos.length; i++) {
            let pos1 = pos[i];

            if (i == 0) {
                arr.push(new cc.Vec4(Math.ceil(pos.length/2), (pos.length-1)%2, sX*pos1.x, 1.0-sY*pos1.y));
            } else if (i + 1 < pos.length){
                let pos2 = pos[i+1];
                arr.push(new cc.Vec4(sX*pos1.x, 1.0-sY*pos1.y, sX*pos2.x, 1.0-sY*pos2.y));
                i++;
            } else {
                arr.push(new cc.Vec4(sX*pos1.x, 1.0-sY*pos1.y));
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
            newArr.push(new cc.Vec4(-1)); // 避免因为节点隐藏导致计算还保留之前的值
            this.material.setProperty("occluders", this.vecArr2FloatArr(newArr));
        }
    }
    //#endregion 遮挡物部分
}

