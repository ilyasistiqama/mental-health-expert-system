<?php

date_default_timezone_set('Asia/Jakarta');

// Cookie session bawaan PHP hilang saat browser ditutup sehingga pengguna ter-logout dan progres
// konsultasi hilang. Session dibuat bertahan 7 hari agar konsultasi bisa dilanjutkan.
const UMUR_SESI = 60 * 60 * 24 * 7;

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.gc_maxlifetime', (string) UMUR_SESI);
    session_set_cookie_params(['lifetime' => UMUR_SESI, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
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

// Hasil diagnosa bersifat rahasia: tidak disimpan ke database. Hasil dititipkan di session hanya
// sampai halaman hasil dibuka, lalu langsung dihapus. Progres jawaban juga dihapus.
function selesaikan_konsultasi(string $metode, array $sesi, array $kesimpulan, string $dasar): never
{
    $_SESSION['hasil'] = [
        'waktu' => date('Y-m-d H:i:s'),
        'metode' => $metode,
        'target' => $sesi['target'],
        'penyakit' => $kesimpulan['penyakit'],
        'belumCukup' => $kesimpulan['belumCukup'],
        'durasi' => $kesimpulan['durasi'],
        'jawaban' => sistem_pakar()->daftarJawaban($sesi),
    ];
    unset($_SESSION['sesi'][$metode]);

    header("location: {$dasar}views/hasil.php");
    exit;
}

// pesan sekali tampil (pengganti alert bawaan browser), misalnya setelah login gagal
function pesan_kilat(string $jenis, string $teks, array $isian = []): void
{
    $_SESSION['kilat'] = ['jenis' => $jenis, 'teks' => $teks];
    $_SESSION['isian'] = $isian;
}

function ambil_pesan_kilat(): ?array
{
    $kilat = $_SESSION['kilat'] ?? null;
    unset($_SESSION['kilat']);
    return $kilat;
}

// isian form sebelumnya agar tidak perlu diketik ulang setelah gagal
function isian_lama(string $nama): string
{
    return $_SESSION['isian'][$nama] ?? '';
}

function format_tanggal(string $waktu): string
{
    $bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    $t = strtotime($waktu);
    return date('j', $t) . ' ' . $bulan[(int) date('n', $t) - 1] . ' ' . date('Y, H.i', $t);
}
