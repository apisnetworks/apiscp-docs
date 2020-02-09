module.exports = {
  plugins: [
    '@vuepress/active-header-links',
    '@vuepress/back-to-top',
    [
      '@vuepress/pwa', {
        serviceWorker: true,
        updatePopup: true
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
    '@vuepress/medium-zoom'
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
  // config for Service Worker
  serviceWorker: {
    updatePopup: {
      message: "New content is available.",
      buttonText: "Refresh"
    }
  },
  redirectionMapping: {
    "GLOSSARY": "glossary"
  },
  title: "ApisCP Documentation",
  description: "ApisCP · modern hosting platform",
  head: [
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/icon?family=Material+Icons"
      }
    ],
    [
      "link",
      {
        rel: "icon",
        href: "/favicon.ico"
      }
    ],
  ],
  themeConfig: {
    logo: 'https://apiscp.com/images/logo-inv.svg',
    // lastUpdated: 'Last updated',
    repo: 'https://github.com/apisnetworks/apnscp-docs',
    docsDir: "",
    editLinks: true,
    editLinkText: 'Help us improve this article!',
    nav: [
      {
        text: "Home",
        link: "/"
      },
      {
        text: "Getting Started",
        link: "/install"
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
    sidebarDepth: 1,
    sidebar: {
      "/": [
        {
          title: "Preface",
          collapsable: true,
          children: [
            "CONVENTIONS",
            "SECURITY",
            "admin/Mass hosting"
          ]
        },
        {
          title: "Getting Started",
          collapsable: false,
          children: [
            "INSTALL",
            "UPGRADING",
            "LICENSE",
            "FIREWALL",

          ]
        },
        {
          title: "Administration",
          collapsable: false,
          children: [
            "admin/CLI",
            "admin/Scopes",

            "admin/Plans",
            "admin/Backups",

            "admin/Migrations",

            "admin/Filesystem",

            "admin/DNS",
            "admin/NAT",

            "admin/SSL",
            "admin/Monitoring",

            "admin/Smtp",
            "admin/LDA",
            "admin/Filtering",

            "admin/Evasive",
            "admin/PHP-FPM",

            "admin/Webapps",
            "admin/Fortification",

            "admin/Troubleshooting",

            "admin/Maps",
            "DEBUGGING",
          ]
        },
        {
          title: "Extending",
          collapsable: true,
          children: [
            "admin/Customizing",
            "admin/Billing integration",
            "admin/Hooks",
            "PROGRAMMING"
          ]
        },
        {
          title: "Appendix",
          collapsible: true,
          children: [
            "AUTHORS",
            "admin/Tuneables",
            "admin/Scopes-list",
            "RELEASE-3.1",
            "GLOSSARY"
          ]
        }
      ]
    }
  }
};
