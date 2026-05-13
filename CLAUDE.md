# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
./start.sh                # 启动 dev server（http://localhost:4321）
./stop.sh                 # 关闭 dev server
./upload-img.sh <file>    # 上传 ./image/<file> 到 CDN（包装 mediactl，默认压缩）
pnpm build                # 生产构建：probe-images → astro build → pagefind
pnpm preview              # 预览构建产物
pnpm image:probe          # 只跑图片尺寸探测（增量）
source .env               # 加载 ${DOMAIN}/${VPS_IP}/${VPS_HOST} 等敏感值
```

无 lint / test 任务（这是个静态博客，无自动化测试套件）。

## 架构要点

### Markdown → HTML 的两层插件管线

`astro.config.mjs` 在构建期注册两个自定义插件，它们和文章命名/写法形成隐式契约：

1. **`defaultLayoutPlugin`（remark）**：读 `src/pages/posts/<N>-<title>.md` 的文件名 + 正文前几个 AST 节点，**自动**填充 frontmatter：
   - 文件名前缀数字 → `issueNumber` / `numericUrl=/posts/<N>`（短链路由的来源）
   - 文件名 `-` 后的部分 → `issueTitle`
   - 正文首个 `<img>` → `frontmatter.image`（封面来源；frontmatter 里写 `image:` 也可覆盖）
   - 正文第 2 段首句 → `frontmatter.description`（首页卡片摘要 + meta description）
   - 文件 birthtime → `frontmatter.date`（除非显式写 `date:`）

   **写文章时只需要写 `date:` 一个 frontmatter**（甚至可不写）。改变正文头部结构 = 改变元数据，要警惕。

2. **`rehype-image.js`（rehype）**：扫所有 `<img src="https://cdn.wuyutaott.com/...">`，从 `src/data/image-metadata.json` 取尺寸，注入：
   - `aspect-ratio` style（防 CLS）
   - `data-pswp-*` 属性（PhotoSwipe 灯箱）
   - 首图 `loading="eager" fetchpriority="high"` + `<link rel="preload">`（heroImage）
   - 跳过 SVG/GIF

   只处理 `cdn.wuyutaott.com` 域的 img；其他 host 原样透传。

3. **`scripts/probe-images.js`（prebuild）**：扫文章里所有 CDN 图片 URL，HTTP 探测尺寸，**增量**写回 `src/data/image-metadata.json`。该 JSON 进 git，新增图片才会触发 HTTP 请求。

### 资产管理：图片绝不进 git

所有图片视频统一走 `cdn.wuyutaott.com`（VPS 自建 CDN + CF 边缘缓存）。完整规则见 [`docs/2026-05-06-博客多媒体资产管理规则.md`](docs/2026-05-06-博客多媒体资产管理规则.md)，核心铁律：

- URL 必须是 `https://cdn.wuyutaott.com/YYYY/MM/<descriptive-name>.<ext>`
- 文件名小写 + 短横线 + 描述性（mediactl 会校验，下划线/大写会被拒）
- 资产不可变：上传后不覆盖，要改图就换新名字
- 本地源在 `~/blog-media/YYYY/MM/`，VPS 在 `/var/www/cdn/YYYY/MM/`
- 上传走 `./upload-img.sh <file>` 或 `./scripts/mediactl add <src> --name <n> --compress`，**不要手动 rsync 单文件**

### 部署

`main` 分支 push → GitHub Actions 跑 `pnpm build` → rsync `dist/` 到 VPS。详见 `.github/workflows/`。

## 写文章的硬约束

- 路径：`src/pages/posts/<N>-<中文标题>.md`（编号连续整数，标题 2-6 汉字，分隔符 `-`）
- frontmatter 极简：通常只有 `date: YYYY/MM/DD`（甚至省略，用文件 birthtime）
- **正文第一段就是封面**：第一个 `<img>` 自动成为 heroImage + 首页卡片图
- 引用图片用 mediactl/upload-img.sh 输出的 `<img src="..." width="800" />` 形式（HTML，不是 markdown `![]()`，因为 width 要标）
- 详见 [`docs/2026-05-06-Weekly风格Markdown写作模版.md`](docs/2026-05-06-Weekly风格Markdown写作模版.md)

## 敏感值与 .env

`${DOMAIN}` / `${VPS_IP}` / `${VPS_HOST}` 等占位符的真实值在项目根 `.env`（`.gitignore` 中，不进库）。命令行用前 `source .env`。文档里**不要**把占位符替换成真实值再 commit，commit message 也避免暴露内部细节。

## 致谢

代码骨架（Astro 项目结构、Markdown 插件、PhotoSwipe / Pagefind 集成）来自 [Tw93/weekly](https://github.com/tw93/weekly)（MIT）。改动时尽量保持 Weekly 的设计意图，不要无理由重构。
