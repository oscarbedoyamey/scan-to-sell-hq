// MUST be first import — patches sessionStorage before Supabase client is created
import './lib/sessionStoragePatch';

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
