"use client";

import { useState } from "react";

export default function FileUpload() {
    const [fileName, setFileName] = useState("No file chosen");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFileName = e.target.files?.[0]?.name || "No file chosen";
        setFileName(selectedFileName);
        console.log("Selected file:", selectedFileName);
    };

    return (
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
            <div className="space-y-1 text-center">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                >
                    <path
                        d="M14 22v-6a6 6 0 0112 0v6m-6 0v10m0 0l-6-6m6 6l6-6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <div className="flex text-sm text-gray-600">
                    <label
                        htmlFor="resume"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                        <span>Upload a file</span>
                        <input
                            id="resume"
                            name="resume"
                            type="file"
                            accept=".doc,.docx,.pdf,.odt,.rtf"
                            className="sr-only"
                            onChange={handleFileChange}
                        />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-sm font-medium text-gray-700">{fileName}</p>
                <p className="text-xs text-gray-500">
                    DOC, DOCX, PDF, ODT, RTF up to 10MB
                </p>
            </div>
        </div>
    );
}
