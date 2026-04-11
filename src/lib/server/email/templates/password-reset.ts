import { renderEmailLayout } from './layout';

export function buildPasswordResetEmail({
	appName,
	name,
	url
}: {
	appName: string;
	name: string;
	url: string;
}) {
	const subject = `Reset your ${appName} password`;
	const text = [
		`Hi ${name},`,
		`Use the link below to reset your ${appName} password.`,
		`Open this link: ${url}`
	].join('\n\n');

	return {
		subject,
		text,
		html: renderEmailLayout({
			preheader: `Reset your ${appName} password.`,
			title: 'Password reset',
			intro: [`Hi ${name},`, `Use the link below to reset your ${appName} password.`],
			cta: {
				label: 'Reset password',
				href: url
			},
			footer: ['If you did not request a password reset, you can ignore this email.']
		})
	};
}
