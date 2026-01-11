import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import * as fs from 'fs';
import * as path from 'path';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'react-study.komiyamma.net',
  tagline: 'React/Next入門者用の学習教材',
  favicon: 'img/react_logo.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://react-study.komiyamma.net',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'komiyamma', // Usually your GitHub org/user name.
  projectName: 'react-study.komiyamma.net', // Usually your repo name.

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
  },

  markdown: {
    format: 'detect',  // .md は CommonMark、.mdx は MDX として処理
    mermaid: true,
    // 外部の .memo ファイルからページの description を読み込む
    parseFrontMatter: async (params) => {
      // デフォルトのパーサーを使用
      const result = await params.defaultParseFrontMatter(params);

      // すでに description があれば何もしない
      if (result.frontMatter.description) {
        return result;
      }

      // 対応する .memo ファイルのパスを計算
      const memoPath = params.filePath.replace(/\.mdx?$/, '.memo');

      // .memo ファイルが存在すれば description として読み込む
      if (fs.existsSync(memoPath)) {
        const memoContent = fs.readFileSync(memoPath, 'utf-8').trim();
        if (memoContent) {
          result.frontMatter.description = memoContent;
        }
      }

      return result;
    },
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      "@easyops-cn/docusaurus-search-local",
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        language: ["ja", "en"],
      }),
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.

        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.

          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Home',
        src: 'img/home_light.svg',
        srcDark: 'img/home_dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'reactStudySidebar',
          position: 'left',
          label: 'React Study',
        },
        {
          type: 'docSidebar',
          sidebarId: 'nextStudySidebar',
          position: 'left',
          label: 'Next Study',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Tutorial',
        },
        // { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/komiyamma/site-docusaurus-react-study',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} komiyamma, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
