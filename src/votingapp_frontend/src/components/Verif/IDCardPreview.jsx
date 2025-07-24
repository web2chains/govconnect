import React from "react";
import { User } from "lucide-react";

export default function IDCardPreview({ profile }) {
  if (!profile) return null;

  return (
    <div className="w-full max-w-[478px] min-h-[320px] bg-[#CFE8FF] rounded-2xl relative overflow-hidden shadow-lg p-4 border border-blue-400">
      {/* Header */}
      <div className="text-center pt-3 mb-2">
        <div className="text-[#1E3A8A] font-bold text-sm font-poppins tracking-wider">
          PROVINSI {profile.provinsi?.toUpperCase()}
        </div>
        <div className="text-[#1E3A8A] font-bold text-sm font-poppins mt-1 tracking-wider">
          {profile.kota?.toUpperCase()}
        </div>
      </div>

      {/* Profile Picture */}
      <div className="absolute right-[20px] top-[70px] w-[109px] h-[129px] bg-white border border-blue-300 flex items-center justify-center">
        <User className="w-20 h-20 text-blue-600" fill="currentColor" />
      </div>

      {/* Profile Data */}
      <div className="pl-[10px] pr-[130px] pt-1 text-[10px] font-poppins text-blue-900 font-semibold space-y-1 leading-snug">
        <div className="text-[#1E3A8A] font-bold text-sm font-poppins tracking-wider">NIK: {profile.nik}</div>
        <div>Nama Lengkap: {profile.fullName}</div>
        <div>Tempat/Tgl Lahir: {profile.tempatLahir}, {profile.tanggalLahir}</div>
        <div>Jenis Kelamin: {profile.jenisKelamin}</div>
        <div>Alamat: {profile.address}</div>
        <div className="ml-2">RT/RW: {profile.rtRw}</div>
        <div className="ml-2">Kel/Desa: {profile.desaKelurahan}</div>
        <div className="ml-2">Kecamatan: {profile.kecamatan}</div>
        <div className="pt-1">Agama: {profile.agama}</div>
        <div>Status Perkawinan: {profile.statusPerkawinan}</div>
        <div>Pekerjaan: {profile.pekerjaan}</div>
        <div>Kewarganegaraan: {profile.kewarganegaraan}</div>
        <div>Berlaku Hingga: {profile.berlakuHingga}</div>
      </div>
    </div>
  );
}
