import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "../components/LandingPage/Navigation";
import Footer from "../components/LandingPage/Footer";
import { votingapp_backend } from "../../../declarations/votingapp_backend";

export default function BeritaDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await votingapp_backend.getAllNews();
        const found = all.find((item) => item.id.toString() === id);
        setNews(found || null);
      } catch (err) {
        console.error("Failed to load news detail:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <Navigation />
        <p className="text-center py-20">Loading...</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <Navigation />
        <p className="text-center py-20 text-red-600">
          Berita dengan ID {id} tidak ditemukan.
        </p>
        <div className="text-center">
          <Link
            to="/berita"
            className="text-edem-purple hover:underline"
          >
            Kembali ke daftar Berita
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navigation />

      <article className="container mx-auto px-4 sm:px-6 lg:px-9 py-12">
        {/* Back link */}
        <Link
          to="/berita"
          className="inline-block mb-6 text-edem-purple hover:underline"
        >
          ← Kembali ke Berita
        </Link>

        {/* Hero / Banner */}
        {news.imageUrl && (
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-64 sm:h-80 lg:h-[500px] object-cover rounded-2xl mb-8 shadow-lg"
          />
        )}

        {/* Title & metadata */}
        <h1 className="font-poppins font-bold text-3xl lg:text-4xl mb-4 text-edem-dark">
          {news.title}
        </h1>
        <div className="text-sm text-gray-500 mb-8 flex items-center gap-4">
          <time dateTime={new Date(Number(news.created) * 1000).toISOString()}>
            {new Date(Number(news.created) * 1000).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>

        {/* Full content from React Quill (HTML) */}
<div
  className="prose max-w-none"
  dangerouslySetInnerHTML={{ __html: news.content }}
></div>

      </article>
      <Footer />
    </div>
  );
}
