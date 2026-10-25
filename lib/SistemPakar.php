<?php

/**
 * Mesin inferensi sistem pakar berbasis aturan produksi.
 *
 * Aturan: penyakit terbukti jika semua kriterianya terpenuhi, kriteria terpenuhi jika
 * minimal sejumlah gejalanya dijawab Ya, lalu durasi keluhan menjadi akhir diagnosa.
 *
 * Sesi konsultasi disimpan di $_SESSION dalam bentuk array:
 * [ metode, target, fakta => [G01 => true], durasi => [P1 => hari], urutan => [kode], acak => [kode] ]
 */
class SistemPakar
{
    public const KODE_NORMAL = 'P0';
    private const AWALAN_DURASI = 'durasi:';

    // pilihan jawaban durasi, "hari" adalah batas bawah tiap pilihan
    public const OPSI_DURASI = [
        ['hari' => 0, 'label' => 'Kurang dari 2 minggu'],
        ['hari' => 14, 'label' => '2 minggu sampai 1 bulan'],
        ['hari' => 30, 'label' => '1 sampai 6 bulan'],
        ['hari' => 180, 'label' => '6 bulan atau lebih'],
    ];

    /** @var array<string, array> */
    public array $penyakit = [];
    /** @var array<string, array> gejala urut sesuai kolom urutan */
    public array $gejala = [];
    /** @var array<string, array> */
    public array $sumber = [];
    /** @var list<array{penyakit: string, kriteria: list<array{gejala: list<string>, minimal: int}>, durasiMinimal: int}> */
    public array $aturan = [];

    public static function muat(mysqli $koneksi): self
    {
        $sp = new self();

        foreach (mysqli_query($koneksi, "SELECT * FROM gejala ORDER BY urutan") as $g) {
            $sp->gejala[$g['id_gejala']] = $g;
        }
        foreach (mysqli_query($koneksi, "SELECT * FROM sumber ORDER BY nomor") as $s) {
            $sp->sumber[$s['id_sumber']] = $s;
        }
        foreach (mysqli_query($koneksi, "SELECT * FROM penyakit ORDER BY id_penyakit") as $p) {
            $p['kriteria'] = [];
            $p['pengobatan'] = [];
            $p['sumber'] = [];
            $sp->penyakit[$p['id_penyakit']] = $p;
        }

        $kriteria = mysqli_query($koneksi, "SELECT k.id_kriteria, k.id_penyakit, k.minimal, kg.id_gejala
            FROM kriteria k JOIN kriteria_gejala kg ON kg.id_kriteria = k.id_kriteria
            ORDER BY k.id_penyakit, k.urutan, kg.urutan");
        foreach ($kriteria as $k) {
            $daftar = &$sp->penyakit[$k['id_penyakit']]['kriteria'];
            $daftar[$k['id_kriteria']]['minimal'] = (int) $k['minimal'];
            $daftar[$k['id_kriteria']]['gejala'][] = $k['id_gejala'];
            unset($daftar);
        }
        foreach (mysqli_query($koneksi, "SELECT * FROM pengobatan ORDER BY id_penyakit, urutan") as $o) {
            $sp->penyakit[$o['id_penyakit']]['pengobatan'][] = $o['isi'];
        }
        foreach (mysqli_query($koneksi, "SELECT ps.* FROM penyakit_sumber ps JOIN sumber s ON s.id_sumber = ps.id_sumber ORDER BY s.nomor") as $ps) {
            $sp->penyakit[$ps['id_penyakit']]['sumber'][] = $ps['id_sumber'];
        }

        foreach ($sp->penyakit as $kode => &$p) {
            $p['kriteria'] = array_values(array_map(fn ($k) => [
                'gejala' => $k['gejala'],
                'minimal' => min($k['minimal'], count($k['gejala'])),
            ], $p['kriteria']));
            $p['durasi_minimal'] = (int) $p['durasi_minimal'];

            if ($kode !== self::KODE_NORMAL && $p['kriteria']) {
                $sp->aturan[] = ['penyakit' => $kode, 'kriteria' => $p['kriteria'], 'durasiMinimal' => $p['durasi_minimal']];
            }
        }
        unset($p);

        return $sp;
    }

    public function daftarPenyakit(): array
    {
        return array_column($this->aturan, 'penyakit');
    }

    // acak: forward = urutan acak pertanyaan penyaring, backward = urutan acak seluruh gejala hipotesis
    public function sesiBaru(string $metode, ?string $target = null): array
    {
        return [
            'metode' => $metode,
            'target' => $target,
            'fakta' => [],
            'durasi' => [],
            'urutan' => [],
            'acak' => $metode === 'forward' ? $this->acak($this->gejalaPenyaring()) : $this->urutanAcakAturan($target),
        ];
    }

    // gejala bertanda "akhir" (misalnya dampak ke kehidupan sehari-hari) selalu ditanyakan paling akhir
    private function urutanAcakAturan(?string $target): array
    {
        foreach ($this->aturan as $a) {
            if ($a['penyakit'] === $target) {
                $acak = $this->acak(array_values(array_unique(array_merge(...array_column($a['kriteria'], 'gejala')))));
                $akhir = fn ($k) => (bool) $this->gejala[$k]['akhir'];
                return [...array_filter($acak, fn ($k) => !$akhir($k)), ...array_filter($acak, $akhir)];
            }
        }
        return [];
    }

    public function sesiValid(mixed $sesi, string $metode): bool
    {
        if (!is_array($sesi) || ($sesi['metode'] ?? null) !== $metode) {
            return false;
        }
        foreach (['fakta', 'durasi', 'urutan', 'acak'] as $kunci) {
            if (!is_array($sesi[$kunci] ?? null)) {
                return false;
            }
        }
        foreach ($sesi['urutan'] as $kode) {
            if (!isset($this->gejala[$kode]) && !isset($this->penyakit[$this->penyakitDurasi($kode) ?? ''])) {
                return false;
            }
        }
        return true;
    }

    // pertanyaan penyaring = gejala pada kriteria pertama setiap aturan
    private function gejalaPenyaring(): array
    {
        $penyaring = [];
        foreach ($this->aturan as $a) {
            foreach ($a['kriteria'][0]['gejala'] as $kode) {
                $penyaring[$kode] = true;
            }
        }
        return array_values(array_filter(array_keys($this->gejala), fn ($k) => isset($penyaring[$k])));
    }

    // Fisher-Yates shuffle dengan random_int (aman secara kriptografis)
    private function acak(array $daftar): array
    {
        for ($i = count($daftar) - 1; $i > 0; $i--) {
            $j = random_int(0, $i);
            [$daftar[$i], $daftar[$j]] = [$daftar[$j], $daftar[$i]];
        }
        return $daftar;
    }

    private function statusKriteria(array $kriteria, array $fakta): string
    {
        $ya = count(array_filter($kriteria['gejala'], fn ($k) => ($fakta[$k] ?? null) === true));
        $belum = count(array_filter($kriteria['gejala'], fn ($k) => !array_key_exists($k, $fakta)));
        if ($ya >= $kriteria['minimal']) {
            return 'terpenuhi';
        }
        if ($ya + $belum < $kriteria['minimal']) {
            return 'gugur';
        }
        return 'terbuka';
    }

    private function statusAturan(array $aturan, array $fakta): string
    {
        $status = array_map(fn ($k) => $this->statusKriteria($k, $fakta), $aturan['kriteria']);
        if (in_array('gugur', $status, true)) {
            return 'gugur';
        }
        if (count(array_filter($status, fn ($s) => $s !== 'terpenuhi')) === 0) {
            return 'terpenuhi';
        }
        return 'terbuka';
    }

    // gejala yang masih bisa mengubah status aturan, urut sesuai kriteria
    private function gejalaRelevan(array $aturan, array $fakta): array
    {
        $relevan = [];
        foreach ($aturan['kriteria'] as $k) {
            if ($this->statusKriteria($k, $fakta) === 'terbuka') {
                foreach ($k['gejala'] as $kode) {
                    if (!array_key_exists($kode, $fakta)) {
                        $relevan[] = $kode;
                    }
                }
            }
        }
        return $relevan;
    }

    // forward chaining memakai semua aturan, backward chaining hanya aturan hipotesis
    private function aturanKandidat(array $sesi): array
    {
        if ($sesi['metode'] === 'backward') {
            return array_values(array_filter($this->aturan, fn ($a) => $a['penyakit'] === $sesi['target']));
        }
        return $this->aturan;
    }

    /**
     * Menentukan pertanyaan berikutnya, atau kesimpulan jika inferensi selesai. Prioritasnya:
     * 1. gangguan yang semua kriterianya terpenuhi langsung ditanyakan durasinya (akhir diagnosa),
     * 2. backward chaining: gejala hipotesis yang masih relevan sesuai urutan acak sesi,
     * 3. forward chaining: gangguan yang pertanyaan penyaringnya sudah terpenuhi ditelusuri sampai tuntas
     *    dengan urutan tetap, selain itu tanyakan pertanyaan penyaring berikutnya sesuai urutan acak sesi.
     * Gejala yang tidak bisa lagi mengubah status aturan tidak ditanyakan, sehingga kesimpulan
     * selalu sama dengan menanyakan semua gejala, apa pun urutan acaknya.
     */
    public function langkahBerikutnya(array $sesi): array
    {
        $kandidat = $this->aturanKandidat($sesi);
        $terbuka = [];
        $terpenuhi = [];
        foreach ($kandidat as $a) {
            $status = $this->statusAturan($a, $sesi['fakta']);
            if ($status === 'terbuka') {
                $terbuka[] = $a;
            } elseif ($status === 'terpenuhi') {
                $terpenuhi[] = $a;
            }
        }
        $tanpaDurasi = array_values(array_filter($terpenuhi, fn ($a) => !array_key_exists($a['penyakit'], $sesi['durasi'])));

        $relevanSemua = [];
        foreach ($terbuka as $a) {
            foreach ($this->gejalaRelevan($a, $sesi['fakta']) as $kode) {
                $relevanSemua[$kode] = true;
            }
        }
        $sisa = count($relevanSemua) + count($tanpaDurasi) + count($terbuka);

        if ($tanpaDurasi) {
            return ['jenis' => 'durasi', 'penyakit' => $tanpaDurasi[0]['penyakit'], 'sisa' => $sisa];
        }

        if ($terbuka && $sesi['metode'] === 'backward') {
            $relevan = $this->gejalaRelevan($terbuka[0], $sesi['fakta']);
            // gejala yang tidak ada di urutan acak (data ditambah setelah sesi dibuat) ditanyakan sesudahnya
            foreach ([...$sesi['acak'], ...$relevan] as $kode) {
                if (in_array($kode, $relevan, true)) {
                    return ['jenis' => 'gejala', 'kode' => $kode, 'sisa' => $sisa];
                }
            }
        }

        if ($terbuka) {
            $fokus = array_filter($terbuka, fn ($a) => $this->statusKriteria($a['kriteria'][0], $sesi['fakta']) === 'terpenuhi');
            usort($fokus, fn ($a, $b) => $this->waktuAktif($a, $sesi) <=> $this->waktuAktif($b, $sesi));
            $kode = $fokus
                ? $this->gejalaRelevan($fokus[0], $sesi['fakta'])[0]
                : $this->penyaringBerikutnya($sesi, $terbuka);
            return ['jenis' => 'gejala', 'kode' => $kode, 'sisa' => $sisa];
        }

        $cukup = fn ($a) => ($sesi['durasi'][$a['penyakit']] ?? -1) >= $a['durasiMinimal'];
        return [
            'jenis' => 'selesai',
            'penyakit' => array_values(array_column(array_filter($terpenuhi, $cukup), 'penyakit')),
            'belumCukup' => array_values(array_column(array_filter($terpenuhi, fn ($a) => !$cukup($a)), 'penyakit')),
            'durasi' => $sesi['durasi'],
        ];
    }

    // urutan jawaban saat pertanyaan penyaring sebuah aturan terpenuhi
    private function waktuAktif(array $aturan, array $sesi): int
    {
        $posisi = [];
        foreach ($aturan['kriteria'][0]['gejala'] as $kode) {
            if (($sesi['fakta'][$kode] ?? null) === true) {
                $posisi[] = array_search($kode, $sesi['urutan'], true);
            }
        }
        return min($posisi);
    }

    private function penyaringBerikutnya(array $sesi, array $terbuka): string
    {
        $relevan = [];
        foreach ($terbuka as $a) {
            if ($this->statusKriteria($a['kriteria'][0], $sesi['fakta']) === 'terbuka') {
                foreach ($a['kriteria'][0]['gejala'] as $kode) {
                    if (!array_key_exists($kode, $sesi['fakta'])) {
                        $relevan[$kode] = true;
                    }
                }
            }
        }
        // penyaring baru (data ditambah setelah sesi dibuat) ditaruh di akhir
        foreach ([...$sesi['acak'], ...array_keys($this->gejala)] as $kode) {
            if (isset($relevan[$kode])) {
                return $kode;
            }
        }
        throw new LogicException('Tidak ada pertanyaan penyaring yang relevan');
    }

    /** @param bool|int $nilai true/false untuk gejala, jumlah hari (OPSI_DURASI) untuk durasi */
    public function jawab(array $sesi, bool|int $nilai): array
    {
        $langkah = $this->langkahBerikutnya($sesi);
        if ($langkah['jenis'] === 'gejala') {
            $sesi['fakta'][$langkah['kode']] = $nilai === true;
            $sesi['urutan'][] = $langkah['kode'];
        } elseif ($langkah['jenis'] === 'durasi') {
            $sesi['durasi'][$langkah['penyakit']] = (int) $nilai;
            $sesi['urutan'][] = self::AWALAN_DURASI . $langkah['penyakit'];
        }
        return $sesi;
    }

    public function batalkan(array $sesi): array
    {
        $terakhir = array_pop($sesi['urutan']);
        if ($terakhir === null) {
            return $sesi;
        }
        $penyakit = $this->penyakitDurasi($terakhir);
        if ($penyakit !== null) {
            unset($sesi['durasi'][$penyakit]);
        } else {
            unset($sesi['fakta'][$terakhir]);
        }
        return $sesi;
    }

    private function penyakitDurasi(string $kode): ?string
    {
        return str_starts_with($kode, self::AWALAN_DURASI) ? substr($kode, strlen(self::AWALAN_DURASI)) : null;
    }

    public function teksDurasi(string $kodePenyakit): string
    {
        return 'Sudah berapa lama anda mengalami keluhan-keluhan yang berkaitan dengan '
            . ($this->penyakit[$kodePenyakit]['nama_penyakit'] ?? $kodePenyakit) . '?';
    }

    public static function labelOpsiDurasi(int $hari): string
    {
        foreach (self::OPSI_DURASI as $o) {
            if ($o['hari'] === $hari) {
                return $o['label'];
            }
        }
        return '-';
    }

    public static function labelDurasi(int $hari): string
    {
        if ($hari >= 30) {
            return ($hari / 30) . ' bulan';
        }
        if ($hari >= 7) {
            return ($hari / 7) . ' minggu';
        }
        return $hari . ' hari';
    }

    // jawaban siap tampil: [kode, pertanyaan, jawaban, ya]
    public function daftarJawaban(array $sesi): array
    {
        return array_map(function ($kode) use ($sesi) {
            $penyakit = $this->penyakitDurasi($kode);
            if ($penyakit !== null) {
                return [
                    'kode' => $kode,
                    'pertanyaan' => $this->teksDurasi($penyakit),
                    'jawaban' => self::labelOpsiDurasi($sesi['durasi'][$penyakit]),
                    'ya' => null,
                ];
            }
            $ya = $sesi['fakta'][$kode];
            return ['kode' => $kode, 'pertanyaan' => $this->gejala[$kode]['pertanyaan'], 'jawaban' => $ya ? 'Ya' : 'Tidak', 'ya' => $ya];
        }, $sesi['urutan']);
    }

    public function labelKriteria(array $kriteria): string
    {
        if ($kriteria['minimal'] < count($kriteria['gejala'])) {
            return "Minimal {$kriteria['minimal']} dari " . count($kriteria['gejala']) . ' gejala berikut';
        }
        return count($kriteria['gejala']) > 1 ? 'Semua gejala berikut' : 'Gejala';
    }

    public function judulHasil(array $hasil, string $metode, ?string $target): string
    {
        if ($hasil['penyakit']) {
            return implode(', ', array_map(fn ($k) => $this->penyakit[$k]['nama_penyakit'] ?? $k, $hasil['penyakit']));
        }
        if ($metode === 'backward') {
            return 'Jawaban anda belum menunjukkan kecenderungan ' . ($this->penyakit[$target]['nama_penyakit'] ?? $target);
        }
        return $this->penyakit[self::KODE_NORMAL]['nama_penyakit'];
    }

    // nama awam untuk pengguna; istilah teknisnya forward chaining dan backward chaining
    public static function namaMetode(string $metode): string
    {
        return $metode === 'backward' ? 'Cek Gangguan Tertentu' : 'Cek Menyeluruh';
    }
}
