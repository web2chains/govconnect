import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/AdminDashboard/DashboardLayout";
import { votingapp_backend } from "../../../declarations/votingapp_backend";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function AdminAddNews() {
  const [newsItems, setNewsItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [snippet, setSnippet] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      const all = await votingapp_backend.getAllNews();
      setNewsItems(all);
    } catch (err) {
      console.error("Gagal mengambil berita:", err);
    }
  }

  async function uploadToPinata(file) {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const form = new FormData();
    form.append("file", file);
    form.append("pinataMetadata", JSON.stringify({ name: `news-${Date.now()}` }));

    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: form,
    });
    if (!res.ok) throw new Error("Upload ke Pinata gagal.");
    const { IpfsHash } = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
  }

  function openAddModal() {
    setEditingId(null);
    setTitle("");
    setSnippet("");
    setContent("");
    setImageFile(null);
    setPreviewUrl("");
    setStatus("");
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingId(item.id.toString());
    setTitle(item.title);
    setSnippet(item.snippet);
    setContent(item.content);
    setPreviewUrl(item.imageUrl);
    setImageFile(null);
    setStatus("");
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      let imageUrl = previewUrl;
      if (imageFile) {
        setStatus("Mengunggah gambar…");
        imageUrl = await uploadToPinata(imageFile);
      }
      setStatus(editingId ? "Memperbarui berita…" : "Menyimpan berita…");
      let res;
      if (editingId) {
        res = await votingapp_backend.updateNews(
          BigInt(editingId),
          [title],
          [snippet],
          [content],
          [imageUrl]
        );
      } else {
        res = await votingapp_backend.addNews(title, snippet, content, imageUrl);
      }
      setStatus(res);
      await fetchNews();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setStatus("Gagal: " + err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus berita ini?")) return;
    try {
      await votingapp_backend.deleteNews(BigInt(id));
      await fetchNews();
    } catch (err) {
      console.error("Gagal menghapus:", err);
      alert("Gagal menghapus berita.");
    }
  }

  const filteredNews = newsItems.filter((item) =>
  item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.snippet.toLowerCase().includes(searchQuery.toLowerCase())
);


  return (
    <DashboardLayout>
      <div className="p-8 font-poppins">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
  <h1 className="text-3xl font-bold text-gray-800">Kelola Berita</h1>
  <div className="flex gap-4 w-full sm:w-auto">
    <input
      type="text"
      placeholder="Cari judul atau ringkasan..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-64"
    />
    <button
      onClick={openAddModal}
      className="px-4 py-2 bg-edem-purple text-white rounded hover:bg-opacity-90 transition"
    >
      + Tambah Berita
    </button>
  </div>
</div>

        {newsItems.length === 0 ? (
  <p className="text-gray-600">Belum ada berita.</p>
) : filteredNews.length === 0 ? (
  <p className="text-gray-500 italic">Tidak ada hasil untuk pencarian.</p>
) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems
  .filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .map((item) => (
              <div key={item.id.toString()} className="bg-white shadow rounded-2xl overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(Number(item.created) * 1000).toLocaleDateString("id-ID")}
                  </p>
                  <p className="text-gray-700 text-sm mb-4">{item.snippet}</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id.toString())}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Tambah/Edit Berita */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? "Edit Berita" : "Tambah Berita Baru"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Judul"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border rounded p-2"
                />
                <textarea
                  placeholder="Ringkasan"
                  value={snippet}
                  onChange={(e) => setSnippet(e.target.value)}
                  rows="2"
                  required
                  className="w-full border rounded p-2"
                />
                <div style={{ marginBottom: '4rem' }}>
                  <label className="block mb-1">Isi Lengkap</label>
                  <ReactQuill
                    value={content}
                    onChange={setContent}
                    placeholder="Tulis isi berita lengkap di sini..."
                    className="h-64 mb-4"
                  />
                </div>
                <div>
                  <label className="block mb-1">Gambar Berita</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setImageFile(f);
                      if (f) setPreviewUrl(URL.createObjectURL(f));
                    }}
                    className="w-full mb-2"
                  />
                  {previewUrl && (
                    <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-edem-purple text-white rounded hover:bg-opacity-90 transition"
                  >
                    {editingId ? "Update" : "Simpan"}
                  </button>
                </div>
                {status && <p className="text-sm text-gray-600 mt-2">{status}</p>}
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
