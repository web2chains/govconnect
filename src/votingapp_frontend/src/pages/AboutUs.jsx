import React from "react";
import Navigation from "../components/LandingPage/Navigation";
import Hero from "../components/AboutUs/Hero";
import TimKami from "../components/AboutUs/TimKami";
import Footer from "../components/LandingPage/Footer";

export default function AboutUs() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <Hero />

      {/* Tim Kami Section */}
      <TimKami />

      {/* Footer */}
      <Footer />
    </div>
  );
}
