export default function ContactUs() {
	return (
		<div className="text-gray-800">
			{/* Hero Section */}
			<section
				className="relative w-full h-[300px] bg-cover bg-center"
				style={{ backgroundImage: "url('/images/contact-hero.jpg')" }}
			>
				<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<h1 className="text-white text-4xl sm:text-5xl font-bold">
						Contact <span className="text-red-500">Alliance</span>
					</h1>
				</div>
			</section>

			<section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
				<div>
					<h2 className="text-2xl font-bold mb-6 text-red-600">
						Send Us a Message
					</h2>
					<form className="space-y-6">
						<div>
							<label htmlFor="name" className="block text-sm font-medium">
								Full Name
							</label>
							<input
								type="text"
								id="name"
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
								placeholder="Your Name"
								required
							/>
						</div>
						<div>
							<label htmlFor="email" className="block text-sm font-medium">
								Email
							</label>
							<input
								type="email"
								id="email"
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
								placeholder="you@example.com"
								required
							/>
						</div>
						<div>
							<label htmlFor="message" className="block text-sm font-medium">
								Message
							</label>
							<textarea
								id="message"
								rows={5}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
								placeholder="Tell us how we can help you..."
								required
							/>
						</div>
						<button
							type="submit"
							className="bg-red-600 text-white px-6 py-3 rounded-md font-semibold transition-all duration-300 hover:bg-transparent hover:text-red-600 border border-red-600"
						>
							Send Message
						</button>
					</form>
				</div>
				<div className="p-8 rounded-md justify-center content-center">
					<h2 className="text-2xl font-bold mb-6 text-red-600">Get in Touch</h2>
					<p className="mb-4">
						Have questions, feedback, or partnership ideas? We’d love to hear
						from you.
					</p>
					<ul className="space-y-4">
						<li>
							📧 <strong>Email:</strong> support@alliancejobs.com
						</li>
						<li>
							📞 <strong>Phone:</strong> +1 (555) 123-4567
						</li>
						<li>
							📍 <strong>Address:</strong> 123 Career Street, Tech Valley, CA
							90210
						</li>
						<li>
							🕒 <strong>Business Hours:</strong> Mon – Fri, 9AM to 6PM
						</li>
					</ul>
				</div>
			</section>
		</div>
	);
}
