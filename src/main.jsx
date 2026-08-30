import React from "react";
import ReactDOM from "react-dom/client";

import { AppProvider } from "@solana/connector/react";

import {
  getDefaultConfig,
  getDefaultMobileConfig
} from "@solana/connector/headless";

import App from "./App.jsx";

import "./style.css";

const connectorConfig = getDefaultConfig({
  appName: "DexFans.world",
  appUrl: "https://dexfans.world",
  network: "mainnet-beta",
  autoConnect: true,
  enableMobile: true
});

const mobileConfig = getDefaultMobileConfig({
  appName: "DexFans.world",
  appUrl: "https://dexfans.world"
});

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <AppProvider
      connectorConfig={connectorConfig}
      mobile={mobileConfig}
    >
      <App />
    </AppProvider>
  </React.StrictMode>
);
