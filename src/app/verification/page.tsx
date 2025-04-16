import Link from "next/link";
import { Button } from "../components/common/Button";
import { CgEnter } from "react-icons/cg";

export default function Verification() {
  return (
    <div className="flex justify-center pt-43">
      <div className="w-full max-w-md px-6">
        <h1 className="text-4xl font-bold text-red-700 text-center mb-2 uppercase tracking-wide">
          Set Password
        </h1>
        <hr></hr>
        <p className="text-center text-sm text-gray-700 mt-2 mb-6">
          Let’s secure your account so you can start exploring opportunities
          with us.
        </p>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-red-500 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full px-4 py-3 border border-red-500 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-3 border border-red-500 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <Button
            type="submit"
            className="flex justify-center items-center w-full bg-red-600 text-white font-bold px-4 py-3 rounded-md border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
          >
            SET PASSWORD
          </Button>
        </form>
      </div>
    </div>
  );
}
