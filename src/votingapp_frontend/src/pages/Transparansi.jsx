import React, { useState, useEffect } from "react";
import Navigation from "../components/LandingPage/Navigation";
import Footer from "../components/LandingPage/Footer";
import { votingapp_backend } from "../../../declarations/votingapp_backend";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a28bd4",
];

export default function Transparansi() {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [resultsData, setResultsData] = useState({});
  const [regionData, setRegionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const categories = Array.from(new Set(elections.map((e) => e.category)));

  useEffect(() => {
    (async () => {
      const allElections = await votingapp_backend.getElections();
      setElections(allElections);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedElectionId) return;

    (async () => {
      const res = await votingapp_backend.getElectionResults(Number(selectedElectionId));
      const formattedResults = res.map(([name, votes, percent]) => ({
        name,
        votes: Number(votes),
        percent: Number(percent),
      }));
      setResultsData((prev) => ({ ...prev, [selectedElectionId]: formattedResults }));

      const region = await votingapp_backend.getResultsByRegion(Number(selectedElectionId));
      region.byProvinsi = region.byProvinsi.map(([region, fracs]) => [region, fracs.map(Number)]);
      region.byKota = region.byKota.map(([p, k, fracs]) => [p, k, fracs.map(Number)]);
      region.byKecamatan = region.byKecamatan.map(([p, k, kc, fracs]) => [p, k, kc, fracs.map(Number)]);
      region.byKelurahanDesa = region.byKelurahanDesa.map(([p, k, kc, ds, fracs]) => [p, k, kc, ds, fracs.map(Number)]);
      setRegionData((prev) => ({ ...prev, [selectedElectionId]: region }));
    })();
  }, [selectedElectionId]);

  const chartData = resultsData[selectedElectionId] || [];
  const region = regionData[selectedElectionId] || {};

  return (
    <div className="min-h-screen bg-edem-gray-light">
      <Navigation />
      <main className="pt-[100px] px-4 lg:px-16 pb-32 max-w-[1200px] mx-auto">
        <h1 className="text-4xl font-bold font-poppins text-center text-edem-dark mb-10">
          Transparansi & Statistik Pemilihan
        </h1>

        {loading ? (
          <p className="text-center font-poppins text-xl">Memuat data...</p>
        ) : (
          <>
            {/* KATEGORI SELECT */}
<div className="mb-6">
  <label className="block mb-2 font-semibold text-edem-dark">
    Pilih Kategori
  </label>
  <select
    value={selectedCategory}
    onChange={(e) => {
      setSelectedCategory(e.target.value);
      setSelectedElectionId("");
    }}
    className="w-full p-3 border border-gray-300 rounded-lg"
  >
    <option value="">-- Pilih Kategori --</option>
    {categories.map((cat) => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </select>
</div>

{/* ELECTION SELECT */}
{selectedCategory && (
  <div className="mb-10">
    <label className="block mb-2 font-semibold text-edem-dark">
      Pilih Pemilihan
    </label>
    <select
      value={selectedElectionId}
      onChange={(e) => setSelectedElectionId(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg"
    >
      <option value="">-- Pilih Pemilihan --</option>
      {elections
        .filter((el) => el.category === selectedCategory)
        .map((el) => (
          <option key={el.id.toString()} value={el.id.toString()}>
            {el.title}
          </option>
        ))}
    </select>
  </div>
)}


            {selectedElectionId && (
              <>
                <section className="bg-white border border-gray-300 rounded-lg p-6 shadow mb-10">
                  <h2 className="font-poppins text-2xl font-bold mb-4">
                    Hasil Total Pemilihan
                  </h2>

                  <ul className="space-y-2 mb-6">
                    {chartData.map((c, idx) => (
                      <li key={idx} className="font-inter text-edem-dark">
                        <strong>{c.name}</strong>: {c.votes} suara ({c.percent.toFixed(1)}%)
                      </li>
                    ))}
                  </ul>

                  <div className="h-[400px]">
  <ResponsiveContainer width="100%" height="100%">
    {["DPR", "DPD"].includes(selectedCategory) ? (
      <BarChart data={chartData}>
        <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="votes" fill="#8884d8">
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    ) : (
      <PieChart>
        <Pie
          data={chartData}
          dataKey="percent"
          nameKey="name"
          outerRadius={100}
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${percent.toFixed(1)}%`
          }
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    )}
  </ResponsiveContainer>
</div>

                </section>

                {/* Region Filter */}
                <RegionSelector
                  regionData={region}
                  candidates={chartData}
                />
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function RegionSelector({ regionData = {}, candidates = [] }) {
  const [level, setLevel] = useState("provinsi");
  const [provinsi, setProvinsi] = useState("");
  const [kota, setKota] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [desa, setDesa] = useState("");

  const provOptions = regionData.byProvinsi || [];
  const kotaOptions = (regionData.byKota || []).filter(([p]) => p === provinsi);
  const kecamOptions = (regionData.byKecamatan || []).filter(([p, k]) => p === provinsi && k === kota);
  const desaOptions = (regionData.byKelurahanDesa || []).filter(([p, k, kc]) => p === provinsi && k === kota && kc === kecamatan);

  const renderSelectInput = () => {
    switch (level) {
      case "provinsi":
        return (
          <select
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={provinsi}
            onChange={(e) => setProvinsi(e.target.value)}
          >
            <option value="">Pilih Provinsi</option>
            {provOptions.map(([p]) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        );
      case "kota":
        return (
          <>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={provinsi}
              onChange={(e) => {
                setProvinsi(e.target.value);
                setKota("");
              }}
            >
              <option value="">Pilih Provinsi</option>
              {provOptions.map(([p]) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={kota}
              onChange={(e) => setKota(e.target.value)}
              disabled={!provinsi}
            >
              <option value="">Pilih Kota</option>
              {kotaOptions.map(([_, k]) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </>
        );
      case "kecamatan":
        return (
          <>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={provinsi}
              onChange={(e) => {
                setProvinsi(e.target.value);
                setKota(""); setKecamatan("");
              }}
            >
              <option value="">Pilih Provinsi</option>
              {provOptions.map(([p]) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={kota}
              onChange={(e) => {
                setKota(e.target.value);
                setKecamatan("");
              }}
              disabled={!provinsi}
            >
              <option value="">Pilih Kota</option>
              {kotaOptions.map(([_, k]) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
              disabled={!kota}
            >
              <option value="">Pilih Kecamatan</option>
              {kecamOptions.map(([_, __, kc]) => (
                <option key={kc} value={kc}>{kc}</option>
              ))}
            </select>
          </>
        );
      case "desa":
        return (
          <>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={provinsi}
              onChange={(e) => {
                setProvinsi(e.target.value);
                setKota(""); setKecamatan(""); setDesa("");
              }}
            >
              <option value="">Pilih Provinsi</option>
              {provOptions.map(([p]) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={kota}
              onChange={(e) => {
                setKota(e.target.value);
                setKecamatan(""); setDesa("");
              }}
              disabled={!provinsi}
            >
              <option value="">Pilih Kota</option>
              {kotaOptions.map(([_, k]) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={kecamatan}
              onChange={(e) => {
                setKecamatan(e.target.value);
                setDesa("");
              }}
              disabled={!kota}
            >
              <option value="">Pilih Kecamatan</option>
              {kecamOptions.map(([_, __, kc]) => (
                <option key={kc} value={kc}>{kc}</option>
              ))}
            </select>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={desa}
              onChange={(e) => setDesa(e.target.value)}
              disabled={!kecamatan}
            >
              <option value="">Pilih Kelurahan/Desa</option>
              {desaOptions.map(([_, __, ___, d]) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </>
        );
      default:
        return null;
    }
  };

  const getSelectedData = () => {
    switch (level) {
      case "desa":
        return desaOptions.find(([_, __, ___, d]) => d === desa);
      case "kecamatan":
        return kecamOptions.find(([_, __, kc]) => kc === kecamatan);
      case "kota":
        return kotaOptions.find(([_, k]) => k === kota);
      case "provinsi":
        return provOptions.find(([p]) => p === provinsi);
      default:
        return null;
    }
  };

  const selected = getSelectedData();
  const wilayahLabel = {
    provinsi: provinsi,
    kota: `${provinsi} / ${kota}`,
    kecamatan: `${provinsi} / ${kota} / ${kecamatan}`,
    desa: `${provinsi} / ${kota} / ${kecamatan} / ${desa}`,
  }[level];

  const fracs = selected?.[selected.length - 1] || [];

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold font-poppins mb-6">Lihat Hasil Berdasarkan Wilayah</h3>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["provinsi", "kota", "kecamatan", "desa"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            className={`px-4 py-2 rounded-lg border ${
              level === lvl
                ? "bg-edem-purple text-white"
                : "bg-white border-edem-purple text-edem-purple"
            } font-semibold transition`}
          >
            {lvl === "desa" ? "Kelurahan" : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {renderSelectInput()}
      </div>

      {selected && (
        <div className="overflow-x-auto mt-6">
          <h4 className="font-semibold mb-2">Hasil Wilayah: {wilayahLabel}</h4>
          <table className="w-full table-auto border border-gray-300 text-sm font-inter">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Wilayah</th>
                {candidates.map((c, i) => (
                  <th key={i} className="border px-3 py-2 text-left">{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2">{wilayahLabel}</td>
                {fracs.map((pct, i) => (
                  <td key={i} className="border px-3 py-2">{pct.toFixed(1)}%</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}