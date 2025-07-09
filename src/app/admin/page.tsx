"use client";
import { useState } from "react";
import AdminAuth from "./components/AdminAuth";
import TickerManager from "./components/TickerManager";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AdminAuth onAuth={() => setIsAuthenticated(true)} />;
  }

  return <TickerManager />;
}
