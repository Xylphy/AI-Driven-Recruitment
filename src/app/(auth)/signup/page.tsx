"use client";

import FileUpload from "@/app/components/common/FileUpload";
import { signup } from "@/app/lib/actionServer";
import SocialLinks from "@/app/components/signup/SocialLinks";
import EducationalDetails from "@/app/components/signup/EducationalDetails";
import { useState } from "react";

export default function SignupPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [response, setResponse] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      if (selectedFile) {
        formData.set("resume", selectedFile);
      }
      const result = await signup(formData);
      setResponse(result);

      if (result.success) {
        form.reset();
        setSelectedFile(null);
      }
    } catch (error) {
      setResponse({
        success: false,
        message: `An unexpected error occurred. ${
          error instanceof Error ? error.message : ""
        }`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center mt-10">
        {response && (
          <div
            className={`${
              response.success ? "bg-green-100" : "bg-red-100"
            } border-l-4 border-${
              response.success ? "green" : "red"
            }-500 text-${response.success ? "green" : "red"}-700 p-4`}
            role="alert"
          >
            <p>{response.message}</p>
          </div>
        )}
      </div>
      <h1 className="text-4xl font-bold text-[#E30022] text-center mb-2 uppercase tracking-wide">
        REGISTRATION
      </h1>
      <hr></hr>
      <p className="text-center text-sm text-gray-700 mt-2 mb-6">
        Join a community of innovators, problem-solvers, and change-makers.
      </p>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="mb-4">
          <label
            htmlFor="resume"
            className="block text-sm font-medium text-gray-700"
          >
            Upload Resume
          </label>
          <FileUpload onFileSelect={handleFileSelect} />
        </div>
        <h3 className="mb-2 font-bold">Basic Information</h3>
        <div className="mb-4">
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <select
            id="prefix"
            name="prefix"
            className="w-24 px-4 py-2 border border-gray-300 rounded-md focus:ring-red-600 "
          >
            <option value="">None</option>
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Ms.">Ms.</option>
            <option value="Dr.">Dr.</option>
            <option value="Jr.">Jr.</option>
            <option value="Sr.">Sr.</option>
            <option value="Engr.">Engr.</option>
          </select>

          <input
            type="text"
            id="firstName"
            name="firstName"
            className="flex-1 ml-2 w-130 px-4 py-2 border border-gray-300 rounded-md focus:ring-red-600 focus:border-red-600"
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
          <div className="flex">
            <select
              id="countryCode"
              name="countryCode"
              className="w-35 px-4 py-2 border border-gray-300 rounded-md focus:ring-red-600"
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
          <h3 className="mb-2 font-bold">Address Information</h3>
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
          <h3 className="mb-2 font-bold">Professional Details</h3>
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
          disabled={isSubmitting}
          className="flex mb-5 justify-center items-center w-full bg-red-600 text-white font-bold px-4 py-3 rounded-md border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
        >
          {isSubmitting ? "Processing..." : "Submit"}
        </button>
      </form>
    </>
  );
}
