import { Buffer } from "buffer";
import React from "react";
import ReactDOM from "react-dom/client";

if (!window.Buffer) {
  window.Buffer = Buffer;
}
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastProvider } from "./hooks/useToast";
import { WalletProvider } from "./hooks/useWallet";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
