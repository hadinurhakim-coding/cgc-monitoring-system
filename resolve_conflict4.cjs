const fs = require('fs');
let code = fs.readFileSync('src/routes/login/+page.server.ts', 'utf8');

const regex = /1:46:21 AM \[vite\] \(client\) hmr update \/src\/routes\/layout\.css\n1:46:21 AM \[vite\] \(ssr\) page reload src\/routes\/login\/\+page\.server\.ts\nil === "string" \? rawEmail\.trim\(\)\.toLowerCase\(\) : "";/;
code = code.replace(regex, `"/dashboard";
		const formData = await request.formData();
		const rawEmail = formData.get("email");
		const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";`);

fs.writeFileSync('src/routes/login/+page.server.ts', code);
