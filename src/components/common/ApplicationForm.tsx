import type React from "react";
import SocialLinks from "@/components/application/SocialLinks";
import FileUpload from "@/components/common/FileUpload";
import { SocialLinkClass } from "@/types/classes";
import type { SocialLink, User } from "@/types/types";

export function ApplicationForm({
  socialLinksInfo,
  userInfo,
  isSubmitting,
  handleSubmit,
  handleFileSelect,
  response,
  description,
  title,
  handleTranscriptSelect,
}: {
  socialLinksInfo: {
    socialLinks: SocialLink[];
    setSocialLinks: React.Dispatch<React.SetStateAction<SocialLink[]>>;
  };
  userInfo?: {
    user: User;
    setUserInfo: React.Dispatch<React.SetStateAction<User>>;
  };
  isSubmitting: boolean;
  handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
  response: {
    success?: boolean;
    message?: string;
  } | null;
  handleFileSelect: (file: File | null) => void;
  title: string;
  description: string;
  handleTranscriptSelect?: (file: File | null) => void;
}) {
  const inputStyle =
    "w-full px-4 py-3 rounded-xl bg-white border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition";

  return (
    <div className="bg-linear-to-br from-red-100 via-white to-red-50 border border-gray-200 shadow-2xl rounded-3xl p-10">
      {response && (
        <div className="mb-6 rounded-xl px-4 py-3 text-sm font-medium border bg-red-50 border-red-400 text-red-700">
          {response.message}
        </div>
      )}

      <h1 className="text-3xl font-bold text-red-600 text-center uppercase tracking-wide">
        {title}
      </h1>

      <p className="text-center text-gray-600 mt-2 mb-8 text-sm">
        {description}
      </p>

      <form onSubmit={handleSubmit} className="space-y-10" noValidate>
        <div className="space-y-2">
          <label
            htmlFor="resume-upload"
            className="text-sm font-medium text-gray-700"
          >
            Upload Resume
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <FileUpload
              onFileSelect={handleFileSelect}
              labelName="Upload Resume"
              required
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
            Basic Information
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm text-gray-600">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                required
                defaultValue={userInfo?.user.firstName}
                className={inputStyle}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm text-gray-600">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                required
                defaultValue={userInfo?.user.lastName}
                className={inputStyle}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="email" className="text-sm text-gray-600">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                defaultValue={userInfo?.user.email}
                className={inputStyle}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="mobileNumber" className="text-sm text-gray-600">
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobileNumber"
                required
                defaultValue={userInfo?.user.mobileNumber}
                className={inputStyle}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
            Address Information
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Street"
              defaultValue={userInfo?.user.street}
              className={inputStyle}
            />

            <input
              type="text"
              placeholder="City"
              defaultValue={userInfo?.user.city}
              className={inputStyle}
            />

            <input
              type="text"
              placeholder="State / Province"
              defaultValue={userInfo?.user.state_}
              className={inputStyle}
            />

            <input
              type="text"
              placeholder="ZIP / Postal Code"
              defaultValue={userInfo?.user.zip}
              className={inputStyle}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Social Links
          </h3>

          <SocialLinks
            update={(id: number, value: string) => {
              socialLinksInfo?.setSocialLinks((prev) =>
                prev.map((link) =>
                  link.id === id ? { ...link, value } : link,
                ),
              );
            }}
            delete={(id: number) => {
              socialLinksInfo.setSocialLinks((prev) =>
                prev.filter((link) => link.id !== id),
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
        <div className="space-y-2">
          <label
            htmlFor="transcript"
            className="block text-sm font-medium text-gray-700"
          >
            Upload Interview Video
          </label>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            {handleTranscriptSelect && (
              <FileUpload
                onFileSelect={handleTranscriptSelect}
                labelName="Upload Interview Video"
                required
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex mb-5 justify-center items-center w-full px-6 py-2 rounded-lg bg-linear-to-r from-red-600 to-red-500 text-white font-bold shadow-lg hover:scale-[1.02] transition"
        >
          {isSubmitting ? "Continuing..." : "Continue to Skill Assessment"}
        </button>
      </form>
    </div>
  );
}
