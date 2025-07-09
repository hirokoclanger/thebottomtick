"use client";
import { useState } from "react";

interface AdminAuthProps {
  onAuth: () => void;
}

export default function AdminAuth({ onAuth }: AdminAuthProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, use proper authentication
    if (password === "admin123") {
      onAuth();
    } else {
      setError("Invalid password");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
      </form>
    </div>
  );
}
