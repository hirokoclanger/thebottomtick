"use client";
import { useState } from "react";

export default function AdminAuth({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === process.env.NEXT_PUBLIC_ADMIN_PW || pw === "admin123") {
      onAuth();
    } else {
      setError("Incorrect password");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xs mx-auto mt-16 p-6 bg-[#181d23] border border-[#23272f] rounded">
      <h2 className="text-xl font-bold mb-2">Admin Login</h2>
      <input
        type="password"
        className="border p-2 rounded"
        placeholder="Admin password"
        value={pw}
        onChange={e => setPw(e.target.value)}
        required
      />
      <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}
