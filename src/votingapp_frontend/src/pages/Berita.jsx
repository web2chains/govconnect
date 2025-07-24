import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/LandingPage/Navigation";
import Footer from "../components/LandingPage/Footer";
import { votingapp_backend } from "../../../declarations/votingapp_backend";

export default function Berita() {
  const [newsItems, setNewsItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const all = await votingapp_backend.getAllNews();
        setNewsItems(all);
      } catch (err) {
        console.error("Failed to load news:", err);
      }
    })();
  }, []);

  const filtered = newsItems.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.snippet.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-brand-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-9">
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://i.ibb.co/T3xZf1c/headway-5-Qg-Iuu-Bx-Kw-M-unsplash.jpg"
              alt="Berita Terkini"
              className="w-full h-64 sm:h-80 lg:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-start px-6 sm:px-12 lg:px-24">
              <h1 className="text-white font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl mb-2">
                Berita & Artikel
              </h1>
              <p className="text-white font-inter text-base sm:text-lg lg:text-xl max-w-2xl">
                Ikuti perkembangan terbaru seputar pemilu, demokrasi, dan isu kebijakan publik di Indonesia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar under Hero */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-9 -mt-12 mb-8">
        <input
          type="text"
          placeholder="Cari berita..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 rounded-full border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-edem-purple focus:border-transparent transition"
        />
      </div>

      {/* News Grid */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-9 pb-16">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-700 mt-12">Tidak ada berita yang cocok.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item) => (
              <article
                key={item.id.toString()}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transform hover:-translate-y-1 transition flex flex-col"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-brand-placeholder" />
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="font-poppins font-bold text-2xl mb-3 text-edem-dark line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="font-inter text-base text-gray-600 mb-4 flex-1 line-clamp-3">
                    {item.snippet}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <time>
                      {new Date(Number(item.created) * 1000).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                    <span>ID: {item.id.toString()}</span>
                  </div>
                  <Link
                    to={`/berita/${item.id.toString()}`}
                    className="mt-auto inline-block bg-edem-purple text-white font-poppins font-bold text-lg py-2 px-4 rounded-lg hover:bg-opacity-90 transition text-center"
                  >
                    Baca Selengkapnya
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer className="mt-16" />
    </div>
  );
}
