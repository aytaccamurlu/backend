// index.js
const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, "db.json");

app.use(cors());
app.use(express.json());

// JSON dosyasını oku
const readDB = async () => {
  const data = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(data);
};

// JSON dosyasına yaz
const writeDB = async (data) => {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

// TÜM PERSONELLERİ GETİR
app.get("/personeller", async (req, res) => {
  const db = await readDB();
  res.json(db.personeller || []);
});

// PERSONEL EKLE
app.post("/personeller", async (req, res) => {
  const { isim, departman, girisSaati, cikisSaati } = req.body;
  if (!isim || !departman) {
    return res.status(400).json({ error: "İsim ve departman gerekli" });
  }

  const db = await readDB();
  const newPersonel = {
    id: Date.now(), // eşsiz id üret
    isim,
    departman,
    girisSaati,
    cikisSaati,
  };

  db.personeller = db.personeller || [];
  db.personeller.push(newPersonel);
  await writeDB(db);
  console.log("POST:", newPersonel);
  res.status(201).json(newPersonel);
});

// PERSONEL SİL
app.delete("/personeller/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const db = await readDB();
  const before = db.personeller?.length || 0;
  db.personeller = db.personeller.filter((p) => p.id !== id);
  const after = db.personeller.length;
  await writeDB(db);
  console.log(`DELETE: removed item id=${id}, total ${before}→${after}`);
  res.json({ success: true });
});

// PERSONEL GÜNCELLE
app.put("/personeller/:id", async (req, res) => {
  const id = Number(req.params.id);
  const updatedData = req.body;
  const db = await readDB();

  db.personeller = db.personeller.map((p) =>
    p.id === id ? { ...p, ...updatedData } : p
  );
  await writeDB(db);

  const updatedPersonel = db.personeller.find((p) => p.id === id);
  console.log("PUT:", updatedPersonel);
  res.json(updatedPersonel);
});

app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);
