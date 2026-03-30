const fs = require('fs');
let code = fs.readFileSync('src/routes/login/+page.server.ts', 'utf8');

// Replace first conflict block
code = code.replace(/<<<<<<< HEAD\nimport { fail, redirect } from "@sveltejs\/kit";\nimport { createClient } from "@supabase\/supabase-js";\nimport {\n\tSUPABASE_ANON_KEY,\n\tSUPABASE_SERVICE_ROLE_KEY,\n\tSUPABASE_URL\n} from "\$env\/static\/private";\n=======\nimport { fail } from "@sveltejs\/kit";\nimport { createAdminServerClient, createAnonServerClient } from "\$lib\/server\/auth.js";\n>>>>>>> origin\/main/g, `import { fail, redirect } from "@sveltejs/kit";
import { createClient } from "@supabase/supabase-js";
import {
	SUPABASE_ANON_KEY,
	SUPABASE_SERVICE_ROLE_KEY,
	SUPABASE_URL
} from "$env/static/private";`);

// Replace second conflict block
code = code.replace(/<<<<<<< HEAD\n\tsendPin: async \({ request }\) => {\n=======\n\tdefault: async \({ request, url }\) => {\n\t\tconst redirectTo = url\.searchParams\.get\("redirectTo"\);\n\t\tconst nextPath =\n\t\t\tredirectTo && redirectTo\.startsWith\("\/"\) && !redirectTo\.startsWith\("\/\/"\)\n\t\t\t\t\? redirectTo\n\t\t\t\t: "\/dashboard";\n>>>>>>> origin\/main/g, `\tsendPin: async ({ request, url }) => {
		const redirectTo = url.searchParams.get("redirectTo");
		const nextPath =
			redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
				? redirectTo
				: "/dashboard";`);

// Replace third conflict block
code = code.replace(/<<<<<<< HEAD\n=======\n\t\t\t\temailRedirectTo: `\$\{url\.origin\}\/auth\/callback\?next=\$\{encodeURIComponent\(nextPath\)\}`,\n>>>>>>> origin\/main\n/g, ``);

// Fix adminClient and authClient creation which were wrongly referencing auth.js which doesn't exist yet in HEAD
code = code.replace(/const adminClient = createAdminServerClient\(\);\nconst authClient = createAnonServerClient\(\);/, `const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);`);

fs.writeFileSync('src/routes/login/+page.server.ts', code);
