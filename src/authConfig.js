const isLocalhost = window.location.hostname === "localhost";

export const msalConfig = {
    auth: {
        clientId: "55eb0c24-1dd0-457d-a9ca-756fdc5e78f4",
        authority: "https://login.microsoftonline.com/799c6fdd-221a-48a3-bd58-d740bf89ba38",
        redirectUri: isLocalhost
            ? "http://localhost:5173"
            : "https://main.d2kfwzbpqm9rnf.amplifyapp.com/",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false // Set to true for Internet Explorer 11
    }
};
