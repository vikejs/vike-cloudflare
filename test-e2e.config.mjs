export default {
  tolerateError,
};

function tolerateError(info) {
  const { logText } = info;
  return [
    /*
    What seems to be a wrangler bug:
    ```console
    [11:07:40.427][/][pnpm run preview][stderr] ▲ [WARNING] Invalid source URL: first path segment in URL cannot contain colon [invalid-source-url]

        .wrangler/tmp/pages-LLnPri/606wemc1wol.js.map:3:14:
          3 │   "sources": ["<define:__ROUTES__>", "../../../../../node_modules/....
            ╵               ~~~~~~~~~~~~~~~~~~~~~

      The source map ".wrangler/tmp/pages-LLnPri/606wemc1wol.js.map" was referenced by the file ".wrangler/tmp/pages-LLnPri/606wemc1wol.js" here:

        .wrangler/tmp/pages-LLnPri/606wemc1wol.js:41:21:
          41 │ //# sourceMappingURL=606wemc1wol.js.map
             ╵                      ~~~~~~~~~~~~~~~~~~
    ```
    */
    "Invalid source URL: first path segment in URL cannot contain colon",

    // [13:47:34.100][/examples/hattip-app][pnpm run dev --port 3000][stderr] 1:47:34 PM [vike][Warning] Vite's JavaScript API is deprecated https://vike.dev/migration/cli#api
    "Vite's JavaScript API is deprecated",
  ].some((t) => logText.includes(t));
}
