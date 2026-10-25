<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../database/koneksi.php';
require_once __DIR__ . '/SistemPakar.php';

function e(mixed $teks): string
{
    return htmlspecialchars((string) $teks, ENT_QUOTES, 'UTF-8');
}

function sudah_login(): bool
{
    return ($_SESSION['hak_akses'] ?? null) === 'user' && isset($_SESSION['id_user']);
}

function wajib_login(string $dasar): void
{
    if (!sudah_login()) {
        header("location: {$dasar}views/auth/login.php");
        exit;
    }
}

function token_csrf(): string
{
    return $_SESSION['csrf'] ??= bin2hex(random_bytes(16));
}

function csrf_valid(): bool
{
    return is_string($_POST['csrf'] ?? null) && hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf']);
}

function sistem_pakar(): SistemPakar
{
    global $koneksi;
    static $sp = null;
    return $sp ??= SistemPakar::muat($koneksi);
}

// sitasi bernomor [n] yang menuju halaman sumber
function rujukan(array $ids, string $dasar): string
{
    $sumber = sistem_pakar()->sumber;
    $daftar = array_values(array_filter(array_map(fn ($id) => $sumber[$id] ?? null, $ids)));
    if (!$daftar) {
        return '';
    }
    usort($daftar, fn ($a, $b) => $a['nomor'] <=> $b['nomor']);
    $tautan = array_map(fn ($s) => '<a href="' . e($dasar) . 'views/sumber.php#' . e($s['id_sumber']) . '" title="' . e($s['judul']) . '">' . (int) $s['nomor'] . '</a>', $daftar);
    return '<sup class="rujukan">[' . implode(', ', $tautan) . ']</sup>';
}

// simpan kesimpulan ke riwayat user, hapus sesi, lalu buka halaman hasil
function selesaikan_konsultasi(string $metode, array $sesi, array $kesimpulan, string $dasar): never
{
    global $koneksi;
    $sp = sistem_pakar();
    $hasil = [
        'penyakit' => $kesimpulan['penyakit'],
        'belumCukup' => $kesimpulan['belumCukup'],
        'durasi' => $kesimpulan['durasi'],
        'jawaban' => $sp->daftarJawaban($sesi),
    ];
    mysqli_execute_query(
        $koneksi,
        "INSERT INTO riwayat (id_user, waktu, metode, target, hasil) VALUES (?, NOW(), ?, ?, ?)",
        [$_SESSION['id_user'], $metode, $sesi['target'], json_encode($hasil, JSON_UNESCAPED_UNICODE)]
    );
    $id = mysqli_insert_id($koneksi);
    unset($_SESSION['sesi'][$metode]);

    header("location: {$dasar}views/hasil.php?id={$id}");
    exit;
}

function format_tanggal(string $waktu): string
{
    $bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    $t = strtotime($waktu);
    return date('j', $t) . ' ' . $bulan[(int) date('n', $t) - 1] . ' ' . date('Y, H.i', $t);
}
