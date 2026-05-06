/**
 * This script automates the translation of weekly posts using the Grok API (xAI).
 * It checks for missing English translations and generates them.
 * Run with: GROK_API_KEY=your_key node scripts/translate_posts.js
 */
import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
const SOURCE_DIR = path.join(__dirname, "../src/pages/posts");
const TARGET_DIR = path.join(__dirname, "../src/pages/en/posts");
const API_URL = "https://api.x.ai/v1/chat/completions";
const API_KEY = process.env.GROK_API_KEY;
const MODEL = "grok-beta";

// --- PROMPT ---
const SYSTEM_PROMPT = `You are a professional tech blogger and translator.
Translate the following Markdown content from Chinese to English.

Rules:
1. Tone: Engineer's cool, interesting, and professional tone.
2. Formatting: STRICTLY preserve all Markdown formatting (links, images, bold, lists, code blocks, etc.).
3. Content: Translate all text, including titles and descriptions.
4. Accuracy: Ensure technical terms are translated accurately.
5. Output: Return ONLY the translated Markdown content, no explanations or conversational text.`;

async function translateContent(content) {
  if (!API_KEY) {
    console.error("❌ ERROR: GROK_API_KEY is not set.");
    return null;
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: content },
        ],
        temperature: 0.3,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "❌ Translation API failed:",
      error.response?.data || error.message,
    );
    return null;
  }
}

function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (match) {
    return {
      frontmatter: match[1],
      body: match[2],
      hasFrontmatter: true,
    };
  }
  return {
    frontmatter: "",
    body: fileContent,
    hasFrontmatter: false,
  };
}

async function run() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SOURCE_DIR).filter((f) => f.endsWith(".md"));
  let processedCount = 0;

  console.log(`🔍 Checking ${files.length} posts for missing translations...`);

  for (const file of files) {
    const issueNumber = file.split("-")[0];

    // Check if any English file with this issue number already exists
    const targetFiles = fs.readdirSync(TARGET_DIR);
    const existingTranslation = targetFiles.find((f) =>
      f.startsWith(`${issueNumber}-`),
    );

    if (existingTranslation) {
      continue;
    }

    console.log(`\n🚀 Translating Issue #${issueNumber} (${file})...`);

    const sourcePath = path.join(SOURCE_DIR, file);
    const rawContent = fs.readFileSync(sourcePath, "utf-8");
    const { frontmatter, body, hasFrontmatter } = parseFrontmatter(rawContent);

    if (!body.trim()) {
      console.log(`⚠️  Skipping empty body: ${file}`);
      continue;
    }

    const translatedBody = await translateContent(body);

    if (translatedBody) {
      // Reconstruct valid file content
      let finalContent = "";
      if (hasFrontmatter) {
        finalContent = `---\n${frontmatter}\n---\n\n${translatedBody.trim()}\n`;
      } else {
        finalContent = `${translatedBody.trim()}\n`;
      }

      // Use the same filename for simplicity to maintain 1:1 mapping easily,
      // or we could translate the filename. For automation, same filename is safer/easier to track.
      // However, the original script tried to slugify the title.
      // Let's stick to the original filename to avoid duplicates if title changes.
      const targetPath = path.join(TARGET_DIR, file);

      fs.writeFileSync(targetPath, finalContent);
      console.log(`✅ Saved translation to: src/pages/en/posts/${file}`);
      processedCount++;
    }

    // Rate limiting (gentle)
    await new Promise((r) => setTimeout(r, 2000));
  }

  if (processedCount === 0) {
    console.log("\n✨ All posts have English translations. Nothing to do.");
  } else {
    console.log(`\n🎉 Successfully translated ${processedCount} posts.`);
  }
}

run();
