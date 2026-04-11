function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export function renderEmailLayout({
	preheader,
	title,
	intro,
	cta,
	footer
}: {
	preheader: string;
	title: string;
	intro: string[];
	cta?: { label: string; href: string };
	footer?: string[];
}) {
	const introHtml = intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
	const footerHtml = footer?.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('') ?? '';
	const buttonHtml = cta
		? `<p style="margin:32px 0;"><a href="${escapeHtml(cta.href)}" style="display:inline-block;border-radius:12px;background:#1d4ed8;padding:12px 20px;color:#ffffff;font-weight:600;text-decoration:none;">${escapeHtml(cta.label)}</a></p>`
		: '';

	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${escapeHtml(title)}</title>
	</head>
	<body style="margin:0;background:#eef2ff;padding:32px 16px;font-family:'IBM Plex Sans','Segoe UI',sans-serif;color:#172554;">
		<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
		<div style="margin:0 auto;max-width:640px;border:1px solid #dbe4ff;border-radius:24px;background:#ffffff;padding:40px 32px;">
			<p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2563eb;">${escapeHtml(title)}</p>
			${introHtml}
			${buttonHtml}
			${footerHtml}
		</div>
	</body>
</html>`;
}
