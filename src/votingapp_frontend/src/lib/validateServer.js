import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors());

app.post("/api/validate-nik", async (req, res) => {
  const { nik } = req.body;

  const query = `
    {
      findNikSidalih(nik: "${nik}", wilayah_id: 0, token: "${process.env.TOKEN}") {
        nama
        kabupaten
        kecamatan
        kelurahan
        alamat
        lat
        lon
      }
    }
  `;

  try {
    const response = await fetch("https://cekdptonline.kpu.go.id/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Accept": "application/json",
        "Origin": "https://cekdptonline.kpu.go.id",
        "Referer": "https://cekdptonline.kpu.go.id/",
        "User-Agent": "node-fetch"
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    const data = json?.data?.findNikSidalih;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Proxy Error" });
  }
});

app.listen(3001, () => console.log("Proxy running on port 3001"));
