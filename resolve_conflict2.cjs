const fs = require('fs');
let code = fs.readFileSync('src/routes/login/+page.server.ts', 'utf8');

code = code.replace(/\\tsendPin: async \\(\\{ request, url \\}\\) => \\{\\n\\t\\tconst redirectTo = url\\.searchParams\\.get\\("re1:45:50 AM \\[vite\\] \\(client\\) hmr update \\/src\\/routes\\/layout\\.css\\n1:45:50 AM \\[vite\\] \\(ssr\\) page reload src\\/routes\\/login\\/\\+page\\.server\\.ts\\n"\\/dashboard";/, `	sendPin: async ({ request, url }) => {
		const redirectTo = url.searchParams.get("redirectTo");
		const nextPath =
			redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
				? redirectTo
				: "/dashboard";`);

fs.writeFileSync('src/routes/login/+page.server.ts', code);
