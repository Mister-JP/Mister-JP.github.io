import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

export default defineConfig({
  markdown: {
    // Keep math rendering in the markdown pipeline so technical notes stay content-first.
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
