/** Prefix for static files in `public/` (GitHub Pages project sites use `/repo-name`). */
export function publicPath(path) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
