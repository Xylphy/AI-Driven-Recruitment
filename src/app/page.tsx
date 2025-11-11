"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import AnimatedSection from "@/components/common/AnimatedSection";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // delay between each child animation
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const hoverGrow = {
  hover: { scale: 1.05 },
};

const categories = [
  { name: "IT & Software", img: "/it-software.jpg" },
  { name: "Marketing", img: "/marketing.jpg" },
  { name: "Finance", img: "/finance.jpg" },
  { name: "Healthcare", img: "/healthcare.jpg" },
];

export default function Home() {
  const [section1Done, setSection1Done] = useState(false);
  const [section2Done, setSection2Done] = useState(false);
  const [section3Done, setSection3Done] = useState(false);

  return (
    <>
      <AnimatedSection
        className="pt-20 px-6 bg-linear-to-br from-white via-red-50 to-red-100 flex justify-center items-center"
        start={true}
        onComplete={() => setSection1Done(true)}
      >
        <motion.div
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center"
          variants={fadeUp}
        >
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Your Dream Job with{" "}
              <span className="text-red-600">Alliance</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Explore thousands of job opportunities from top companies. Whether
              you&apos;re starting out or looking for a career change,
              we&apos;ve got you covered.
            </p>
            <motion.div variants={fadeUp} whileHover={hoverGrow.hover}>
              <Link
                href="/login"
                className="bg-[#E30022] inline-block text-white font-bold py-3 px-6 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
              >
                BROWSE JOBS
              </Link>
            </motion.div>
          </div>

          <div className="relative flex justify-center items-center w-full h-full">
            <Image
              src="/professionals.png"
              alt="Professional team"
              width={500}
              height={500}
              className="w-full h-full object-cover max-w-md"
            />
          </div>
        </motion.div>
      </AnimatedSection>

      <AnimatedSection
        className="relative py-16 px-6 bg-[url('/workspace.jpg')] bg-cover bg-center bg-no-repeat"
        start={section1Done}
        onComplete={() => setSection2Done(true)}
      >
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <motion.div
          className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
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
              className="p-6 rounded-lg shadow-lg hover:shadow-2xl backdrop-blur-sm bg-white/20 border border-white/30"
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
      </AnimatedSection>

      <AnimatedSection
        className="py-16 px-6 bg-gray-50"
        start={section2Done}
        onComplete={() => setSection3Done(true)}
      >
        <motion.div className="max-w-6xl mx-auto text-center" variants={fadeUp}>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Popular Job Categories
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {categories.map((category, i) => (
              <motion.div
                key={i}
                className="bg-red-600 p-6 rounded-lg shadow hover:shadow-lg flex flex-col items-center"
                variants={fadeUp}
                initial={{ y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={category.img}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-full mb-4"
                />
                <h4 className="text-lg font-semibold text-white">
                  {category.name}
                </h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatedSection>

      <AnimatedSection className="py-20 text-center px-6" start={section3Done}>
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
      </AnimatedSection>
    </>
  );
}
