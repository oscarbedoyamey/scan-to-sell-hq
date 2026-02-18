// MUST be first import — patches sessionStorage before Supabase client is created
import './lib/sessionStoragePatch';

import { checkAppVersion } from './lib/appVersion';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force logout if APP_VERSION changed (bump version in src/lib/appVersion.ts after deploy)
const sessionCleared = checkAppVersion();
if (sessionCleared) {
  window.location.reload();
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
