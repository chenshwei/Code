## 部分修改记录

2025年09月22日
1. 测试 material.setProperty 改为 Pass.setUniformArray 后，性能无明显变化  
2. 测试 在代码处理光照和阴影 极其卡

学习下[sodia大佬的方案](https://mp.weixin.qq.com/s/bOcANC3OlUjyxgaPluz4aA)
原理简述: 每个光源用射线投射生成阴影mesh、单独layer用renderTexture渲染得阴影贴图

