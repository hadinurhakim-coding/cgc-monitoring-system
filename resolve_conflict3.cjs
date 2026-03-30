const fs = require('fs');
let code = fs.readFileSync('src/routes/login/+page.server.ts', 'utf8');

const regex = /re1:45:50 AM \[vite\] \(client\) hmr update \/src\/routes\/layout\.css\n1:45:50 AM \[vite\] \(ssr\) page reload src\/routes\/login\/\+page\.server\.ts\n"/;
code = code.replace(regex, `directTo");
		const nextPath =
			redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
				? redirectTo
				: "`);

fs.writeFileSync('src/routes/login/+page.server.ts', code);
