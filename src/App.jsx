import React, { useEffect, useState } from "react";
import { MsalProvider } from "@azure/msal-react";

import Grid from '@mui/material/Grid';

import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import logo3Hs from './assets/3Hs.png'
import './App.css';

import { msalInstance } from "./main.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [applicationName, setApplicationName] = useState("N/A");
  const [repoName, setRepoName] = useState("N/A");
  const gitHubPAT = import.meta.env.VITE_GITHUB_PAT;
  
  useEffect(() => {
    const checkAccount = async () => {
      try {
        // Handle redirect responses
        const redirectResponse = await msalInstance.handleRedirectPromise();
        if (redirectResponse) {
          handleLoginSuccess(redirectResponse);
        } else {
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            setUser(accounts[0]); // Set user
            setIsLoggedIn(true); // User is logged in

            // Attempt to acquire a token silently
            await acquireAccessToken(accounts[0]);
          }
        }
      } catch (error) {
        console.error("Error handling redirect promise: ", error);
      }
    };

    checkAccount(); // Call the function to check account status
  }, []);

  const handleLoginSuccess = (authResult) => {
    setUser(authResult.account);
    setIsLoggedIn(true);
    acquireAccessToken(authResult.account);
  };

  const acquireAccessToken = async (account) => {
    const tokenRequest = {
      scopes: ["openid", "profile", "User.Read", "Application.Read.All"],
      account: account
    };

    try {
      const response = await msalInstance.acquireTokenSilent(tokenRequest);
      setAccessToken(response.accessToken);
    } catch (error) {
      console.error("Token acquisition failed:", error);
      if (error instanceof msal.InteractionRequiredAuthError) {
        // If interaction is required, login again
        msalInstance.loginRedirect(tokenRequest);
      }
    }
  };

  const login = () => {
    const loginRequest = {
      scopes: ["openid", "profile", "User.Read", "Application.Read.All"] // Specify your desired scopes
    };
    msalInstance.loginRedirect(loginRequest);
  };

  const getAzureApplications = async () => {
    if (!accessToken) {
      console.error("No access token available.");
      return;
    }

    try {
      const response = await fetch("https://graph.microsoft.com/v1.0/applications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setApplicationName(data.value[0]?.displayName || "N/A"); // Set the first application's name
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const getGitHubRepos = async () => {
    if (!gitHubPAT) {
      console.error("No GitHub PAT available.");
      return;
    }

    try {
      const response = await fetch("https://api.github.com/user/repos", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GITHUB_PAT}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // kktelas
      const data = await response.json();
      setRepoName(data.find(repo => repo.name === "notesapp")?.full_name || "N/A"); // Set the first repository's name
    } catch (error) {
      console.error("Error fetching GitHub repositories:", error);
    }
  }

  return (
    <MsalProvider instance={msalInstance}>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://www.linkedin.com/in/3hsurl/" target="_blank">
          <img src={logo3Hs} className="logo 3hs" alt="3Hs logo" />
        </a>
      </div>
      <h2>Vite + React + 3Hs</h2>

      <div>
        <h1>Azure OIDC Authentication</h1>
        {isLoggedIn ? (
          <Grid container spacing={1}>
            <Grid size={{ xs: 12}} sx={{backgroundColor: "#3f51b5", color: "white", padding: 0, borderRadius: 4}}>
              <h2>Welcome, {user.name}</h2>
            </Grid>
            <Grid size={{ xs: 12, sm: 3}} sx={{border: "1px solid #ccc", padding: 1, borderRadius: 4}}>
              <button onClick={getAzureApplications}>Get First Application Name</button>
              <p>{applicationName}</p>
            </Grid>
            <Grid size={{ xs: 12, sm: 3}} sx={{border: "1px solid #ccc", padding: 1, borderRadius: 4}}>
              <button onClick={getGitHubRepos}>Get First GitHub Repos</button>
              <p>{repoName}</p>
            </Grid>
          </Grid>          
        ) : (
          <div>
            <button onClick={login}>Login with Microsoft Azure</button>
          </div>
        )}
      </div>
    </MsalProvider>
  );
}

          // <div>
          //   <h2>Welcome, {user.name}</h2>
          //   <button onClick={getAzureApplications}>Get First Application Name</button>
          //   <p>Application name: {applicationName}</p>
          //   <button onClick={getGitHubRepos}>Get GitHub Repos</button>
          //   <p>GitHub Repo Full Name: {repoName}</p>
          // </div>
export default App;