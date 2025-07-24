import wilayah from "./wilayah.json";

function parseNik(nik) {
  if (
    nik.length !== 16 ||
    !wilayah.provinsi[nik.slice(0, 2)] ||
    !wilayah.kabkot[nik.slice(0, 4)] ||
    !wilayah.kecamatan[nik.slice(0, 6)]
  ) {
    return null;
  }

  const provCode = nik.slice(0, 2);
  const day = parseInt(nik.slice(6, 8));
  const month = parseInt(nik.slice(8, 10));
  const year2 = parseInt(nik.slice(10, 12));

  let gender = "LAKI-LAKI";
  let dayCorrected = day;
  if (day > 40) {
    gender = "PEREMPUAN";
    dayCorrected -= 40;
  }

  const now = new Date();
  const fullYear = year2 > now.getFullYear() % 100 ? 1900 + year2 : 2000 + year2;
  const birthdate = new Date(fullYear, month - 1, dayCorrected);

  const birthStr = birthdate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const usia = now.getFullYear() - fullYear - (
    now.getMonth() < birthdate.getMonth() ||
    (now.getMonth() === birthdate.getMonth() && now.getDate() < birthdate.getDate()) ? 1 : 0
  );

  return {
    lahir: birthStr,
    provinsi: wilayah.provinsi[provCode],
    kelamin: gender,
    usia: `${usia} Tahun`
  };
}

async function getSidalihData(nik) {
  const response = await fetch("http://localhost:3001/api/validate-nik", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nik }),
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil data dari proxy");
  }

  const json = await response.json();
  return json;
}

function normalize(str) {
  return str?.toLowerCase().trim().replace(/\s+/g, "");
}

function convertToLocaleTanggalLahir(tanggalLahir) {
  if (!tanggalLahir || typeof tanggalLahir !== "string") return "";

  const [dd, mm, yyyy] = tanggalLahir.split("-");
  const dateObj = new Date(`${yyyy}-${mm}-${dd}`);
  return dateObj.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}


export async function validateNIKwithSIDALIH(nik, form) {
  try {
    const sidalihData = await getSidalihData(nik);
    if (!sidalihData) {
      return { success: false, reason: "NIK tidak ditemukan di SIDALIH" };
    }

    const parsedNIK = parseNik(nik);
    if (!parsedNIK) {
      return { success: false, reason: "Format NIK tidak valid" };
    }

    const fieldCompare = {
      nama: normalize(form.fullName) === normalize(sidalihData.nama),
      kabupaten: normalize(form.kota) === normalize(sidalihData.kabupaten),
      kecamatan: normalize(form.kecamatan) === normalize(sidalihData.kecamatan),
      kelurahan: normalize(form.desaKelurahan) === normalize(sidalihData.kelurahan),
      tanggalLahir: normalize(convertToLocaleTanggalLahir(form.tanggalLahir)) === normalize(parsedNIK.lahir),
    };

    const allMatch = Object.values(fieldCompare).every(Boolean);

    return {
      success: allMatch,
      details: {
        nik,
        parsedNIK,
        sidalihData,
        fieldCompare
      }
    };
  } catch (e) {
    return { success: false, reason: e.message };
  }
}