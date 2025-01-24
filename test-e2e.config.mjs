export default {
  tolerateError,
};

function tolerateError(info) {
  const { logText } = info;
  return [
    // [13:47:34.100][/examples/hattip-app][pnpm run dev --port 3000][stderr] 1:47:34 PM [vike][Warning] Vite's JavaScript API is deprecated https://vike.dev/migration/cli#api
    "Vite's JavaScript API is deprecated",
  ].some((t) => logText.includes(t));
}
