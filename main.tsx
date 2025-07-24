import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import "./index.css";

const oidcConfig = {
  authority: "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_98vEDqTTf",
  client_id: "4ir68homtqoldnpbn4d52tf50f",
  redirect_uri: "http://localhost:5173",
  response_type: "code",
  scope: "email openid phone profile",
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
