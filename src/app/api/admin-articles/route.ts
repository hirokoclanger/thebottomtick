import { NextResponse } from "next/server";
import { getAllArticles } from "../../blog/getAllArticles";

export async function GET() {
  const articles = await getAllArticles();
  return NextResponse.json(articles);
}
