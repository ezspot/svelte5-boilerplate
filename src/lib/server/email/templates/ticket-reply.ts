import { renderEmailLayout } from './layout';

export function buildTicketReplyEmail({
	appName,
	orgName,
	displayId,
	title,
	replierName,
	bodyPreview,
	portalUrl
}: {
	appName: string;
	orgName: string;
	displayId: string;
	title: string;
	replierName: string;
	bodyPreview: string;
	portalUrl: string;
}) {
	const subject = `Re: [${orgName}] ${displayId}: ${title}`;
	const truncated = bodyPreview.length > 300 ? bodyPreview.slice(0, 300) + '…' : bodyPreview;

	const html = renderEmailLayout({
		preheader: `${replierName} replied to ${displayId}`,
		title: `${appName} — New Reply`,
		intro: [
			`${replierName} replied to ${displayId}: ${title}`,
			truncated
		],
		cta: { label: 'View conversation', href: portalUrl },
		footer: [
			`You can reply directly to this email to add a response, or use the portal link above.`
		]
	});

	const text = [
		`${appName} — New Reply`,
		'',
		`${replierName} replied to ${displayId}: ${title}`,
		'',
		truncated,
		'',
		`View conversation: ${portalUrl}`,
		'',
		`You can reply directly to this email to add a response.`
	].join('\n');

	return { subject, html, text };
}
