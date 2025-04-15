import FileUpload from "@/app/components/common/FileUpload";
import { signup } from "@/app/lib/action";
import {
  EducationalDetails,
  SocialLinks,
} from "@/app/components/signup/components";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Sign Up
        </h2>
        <form action={signup} className="mt-6">
          <div className="mb-4">
            <label
              htmlFor="resume"
              className="block text-sm font-medium text-gray-700"
            >
              Upload Resume
            </label>
            <FileUpload />
          </div>
          <div className="mb-4">
            <select
              id="prefix"
              name="prefix"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">None</option>
              <option value="mr">Mr.</option>
              <option value="mrs">Mrs.</option>
              <option value="ms">Ms.</option>
              <option value="dr">Dr.</option>
              <option value="jr">Jr.</option>
              <option value="sr">Sr.</option>
            </select>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="mobileNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Mobile Number
            </label>
          {/* asda */}
            <div className="flex">
              <select
                id="countryCode"
                name="countryCode"
                className="w-20 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="+63">+63 (PH)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+91">+91 (IN)</option>
              </select>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                className="w-full mt-0 px-4 py-2 border border-gray-300 rounded-r-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
              
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Address Information
            </h3>

            <div className="mt-2">
              <label
                htmlFor="street"
                className="block text-sm font-medium text-gray-700"
              >
                Street
              </label>
              <input
                type="text"
                id="street"
                name="street"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="zip"
                className="block text-sm font-medium text-gray-700"
              >
                ZIP/Postal Code
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
               
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
               
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700"
              >
                State/Province
              </label>
              <input
                type="text"
                id="state"
                name="state"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
               
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700"
              >
                Country
              </label>
              <select
                id="country"
                name="country"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                
              >
                <option value="">Select a country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="IN">India</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Professional Details
            </h3>

            <div className="mt-2">
              <label
                htmlFor="jobTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Current Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
             
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="skillSet"
                className="block text-sm font-medium text-gray-700"
              >
                Skill Set
              </label>
              <textarea
                id="skillSet"
                name="skillSet"
                rows={4}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="List your skills separated by commas"
              
              ></textarea>
            </div>
          </div>
          <div className="mb-4">
            <EducationalDetails />
          </div>
          <div className="mb-4">
            <SocialLinks />
          </div>
            <div className="mb-4">
            <div className="mt-4">
              <label
              htmlFor="resumeFile"
              className="block text-sm font-medium text-gray-700"
              >
              Upload Resume File
              </label>
              <input
              type="file"
              id="resumeFile"
              name="resumeFile"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              accept=".pdf,.doc,.docx"
              />
            </div>
            </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
