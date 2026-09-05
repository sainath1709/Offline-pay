import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { DashboardProvider } from "./context/DashboardContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <DashboardProvider>
    <App />
  </DashboardProvider>
</BrowserRouter>
);