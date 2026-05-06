# wuyutaott 的博客

[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-FF5D01?logo=astro)](https://astro.build)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

个人博客，记录技术、生活与思考。访问：[blog.wuyutaott.com](https://blog.wuyutaott.com)

## 致谢 / Credits

本项目的**前端框架、UI、构建管线、Markdown 处理插件、PhotoSwipe 灯箱集成、Pagefind 搜索集成**等核心技术架构来自 **[Tw93 (@tw93)](https://github.com/tw93)** 的开源周刊项目 **[weekly](https://github.com/tw93/weekly)**。

我没有 fork Weekly，但**Weekly 是一份非常高质量的 Astro 博客模板**，本仓库的代码骨架来自它的 MIT 授权代码。文章内容、域名、配置等是我自己的，但前端工程的功劳应归于 Tw93。

向 Tw93 致谢——他的工程审美值得学习，开源精神令人敬佩。

如果你也想要类似风格的个人博客，**强烈推荐先去看看 Weekly**：

- 原项目：<https://github.com/tw93/weekly>
- 作者博客：<https://tw93.fun>
- 周刊本身（关注一下！）：<https://weekly.tw93.fun>

## 技术栈

- **静态生成器**：[Astro](https://astro.build) 5.x
- **样式**：Tailwind CSS + `@tailwindcss/typography`
- **全文搜索**：[Pagefind](https://pagefind.app)（构建期生成静态索引）
- **图片灯箱**：[PhotoSwipe](https://photoswipe.com)
- **图片优化**：构建期 `probe-image-size` 探测尺寸 + rehype 插件注入 `aspect-ratio` 防布局抖动
- **Markdown 处理**：自定义 remark 插件提取 frontmatter + rehype 插件增强图片
- **RSS**：`@astrojs/rss`
- **部署**：自建 VPS + Caddy + Cloudflare（无 Vercel / Netlify 依赖）

## 目录结构

```
.
├── src/
│   ├── components/        # Astro 组件
│   ├── config.ts          # 站点元数据（标题、域名、社交账号）
│   ├── data/
│   │   └── image-metadata.json   # 构建期生成的图片尺寸缓存
│   ├── layouts/           # 布局
│   ├── pages/
│   │   ├── index.astro    # 首页
│   │   ├── posts/
│   │   │   ├── [id].astro # 文章动态路由
│   │   │   └── *.md       # 文章正文
│   │   └── rss.xml.js     # RSS feed
│   └── styles/
├── public/                # 静态资源
├── scripts/
│   └── probe-images.js    # 构建前置：探测图片尺寸
├── docs/                  # 项目级文档（运维、写作模版、资产规则）
├── astro.config.mjs       # Astro 配置 + remark/rehype 插件注册
├── rehype-image.js        # 图片增强插件（PhotoSwipe / aspect-ratio / lazy）
└── tailwind.config.cjs
```

## 本地开发

```bash
pnpm install      # 装依赖
pnpm dev          # 开发服 http://localhost:4321
pnpm build        # 生产构建（先跑 probe-images.js 再 astro build 再 pagefind）
pnpm preview      # 预览构建产物
```

## 写一篇新文章

文章放在 `src/pages/posts/`，文件名格式：`<编号>-<中文标题>.md`。

详细写作规范见 [`docs/2026-05-06-Weekly风格Markdown写作模版.md`](docs/2026-05-06-Weekly风格Markdown写作模版.md)。

## 多媒体资产

图片视频不进 git 仓库，统一放在 `cdn.wuyutaott.com`（VPS 自建 CDN，CF 缓存）。详细规则见 [`docs/2026-05-06-博客多媒体资产管理规则.md`](docs/2026-05-06-博客多媒体资产管理规则.md)。

## 部署

GitHub Actions 自动 build → rsync 到 VPS。详见 [`docs/2026-05-06-VPS运维手册.md`](docs/2026-05-06-VPS运维手册.md)。

## License

MIT — 见 [LICENSE](LICENSE)。

License 文件保留了 Tw93 作为原作者的版权声明，符合 MIT 协议要求。任何基于本仓库的进一步衍生项目也请保留这份归属链条。
