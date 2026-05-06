import { promises as fs } from "fs";
import axios from "axios";

async function fetchCiTime(filePath) {
  const url = `https://api.github.com/repos/tw93/weekly/commits?path=${filePath}&page=1&per_page=1`;
  try {
    const response = await axios.get(url);
    const commitDate = response.data?.[0]?.commit?.committer?.date;
    return commitDate ? commitDate.split("T")[0] : null;
  } catch (error) {
    return null;
  }
}

async function main() {
  const readmeContent =
    "# 潮流周刊\n\n> 记录工程师 Tw93 的不枯燥生活，欢迎订阅，也欢迎 [推荐](https://github.com/tw93/weekly/discussions/22) 你的好东西，Fork 自用可见 [开发文档](https://github.com/tw93/weekly/blob/main/Deploy.md)，期待你玩得开心~\n\n";

  const files = await fs.readdir("./src/pages/posts");
  const mdFiles = files
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => {
      const matchA = a.match(/(\d+)/);
      const matchB = b.match(/(\d+)/);
      if (!matchA || !matchB) return 0;
      const numA = parseInt(matchA[0], 10);
      const numB = parseInt(matchB[0], 10);
      return numB - numA;
    });

  const posts = [];
  let recentContent = "";
  let readmeContent2 = "";

  for (let i = 0; i < mdFiles.length; i++) {
    const name = mdFiles[i];
    const filePath = encodeURIComponent(name);
    const oldTitle = name.split(".md")[0];
    const [issueNumberPart, ...restTitleParts] = oldTitle.split("-");
    const num = parseInt(issueNumberPart);
    const shortTitle = restTitleParts.join("-") || issueNumberPart;
    const url = `https://weekly.tw93.fun/posts/${num}`;
    const title = `第 ${num} 期 - ${shortTitle}`;

    // Read markdown file to extract cover image and description
    const fullPath = `./src/pages/posts/${name}`;
    const mdContent = await fs.readFile(fullPath, "utf8");
    const imgMatch = mdContent.match(/<img\s+src="([^"]+)"/);
    const pic = imgMatch ? imgMatch[1] : "";
    
    const descMatch = mdContent.match(/<small>(.*?)<\/small>/s);
    const description = descMatch ? descMatch[1].trim() : "";

    posts.push({ num, title: shortTitle, url, pic, description });
    readmeContent2 += `* [${title}](${url})\n`;

    if (i < 5) {
      const modified =
        (await fetchCiTime(`/src/pages/posts/${filePath}`)) ||
        new Date((await fs.stat(fullPath)).mtime).toISOString().split("T")[0];
      recentContent += `* [${title}](${url}) - ${modified}\n`;
    }
  }

  await Promise.all([
    fs.writeFile("README.md", readmeContent + readmeContent2),
    fs.writeFile("RECENT.md", recentContent),
    fs.writeFile("public/posts.json", JSON.stringify(posts, null, 2)),
  ]);
}

main().catch(console.error);
