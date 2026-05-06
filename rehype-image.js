// rehype 插件：给正文里的 <img> 加上 PhotoSwipe / aspect-ratio / lazy-loading
import { visit } from "unist-util-visit";
import fs from "fs";
import path from "path";

let imageMetadataCache = null;

function getImageMetadata() {
  if (process.env.NODE_ENV === "production" && imageMetadataCache) {
    return imageMetadataCache;
  }
  const METADATA_PATH = path.resolve("./src/data/image-metadata.json");
  if (!fs.existsSync(METADATA_PATH)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(METADATA_PATH, "utf-8"));
    if (process.env.NODE_ENV === "production") {
      imageMetadataCache = data;
    }
    return data;
  } catch (e) {
    console.error("Failed to parse image-metadata.json", e);
    return {};
  }
}

const CDN_DOMAIN_REGEX = /https:\/\/cdn\.wuyutaott\.com/;
const SKIP_REGEX = /\.(?:gif|svg|GIF|SVG)(?:\?.*)?$/;

const getHeroImage = (tree) => {
  let heroUrl = null;
  visit(tree, "raw", (node) => {
    if (heroUrl) return;
    const match = /<img\s+[^>]*src="([^"]+)"/.exec(node.value);
    if (match) {
      const url = match[1];
      if (url.match(CDN_DOMAIN_REGEX) && !url.match(SKIP_REGEX)) {
        heroUrl = url;
      }
    }
  });
  return heroUrl;
};

export default function rehypeCustomizeImageSrc() {
  return (tree, file) => {
    const imageMetadata = getImageMetadata();
    let imageIndex = 0;

    const heroImage = getHeroImage(tree);
    if (heroImage) {
      if (!file.data.astro) file.data.astro = {};
      if (!file.data.astro.frontmatter) file.data.astro.frontmatter = {};
      file.data.astro.frontmatter.heroImage = heroImage;
    }

    visit(tree, "raw", (node) => {
      const fullImgRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g;
      node.value = node.value.replace(fullImgRegex, (fullMatch, p1) => {
        const urlLower = p1.toLowerCase();
        const isSvgOrGif =
          urlLower.includes(".svg") || urlLower.includes(".gif");

        if (isSvgOrGif) {
          return fullMatch;
        }

        if (!p1.match(CDN_DOMAIN_REGEX)) {
          return fullMatch;
        }

        imageIndex++;
        const isFirstImage = imageIndex === 1;
        const meta = imageMetadata[p1];

        const originalWidthMatch = fullMatch.match(/width="([^"]*)"/);
        const originalHeightMatch = fullMatch.match(/height="([^"]*)"/);
        const origWidth = originalWidthMatch
          ? originalWidthMatch[1].replace("px", "")
          : null;
        const origHeight = originalHeightMatch
          ? originalHeightMatch[1].replace("px", "")
          : null;

        let newAttrs = `src="${p1}" data-lightense-src="${p1}" data-pswp-src="${p1}"`;

        const metaWidth = meta?.width;
        const metaHeight = meta?.height;

        const loadingAttr = isFirstImage
          ? 'loading="eager" fetchpriority="high"'
          : 'loading="lazy"';
        newAttrs += ` ${loadingAttr}`;

        if (metaWidth && metaHeight) {
          const ratio = (Number(metaWidth) / Number(metaHeight)).toFixed(4);
          newAttrs += ` data-pswp-width="${metaWidth}" data-pswp-height="${metaHeight}" style="aspect-ratio: ${ratio};"`;
        }

        if (origWidth) {
          newAttrs += ` width="${origWidth}"`;
        }
        if (origHeight) {
          newAttrs += ` height="${origHeight}"`;
        }

        const otherAttrs = fullMatch
          .replace(/<img\s+/, "")
          .replace(/\s*\/?>$/, "")
          .replace(/\s*src="[^"]*"/, "")
          .replace(/\s*width="[^"]*"/g, "")
          .replace(/\s*height="[^"]*"/g, "")
          .replace(/\s*loading="[^"]*"/g, "")
          .replace(/\s*fetchpriority="[^"]*"/g, "")
          .replace(/\s*style="[^"]*"/g, "");

        return `<img ${newAttrs} ${otherAttrs} />`;
      });
    });
  };
}
