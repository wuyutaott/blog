import fs from "fs";
import dayjs from "dayjs";
import tailwind from "@astrojs/tailwind";
import remarkBreaks from "remark-breaks";
import sitemap from "@astrojs/sitemap";

import { defineConfig } from "astro/config";
import { parse } from "node-html-parser";
import { SITE } from "./src/config";
import rehypeImage from "./rehype-image.js";

const markdownConfig = {
  hardBreaks: true,
  gfm: true,
  smartypants: true,
  allowDangerousHtml: true,
};

const DEFAULT_FORMAT = "YYYY/MM/DD";

function formatDate(date) {
  return dayjs(date).format(DEFAULT_FORMAT);
}

function getFileCreateDate(filePath) {
  return formatDate(fs.statSync(filePath).birthtime);
}

function defaultLayoutPlugin() {
  return function (tree, file) {
    const filePath = file.history[0];
    const { frontmatter } = file.data.astro;
    frontmatter.layout = "@layouts/post.astro";

    const postsDir = "/posts/";

    const relativePath = filePath
      .split(/[\/\\]posts[\/\\]/)[1]
      ?.replace(/\.md$/, "");

    if (relativePath) {
      frontmatter.legacySlug = relativePath;
      const [numberPart, ...nameParts] = relativePath.split("-");
      if (numberPart) {
        const numericIndex = Number.parseInt(numberPart, 10);
        if (!Number.isNaN(numericIndex)) {
          frontmatter.issueNumber = numericIndex;
          frontmatter.numericUrl = `${postsDir}${numericIndex}`;
        } else {
          frontmatter.numericUrl = `${postsDir}${numberPart}`;
        }
      }
      if (nameParts.length > 0) {
        frontmatter.issueTitle = decodeURIComponent(nameParts.join("-"));
      }
    }

    if (tree.children[0]?.value && !frontmatter.image) {
      const imageElement = parse(tree.children[0].value).querySelector("img");
      if (imageElement) {
        frontmatter.image = imageElement.getAttribute("src");
      }
    }

    if (tree.children[1]?.children?.[1]?.value) {
      frontmatter.description = tree.children[1].children[1].value;
    }

    frontmatter.description = frontmatter.description || SITE.description;
    frontmatter.image = frontmatter.image || SITE.siteImage;

    if (!frontmatter.date) {
      frontmatter.date = getFileCreateDate(filePath);
    }
  };
}

export default defineConfig({
  site: SITE.homePage,
  prefetch: true,
  trailingSlash: "never",
  server: {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  integrations: [
    tailwind(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => {
        const url = new URL(page);
        const postPathMatch = url.pathname.match(/\/posts\/(\d+)-/);
        return !postPathMatch;
      },
    }),
  ],
  markdown: {
    remarkPlugins: [
      defaultLayoutPlugin,
      ...(markdownConfig.hardBreaks ? [remarkBreaks] : []),
    ],
    rehypePlugins: [rehypeImage],
    remarkRehype: {
      handlers: {},
      allowDangerousHtml: markdownConfig.allowDangerousHtml,
    },
    gfm: markdownConfig.gfm,
    smartypants: markdownConfig.smartypants,
  },
  vite: {
    server: {
      cors: true,
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === "UNUSED_EXTERNAL_IMPORT" &&
            warning.exporter === "@astrojs/internal-helpers/remote"
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
  },
});
