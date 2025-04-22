import Image from "next/image";

export default function AboutUs() {
  return (
    <div className="text-gray-800">
      <section className="relative w-full h-[400px]">
        <Image
          src="/group-photo.png"
          alt="Alliance Team Banner"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black-600 bg-opacity-100 flex items-center justify-center">
          <h1 className="text-white text-5xl font-bold text-center">
            About <span className="text-red-500">Alliance</span>
          </h1>
          <hr />
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="mb-6 text-lg leading-relaxed">
          <strong>Alliance</strong> is a people-first job platform connecting
          talent with the right opportunities. We&apos;re passionate about removing
          hiring friction and elevating careers with purpose.
        </p>
        <p className="mb-6 text-lg leading-relaxed">
          With innovative tools and a human-centered approach, Alliance helps
          job seekers shine and employers hire better — faster.
        </p>
        <p className="text-lg leading-relaxed">
          Let’s reshape the future of work — together.
        </p>
      </section>

      {/* Core Values */}
      <section className="bg-gray-100 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-red-600">
          Our Core Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: "💡",
              title: "Innovation",
              text: "We harness modern tools to make job seeking and hiring smarter.",
            },
            {
              icon: "🤝",
              title: "Integrity",
              text: "Trust and transparency are at the heart of every connection we build.",
            },
            {
              icon: "🚀",
              title: "Growth",
              text: "We help individuals and companies grow with purpose and confidence.",
            },
          ].map((val, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-all duration-300 text-center"
            >
              <div className="text-4xl mb-4">{val.icon}</div>
              <h3 className="text-xl font-bold mb-2">{val.title}</h3>
              <p className="text-gray-600">{val.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
