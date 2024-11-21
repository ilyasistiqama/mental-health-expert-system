-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 19 Jun 2019 pada 08.58
-- Versi server: 10.1.40-MariaDB
-- Versi PHP: 7.3.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `spakar`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `gjl_khusus`
--

CREATE TABLE `gjl_khusus` (
  `id_gjl_khusus` int(11) NOT NULL,
  `nama_gejalak` varchar(150) NOT NULL,
  `pertanyaank` text NOT NULL,
  `id_penyakit` varchar(2) NOT NULL,
  `ya` varchar(5) NOT NULL,
  `tidak` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data untuk tabel `gjl_khusus`
--

INSERT INTO `gjl_khusus` (`id_gjl_khusus`, `nama_gejalak`, `pertanyaank`, `id_penyakit`, `ya`, `tidak`) VALUES
(1, 'Kehilangan Kendali', 'Apakah anda pernah tiba-tiba merasakan kehilangan kendali ?', 'P1', '13', '2'),
(2, 'Merasa Tegang', 'Ketika anda merasa cemas, apakah anda sering merasakan tegang berlebih ?', 'P2', '3', '7'),
(3, 'Was-was', 'Apakah ketika anda melakukan sesuatu atau saat beraktifitas, anda sering terjebak dalam pikiran-pikiran negatif ?', 'P2', '4', '5'),
(4, 'Khawatir', 'Saat anda meninggalkan rumah, anda sering merasa khawatir ketika pintu rumah anda sudah dikunci atau belum ?', 'P2', '5', '6'),
(5, 'Susah tidur', 'Apakah anda sering susah tidur walaupun anda merasakan kantuk ?', 'P2', '6', '7'),
(6, 'Susah berkonsentrasi', 'Apakah saat anda beraktifitas atau mengerjakan sesuatu anda sulit untuk berkonsentrasi ?', 'P2', '13', '13'),
(7, 'Takut terhadap sesuatu secara berlebihan', 'Apakah anda sering merasakan ketakutan yang luar biasa terhadap sesuatu atau kondisi tertentu?', 'P3', '13', '8'),
(8, 'Memikirkan sesuatu secara berlebihan', 'Apakah anda takut ketika memulai sesuatu yang baru ?', 'P4', '9', '10'),
(9, 'Gelisah', 'Pernahkah anda merasakan kegelisahan yang luar biasa terhadap sesuatu yang sedang anda alami ?', 'P4', '13', '13'),
(10, 'Sulit menyesuaikan diri pada situasi yang mirip dengan kejadian yang tidak menyenangkan yang pernah terjadi ', 'Apakah anda pernah merasakan berada di suatu tempat yang mirip dengan tempat anda mengalami kejadian masa lalu yang buruk dan anda merasa kejadian itu akan terulang kembali dan mengalami kecemasan yang berlebih?', 'P5', '11', '12'),
(11, 'Pikiran terasa kosong', 'apakah anda sering memikirkan kejadian buruk yang pernah terjadi pada masa lalu ?', 'P5', '13', '13'),
(12, 'Tidak Terdeteksi', 'Anda Tidak Mengalami Gangguan Apapun', 'P0', 'f', 'f'),
(13, 'Menderita 2 Minggu', 'Apakah Anda sudah Menderita Gejala-Gejala Tersebut Selama 2 Minggu ? ', 'P0', 'f', '12');

-- --------------------------------------------------------

--
-- Struktur dari tabel `penyakit`
--

CREATE TABLE `penyakit` (
  `id_penyakit` varchar(2) NOT NULL,
  `nama_penyakit` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data untuk tabel `penyakit`
--

INSERT INTO `penyakit` (`id_penyakit`, `nama_penyakit`) VALUES
('P0', 'Anda tidak Mengalami Gangguan Apapun'),
('P1', 'Gangguan Panik'),
('P2', 'Gangguan Kecemasan Menyeluruh'),
('P3', 'Gangguan Fobia'),
('P4', 'Gangguan Obsesif-Kompulsif'),
('P5', 'Gangguan Stres Traumatis');

-- --------------------------------------------------------

--
-- Struktur dari tabel `temporary`
--

CREATE TABLE `temporary` (
  `id_temporary` int(11) NOT NULL,
  `id_penyakit` varchar(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Struktur dari tabel `user`
--

CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `nama_user` varchar(20) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(10) NOT NULL,
  `hak_akses` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data untuk tabel `user`
--

INSERT INTO `user` (`id_user`, `nama_user`, `username`, `password`, `hak_akses`) VALUES
(1, 'ilyas', 'ilyas', 'ilyas', 'user');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `gjl_khusus`
--
ALTER TABLE `gjl_khusus`
  ADD PRIMARY KEY (`id_gjl_khusus`),
  ADD KEY `id_penyakit` (`id_penyakit`) USING BTREE;

--
-- Indeks untuk tabel `penyakit`
--
ALTER TABLE `penyakit`
  ADD PRIMARY KEY (`id_penyakit`);

--
-- Indeks untuk tabel `temporary`
--
ALTER TABLE `temporary`
  ADD PRIMARY KEY (`id_temporary`),
  ADD KEY `id_penyakit` (`id_penyakit`);

--
-- Indeks untuk tabel `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `gjl_khusus`
--
ALTER TABLE `gjl_khusus`
  MODIFY `id_gjl_khusus` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `temporary`
--
ALTER TABLE `temporary`
  MODIFY `id_temporary` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT untuk tabel `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `gjl_khusus`
--
ALTER TABLE `gjl_khusus`
  ADD CONSTRAINT `gjl_khusus_ibfk_1` FOREIGN KEY (`id_penyakit`) REFERENCES `penyakit` (`id_penyakit`);

--
-- Ketidakleluasaan untuk tabel `temporary`
--
ALTER TABLE `temporary`
  ADD CONSTRAINT `temporary_ibfk_1` FOREIGN KEY (`id_penyakit`) REFERENCES `penyakit` (`id_penyakit`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
