import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white text-black shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">
          <img src="logo.png" alt="Alliance Logo" width="130" />
        </div>
        <ul className="flex-1 flex justify-center space-x-6">
          <Link href="/">
            <li
              className="relative inline-block pb-1 
    after:content-[''] after:absolute after:bottom-0 after:left-1/2 
    after:h-[2px] after:w-0 after:bg-red-500 
    after:transition-all after:duration-300 
    hover:after:w-full hover:after:left-0 transform after:-translate-x-1/2 hover:after:translate-x-0"
            >
              Home
            </li>
          </Link>
          <Link href="/aboutus/">
            <li
              className="relative inline-block pb-1 
    after:content-[''] after:absolute after:bottom-0 after:left-1/2 
    after:h-[2px] after:w-0 after:bg-red-500 
    after:transition-all after:duration-300 
    hover:after:w-full hover:after:left-0 transform after:-translate-x-1/2 hover:after:translate-x-0"
            >
              About Us
            </li>
          </Link>
          <Link href="/trainings/">
            <li
              className="relative inline-block pb-1 
    after:content-[''] after:absolute after:bottom-0 after:left-1/2 
    after:h-[2px] after:w-0 after:bg-red-500 
    after:transition-all after:duration-300 
    hover:after:w-full hover:after:left-0 transform after:-translate-x-1/2 hover:after:translate-x-0"
            >
              Trainings
            </li>
          </Link>
          <Link href="/contactus/">
            <li
              className="relative inline-block pb-1 
    after:content-[''] after:absolute after:bottom-0 after:left-1/2 
    after:h-[2px] after:w-0 after:bg-red-500 
    after:transition-all after:duration-300 
    hover:after:w-full hover:after:left-0 transform after:-translate-x-1/2 hover:after:translate-x-0"
            >
              Contact Us
            </li>
          </Link>
        </ul>
        <Link
          href="/login"
          className="bg-[#E30022] text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
        >
          Apply Now
        </Link>
      </div>
    </nav>
  );
}
