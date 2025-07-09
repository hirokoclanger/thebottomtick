"use client";
import { useState } from "react";

export default function NewArticleForm({ onPost }: { onPost?: () => void } = {}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const date = new Date().toISOString().slice(0, 10);
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        title,
        content,
        image,
        date,
        description,
      }),
    });
    if (res.ok) {
      setSubmitted(true);
      if (onPost) onPost();
    } else {
      alert("Failed to submit article");
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <h2 className="text-2xl font-bold mb-4">New Article</h2>
      {submitted ? (
        <div className="p-4 bg-green-100 text-green-900 rounded">Article submitted and saved to CSV!</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="border p-2 rounded"
            placeholder="Content (HTML allowed)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
          />
          <input
            className="border p-2 rounded"
            placeholder="Image URL (optional)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Short Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Submit</button>
        </form>
      )}
    </div>
  );
}
