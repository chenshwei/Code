## 2d光照示例

- [Cocos商城链接](https://store.cocos.com/dashboard/detail/8073?distributorid=1617880&share_source=dashboard)

## 简易光照
- 自定义材质
- 支持多个光源
- 支持遮挡物(遮挡光源)
- 支持相机移动(仅3.X版本)

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

## 多障碍物时可选用方案
- float使用中等精度
    - lightScene.effect中 `precision highp float;`修改为 `precision mediump float;` 
    - 注意，性能有所提升，但是表现会有点不佳。适合遮挡物为矩形情况。
        - 测试场景中圆形和星星形遮挡物，边缘阴影出现异常
        - 测试场景中矩形遮挡物，表现较为正常
- 光照mesh方案(仅3.X版本)
    - 新建Camera, 设置单独Layer！
    - 将顶层图片改用LightSceneMesh材质！
    - 具体细节可参考LightSceneTestMesh场景
    - 没有光源数量限制、没有遮挡物数量限制。
    - ⚠️**暂时不支持扇形光源** (该方案下点光源部分简单限制即可实现，因为兼容性和设置问题，暂未处理支持)
    - ![lightMesh1.png](https://download.cocos.com/CocosStore/resource/40f130dd6737401d999dd83c1aa67cb3/40f130dd6737401d999dd83c1aa67cb3.png)

手机端测试数据  
| 场景名称 | FPS | 移动时FPS | 备注           |
|----------|---------|---------|----------------|
| LightSceneTest.scene    | 35~      | 35~      | 默认方案 + 高精度   |
| LightSceneTestMesh.scene    | 120~       | 120~      | 光照mesh方案 |

## 联系作者
- [论坛相关帖子](https://forum.cocos.org/t/topic/170254/4)
- 邮箱 chenshw23@foxmail.com

