"use client";

import { useRef, useState } from "react";

export default function FileUpload({
  onFileSelect,
  defaultFileName = "No file selected",
  labelName,
  required = false,
}: {
  onFileSelect: (file: File | null) => void;
  defaultFileName?: string | undefined;
  labelName: string;
  required?: boolean;
}) {
  const [fileName, setFileName] = useState(defaultFileName);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFileDialog = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFileName(file?.name ?? defaultFileName);
    if (file) setError(null);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] ?? null;
    setFileName(file?.name ?? defaultFileName);
    if (file) setError(null);
    onFileSelect(file);
  };

  return (
    <div>
      {/* Accessible label for the hidden input */}
      <label htmlFor={labelName} className="sr-only">
        {`Upload ${labelName}${required ? " (required)" : ""}`}
      </label>

      <input
        ref={inputRef}
        id={labelName}
        name={labelName}
        type="file"
        accept=".doc,.docx,.pdf,.odt,.rtf"
        className="sr-only"
        onChange={handleFileChange}
        required={required}
      />

      <button
        type="button"
        className={`mt-1 flex w-full justify-center px-6 pt-5 pb-6 border-2 ${
          isDragging
            ? "border-blue-500"
            : error
              ? "border-red-500"
              : "border-gray-300"
        } border-dashed rounded-md`}
        aria-label="File upload. Click to choose a file or drag and drop."
        aria-invalid={error ? "true" : "false"}
        onClick={openFileDialog}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFileDialog();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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

          <div className="flex text-sm text-gray-600 justify-center">
            <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              Upload a file
            </span>
            <p className="pl-1">or drag and drop</p>
          </div>

          <p className="text-sm font-medium text-gray-700">{fileName}</p>
        </div>
      </button>
    </div>
  );
}
