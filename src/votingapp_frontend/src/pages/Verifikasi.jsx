import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/VoterDashboard/Navigation";
import VerificationForm from "../components/Verif/VerificationForm";
import Footer from "../components/LandingPage/Footer";
import { AuthClient } from "@dfinity/auth-client";

export default function Verifikasi() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authClient = await AuthClient.create();
      const isLoggedIn = await authClient.isAuthenticated();

      if (!isLoggedIn) {
        navigate("/login"); // ganti ke path login kamu
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      {isAuthenticated && <VerificationForm />}

      {/* Footer */}
      <Footer />
    </div>
  );
}
