import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const hoverGrow = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  return (
    <>
      <motion.section
        className="py-20 px-6 text-center"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <motion.div className="max-w-4xl mx-auto" variants={fadeUp}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Dream Job with{" "}
            <span className="text-red-600">Alliance</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Explore thousands of job opportunities from top companies. Whether
            you're starting out or looking for a career change, we've got you
            covered.
          </p>
          <motion.div variants={fadeUp} whileHover={hoverGrow.hover}>
            <Link
              href="/login"
              className="bg-[#E30022] inline-block text-white font-bold py-3 px-6 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
            >
              BROWSE JOBS
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        className="py-16 px-6 bg-[#E30022]"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <motion.div
          className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center"
          variants={fadeUp}
        >
          {[
            {
              title: "Curated Listings",
              desc: "We hand-pick jobs from reputable companies to ensure quality and relevance.",
            },
            {
              title: "Smart Search",
              desc: "Filter by location, salary, and role type to quickly find what fits you best.",
            },
            {
              title: "Career Resources",
              desc: "Get tips on resumes, interviews, and more to stay ahead of the competition.",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="p-6 rounded-lg shadow-lg hover:shadow-2xl bg-white/10"
              variants={fadeUp}
              whileHover={{ scale: 1.03 }}
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-white">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="py-16 px-6 bg-gray-50"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <motion.div className="max-w-6xl mx-auto text-center" variants={fadeUp}>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Popular Job Categories
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {["IT & Software", "Marketing", "Finance", "Healthcare"].map(
              (category, i) => (
                <motion.div
                  key={i}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg"
                  variants={fadeUp}
                  whileHover={{ y: -5, transition: { duration: 0.3 } }}
                >
                  <h4 className="text-lg font-semibold text-gray-800">
                    {category}
                  </h4>
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        className="py-20 text-center px-6"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <motion.h2
          className="text-3xl text-[#E30022] md:text-4xl font-bold mb-4"
          variants={fadeUp}
        >
          Ready to take the next step?
        </motion.h2>
        <motion.p className="text-lg mb-8" variants={fadeUp}>
          Sign up and get matched with the best opportunities.
        </motion.p>
        <motion.div variants={fadeUp} whileHover={hoverGrow.hover}>
          <Link
            href="/signup"
            className="bg-[#E30022] inline-block text-white font-bold py-3 px-6 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
          >
            APPLY NOW
          </Link>
        </motion.div>
      </motion.section>
    </>
  );
}
