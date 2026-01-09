"use client";

import { useState } from "react";

export default function FileUpload({
	onFileSelect,
	defaultFileName = "No file selected",
	labelName,
}: {
	onFileSelect: (file: File | null) => void;
	defaultFileName?: string;
	labelName: string;
}) {
	const [fileName, setFileName] = useState(defaultFileName);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFileName = e.target.files?.[0]?.name || defaultFileName;
		setFileName(selectedFileName);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};
	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files?.[0] || null;
		setFileName(file?.name || defaultFileName);
		onFileSelect(file);
	};

	return (
		<div
			className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
				isDragging ? "border-blue-500" : "border-gray-300"
			} border-dashed rounded-md`}
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
				<div className="flex text-sm text-gray-600">
					<label
						htmlFor={labelName}
						className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
					>
						<span>Upload a file</span>
						<input
							id={labelName}
							name={labelName}
							type="file"
							accept=".doc,.docx,.pdf,.odt,.rtf"
							className="sr-only"
							onChange={handleFileChange}
						/>
					</label>
					<p className="pl-1">or drag and drop</p>
				</div>
				<p className="text-sm font-medium text-gray-700">{fileName}</p>
			</div>
		</div>
	);
}
