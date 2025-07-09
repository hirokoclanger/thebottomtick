import { promises as fs } from "fs";
import path from "path";
import type { Article } from "./articles";

const CSV_PATH = path.join(process.cwd(), "src/app/blog/articles.csv");

function parseCsv(csv: string): Article[] {
  const [header, ...rows] = csv.trim().split(/\r?\n/);
  return rows.map((row) => {
    // Split on commas not inside quotes
    const cols = row.match(/\"(?:[^\"]|\"\")*\"|[^,]+/g)?.map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"')) || [];
    return {
      slug: cols[0],
      title: cols[1],
      content: cols[2],
      image: cols[3] || undefined,
      date: cols[4],
      tags: cols[5] || "",
    };
  });
}

export async function getAllArticles(): Promise<Article[]> {
  let articles: Article[] = [];
  try {
    const csv = await fs.readFile(CSV_PATH, "utf8");
    articles = parseCsv(csv);
  } catch {
    // File may not exist yet
  }
  return articles.reverse();
}
