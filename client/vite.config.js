import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dotenv from "dotenv";

dotenv.config();
const backendBaseUrl = process.env.VITE_REACT_APP_BACKEND_BASEURL;

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: backendBaseUrl,
        secure: false,
      },
    },
  },
  plugins: [react()],
});
