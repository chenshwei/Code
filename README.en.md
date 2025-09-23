## Simple Fake Lighting
- Custom Material
- Support for Multiple Light Sources
- Support for Occluders (Blocking Light Sources)

## Usage Tutorial
- Preparation 1: Create a top-level image and use a custom material.
    - **The image needs to set packable = false**
    - ![step1.png](https://download.cocos.com/CocosStore/resource/555d0c52ba3d4ea89355ff1d3e19af44/555d0c52ba3d4ea89355ff1d3e19af44.png)
- Preparation 2: Add the LightScene component to the scene.
    - ![step2.png](https://download.cocos.com/CocosStore/resource/d7b5ab43ec1c46e0883659e5b9ae81c4/d7b5ab43ec1c46e0883659e5b9ae81c4.png)

- Point Light Source Usage: Add the SceneLightComp component to the node and set the corresponding parameters.
    - ![step4_PointLight.png](https://download.cocos.com/CocosStore/resource/7ccc05d50bb74173a23739dd27a7f3a3/7ccc05d50bb74173a23739dd27a7f3a3.png)
    - If light need to generate shadows, please check isShadow
- Occluder Usage: Add the PolygonCollider2D component to generate shape information, and add the SceneLightOccluder component.
    - If an occluder is set, the custom material of the top-level image needs to have CALC_OCCLUDER checked.
    - ![step3_Occluder.png](https://download.cocos.com/CocosStore/resource/05e6cb1871584bc98e65039783c837b8/05e6cb1871584bc98e65039783c837b8.png)

- Sector Light Source Usage: Add the SceneLightSector component to the node and set the corresponding parameters.
    - ![step_扇形光源.png](https://download.cocos.com/CocosStore/resource/ba0919606fcc4eb2938c4416af44bfaf/ba0919606fcc4eb2938c4416af44bfaf.png)
    - If light need to generate shadows, please check isShadow

## Notes
- The movement of light source and occluder nodes will automatically update data; currently, only the nodes with components and their parent nodes are monitored.
- Top-Level Image:
    - Needs to have packable = false
- Point Light Source:
    - Maximum number is 30. You can modify the light_max_num definition in lightScene.effect by yourself.
- Sector Light Source:
    - Maximum number is 30. You can modify the lightSector_max_num definition in lightScene.effect by yourself.
- Occluder:
    - Maximum data length is 200. You can modify the occluder_max_num definition in lightScene.effect by yourself.
    - If an occluder is set, the material needs to have CALC_OCCLUDER checked.
    - It is recommended to use simple shapes as occluders.

## Solutions for Multiple Obstacles
- RT (Render Texture) Solution
    - Create a new `Sprite` and `Camera`, and set a separate layer!
    - ![2dlightrt1.png](https://download.cocos.com/CocosStore/resource/36d66f106f6043d2b763e969490b919a/36d66f106f6043d2b763e969490b919a.png)
- Using Medium Precision for Float
    - In [lightScene.effect](file://e:\N1\TestGithub\Code\LightScene\assets\LightScene\effect\lightScene.effect), change `precision highp float;` to `precision mediump float;`
    - Note: Performance is improved, but the visual quality may degrade.
        - In the test scene with circular and star-shaped occluders, abnormal shadows appear at the edges.
        - In the test scene with rectangular occluders, the performance is relatively normal.

Mobile Test Data  
| Scene Name | FPS | FPS While Moving | Remarks |
|----------|---------|---------|----------------|
| LightSceneTest.scene | 25~ | 25~ | Default solution + High precision |
| LightSceneTest.scene | 30~ | 30~ | Default solution + Medium precision |
| LightSceneTestRT.scene | 120~ | 80~ | RT solution + High precision |
| LightSceneTestRT.scene | 120~ | 105~ | RT solution + Medium precision |

## Contact the Author
- [Related Forum Post](https://forum.cocos.org/t/topic/170254/4)
- Email: chenshw23@foxmail.com