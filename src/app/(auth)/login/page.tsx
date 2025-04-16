import { login } from "@/app/lib/action";
import { Button } from "@/app/components/common/Button";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <h1 className="text-4xl font-bold text-[#E30022] text-center mb-2 uppercase tracking-wide">
        Welcome Back!
      </h1>
      <hr></hr>
      <p className="text-center text-sm text-gray-700 mt-2 mb-6">
        Log in to your Alliance Software Inc. Careers account
      </p>
      <form className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          id="email"
          className="w-full px-4 py-3 border border-red-500 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          className="w-full px-4 py-3 border border-red-500 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
        <Button
          type="submit"
          className="flex justify-center items-center w-full bg-red-600 text-white font-bold px-4 py-3 rounded-md border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
        >
          LOG IN
        </Button>
      </form>
      <br></br>
      <p className="text-sm text-center text-gray-600 mb-3">
        Forgot your password?{" "}
        <a href="/signup" className="text-red-600 hover:underline">
          Click Here
        </a>
      </p>
      <hr></hr>
      <h1 className="text-4xl font-bold text-[#E30022] text-center mt-5 uppercase tracking-wide">
        NEW TO ALLIANCE
      </h1>
      <p className="text-center text-sm text-gray-700 mt-2 mb-6">
        <b>Start your journey with us!</b>
        <br></br>Create an account to apply for roles, get job alerts, and take
        the first step toward a rewarding career.
      </p>
      <Link
        href="/signup/"
        className="flex justify-center items-center w-full bg-red-600 text-white font-bold px-4 py-3 rounded-md border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
      >
        Get Started Here
      </Link>
    </>
  );
}
