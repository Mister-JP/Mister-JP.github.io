/// <reference types="astro/client" />

declare module 'node:fs' {
  export function existsSync(path: string | URL): boolean;
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
}
