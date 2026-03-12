INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('resumes', 'resumes', TRUE, 10485760, -- 10 MB in bytes
    ARRAY['application/pdf']);

INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('transcripts', 'transcripts', TRUE, 94371840, -- 90 MB in bytes
    ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/x-msvideo', 'video/quicktime']);

INSERT INTO storage.buckets(id, name, public)
  VALUES ('applications', 'applications', TRUE);

INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('staff_evaluations', 'staff_evaluations', TRUE, 10485760, -- 10 MB in bytes
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
