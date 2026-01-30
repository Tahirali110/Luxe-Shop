import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// #region agent log
fetch('http://127.0.0.1:7242/ingest/3e34ee89-e415-44aa-ad50-a9a60ca8d5a2',{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({location:'src/main.tsx:boot',message:'App boot beacon',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

createRoot(document.getElementById("root")!).render(<App />);
