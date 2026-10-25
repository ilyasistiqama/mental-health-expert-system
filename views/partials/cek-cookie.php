<div class="catatan-penting" id="cookie-mati" hidden>
    <strong>Cookie browser tidak aktif.</strong> Sistem ini membutuhkan cookie untuk menyimpan sesi login dan progres konsultasi.
    Aktifkan cookie untuk situs ini (Chrome/Edge: Setelan → Privasi dan keamanan; Firefox: Setelan → Privasi &amp; Keamanan;
    Safari iPhone: Pengaturan → Safari → matikan "Blokir Semua Cookie"), lalu muat ulang halaman.
</div>
<script>
    // tanpa cookie session login tidak tersimpan, jadi form dinonaktifkan agar tidak dikira bug
    if (!navigator.cookieEnabled) {
        document.getElementById("cookie-mati").hidden = false;
        document.querySelectorAll("#form input, #form button").forEach(function (el) { el.disabled = true; });
    }
</script>
