## Simple Fake Lighting
- Custom Material
- Support for Multiple Light Sources
- Support for Occluders (Blocking Light Sources)
- Support camera movement (only for Creator 3.X)

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
- Use medium precision for float
    - In [lightScene.effect](file://e:\N1\TestGithub\Code\LightScene\assets\LightScene\effect\lightScene.effect), change `precision highp float;` to `precision mediump float;`
    - Note: Performance will improve, but visual quality may degrade slightly. Suitable for rectangular obstacles.
        - In test scenes, circular and star-shaped obstacles show abnormal edge shadows
        - Rectangular obstacles perform relatively well
- Light Mesh Solution (only for Creator 3.X)
    - Create a new Camera and set a separate Layer!
    - Use the `LightSceneMesh` material for the top-level image!
    - For specific details, refer to the `LightSceneTestMesh` scene
    - No limit on the number of light sources, no limit on the number of occluders.
    - ⚠️**Temporarily does not support sector light sources** (In this scheme, point light sources can be achieved with simple restrictions, but due to compatibility and configuration issues, support has not been implemented yet).
    - ![lightMesh1.png](https://download.cocos.com/CocosStore/resource/40f130dd6737401d999dd83c1aa67cb3/40f130dd6737401d999dd83c1aa67cb3.png)

Mobile Test Data  
| Scene Name | FPS | FPS while Moving | Remarks |
|------------|-----|------------------|---------|
| LightSceneTest.scene | 35~ | 35~ | Default solution + High Precision |
| LightSceneTestMesh.scene | 120~ | 115~ | Light Mesh Solution |

## Contact the Author
- [Related Forum Post](https://forum.cocos.org/t/topic/170254/4)
- Email: chenshw23@foxmail.com