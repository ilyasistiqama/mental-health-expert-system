// Dialog konfirmasi pengganti confirm() bawaan browser. Elemen <dialog> ada di views/partials/footer.php.
// konfirmasi({ judul, pesan, ya, tidak, bahaya }) mengembalikan Promise<boolean>.
function konfirmasi(opsi) {
    var dialog = document.getElementById("dialog-konfirmasi");
    var tombolYa = dialog.querySelector("[data-ya]");
    var tombolTidak = dialog.querySelector("[data-tidak]");
    dialog.querySelector("h2").textContent = opsi.judul;
    dialog.querySelector("p").textContent = opsi.pesan;
    tombolYa.textContent = opsi.ya || "Ya";
    tombolTidak.textContent = opsi.tidak || "Batal";
    tombolYa.classList.toggle("bahaya", !!opsi.bahaya);

    return new Promise(function (selesai) {
        function tutup(jawaban) {
            tombolYa.onclick = tombolTidak.onclick = dialog.onclick = dialog.oncancel = null;
            dialog.close();
            selesai(jawaban);
        }
        tombolYa.onclick = function () { tutup(true); };
        tombolTidak.onclick = function () { tutup(false); };
        // tombol Esc atau klik di luar kotak = batal
        dialog.oncancel = function (e) { e.preventDefault(); tutup(false); };
        dialog.onclick = function (e) { if (e.target === dialog) tutup(false); };
        dialog.showModal();
        tombolTidak.focus();
    });
}

// form dengan atribut data-konfirmasi-judul meminta konfirmasi sebelum dikirim
document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form.dataset.konfirmasiJudul || form.dataset.sudahDikonfirmasi) return;
    e.preventDefault();
    konfirmasi({
        judul: form.dataset.konfirmasiJudul,
        pesan: form.dataset.konfirmasiPesan,
        ya: form.dataset.konfirmasiYa,
        tidak: form.dataset.konfirmasiTidak,
        bahaya: form.dataset.konfirmasiBahaya === "1"
    }).then(function (ya) {
        if (!ya) return;
        form.dataset.sudahDikonfirmasi = "1";
        // requestSubmit ikut mengirim name/value tombol yang diklik (aksi=ulang)
        form.requestSubmit(e.submitter);
    });
});
