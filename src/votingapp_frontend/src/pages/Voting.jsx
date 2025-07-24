import React, { useState, useEffect } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/VoterDashboard/Navigation";
import Footer from "../components/LandingPage/Footer";
import { votingapp_backend } from "../../../declarations/votingapp_backend";
import Swal from 'sweetalert2';

const CATEGORY_OPTIONS = [
  "Presiden & Wakil Presiden",
  "Gubernur",
  "Walikota / Bupati",
  "DPR",
  "DPD",
];

function CountdownTimer({ endTime }) {
  const [time, setTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    centiseconds: 0,
  });

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const diffMs = endTime * 1000 - now;

      if (diffMs <= 0) {
        clearInterval(timer);
        setTime({
          hours: 0,
          minutes: 0,
          seconds: 0,
          centiseconds: 0,
        });
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const centiseconds = Math.floor((diffMs % 1000) / 10);

      setTime({ hours, minutes, seconds, centiseconds });
    };

    calculateTimeLeft(); // initial call

    const timer = setInterval(calculateTimeLeft, 10);
    return () => clearInterval(timer);
  }, [endTime]);

  const format = (n) => String(n).padStart(2, "0");

  return (
    <section className="container mx-auto px-4 lg:px-16">
      <div className="relative max-w-[1313px] h-[320px] border border-black rounded-[15px] overflow-hidden mx-auto">
        <div className="absolute right-0 top-0 w-[400px] h-full bg-demokrasi-gray rounded-l-[15px]" />
        <div className="relative h-full flex">
          <div className="flex-1 flex flex-col justify-center px-8 md:px-16">
            <h2 className="font-poppins font-bold text-[28px] md:text-[38px] text-black mb-6">
              Countdown Demokrasi
            </h2>
            <div className="font-poppins font-bold text-[45px] md:text-[60px] text-black leading-none">
              {format(time.hours)}:{format(time.minutes)}:{format(time.seconds)}:
              {format(time.centiseconds)}
            </div>
          </div>
          <div className="w-[400px] hidden md:flex items-center justify-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/09c5d8e47e9f9fe37d47dc299c671bc44d99d12a?width=884"
              alt="Voting Box"
              className="w-[200px] h-[200px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function VotingCard({ number, title, imageUrl, partai, hasVoted, onVote, showPartai }) {
  return (
    <div className="w-full max-w-[445px] mx-auto">
      <div className="relative w-full h-full border border-black rounded-2xl bg-white overflow-hidden flex flex-col shadow-lg">
        {/* Nomor Urut */}
        <div className="absolute left-4 top-4 z-10">
          <span className="font-poppins font-bold text-[40px] text-black leading-none">
            {number}
          </span>
        </div>

        {/* Gambar */}
        {imageUrl ? (
          <img
  src={imageUrl}
  alt={title}
  className="w-full h-full object-cover object-center"
/>
        ) : (
          <div className="w-full h-[288px] bg-democracy-placeholder rounded-t-2xl" />
        )}

        {/* Info Kandidat */}
        <div className="px-6 mt-4 mb-2">
          <h3 className="font-poppins font-bold text-2xl lg:text-3xl text-black leading-tight">
            {title}
          </h3>
          {showPartai && (
        <p className="font-inter text-base lg:text-lg text-gray-700 mt-1">
          {partai || "Tanpa Partai"}
        </p>
      )}
        </div>

        <div className="flex-grow" />

        {/* Tombol */}
        <div className="px-6 pb-6">
          {hasVoted ? (
            <div className="w-full h-[78px] bg-gray-300 rounded-2xl flex items-center justify-center font-poppins font-bold text-xl lg:text-2xl text-gray-600 shadow">
              Selesai Memilih
            </div>
          ) : (
            <button
              onClick={onVote}
              className="w-full bg-edem-purple text-white font-poppins font-bold text-xl px-8 py-4 rounded-[15px] hover:bg-opacity-90 transition-colors"
            >
              Coblos Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Voting() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [elections, setElections] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function init() {
      const auth = await AuthClient.create();
      if (!(await auth.isAuthenticated())) return navigate("/login");
      const me = await votingapp_backend.getMyProfile();
      if (me && Array.isArray(me) && me.length) {
        setProfile(me[0]);
      }
      setLoading(false);
    }
    init();
  }, [navigate]);

  // 2) load all elections
  useEffect(() => {
    votingapp_backend.getElections().then(setElections);
  }, []);

  // 3) whenever category or elections or profile changes, filter:
  useEffect(() => {
    if (!profile) return setFiltered([]);
    const byCat = category
      ? elections.filter((e) => e.category === category)
      : [];
    // then by region: only show if admin left region blank, or matches your provinsi/kota
    const byRegion = byCat.filter((e) => {
      const sameProv =
        !e.provinsi || e.provinsi === profile.provinsi;
      const sameCity =
        !e.kota || e.kota === profile.kota;
      return sameProv && sameCity;
    });
    setFiltered(byRegion);
    setSelectedId("");
    setCandidates([]);
    setHasVoted(false);
    setEndTime(null);
  }, [category, elections, profile]);

  // 4) Saat pemilihan dipilih, load kandidat + status + timer
  useEffect(() => {
    if (!selectedId) return;
    const el = elections.find((e) => e.id.toString() === selectedId);
    if (el?.endTime) setEndTime(Number(el.endTime));
    fetchCandidates();
    fetchVoteStatus();
    const iv = setInterval(() => {
      fetchCandidates();
      fetchVoteStatus();
    }, 5000);
    return () => clearInterval(iv);
  }, [selectedId, elections]);

  async function fetchCandidates() {
    const list = await votingapp_backend.getCandidates(BigInt(selectedId));
    setCandidates(list.sort((a, b) => (a.id > b.id ? 1 : -1)));
  }

  async function fetchVoteStatus() {
    const res = await votingapp_backend.getElectionResults(BigInt(selectedId));
    const total = res.reduce((acc, [, v]) => acc + Number(v), 0);
    setHasVoted(total > 0);
  }

  async function castVote(cid) {
  const election = elections.find((e) => e.id.toString() === selectedId);

  if (!election || election.isOpen == false) {
    await Swal.fire({
      title: "Pemilihan Belum Dibuka",
      text: "Kamu belum bisa memilih sekarang. Silakan tunggu waktu yang ditentukan.",
      icon: "info",
      confirmButtonText: "Oke, Mengerti",
      confirmButtonColor: "#6366F1",
      customClass: {
      confirmButton:
        "w-full sm:w-auto bg-yellow-400 text-black text-lg font-bold px-6 py-3 rounded-2xl shadow hover:bg-yellow-500 transition duration-300 ease-in-out"
    },
    });
    return;
    return;
  }

  // Tampilkan konfirmasi
  const result = await Swal.fire({
    title: "Apakah Kamu Yakin Memilih Pilihan Ini?",
    text: "Cek kembali pilihanmu sebelum memilih.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Saya Yakin!",
    cancelButtonText: "Saya Cek Kembali",
    buttonsStyling: false,
    customClass: {
      confirmButton:
        "w-full sm:w-auto bg-yellow-400 text-black text-lg font-bold px-6 py-3 rounded-2xl shadow hover:bg-yellow-500 transition duration-300 ease-in-out",
      cancelButton:
        "w-full sm:w-auto bg-white text-gray-800 text-lg font-semibold px-6 py-3 rounded-2xl border border-gray-300 hover:bg-gray-100 transition duration-300 ease-in-out mt-2 sm:mt-0 sm:ml-2",
    },
  });

  if (result.isConfirmed) {
    await votingapp_backend.castVote(BigInt(selectedId), cid);
    setHasVoted(true);
    fetchCandidates();
    fetchVoteStatus();

    await Swal.fire({
      title: "Berhasil memilih!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  }
}

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-bold text-edem-dark">
        ⏳ Memuat...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-edem-gray-light">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">
              Profil Belum Lengkap
            </h2>
            <p className="mb-6 text-gray-700">
              Silakan lengkapi data profil untuk dapat memilih.
            </p>
            <button
              onClick={() => navigate("/voter-dashboard/verifikasi-identitas")}
              className="w-full bg-edem-purple text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition"
            >
              Lengkapi Profil
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-edem-gray-light">
      <Navigation />
      <main className="px-4 md:px-8 lg:px-16 py-8 space-y-8 max-w-[1440px] mx-auto">
        {/* Pilih Kategori */}
        <section className="bg-cream p-6 rounded-lg shadow">
          <h2 className="font-poppins text-xl font-bold mb-4">
            Pilih Kategori
          </h2>
          <select
            className="w-full p-3 border rounded-lg focus:ring-edem-purple focus:border-edem-purple"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">-- Pilih Kategori --</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </section>

        {/* Pilih Pemilihan */}
        {filtered.length > 0 && (
          <section className="bg-cream p-6 rounded-lg shadow">
            <h2 className="font-poppins text-xl font-bold mb-4">
              Pilih Pemilihan ({category})
            </h2>
            <select
              className="w-full p-3 border rounded-lg focus:ring-edem-purple focus:border-edem-purple"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">-- Pilih Pemilihan --</option>
              {filtered.map((e) => (
                <option key={e.id.toString()} value={e.id.toString()}>
                  {e.title}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Countdown */}
        <CountdownTimer endTime={endTime} />

        {/* Candidate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {candidates.map((c, i) => (
  <VotingCard
    key={c.id}
    number={(i + 1).toString()}
    title={c.name}
    imageUrl={c.imageUrl}
    partai={c.partai}
    hasVoted={hasVoted}
    onVote={() => castVote(c.id)}
    showPartai={category === "DPR" || category === "DPD"}
  />
))}

        </div>
      </main>
      <Footer />
    </div>
  );
}
