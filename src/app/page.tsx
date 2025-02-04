import Crossword from '@/components/Crossword';
import '@/app/styles/globals.css';
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Mini Crossword Generator</h1>
        <p className="text-center mb-4">By <a href="https://rivanjarjes.com" className="text-blue-500 hover:underline">Rivan Jarjes</a></p>
        <Crossword />
      </div>
    </main>
  );
}
