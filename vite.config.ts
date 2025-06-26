import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkGfm from "remark-gfm";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        // load MDX first
        {
            ...mdx({
                remarkPlugins: [remarkGfm],
            }),
            enforce: 'pre',
        },    react({ include: /\.(mdx|jsx|tsx)$/ }),
        tailwindcss()
    ]
});
