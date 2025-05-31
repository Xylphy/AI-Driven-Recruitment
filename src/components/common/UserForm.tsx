import SocialLinks from "@/components/signup/SocialLinks";
import EducationalDetails from "@/components/signup/EducationalDetails";
import JobExperiences from "@/components/signup/JobExperience";
import {
  EducationalDetailClass,
  JobExperienceClass,
  SocialLinkClass,
} from "@/types/classes";
import FileUpload from "@/components/common/FileUpload";
import {
  SocialLink,
  EducationalDetail,
  JobExperience,
  User,
} from "@/types/types";
import React from "react";
import { COUNTRY, COUNTRY_CODES, PREFIXES } from "@/lib/constants";

export function UserForm({
  socialLinksInfo,
  educationalDetailsInfo,
  jobExperiencesInfo,
  userInfo,
  isSubmitting,
  handleSubmit,
  handleFileSelect,
  response,
  description,
  title,
  fileName,
}: {
  socialLinksInfo: {
    socialLinks: SocialLink[];
    setSocialLinks: React.Dispatch<React.SetStateAction<SocialLink[]>>;
  };
  educationalDetailsInfo: {
    educationalDetails: EducationalDetail[];
    setEducationalDetails: React.Dispatch<
      React.SetStateAction<EducationalDetail[]>
    >;
  };
  jobExperiencesInfo: {
    jobExperiences: JobExperience[];
    setJobExperience: React.Dispatch<React.SetStateAction<JobExperience[]>>;
  };
  userInfo?: User;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  response: {
    success?: boolean;
    message?: string;
  } | null;
  handleFileSelect: (file: File | null) => void;
  title: string;
  description: string;
  fileName?: string;
}) {
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
        {title}
      </h1>
      <hr></hr>
      <p className="text-center text-sm text-gray-700 mt-2 mb-6">
        {description}
      </p>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="mb-4">
          <label
            htmlFor="resume"
            className="block text-sm font-medium text-gray-700"
          >
            Upload Resume
          </label>
          <FileUpload
            onFileSelect={handleFileSelect}
            defaultFileName={fileName}
          />
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
            defaultValue={userInfo?.prefix}
          >
            <option value="">None</option>
            {PREFIXES.map((prefix) => (
              <option key={prefix} value={prefix}>
                {prefix}
              </option>
            ))}
          </select>

          <input
            type="text"
            id="firstName"
            name="firstName"
            className="flex-1 ml-2 w-130 px-4 py-2 border border-gray-300 rounded-md focus:ring-red-600 focus:border-red-600"
            required
            defaultValue={userInfo?.firstName}
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
            defaultValue={userInfo?.lastName}
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
            defaultValue={userInfo?.email}
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
              defaultValue={userInfo?.mobileNumber}
            >
              {Object.entries(COUNTRY_CODES).map(([country, code]) => (
                <option key={country} value={code}>
                  {code} ({country})
                </option>
              ))}
            </select>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              className="w-full mt-0 px-4 py-2 border border-gray-300 rounded-r-md focus:ring-blue-500 focus:border-blue-500"
              required
              defaultValue={userInfo?.mobileNumber}
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
              defaultValue={userInfo?.street}
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
              defaultValue={userInfo?.zip}
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
              defaultValue={userInfo?.city}
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
              defaultValue={userInfo?.state_}
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
              defaultValue={userInfo?.country}
            >
              <option value="">Select a country</option>
              {Object.entries(COUNTRY).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
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
              defaultValue={userInfo?.jobTitle}
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
              defaultValue={userInfo?.skillSet}
            ></textarea>
          </div>
        </div>
        <div className="mb-4">
          <EducationalDetails
            add={() => {
              educationalDetailsInfo.setEducationalDetails([
                ...educationalDetailsInfo.educationalDetails,
                new EducationalDetailClass(
                  educationalDetailsInfo.educationalDetails.length + 1
                ),
              ]);
            }}
            update={(id: number, key: string, value: string | boolean) => {
              educationalDetailsInfo.setEducationalDetails((prev) =>
                prev.map((detail) =>
                  detail.id === id ? { ...detail, [key]: value } : detail
                )
              );
            }}
            delete={(id: number) => {
              educationalDetailsInfo.setEducationalDetails((prev) =>
                prev.filter((detail) => detail.id !== id)
              );
            }}
            getEducationalDetails={
              educationalDetailsInfo.educationalDetails || []
            }
          />
        </div>
        <div className="mb-4">
          <JobExperiences
            add={() => {
              jobExperiencesInfo.setJobExperience([
                ...jobExperiencesInfo.jobExperiences,
                new JobExperienceClass(
                  jobExperiencesInfo.jobExperiences.length + 1
                ),
              ]);
            }}
            update={(id: number, key: string, value: string | boolean) => {
              jobExperiencesInfo.setJobExperience((prev) =>
                prev.map((detail) =>
                  detail.id === id ? { ...detail, [key]: value } : detail
                )
              );
            }}
            delete={(id: number) => {
              jobExperiencesInfo.setJobExperience((prev) =>
                prev.filter((detail) => detail.id !== id)
              );
            }}
            getJobExperiences={jobExperiencesInfo.jobExperiences || []}
          />
        </div>
        <div className="mb-4">
          <SocialLinks
            update={(id: number, value: string) => {
              socialLinksInfo?.setSocialLinks((prev) =>
                prev.map((link) => (link.id === id ? { ...link, value } : link))
              );
            }}
            delete={(id: number) => {
              socialLinksInfo.setSocialLinks((prev) =>
                prev.filter((link) => link.id !== id)
              );
            }}
            add={() => {
              socialLinksInfo.setSocialLinks((links) => [
                ...links,
                new SocialLinkClass(links.length + 1),
              ]);
            }}
            getSocialLinks={socialLinksInfo.socialLinks || []}
          />
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
