import { renderEmailLayout } from './layout';

export function buildVerificationEmail({
	appName,
	name,
	url
}: {
	appName: string;
	name: string;
	url: string;
}) {
	const subject = `Verify your ${appName} account`;
	const text = [
		`Hi ${name},`,
		`Verify your email address to finish setting up ${appName}.`,
		`Open this link: ${url}`
	].join('\n\n');

	return {
		subject,
		text,
		html: renderEmailLayout({
			preheader: `Verify your ${appName} account.`,
			title: 'Email verification',
			intro: [`Hi ${name},`, `Verify your email address to finish setting up ${appName}.`],
			cta: {
				label: 'Verify email',
				href: url
			},
			footer: ['If you did not request this email, you can safely ignore it.']
		})
	};
}
