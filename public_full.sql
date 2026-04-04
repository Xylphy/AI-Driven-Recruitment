SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict ghMppylQbqiwm00rZpdzusYLQDW4L70kQdDFiaqz7opmJtxnmqfsPp6RNWx67Qy

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."staff" ("first_name", "last_name", "firebase_uid", "id", "role") VALUES
	('James Kenneth', 'Acabal', '711YaoJxjjfi5tWsiL3adiTUT143', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'SuperAdmin'),
	('Jeremy', 'Lee', 'WBISFzY2WIQaFcBfDu2ob12ItIB2', 'db175e55-c824-48b4-afb8-e2df0c11e4ef', 'Admin'),
	('Guadalue', 'Obando', 'aVlhRLPbkCTSQdDIypFeRqlto1G2', 'c582e084-6ff6-4037-bd11-9080ebf24c5e', 'Staff');


--
-- Data for Name: job_listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."job_listings" ("created_at", "title", "location", "id", "created_by", "is_fulltime", "staff_id") VALUES
	('2026-01-11 16:18:56.231695+00', 'Web Developer', 'Cebu City', '269d0e91-de13-499e-afa0-be10dfe5b265', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', true, 'c582e084-6ff6-4037-bd11-9080ebf24c5e');


--
-- Data for Name: parsed_resume; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."parsed_resume" ("id", "created_at", "parsed_resume") VALUES
	('dd523ff9-d538-4da4-9f58-9bf38ff378cc', '2026-03-06 13:41:44.11019+00', '{"city": "Cebu City, Cebu", "name": "GUADALUE NIÑA MARIE OBANDO", "email": "gnmlobando@gmail.com", "projects": [{"name": "ArtHivee - Online Art Marketplace", "start_date": "2024-01-01T00:00:00.000Z", "description": "Designed and developed fully functional, responsive websites using WordPress and Elementor. Implemented automation processes using Zapier to streamline email marketing and client interactions. Developed lead magnets, including high-converting landing pages and automated email sequences. Assisted in structuring and launching online courses with engaging, interactive content."}, {"name": "Full-stack online marketplace for artists", "start_date": "2024-01-01T00:00:00.000Z", "description": "Developed a full-stack online marketplace for artists using Python - Django Framework. Implemented authentication, real-time database updates, and a seamless e-commerce user interface. Designed and optimized database schema for efficient artwork listings and transactions."}, {"name": "Rise From Grief", "start_date": "2024-01-01T00:00:00.000Z", "description": "N/A"}], "hard_skills": ["Web Development", "WordPress", "Elementor", "Zapier", "Email Marketing", "Landing Page Development", "Python", "Django Framework", "Full-Stack Development", "E-commerce UI", "Database Design", "UI/UX Design", "Graphic Design", "Social Media Marketing", "C", "Java", "HTML", "CSS", "C++", "React", "Python", "Mysql", "Adobe Photoshop", "Canva", "Figma", "Visual Studio Code", "MS Office Tools", "Google Workspace", "AWS Cloud Architecting", "AWS Cloud Computing"], "soft_skills": ["Leadership", "Collaboration", "Problem Solving", "Communication", "Adaptability"], "contact_number": "+639999673620", "work_experience": [{"title": "Web Developer & Automation Specialist", "company": "Dinah Rainey, LLC", "end_date": "2025-01-01T00:00:00.000Z", "start_date": "2024-01-01T00:00:00.000Z"}], "educational_background": [{"degree": "Bachelor of Science in Computer Science", "end_date": "2026-05-01T00:00:00.000Z", "start_date": "2023-01-01T00:00:00.000Z", "institution": "Cebu Institute of Technology - University"}]}'),
	('551dacdd-d266-4c80-87c7-c370e8fe2d2e', '2026-03-06 13:42:34.914774+00', '{"city": "Cebu, Philippines", "name": "James Kenneth S. Acabal", "email": "jameskennethacabal@gmail.com", "projects": [{"name": "AI-Driven Recruitment System", "start_date": "2025-03-01T00:00:00.000Z", "description": "Developed a robust backend for an AI-driven recruitment system for our thesis using Next.js, MongoDB, and Firebase. Designed and implemented scalable APIs to support intelligent candidate matching, automated resume screening, and real-time data processing. Integrated MongoDB for efficient storage and retrieval of candidate profiles and job listings, while leveraging Firebase for secure authentication and real-time notifications. Optimized system performance and ensured data integrity, enabling seamless interaction between AI algorithms and user-facing applications."}, {"name": "ANI", "start_date": "2024-01-01T00:00:00.000Z", "description": "Developed a robust backend API using .NET to empower farmers with a platform to showcase and explore agricultural products from fellow farmers and consumers. Integrated a weather tracking system to provide real-time weather insights for informed farming decisions. Designed scalable RESTful endpoints, ensuring seamless data exchange and high performance for a user-friendly experience."}], "hard_skills": ["Java", "Python", "C++", "TypeScript", "JavaScript", "C#", "NextJS", "ASP.NET", "NodeJS", "MongoDB", "MySQL", "PostgreSQL", "Supabase", "Firebase", "Backend Development", "RESTful APIs", "Linux"], "soft_skills": ["Problem-Solving", "Team Collaboration", "Agile Methodologies"], "contact_number": "+63 9270183421", "work_experience": [{"title": "OJT, Software Development", "company": "Alliance Software Company", "end_date": "2025-08-31T00:00:00.000Z", "start_date": "2025-06-01T00:00:00.000Z"}], "educational_background": [{"degree": "Bachelor of Science in Computer Science", "end_date": "2026-05-01T00:00:00.000Z", "start_date": "2022-09-01T00:00:00.000Z", "institution": "Cebu Institute of Technology - University, Cebu, Philippines"}]}'),
	('ee822107-397f-44d6-b411-2cc0908be3fd', '2026-03-06 13:43:12.301833+00', '{"city": "Minglanilla, Cebu, Philippines", "name": "James Kenneth S. Acabal", "email": "jameskennethacabal@gmail.com", "projects": [{"name": "AI-Driven Recruitment System", "start_date": "2025-03-01T00:00:00.000Z", "description": "Developed a robust backend for an AI-driven recruitment system for our thesis using Next.js, MongoDB, and Firebase. Designed and implemented scalable APIs to support intelligent candidate matching, automated resume screening, and real-time data processing. Integrated MongoDB for efficient storage and retrieval of candidate profiles and job listings, while leveraging Firebase for secure authentication and real-time notifications. Optimized system performance and ensured data integrity, enabling seamless interaction between AI algorithms and user-facing applications."}, {"name": "IntelliForums", "start_date": "2024-12-01T00:00:00.000Z", "description": "Developed a dynamic forum web application using Django as the backend framework, enabling users to create, manage, and engage in threaded discussions. Implemented robust user authentication, post creation, and comment functionality, ensuring a secure and interactive user experience. Designed and optimized the database schema using Django ORM for efficient data management and scalability. Integrated responsive front-end templates with HTML, CSS, and JavaScript to deliver a seamless, user-friendly interface across devices. Leveraged Django’s built-in security features to protect against common vulnerabilities, ensuring a reliable and secure platform."}], "hard_skills": ["Java", "Python", "C++", "TypeScript", "JavaScript", "C#", "NextJS", "ASP.NET", "NodeJS", "MongoDB", "MySQL", "PostgreSQL", "Supabase", "Firebase", "Backend Development", "RESTful APIs", "Linux", "Django"], "soft_skills": ["Problem-Solving", "Team Collaboration", "Agile Methodologies"], "contact_number": "+63 9270183421", "work_experience": [{"title": "OJT, Software Development", "company": "Alliance Software Company", "end_date": "2025-08-01T00:00:00.000Z", "start_date": "2025-06-01T00:00:00.000Z"}], "educational_background": [{"degree": "Bachelor of Science in Computer Science", "end_date": "2026-05-01T00:00:00.000Z", "start_date": "2022-08-01T00:00:00.000Z", "institution": "Cebu Institute of Technology - University, Cebu, Philippines"}]}');


--
-- Data for Name: scored_candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."scored_candidates" ("id", "created_at", "score_data") VALUES
	('8c28c5f0-e5c3-4755-b3ec-7e8edf5a596e', '2026-03-06 13:46:51.840814+00', '{"reason": "The candidate, James Kenneth S. Acabal, presents a strong profile for a Web Developer role, evidenced by a comprehensive list of hard skills including popular frontend (JavaScript, TypeScript, NextJS) and backend technologies (NodeJS, ASP.NET, Python, Java, C#), alongside database expertise (MongoDB, MySQL, PostgreSQL, Firebase, Supabase). His educational background in Computer Science is relevant, and his project experience, particularly the ''AI-Driven Recruitment System'' utilizing Next.js, MongoDB, and Firebase for backend development and API implementation, directly aligns with modern web development practices. The ''ANI'' project further showcases backend API development with .NET and integration of external systems like weather tracking. His soft skills include Problem-Solving, Team Collaboration, and Agile Methodologies, which are crucial for collaborative development environments. The work experience as an OJT in Software Development, although brief, provides practical exposure. The alignment between his skills, projects, and the job requirements for a Web Developer is significant, indicating a high potential for success in this role.", "phrases": ["Strong technical skill set listed", "Relevant Computer Science degree", "Project experience aligns well", "Backend development proficiency shown", "Frontend skills also present", "Agile methodologies listed", "Good potential for success"], "job_fit_score": 71, "job_fit_stars": 3.6, "response_time": 3.71, "soft_skills_score": 59, "cultural_fit_score": 59, "predictive_success": 61, "transcription_score": 45, "skill_gaps_recommendations": "While the candidate has a robust backend and frontend skill set, formal experience in cloud deployment (AWS, Azure, GCP) and advanced CI/CD practices could be developed further. Continued learning in specific frontend frameworks like React or Vue.js beyond NextJS might also be beneficial for full-stack versatility.", "transcription_cultural_fit_score": 51}'),
	('c9ddf8df-7b19-4bac-9c36-7dd514a41098', '2026-03-06 13:47:23.01989+00', '{"reason": "The candidate, James Kenneth S. Acabal, presents a strong profile for a Web Developer role, evidenced by a Bachelor of Science in Computer Science and a robust set of hard skills including Java, Python, C++, TypeScript, JavaScript, C#, NextJS, NodeJS, and various databases like MongoDB and PostgreSQL. His project work, such as the ''AI-Driven Recruitment System'' utilizing Next.js, MongoDB, and Firebase, and ''IntelliForums'' built with Django, demonstrates practical application of his skills in backend development, RESTful APIs, and database management. The work experience as an OJT in Software Development further solidifies his practical exposure. His soft skills in Problem-Solving and Team Collaboration align well with development environments. The self-rated skills also show a high aptitude in core web development areas, particularly in Full-Stack Development, JavaScript, MongoDB, and CMS. The calculated Job Fit Score of 76 and Predictive Success Score of 64 suggest a good match for the role, with strong potential for success, particularly in backend and full-stack capacities. The educational background, project complexity, and breadth of technical skills are commendable.", "phrases": ["Strong BS in Computer Science", "Proficient in multiple programming languages", "Extensive database knowledge", "Practical project experience", "Good job fit score", "High potential for success", "Strong backend skills"], "job_fit_score": 76, "job_fit_stars": 3.8, "response_time": 3.18, "soft_skills_score": 63, "cultural_fit_score": 63, "predictive_success": 64, "transcription_score": 47, "skill_gaps_recommendations": "While strong in backend and full-stack, further development in frontend frameworks like React/Vue.js beyond self-rating 4 and specific cloud deployment/CI/CD practices (AWS, CI/CD rated 4 and 3 respectively) could enhance versatility.", "transcription_cultural_fit_score": 54}'),
	('994506e0-01de-4c4c-b898-4ab7160baa48', '2026-03-06 13:45:59.855198+00', '{"reason": "The candidate, GUADALUE NIÑA MARIE OBANDO, presents a strong profile for a Web Developer role, evidenced by her educational background in Computer Science and a wealth of hard skills including Web Development, WordPress, Elementor, Python, Django Framework, Full-Stack Development, UI/UX Design, and various programming languages and design tools. Her project experience, particularly the \"ArtHivee - Online Art Marketplace\" and the \"Full-stack online marketplace for artists,\" directly aligns with the requirements of a web development position, showcasing practical application of her skills in building responsive websites, implementing automation, and developing e-commerce functionalities. The work experience as a Web Developer & Automation Specialist further solidifies her practical expertise. Her soft skills like Leadership, Collaboration, and Problem Solving are also beneficial. The resume indicates a candidate who is not only technically proficient but also has practical experience in creating functional web applications and marketplaces, making her a promising fit for a web developer role.", "phrases": ["Strong web development skills", "Solid project experience", "Directly aligns with role", "Practical application of skills", "Technically proficient candidate", "Promising web developer fit"], "job_fit_score": 73, "job_fit_stars": 3.7, "response_time": 3.07, "soft_skills_score": 72, "cultural_fit_score": 63, "predictive_success": 62, "transcription_score": 39, "skill_gaps_recommendations": "While proficient in many areas, deepening expertise in specific modern frontend frameworks like React, Vue.js, or Angular beyond basic mention, and gaining more experience with CI/CD pipelines and advanced web security practices would be beneficial for continued growth.", "transcription_cultural_fit_score": 45}');


--
-- Data for Name: transcribed; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."transcribed" ("id", "created_at", "transcription") VALUES
	('e572f0bc-9cc3-4a31-9ef2-302b0c0e65e9', '2026-03-06 13:33:36.531+00', '{"transcription": " Hi, my name is Regente Lentino, you can call me John. I''m 24 years old. I have a three-year work experience with the BPO industry doing inbound and outbound calling. First I served as a technical consultant. We''re in my multi-tasking skills has been definitely enhanced. Then eventually I switched to customer service. We''re in our integrity place a very big role. Definitely sales must always be on point ahead of the target and at the same time making sure that each and every customer will always be satisfied with my assistance. And on top of all these skills I also have a talent with doing graphic designs, creating flyers, business cards and social media advertisements which will really be helpful for clients marketing needs. And I can assure you that I''m not just gonna be another number on your payroll but definitely a good addition to your company. Once again this is Regente Lentino thank you and goodbye.", "interview_insights": "The interview extract reveals a candidate, Regente Lentino, who is self-assured and eager to highlight his qualifications. His sentimental outlook is positive, focusing on his ability to meet targets and satisfy customers, indicating a proactive approach. Communication is direct and assertive, structured to showcase his diverse skill set, including technical support, customer service, sales acumen, and graphic design. Soft skills evident include multitasking, integrity, customer focus, and initiative, particularly in mentioning his design capabilities. He positions himself as a valuable addition, emphasizing his potential contribution beyond a mere employee role. Overall, the insights point to a motivated individual with a blend of customer-facing and creative skills.", "personality_traits": "Regente Lentino exhibits traits associated with conscientiousness due to his emphasis on integrity, sales targets, and customer satisfaction, suggesting a results-oriented and responsible approach. His mention of multitasking skills and switching roles implies adaptability and a degree of openness to new challenges. The proactive nature in highlighting graphic design skills alongside his BPO experience demonstrates initiative and a breadth of interests, potentially indicating openness and a creative inclination. His assurance of being a ''good addition'' suggests conscientiousness and a desire for positive impact. While direct indicators of extroversion or agreeableness are limited in this brief introduction, the confident delivery and focus on satisfying customers hint at some level of extroverted tendencies and agreeableness.", "sentimental_analysis": "The candidate, Regente Lentino (John), presents a predominantly positive and confident sentiment throughout the transcript. There''s a clear sense of self-assurance and optimism about his abilities and potential contributions to the company. He expresses enthusiasm when discussing his past roles and highlights achievements, such as enhanced multitasking skills and maintaining customer satisfaction. The tone is forward-looking and eager, suggesting a strong desire to be a valuable asset. The concluding statement, assuring he''ll be a ''good addition'' rather than ''just another number,'' reinforces this positive, proactive, and appreciative sentiment, indicating a desire for meaningful engagement and contribution.", "cultural_fit_insights": "Regente demonstrates alignment with Integrity and Accountability through his emphasis on ethics in customer service. His drive to be ''on point'' and satisfy customers suggests Quality and Excellence. His mention of diverse skills hints at Innovation. His goal-oriented language shows Efficiency.", "interview_insights_phrases": ["Self-assured and eager candidate", "Positive sentimental outlook", "Direct and assertive communication", "Highlights diverse skill set", "Proactive approach to contributions"], "personality_traits_phrases": ["Conscientiousness and responsibility focus", "Adaptability and openness to challenges", "Initiative and creative inclination", "Desire for positive impact", "Hints of extroversion and agreeableness"], "communication_style_insights": "Regente Lentino adopts an assertive and confident communication style, clearly articulating his name, background, and skills. He structures his self-introduction logically, moving from his experience to specific achievements and transferable skills like graphic design. His language is direct and purpose-driven, aiming to impress and convey his value proposition efficiently. Phrases like ''definitely enhanced,'' ''integrity place a very big role,'' and ''I can assure you'' highlight a decisive and self-assured manner. He employs persuasive language to emphasize his suitability for the role, aiming to stand out from other candidates. The overall style is professional, concise, and geared towards making a strong first impression, indicating a proactive and goal-oriented communicator.", "sentimental_analysis_phrases": ["Predominantly positive and confident sentiment", "Clear sense of self-assurance and optimism", "Enthusiasm about past roles and achievements", "Forward-looking and eager tone", "Appreciative of potential contribution"], "cultural_fit_insights_phrases": ["Integrity and accountability focus", "Quality and excellence drive", "Potential for innovation", "Efficiency in goal setting"], "communication_style_insights_phrases": ["Assertive and confident communication style", "Logical and purpose-driven structure", "Direct and persuasive language", "Professional and efficient delivery", "Goal-oriented approach to communication"]}'),
	('c3c1d91f-60e0-4651-8f70-7103f5b59b9a', '2026-03-06 13:38:13.679647+00', '{"transcription": " Hi, my name is Regente Lentino, you can call me John. I''m 24 years old. I have a three-year work experience with the BPO industry doing inbound and outbound calling. First I served as a technical consultant. We''re in my multi-tasking skills has been definitely enhanced. Then eventually I switched to customer service. We''re in our integrity place a very big role. Definitely sales must always be on point ahead of the target and at the same time making sure that each and every customer will always be satisfied with my assistance. And on top of all these skills I also have a talent with doing graphic designs, creating flyers, business cards and social media advertisements which will really be helpful for clients marketing needs. And I can assure you that I''m not just gonna be another number on your payroll but definitely a good addition to your company. Once again this is Regente Lentino thank you and goodbye.", "interview_insights": "Regente Lentino presents with a positive sentiment, showcasing confidence in their past achievements within the BPO industry, particularly highlighting multitasking and integrity. Their communication style is assertive and professional, articulating skills and experience directly. Key soft skills evident include a strong work ethic, customer focus, adaptability (transitioning roles), and initiative (mentioning graphic design skills). The candidate clearly aims to impress by emphasizing results (sales targets, customer satisfaction) and potential contribution to the company. They project a proactive attitude, seeking to be more than just an employee but a valuable asset. The overall impression is of a motivated and capable individual ready to take on new challenges.", "personality_traits": "Based on the transcript, Regente Lentino displays characteristics suggesting high conscientiousness, particularly evident in their emphasis on integrity, being ''on point'' with sales targets, and ensuring customer satisfaction. This indicates a strong sense of duty, responsibility, and a drive for achievement. Their mention of multitasking skills being enhanced in a technical consultant role and then transitioning to customer service where integrity is paramount suggests adaptability and a structured approach to learning and growth. The inclusion of graphic design talent points towards openness to experience and creativity. While extroversion isn''t explicitly demonstrated in this short segment, the confident and direct self-introduction implies a degree of assertiveness and comfort in self-presentation. Overall, they appear conscientious, adaptable, and open to new skills, with a goal-oriented mindset.", "sentimental_analysis": "The candidate, Regente Lentino, expresses a generally positive and enthusiastic sentiment throughout the brief introduction. There''s a clear sense of confidence and pride in their past experiences, particularly highlighting the enhancement of multitasking skills and the importance of integrity in their customer service role. The tone is upbeat and forward-looking, with a strong desire to be a valuable asset to the company. The mention of exceeding sales targets and ensuring customer satisfaction further contributes to a positive and driven emotional tone. The closing statement reinforces a proactive and committed attitude, suggesting a strong belief in their own capabilities and potential contribution.", "cultural_fit_insights": "Regente Lentino''s emphasis on integrity, customer satisfaction, and exceeding sales targets aligns well with Quality, Integrity, and Efficiency. Their adaptability suggests Agility. The addition of graphic design indicates Innovation.", "interview_insights_phrases": ["Positive sentiment and confidence", "Assertive and professional communication", "Strong work ethic and customer focus", "Adaptable and takes initiative", "Motivated and capable individual"], "personality_traits_phrases": ["High conscientiousness and responsibility", "Emphasis on integrity and duty", "Adaptable and structured learner", "Open to experience and creative", "Goal-oriented mindset"], "communication_style_insights": "Regente Lentino exhibits a clear and assertive communication style. The introduction is direct, beginning with a confident self-identification and a clear statement of their age and experience. They articulate their past roles and the skills acquired (multitasking, integrity, sales focus, customer satisfaction) in a structured and concise manner. The language used is professional and persuasive, aiming to make a strong case for their candidacy. The transition between different aspects of their experience is smooth, indicating good organization in thought and delivery. The closing statement, assuring they will be a ''good addition to your company,'' is a direct and confident call to action. While brief, the communication suggests a focused, professional, and goal-oriented approach, aiming to convey competence and value effectively.", "sentimental_analysis_phrases": ["Positive and enthusiastic tone", "Confident and proud", "Upbeat and forward-looking", "Driven emotional tone", "Proactive and committed attitude"], "cultural_fit_insights_phrases": ["Aligns with Quality and Integrity", "Demonstrates Efficiency focus", "Shows Agility and Innovation"], "communication_style_insights_phrases": ["Clear and assertive style", "Direct and confident introduction", "Structured and concise articulation", "Professional and persuasive language", "Focused and goal-oriented delivery"]}'),
	('f23c542e-d16f-4f7b-8ee2-9fec3dfc4c81', '2026-03-06 13:39:27.478393+00', '{"transcription": " Hi, my name is Regente Lentino, you can call me John. I''m 24 years old. I have a three-year work experience with the BPO industry doing inbound and outbound calling. First I served as a technical consultant. We''re in my multi-tasking skills has been definitely enhanced. Then eventually I switched to customer service. We''re in our integrity place a very big role. Definitely sales must always be on point ahead of the target and at the same time making sure that each and every customer will always be satisfied with my assistance. And on top of all these skills I also have a talent with doing graphic designs, creating flyers, business cards and social media advertisements which will really be helpful for clients marketing needs. And I can assure you that I''m not just gonna be another number on your payroll but definitely a good addition to your company. Once again this is Regente Lentino thank you and goodbye.", "interview_insights": "The candidate, Regente Lentino (John), presents with a highly positive sentiment, exuding confidence and a strong desire to contribute. His communication style is assertive, structured, and professional, effectively highlighting his three years of experience in the BPO industry, specifically in technical consulting and customer service roles. He emphasizes key soft skills such as multitasking, integrity, and a results-driven focus on sales targets and customer satisfaction. Notably, he also brings a complementary skill in graphic design, positioning it as a unique value proposition. The interview insights suggest a candidate who is not only capable in core BPO functions but also possesses creative flair and a proactive mindset, aiming to be a valuable addition rather than just an employee.", "personality_traits": "Based on the transcript, Regente Lentino (John) exhibits traits of conscientiousness, with a strong emphasis on integrity, meeting targets, and customer satisfaction, suggesting a diligent and responsible nature. His mention of multitasking and switching roles indicates adaptability, a component often linked with openness to experience. The stated talent in graphic design and proactive approach to being a \"good addition\" hints at creativity and a proactive, possibly innovative, mindset. While not explicitly detailed, the focus on customer interaction and sales targets might suggest a degree of extroversion, or at least comfort in communicative roles. The candidate''s structured presentation of experience and skills points towards good organizational abilities, another facet of conscientiousness. Overall, a blend of dependability, a willingness to learn and adapt, and a proactive attitude appears prominent.", "sentimental_analysis": "The candidate, Regente Lentino (John), conveys a positive and enthusiastic sentiment throughout the brief introduction. There''s a clear sense of confidence and eagerness to impress, highlighted by phrases like \"definitely enhanced,\" \"integrity place a very big role,\" and \"always be on point ahead of the target.\" The candidate emphasizes their commitment to customer satisfaction and sales targets, suggesting a results-oriented and diligent emotional state. The closing statement, \"I''m not just gonna be another number on your payroll but definitely a good addition to your company,\" strongly reinforces a proactive, positive, and self-assured emotional tone, indicating a desire to contribute meaningfully.", "cultural_fit_insights": "Regente shows strong alignment with Integrity and Accountability, and a drive for Excellence. His focus on customer satisfaction and hitting targets suggests a good fit for Efficiency and Productivity, with potential for Innovation. Collaboration is implied through his customer-facing roles.", "interview_insights_phrases": ["Positive and confident sentiment", "Assertive and structured communication", "Highlights multitasking and integrity", "Results-driven with graphic skills", "Proactive and valuable addition"], "personality_traits_phrases": ["High conscientiousness and integrity", "Adaptable and open to roles", "Creative and proactive mindset", "Comfortable in communicative roles"], "communication_style_insights": "Regente Lentino (John) demonstrates a clear, concise, and assertive communication style. He articulates his experience and skills in a structured manner, beginning with his name and role, then detailing his progression and accomplishments. His language is confident and direct, using phrases such as \"definitely enhanced\" and \"always be on point.\" There''s an effort to connect his skills to the company''s needs, particularly mentioning how his graphic design talent would be \"helpful for clients marketing needs.\" The closing statement is a strong call to action, positioning himself as a valuable asset. While the interaction is brief, the style leans towards being persuasive and professional, aiming to make a strong, positive impression without being overly aggressive. It’s a style that aims to be informative and convincing.", "sentimental_analysis_phrases": ["Positive and enthusiastic sentiment", "Confident and eager to impress", "Results-oriented and diligent", "Proactive and self-assured"], "cultural_fit_insights_phrases": ["Strong integrity and excellence", "Efficiency and productivity focus", "Potential for innovation", "Implied collaboration skills"], "communication_style_insights_phrases": ["Clear, concise, and assertive", "Structured and professional delivery", "Confident and direct language", "Persuasive and informative style"]}');


--
-- Data for Name: applicants; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."applicants" ("id", "joblisting_id", "first_name", "last_name", "resume_id", "street", "zip", "city", "state", "parsed_resume_id", "transcript_id", "transcribed_id", "status", "created_at", "email", "contact_number", "score_id", "scheduled_at", "platform") VALUES
	('0b29c11f-68b2-4af9-9642-e3717e342863', '269d0e91-de13-499e-afa0-be10dfe5b265', 'Kenneth James ', 'Acabal', 'resumes/a5f6532e-fa46-409a-b2d4-721b93b6d085_webdev_cv.pdf', '', '', '', '', NULL, 'transcripts/39e4941c-0da2-4262-92e6-2ad9ee6b0b0f_518495127_24465408136390049_8491526240793046687_n.mp4', NULL, 'Paper Screening', '2026-03-03 10:09:13.01971+00', 'jameskennethacabal@gmail.com', '1231231257178', NULL, NULL, NULL),
	('f413fb08-dd4a-4c19-b316-1ca5e89415f7', '269d0e91-de13-499e-afa0-be10dfe5b265', 'Jeremy', 'Lee', 'resumes/cf56a79b-5752-4040-a053-b091933a6334_webdev_cv.pdf', '', '', '', '', '551dacdd-d266-4c80-87c7-c370e8fe2d2e', 'transcripts/36458150-fd4d-4fe8-aaa8-d872ea170b3c_518495127_24465408136390049_8491526240793046687_n.mp4', 'c3c1d91f-60e0-4651-8f70-7103f5b59b9a', 'Exam', '2026-02-20 12:40:59.051637+00', 'jeremybrad6plus1@gmail.com', '927216232122', '8c28c5f0-e5c3-4755-b3ec-7e8edf5a596e', NULL, NULL),
	('c91bca4d-da5b-48ec-a4ca-98667a27c902', '269d0e91-de13-499e-afa0-be10dfe5b265', 'Todo', 'Roqi', 'resumes/9ac00e24-4203-43a9-b5fc-e091182e716c_obando_resume.pdf', '', '', '', '', 'dd523ff9-d538-4da4-9f58-9bf38ff378cc', 'transcripts/bb6908aa-6829-4bdb-9b21-b2e1599ae34c_518495127_24465408136390049_8491526240793046687_n.mp4', 'e572f0bc-9cc3-4a31-9ef2-302b0c0e65e9', 'Paper Screening', '2026-02-16 12:20:49.538046+00', 'roqitodo@gmail.com', '09270183421', '994506e0-01de-4c4c-b898-4ab7160baa48', NULL, NULL),
	('d9afde9c-a591-4c79-b9f7-f2fe57580c65', '269d0e91-de13-499e-afa0-be10dfe5b265', 'James Kenneth', 'Acabal', 'resumes/2d1700ff-8424-4737-8450-26ef635e6432_webdev_cv.pdf', '', '', '', '', 'ee822107-397f-44d6-b411-2cc0908be3fd', 'transcripts/348c11e7-8231-475f-82cd-c7ce2e248e75_518495127_24465408136390049_8491526240793046687_n.mp4', 'f23c542e-d16f-4f7b-8ee2-9fec3dfc4c81', 'HR Interview', '2026-02-26 13:08:32.532595+00', 'jameskennethacabal@gmail.com', '09270183421', 'c9ddf8df-7b19-4bac-9c36-7dd514a41098', '2026-02-09 01:00:00+00', 'Alliance Office');


--
-- Data for Name: admin_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."admin_feedback" ("id", "created_at", "applicant_id", "feedback", "admin_id") VALUES
	('8d80cfcf-df8a-474b-b784-46de96a5d428', '2026-02-20 17:39:41.3+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 'hello', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa');


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tags" ("id", "name") VALUES
	(1, 'Testicles'),
	(2, 'Web Developer'),
	(3, 'Software Developer'),
	(4, 'Frontend Developer'),
	(5, 'Backend Developer'),
	(6, 'Full-Stack Developer'),
	(7, 'HTML5'),
	(8, 'CSS3'),
	(9, 'JavaScript'),
	(10, 'React'),
	(11, 'Vue.js'),
	(12, 'Angular'),
	(13, 'Node.js'),
	(14, 'PHP'),
	(15, 'REST APIs'),
	(16, 'Git'),
	(17, 'MySQL'),
	(18, 'MongoDB'),
	(19, 'Webpack'),
	(20, 'Vite'),
	(21, 'npm'),
	(22, 'CMS'),
	(23, 'WordPress'),
	(24, 'Headless CMS'),
	(25, 'Responsive Web Design'),
	(26, 'Agile Development'),
	(27, 'Version Control'),
	(28, 'Web Performance Optimization'),
	(29, 'Web Security'),
	(30, 'AWS'),
	(31, 'CI/CD'),
	(32, 'SEO'),
	(33, 'Accessibility (WCAG)'),
	(34, 'UI/UX Collaboration');


--
-- Data for Name: applicant_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."applicant_skills" ("id", "created_at", "applicant_id", "tag_id", "rating") VALUES
	('96d79e30-9dda-45e2-9cfa-a2ac66ab93a0', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 2, 4),
	('bfc2f54a-2a81-49e2-8278-54985d63459d', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 3, 5),
	('febf7998-2e0f-453f-bf7b-57ee6fb37083', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 4, 3),
	('5ede1740-9b96-4d52-97b7-a9a9d82a18df', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 5, 4),
	('1d96c46b-3d13-4211-a5e6-4913d2f061cd', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 6, 5),
	('3b03b69b-c4bd-4f51-b4cf-4d3ccf9dd06f', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 7, 3),
	('162df579-957d-4366-8ba7-6539372132f5', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 8, 4),
	('2a28e7b1-9cd1-44ef-85d0-c2f64c7113e5', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 9, 5),
	('8e5fa494-7b29-4056-8aab-36acb189cf26', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 10, 4),
	('fa679d85-633e-41e4-8bce-1d72f7d219d6', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 11, 4),
	('0339ddc2-2328-4d49-948f-7133b798286b', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 12, 3),
	('f0ef9e2c-f656-49d0-aa4b-bf6b9718a37a', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 13, 4),
	('fd04b93a-2e91-4a55-816e-932372dbf2ed', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 14, 4),
	('c4152cb7-5f58-4dd1-ad8b-ea62a7c1d690', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 15, 3),
	('f2a486b1-31cb-4377-b617-6aa9ad461f11', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 16, 4),
	('5d0ca111-c077-40d1-977b-9ab9cfdb891b', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 17, 4),
	('05628235-e030-4e7b-a600-ea6d51630cc4', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 18, 5),
	('5d5d7e64-5996-4ccc-a741-c1cb5d074d74', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 19, 4),
	('c276213d-06dd-436f-bea8-55cfca265680', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 20, 3),
	('9b49437b-2efa-4787-8ea7-916dc2891b66', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 21, 4),
	('74fe30da-9d82-45ef-a9db-f64cda94fe60', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 22, 5),
	('4d903c7e-360c-4881-83f7-977c520bf55b', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 23, 4),
	('bb4bea9c-1d9f-4f10-ac55-10579e742076', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 24, 3),
	('e6c9da3f-1acf-4378-8158-91c2fbd907f1', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 25, 4),
	('0450b278-8dfe-4c7a-bba7-fbafa3b84422', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 26, 4),
	('702aadd3-aef9-455b-8f2f-33f66cdb76a8', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 27, 5),
	('ba0aa42d-d750-459d-bcd1-568e60ae2a2b', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 28, 5),
	('abf5c6bc-48ed-434a-9cdf-5fcd79f7ac27', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 29, 3),
	('7d14d950-9659-47da-8017-dfd1e183c3a4', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 30, 4),
	('356025a6-4ead-403e-85c4-44ff10c89c3c', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 31, 3),
	('5ec756f8-c946-46b7-80f0-f2bf45c75f14', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 32, 3),
	('d9cc3640-142c-4394-b205-e1c638aeb3a0', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 33, 4),
	('bce0e618-0cd0-4419-bf20-30bce3022620', '2026-02-26 13:08:34.122447+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 34, 4),
	('8ad93002-9fae-48c8-bb82-f528b0954456', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 2, 5),
	('9d301940-bd9b-4501-b1b1-d290e9d0a1cb', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 3, 4),
	('44e34346-7b24-4ca8-8a51-55b68087d02a', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 4, 5),
	('7424f51d-befc-476e-b301-535518ac1c13', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 5, 3),
	('55d83791-327c-4c06-a3fc-4e533ebe55c7', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 6, 5),
	('585b3ed4-1182-4bc2-b92e-2a80a980d60b', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 7, 5),
	('daae1ed4-0d09-424b-89e1-4f81ae20db5c', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 8, 4),
	('a95b45e2-29a6-4d21-8bde-c91226cf95d3', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 9, 4),
	('9033ebf7-423d-4921-8a94-5a35e7173638', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 10, 3),
	('058edc0b-0ed6-4c4d-9014-337832d2280c', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 11, 4),
	('f434b4ad-697b-4587-89da-1142c9f7d67c', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 12, 5),
	('d8942066-32d3-4648-a31e-8e31074dccc0', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 13, 5),
	('a972d1a9-45af-4ccf-b313-ef58449db2d7', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 14, 5),
	('50ea6cd3-c030-4717-a02a-aadca273fe51', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 15, 4),
	('5b99d498-6aa1-4692-b9d7-e093628f86aa', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 16, 3),
	('9c672cd7-4ea9-418f-9a4c-39137e27c4a8', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 17, 4),
	('1c00c9ec-57c8-428f-b6d0-80e26b744c0a', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 18, 5),
	('9241982c-6cf8-40d5-8f4b-d59f852ae53e', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 19, 3),
	('236a345a-6df1-4a8d-b574-a1ea319fff6a', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 20, 4),
	('934962e0-e81e-4aae-a617-3f12b886e1c8', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 21, 4),
	('fca7e498-6122-4556-8f0f-7b67c973292c', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 22, 4),
	('16e3ab0e-afa6-42a0-924f-840141930227', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 23, 5),
	('54ae3d60-fdee-4526-b305-e3a656c54944', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 24, 3),
	('c6c149dc-a500-47fd-ae74-14d940860728', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 25, 5),
	('55472d07-942c-486d-a130-d3347e5441e2', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 26, 5),
	('76cb24ca-bc60-495b-b44e-83b97ae272d4', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 27, 3),
	('97e04183-2f41-43fc-bef5-0d20f5731336', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 28, 4),
	('030a2785-dabc-4a8c-b46f-0205ce55bd94', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 29, 5),
	('75278cc2-d126-484d-ac69-9c714adbf13e', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 30, 4),
	('caeb41d0-8425-4709-8287-68c4609da82b', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 31, 3),
	('a246b66d-1f3f-40f7-b701-9f14bba1323a', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 32, 3),
	('3a3096da-3ccc-4bf2-9894-cf3e40e9e5fd', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 33, 5),
	('98a74f84-c06e-4f80-a639-77f4d7149691', '2026-02-16 12:20:49.987301+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', 34, 4),
	('b3a58461-e66b-45de-b346-603f9807f7af', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 2, 4),
	('5a520827-6028-4839-aeac-96143c5887b9', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 3, 4),
	('5a272158-ac6d-41f1-b65c-b03da8a3fe76', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 4, 4),
	('9e1e304f-3f8a-4b37-acb6-895cf50098d9', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 5, 4),
	('137e6909-97ff-41f8-ba61-c082fe28b55c', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 6, 4),
	('bff6cd5b-e26e-487d-bc44-63a6224c24dd', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 7, 3),
	('87ecc268-07ae-41f6-9e3e-6d480dc886f4', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 8, 3),
	('64efed3d-36b3-480e-b0c0-87eaa0f271ac', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 9, 3),
	('e6da2e5b-0962-4989-bb76-c2c24f206ebf', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 10, 3),
	('ef2f17a7-68ba-4510-a654-e6462b1d1a1e', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 11, 4),
	('d8d72a5b-dd11-4800-941f-de8e16191e88', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 12, 5),
	('96b3dc59-528c-4e0c-bd64-a5d0ea8b4705', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 13, 4),
	('5a9a7fc4-f911-4fd4-a962-76a751372e72', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 14, 3),
	('64e1c2ae-6ac4-469d-b1f6-97aedcc6baed', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 15, 5),
	('84d6e459-9d34-495a-8227-5f415ed5ae4b', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 16, 4),
	('d6af9808-e739-49c6-bf05-4243e0e66cad', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 17, 3),
	('a1b152ce-cae7-413f-b4d2-64a7bc128e8c', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 18, 4),
	('dde4220c-f239-4b73-82fe-1138f39b4a02', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 19, 3),
	('98fc0684-28c8-47f6-85ce-f005de9d19e7', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 20, 3),
	('e4f61f20-9576-4afd-b90b-1f64d2332b55', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 21, 4),
	('b4d02ced-c002-4834-ae02-d6e1294c606f', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 22, 4),
	('b25a3456-b1b3-41ac-8bda-9ba1d7a6b373', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 23, 3),
	('65d3f4ba-7da2-47d2-a539-a1d677c83683', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 24, 4),
	('2c99d880-573f-4f09-9ee5-3696ff9d045e', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 25, 3),
	('b4cffefe-6856-4354-a88c-850404b7b329', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 26, 5),
	('ca339d53-9f23-4112-accd-f4acba67b303', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 27, 4),
	('a2f53c05-c2ca-4ca0-b827-ef65c1967ec9', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 28, 3),
	('22b0f73e-1a5c-40c2-a53c-98073eef6ed3', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 29, 3),
	('38afea97-8470-4d8a-ab2f-eba9c93ef328', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 30, 5),
	('c3b33f87-9421-43c7-8c92-086869f184dc', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 31, 4),
	('5181ec15-e3a4-4e49-b43a-2f447826ac5c', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 32, 3),
	('7df6ba9b-13f9-4d53-a0aa-3f62c704493d', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 33, 3),
	('a446b90e-d3d3-40eb-b29c-560678bfbe6e', '2026-02-20 12:40:59.379059+00', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', 34, 4),
	('5dd295c4-b4f5-438d-b4d7-c3ed6863ac7e', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 2, 4),
	('2607ebb1-0162-420f-a0f3-5fdbaaf0bb5f', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 3, 4),
	('b775f108-284b-4224-8aeb-f2cfcbbb810f', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 4, 5),
	('888a49ee-180d-4e8c-883a-69dd2e1b1628', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 5, 5),
	('c10a6130-71b6-465c-ac7d-4717f368ada5', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 6, 5),
	('68dd763b-40c8-453d-83fe-2cb8403c3c73', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 7, 3),
	('04f55ae9-28c6-4060-b66b-8b1c86cd591e', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 8, 4),
	('19586d74-bd9a-469c-baba-05b15a662920', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 9, 5),
	('1df205c7-9029-4727-b09d-7172f0346c57', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 10, 4),
	('b9c14698-57e8-4984-bdb1-2e91a8211551', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 11, 4),
	('f4c5ce85-0f2f-41c8-9984-c3308c0d2c3f', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 12, 5),
	('6408123b-a8d7-4b37-a8b9-2b59392c6e34', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 13, 4),
	('aeb89ff2-781a-4b3b-8c9f-a9d40acb933d', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 14, 3),
	('16c54262-1efb-44fc-9066-9c6a40033edf', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 15, 3),
	('b5e2808f-4ca5-4d0a-9731-cbdfba73dafb', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 16, 4),
	('862edfdb-772a-4d0f-bf17-bbdafd546ca6', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 17, 4),
	('8cdbbfba-6266-43b7-b62f-b757581ca594', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 18, 5),
	('31658222-55b3-43ce-89cb-06b15045c45e', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 19, 4),
	('a090bddc-0ba1-4ea1-985c-04a8fddb5b79', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 20, 4),
	('6a08b8f0-1fc2-486b-bee1-473f6772712c', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 21, 5),
	('4363d006-33a5-4f48-898a-07f2d899a84f', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 22, 5),
	('fce6aef7-9dad-44ec-9af6-eb8ad587c3b5', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 23, 5),
	('654a2d1b-0d0e-4c1d-8bce-bda56b08e570', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 24, 4),
	('13c176e0-b91a-47b0-a9ff-0d4c6a72c3a7', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 25, 4),
	('9f5fc360-cc93-4599-89c3-dd552c17d5ea', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 26, 5),
	('5eae3fdf-dda9-4715-980e-987b91b5f21e', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 27, 3),
	('9cea4d41-1412-46bc-a0f7-71555ee0bb5c', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 28, 4),
	('9778d55e-1c68-4d04-92a2-0055da3cd114', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 29, 4),
	('0ff67e55-7481-4058-867a-7d3940c90e12', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 30, 3),
	('9f16c79d-2439-487e-a9d5-40ac8141f075', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 31, 4),
	('6b4f1c35-0345-498f-a87e-574bf53e3a5a', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 32, 5),
	('7d8eef13-a7a3-46a7-acd7-428f70f53a47', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 33, 5),
	('7ca6db70-e7e5-4933-9449-563bbc7a858f', '2026-03-03 10:09:13.528222+00', '0b29c11f-68b2-4af9-9642-e3717e342863', 34, 5);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."audit_logs" ("id", "created_at", "actor_type", "actor_id", "action", "event_type", "entity_type", "entity_id", "changes", "details") VALUES
	('446e8294-6185-4c27-8aaa-dc99c68d7c2a', '2026-01-07 20:44:10.325933+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Created joblisting', 'Job Listing', 'c52e6bfe-7d9a-40f2-ba18-43a2e346aaeb', '{}', 'Job listing with ID c52e6bfe-7d9a-40f2-ba18-43a2e346aaeb was created.'),
	('6236167d-f6fb-4259-a3c0-d20f60a64f94', '2026-01-11 16:08:27.709497+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'delete', 'Joblisting deleted', 'Job Listing', 'c52e6bfe-7d9a-40f2-ba18-43a2e346aaeb', '{}', 'Job listing with ID c52e6bfe-7d9a-40f2-ba18-43a2e346aaeb was deleted.'),
	('08bbdf56-e4c9-4fb3-92a3-8592ff7be20a', '2026-01-11 16:18:58.404399+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Created joblisting', 'Job Listing', '269d0e91-de13-499e-afa0-be10dfe5b265', '{}', 'Job listing with ID 269d0e91-de13-499e-afa0-be10dfe5b265 was created.'),
	('edb2de1b-0937-4f90-b639-c12786393748', '2026-02-16 12:20:50.35681+00', 'Applicant', NULL, 'create', 'Applied for job', 'Applicant', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', '{}', 'Applicant with ID c91bca4d-da5b-48ec-a4ca-98667a27c902 applied for job listing with ID 269d0e91-de13-499e-afa0-be10dfe5b265.'),
	('dac90757-eef4-4e11-9c7e-2dd7e10a59b3', '2026-02-16 18:03:19.202579+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'update', 'Changed candidate status', 'Applicant', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', '{"status": {"after": "HR Interview", "before": "Paper Screening"}}', 'Changed status to "HR Interview" for applicant ID c91bca4d-da5b-48ec-a4ca-98667a27c902'),
	('6d37284f-6cb7-4f23-b14c-6999a18920db', '2026-02-16 18:06:26.702351+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'update', 'Changed candidate status', 'Applicant', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', '{"status": {"after": "Paper Screening", "before": "HR Interview"}}', 'Changed status to "Paper Screening" for applicant ID c91bca4d-da5b-48ec-a4ca-98667a27c902'),
	('1d97b6b5-d5f8-45db-9c9f-13f7e0bf6324', '2026-02-20 10:06:08.7746+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Created Staff Evaluation', 'Staff Evaluation', '4ab3a858-0cce-4770-8568-71f2c00cf98b', '{}', 'HR Report created with score 2'),
	('0dfea20a-f4d1-411f-855e-43397faf605e', '2026-02-20 10:32:17.239752+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'update', 'Updated Staff Evaluation', 'Staff Evaluation', '4ab3a858-0cce-4770-8568-71f2c00cf98b', '{}', 'HR Report with ID 4ab3a858-0cce-4770-8568-71f2c00cf98b updated'),
	('735b819c-30b2-4a58-8aa7-5e0b9a8f2487', '2026-02-20 10:34:27.580261+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'delete', 'Deleted Staff Evaluation', 'Staff Evaluation', '4ab3a858-0cce-4770-8568-71f2c00cf98b', '{}', 'HR Report with ID 4ab3a858-0cce-4770-8568-71f2c00cf98b deleted'),
	('146e8c81-b9dd-4027-b347-5e93ad93f3c0', '2026-02-20 12:40:59.670165+00', 'Applicant', NULL, 'create', 'Applied for job', 'Applicant', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', '{}', 'Applicant with ID f413fb08-dd4a-4c19-b316-1ca5e89415f7 applied for job listing with ID 269d0e91-de13-499e-afa0-be10dfe5b265.'),
	('c9666880-ce94-4f03-9e98-a70bcc24a05e', '2026-02-20 15:05:26.113468+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Created Staff Evaluation', 'Staff Evaluation', 'edb1f57a-bb1b-4d81-9926-53f784a18158', '{}', 'HR Report created with score 1'),
	('dd41fca7-a04d-46d9-9560-bc79a6a2571e', '2026-02-20 15:23:40.828979+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Created Staff Evaluation', 'Staff Evaluation', '5ae0fd18-dbf7-45ff-afa4-d64cfc472d9e', '{}', 'HR Report created with score 4'),
	('77cf20a4-fa0d-478f-94bf-e7004bfca41f', '2026-02-20 15:25:12.288742+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Created Staff Evaluation', 'Staff Evaluation', '2cfb1d25-e60b-45bf-b14d-6db679f71acb', '{}', 'HR Report created with score 4'),
	('cc65c0b9-c6ea-4be0-8213-5fe0021dd0bd', '2026-02-20 17:01:02.351066+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Created Staff Evaluation', 'Staff Evaluation', '60b9057c-aadc-468b-abd9-df852b5dd5ae', '{}', 'HR Report created with score 3'),
	('ac9bdf0a-5549-4b68-8a34-1ec20113988f', '2026-02-20 17:04:43.293634+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'delete', 'Deleted Staff Evaluation', 'Staff Evaluation', 'edb1f57a-bb1b-4d81-9926-53f784a18158', '{}', 'HR Report with ID edb1f57a-bb1b-4d81-9926-53f784a18158 deleted'),
	('cd5b24a1-4d6f-43ed-8d94-9f27f8f90774', '2026-02-20 17:04:47.472172+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'delete', 'Deleted Staff Evaluation', 'Staff Evaluation', '5ae0fd18-dbf7-45ff-afa4-d64cfc472d9e', '{}', 'HR Report with ID 5ae0fd18-dbf7-45ff-afa4-d64cfc472d9e deleted'),
	('033ab6d7-f04c-4408-843c-fc19b9957f7e', '2026-02-20 17:04:54.379464+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'delete', 'Deleted Staff Evaluation', 'Staff Evaluation', '2cfb1d25-e60b-45bf-b14d-6db679f71acb', '{}', 'HR Report with ID 2cfb1d25-e60b-45bf-b14d-6db679f71acb deleted'),
	('1a9fa881-f91a-434b-a4c1-1c2711aac87d', '2026-02-20 17:04:58.018644+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'delete', 'Deleted Staff Evaluation', 'Staff Evaluation', '60b9057c-aadc-468b-abd9-df852b5dd5ae', '{}', 'HR Report with ID 60b9057c-aadc-468b-abd9-df852b5dd5ae deleted'),
	('d59a28bb-fef9-4eb2-a8e2-6db8dbc761d4', '2026-02-20 17:09:29.274831+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Created Staff Evaluation', 'Staff Evaluation', 'c6bd7296-1116-44dd-9d6e-b62e2f98ad49', '{}', 'HR Report created with score 4'),
	('0f78f267-ad63-4170-ae5d-b8f8131c682d', '2026-02-20 17:09:40.307551+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'update', 'Updated Staff Evaluation', 'Staff Evaluation', 'c6bd7296-1116-44dd-9d6e-b62e2f98ad49', '{"score": {"after": "5", "before": "4"}}', 'HR Report with ID c6bd7296-1116-44dd-9d6e-b62e2f98ad49 updated'),
	('68aaf5fe-841b-4dda-9aa6-5e78e0b8f70a', '2026-02-20 17:09:51.104133+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'update', 'Updated Staff Evaluation', 'Staff Evaluation', 'c6bd7296-1116-44dd-9d6e-b62e2f98ad49', '{"score": {"after": "4.2", "before": "5"}}', 'HR Report with ID c6bd7296-1116-44dd-9d6e-b62e2f98ad49 updated'),
	('5460789e-3ed3-4e30-a4ac-84b08819bcd8', '2026-02-20 17:12:16.92868+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'delete', 'Deleted Staff Evaluation', 'Staff Evaluation', 'c6bd7296-1116-44dd-9d6e-b62e2f98ad49', '{}', 'HR Report with ID c6bd7296-1116-44dd-9d6e-b62e2f98ad49 deleted'),
	('90fb96cc-9323-4980-9262-9940c981f236', '2026-02-20 17:39:41.963855+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Admin feedback created', 'Admin Feedback', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', '{}', 'Created admin feedback for candidate ID c91bca4d-da5b-48ec-a4ca-98667a27c902'),
	('300456c3-6403-441e-ac56-702605d833f1', '2026-02-23 15:33:08.811143+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Created Staff Evaluation', 'Staff Evaluation', 'ed1549f8-243f-4687-82b6-eab0259174c5', '{}', 'HR Report created with score 5'),
	('9702616b-feba-4f1b-9802-f0fa751e64e8', '2026-02-24 02:58:28.888729+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'update', 'Changed candidate status', 'Applicant', 'f413fb08-dd4a-4c19-b316-1ca5e89415f7', '{"status": {"after": "Exam", "before": "Paper Screening"}}', 'Changed status to "Exam" for applicant ID f413fb08-dd4a-4c19-b316-1ca5e89415f7'),
	('ee9fb6c2-e707-4cd0-9872-d933525541e9', '2026-02-24 10:45:50.128605+00', 'Applicant', NULL, 'create', 'Applied for job', 'Applicant', '0b50b822-da8e-453f-9d71-fcf05d7137e6', '{}', 'Applicant with ID 0b50b822-da8e-453f-9d71-fcf05d7137e6 applied for job listing with ID 269d0e91-de13-499e-afa0-be10dfe5b265.'),
	('57dd3e98-1d59-47bd-aa11-5151654c61a8', '2026-02-24 13:07:00.861971+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'update', 'Changed user role', 'Staff', 'db175e55-c824-48b4-afb8-e2df0c11e4ef', '{"role": {"after": "Admin", "before": "HR Officer"}}', 'Changed role of staff Jeremy Lee (ID: db175e55-c824-48b4-afb8-e2df0c11e4ef) from HR Officer to Admin.'),
	('e667d466-bcbe-45c9-b4f7-bd3d0ecebeff', '2026-02-24 13:11:38.243274+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Created staff account', 'Staff', 'c582e084-6ff6-4037-bd11-9080ebf24c5e', '{}', 'Staff member Guadalue Obando created with role HR Officer'),
	('6ba6e7ed-2a2c-4fd3-bc05-8811fa5eda4f', '2026-02-25 17:41:29.501047+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'update', 'Joblisting modified', 'Job Listing', '269d0e91-de13-499e-afa0-be10dfe5b265', '{"officer_id": {"after": "c582e084-6ff6-4037-bd11-9080ebf24c5e", "before": "null"}}', 'Job listing with ID 269d0e91-de13-499e-afa0-be10dfe5b265 was updated.'),
	('46bc7dd2-9373-4e7f-82dc-4ba4bdb3e6b4', '2026-02-26 05:02:19.115644+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Created Staff Evaluation', 'Staff Evaluation', 'dc05f82d-162f-455c-bfb6-9e762ff6b0da', '{}', 'HR Report created with score 5'),
	('64dd2e0f-d131-4465-bb1d-68e898d082f9', '2026-02-26 05:02:33.293852+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'delete', 'Deleted Staff Evaluation', 'Staff Evaluation', 'dc05f82d-162f-455c-bfb6-9e762ff6b0da', '{}', 'HR Report with ID dc05f82d-162f-455c-bfb6-9e762ff6b0da deleted'),
	('e0e2ac00-127c-4f9e-a888-6c0fb687c220', '2026-02-26 13:08:34.611665+00', 'Applicant', NULL, 'create', 'Applied for job', 'Applicant', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', '{}', 'Applicant with ID d9afde9c-a591-4c79-b9f7-f2fe57580c65 applied for job listing with ID 269d0e91-de13-499e-afa0-be10dfe5b265.'),
	('9bc25237-646a-4771-80f2-f57623d11397', '2026-02-26 15:37:47.135549+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'update', 'Joblisting modified', 'Job Listing', '269d0e91-de13-499e-afa0-be10dfe5b265', '{"officer_id": {"after": "c582e084-6ff6-4037-bd11-9080ebf24c5e", "before": "null"}}', 'Job listing with ID 269d0e91-de13-499e-afa0-be10dfe5b265 was updated.'),
	('6b6b6ce5-64a0-4ecd-a2b6-eb4482c63f88', '2026-02-26 18:00:21.092758+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'update', 'Joblisting modified', 'Job Listing', '269d0e91-de13-499e-afa0-be10dfe5b265', '{"officer_id": {"after": "c582e084-6ff6-4037-bd11-9080ebf24c5e", "before": "null"}}', 'Job listing with ID 269d0e91-de13-499e-afa0-be10dfe5b265 was updated.'),
	('3261f563-36fa-41b6-9487-44a0db08ecd3', '2026-02-26 18:50:40.295036+00', 'Staff', 'c582e084-6ff6-4037-bd11-9080ebf24c5e', 'update', 'Changed candidate status', 'Applicant', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', '{"status": {"after": "Exam", "before": "Paper Screening"}}', 'Changed status to "Exam" for applicant ID d9afde9c-a591-4c79-b9f7-f2fe57580c65'),
	('743dafb2-bb38-4ea9-b077-729c14b5607e', '2026-02-26 19:11:39.749034+00', 'Staff', 'c582e084-6ff6-4037-bd11-9080ebf24c5e', 'update', 'Changed candidate status', 'Applicant', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', '{"status": {"after": "HR Interview", "before": "Exam"}}', 'Changed status to "HR Interview" for applicant ID d9afde9c-a591-4c79-b9f7-f2fe57580c65'),
	('c64dd60a-f0ef-4fab-8862-c86d594a29b7', '2026-02-26 19:24:51.67595+00', 'Staff', 'c582e084-6ff6-4037-bd11-9080ebf24c5e', 'update', 'Changed candidate status', 'Applicant', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', '{"status": {"after": "Technical Interview", "before": "HR Interview"}}', 'Changed status to "Technical Interview" for applicant ID d9afde9c-a591-4c79-b9f7-f2fe57580c65'),
	('c16ce876-799d-48c3-8674-6a40a1bb6381', '2026-02-26 19:30:11.668886+00', 'Staff', 'c582e084-6ff6-4037-bd11-9080ebf24c5e', 'update', 'Changed candidate status', 'Applicant', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', '{"status": {"after": "HR Interview", "before": "Technical Interview"}}', 'Changed status to "HR Interview" for applicant ID d9afde9c-a591-4c79-b9f7-f2fe57580c65'),
	('29b8e01b-9dc7-457d-a620-69e6aaeb4b55', '2026-02-27 05:30:31.637915+00', 'SuperAdmin', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 'create', 'Created Staff Evaluation', 'Staff Evaluation', '57f3e20e-f8b0-43d7-bf4b-8470a28d53d3', '{}', 'HR Report created with score 4'),
	('2913c7b0-698b-4169-b97b-bd2e1a49c12b', '2026-03-02 14:22:06.968282+00', 'Applicant', NULL, 'create', 'Applied for job', 'Applicant', 'ed8673a6-b247-4e22-bd64-b3a37b7aa240', '{}', 'Applicant with ID ed8673a6-b247-4e22-bd64-b3a37b7aa240 applied for job listing with ID 269d0e91-de13-499e-afa0-be10dfe5b265.'),
	('93ac5c2e-80e3-4905-9fc3-838d99e4b6b0', '2026-03-02 14:39:07.623256+00', 'Applicant', NULL, 'create', 'Applied for job', 'Applicant', '30e73d44-db52-4d86-bb73-0bed85f29495', '{}', 'Applicant with ID 30e73d44-db52-4d86-bb73-0bed85f29495 applied for job listing with ID 269d0e91-de13-499e-afa0-be10dfe5b265.'),
	('a68ae5e1-09ee-4d2a-b2a7-f66cc9d5ebf9', '2026-03-02 16:41:04.055884+00', 'Staff', 'c582e084-6ff6-4037-bd11-9080ebf24c5e', 'create', 'Created Staff Evaluation', 'Staff Evaluation', 'a50a50cc-f271-4e87-aed9-802a1b90a3bd', '{}', 'HR Report created with score 4'),
	('c00fb4b3-f086-4d8d-bb42-d3be62cc5c3a', '2026-03-02 16:41:54.264181+00', 'Staff', 'c582e084-6ff6-4037-bd11-9080ebf24c5e', 'create', 'Created Staff Evaluation', 'Staff Evaluation', '764d1feb-3398-445f-8fef-74c1f29c3764', '{}', 'HR Report created with score 5'),
	('0945ff5b-ebcb-4434-82bf-106b76c952af', '2026-03-02 16:44:09.300918+00', 'Staff', 'c582e084-6ff6-4037-bd11-9080ebf24c5e', 'delete', 'Deleted Staff Evaluation', 'Staff Evaluation', 'a50a50cc-f271-4e87-aed9-802a1b90a3bd', '{}', 'HR Report with ID a50a50cc-f271-4e87-aed9-802a1b90a3bd deleted'),
	('db81e20b-8bf6-4cf8-a96b-4fb9c61f2d92', '2026-03-02 16:45:07.966505+00', 'Staff', 'c582e084-6ff6-4037-bd11-9080ebf24c5e', 'delete', 'Deleted Staff Evaluation', 'Staff Evaluation', '764d1feb-3398-445f-8fef-74c1f29c3764', '{}', 'HR Report with ID 764d1feb-3398-445f-8fef-74c1f29c3764 deleted'),
	('686b5616-d984-49a7-b6d0-e26a2d11b989', '2026-03-02 17:09:00.176907+00', 'Staff', 'c582e084-6ff6-4037-bd11-9080ebf24c5e', 'create', 'Created Staff Evaluation', 'Staff Evaluation', 'f1bd6187-877d-4b21-a84d-dba453e1beb5', '{}', 'HR Report created with score 5'),
	('73a990c7-348f-4019-a35c-923f40aaf18e', '2026-03-03 09:51:21.723272+00', 'Applicant', NULL, 'create', 'Applied for job', 'Applicant', 'c3bfb85e-a5b4-4af9-9a64-5cdafc55ac12', '{}', 'Applicant with ID c3bfb85e-a5b4-4af9-9a64-5cdafc55ac12 applied for job listing with ID 269d0e91-de13-499e-afa0-be10dfe5b265.'),
	('867eb5eb-1d65-41ae-985f-4a258abe00f9', '2026-03-03 10:09:13.851188+00', 'Applicant', NULL, 'create', 'Applied for job', 'Applicant', '0b29c11f-68b2-4af9-9642-e3717e342863', '{}', 'Applicant with ID 0b29c11f-68b2-4af9-9642-e3717e342863 applied for job listing with ID 269d0e91-de13-499e-afa0-be10dfe5b265.');


--
-- Data for Name: conversation_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."conversation_messages" ("id", "conversation_id", "message", "created_at", "role") VALUES
	('d2428c07-c64b-41f5-bcb8-076f999f5c72', 'a296b3a4-5934-4672-a94f-2ce15398c0a4', '👋 Hi! I’m your AI assistant. Ask me about jobs, applications, or your profile.', '2026-02-17 10:12:33.584652+00', 'assistant'),
	('fa6f0081-a565-45f4-b33a-dd7bd00e191c', 'cefc8b56-64af-4c0d-abd9-879310e7f92a', '👋 Hi! I’m your AI assistant. Ask me about jobs, applications, or your profile.', '2026-02-25 15:54:59.530667+00', 'assistant'),
	('b4486823-6b80-468a-ab2d-1edfcc2a593c', '0c6bdb67-6e01-4269-bd3b-1ee0c9fb787c', '👋 Hi! I’m your AI assistant. Ask me about jobs, applications, or your profile.', '2026-02-26 12:37:48.987737+00', 'assistant'),
	('01d16dcc-73fe-4a73-a761-34e2c294f16a', 'ae63473a-eb01-4ebf-824c-23aefad6ea7a', '👋 Hi! I’m your AI assistant. Ask me about jobs, applications, or your profile.', '2026-02-26 12:41:54.375998+00', 'assistant'),
	('64856dd7-e9c9-4661-a624-6dc7a8aa47c5', 'ed2ef84b-3533-4728-8c95-02db8e662e86', '👋 Hi! I’m your AI assistant. Ask me about jobs, applications, or your profile.', '2026-02-26 12:43:05.153103+00', 'assistant'),
	('4fdcc465-434c-4f84-b0fa-16fb13c4c063', 'ed2ef84b-3533-4728-8c95-02db8e662e86', 'Hello, today I feel great', '2026-02-26 12:43:58.942981+00', 'user'),
	('314e8f71-68d6-4950-8ba8-d717423e2853', 'ed2ef84b-3533-4728-8c95-02db8e662e86', 'That''s wonderful to hear! It''s always great when you''re feeling good. I hope that positive energy carries you through the rest of your day. Is there anything I can assist you with today, or perhaps any questions you have about jobs or your profile?', '2026-02-26 12:43:59.287037+00', 'assistant');


--
-- Data for Name: hr_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."hr_reports" ("id", "created_at", "applicant_id", "staff_id", "score", "summary", "candidate_status") VALUES
	('ed1549f8-243f-4687-82b6-eab0259174c5', '2026-02-23 15:33:07.824025+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 5, 'LGTM! 👍', 'Paper Screening'),
	('57f3e20e-f8b0-43d7-bf4b-8470a28d53d3', '2026-02-27 05:30:29.778694+00', 'c91bca4d-da5b-48ec-a4ca-98667a27c902', '3dd1ce32-19d2-455c-a12d-d2452bf95cfa', 4, 'I like this candidate', 'Paper Screening'),
	('f1bd6187-877d-4b21-a84d-dba453e1beb5', '2026-03-02 17:08:59.434526+00', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65', 'c582e084-6ff6-4037-bd11-9080ebf24c5e', 5, 'good', 'Paper Screening');


--
-- Data for Name: jl_qualifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."jl_qualifications" ("qualification", "id", "joblisting_id") VALUES
	('2+ years of professional experience in web development (agency or in-house)', 'c3b48131-d072-4393-8b81-53a2f041ff5b', '269d0e91-de13-499e-afa0-be10dfe5b265'),
	('Experience working in agile or collaborative development environments', 'd314ba50-8a4a-4c5a-ae4a-637f01e45e1f', '269d0e91-de13-499e-afa0-be10dfe5b265'),
	('Strong portfolio demonstrating responsive, user-centered web applications', '4dde3d0e-d762-430e-af5b-e92f50a92a8f', '269d0e91-de13-499e-afa0-be10dfe5b265'),
	('Familiarity with version control systems such as Git', '777d8407-44ab-45ab-861e-804ca43a92f3', '269d0e91-de13-499e-afa0-be10dfe5b265'),
	('Bachelor’s degree in Computer Science, Information Technology, Web Development, or a related field (or equivalent practical experience)', '74ae56db-ea15-4f3d-b4e9-a26117746693', '269d0e91-de13-499e-afa0-be10dfe5b265');


--
-- Data for Name: jl_requirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."jl_requirements" ("requirement", "id", "joblisting_id") VALUES
	('Experience with modern JavaScript frameworks/libraries (e.g., React, Vue, Angular)', 'ca5307af-1ab5-4cbd-8857-27890a70e615', '269d0e91-de13-499e-afa0-be10dfe5b265'),
	('Familiarity with CMS platforms (e.g., WordPress, headless CMS)', '8f16d674-49d9-4a56-a1da-4a9bf5b18ba7', '269d0e91-de13-499e-afa0-be10dfe5b265'),
	('Proficiency in HTML5, CSS3, and JavaScript (ES6+)', '318c3dbe-8d79-4c57-a8e7-65feae16c4f6', '269d0e91-de13-499e-afa0-be10dfe5b265'),
	('Strong understanding of responsive design, cross-browser compatibility, and web standards', '532fa0e7-7f45-4549-abd5-88f0da687dc5', '269d0e91-de13-499e-afa0-be10dfe5b265'),
	('Knowledge of RESTful APIs and third-party integrations', 'c748637a-d0a1-4860-a2e1-802dcf1adc9e', '269d0e91-de13-499e-afa0-be10dfe5b265'),
	('Experience with databases (MySQL, PostgreSQL, MongoDB, or similar)', 'd5a20537-b531-4400-9e28-48c31692bcca', '269d0e91-de13-499e-afa0-be10dfe5b265'),
	('Experience with backend technologies (e.g., Node.js, PHP, Python, or similar)', 'bc8209da-8a48-46b6-802f-ca394aaafb91', '269d0e91-de13-499e-afa0-be10dfe5b265');


--
-- Data for Name: job_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."job_tags" ("joblisting_id", "tag_id") VALUES
	('269d0e91-de13-499e-afa0-be10dfe5b265', 2),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 3),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 4),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 5),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 6),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 7),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 8),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 9),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 10),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 11),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 12),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 13),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 14),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 15),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 16),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 17),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 18),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 19),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 20),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 21),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 22),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 23),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 24),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 25),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 26),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 27),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 28),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 29),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 30),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 31),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 32),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 33),
	('269d0e91-de13-499e-afa0-be10dfe5b265', 34);


--
-- Data for Name: key_highlights; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."key_highlights" ("id", "created_at", "report_id", "highlight") VALUES
	('99144a7a-1df6-4f42-8b59-26d9998c3e59', '2026-02-23 15:33:08.460732+00', 'ed1549f8-243f-4687-82b6-eab0259174c5', 'Leadership'),
	('0c140396-41a9-4a4d-a7e1-1fb4daf92855', '2026-02-23 15:33:08.460732+00', 'ed1549f8-243f-4687-82b6-eab0259174c5', 'Communication'),
	('ff4323a0-b9a6-4f8f-8317-9964d527ad3e', '2026-02-27 05:30:30.81854+00', '57f3e20e-f8b0-43d7-bf4b-8470a28d53d3', 'Test'),
	('188b01e0-1f10-417e-af92-27d205720b61', '2026-02-27 05:30:30.81854+00', '57f3e20e-f8b0-43d7-bf4b-8470a28d53d3', 'test1'),
	('3a0163af-eb12-4eaf-ae0e-504029e7d1e1', '2026-02-27 05:30:30.81854+00', '57f3e20e-f8b0-43d7-bf4b-8470a28d53d3', 'test2'),
	('3f81db9f-7fa0-435a-9e22-4a268409d55f', '2026-03-02 17:08:59.844473+00', 'f1bd6187-877d-4b21-a84d-dba453e1beb5', 'amazing');


--
-- Data for Name: social_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."social_links" ("link", "id", "applicant_id") VALUES
	('https://github.com/Xylphy', '8db35830-02d0-4877-8e09-1f412526ea2d', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65'),
	('https://www.facebook.com/jameskenneth.acabal/', '366fabe0-68c7-468d-9393-3d69771a2fcf', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65'),
	('https://www.instagram.com/anato_eini/', '28e8e7e2-1dc5-4eb2-83ae-d4bedcfafe4e', 'd9afde9c-a591-4c79-b9f7-f2fe57580c65');


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."tags_id_seq"', 100, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict ghMppylQbqiwm00rZpdzusYLQDW4L70kQdDFiaqz7opmJtxnmqfsPp6RNWx67Qy

RESET ALL;
