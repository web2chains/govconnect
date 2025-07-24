import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/AdminDashboard/DashboardLayout";
import { StatsCard } from "../components/AdminDashboard/StatsCard";
import ElectionSection from "../components/AdminDashboard/ElectionSection";
import { votingapp_backend } from "../../../declarations/votingapp_backend";
import { AuthClient } from "@dfinity/auth-client";
import { useNavigate } from "react-router-dom";
import GovConnectLoader from "../GovConnectLoader";

export default function KelolaPemilihan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [elections, setElections] = useState([]);
  const [candidatesMap, setCandidatesMap] = useState({});
  const [candidateStats, setCandidateStats] = useState([]);
  const [voterStats, setVoterStats] = useState([]);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState("");
  const [form, setForm] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  const CATEGORIES = [
    "Presiden & Wakil Presiden",
    "Gubernur",
    "Walikota / Bupati",
    "DPR",
    "DPD",
  ];
  const PARTIES = [
    "Partai Demokrasi Indonesia Perjuangan (PDI-P)",
    "Partai Gerindra",
    "Partai Golkar",
    "Partai NasDem",
    "Partai Kebangkitan Bangsa (PKB)",
    "Partai Keadilan Sejahtera (PKS)",
    "Partai Amanat Nasional (PAN)",
    "Partai Persatuan Pembangunan (PPP)",
    "Partai Demokrat",
    "Independen",
  ];

  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

  useEffect(() => {
    (async () => {
      const auth = await AuthClient.create();
      if (!(await auth.isAuthenticated())) return navigate("/login");
      const id = auth.getIdentity().getPrincipal();
      setIsAdmin(await votingapp_backend.isAdmin(id));
      await reloadAll();
      setLoading(false);
    })();
  }, [navigate]);

  async function reloadAll() {
    const ev = await votingapp_backend.getElections();
    setElections(ev);
    const map = {};
    for (const e of ev) {
      map[e.id.toString()] = await votingapp_backend.getCandidates(e.id);
    }
    setCandidatesMap(map);
    setCandidateStats(await votingapp_backend.getCandidateCountPerCategory());
    setVoterStats(await votingapp_backend.getVoterCountPerCategory());
  }

  async function uploadToPinata(file) {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const fd = new FormData();
    fd.append("file", file);
    fd.append("pinataMetadata", JSON.stringify({ name: `cand-${Date.now()}` }));
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: fd,
    });
    if (!res.ok) throw new Error("Pinata upload failed");
    const { IpfsHash } = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
  }

  function openModal(type, data = {}) {
    setForm({ ...data });
    setPreviewUrl(data.imageUrl || null);
    setModal(type);
  }
  function closeModal() {
    setForm({});
    setPreviewUrl(null);
    setModal("");
  }

  async function handleSave() {
  if (!isAdmin) return alert("Admin only");

  try {
    setSaving(true);

    if (modal === "election") {
      if (form.id) {
        await votingapp_backend.updateElection(
          BigInt(form.id),
          [form.title],
          [form.category],
          form.provinsi ? [form.provinsi] : [],
          form.kota ? [form.kota] : []
        );
      } else {
        await votingapp_backend.CreateElection(
          form.title,
          form.category,
          form.provinsi || "",
          form.kota || ""
        );
      }
    }

    if (modal === "candidate") {
      let imageUrl = form.imageUrl || "";
      if (form.imageFile) imageUrl = await uploadToPinata(form.imageFile);
      if (form.id) {
        await votingapp_backend.updateCandidate(
          BigInt(form.id),
          [form.name],
          imageUrl ? [imageUrl] : [],
          [form.partai || ""]
        );
      } else {
        await votingapp_backend.addCandidate(
          BigInt(form.electionId),
          form.name,
          imageUrl,
          form.partai || ""
        );
      }
    }

    if (modal === "open") {
      await votingapp_backend.openVote(
        BigInt(form.electionId),
        BigInt(parseFloat(form.duration) * 3600)
      );
    }

    await reloadAll();
    closeModal();
  } catch (err) {
    alert("Gagal menyimpan. Silakan coba lagi.");
    console.error(err);
  } finally {
    setSaving(false);
  }
}


  if (loading) return <GovConnectLoader />;

  // Build table rows
  const electionRows = elections.map((e, i) => ({
    no: i + 1,
    name: e.title,
    party: e.category || "—",
    district: e.isOpen ? "Open" : "Closed",
    actions: (
      <>
        <button
          onClick={() =>
            openModal("election", {
              id: e.id,
              title: e.title,
              category: e.category,
              provinsi: e.provinsi,
              kota: e.kota,
            })
          }
          className="px-3 py-1 bg-yellow-400 rounded mr-2"
        >
          Edit
        </button>
        <button
          onClick={async () => {
            if (confirm("Hapus election ini?")) {
              await votingapp_backend.deleteElection(BigInt(e.id));
              await reloadAll();
            }
          }}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Delete
        </button>
      </>
    ),
  }));

  const candidateRows = Object.entries(candidatesMap).flatMap(
    ([eid, list]) =>
      list.map((c, i) => ({
        no: i + 1,
        name: c.name,
        party: c.partai || "—",
        district:
          elections.find((x) => x.id.toString() === eid)?.title || "—",
        actions: (
          <>
            <button
              onClick={() =>
                openModal("candidate", {
                  id: c.id,
                  name: c.name,
                  partai: c.partai,
                  electionId: eid,
                  imageUrl: c.imageUrl,
                })
              }
              className="px-3 py-1 bg-yellow-400 rounded mr-2"
            >
              Edit
            </button>
            <button
              onClick={async () => {
                if (confirm("Hapus kandidat ini?")) {
                  await votingapp_backend.deleteCandidate(BigInt(c.id));
                  await reloadAll();
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Delete
            </button>
          </>
        ),
      }))
  );

  return (
    <DashboardLayout className="space-y-8">
      {/* Manage Elections */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl lg:text-[35px] font-semibold text-black mb-6">Kelola Pemilihan</h2>
        {isAdmin && (
          <button
            onClick={() => openModal("election")}
            className="bg-edem-purple text-white px-4 py-2 rounded"
          >
            + Add Election
          </button>
        )}
      </div>
      <ElectionSection
        title=""
        columns={[
          "No",
          "Election Title",
          "Category",
          "Status"
        ]}
        data={electionRows}
      />

      {/* Manage Candidates */}
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-2xl lg:text-[35px] font-semibold text-black mb-6">Kelola Kandidat</h2>
        {isAdmin && (
          <button
            onClick={() => openModal("candidate")}
            className="bg-edem-purple text-white px-4 py-2 rounded"
          >
            + Add Candidate
          </button>
        )}
      </div>
      <ElectionSection
        title=""
        columns={[
          "No",
          "Candidate Name",
          "Partai",
          "Election",
        ]}
        data={candidateRows}
      />

      {/* Open Voting */}
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-2xl font-semibold">Open Voting</h2>
        {isAdmin && (
          <button
            onClick={() => openModal("open")}
            className="bg-edem-purple text-white px-4 py-2 rounded"
          >
            + Open Voting
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidateStats.map(([cat, cnt]) => {
          const v = voterStats.find(([c]) => c === cat)?.[1] || 0;
          return (
            <StatsCard
              key={cat}
              title={cat}
              value={String(cnt)}
              subtitle={`Voters: ${v}`}
              icon={<></>}
            />
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">
              {modal === "election"
                ? form.id
                  ? "Edit Election"
                  : "Create Election"
                : modal === "candidate"
                ? form.id
                  ? "Edit Candidate"
                  : "Add Candidate"
                : "Open Voting"}
            </h3>

            {/* Election Form */}
            {modal === "election" && (
              <>
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full mb-2 p-2 border rounded"
                  value={form.title || ""}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
                <select
                  className="w-full mb-2 p-2 border rounded"
                  value={form.category || ""}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="">Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Provinsi"
                  className="w-full mb-2 p-2 border rounded"
                  value={form.provinsi || ""}
                  onChange={(e) =>
                    setForm({ ...form, provinsi: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Kota"
                  className="w-full mb-4 p-2 border rounded"
                  value={form.kota || ""}
                  onChange={(e) =>
                    setForm({ ...form, kota: e.target.value })
                  }
                />
              </>
            )}

            {/* Candidate Form */}
            {modal === "candidate" && (
              <>
                <select
                  className="w-full mb-2 p-2 border rounded"
                  value={form.partai || ""}
                  onChange={(e) =>
                    setForm({ ...form, partai: e.target.value })
                  }
                >
                  <option value="">(Optional) Pilih Partai</option>
                  {PARTIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full mb-2 p-2 border rounded"
                  value={form.electionId || ""}
                  onChange={(e) =>
                    setForm({ ...form, electionId: e.target.value })
                  }
                >
                  <option value="">Select Election</option>
                  {elections.map((e) => (
                    <option
                      key={e.id.toString()}
                      value={e.id.toString()}
                    >
                      {e.title}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Candidate Name"
                  className="w-full mb-2 p-2 border rounded"
                  value={form.name || ""}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
                <label className="block mb-1">
                  Candidate Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full mb-2"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setForm({ ...form, imageFile: file });
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                  />
                )}
              </>
            )}

            {/* Open Voting */}
            {modal === "open" && (
              <>
                <select
                  className="w-full mb-2 p-2 border rounded"
                  value={form.electionId || ""}
                  onChange={(e) =>
                    setForm({ ...form, electionId: e.target.value })
                  }
                >
                  <option value="">Select Election</option>
                  {elections
                    .filter((e) => !e.isOpen)
                    .map((e) => (
                      <option
                        key={e.id.toString()}
                        value={e.id.toString()}
                      >
                        {e.title}
                      </option>
                    ))}
                </select>
                <input
                  type="number"
                  min="1"
                  placeholder="Durasi (jam)"
                  className="w-full mb-4 p-2 border rounded"
                  value={form.duration || ""}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                />
              </>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
  onClick={handleSave}
  className="px-4 py-2 bg-edem-purple text-white rounded flex items-center justify-center"
  disabled={saving}
>
  {saving ? (
    <span className="animate-spin rounded-full border-2 border-white border-t-transparent w-4 h-4 mr-2"></span>
  ) : null}
  {saving ? "Saving..." : "Save"}
</button>

            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
