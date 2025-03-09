import Link from "next/link";
import Image from "next/image";
import { UserNav } from "./user-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-pine-green-800 text-beige-100 shadow-md">
        <div className="mx-auto px-10 py-2 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/insulight.svg" 
              alt="Insulight Logo" 
              height={40} 
              width={110} 
              priority
            />
          </Link>
          <UserNav />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-beige-100 border-r border-beige-200 hidden md:block">
          <nav className="p-4">
            <div className="space-y-1">
              <Link href="/dashboard" 
                className="block px-4 py-2 rounded-md hover:bg-beige-200 text-pine-green-700 font-medium">
                Dashboard
              </Link>
              <Link href="/dashboard/upload" 
                className="block px-4 py-2 rounded-md hover:bg-beige-200 text-pine-green-700 font-medium">
                Upload Data
              </Link>
              <Link href="/dashboard/insights" 
                className="block px-4 py-2 rounded-md hover:bg-beige-200 text-pine-green-700 font-medium">
                Insights
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 bg-white">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}