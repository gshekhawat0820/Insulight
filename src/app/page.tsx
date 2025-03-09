import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-pine-green-800 text-beige-100 shadow-md">
        <div className="mx-auto px-10 py-2 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/insulight.svg" 
              alt="Insulight Logo" 
              height={55} 
              width={130} 
              priority 
            />
          </Link>
          <nav className="space-x-4">
            <Link href="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4 bg-beige-200 hover:bg-beige-300 text-pine-green-700 border-pine-green-500">
              Log in
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4 bg-pine-green-500 hover:bg-pine-green-600 text-white">
              Sign up
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
            <Link href="/register" className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-11 px-8 rounded-md bg-pine-green-600 hover:bg-pine-green-700 text-beige-100">
              Get Started
            </Link>
            <Link href="/about" className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-11 px-8 rounded-md border border-input hover:bg-accent hover:text-accent-foreground border-pine-green-500 text-pine-green-700 hover:bg-beige-100">
              Learn More
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
