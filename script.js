/* ===========================================================
   SCRIPT GENERATOR LAPORAN PENAHANAN
   =========================================================== */


/* ========== [1] AUTO UPDATE WAKTU & TANGGAL ========== */
function updateDateTime() {
  let now = new Date();
  let tanggal = now.toLocaleDateString("id-ID");
  let waktu = now.toLocaleTimeString("id-ID");
  document.getElementById("waktuTanggal").value = `${tanggal} ${waktu}`;
}


/* ========== [2] HITUNG TOTAL DENDA & PENJARA ========== */
function hitungTotal() {
  let totalDenda = 0;
  let totalPenjara = 0;

  document.querySelectorAll(".CEKLIS:checked").forEach((checkbox) => {
    totalDenda += parseInt(checkbox.getAttribute("data-denda")) || 0;
    totalPenjara += parseInt(checkbox.getAttribute("data-penjara")) || 0;
  });

  return { totalDenda, totalPenjara };
}


/* ========== [3] BUAT / UPDATE LAPORAN (PAKAI TEMPLATE DEFAULT) ========== */
function updateLaporan() {
  let namaPelaku = document.getElementById("namaPelaku").value;
  let waktuTanggal = document.getElementById("waktuTanggal").value;
  let deskripsiPelanggaran = document.getElementById("deskripsiPelanggaran")?.value || "";
  let namaPetugas = document.getElementById("namaPetugas")?.value || "";
  let divisi = document.getElementById("divisi")?.value || "";
  let jabatan = document.getElementById("jabatan")?.value || "";
  let rekan = document.getElementById("rekan")?.value || "";
  let barangBukti = document.getElementById("barangBukti")?.value || "";

  let ceklis = document.querySelectorAll(".CEKLIS:checked");
  let pasalTerpilih = [];
  ceklis.forEach((item) => {
    let row = item.closest("tr");
    if (row) pasalTerpilih.push(row.cells[0].innerText);
  });

  let { totalDenda, totalPenjara } = hitungTotal();
  let dendaFormatted = totalDenda > 0 ? `$${totalDenda.toLocaleString()}` : "-";
  let hukumanFormatted = totalPenjara > 0 ? `${totalPenjara} Bulan` : "-";
  let pasalFormatted = pasalTerpilih.length > 0 ? pasalTerpilih.join(", ") : "-";

  // 👉 Tambah teks paling atas
  let hasil = `***LAPORAN PENAHANAN : ${namaPetugas || "-"}***

\`\`\`I. Informasi Penahanan:
- Tanggal dan Waktu : ${waktuTanggal}
- Deskripsi Singkat Pelanggaran :
- ${deskripsiPelanggaran}
  
II. Informasi Tersangka
- Nama Tersangka : ${namaPelaku}
- Masa tahanan   : ${hukumanFormatted}
- Pasal          : ${pasalFormatted}
- Denda          : ${dendaFormatted}
- Foto KTP       : (Terlampir dibawah)

III. Identitas Petugas yang Menahan:
- Nama Petugas : ${namaPetugas}
- Divisi       : ${divisi}
- Jabatan      : ${jabatan}
- Rekan        : ${rekan}

IV. Barang Bukti yang Disita:
- Jenis Barang Bukti : ${barangBukti}

Note: Sertakan foto KTP & Barang Bukti\`\`\``;

  document.getElementById("history").innerText = hasil;

  // 👉 Update teks samping kanan
  let laporanSamping = document.getElementById("laporanSamping");
  if (laporanSamping) {
    laporanSamping.innerText = `LAPORAN PENAHANAN : ${namaPetugas || "-"}`;
  }
}



/* ========== [4] SUBMIT FORM ========== */
function submitForm() {
  updateLaporan();
}


/* ========== [5] SALIN LAPORAN ========== */
function salinLaporan() {
  let laporanText = document.getElementById("history").innerText;
  navigator.clipboard.writeText(laporanText).then(() => {
    alert("✅ Laporan berhasil disalin!");
  });
}


/* ========== [6] RESET FORM / HALAMAN ========== */
// --- ganti fungsi refreshPage() dengan ini ---
function refreshPage() {
  // id input yang ingin DITAHAN (jika mau tetap tersimpan) -> ubah jika mau di-clear juga
  const preserve = ["namaPetugas", "divisi", "jabatan", "rekan"];

  // reset input text kecuali yang preserved
  document.querySelectorAll('input[type="text"]').forEach(input => {
    if (!preserve.includes(input.id)) input.value = "";
  });

  // reset file inputs
  document.querySelectorAll('input[type="file"]').forEach(input => {
    try { input.value = ""; } catch(e) { /* some browsers may restrict, ignore */ }
  });

  // uncheck semua pasal
  document.querySelectorAll('.CEKLIS').forEach(cb => cb.checked = false);

  // kosongkan area hasil & samping
  const historyEl = document.getElementById("history");
  const sampingEl = document.getElementById("laporanSamping");
  if (historyEl) historyEl.innerText = "";
  if (sampingEl) sampingEl.innerText = "";

  // kosongkan info file
  const fotoInfo = document.getElementById("fotoInfo");
  const foto2Info = document.getElementById("foto2Info");
  if (fotoInfo) fotoInfo.innerText = "";
  if (foto2Info) foto2Info.innerText = "";

  // reset waktu & tanggal sekarang
  if (typeof updateDateTime === "function") updateDateTime();

  // scroll ke atas dengan smooth
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Pastikan tombol reset pasti punya event handler (berguna kalau script dimuat ulang/ditimpa)
document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.querySelector(".reset-btn");
  if (resetBtn) {
    // remove existing to avoid multiple, lalu pasang
    resetBtn.onclick = null;
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      refreshPage();
    });
  }
});



/* ========== [7] AUTO SAVE IDENTITAS PETUGAS ========== */
function savePetugas() {
  const dataPetugas = {
    namaPetugas: document.getElementById("namaPetugas").value,
    divisi: document.getElementById("divisi").value,
    jabatan: document.getElementById("jabatan").value,
    rekan: document.getElementById("rekan").value,
  };
  localStorage.setItem("identitasPetugas", JSON.stringify(dataPetugas));
}

function loadPetugas() {
  const data = localStorage.getItem("identitasPetugas");
  if (data) {
    const petugas = JSON.parse(data);
    document.getElementById("namaPetugas").value = petugas.namaPetugas || "";
    document.getElementById("divisi").value = petugas.divisi || "";
    document.getElementById("jabatan").value = petugas.jabatan || "";
    document.getElementById("rekan").value = petugas.rekan || "";
  }
}

["namaPetugas", "divisi", "jabatan", "rekan"].forEach((id) => {
  let el = document.getElementById(id);
  if (el) el.addEventListener("input", savePetugas);
});


/* ========== [8] KIRIM LAPORAN + FOTO KE DISCORD WEBHOOK ========== */
const webhookURL = "https://discord.com/api/webhooks/1420232139143909396/6j24XNYsNPQKjgr0hYXDgabOBciI9aOZNUufZm_s9JpS8yng_cD7UVDDhjwyrfdn2234"; // ganti dengan webhook Discord kamu

async function kirimSemua() {
  const overlay = document.getElementById("loadingOverlay");
  const laporan = document.getElementById("history").innerText || "Laporan kosong!";
  const fotoKTP = document.getElementById("foto").files[0];
  const fotoBarang = document.getElementById("foto2").files[0];

  Swal.fire({
    title: "Konfirmasi",
    text: "Masukkan password sebelum kirim laporan:",
    input: "password",
    inputPlaceholder: "Password...",
    showCancelButton: true,
    confirmButtonText: "Kirim",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    if (result.value !== "86") { // password default
      Swal.fire("❌ Password salah!", "Pengiriman dibatalkan.", "error");
      return;
    }

    if (overlay) overlay.style.display = "block";

    try {
      // Kirim laporan + foto KTP
      let formData1 = new FormData();
      formData1.append("content", laporan);
      if (fotoKTP) formData1.append("file", fotoKTP, fotoKTP.name);
      await fetch(webhookURL, { method: "POST", body: formData1 });

      // Kirim barang bukti (opsional)
      if (fotoBarang) {
        let formData2 = new FormData();
        formData2.append("file", fotoBarang, fotoBarang.name);
        await fetch(webhookURL, { method: "POST", body: formData2 });
      }

      Swal.fire("✅ Sukses!", "Laporan & foto berhasil dikirim ke Discord.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("❌ Error!", "Terjadi kesalahan saat mengirim.", "error");
    } finally {
      if (overlay) overlay.style.display = "none";
    }
  });
}


/* ========== [9] INISIALISASI ========== */
window.onload = function () {
  updateDateTime();
  loadPetugas();
};

// Update laporan saat ceklis berubah
document.querySelectorAll(".CEKLIS").forEach((checkbox) => {
  checkbox.addEventListener("change", updateLaporan);
});


// Event listener untuk input file
document.getElementById("foto").addEventListener("change", function () {
  let info = document.getElementById("fotoInfo");
  if (this.files.length > 0) {
    info.textContent = "✅ Foto KTP sudah dipilih";
  } else {
    info.textContent = "";
  }
});

document.getElementById("foto2").addEventListener("change", function () {
  let info = document.getElementById("foto2Info");
  if (this.files.length > 0) {
    info.textContent = "✅ Foto Barang Bukti sudah dipilih";
  } else {
    info.textContent = "";
  }
});


// 👉 Update teks samping kanan pakai nama petugas
let laporanSamping = document.getElementById("laporanSamping");
if (laporanSamping) {
  laporanSamping.innerText = `LAPORAN PENAHANAN : ${namaPetugas || "-"}`;
}