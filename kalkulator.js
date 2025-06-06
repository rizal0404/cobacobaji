function hitungBiaya() {
  // Mengambil nilai input dari HTML
  const hargaMobil = parseFloat(document.getElementById("hargaMobil").value);
  const uangMuka = parseFloat(document.getElementById("uangMuka").value);
  const angsuranBulanan = parseFloat(document.getElementById("angsuranBulanan").value);
  const pajakTahunan = parseFloat(document.getElementById("pajakTahunan").value);
  const biayaServis = parseFloat(document.getElementById("biayaServis").value);
  const hargaBBM = parseFloat(document.getElementById("hargaBBM").value);
  const jarakHarian = parseFloat(document.getElementById("jarakHarian").value);
  const jarakAkhirPekan = parseFloat(document.getElementById("jarakAkhirPekan").value);

  // Variabel awal
  const biayaPerTahun = [];
  let totalBiaya = uangMuka;
  let kenaikanHargaBBM = hargaBBM;

  // Menghitung jarak tempuh tahunan dan konsumsi BBM
  const jarakMingguan = (jarakHarian * 5) + jarakAkhirPekan;
  const jarakTahunan = jarakMingguan * 52;
  const konsumsiBBM = jarakTahunan / 14; // 14 km/liter

  // Mendapatkan referensi elemen tabel
  const tableBody = document.getElementById("biayaTableBody");
  tableBody.innerHTML = ""; // Mengosongkan tabel sebelum menambahkan data

  // Perhitungan Biaya dari Tahun 1 sampai 10
  for (let tahun = 1; tahun <= 10; tahun++) {
    let biayaTahunan = 0;
    let angsuran = tahun <= 5 ? angsuranBulanan * 12 : 0;
    let biayaServisTahunan = tahun > 5 ? biayaServis : 0;
    let pajak = pajakTahunan;
    let bbm = konsumsiBBM * kenaikanHargaBBM;

    biayaTahunan = angsuran + pajak + bbm + biayaServisTahunan;
    biayaPerTahun.push(biayaTahunan);
    totalBiaya += biayaTahunan;
    kenaikanHargaBBM *= 1.05; // Kenaikan 5% per tahun

    // Menambahkan data ke dalam tabel
    const row = `<tr>
      <td>${tahun}</td>
      <td>${tahun === 1 ? uangMuka.toLocaleString() : 0}</td>
      <td>${angsuran.toLocaleString()}</td>
      <td>${pajak.toLocaleString()}</td>
      <td>${bbm.toFixed(0).toLocaleString()}</td>
      <td>${biayaServisTahunan.toLocaleString()}</td>
      <td>${biayaTahunan.toFixed(0).toLocaleString()}</td>
    </tr>`;
    tableBody.insertAdjacentHTML('beforeend', row);
  }

  // Membuat grafik menggunakan Chart.js
  const ctx = document.getElementById('biayaChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from({length: 10}, (_, i) => `Tahun ${i + 1}`),
      datasets: [{
        label: 'Biaya Tahunan (Rp)',
        data: biayaPerTahun,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
