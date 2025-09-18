## 2d光照示例

- [Cocos商城链接](https://store.cocos.com/dashboard/detail/8073?distributorid=1617880&share_source=dashboard)

## 简易光照
- 自定义材质
- 支持多个光源
- 支持遮挡物(遮挡光源)

## 使用教程
- 预备1. 创建顶层图片，使用自定义材质
    - **图片需要设置 packable = false**
    - ![step1.png](https://download.cocos.com/CocosStore/resource/555d0c52ba3d4ea89355ff1d3e19af44/555d0c52ba3d4ea89355ff1d3e19af44.png)
- 预备2. 场景添加LightScene组件
    - ![step2.png](https://download.cocos.com/CocosStore/resource/d7b5ab43ec1c46e0883659e5b9ae81c4/d7b5ab43ec1c46e0883659e5b9ae81c4.png)

- 点光源使用. 给节点添加SceneLightComp组件，并设置对应参数
    - ![step4_点光源.png](https://download.cocos.com/CocosStore/resource/62f34b69395b482190fe5c8ac66315c0/62f34b69395b482190fe5c8ac66315c0.png)
- 遮挡物使用. 添加PolygonCollider2D组件生成形状信息，添加SceneLightOccluder组件
    - 如果设置遮挡物，顶层图片自定义材质需要勾选CALC_OCCLUDER
    - ![step3_遮挡物.png](https://download.cocos.com/CocosStore/resource/05e6cb1871584bc98e65039783c837b8/05e6cb1871584bc98e65039783c837b8.png)

- 扇形光源使用. 节点添加SceneLightSector组件，并设置对应参数
    - ![step_扇形光源.png](https://download.cocos.com/CocosStore/resource/f9a6cdc9fd7f45d0ac8e9dd4f81cb385/f9a6cdc9fd7f45d0ac8e9dd4f81cb385.png)

## 注意事项
- 光源和遮挡物节点移动会自动更新数据，目前仅监听挂有组件节点和其父节点。
- 顶层图片
    - 需要设置 packable = false
- 点光源
    - 最大数量为30。 可自行修改 lightScene.effect的light_max_num定义
- 扇形光源
    - 最大数量为30。可自行修改 lightScene.effect的lightSector_max_num定义
- 遮挡物
    - 最大数据长度为200。 可自行修改 lightScene.effect的occluder_max_num定义
    - 如果设置遮挡物，材质需要勾选CALC_OCCLUDER
    - 建议使用简易形状做遮挡物

## 多障碍物时可选用RT方案
- 新建Sprite和Camera, 设置单独Layer！
- ![2dlightrt1.png](https://download.cocos.com/CocosStore/resource/36d66f106f6043d2b763e969490b919a/36d66f106f6043d2b763e969490b919a.png)

手机端测试数据  
| 场景名称 | FPS | 移动时FPS | 备注           |
|----------|---------|---------|----------------|
| LightSceneTest.scene    | 25~      | 25~      | 默认方案   |
| LightSceneTestRT.scene    | 120~       | 80~      | RT方案 |

## 联系作者
- [论坛相关帖子](https://forum.cocos.org/t/topic/170254/4)
- 邮箱 chenshw23@foxmail.com

