import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/upload">
          <div className="bg-beige-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-beige-200 h-full">
            <h2 className="text-xl font-semibold text-pine-green-700 mb-3">Upload Data</h2>
            <p className="text-pine-green-600">
              Upload and manage your glucose readings from CSV files or manual entries.
            </p>
          </div>
        </Link>
        
        <Link href="/dashboard/insights">
          <div className="bg-beige-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-beige-200 h-full">
            <h2 className="text-xl font-semibold text-pine-green-700 mb-3">Insights</h2>
            <p className="text-pine-green-600">
              View patterns and trends in your glucose data with visual analytics.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}