import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.jsx";

// MSAL imports
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";
export const msalInstance = new PublicClientApplication(msalConfig);

const container = document.getElementById("root");
const root = createRoot(container);

msalInstance.initialize().then(() => {
  if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
  }

  msalInstance.enableAccountStorageEvents();
  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
      const account = event.payload.account;
      msalInstance.setActiveAccount(account);
    }
  });

  root.render(
    <Router>
        <App pca={msalInstance} />
    </Router>
  );
});
