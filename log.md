## 部分修改记录

2025年09月22日
1. 测试 material.setProperty 改为 Pass.setUniformArray 后，性能无明显变化  
2. 测试 在代码处理光照和阴影 极其卡

那天有人说卡

能不卡吗？
开阴影，逐像素检测。

本质是修改顶层图片指定区域的透明度达到想要的效果。
- 方案1. 逐像素检测
    - 就是暴力计算
- 方案2. RenderTexture记录最新结果
    - 使用RenderTexture记录
    - 没变化时候: 就是显示一张图了
    - 变化时候：和方案1一样
- 方案3. 光照mesh
    - 将每个光源照亮区域生成对应mesh。
    - 先从怎么创建mesh弄起来
    - 计算所需要的mesh数据

    - 问题1. 射线检测，就算提升到360依旧会出现错误
    - 问题2. 多光源异常。
        因为仅一张texture记录光照区域，存在某些区域在多光源区域内，但是其实被遮挡的。

    - 解决问题1.
        - 直接将光照范围内的遮挡物顶点和圆心的角度加入射线检测中。
    - 解决问题2.
        - 将所需要透明度直接表现在texture中。

学习资料:
[Cocos Creator 2D可视化光照插件技术分享](https://mp.weixin.qq.com/s/bOcANC3OlUjyxgaPluz4aA)
[视线和光线：如何创建 2D 视觉范围效果](https://indienova.com/indie-game-development/sight-light-how-to-create-2d-visibility-shadow-effects-for-your-game/)