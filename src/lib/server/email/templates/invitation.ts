import { renderEmailLayout } from './layout';

export function buildInvitationEmail({
	appName,
	organizationName,
	inviterName,
	url
}: {
	appName: string;
	organizationName: string;
	inviterName: string;
	url: string;
}) {
	const subject = `You were invited to ${organizationName} on ${appName}`;
	const text = [
		`${inviterName} invited you to join ${organizationName} on ${appName}.`,
		`Open this link to get started: ${url}`
	].join('\n\n');

	return {
		subject,
		text,
		html: renderEmailLayout({
			preheader: `Join ${organizationName} on ${appName}.`,
			title: 'Workspace invitation',
			intro: [
				`${inviterName} invited you to join ${organizationName} on ${appName}.`,
				'Use the link below to sign in or create your account.'
			],
			cta: {
				label: 'Accept invitation',
				href: url
			},
			footer: ['The invitation link will expire automatically if it is left unused.']
		})
	};
}
