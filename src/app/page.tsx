import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-xl font-bold">Insulight</h1>
          <nav className="space-x-4">
            <Link href="/login">
              <Button variant="outline" className="bg-beige-200 hover:bg-beige-300 text-pine-green-700 border-pine-green-500">Log in</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-pine-green-600 hover:bg-pine-green-700">Sign up</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-6">
        <section className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-4xl font-bold mb-6 text-pine-green-700">Track Your Blood Glucose with AI Insights</h2>
          <p className="text-xl mb-8 text-pine-green-600">
            Manage your diabetes effectively with personalized insights and recommendations
            powered by artificial intelligence.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-pine-green-600 hover:bg-pine-green-700 text-beige-100">Get Started</Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="border-pine-green-500 text-pine-green-700 hover:bg-beige-100">Learn More</Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
          <div className="bg-beige-100 p-6 rounded-lg shadow-md border border-beige-200">
            <h3 className="text-xl font-bold mb-3 text-pine-green-700">Easy Blood Glucose Tracking</h3>
            <p className="text-pine-green-600">Quickly log your blood glucose readings, meals, and activities.</p>
          </div>
          <div className="bg-beige-100 p-6 rounded-lg shadow-md border border-beige-200">
            <h3 className="text-xl font-bold mb-3 text-pine-green-700">AI-Powered Insights</h3>
            <p className="text-pine-green-600">Receive personalized recommendations and pattern analysis based on your data.</p>
          </div>
          <div className="bg-beige-100 p-6 rounded-lg shadow-md border border-beige-200">
            <h3 className="text-xl font-bold mb-3 text-pine-green-700">Secure Data Storage</h3>
            <p className="text-pine-green-600">Your health data is securely stored and accessible only to you.</p>
          </div>
        </section>
      </main>

      <footer className="bg-pine-green-800 text-beige-100 py-6">
        <div className="container mx-auto px-6 text-center">
          <p>© {new Date().getFullYear()} Insulight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
