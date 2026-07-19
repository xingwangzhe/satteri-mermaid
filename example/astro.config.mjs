// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
// 直接使用文件路径导入本地构建产物
import { mermaidMdast, mermaidHast } from '../dist/index.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
	vite: {
		server: {
			fs: {
				// 允许访问项目外部的文件（父目录中的 dist）
				allow: ['../..'],
			},
		},
	},
	markdown: {
		processor: satteri({
			mdastPlugins: [
				mermaidMdast({
					langs: ['mermaid', 'mmd'],
				}),
			],
			hastPlugins: [
				mermaidHast({
					ssg: true,
					responsive: true,
					theme: 'modern',
				}),
			],
		}),
	},
});
