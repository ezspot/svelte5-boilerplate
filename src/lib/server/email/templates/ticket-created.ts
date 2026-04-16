import { renderEmailLayout } from './layout';

export function buildTicketCreatedEmail({
	appName,
	orgName,
	displayId,
	title,
	portalUrl
}: {
	appName: string;
	orgName: string;
	displayId: string;
	title: string;
	portalUrl: string;
}) {
	const subject = `[${orgName}] ${displayId}: ${title}`;

	const html = renderEmailLayout({
		preheader: `Your support request has been received — ${displayId}`,
		title: `${appName} — Ticket Received`,
		intro: [
			`Hi, we've received your support request.`,
			`${displayId}: ${title}`,
			`We'll get back to you as soon as possible. You can track your ticket and add replies using the link below.`
		],
		cta: { label: 'View your ticket', href: portalUrl },
		footer: [
			`If you have additional information, reply directly to this email or use the portal link above.`
		]
	});

	const text = [
		`${appName} — Ticket Received`,
		'',
		`Hi, we've received your support request.`,
		`${displayId}: ${title}`,
		'',
		`Track your ticket: ${portalUrl}`,
		'',
		`If you have additional information, reply directly to this email or use the portal link above.`
	].join('\n');

	return { subject, html, text };
}
