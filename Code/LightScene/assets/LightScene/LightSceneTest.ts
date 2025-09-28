import { _decorator, Component, Node, Toggle } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 测试组件
 */
@ccclass('LightSceneTest')
export class LightSceneTest extends Component {
    @property([Node])
    nodeList: Node[] = [];

    @property([Toggle])
    togList: Toggle[] = []; 

    protected onEnable(): void {
        for (let i = 0; i < this.togList.length; i++) {
            const toggle = this.togList[i];
            let id = i;
            toggle.node.on(Toggle.EventType.TOGGLE, () => {
                this.updateVis(id);
            });
            this.updateVis(id);
        }
    }

    private updateVis(id: number) {
        this.nodeList[id].active = this.togList[id].isChecked;
    }
}


