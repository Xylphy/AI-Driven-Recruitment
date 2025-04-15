import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Dream Job with{" "}
            <span className="text-red-600">Alliance</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Explore thousands of job opportunities from top companies. Whether
            you're starting out or looking for a career change, we've got you
            covered.
          </p>
          <Link
            href="/login"
            className="bg-[#E30022] inline-block text-white font-bold py-3 px-6 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
          >
            BROWSE JOBS
          </Link>
        </div>
      </section>

      <section className="py-16 px-6 bg-[#E30022]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Curated Listings
            </h3>
            <p className="text-white">
              We hand-pick jobs from reputable companies to ensure quality and
              relevance.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Smart Search
            </h3>
            <p className="text-white">
              Filter by location, salary, and role type to quickly find what
              fits you best.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Career Resources
            </h3>
            <p className="text-white">
              Get tips on resumes, interviews, and more to stay ahead of the
              competition.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Popular Job Categories
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {["IT & Software", "Marketing", "Finance", "Healthcare"].map(
              (category, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                >
                  <h4 className="text-lg font-semibold text-gray-800">
                    {category}
                  </h4>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="py-20 text-center px-6">
        <h2 className="text-3xl text-[#E30022] md:text-4xl font-bold mb-4">
          Ready to take the next step?
        </h2>
        <p className="text-lg mb-8">
          Sign up and get matched with the best opportunities.
        </p>
        <Link
          href="/signup"
          className="bg-[#E30022] inline-block text-white font-bold py-3 px-6 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
        >
          APPLY NOW
        </Link>
      </section>
    </>
  );
}
