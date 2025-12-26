# Narrative Script: LLM Speculative Decoding (Technical Blueprint Style)

## 1. Narrative Strategy (叙事策略)

*   **核心隐喻**: "The Intern & The Editor" (实习生与主编)。
*   **术语降维**: 
    *   Draft Model -> "实习生 (Intern)"
    *   Target Model -> "主编 (Editor)"
    *   Memory Wall -> "阅读速度瓶颈"
    *   Rejection/Rollback -> "橡皮擦修正"
*   **视觉风格**: **Technical Blueprint (Scheme B)**。深蓝底色，细线条描边，霓虹光效，网格背景，工程制图感。
*   **价值高光**: 在结尾处直接对比 "20ms/token" vs "7ms/token"，打出 **"3X FASTER"** 的霓虹光效字。

---

## 2. The Scene Breakdown Table (分镜表)

| Scene ID | Narrative Script (旁白) | Layout Strategy | Visual Action & Data State |
| :--- | :--- | :--- | :--- |
| **01. Intro (The Two Modes)** | 大模型工作有两种模式。<br>第一种是**阅读模式 (Prefill)**：像老师批改卷子，一眼能看十行（并行计算，极快）。<br>第二种是**写作模式 (Decoding)**：像学生写作文，必须写完上一个字，才能写下一个字（串行生成，极慢）。 | **Split Screen** (Reading vs Writing) | **Visual**: 左侧显示 "Prefill Mode"，一堆文字瞬间点亮（并行）。<br>右侧显示 "Decoding Mode"，文字像打字机一样逐个蹦出（串行）。<br>**Text**: "Prefill: Parallel (Fast)" vs "Decoding: Serial (Slow)". |
| **02. The Bottleneck (Memory Wall)** | 为什么写作模式这么慢？<br>因为为了写**一个字**，主编都要把 26GB 的字典（权重）从头到尾搬运一遍。<br>这就像开着大卡车去送一封信，**带宽全浪费在路上了**。 | **Truck Analogy** (Visual Metaphor) | **Visual**: 一辆巨大的紫色卡车 (26GB) 缓慢驶入，卸下一个小小的信封 (Token)。<br>**Overlay**: "Payload: 1 Token", "Overhead: 26GB Move".<br>**Action**: 卡车反复往返，效率极低。 |
| **03. The Solution (Speculative Decoding)** | 怎么解决？采用**协作模式**。<br>主编（大模型）先**暂停生成并待命**。<br>让实习生（小模型）用**写作模式**（串行）快速起草 4 个词。 | **Drafting** (Collaboration) | **Visual**: 画面中出现“主编（待命）”图标（咖啡杯）和“实习生”图标（蓝色小人）。<br>实习生飞快地扔出 4 个蓝色信封。<br>**Speed**: 动作是紫色卡车的 10 倍速。<br>**Tokens**: `["stared", " at", " the", " broken"]`. |
| **04. Verification (The Magic Trick)** | 关键时刻来了！主编拿到这 4 个词后，**不需要**一个个写。<br>他可以把这 4 个词当作**已经写好的草稿**，直接切换到**阅读模式 (Prefill)**！<br>看，大卡车只跑了一趟，就同时检查了 4 个词。 | **Mode Switch** (The Aha Moment) | **Visual**: 紫色卡车（同 Scene 02）从左侧驶入屏幕中央。<br>**Action**: 卡车扫描仪射出一道宽光束，**同时**覆盖 4 个蓝色信封。<br>**Text**: "SWITCH TO PREFILL MODE (PARALLEL)".<br>**Overlay**: "1 Trip = 4 Checks". |
| **05. Probability Game (Not Just Matching)** | 主编怎么检查？不是死板地对答案，那是小学生做的。<br>主编在玩**概率博弈**。<br>比如这个词 "apple"，实习生只有 60% 把握，但主编一算：“我有 80% 把握！”<br>主编比实习生更确信，**直接通过！** | **Probability Bars** (Chart) | **Visual**: 两个柱状图对比。<br>Token: "apple".<br>Intern (Blue): 60%.<br>Editor (Purple): 80%.<br>**Action**: 紫色柱子高于蓝色，盖章 "ACCEPTED". |
| **06. Rejection & Resample** | 如果被拒绝了怎么办？<br>没关系，主编会立刻接管。<br>他会根据修正公式 $P'(x) = \text{norm}(\max(0, p-q))$，**亲自采样**一个新的词 "peach"。<br>虽然这轮没全对，但我们依然通过一次计算，搞定了一部分词。 | **Resample Animation** | **Visual**: 显示数学公式 $P'(x)$。<br>**Action**: "pear" 被像橡皮擦一样擦除 (Wipe Effect)。<br>**KV Cache**: 显存中 "pear" 的数据块同步被红色擦除 (Rollback)。<br>**Result**: 重组为紫色的 "peach"，写入显存。<br>**Text**: "RESAMPLED BY EDITOR". |
| **07. Scenario A: Coding (High Speed)** | 来看看实战效果。场景一：写代码。<br>因为代码逻辑固定，实习生几乎百发百中。<br>主编只需要疯狂点头。<br>**结果：5倍光速！** | **Speedometer: 5X** | **Visual**: 代码屏幕飞速滚动。<br>**Stats**: Acceptance Rate: 90%.<br>**Speed**: 🚀 5.2x Faster.<br>**Sound**: 像黑客帝国一样的代码雨音效。 |
| **08. Scenario B: Creative (Steady Gain)** | 场景二：写小说。<br>实习生经常猜不到主编的奇思妙想，经常被拒。<br>但即便如此，只要偶尔对两个，整体依然比原来快。<br>**结果：1.5倍加速，稳赚不赔！** | **Speedometer: 1.5X** | **Visual**: 小说文本打字机效果。<br>**Stats**: Acceptance Rate: 30%.<br>**Speed**: 🚀 1.5x Faster.<br>**Note**: 即使在最坏情况下，也不会比原来更慢（除了微小的实习生开销）。 |
| **09. The Value Reveal** | 总结一下：<br>1. 把**写作**变成了**阅读**。<br>2. 用**计算**换取了**带宽**。<br>3. 用**概率**保证了**质量**。<br>这就是投机解码：**显存没变，速度起飞！** | **Summary Dashboard** | **Visual**: 三个图标依次点亮：<br>📖 Writing -> Reading<br>🚛 Bandwidth Saved<br>✨ Lossless Quality<br>**Center**: **🚀 3X FASTER (AVG) 🚀** |
