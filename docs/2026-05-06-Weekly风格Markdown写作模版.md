# Weekly 风格 Markdown 写作模版

> 创建日期：2026-05-06
> 范围：博客内容的写作规范与渲染语法
> 性质：项目级写作模版（**给 Agent 看的**）

---

## 占位符约定

文档中出现的 `${DOMAIN}` 等占位符对应运维敏感值，真实值见项目根 `.env`。Agent 在生成 markdown 时如果生成最终 URL，请用 `cdn.wuyutaott.com` 这样的真实域名（占位符仅文档用，markdown 文件内不要写 `${DOMAIN}` 字样）。

---

## 0. 这份文档的用途

把 Weekly（github.com/tw93/weekly）的写作规范提取成可执行模版，供 Agent 按规则生成 markdown 文件。Agent 拿到一份内容（链接 + 描述 + 图片视频）后，应能按本文档的语法和结构组织出符合 Weekly 风格的 .md 文件。

**关键认知**：Weekly 的 frontmatter 极简（只有一个 `date`），其余元数据（封面、摘要、期号）由构建期自动从正文提取。这意味着**正文的"前几行"本身就是元数据**，Agent 必须严格遵循首部结构。

---

## 1. 文件命名规范

```
src/pages/posts/<编号>-<中文标题>.md

✅ 255-好吃鸡翅.md
✅ 01-安吉黄昏.md
✅ 100-无忧孩童.md

❌ 2026-01-26-good-wings.md          （不带编号）
❌ post-255.md                       （没有中文标题）
❌ 255_好吃鸡翅.md                    （用 _ 不用 -）
```

### 规则

- **编号**：连续递增整数，从 `01` 开始，没有前导 0 限制（`01` 和 `100` 都行，构建期会 `parseInt`）
- **标题**：2-6 个汉字，描述本期主题
- **分隔符**：编号与标题之间用一个 `-`
- **扩展名**：`.md`（不要 `.mdx`）

### 编号 → 自动生成的字段

构建期 remark 插件读到文件名后自动计算：

| 字段 | 值 | 用途 |
|---|---|---|
| `issueNumber` | `255`（从文件名前缀 parseInt） | 期号显示 |
| `numericUrl` | `/posts/255` | 短 URL（无中文） |
| `legacySlug` | `255-好吃鸡翅` | 旧 URL 兼容 |
| `issueTitle` | `好吃鸡翅` | 页面标题片段 |

Agent **不需要在 frontmatter 写这些字段**，构建期会注入。

---

## 2. Frontmatter 结构

```markdown
---
date: 2026/01/26
---
```

**就这一行**。这是 Weekly 哲学：约定大于配置，正文承担元数据职责。

### 字段说明

| 字段 | 必填 | 格式 | 说明 |
|---|---|---|---|
| `date` | ✅ | `YYYY/MM/DD`（用 `/`，不是 `-`） | 发布日期 |

### 不要写的字段

以下字段由构建期自动从正文提取，**写了也会被覆盖**：

- `image`（封面图）→ 自动取正文第一个 `<img>` 的 src
- `description`（摘要）→ 自动取正文第二个元素（即 `<small>`）的文本
- `layout` → 自动注入为 `@layouts/post.astro`
- `heroImage` → 自动取首图 + OSS 处理参数
- `socialImage` → 110 期及以后自动取 `weekly.tw93.fun/assets/{编号}.jpg`
- 其他 `issueNumber` / `numericUrl` 等

**Agent 只写一行 `date`，剩下交给构建期。**

---

## 3. 正文首部结构（极其严格）

每篇文章 frontmatter 之后必须是这三行（顺序不能错）：

```markdown
<img src="https://cdn.fliggy.com/upic/xxxxxx.jpg" width="800" />

<small>封面图摄于xxx，简短描述场景或感受。</small>

> **记录每周看到的xxx，筛选后发布于此，欢迎关注此周刊。**
```

### 行 1：封面图

```html
<img src="<图片 URL>" width="800" />
```

- **必须用 HTML `<img>` 标签**，不能用 markdown `![]()`（rehype 插件靠 `<img>` 标签匹配）
- **必须有 `width` 属性**，推荐 `800`
- **图片 URL** 必须落在受支持的 CDN 域名上（见 §6.4），否则不会被处理
- 这张图会自动成为整篇的封面 / og:image

### 行 2：封面图说明

```html
<small>一句话描述这张图。15-30 字。</small>
```

- 必须是 `<small>` 标签包裹（构建期靠这个抓 description）
- 内容会作为页面 description meta + 摘要展示
- 写"封面图摄于xxx"或直接描述场景都可

### 行 3：周刊 tagline

```markdown
> **记录每周看到的xxx，筛选后发布于此，欢迎关注此周刊。**
```

- markdown blockquote `>` + 加粗 `**...**`
- 这是周刊的固定开场，每期相同或微调
- Agent 可以读取上一期的 tagline 复用

---

## 4. 章节结构

### 4.1 章节标题用 `## `

```markdown
## 潮流工具

## 随便看看

## 好文
```

### 4.2 常用章节命名（Weekly 实际使用）

| 章节名 | 通常内容 |
|---|---|
| **潮流工具** | GitHub 项目、CLI 工具、SaaS、桌面应用 |
| **好文 / 文章** | 博客文章、技术分享、深度好文 |
| **随便看看** | 视频、新闻、生活感悟、看到的有趣东西 |
| **生活记录** | 个人生活、出行、美食 |
| **每日摄影** | 单纯发图 |

Agent 应根据本期内容选择 1-3 个章节，不要每期都生成所有章节。

### 4.3 列表型章节（早期周刊常见）

```markdown
### 工具

- [Hoppscotch - PostMan 的漂亮前女友](https://github.com/hoppscotch/hoppscotch)
- [Annie - 快速，简单和干净的视频下载工具](https://github.com/iawia002/annie)
```

### 4.4 卡片型条目（Weekly 后期主流）

```markdown
**Pake 最近更新到了 3.8.1 版本**
<https://github.com/tw93/Pake>
一键打包网页生成轻量桌面应用，支持 macOS、Windows 和 Linux 的工具 Pake 更新了，日志如下：
1、第三方登录弹窗：新增 --new-window 参数...
2、全屏视频支持：注入层新增 HTML5 Fullscreen 兼容逻辑...
<img src="https://cdn.fliggy.com/upic/cTQpkH.gif" width="800" />
```

**结构（严格遵守）**：

1. **加粗标题**：`**xxx**` 单独一行
2. **裸链接**：用 `<https://...>` 自动链接语法（不是 `[xxx](url)`）
3. **描述段落**：1-3 段中文，介绍这个东西做什么、为什么值得看
4. **图/视频**（可选）：`<img>` 或 `<video>` 标签
5. **空行分隔下一条**

---

## 5. 图片语法

### 5.1 标准图片（最常用）

```html
<img src="https://cdn.fliggy.com/upic/xxxxxx.png" width="800" />
```

- 默认宽度 `800`
- 自适应宽度由 CSS 控制，`width="800"` 是给浏览器的提示

### 5.2 自定义宽度

```html
<img src="https://cdn.fliggy.com/upic/xxx.gif" width=466 />
<img src="https://cdn.fliggy.com/upic/xxx.png" width="400" />
```

- 数字可加引号也可不加
- GIF / 屏幕截图常用 400-600；摄影图常用 800

### 5.3 GIF / SVG

GIF 和 SVG **不会被 OSS 处理**（构建期 skipRegex 跳过）：
- 保持原样输出
- 适合需要动画或矢量精确的场景

```html
<img src="https://cdn.fliggy.com/upic/YIXgMy.gif" width="800" />
```

### 5.4 自动注入的属性

构建期会给图片自动加上：
- `loading="eager" fetchpriority="high"`（首图）/ `loading="lazy"`（其余）
- `data-pswp-src="..." data-pswp-width="..." data-pswp-height="..."`（PhotoSwipe 灯箱）
- `aspect-ratio: x.xxxx`（CSS，避免布局抖动）
- `?x-oss-process=image/auto-orient,1/resize,w_2000/format,webp`（OSS 即时压缩）

**Agent 不要手写这些属性，构建期注入。**

### 5.5 受支持的 CDN 域名

只有这些域名上的图片会被 rehype 插件处理：

```
https://cdn.fliggy.com/...
https://cdn.alipayobjects.com/...
https://gw.alipayobjects.com/...
https://gw.alicdn.com/...
https://img.alicdn.com/...
https://raw.githubusercontent.com/...
https://camo.githubusercontent.com/...
https://cdn.tw93.fun/...
```

**对你的项目（wuyutaott.com）来说**：需要修改 `rehype-image.js` 把 `cdn.wuyutaott.com` 加入这个清单。Agent 生成图片 URL 时直接用 `https://cdn.wuyutaott.com/YYYY/MM/filename.ext`。

---

## 6. 视频语法（4 种场景）

视频不像图片有自动处理——**Agent 必须手写完整 HTML**。下面是 Weekly 实际使用的 4 种模式，按场景选。

### 6.1 小循环（< 10MB，类似 GIF 用）

```html
<video width="600" preload muted autoplay loop playsinline>
  <source src="https://cdn.fliggy.com/upic/loop.mp4" type="video/mp4">
</video>
```

- `muted autoplay loop` = 静音 + 自动播 + 循环 = "MP4 当 GIF 用"
- 适合：风景片段、UI 演示、短动作循环
- 比 GIF 体积小 10 倍，质量更高

### 6.2 带控制条（要听声音）

```html
<video width="800" preload controls>
  <source src="https://cdn.fliggy.com/upic/talk.mp4" type="video/mp4">
</video>
```

- `controls` = 显示播放/暂停/音量条
- 没有 `autoplay`、没有 `muted`：访客主动播放
- 适合：演讲录屏、带旁白的视频、需要听内容的素材

### 6.3 缩略图自动播 + 点击放大

```html
<a href="https://cdn.fliggy.com/upic/big.mp4" target="_blank">
  <video width="800" autoplay preload loop muted>
    <source src="https://cdn.fliggy.com/upic/big.mp4" type="video/mp4">
  </video>
</a>
```

- 外层 `<a>` 让点击跳到原视频新标签页
- 缩略图静音自动播
- 适合：演示型 / 展示型大视频

### 6.4 第三方视频（B 站 / YouTube）

**直接放裸链接，不嵌 iframe**：

```markdown
<https://www.bilibili.com/video/BV1nYzDB3EKx>
```

理由：
- B 站 iframe 嵌入会被广告/登录干扰
- 大视频自己扛流量不划算
- 纯链接最干净

如果想给链接配缩略图，用 `<a><img></a>` 包裹：

```html
<a href="https://www.bilibili.com/video/BV12341117rG" target="_blank">
  <img src="https://cdn.fliggy.com/upic/xxx.jpg" width="800" />
</a>
```

### 6.5 视频选型决策

| 场景 | 用哪个 |
|---|---|
| 自家小循环动画（< 10MB） | 6.1 |
| 自家演讲/带声音视频 | 6.2 |
| 自家展示视频要点击放大 | 6.3 |
| B 站 / YouTube 视频 | 6.4 |
| 大视频（> 200MB） | 6.4，**不要**自己扛 |

---

## 7. 链接语法

### 7.1 自动链接（裸链接）

```markdown
<https://github.com/tw93/Pake>
<https://www.bilibili.com/video/BV1nYzDB3EKx>
```

- 用 `<...>` 包裹 URL
- 渲染为可点击链接，文字就是 URL 本身
- **卡片型条目里"标题下的链接"必须用这种形式**

### 7.2 命名链接

```markdown
[Hoppscotch - PostMan 的漂亮前女友](https://github.com/hoppscotch/hoppscotch)
[李笑来写的微信互联网平民创业](https://github.com/xiaolai/everyones-guide-for-starting-up-on-wechat-network)
```

- 列表型章节里推荐用这种
- "标题 - 简短描述" 是常见格式

### 7.3 站内/同站链接（如果有）

参考自己其他文章用 markdown 链接 + 完整 URL：

```markdown
<https://tw93.fun/2026-01-24/good.html>
```

---

## 8. 文本语法

### 8.1 加粗（条目标题专用）

```markdown
**Pake 最近更新到了 3.8.1 版本**
```

每个卡片型条目的标题必须 `**...**` 加粗。

### 8.2 斜体

很少用。如有必要：`*text*`

### 8.3 内联代码

```markdown
新增 `--new-window` 参数
```

### 8.4 中文编号列表（更生活化）

```markdown
1、第一点说明
2、第二点说明
3、第三点说明
```

注意：用全角顿号 `、` 而不是英文 `.`。这是 Weekly 的中文风格惯例，比 markdown 标准 `1.` 更显本土化。

### 8.5 markdown 编号列表（更技术化）

```markdown
1. 第一步
2. 第二步
3. 第三步
```

技术教程用这种；生活感悟用 §8.4 中文式。

### 8.6 无序列表

```markdown
- 项 1
- 项 2
- 项 3
```

### 8.7 引用块

```markdown
> **记录每周看到的xxx，欢迎关注。**
```

文章首部的 tagline 用引用块。其他场景较少用。

### 8.8 章节分隔（少用）

```markdown
---
```

正文中可用 `---` 分隔大段内容。Weekly 较少用，因为 `## ` 已经足够分章。

---

## 9. 完整示例：标准周刊一期骨架

```markdown
---
date: 2026/05/15
---

<img src="https://cdn.wuyutaott.com/2026/05/cover-iceland.jpg" width="800" />

<small>封面图摄于五一冰岛极光，那一天云量很少，看了快两个小时。</small>

> **记录每周看到的有趣的东西，筛选后发布于此，欢迎关注此周刊。**

## 潮流工具

**LangGraph 0.4 版本发布**
<https://github.com/langchain-ai/langgraph>
LangGraph 这次更新引入了新的 checkpointing 机制，对长任务 agent 的可恢复性是巨大提升。我用它重写了一个之前的代码评审 agent，明显感觉调试起来轻松多了。具体改动如下：
1、Checkpoint 自动持久化
2、新的 interrupt 机制
3、更好的 streaming 支持
<img src="https://cdn.wuyutaott.com/2026/05/langgraph-demo.gif" width="800" />

**一个好看的终端编辑器 helix**
<https://github.com/helix-editor/helix>
modal editor 的现代化代表，开箱即用的语法高亮和 LSP 支持。
<video width="600" preload muted autoplay loop playsinline>
  <source src="https://cdn.wuyutaott.com/2026/05/helix-demo.mp4" type="video/mp4">
</video>

## 随便看看

**Alex Honnold 攀爬台北 101 的全程纪录**
<https://www.bilibili.com/video/BV1nYzDB3EKx>
Netflix 直播看的，一个半小时全程徒手独攀，松弛感拉满。

## 好文

- [当 Rust 遇上前端](https://example.com/rust-frontend)
- [一份关于 LLM 应用架构的总结](https://example.com/llm-arch)
```

---

## 10. Agent 生成 markdown 的工作流

当用户给 Agent 一份原始内容（GitHub 链接、博客 URL、想推荐的工具列表 + 描述），Agent 应：

### Step 1：确定文件名
- 查目前最大期号 N（看 `src/pages/posts/` 里最大的数字）
- 决定本期主题（2-6 字汉字）
- 文件名：`<N+1>-<主题>.md`

### Step 2：写 frontmatter
```markdown
---
date: <YYYY/MM/DD 今天日期>
---
```

### Step 3：写首部三行（封面 + 描述 + tagline）
- 用户提供封面图 URL，按 §3 行 1 格式
- 用户给一句封面图说明，按 §3 行 2 格式
- tagline 复用上一期或微调

### Step 4：分章节组织内容
- 工具/项目类 → `## 潮流工具`
- 长文/博客类 → `## 好文`
- 视频/生活类 → `## 随便看看`

### Step 5：每个条目按 §4.4 卡片格式
1. `**加粗标题**`
2. `<裸链接>`
3. 描述段落（中文，1-3 段）
4. 图片或视频（如有）

### Step 6：图片/视频规范化
- 图片：`<img src="https://cdn.wuyutaott.com/..." width="800" />`
- 视频：按 §6 选对应模式

### Step 7：检查清单
- [ ] frontmatter 只有 `date` 一行
- [ ] 首图、`<small>`、`>` tagline 三行齐全且顺序正确
- [ ] 所有图片用 `<img>` HTML 标签（不是 markdown `![]()`）
- [ ] 所有图片域名是 `cdn.wuyutaott.com`
- [ ] 所有 GitHub / 项目链接用 `<https://...>` 自动链接
- [ ] 章节标题用 `## `
- [ ] 卡片标题用 `**...**`
- [ ] 编号若是中文风格用 `1、` 顿号，若是教程用 `1.` 句点

---

## 11. 与项目其他规则的协同

- **图片 URL 必须用 `cdn.wuyutaott.com`**：见 `2026-05-06-博客多媒体资产管理规则.md`
- **图片文件命名规范**：见同上 §3
- **资产不可变铁律**：每张图传完不要覆盖，要换图就用新名字
- **存储链路**：本地 `~/blog-media/YYYY/MM/` → rsync → VPS `/var/www/cdn/YYYY/MM/`

Agent 在生成 markdown 时**直接写最终 URL**，不要写占位符。占位符约定只用于本类规则文档自身。

---

_最后更新：2026-05-06。基于 Weekly 项目（github.com/tw93/weekly）实际写作模式提取。_
