import { renderEmailLayout } from './layout';

export function buildMagicLinkEmail({
	appName,
	name,
	url,
	intent
}: {
	appName: string;
	name?: string | null;
	url: string;
	intent: 'signin' | 'signup';
}) {
	const salutation = name ? `Hi ${name},` : 'Hi,';
	const actionCopy =
		intent === 'signup'
			? `Finish creating the ${appName} account with the secure sign-in link below.`
			: `Use the secure sign-in link below to access ${appName}.`;
	const subject =
		intent === 'signup' ? `Finish creating your ${appName} account` : `Sign in to ${appName}`;

	return {
		subject,
		text: [salutation, actionCopy, `Open this link: ${url}`].join('\n\n'),
		html: renderEmailLayout({
			preheader: actionCopy,
			title: intent === 'signup' ? 'Finish sign-in' : 'Secure sign-in',
			intro: [salutation, actionCopy],
			cta: {
				label: intent === 'signup' ? 'Finish account setup' : 'Sign in',
				href: url
			},
			footer: ['If you did not request this email, you can safely ignore it.']
		})
	};
}
