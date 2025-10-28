import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <AppRoutes />
        <Toaster />
      </div>
    </BrowserRouter>
  );
}