---
date: 2026/05/06
---

<small>这是博客的第一篇测试文章，用来验证整个工具链是否跑通：Astro 构建、Markdown 渲染、文章路由、CDN 图片、自动 sitemap、RSS 等等。</small>

> **博客已上线，欢迎来玩。**

## 关于这个博客

这是基于 **[Tw93/weekly](https://github.com/tw93/weekly)** 的代码框架重新定制的个人博客。

技术选型：

- **Astro 5.x** 静态生成
- **VPS 自建 CDN**（`cdn.wuyutaott.com`），不依赖第三方对象存储
- **Cloudflare 橙云**做边缘缓存 + DDoS 防护
- **Caddy** 自动 HTTPS（DNS-01 续签）
- **Pagefind** 全文搜索（静态索引，无后端）
- **GitHub Actions** 自动部署

## 设计哲学

1. **架构一致性 > 单点便利**：所有东西跑在同一台 VPS 上，不引入 Vercel / R2 / 第三方对象存储
2. **资产不可变**：图片视频上传后不覆盖，要换图就用新名字（避免 CDN 缓存事故）
3. **URL 契约稳定**：通过 `cdn.wuyutaott.com` 子域名抽象，将来换后端零文章修改
4. **YAGNI**：不预先优化，触发条件未达成的方案保持克制

## 致谢

向 Tw93 致谢。开源精神和工程审美都值得学习。

详见 [README](https://github.com/wuyutaott/blog#readme) 的 credits 部分。
