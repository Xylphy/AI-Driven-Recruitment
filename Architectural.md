# AI-Driven Recruitment - Architecture Diagram

```mermaid
flowchart TB
	%% Client and routing layer
	subgraph Client[Client Browser]
		U[Users<br/>Candidates, HR Officers, Admin]
	end

	subgraph NextApp[Next.js App Router Layer]
		RP["Route Groups\n(auth), (candidate), (jobs), (landing_page), (track), admin"]
		PG[Pages and Layouts<br/>src/app/**/page.tsx, layout.tsx, loading.tsx]
		CMP[Reusable Components<br/>src/components/common, admin, application, joblisting]
		CTX[Context and Hooks<br/>src/context/AuthProvider.tsx, src/hooks/*]
	end

	subgraph Interface[API and Integration Layer]
		APIR[API Route Handlers<br/>src/app/api/auth, csrf, uploadFiles, staffEvaluation]
		TRPC[tRPC Endpoint<br/>src/app/api/trpc + src/lib/trpc/routers]
		VAL[Schemas and Validation<br/>src/lib/schemas/*]
		SEC[Security Utilities<br/>src/lib/csrf.ts, src/lib/rate-limit.ts]
	end

	subgraph Domain[Business Logic and Services]
		LIB[App Services and Utilities<br/>src/lib/constants.ts, library.ts, swal.ts]
		AUTH[Authentication Logic<br/>src/hooks/useAuth.ts, src/context/AuthProvider.tsx]
		MAIL[Email Service<br/>src/lib/nodemailer/sendEmail.ts]
		FILES[File Processing<br/>src/app/api/uploadFiles]
	end

	subgraph Data[Data Access Layer]
		SB_CLIENT[Supabase Client<br/>src/lib/supabase/client.ts]
		SB_SERVER[Supabase Server Actions<br/>src/lib/supabase/server.ts, action.ts]
		FB_CLIENT[Firebase Client<br/>src/lib/firebase/client.ts]
		FB_ADMIN[Firebase Admin and Actions<br/>src/lib/firebase/admin.ts, action.ts]
		TYPES[Types<br/>src/types/*]
	end

	subgraph Infrastructure[Infrastructure and Platform]
		SUPA_DB[(Supabase Postgres and Storage)]
		SUPA_MIG[Supabase Migrations<br/>supabase/migrations/*.sql]
		FIREBASE[(Firebase Auth and Services)]
		EMAIL[(SMTP Provider)]
	end

	U --> RP
	RP --> PG
	PG --> CMP
	PG --> CTX

	PG --> APIR
	PG --> TRPC
	CMP --> TRPC

	APIR --> VAL
	APIR --> SEC
	TRPC --> VAL
	TRPC --> LIB

	APIR --> AUTH
	APIR --> FILES
	TRPC --> AUTH
	TRPC --> LIB

	LIB --> SB_SERVER
	AUTH --> SB_SERVER
	FILES --> SB_SERVER
	LIB --> SB_CLIENT
	LIB --> FB_CLIENT
	LIB --> FB_ADMIN
	LIB --> MAIL

	SB_SERVER --> SUPA_DB
	SB_CLIENT --> SUPA_DB
	FB_ADMIN --> FIREBASE
	FB_CLIENT --> FIREBASE
	MAIL --> EMAIL
	SUPA_MIG --> SUPA_DB

	TYPES -. shared contracts .- PG
	TYPES -. shared contracts .- TRPC
	TYPES -. shared contracts .- SB_SERVER
```
```

## Notes

- The app uses the Next.js App Router with route groups to separate user domains.
- API responsibilities are split between REST-like route handlers and tRPC procedures.
- Validation and security concerns are centralized in schema and utility modules.
- Supabase is the primary persistence layer; Firebase is used for complementary auth/service capabilities.
- Shared TypeScript types provide consistency across UI, API, and data-access boundaries.
