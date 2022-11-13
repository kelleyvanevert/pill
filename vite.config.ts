import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "./src",
  publicDir: path.resolve(__dirname, "public"),
});
