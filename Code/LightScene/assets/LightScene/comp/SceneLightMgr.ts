import { _decorator, Camera, screen, Material, Node, Vec3, Vec4, Vec2, renderer, utils, primitives, MeshRenderer, Mesh, Layers, view, sys, math, Scene } from "cc";

/**
 * 2D简易光照-管理器
 */
export class SceneLightMgr  {
    static isMesh: boolean = false;
    static material: Material;
    static matPass: renderer.Pass;
    static passHandle: {[name: string]: number} = {}

    static width: number = 1280;
    static height: number = 720;
    static scaleX: number = 1;
    static camera: Camera;

    //#region 初始化部分
    static initMat(material: Material, camera: Camera) {
        this.camera = camera;
        
        this.width = screen.windowSize.width;
        this.height = screen.windowSize.height;
        this.scaleX = view.getScaleX();
        
        if (material) {
            this.material = material;
            this.material.setProperty("wh_ratio", this.width/this.height);
            this.matPass = material.passes[0];
            let nameList = ["lights", "lightShadow", "lightSectors", "occluders"]
            for (let i = 0; i < nameList.length; i++) {
                const name = nameList[i];
                this.passHandle[name] = this.matPass.getHandle(name)
            }
            this.isMesh = material.name == "lightSceneMesh";
        } else {
            this.material = null;
            this.isMesh = false;
        }

        this.lightPosList = {};
        this.lightSectorList = {};
    }
    //#endregion 初始化部分


    //#region 光源部分-点光源
    static lightPosList: {[uuid: string]: Vec4}= {};
    static lightShadow: {[uuid: string]: Vec4} = {}
    static lightWorldPosList: {[uuid: string]: Vec4} = {}

    static addLightPos(uuid: string, pos: Vec3, radius: number, outLen: number, isShadow: boolean = false) {
        // if (!this.camera) return;
        let screenPos = this.camera.worldToScreen(pos);

        if (this.lightWorldPosList[uuid]) {
            this.lightWorldPosList[uuid].set(pos.x, pos.y, radius, outLen);
        } else {
            this.lightWorldPosList[uuid] = this.getVec4(pos.x, pos.y, radius, outLen);
        }

        const x = screenPos.x/this.width;
        const y = 1-screenPos.y/this.height;
        const z = this.scaleX * radius/this.height;
        const w = this.scaleX * outLen/this.height;

        if (this.lightPosList[uuid]) {
            this.lightPosList[uuid].set(x, y, z, w);
            this.lightShadow[uuid].set(isShadow ? 1 : 0);
        } else {
            this.lightPosList[uuid] = this.getVec4(x, y, z, w);
            this.lightShadow[uuid] = this.getVec4(isShadow ? 1 : 0);
        }

        if (this.isMesh) {
            if (isShadow) { // 产生阴影的灯才需要重算光照mesh
                this.updateLightAreaOcc(uuid);
                this.updateLightMesh(uuid);
            } else { // 不产生阴影的灯 更新位置~
                if (!this.lightMeshMap.has(uuid)) { // 未创建-确定mesh
                    this.updateLightMesh(uuid);
                } else { // 已创建-更新位置
                    const lightMesh = this.lightMeshMap.get(uuid);
                    lightMesh.node.setWorldPosition(pos.x, pos.y, 0);
                }
            }
        } else {
            this.updateMaterial();
        }
    }

    static removeLight(uuid: string) {
        if (this.lightPosList[uuid]) {
            this.cacheVec4(this.lightPosList[uuid])
        }
        if (this.lightShadow[uuid]) {
            this.cacheVec4(this.lightShadow[uuid])
        }
        if (this.lightWorldPosList[uuid]) {
            this.cacheVec4(this.lightWorldPosList[uuid])
        }
        this.lightPosList[uuid] = null;
        this.lightShadow[uuid] = null;
        this.lightWorldPosList[uuid] = null;
        this._light2Occ[uuid] = null;

        if (this.isMesh) {
            if (this.lightMeshMap.has(uuid)) {
                const lightMesh = this.lightMeshMap.get(uuid);
                if (lightMesh && lightMesh.node) {
                    lightMesh.node.removeFromParent();
                    lightMesh.node.destroy();
                }
                this.lightMeshMap.delete(uuid);
            }
        } else {
            this.updateMaterial();
        }
    }

    static updateMaterial() {
        if (this.isMesh) return;
        if (this.material) {
            let newArr = [];
            let shadowArr = [];
            for (const key in this.lightPosList) {
                const element = this.lightPosList[key];
                if (element) {
                    newArr.push(element);
                    shadowArr.push(this.lightShadow[key]);  
                }
            }
            const endV = this.getVec4(-1);
            newArr.push(endV);
            
            // this.material.setProperty("lights", newArr);
            // this.material.setProperty("lightShadow", shadowArr);
            this.matPass.setUniformArray(this.passHandle["lights"], newArr);
            this.matPass.setUniformArray(this.passHandle["lightShadow"], shadowArr);
            this.cacheVec4(endV);
        }
    }
    //#endregion 光源部分-点光源

    //#region 光源部分-扇形光源
    static lightSectorList: {[uuid: string]: Vec4[]} = {};

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

        const x = screenPos.x/this.width;
        const y = 1-screenPos.y/this.height;
        const z = direction;
        const w = isShadow ? 1 : 0;
        const x2 = this.scaleX * radius/this.height;
        const y2 = this.scaleX * outerWidth/this.height;
        const z2 = angle;
        const w2 = angleEx;
        if (this.lightSectorList[uuid]) {
            this.lightSectorList[uuid][0].set(x, y, z, w);
            this.lightSectorList[uuid][1].set(x2, y2, z2, w2);
        } else {
            this.lightSectorList[uuid] = [this.getVec4(x, y, z, w), this.getVec4(x2, y2, z2, w2)]
        }
        this.updateMatSector();
    }

    static removeLightSector(uuid: string) {
        if (this.lightSectorList[uuid]) {
            this.cacheVec4s(this.lightSectorList[uuid]);
        }
        this.lightSectorList[uuid] = null;
        this.updateMatSector();
    }

    static updateMatSector() { 
        if (this.isMesh) return;
        if (this.material) {
            let newArr = [];
            for (const key in this.lightSectorList) {
                const element = this.lightSectorList[key];
                if (element) {
                    newArr.push(element[0]);
                    newArr.push(element[1]);
                }
            }
            const endV = this.getVec4(-1);
            newArr.push(endV);
            
            // this.material.setProperty("lightSectors", newArr);
            this.matPass.setUniformArray(this.passHandle["lightSectors"], newArr);
            this.cacheVec4(endV);
        }
    }
    //#endregion 光源部分-扇形光源

    //#region 遮挡物部分
    static occluderList: {[uuid: string]: Vec4[]} = {};
    static occluderRectList: {[uuid: string]: Vec4} = {};
    static occluderWorldPosList: {[uuid: string]: Vec2[]} = {};

    private static _tmpVec3 = new Vec3();
    private static worldToUV(pos: Vec2) { 
        this._tmpVec3.set(pos.x, pos.y, 0);
        let screenPos = this.camera.worldToScreen(this._tmpVec3);
        return new Vec2(screenPos.x/this.width, 1-screenPos.y/this.height);
    }

    static addOccluder(uuid: string, posList: readonly Readonly<Vec2>[]) {
        //世界坐标数据
        let rect: Vec4 = this.getVec4(0);
        if (this.occluderWorldPosList[uuid]) {
            this.cacheVec2s(this.occluderWorldPosList[uuid]);
        }
        this.occluderWorldPosList[uuid] = [];
        for (let i = 0; i < posList.length; i++) {
            const pos = posList[i];
            this.occluderWorldPosList[uuid].push(this.getVec2(pos.x, pos.y));
            if (i == 0) {
                rect.set(pos.x, pos.y, pos.x, pos.y);
            } else {
                rect.x = Math.min(rect.x, pos.x);
                rect.y = Math.min(rect.y, pos.y);
                rect.z = Math.max(rect.z, pos.x);
                rect.w = Math.max(rect.w, pos.y);
            }
        }
        this.occluderRectList[uuid] = rect;

        // 如果是mesh情况 不需要uv数据
        if (this.isMesh) {
            this._onOccUpdatePos(uuid);
            return;
        }

        // uv数据
        let arr: Vec4[]  = [];
        for (let i = 0; i < posList.length; i++) {
            
            let pos1 = this.worldToUV(posList[i]);

            if (i == 0) {
                arr.push(this.getVec4(Math.ceil(posList.length/2), (posList.length-1)%2, pos1.x, pos1.y));
            } else if (i + 1 < posList.length){
                let pos2 = this.worldToUV(posList[i+1]);
                arr.push(this.getVec4(pos1.x, pos1.y, pos2.x, pos2.y));
                i++;
            } else {
                arr.push(this.getVec4(pos1.x, pos1.y));
                i++;
            }
        }
        this.occluderList[uuid] = arr;

        this.updateMatOccluder();
    }
    static removeOccluder(uuid: string) {
        if (this.occluderList[uuid]) {
            this.cacheVec4s(this.occluderList[uuid])
        }
        if (this.occluderWorldPosList[uuid]) {
            this.cacheVec2s(this.occluderWorldPosList[uuid]);
        }
        this.occluderWorldPosList[uuid] = null;
        this.occluderList[uuid] = null;
        this.updateMatOccluder();

        if (this.isMesh) {
            for (const lightId in this._light2Occ) {
                const list = this._light2Occ[lightId]
                if (list && list.includes(uuid)) {
                    let id = list.findIndex(v => v == uuid)
                    list.splice(id, 1);
                    this.updateLightMesh(lightId);
                }
            }
        }
    }
    static updateMatOccluder() {
        if (this.isMesh) return; // 如果是mesh情况 不需要
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
            const endV = this.getVec4(-1);
            newArr.push(endV); // 避免因为节点隐藏导致计算还保留之前的值
            // this.material.setProperty("occluders", newArr);
            this.matPass.setUniformArray(this.passHandle["occluders"], newArr);
            this.cacheVec4(endV);
        }
    }
    //#endregion 遮挡物部分

    //#region Vec4 cache
    private static _vec4Cache: Vec4[] = [];

    private static getVec4(x?: number, y?: number, z?: number, w?: number): Vec4 {
        if (this._vec4Cache.length > 0) {
            let vec4 = this._vec4Cache.pop();
            return vec4.set(x, y, z, w);
        }
        return new Vec4(x, y, z, w);
    }

    private static cacheVec4(vec4: Vec4) {
        this._vec4Cache.push(vec4);
    }

    private static cacheVec4s(vec4Arr: Vec4[]) {
        for (let index = 0; index < vec4Arr.length; index++) {
            this._vec4Cache.push(vec4Arr[index]);
        }
    }

    //#endregion Vec4 cache

    //#region Vec2 cache
    private static _vec2Cache: Vec2[] = [];

    private static getVec2(x?: number, y?: number): Vec2 {
        if (this._vec2Cache.length > 0) {
            let vec2 = this._vec2Cache.pop();
            return vec2.set(x, y);
        }
        return new Vec2(x, y);
    }

    private static cacheVec2(vec2: Vec2) {
        this._vec2Cache.push(vec2);
    }

    private static cacheVec2s(vec2Arr: Vec2[]) {
        for (let index = 0; index < vec2Arr.length; index++) {
            this._vec2Cache.push(vec2Arr[index]);
        }
    }

    //#endregion Vec4 cache

    //#region 光照mesh-相关计算

    // 记录光照内有哪些遮挡物
    private static _light2Occ: {[uuid: string]: string[]} = {};
    // 重新计算某光照范围内的遮挡物
    private static updateLightAreaOcc(uuid: string) {
        const lightData = this.lightWorldPosList[uuid];
        const r = (lightData.z + lightData.w);
        const lightRect = this.getVec4(lightData.x - r, lightData.y - r, lightData.x + r, lightData.y + r)
        this._light2Occ[uuid] = [];
        for (const occUUID in this.occluderRectList) {
            const rect = this.occluderRectList[occUUID];
            if (rect && this._crossRect(lightRect, rect)) {
                this._light2Occ[uuid].push(occUUID);
            }
        }
        this.cacheVec4(lightRect);
    }

    // 判断矩形是否相交
    private static _crossRect(v1: Vec4, v2: Vec4): boolean {
        return !(v1.x > v2.z || v1.z < v2.x || v1.y > v2.w || v1.w < v2.y);
    }

    private static _onOccUpdatePos(occUUID: string) {
        let effLights = []
        // 计算新位置影响的光源
        const rect = this.occluderRectList[occUUID];
        for (const lightId in this.lightWorldPosList) {
            const lightData = this.lightWorldPosList[lightId];
            if (!lightData) continue;
            const isShadow = this.lightShadow[lightId].x >= 0.5;
            if (!isShadow) continue;

            const r = (lightData.z + lightData.w);
            const lightRect = this.getVec4(lightData.x - r, lightData.y - r, lightData.x + r, lightData.y + r)
            if (this._crossRect(lightRect, rect)) {
                effLights.push(lightId);
            } else {
                let list = this._light2Occ[lightId];
                if (list && list.includes(occUUID)) {
                    effLights.push(lightId);
                }
            }
        }

        //
        for (let i = 0; i < effLights.length; i++) {
            const lightId = effLights[i];
            this.updateLightAreaOcc(lightId);
            this.updateLightMesh(lightId);
        }
    }

    /**
     * 获取灯光范围内的遮挡物 的 全部线段
     */
    private static _getAllOccSeg(lightId: string): {start: Vec2, end: Vec2}[] {
        const list = this._light2Occ[lightId];
        const segList = [];
        if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                const occData = this.occluderWorldPosList[list[i]];
                if (!occData) continue;
                for (let j = 0; j < occData.length; j++) {
                    let nextId = (j + 1) % occData.length;
                    segList.push({
                        start: this.getVec2(occData[j].x, occData[j].y),
                        end: this.getVec2(occData[nextId].x, occData[nextId].y)
                    })
                }
            }
        }
        return segList;
    }

    private static getRayMinPos(origin: Vec2, direction: Vec2, maxDis: number, segList: {start: Vec2, end: Vec2}[]) {
        let minPos: Vec2 = null;
        let minDis: number = Infinity;
        for (let i = 0; i < segList.length; i++) {
            const seg = segList[i];
            const inter = this.getRayLineInter(origin, direction, seg.start, seg.end, maxDis);
            if (inter) {
                const sss = this.getVec2(inter.x - origin.x, inter.y - origin.y);
                const dis = sss.length();
                if (dis < minDis) {
                    minDis = dis;
                    minPos = inter;
                }
            }
        }
        return minPos;
    }
    private static getRayLineInter(origin: Vec2, direction: Vec2, p1: Vec2, p2: Vec2, maxDis: number): Vec2 | null {
        const a11 = direction.x;
        const a12 = -(p2.x - p1.x);
        const a21 = direction.y;
        const a22 = -(p2.y - p1.y);
        const determinant = a11 * a22 - a12 * a21;
        if (Math.abs(determinant) < 1e-6 ) return null; // 平行或重合

        const b1 = p1.x - origin.x;
        const b2 = p1.y - origin.y;
        const t = (a22 * b1 - a12 * b2) / determinant;
        const s = (a11 * b2 - a21 * b1) / determinant;
        if (t >= 0 && t <= maxDis && s >= 0 && s <= 1) {
            return new Vec2(
                origin.x + t * direction.x,
                origin.y + t * direction.y
            );
        }
        return null;
    }

    //#endregion 光照mesh-相关计算

    //#region 光照mesh-创建和更新
    public static meshParentNode: Node;
    public static meshMaterial: Material;
    private static lightMeshMap = new Map<string, {node:Node, renderer: MeshRenderer, mesh:Mesh, geometry: primitives.IDynamicGeometry}>();
    private static lightMeshLayer = 1 << Layers.nameToLayer("LightTest");
    private static createMeshNode(lightId: string) {
        const node: Node = new Node(lightId);
        node.parent = this.meshParentNode;
        node.layer = this.lightMeshLayer;
        
        let renderer: MeshRenderer = node.addComponent(MeshRenderer);
        renderer.material = this.meshMaterial;
        renderer.receiveShadowForInspector = false;

        let lightData = this.lightWorldPosList[lightId];
        let mat = renderer.getMaterialInstance(0)
        mat.setProperty('radius', lightData.z);
        mat.setProperty('outlen', lightData.w);

        const vertices: Float32Array = new Float32Array(1);
        const indices: Uint16Array = new Uint16Array(1);
        const colors: Float32Array = new Float32Array(1);
        const normals: Float32Array = new Float32Array(1);

        let geometry: primitives.IDynamicGeometry = {
            positions: vertices,
            indices16: indices,
            colors: colors,
            normals: normals
        };
        let ptions: primitives.ICreateDynamicMeshOptions = {
            maxSubMeshes: 1,
            maxSubMeshVertices: 4096,
            maxSubMeshIndices: 4096
        };
        // 创建参数 不修改时候顶点超过341个就报错了 (2048/6=341.33?)
        let mesh = utils.MeshUtils.createDynamicMesh(0, geometry, null, ptions);
        renderer.mesh = mesh;

        this.lightMeshMap.set(lightId, {node, renderer, mesh, geometry});
    }

    private static updateMesh(lightId: string, posList: Vec2[]) {
        if (!this.lightMeshMap.has(lightId)) {
            this.createMeshNode(lightId);
        }
        const lightMesh = this.lightMeshMap.get(lightId);
        //位置更新
        const worldPos = this.lightWorldPosList[lightId];
        lightMesh.node.setWorldPosition(worldPos.x, worldPos.y, 0);
        // 最后一个点为圆心
        const posLen = posList.length;
        const posLen2 = posLen - 1;
        let vertices: Float32Array = new Float32Array(posLen*3);
        let indices: Uint16Array = new Uint16Array((posLen - 1) * 3);
        let colors: Float32Array = new Float32Array(posLen*4);
        let normals: Float32Array = new Float32Array(posLen * 3);
        for (let i = 0; i < posLen; i++) {
            const id = i * 3;
            vertices[id] = posList[i].x;
            vertices[id + 1] = posList[i].y;
            vertices[id + 2] = 0;
            if (i != posLen2) {
                indices[id] = i;
                indices[id + 1] = (i + 1) % posLen2;
                indices[id + 2] = posLen2;
            }
            normals[id] = 0;
            normals[id + 1] = 0;
            normals[id + 2] = 1;


            const cId = i*4;
            colors[cId] = 0.0;
            colors[cId+1] = 0.0;
            colors[cId+2] = 0.0;
            colors[cId+3] = 1.0;
            if (lightId == "54b/ywiGlJIaOoBMHtSHTa") {
                colors[cId] = 0.1;
                colors[cId+1] = 0.2;
                colors[cId+2] = 0.3;
            } else {
                colors[cId] = 0.4;
                colors[cId+1] = 0.5;
                colors[cId+2] = 0.6;
            }
            // if (i == posLen2) {
            //     colors[cId+3] = 1.0;
            // }
        }
        lightMesh.geometry.positions = vertices;
        lightMesh.geometry.indices16 = indices;
        lightMesh.geometry.colors = colors;
        lightMesh.geometry.normals = normals;
        // 刷新
        lightMesh.mesh.updateSubMesh(0, lightMesh.geometry);
        lightMesh.renderer.onGeometryChanged();
    }

    
    static updateLightMesh(lightId: string) {
        const lightData = this.lightWorldPosList[lightId];
        if (!lightData) return;
        const origin = this.getVec2(lightData.x, lightData.y);
        const maxDis = lightData.z + lightData.w;
        
        // 获取范围内遮挡物线段
        const segList = this._getAllOccSeg(lightId);

        // 
        this._calOccLinePos(lightId, origin, maxDis, segList)

        // 
        for (let index = 0; index < segList.length; index++) {
            this.cacheVec2(segList[index].start);
            this.cacheVec2(segList[index].end);
        }
        this.cacheVec2(origin);
    }

    
    // 计算圆心和线段相加点
    private static _calOccLinePos(lightId: string, origin: Vec2, maxDis: number, segList: {start: Vec2, end: Vec2}[]) { 
        let rayDir: Vec2 = this.getVec2(0, 0);
        
        let exDirList: number[] = []; // 额外需要计算的角度
        function addExAngle(pos: Vec2) { 
            let angle = math.toDegree(Math.atan2(pos.y - origin.y, pos.x - origin.x));
            if (angle < 0) angle += 360;
            exDirList.push(angle);
            exDirList.push(angle - 0.01);
            exDirList.push(angle + 0.01);
        }
        for (let i = 0; i < segList.length; i++) {
            const seg = segList[i];
            addExAngle(seg.start);
        }
        // 去除重复的角度
        if (exDirList.length > 0) {
            exDirList.sort((a, b) => a-b);
            for (let index = exDirList.length-1; index > 0; index--) {
                if (Math.abs(exDirList[index] - exDirList[index-1]) < 1e-6) {
                    exDirList.splice(index, 1);
                }
            }
        }

        if (this._rDirectList.length <= 0) this._initRDirectList();

        //
        let posList = []
        if (exDirList.length > 0) { // 有额外角度需要计算
            let id1 = 0;
            let id2 = 0;
            function addDefault() {
                const data = SceneLightMgr._rDirectList[id1];
                let pos = SceneLightMgr.getRayMinPos(origin, data.dir, maxDis, segList);
                if (pos) {
                    posList.push(SceneLightMgr.getVec2(pos.x - origin.x, pos.y - origin.y))
                } else {
                    posList.push(SceneLightMgr.getVec2(data.dir.x * maxDis, data.dir.y * maxDis))
                }
                id1++;
            }
            function addExtra() {
                const rad = math.toRadian(exDirList[id2]);
                const dir = SceneLightMgr.getVec2(Math.cos(rad), Math.sin(rad))
                let pos = SceneLightMgr.getRayMinPos(origin, dir, maxDis, segList);
                if (pos) {
                    posList.push(SceneLightMgr.getVec2(pos.x - origin.x, pos.y - origin.y))
                } else {
                    posList.push(SceneLightMgr.getVec2(dir.x * maxDis, dir.y * maxDis))
                }
                id2++;
            }
            while (id1 < this._rDirectList.length || id2 < exDirList.length) {
                if (id1 >= this._rDirectList.length) {
                    addExtra();
                } else if (id2 >= exDirList.length) {
                    addDefault();
                } else {
                    const angle1 = this._rDirectList[id1].angle;
                    const angle2 = exDirList[id2];
                    if (Math.abs(angle1 - angle2) < 1e-6) {
                        addDefault();
                        id2++;
                    } else if (angle1 < angle2) { 
                        addDefault();
                    } else {
                        addExtra();
                    }
                }
            }
        } else { // 光照区域无遮挡物
            for (let i = 0; i < this._rDirectList.length; i++) {
                const data = this._rDirectList[i];
                posList.push(this.getVec2(data.dir.x * maxDis, data.dir.y * maxDis))
            }
        }
        posList.push(this.getVec2(0, 0));
        
        this.updateMesh(lightId, posList);
        
        this.cacheVec2(rayDir);
    }

    private static _rDirStep: number = 100;
    private static readonly _rDirectList: {dir: Vec2, angle: number}[] = [];
    // 初始射线方向列表
    private static _initRDirectList() {
        const rr = 2 * Math.PI / this._rDirStep;
        for (let i = 0; i < this._rDirStep; i++) {
            const degree = i * rr;
            const angle = math.toDegree(degree);
            const dir = this.getVec2(Math.cos(degree), Math.sin(degree))
            this._rDirectList.push({dir: dir, angle: angle})
        }
    }

    //#endregion 光照mesh-创建和更新
}

