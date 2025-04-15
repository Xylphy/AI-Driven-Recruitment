import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white text-black shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">Alliance</div>
        <ul className="flex-1 flex justify-center space-x-6">
          <Link href="/" className="hover:text-gray-600">
            <li>Home</li>
          </Link>
          <Link href="/aboutus/" className="hover:text-gray-600">
            <li>About Us</li>
          </Link>
          <Link href="/trainings/" className="hover:text-gray-600">
            Trainings
          </Link>
          <Link href="/contactus/" className="hover:text-gray-600">
            <li>Contact Us</li>
          </Link>
        </ul>
        <Link
          href="/login"
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Apply Now
        </Link>
      </div>
    </nav>
  );
}
