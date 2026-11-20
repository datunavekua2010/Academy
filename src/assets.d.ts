/** Vite resolves imported PNG files to their bundled URL. */
declare module '*.png' {
  const src: string;
  export default src;
}
