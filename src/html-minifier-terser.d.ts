declare module "html-minifier-terser" {
  export function minify(
    text: string,
    options?: Record<string, any>
  ): Promise<string>;
}
