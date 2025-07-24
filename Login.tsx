import React from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Scan, Users, Shield } from "lucide-react";

const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const clientId = "4ir68homtqoldnpbn4d52tf50f";
  const logoutUri = "http://localhost:5173"; // match your redirect_uri
  const cognitoDomain = "https://ap-south-198vedqttf.auth.ap-south-1.amazoncognito.com";

  const signOutRedirect = () => {
    auth.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) return <p>Loading...</p>;
  if (auth.error) return <p>Error: {auth.error.message}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Attendify</span>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {auth.isAuthenticated ? (
                <Shield className="w-6 h-6 text-white" />
              ) : (
                <Users className="w-6 h-6 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {auth.isAuthenticated ? "Welcome!" : "Login to Attendify"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {auth.isAuthenticated
                ? `Signed in as ${auth.user?.profile?.email}`
                : "Use your account to continue"}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {auth.isAuthenticated ? (
              <>
                <Button
                  className="w-full"
                  onClick={() => {
                    localStorage.setItem('attendify_user', JSON.stringify(auth.user));
                    const groups = auth.user?.profile?.["cognito:groups"] || [];
                    if (Array.isArray(groups) ? groups.includes("admin") : groups === "admin") {
                      navigate("/admin");
                    } else {
                      navigate("/attendance");
                    }
                  }}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={signOutRedirect}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => auth.signinRedirect()}
              >
                Sign in with Cognito
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
