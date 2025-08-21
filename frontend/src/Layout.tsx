import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 shadow-sm">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="ml-64 h-full bg-white border-r border-gray-200 shadow-sm flex-1 overflow-y-auto p-6">
        <Outlet /> {/* Page content goes here */}
      </main>
    </div>
  );
}

