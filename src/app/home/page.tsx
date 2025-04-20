export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">
        Welcome to Our Homepage
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        This is a simple homepage built with Tailwind CSS.
      </p>
      <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Get Started
      </button>
    </div>
  );
}
