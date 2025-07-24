import React, { useState, useEffect } from "react";
import { votingapp_backend } from "../../../../declarations/votingapp_backend";
import { Calendar } from "lucide-react";
import IDCardPreview from "./IDCardPreview";
import { validateNIKwithSIDALIH } from "../../lib/validateNIKwithSIDALIH";

export default function VerificationForm() {
  const [form, setForm] = useState({
    nik: "",
    fullName: "",
    address: "",
    desaKelurahan: "",
    rtRw: "",
    kecamatan: "",
    provinsi: "",
    kota: "",
    tempatLahir: "",
    tanggalLahir: "",
    agama: "",
    jenisKelamin: "",
    pekerjaan: "",
    statusPerkawinan: "",
    berlakuHingga: "Seumur Hidup",
    kewarganegaraan: ""
  });

  const [status, setStatus] = useState("");
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("create"); // create | edit | view

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await votingapp_backend.getMyProfile();
        if (Array.isArray(data) && data.length > 0) {
          setProfile(data[0]);
          setActiveTab("view");
        } else {
          setProfile(null);
          setActiveTab("create");
        }
      } catch (err) {
        console.error("Gagal mengambil profil:", err);
      }
    }
    fetchProfile();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "tanggalLahir") {
      const [y, m, d] = value.split("-");
      setForm({ ...form, [name]: `${d}-${m}-${y}` });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleSubmit(e) {
  e.preventDefault();
  setStatus("Memvalidasi dengan SIDALIH...");

  try {
    const validation = await validateNIKwithSIDALIH(form.nik, form);
    console.log("SIDALIH Result:", validation);

    if (!validation.success) {
      setStatus("Data tidak valid menurut SIDALIH.");
      return;
    }

    const fields = validation.details.fieldCompare;
    if (!fields.nama || !fields.kabupaten || !fields.kecamatan || !fields.kelurahan || !fields.tanggalLahir) {
      setStatus("Beberapa data tidak sesuai SIDALIH.");
      return;
    }

    setStatus("Menyimpan...");
    const res = await votingapp_backend.registerProfile(
      form.nik,
      form.fullName,
      form.address,
      form.desaKelurahan,
      form.rtRw,
      form.kecamatan,
      form.tempatLahir,
      form.provinsi,
      form.kota,
      form.tanggalLahir,
      form.agama,
      form.jenisKelamin,
      form.pekerjaan,
      form.statusPerkawinan,
      form.berlakuHingga,
      form.kewarganegaraan
    );

    setStatus(res);

    const updated = await votingapp_backend.getMyProfile();
    if (Array.isArray(updated) && updated.length > 0) {
      setProfile(updated[0]);
      setActiveTab("view");
    }
  } catch (err) {
    console.error(err);
    setStatus("Gagal menyimpan profil.");
  }
}

  function formatForInputDate(val) {
    if (!val) return "";
    const [d, m, y] = val.split("-");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto bg-edemokrasi-gray min-h-screen">
      {/* Tabs */}
      <div className="flex justify-center pt-8 pb-12">
        <div className="flex">
          {/* View Tab */}
          {profile && (
            <button
              className={`w-[100px] h-[46px] rounded-2xl flex items-center justify-center ${
                activeTab === "view" ? "bg-gray-300" : "border-2 border-gray-300"
              }`}
              onClick={() => setActiveTab("view")}
              type="button"
            >
              <span className="text-black font-bold text-xl font-poppins">Profile</span>
            </button>
          )}

          {/* Edit Profile Tab */}
          {profile && (
            <button
              className={`w-[139px] h-[46px] ml-[22px] rounded-2xl flex items-center justify-center ${
                activeTab === "edit" ? "bg-gray-300" : "border-2 border-gray-300"
              }`}
              onClick={() => {
                setForm(profile);
                setActiveTab("edit");
              }}
              type="button"
            >
              <span className="text-black font-bold text-xl font-poppins">Edit Profile</span>
            </button>
          )}

          {/* Create Profile Tab */}
          {!profile && (
            <button
              className={`w-[160px] h-[46px] ml-[22px] rounded-2xl flex items-center justify-center ${
                activeTab === "create" ? "bg-gray-300" : "border-2 border-gray-300"
              }`}
              onClick={() => setActiveTab("create")}
              type="button"
            >
              <span className="text-black font-bold text-xl font-poppins">Create Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Form for Create or Edit */}
      {(activeTab === "edit" || activeTab === "create") && (
        <form onSubmit={handleSubmit} className="flex gap-8 px-8">
          <div className="flex-1 max-w-[850px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8">
              {[ 
                ["nik", "NIK"],
                ["fullName", "Nama Lengkap"],
                ["address", "Alamat"],
                ["desaKelurahan", "Kelurahan/Desa"],
                ["rtRw", "RT/RW"],
                ["kecamatan", "Kecamatan"],
                ["provinsi", "Provinsi"],
                ["kota", "Kota"],
                ["tempatLahir", "Tempat Lahir"],
                ["tanggalLahir", "Tanggal Lahir", true],
                ["agama", "Agama"],
                ["jenisKelamin", "Jenis Kelamin"],
                ["pekerjaan", "Pekerjaan"],
                ["statusPerkawinan", "Status Perkawinan"],
                ["berlakuHingga", "Berlaku Hingga", false, true],
                ["kewarganegaraan", "Kewarganegaraan"]
              ].map(([key, label, isDate, readOnly]) => (
                <div className="space-y-2" key={key}>
                  <label className="text-edemokrasi-text font-bold text-xl font-poppins">
                    {label}*
                  </label>
                  <div className="relative">
                    <input
                      name={key}
                      value={isDate ? formatForInputDate(form[key]) : form[key]}
                      onChange={handleChange}
                      type={isDate ? "date" : "text"}
                      readOnly={!!readOnly}
                      placeholder={isDate ? "dd-mm-yyyy" : ""}
                      className="w-full h-[60px] border-2 border-edemokrasi-teal rounded-2xl px-4 pr-12 text-edemokrasi-text font-poppins text-lg focus:outline-none focus:border-edemokrasi-purple bg-white"
                    />
                    {isDate && (
                      <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-7 h-7 text-edemokrasi-text" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-12 mb-8">
              <button
                type="submit"
                className="w-[413px] h-[89px] bg-edem-purple rounded-2xl flex items-center justify-center hover:bg-opacity-90 transition-all"
              >
                <span className="text-white font-bold text-xl font-poppins">
                  Simpan Profil
                </span>
              </button>
            </div>

            {status && (
              <p className="text-center text-edemokrasi-text font-poppins text-lg">{status}</p>
            )}
          </div>
        </form>
      )}

      {/* Profile View */}
      {activeTab === "view" && (
        <>
          {profile ? (
            <div className="flex justify-center pt-12 pb-16">
              <IDCardPreview profile={profile} />
            </div>
          ) : (
            <p className="text-center text-edemokrasi-text pt-8">
              Belum ada data profil.
            </p>
          )}
        </>
      )}
    </div>
  );
}
