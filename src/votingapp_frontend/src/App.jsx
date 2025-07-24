import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TestVoter from "./pages/Voter";
import Voting from "./pages/Voting";
import Login from "./pages/Login";
import Transparansi from "./pages/Transparansi";
import AboutUs from "./pages/AboutUs";
import Berita from "./pages/Berita";
import BeritaDetail from "./pages/BeritaDetail";
import AdminAddNews from "./pages/AdminAddNews";
import Verifikasi from "./pages/Verifikasi";
import AdminDashboard from "./pages/AdminDashboard";
import KelolaPemilihan from "./pages/KelolaPemilihan";
import HasilPemilihan from "./pages/HasilPemilihan";
import Voter from "./pages/Voter";
import Layout from "./pages/Layout";
import ProtectedRoute from "./ProtectedRoute";
import GovConnectLoader from "./GovConnectLoader";
import { AuthClient } from "@dfinity/auth-client";
import { votingapp_backend } from "../../declarations/votingapp_backend";

const App = () => {
  const [userRole, setUserRole] = useState(""); // "admin" | "voter"
  const [elections, setElections] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const authClient = await AuthClient.create();
      const authenticated = await authClient.isAuthenticated();

      if (authenticated) {
        const identity = authClient.getIdentity();
        const principalValue = identity.getPrincipal();
        setPrincipal(principalValue.toText());
        setIsAuthenticated(true);

        const isAdmin = await votingapp_backend.isAdmin(principalValue);
        setUserRole(isAdmin ? "admin" : "voter");
      }

      setLoading(false);
    };

    const fetchElections = async () => {
      const fetchedElections = await votingapp_backend.getElections();
      setElections(fetchedElections);
    };

    initAuth();
    fetchElections();
  }, []);

    return (
    <Router>
      {loading ? (
        <GovConnectLoader />
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/test" element={<TestVoter />} />
          <Route path="/transparansi" element={<Transparansi />} />
          <Route path="/tentang-kami" element={<AboutUs />} />
          <Route path="/berita" element={<Berita />} />
          <Route path="/berita/:id" element={<BeritaDetail />} />
          <Route
            path="/login"
            element={<Login userRole={userRole} setUserRole={setUserRole} />}
          />

          <Route
          path="/admin-dashboard"
          element={
          <ProtectedRoute isAllowed={isAuthenticated && userRole === "admin"}>
            <Layout/>
            </ProtectedRoute>
          }
          >
            <Route index element={<AdminDashboard elections={elections} principal={principal} />} />
            <Route path="berita" element={<AdminAddNews userRole={userRole} isAuthenticated={isAuthenticated} />} />
            <Route path="hasil-pemilihan" element={<HasilPemilihan userRole={userRole} isAuthenticated={isAuthenticated} />} />
            <Route path="kelola-pemilihan" element={<KelolaPemilihan />} />
            </Route>

            <Route
          path="/voter-dashboard"
          element={
          <ProtectedRoute isAllowed={isAuthenticated && userRole === "voter"}>
            <Layout/>
            </ProtectedRoute>
          }
          >
            <Route index element={<Voter elections={elections} principal={principal} />} />
            <Route path="voting" element={<Voting />} />
            <Route path="verifikasi-identitas" element={<Verifikasi />} />
            </Route>
        </Routes>
      )}
    </Router>
  );
};

export default App;
