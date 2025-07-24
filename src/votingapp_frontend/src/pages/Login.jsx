import React, { useState, useEffect } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { useNavigate } from "react-router-dom";
import { votingapp_backend } from "../../../declarations/votingapp_backend";

const Login = ({ userRole, setUserRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        await handleAuthSuccess(authClient);
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleAuthSuccess = async (authClient) => {
    setLoading(true);
    const identity = authClient.getIdentity();
    const p = identity.getPrincipal();
    setPrincipal(p.toText());
    setIsAuthenticated(true);

    try {
      const isAdmin = await votingapp_backend.isAdmin(p);
      const role = isAdmin ? "admin" : "voter";
      setUserRole(role);

      if (role === "admin") {
        window.location.reload();
        navigate("/admin-dashboard");
      } else {
        window.location.reload();
        navigate("/voter-dashboard");
      }
    } catch (error) {
      console.error("Failed to check role:", error);
      setLoading(false);
    }
  };

  const login = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: "https://identity.ic0.app",
      onSuccess: () => handleAuthSuccess(authClient),
      onError: (err) => console.error("Authentication failed:", err),
    });
  };

  const logout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
    setUserRole("");
    navigate("/");
  };

  const goToDashboard = () => {
    if (userRole === "admin") {
      navigate("/admin-dashboard");
    } else if (userRole === "voter") {
      navigate("/voter-dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <img
            src="https://i.ibb.co/ksYm7DzL/logos.png"
            alt="Loading Logo"
            className="w-16 h-16 animate-spin mx-auto mb-4"
          />
          <p className="text-blue-700 text-lg font-medium font-poppins">Loading GovConnect...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6f0ff] to-[#ccddff] px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full text-center space-y-6 relative border border-blue-100">
        <div className="flex flex-col items-center">
          <img
            src="https://i.ibb.co/ksYm7DzL/logos.png"
            alt="GovConnect Logo"
            className="w-16 h-16 mb-3"
          />
          <h1 className="text-4xl font-extrabold text-blue-700 font-poppins">GovConnect</h1>
          <p className="text-gray-600 font-inter text-sm mt-1">
            Sistem Pemilu Digital Berbasis Blockchain
          </p>
        </div>

        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-gray-700 text-sm font-medium">Selamat datang!</p>
            <p className="text-gray-500 text-xs break-all">
              <span className="font-semibold text-gray-700">Principal ID:</span>
              <br />
              {principal}
            </p>

            {userRole && (
              <button
                onClick={goToDashboard}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-lg font-semibold transition-all duration-200"
              >
                Masuk ke Dashboard {userRole === "admin" ? "Admin" : "Voter"}
              </button>
            )}

            <button
              onClick={logout}
              className="w-full border border-red-500 text-red-600 hover:bg-red-50 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl text-lg font-bold transition-all duration-200"
          >
            Login dengan Internet Identity
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;
