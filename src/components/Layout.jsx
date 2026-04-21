import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="layout-main">
        <div className="bg-blob-indigo"></div>
        <div className="bg-blob-purple"></div>
        <div className="layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
