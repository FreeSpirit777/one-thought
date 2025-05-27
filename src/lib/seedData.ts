export const siteSettingsSeedData = [
	{
		id: "site-settings",
		siteName: "My Site",
		siteDescription: "My Site Description",
		imageId: null,
		isCookieConsentEnabled: false,
		cookieConsentPageId: "footer-page-2",
		googleAnalyticsId: null,
	},
];

export const blogSettingsSeedData = [
	{
		id: "blog-settings",
		visiblePages: 3,
		postsPerPage: 3,
	},
];

export const pagesSeedData = [
	{
		id: "footer-page-1",
		label: "Footer Page One",
		title: "Legal Notice",
		slug: "legal-notice",
		jsonContent: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{ type: "text", text: "Content for Legal Notice..." },
					],
				},
			],
		},
		htmlContent: "<p>Content for Legal Notice...</p>",
		isVisible: true,
	},
	{
		id: "footer-page-2",
		label: "Footer Page Two",
		title: "Privacy Policy",
		slug: "privacy-policy",
		jsonContent: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{ type: "text", text: "Content for Privacy Policy..." },
					],
				},
			],
		},
		htmlContent: "<p>Content for Privacy Policy...</p>",
		isVisible: true,
	},
	{
		id: "footer-page-3",
		label: "Footer Page Three",
		title: "Terms of Service",
		slug: "terms-of-service",
		jsonContent: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "Content for Terms of Service...",
						},
					],
				},
			],
		},
		htmlContent: "<p>Content for Terms of Service...</p>",
		isVisible: false,
	},
	{
		id: "footer-page-4",
		label: "Footer Page Four",
		title: "About the Author",
		slug: "about-the-author",
		jsonContent: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "Content for About the Author...",
						},
					],
				},
			],
		},
		htmlContent: "<p>Content for About the Author...</p>",
		isVisible: false,
	},
	{
		id: "footer-page-5",
		label: "Footer Page Five",
		title: "Cookie Notice",
		slug: "cookie-notice",
		jsonContent: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{ type: "text", text: "Content for Cookie Notice..." },
					],
				},
			],
		},
		htmlContent: "<p>Content for Cookie Notice...</p>",
		isVisible: false,
	},
	{
		id: "footer-page-6",
		label: "Footer Page Six",
		title: "About Us",
		slug: "about-us",
		jsonContent: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{ type: "text", text: "Content for About Us..." },
					],
				},
			],
		},
		htmlContent: "<p>Content for About Us...</p>",
		isVisible: false,
	},
	{
		id: "footer-page-seven",
		label: "Footer Page Seven",
		title: "Disclaimer",
		slug: "disclaimer",
		jsonContent: {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{ type: "text", text: "Content for Disclaimer..." },
					],
				},
			],
		},
		htmlContent: "<p>Content for Disclaimer...</p>",
		isVisible: false,
	},
];
