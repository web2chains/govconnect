import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/VoterDashboard/Navigation";
import Footer from "../components/LandingPage/Footer";
import { AuthClient } from "@dfinity/auth-client";
import { votingapp_backend } from "../../../declarations/votingapp_backend";
import { Outlet } from "react-router-dom";

export default function Voter() {
  const [time, setTime] = useState({
    hours: 6,
    minutes: 0,
    seconds: 0,
    centiseconds: 0,
  });
  const [newsItems, setNewsItems] = useState([]);
  

  useEffect(() => {
    let iv;

    function startTimer() {
      iv = setInterval(() => {
        setTime((prev) => {
          if (prev.centiseconds > 0) {
            return { ...prev, centiseconds: prev.centiseconds - 1 };
          } else if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1, centiseconds: 99 };
          } else if (prev.minutes > 0) {
            return {
              ...prev,
              minutes: prev.minutes - 1,
              seconds: 59,
              centiseconds: 99,
            };
          } else if (prev.hours > 0) {
            return {
              ...prev,
              hours: prev.hours - 1,
              minutes: 59,
              seconds: 59,
              centiseconds: 99,
            };
          }
          clearInterval(iv);
          return prev;
        });
      }, 10);
    }

    async function fetchNewsAndStart() {
      try {
        const news = await votingapp_backend.getAllNews();
        setNewsItems(news.slice(0, 2));
      } catch (e) {
        console.error("Gagal mengambil berita:", e);
      } finally {
        startTimer();
      }
    }

    fetchNewsAndStart();
    return () => clearInterval(iv);
  }, []);

  const formatTime = (value) => String(value).padStart(2, "0");

  async function handleLogout() {
    const authClient = await AuthClient.create();
    await authClient.logout();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-edem-gray-light">
      <Navigation />

      {/* Logout Button */}
      <div className="flex justify-end px-4 lg:px-16 mt-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <main className="pt-6 px-4 lg:px-16 space-y-16 pb-32">
        {/* Banner */}
        <section className="w-full bg-gradient-to-r from-edem-purple to-edem-teal rounded-[15px] overflow-hidden">
          <div className="relative h-[300px]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-20" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
              <h2 className="text-white font-poppins text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Welcome Voter!
              </h2>
              <p className="text-white font-inter text-lg md:text-xl lg:text-2xl">
                Selamat datang di GovConnect !
              </p>
            </div>
          </div>
        </section>

        {/* Fitur */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1317px] mx-auto">
          {[
            {
              icon: "🔒",
              title: "Aman",
              desc: "Data pengguna dan hasil voting disimpan di blockchain yang tidak dapat dimanipulasi.",
            },
            {
              icon: "🔍",
              title: "Transparan",
              desc: "Setiap suara dapat dilacak dan diaudit publik tanpa bocorkan identitas.",
            },
            {
              icon: "🌐",
              title: "Mudah Diakses",
              desc: "Vote dari mana saja tanpa perlu datang ke TPS, mendukung inklusivitas.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-edem-card rounded-[15px] p-8 shadow-lg flex flex-col items-start"
            >
              <div className="text-edem-teal text-4xl mb-4">{f.icon}</div>
              <h3 className="font-poppins text-2xl font-bold mb-2">{f.title}</h3>
              <p className="font-inter text-edem-dark">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="container mx-auto px-4 lg:px-16 mb-16">
  <div className="relative max-w-[1313px] h-[504px] border border-black rounded-[15px] overflow-hidden shadow-lg">
    {/* Background Kanan */}
    <div className="absolute right-0 top-0 w-[676px] h-full bg-demokrasi-gray rounded-l-[15px] z-0" />

    <div className="relative h-full flex z-10">
      {/* Kiri */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16">
        <h2 className="font-poppins font-bold text-[32px] lg:text-[45px] text-black mb-6 leading-snug">
          Tunjukkan Suaramu, <br /> Di GovConnect!
        </h2>
        <Link
          to="/voter-dashboard/voting"
          className="bg-edem-purple text-white font-poppins font-semibold text-lg lg:text-xl px-6 py-3 lg:px-8 lg:py-4 rounded-[15px] hover:bg-opacity-90 transition-all shadow-md"
        >
          Lakukan Pemilihan Sekarang!
        </Link>
      </div>
      

      {/* Kanan */}
      <div className="w-[676px] flex flex-col items-center justify-center px-4 py-8 space-y-6">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/09c5d8e47e9f9fe37d47dc299c671bc44d99d12a?width=884"
          alt="Voting Box"
          className="w-[300px] lg:w-[442px] h-auto object-cover"
        />
      </div>
    </div>
  </div>
</section>




        {/* Berita */}
        <section className="max-w-[1310px] mx-auto">
          <h2 className="font-poppins text-3xl font-bold text-edem-dark mb-8">Berita Terkini!</h2>
          {newsItems.length === 0 ? (
            <p className="text-gray-600 font-inter">Belum ada berita.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {newsItems.map((item) => (
                <div
                  key={item.id.toString()}
                  className="flex flex-col bg-white rounded-[15px] shadow p-6"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-[200px] object-cover rounded mb-4"
                    />
                  ) : (
                    <div className="w-full h-[200px] bg-edem-card rounded mb-4" />
                  )}
                  <h3 className="font-poppins text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="font-inter text-edem-dark mb-2">{item.snippet}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(Number(item.created) * 1000).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <Link
                    to={`/berita/${item.id.toString()}`}
                    className="mt-auto bg-edem-purple text-white font-poppins font-bold text-lg py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors text-center"
                  >
                    Baca Selengkapnya
                  </Link>
                </div>
              ))}
            </div>
          )}
          <div className="text-right mt-4">
            <Link to="/berita" className="text-edem-purple font-bold hover:underline">
              Lihat Semua Berita →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
