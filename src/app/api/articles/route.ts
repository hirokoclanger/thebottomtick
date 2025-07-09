import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CSV_PATH = path.join(process.cwd(), "src/app/blog/articles.csv");

function parseCsv(csv: string) {
  const [header, ...rows] = csv.trim().split(/\r?\n/);
  return rows.map((row) => {
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

export async function GET() {
  try {
    const csv = await fs.readFile(CSV_PATH, "utf8");
    const articles = parseCsv(csv);
    return NextResponse.json(articles);
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}

function toCsvRow(obj: Record<string, any>) {
  // Escape quotes and commas
  return [
    obj.slug,
    obj.title.replace(/"/g, '""'),
    obj.content.replace(/"/g, '""'),
    obj.image || "",
    obj.date,
    obj.description.replace(/"/g, '""'),
  ].map((v) => `"${v}"`).join(",") + "\n";
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  if (!data.slug || !data.title || !data.content || !data.date || !data.description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  let csv = "";
  try {
    csv = await fs.readFile(CSV_PATH, "utf8");
  } catch {
    return NextResponse.json({ error: "CSV file not found" }, { status: 404 });
  }
  const articles = parseCsv(csv);
  const idx = articles.findIndex((a: any) => a.slug === data.slug);
  if (idx === -1) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
  articles[idx] = data;
  const header = 'slug,title,content,image,date,description\n';
  const newCsv = header + articles.map(toCsvRow).join("");
  await fs.writeFile(CSV_PATH, newCsv, "utf8");
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  // Validate required fields
  if (!data.slug || !data.title || !data.content || !data.date || !data.description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  // Write header if file does not exist
  try {
    await fs.access(CSV_PATH);
  } catch {
    await fs.writeFile(
      CSV_PATH,
      'slug,title,content,image,date,description\n',
      'utf8'
    );
  }
  // Append new row
  await fs.appendFile(CSV_PATH, toCsvRow(data), "utf8");
  return NextResponse.json({ success: true });
}
