
module.exports = {
	plugins: [
	'@vuepress/active-header-links',
	'@vuepress/back-to-top',
	'@vuepress/last-updated',
	[
	'@vuepress/pwa', {
		serviceWorker: true,
		updatePopup: {
			message: "New content is available.",
			buttonText: "Refresh"
		}
	}
	],
	'vuepress-plugin-reading-time',
	[
	'@vuepress/google-analytics', {
		'ga': 'UA-132347022-1'
	}
	],
	'alias',
	[
	'vuepress-plugin-clean-urls', {
		normalSuffix: '/',
		indexSuffix: '/',
		notFoundPath: '/404.html',
	}
	],
	'@vuepress/medium-zoom',
	[
	'disqus', {
		shortname: 'apiscp'
	}
	],
	],
	markdown: {
		extendMarkdown: md => {
			md.use(require('markdown-it-deflist'))
		}
	},
	patterns: [
	'*.md',
	'admin/**/*.vue',
	'admin/**/*.md'
	],

	redirectionMapping: {
		"GLOSSARY": "glossary"
	},
	title: "ApisCP Docs",
	description: "ApisCP · A modern hosting platform",
	head: [
	["link", { rel: "stylesheet", href: "https://fonts.googleapis.com/icon?family=Material+Icons"}],
	["link", { rel: "icon", href: "/favicon.ico" }],
	['meta', { name: 'theme-color', content: '#169a84' }],
	['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
	['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
	['link', { rel: 'apple-touch-icon', href: '/images/touch/home152.png' }],
	['meta', { name: 'msapplication-TileImage', content: '/images/touch/home144.png' }],
	['meta', { name: 'msapplication-TileColor', content: '#2c3035' }],
	['link', { rel: 'manifest', href: '/manifest.json' }],
	],
	themeConfig: {
		APNSCP_ROOT: '/usr/local/apnscp',
		logo: 'https://apiscp.com/images/logo-inv.svg',
	// lastUpdated: 'Last updated',
	repo: 'https://github.com/apisnetworks/apnscp-docs',
	codeRepo: 'https://gitlab.com/apisnetworks/apnscp',
	docsDir: "docs",
	editLinks: true,
	editLinkText: 'Help us improve this article!',
	smoothScroll: true,
	algolia: {
		apiKey: '40a665fc96b49b38dc8620bad6372c9a',
		indexName: 'apiscp',
	},
	nav: [
	{
		text: "Home",
		link: "/"
	},
	{
		text: "Getting Started",
		link: "/INSTALL"
	},
	{
		text: "Administration",
		link: "/admin/CLI"
	},
	{
		text: "Customizing",
		link: "/admin/Customizing"
	},
	{
		text: "Learn More",
		items: [
		{
			text: "Changelog",
			link: "https://gitlab.com/apisnetworks/apnscp/-/commits/master"
		},
		{
			text: "Buy Now",
			link: "https://my.apiscp.com"
		}
		]
	}
	],
	sidebarDepth: 3,
	sidebar: {
		"/": [
		{
			title: "Preface",
			collapsable: true,
			children: [
			"CONVENTIONS",
			"SECURITY",
			"admin/Mass hosting",
			]
		},
		{
			title: "Getting Started",
			collapsable: false,
			children: [
			"ARCHITECTURE",
			"INSTALL",
			"UPGRADING",
			"LICENSE",
			"FIREWALL",
			"admin/NAT"
			]
		},
		{
			title: "Administration",
			collapsable: false,
			sidebarDepth: 3,
			children: [
			{
				title: "Command-line",
				children: [
				"admin/CLI",
				"admin/Plans",
				"admin/Scopes",
				"admin/Bootstrapper",
				]
			},
			{
				title: "Migrations",
				children: [
				"admin/Migrations - cPanel",
				"admin/Migrations - server",
				]
			},
			"admin/Authentication",
			"admin/Filesystem",
			{
				title: "DNS",
				children: [
				["admin/DNS", "Overview"],
				{
					title: "Providers",
					children: [
					"admin/dns/AWS",
					"admin/dns/Cloudflare",
					"admin/dns/Digitalocean",
					"admin/dns/Hetzner",
					"admin/dns/Katapult",
					"admin/dns/Linode",
					"admin/dns/PowerDNS",
					"admin/dns/Vultr",
					]
				}
				]
			},
			"admin/SSL",
			{
				title: "HTTP",
				children: [
				"admin/Apache",
				"admin/PHP-FPM",
				"admin/Evasive",
				"admin/ModSecurity",
				"admin/Fortification",
				"admin/Audit"
				]
			},
			{
				title: "Databases",
				children: [
				"admin/MySQL",
				"admin/phpMyAdmin",
				"admin/PostgreSQL"
				]
			},
			{
				title: "Web Apps",
				children: [
				["admin/WebApps", "Overview"],
				"admin/webapps/Passenger",
				["admin/webapps/Custom", "Third-party apps"],
				{
					title: "Apps",
					children: [
					"admin/webapps/Discourse",
					"admin/webapps/Ghost",
					"admin/webapps/Laravel",
					"admin/webapps/Nextcloud",
					"admin/webapps/WordPress",
					"admin/webapps/Go",
					"admin/webapps/Node",
					"admin/webapps/Perl",
					"admin/webapps/Python",
					"admin/webapps/Ruby",
					]
				}
				]
			},
			"admin/Docker",
			{
				title: "Mail",
				children: [
				"admin/Mail",
				{
					title: "Services",
					children: [
					"admin/Smtp",
					"admin/Dovecot",
					"admin/rspamd",
					"admin/SpamAssassin",
					"admin/LDA",
					"admin/Authlib",
					"admin/Majordomo",
					]
				},
				{
					title: "Providers",
					children: [
					"admin/mail/Gmail",
					"admin/mail/Mxroute"
					]
				},
				]
			},
			"admin/FTP",
			"admin/Monitoring",
			"admin/Limits",
			"admin/Resource enforcement",
			"admin/Metrics",
			"admin/Kernel",
			{
				title: "Backups",
				children: [
				["admin/Backups", "Overview"],
				"admin/backups/Bacula"
				]
			},
			"admin/Maps",
			"admin/Benchmarking",
			{
				title: "Panel proxy",
				children: [
					["admin/Panel proxy", "Overview"],
					["admin/proxy/Collector", "Collector"],
					["admin/proxy/API", "API"],
					["admin/proxy/Proxy", "Proxy"],
				]
			},
			['https://notes.apiscp.com', 'Task hacks'],
			"DEBUGGING",
			]
		},
		{
			title: "Extending",
			collapsable: false,
			children: [
			"admin/Customizing",
			"admin/Billing integration",
			"VENDORS",
			"admin/Hooks",
			"PROGRAMMING",
			"admin/Hydration"
			]
		},
		{
			title: "Appendix",
			collapsible: true,
			children: [
			"AUTHORS",
			"admin/Tuneables",
			"admin/Scopes-list",
			"admin/cpcmd-examples",
			{
				title: "Release notes",
				children: [
				"RELEASE-3.2",
				"RELEASE-3.1",
				"RELEASE-3.0",
				]
			},
			['https://api.ara.apiscp.com', 'Build log'],
			['https://gitlab.com/apisnetworks/apnscp', 'Source code'],
			"GLOSSARY"
			]
		}
		]
	}
}
};
