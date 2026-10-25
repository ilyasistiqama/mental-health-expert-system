-- Basis pengetahuan Sistem Pakar Gangguan Kecemasan
-- Kriteria disusun berdasarkan DSM-5-TR, ICD-11, dan PPDGJ-III (lihat tabel sumber).
-- Isi tabel identik dengan public/data/*.json pada branch main.
-- Kode asli sebelum perbaikan tersimpan di tag git `backup-asli`.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;
START TRANSACTION;

DROP TABLE IF EXISTS `riwayat`, `penyakit_sumber`, `pengobatan`, `kriteria_gejala`, `kriteria`, `gejala`, `sumber`, `temporary`, `gjl_khusus`, `penyakit`, `user`;

CREATE TABLE `penyakit` (
  `id_penyakit` varchar(5) NOT NULL,
  `nama_penyakit` varchar(100) NOT NULL,
  `kategori` varchar(100) NOT NULL,
  `deskripsi` text NOT NULL,
  `durasi_minimal` int NOT NULL DEFAULT 0 COMMENT 'hari; 0, 14, 30, atau 180',
  `catatan_durasi` text NULL,
  `rujukan` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id_penyakit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `gejala` (
  `id_gejala` varchar(5) NOT NULL,
  `nama_gejala` varchar(150) NOT NULL,
  `pertanyaan` text NOT NULL,
  `urutan` int NOT NULL,
  `akhir` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = selalu ditanyakan paling akhir',
  PRIMARY KEY (`id_gejala`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- aturan: penyakit terbukti jika semua kriterianya terpenuhi,
-- kriteria terpenuhi jika minimal `minimal` gejalanya dijawab Ya
CREATE TABLE `kriteria` (
  `id_kriteria` int NOT NULL AUTO_INCREMENT,
  `id_penyakit` varchar(5) NOT NULL,
  `urutan` int NOT NULL,
  `minimal` int NOT NULL,
  PRIMARY KEY (`id_kriteria`),
  KEY `id_penyakit` (`id_penyakit`),
  CONSTRAINT `kriteria_ibfk_1` FOREIGN KEY (`id_penyakit`) REFERENCES `penyakit` (`id_penyakit`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `kriteria_gejala` (
  `id_kriteria` int NOT NULL,
  `id_gejala` varchar(5) NOT NULL,
  `urutan` int NOT NULL,
  PRIMARY KEY (`id_kriteria`, `id_gejala`),
  KEY `id_gejala` (`id_gejala`),
  CONSTRAINT `kriteria_gejala_ibfk_1` FOREIGN KEY (`id_kriteria`) REFERENCES `kriteria` (`id_kriteria`) ON DELETE CASCADE,
  CONSTRAINT `kriteria_gejala_ibfk_2` FOREIGN KEY (`id_gejala`) REFERENCES `gejala` (`id_gejala`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `pengobatan` (
  `id_pengobatan` int NOT NULL AUTO_INCREMENT,
  `id_penyakit` varchar(5) NOT NULL,
  `urutan` int NOT NULL,
  `isi` text NOT NULL,
  PRIMARY KEY (`id_pengobatan`),
  KEY `id_penyakit` (`id_penyakit`),
  CONSTRAINT `pengobatan_ibfk_1` FOREIGN KEY (`id_penyakit`) REFERENCES `penyakit` (`id_penyakit`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `sumber` (
  `id_sumber` varchar(30) NOT NULL,
  `nomor` int NOT NULL,
  `penulis` varchar(255) NOT NULL,
  `tahun` varchar(50) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `penerbit` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL DEFAULT '',
  `diakses` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id_sumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `penyakit_sumber` (
  `id_penyakit` varchar(5) NOT NULL,
  `id_sumber` varchar(30) NOT NULL,
  PRIMARY KEY (`id_penyakit`, `id_sumber`),
  KEY `id_sumber` (`id_sumber`),
  CONSTRAINT `penyakit_sumber_ibfk_1` FOREIGN KEY (`id_penyakit`) REFERENCES `penyakit` (`id_penyakit`) ON DELETE CASCADE,
  CONSTRAINT `penyakit_sumber_ibfk_2` FOREIGN KEY (`id_sumber`) REFERENCES `sumber` (`id_sumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `nama_user` varchar(20) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `hak_akses` varchar(10) NOT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- tabel `riwayat` dari versi sebelumnya dihapus: hasil diagnosa bersifat rahasia dan tidak disimpan

INSERT INTO `penyakit` (`id_penyakit`, `nama_penyakit`, `kategori`, `deskripsi`, `durasi_minimal`, `catatan_durasi`, `rujukan`) VALUES
('P0', 'Tidak Terdeteksi Gangguan Kecemasan', '-', 'Berdasarkan jawaban anda, sistem tidak menemukan kecenderungan gangguan kecemasan. Rasa cemas sesekali adalah hal yang normal dan bahkan bisa membantu kita lebih waspada.', 0, NULL, ''),
('P1', 'Gangguan Panik', 'Gangguan Kecemasan', 'Serangan panik yang berulang dan tidak terduga, yaitu gelombang rasa takut atau tidak nyaman yang sangat hebat dan memuncak dalam hitungan menit, disertai gejala fisik yang kuat. Setelahnya penderita terus khawatir akan serangan berikutnya atau mengubah perilaku untuk menghindarinya.', 30, NULL, 'DSM-5-TR: Panic Disorder · ICD-11: 6B01 · PPDGJ-III: F41.0'),
('P2', 'Gangguan Kecemasan Menyeluruh', 'Gangguan Kecemasan', 'Kecemasan dan kekhawatiran berlebihan tentang berbagai hal yang berlangsung hampir setiap hari, sulit dikendalikan, dan disertai keluhan seperti gelisah, mudah lelah, sulit berkonsentrasi, mudah marah, otot tegang, atau gangguan tidur.', 180, NULL, 'DSM-5-TR: Generalized Anxiety Disorder · ICD-11: 6B00 · PPDGJ-III: F41.1'),
('P3', 'Fobia Spesifik', 'Gangguan Kecemasan', 'Ketakutan yang berlebihan dan tidak sebanding dengan bahaya sebenarnya terhadap objek atau situasi tertentu, misalnya hewan, ketinggian, darah, atau jarum suntik. Rasa takut hampir selalu muncul saat berhadapan dengan pemicunya sehingga penderita berusaha menghindarinya.', 180, NULL, 'DSM-5-TR: Specific Phobia · ICD-11: 6B03 · PPDGJ-III: F40.2'),
('P4', 'Gangguan Obsesif-Kompulsif', 'Gangguan Obsesif-Kompulsif dan Terkait', 'Munculnya obsesi (pikiran, bayangan, atau dorongan berulang yang tidak diinginkan) dan/atau kompulsi (tindakan atau ritual berulang yang dirasa harus dilakukan untuk meredakan cemas) yang menyita waktu atau sangat mengganggu. Dalam DSM-5-TR, gangguan ini dipisahkan dari kelompok gangguan kecemasan.', 14, NULL, 'DSM-5-TR: Obsessive-Compulsive Disorder · ICD-11: 6B20 · PPDGJ-III: F42'),
('P5', 'Gangguan Stres Pascatrauma (PTSD)', 'Gangguan Terkait Trauma dan Stresor', 'Reaksi berkepanjangan setelah mengalami atau menyaksikan peristiwa traumatis, berupa ingatan atau mimpi buruk yang terus muncul, menghindari hal yang mengingatkan peristiwa, perubahan pikiran dan perasaan menjadi negatif, serta selalu waspada atau mudah kaget. Dalam DSM-5-TR, gangguan ini dipisahkan dari kelompok gangguan kecemasan.', 30, 'Jika keluhan muncul kurang dari 1 bulan setelah peristiwa traumatis, kondisi ini dapat termasuk Gangguan Stres Akut. Tetap konsultasikan dengan psikolog atau psikiater.', 'DSM-5-TR: Posttraumatic Stress Disorder · ICD-11: 6B40 · PPDGJ-III: F43.1'),
('P6', 'Gangguan Kecemasan Sosial', 'Gangguan Kecemasan', 'Ketakutan yang kuat dan menetap terhadap situasi sosial ketika seseorang mungkin diperhatikan atau dinilai orang lain, karena takut dipermalukan atau ditolak. Situasi tersebut dihindari atau dijalani dengan kecemasan yang sangat hebat.', 180, NULL, 'DSM-5-TR: Social Anxiety Disorder · ICD-11: 6B04 · PPDGJ-III: F40.1'),
('P7', 'Agorafobia', 'Gangguan Kecemasan', 'Ketakutan berada di beberapa tempat atau situasi, seperti transportasi umum, ruang terbuka, ruang tertutup, keramaian, atau di luar rumah sendirian, karena khawatir sulit melarikan diri atau tidak mendapat pertolongan bila muncul gejala panik. Situasi tersebut dihindari atau hanya dijalani bila ditemani.', 180, NULL, 'DSM-5-TR: Agoraphobia · ICD-11: 6B02 · PPDGJ-III: F40.0'),
('P8', 'Gangguan Kecemasan Perpisahan', 'Gangguan Kecemasan', 'Ketakutan atau kecemasan yang berlebihan dan tidak sesuai usia terhadap perpisahan dengan orang terdekat, misalnya terus khawatir orang terdekat celaka, enggan bepergian, takut sendirian, atau mengalami keluhan fisik saat akan berpisah. Gangguan ini dapat dialami anak-anak maupun orang dewasa.', 180, 'Pada anak dan remaja, kriteria durasinya adalah minimal 4 minggu. Konsultasikan dengan psikolog anak bila keluhan dialami anak.', 'DSM-5-TR: Separation Anxiety Disorder · ICD-11: 6B05 · PPDGJ-III: F93.0');

INSERT INTO `gejala` (`id_gejala`, `nama_gejala`, `pertanyaan`, `urutan`, `akhir`) VALUES
('G01', 'Serangan panik berulang', 'Apakah anda pernah beberapa kali mengalami serangan rasa takut atau tidak nyaman yang sangat hebat secara tiba-tiba, memuncak dalam hitungan menit, dan sering muncul tanpa pemicu yang jelas?', 1, 0),
('G02', 'Khawatir berlebihan tentang banyak hal', 'Apakah anda merasa khawatir secara berlebihan tentang banyak hal sehari-hari (pekerjaan, sekolah, kesehatan, keluarga, atau keuangan) hampir setiap hari?', 2, 0),
('G03', 'Takut berlebihan pada objek atau situasi tertentu', 'Apakah anda memiliki rasa takut yang sangat kuat dan jauh melebihi bahaya sebenarnya terhadap objek atau situasi tertentu, misalnya ketinggian, hewan, darah, jarum suntik, atau naik pesawat?', 3, 0),
('G04', 'Obsesi (pikiran berulang yang tidak diinginkan)', 'Apakah sering muncul pikiran, bayangan, atau dorongan yang tidak anda inginkan secara berulang (misalnya takut kotor, takut mencelakai orang lain, atau keharusan segala sesuatu simetris) dan anda berusaha keras mengabaikan atau menekannya?', 4, 0),
('G05', 'Kompulsi (tindakan berulang)', 'Apakah anda merasa terdorong melakukan tindakan atau ritual berulang, misalnya berkali-kali memeriksa pintu atau kompor, mencuci tangan, menghitung, atau merapikan barang, untuk meredakan rasa cemas?', 5, 0),
('G06', 'Pernah mengalami peristiwa traumatis', 'Apakah anda pernah mengalami, menyaksikan, atau mengetahui orang terdekat mengalami peristiwa yang sangat mengancam, seperti kecelakaan berat, bencana, kekerasan fisik atau seksual, atau ancaman kematian?', 6, 0),
('G07', 'Takut pada situasi sosial', 'Apakah anda hampir selalu merasa sangat takut atau cemas dalam situasi sosial ketika anda mungkin diperhatikan atau dinilai orang lain, misalnya berbicara di depan umum, berkenalan dengan orang baru, atau makan di depan orang lain?', 7, 0),
('G08', 'Takut terjebak tanpa pertolongan di tempat umum', 'Apakah anda merasa sangat takut berada di tempat atau situasi tertentu karena khawatir sulit melarikan diri atau tidak ada yang menolong jika tiba-tiba muncul gejala panik atau gejala yang memalukan?', 8, 0),
('G09', 'Cemas berlebihan terhadap perpisahan', 'Apakah anda merasa takut atau cemas secara berlebihan dan tidak wajar jika harus berpisah dari orang yang sangat dekat dengan anda, seperti orang tua, pasangan, atau anak?', 9, 0),
('G10', 'Jantung berdebar kencang', 'Saat mengalami serangan panik (rasa takut atau tidak nyaman yang sangat hebat secara tiba-tiba), apakah jantung anda berdebar sangat kencang?', 10, 0),
('G11', 'Berkeringat atau gemetar', 'Saat mengalami serangan panik (rasa takut atau tidak nyaman yang sangat hebat secara tiba-tiba), apakah anda berkeringat atau tubuh anda gemetar?', 11, 0),
('G12', 'Sesak napas atau rasa tercekik', 'Saat mengalami serangan panik (rasa takut atau tidak nyaman yang sangat hebat secara tiba-tiba), apakah anda merasa sesak napas atau seperti tercekik?', 12, 0),
('G13', 'Nyeri atau rasa tidak nyaman di dada', 'Saat mengalami serangan panik (rasa takut atau tidak nyaman yang sangat hebat secara tiba-tiba), apakah dada anda terasa nyeri atau tidak nyaman?', 13, 0),
('G14', 'Mual, pusing, atau rasa akan pingsan', 'Saat mengalami serangan panik (rasa takut atau tidak nyaman yang sangat hebat secara tiba-tiba), apakah anda merasa mual, pusing, atau seperti akan pingsan?', 14, 0),
('G15', 'Merasa tidak nyata atau terlepas dari diri', 'Saat mengalami serangan panik (rasa takut atau tidak nyaman yang sangat hebat secara tiba-tiba), apakah anda merasa sekitar anda tidak nyata, atau seperti terlepas dari diri sendiri?', 15, 0),
('G16', 'Takut kehilangan kendali atau mati', 'Saat mengalami serangan panik (rasa takut atau tidak nyaman yang sangat hebat secara tiba-tiba), apakah anda takut kehilangan kendali, menjadi gila, atau akan mati?', 16, 0),
('G17', 'Khawatir terus akan serangan berikutnya', 'Apakah anda terus-menerus khawatir akan mengalami serangan panik lagi, atau mengubah kebiasaan (misalnya menghindari tempat tertentu) agar tidak terkena serangan panik?', 17, 0),
('G18', 'Sulit mengendalikan rasa khawatir', 'Apakah anda merasa sulit menghentikan atau mengendalikan rasa khawatir anda tentang berbagai hal?', 18, 0),
('G19', 'Gelisah atau merasa tegang', 'Apakah anda sering merasa gelisah, tegang, atau tidak bisa tenang?', 19, 0),
('G20', 'Mudah lelah', 'Apakah anda mudah merasa lelah walaupun tidak banyak beraktivitas?', 20, 0),
('G21', 'Sulit berkonsentrasi atau pikiran terasa kosong', 'Apakah anda sering sulit berkonsentrasi, atau pikiran tiba-tiba terasa kosong?', 21, 0),
('G22', 'Mudah marah atau tersinggung', 'Apakah anda menjadi lebih mudah marah atau tersinggung?', 22, 0),
('G23', 'Otot terasa tegang atau kaku', 'Apakah otot-otot anda (misalnya leher, bahu, atau punggung) sering terasa tegang atau kaku?', 23, 0),
('G24', 'Gangguan tidur', 'Apakah anda sulit tidur, sering terbangun di malam hari, atau tidur terasa tidak nyenyak?', 24, 0),
('G25', 'Rasa takut muncul hampir setiap kali', 'Jika anda takut pada objek atau situasi tertentu (misalnya hewan, ketinggian, atau jarum suntik), apakah rasa takut itu muncul hampir setiap kali anda berhadapan dengannya?', 25, 0),
('G26', 'Menghindari objek atau situasi yang ditakuti', 'Apakah anda berusaha menghindari objek atau situasi tertentu yang anda takuti, atau menghadapinya dengan rasa takut yang sangat hebat?', 26, 0),
('G27', 'Ingatan, mimpi buruk, atau kilas balik', 'Apakah ingatan tentang peristiwa traumatis yang pernah anda alami sering muncul tanpa diinginkan, dalam bentuk mimpi buruk, atau terasa seperti terjadi lagi (kilas balik)?', 27, 0),
('G28', 'Reaksi kuat saat teringat peristiwa', 'Apakah anda merasa sangat cemas atau tubuh bereaksi kuat (berdebar, berkeringat) ketika ada hal, tempat, atau situasi yang mengingatkan pada peristiwa traumatis yang pernah anda alami?', 28, 0),
('G29', 'Menghindari hal yang mengingatkan peristiwa', 'Apakah anda berusaha keras menghindari pikiran, perasaan, orang, atau tempat yang mengingatkan pada peristiwa traumatis yang pernah anda alami?', 29, 0),
('G30', 'Perasaan negatif yang menetap', 'Sejak mengalami peristiwa traumatis, apakah anda terus merasakan perasaan negatif seperti takut, marah, bersalah, atau malu, atau terus menyalahkan diri sendiri maupun orang lain?', 30, 0),
('G31', 'Merasa terasing atau mati rasa', 'Sejak mengalami peristiwa traumatis, apakah anda merasa terasing dari orang lain atau sulit merasakan emosi positif seperti senang dan sayang?', 31, 0),
('G32', 'Sulit mengingat bagian penting peristiwa', 'Apakah anda sulit mengingat bagian penting dari peristiwa traumatis yang pernah anda alami?', 32, 0),
('G33', 'Mudah kaget atau selalu waspada', 'Apakah anda menjadi mudah kaget, atau selalu waspada berlebihan seolah bahaya bisa datang kapan saja?', 33, 0),
('G34', 'Takut dinilai negatif atau dipermalukan', 'Apakah anda takut akan bersikap atau menunjukkan kecemasan dengan cara yang memalukan sehingga dinilai negatif atau ditolak oleh orang lain?', 34, 0),
('G35', 'Menghindari situasi sosial', 'Apakah anda menghindari situasi sosial, seperti berbicara di depan umum atau bertemu orang baru, atau menjalaninya dengan rasa cemas yang sangat hebat?', 35, 0),
('G36', 'Takut naik transportasi umum', 'Apakah anda takut naik transportasi umum, seperti bus, kereta, atau pesawat, karena khawatir sulit menyelamatkan diri atau tidak ada yang menolong jika tiba-tiba panik?', 36, 0),
('G37', 'Takut berada di ruang terbuka', 'Apakah anda takut berada di ruang terbuka, seperti lapangan parkir, pasar, atau jembatan, karena khawatir sulit menyelamatkan diri atau tidak ada yang menolong jika tiba-tiba panik?', 37, 0),
('G38', 'Takut berada di ruang tertutup', 'Apakah anda takut berada di ruang tertutup, seperti toko, mal, atau bioskop, karena khawatir sulit menyelamatkan diri atau tidak ada yang menolong jika tiba-tiba panik?', 38, 0),
('G39', 'Takut mengantre atau berada di keramaian', 'Apakah anda takut mengantre atau berada di tengah keramaian karena khawatir sulit menyelamatkan diri atau tidak ada yang menolong jika tiba-tiba panik?', 39, 0),
('G40', 'Takut keluar rumah sendirian', 'Apakah anda takut keluar rumah sendirian karena khawatir sulit menyelamatkan diri atau tidak ada yang menolong jika tiba-tiba panik?', 40, 0),
('G41', 'Menghindari tempat tersebut atau harus ditemani', 'Apakah anda menghindari tempat-tempat seperti transportasi umum, keramaian, atau keluar rumah sendirian, hanya berani jika ditemani, atau menjalaninya dengan rasa takut yang hebat?', 41, 0),
('G42', 'Sangat tertekan saat berpisah', 'Apakah anda merasa sangat tertekan ketika akan atau sedang berpisah dari orang terdekat atau dari rumah?', 42, 0),
('G43', 'Khawatir orang terdekat celaka', 'Apakah anda terus-menerus khawatir orang terdekat akan celaka, sakit parah, atau meninggal?', 43, 0),
('G44', 'Khawatir peristiwa buruk akan memisahkan', 'Apakah anda khawatir akan terjadi peristiwa buruk (tersesat, diculik, kecelakaan) yang memisahkan anda dari orang terdekat?', 44, 0),
('G45', 'Enggan pergi jauh dari orang terdekat', 'Apakah anda enggan atau menolak pergi ke luar rumah, bekerja, atau bepergian karena takut berpisah?', 45, 0),
('G46', 'Takut sendirian atau tidur tanpa orang terdekat', 'Apakah anda takut sendirian, atau enggan tidur tanpa orang terdekat di dekat anda?', 46, 0),
('G47', 'Mimpi buruk tentang perpisahan', 'Apakah anda sering bermimpi buruk tentang perpisahan dengan orang terdekat?', 47, 0),
('G48', 'Keluhan fisik saat berpisah', 'Apakah anda mengalami keluhan fisik, seperti sakit kepala, sakit perut, atau mual, ketika akan berpisah dari orang terdekat?', 48, 0),
('G49', 'Mengganggu kehidupan sehari-hari', 'Apakah keluhan-keluhan yang anda rasakan membuat anda sangat tertekan, atau mengganggu pekerjaan, sekolah, maupun hubungan sosial anda?', 49, 1);

INSERT INTO `kriteria` (`id_kriteria`, `id_penyakit`, `urutan`, `minimal`) VALUES
(1, 'P1', 1, 1),
(2, 'P1', 2, 4),
(3, 'P1', 3, 1),
(4, 'P1', 4, 1),
(5, 'P2', 1, 1),
(6, 'P2', 2, 1),
(7, 'P2', 3, 3),
(8, 'P2', 4, 1),
(9, 'P3', 1, 1),
(10, 'P3', 2, 1),
(11, 'P3', 3, 1),
(12, 'P3', 4, 1),
(13, 'P4', 1, 1),
(14, 'P4', 2, 1),
(15, 'P5', 1, 1),
(16, 'P5', 2, 1),
(17, 'P5', 3, 1),
(18, 'P5', 4, 2),
(19, 'P5', 5, 2),
(20, 'P5', 6, 1),
(21, 'P6', 1, 1),
(22, 'P6', 2, 1),
(23, 'P6', 3, 1),
(24, 'P6', 4, 1),
(25, 'P7', 1, 1),
(26, 'P7', 2, 2),
(27, 'P7', 3, 1),
(28, 'P7', 4, 1),
(29, 'P8', 1, 1),
(30, 'P8', 2, 3),
(31, 'P8', 3, 1);

INSERT INTO `kriteria_gejala` (`id_kriteria`, `id_gejala`, `urutan`) VALUES
(1, 'G01', 1),
(2, 'G10', 1),
(2, 'G11', 2),
(2, 'G12', 3),
(2, 'G13', 4),
(2, 'G14', 5),
(2, 'G15', 6),
(2, 'G16', 7),
(3, 'G17', 1),
(4, 'G49', 1),
(5, 'G02', 1),
(6, 'G18', 1),
(7, 'G19', 1),
(7, 'G20', 2),
(7, 'G21', 3),
(7, 'G22', 4),
(7, 'G23', 5),
(7, 'G24', 6),
(8, 'G49', 1),
(9, 'G03', 1),
(10, 'G25', 1),
(11, 'G26', 1),
(12, 'G49', 1),
(13, 'G04', 1),
(13, 'G05', 2),
(14, 'G49', 1),
(15, 'G06', 1),
(16, 'G27', 1),
(16, 'G28', 2),
(17, 'G29', 1),
(18, 'G30', 1),
(18, 'G31', 2),
(18, 'G32', 3),
(19, 'G33', 1),
(19, 'G22', 2),
(19, 'G21', 3),
(19, 'G24', 4),
(20, 'G49', 1),
(21, 'G07', 1),
(22, 'G34', 1),
(23, 'G35', 1),
(24, 'G49', 1),
(25, 'G08', 1),
(26, 'G36', 1),
(26, 'G37', 2),
(26, 'G38', 3),
(26, 'G39', 4),
(26, 'G40', 5),
(27, 'G41', 1),
(28, 'G49', 1),
(29, 'G09', 1),
(30, 'G42', 1),
(30, 'G43', 2),
(30, 'G44', 3),
(30, 'G45', 4),
(30, 'G46', 5),
(30, 'G47', 6),
(30, 'G48', 7),
(31, 'G49', 1);

INSERT INTO `pengobatan` (`id_penyakit`, `urutan`, `isi`) VALUES
('P0', 1, 'Jaga pola tidur dan makan yang teratur, serta berolahraga secara rutin.'),
('P0', 2, 'Latih teknik relaksasi seperti pernapasan perlahan, dan biasakan meditasi mindfulness.'),
('P0', 3, 'Batasi konsumsi alkohol dan hindari narkoba.'),
('P0', 4, 'Jika suatu saat rasa cemas mulai mengganggu aktivitas sehari-hari, jangan ragu berkonsultasi dengan psikolog atau puskesmas terdekat.'),
('P1', 1, 'Psikoterapi berupa terapi kognitif perilaku (CBT) merupakan penanganan utama untuk gangguan panik.'),
('P1', 2, 'Antidepresan golongan SSRI dapat dipertimbangkan sesuai resep dan pengawasan psikiater. Benzodiazepin umumnya tidak direkomendasikan untuk gangguan kecemasan.'),
('P1', 3, 'Latihan pernapasan perlahan dan relaksasi dapat membantu meredakan gejala saat serangan muncul.'),
('P2', 1, 'Psikoterapi berupa terapi kognitif perilaku (CBT) atau relaksasi terapan (applied relaxation) merupakan penanganan utama.'),
('P2', 2, 'Antidepresan golongan SSRI (misalnya sertraline) atau SNRI dapat dipertimbangkan sesuai resep dan pengawasan psikiater.'),
('P2', 3, 'Olahraga teratur, tidur cukup, teknik relaksasi, serta membatasi kafein dan alkohol dapat membantu meringankan gejala.'),
('P3', 1, 'Psikoterapi, terutama terapi kognitif perilaku dengan pemaparan bertahap terhadap objek atau situasi yang ditakuti (exposure therapy), merupakan penanganan utama.'),
('P3', 2, 'Teknik relaksasi dapat membantu mengendalikan rasa takut selama proses terapi.'),
('P3', 3, 'Obat umumnya bukan penanganan utama untuk fobia spesifik; konsultasikan dengan psikiater bila diperlukan.'),
('P4', 1, 'Terapi kognitif perilaku dengan teknik exposure and response prevention (ERP) merupakan penanganan utama.'),
('P4', 2, 'Antidepresan golongan SSRI atau clomipramine dapat dipertimbangkan sesuai resep dan pengawasan psikiater.'),
('P4', 3, 'Dukungan keluarga dan edukasi tentang gangguan ini membantu proses pemulihan.'),
('P5', 1, 'Psikoterapi yang berfokus pada trauma merupakan penanganan utama, misalnya cognitive processing therapy (CPT), prolonged exposure (PE), trauma-focused CBT, atau eye movement desensitization and reprocessing (EMDR).'),
('P5', 2, 'Antidepresan golongan SSRI (misalnya sertraline) atau venlafaxine dapat dipertimbangkan sesuai resep dan pengawasan psikiater.'),
('P5', 3, 'Dukungan sosial dan kelompok dukungan sesama penyintas dapat membantu pemulihan.'),
('P6', 1, 'Terapi kognitif perilaku (CBT) individual yang dirancang khusus untuk kecemasan sosial merupakan penanganan utama.'),
('P6', 2, 'Antidepresan golongan SSRI (misalnya escitalopram atau sertraline) dapat dipertimbangkan sesuai resep dan pengawasan psikiater.'),
('P6', 3, 'Latihan menghadapi situasi sosial secara bertahap dapat membantu meningkatkan rasa percaya diri.'),
('P7', 1, 'Terapi kognitif perilaku (CBT) dengan pemaparan bertahap terhadap situasi yang ditakuti merupakan penanganan utama.'),
('P7', 2, 'Antidepresan golongan SSRI dapat dipertimbangkan sesuai resep dan pengawasan psikiater, terutama bila disertai serangan panik.'),
('P7', 3, 'Mulailah menghadapi situasi yang ditakuti secara perlahan, misalnya dengan ditemani orang yang dipercaya.'),
('P8', 1, 'Psikoterapi, terutama terapi kognitif perilaku (CBT) dengan latihan menghadapi perpisahan secara bertahap, merupakan penanganan utama.'),
('P8', 2, 'Pada anak dan remaja, terapi melibatkan orang tua atau keluarga.'),
('P8', 3, 'Obat dapat dipertimbangkan oleh psikiater bila gejala berat atau psikoterapi saja belum cukup.');

INSERT INTO `sumber` (`id_sumber`, `nomor`, `penulis`, `tahun`, `judul`, `penerbit`, `url`, `diakses`) VALUES
('dsm5tr', 1, 'American Psychiatric Association', '2022', 'Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition, Text Revision (DSM-5-TR)', 'American Psychiatric Association Publishing', 'https://www.psychiatry.org/psychiatrists/practice/dsm', '26 Oktober 2026'),
('apa-dsm-2026', 2, 'American Psychiatric Association', '2026', 'APA Releases Roadmap for the Future of the DSM', 'Psychiatry.org', 'https://www.psychiatry.org/news-room/news-releases/apa-releases-roadmap-for-future-of-dsm', '26 Oktober 2026'),
('icd11', 3, 'World Health Organization', '2026', 'International Classification of Diseases, 11th Revision (ICD-11), versi 2026-01', 'World Health Organization', 'https://icd.who.int/', '26 Oktober 2026'),
('ppdgj3', 4, 'Departemen Kesehatan RI, Direktorat Jenderal Pelayanan Medik', '1993', 'Pedoman Penggolongan dan Diagnosis Gangguan Jiwa di Indonesia III (PPDGJ-III)', 'Departemen Kesehatan RI', '', ''),
('who-anxiety-2026', 5, 'World Health Organization', '2026', 'Anxiety disorders (fact sheet, 15 September 2026)', 'World Health Organization', 'https://www.who.int/news-room/fact-sheets/detail/anxiety-disorders', '26 Oktober 2026'),
('who-wmht-2025', 6, 'World Health Organization', '2025', 'World mental health today: latest data', 'World Health Organization', 'https://www.who.int/publications/i/item/9789240113817', '26 Oktober 2026'),
('ski-2023', 7, 'Badan Kebijakan Pembangunan Kesehatan, Kementerian Kesehatan RI', '2024', 'Pemanfaatan Data SKI 2023 untuk Evaluasi Program', 'Kementerian Kesehatan RI', 'https://www.badankebijakan.kemkes.go.id/pemanfaatan-data-ski-2023-untuk-evaluasi-program/', '26 Oktober 2026'),
('inamhs-2022', 8, 'Wahdi, A. E., Wilopo, S. A., & Erskine, H. E.', '2023', 'The Prevalence of Adolescent Mental Disorders in Indonesia: An Analysis of Indonesia – National Mental Health Survey (I-NAMHS)', 'Journal of Adolescent Health', 'https://beph.fkkmk.ugm.ac.id/publikasi/the-prevalence-of-adolescent-mental-disorders-in-indonesia-an-analysis-of-indonesia-national-mental-health-survey-i-namhs/', '26 Oktober 2026'),
('healing119', 9, 'Kementerian Kesehatan RI', '2025', 'Healing119.id: Layanan Hotline Kesehatan Mental dan Bunuh Diri (119 ext 8)', 'Kementerian Kesehatan RI', 'https://www.healing119.id/', '26 Oktober 2026'),
('nice-cg113', 10, 'National Institute for Health and Care Excellence', '2011, diperbarui 2020', 'Generalised anxiety disorder and panic disorder in adults: management (CG113)', 'NICE', 'https://www.nice.org.uk/guidance/cg113', '26 Oktober 2026'),
('nice-cg159', 11, 'National Institute for Health and Care Excellence', '2013', 'Social anxiety disorder: recognition, assessment and treatment (CG159)', 'NICE', 'https://www.nice.org.uk/guidance/cg159', '26 Oktober 2026'),
('nice-ng116', 12, 'National Institute for Health and Care Excellence', '2018', 'Post-traumatic stress disorder (NG116)', 'NICE', 'https://www.nice.org.uk/guidance/ng116', '26 Oktober 2026'),
('nice-cg31', 13, 'National Institute for Health and Care Excellence', '2005', 'Obsessive-compulsive disorder and body dysmorphic disorder: treatment (CG31) — sedang diperbarui', 'NICE', 'https://www.nice.org.uk/guidance/cg31', '26 Oktober 2026'),
('apa-ptsd-2025', 14, 'American Psychological Association', '2025', 'Clinical Practice Guideline for the Treatment of Posttraumatic Stress Disorder (PTSD) in Adults', 'American Psychological Association', 'https://www.apa.org/monitor/2025/07-08/guidelines-treating-ptsd-trauma', '26 Oktober 2026');

INSERT INTO `penyakit_sumber` (`id_penyakit`, `id_sumber`) VALUES
('P0', 'who-anxiety-2026'),
('P1', 'dsm5tr'),
('P1', 'icd11'),
('P1', 'ppdgj3'),
('P1', 'nice-cg113'),
('P1', 'who-anxiety-2026'),
('P2', 'dsm5tr'),
('P2', 'icd11'),
('P2', 'ppdgj3'),
('P2', 'nice-cg113'),
('P2', 'who-anxiety-2026'),
('P3', 'dsm5tr'),
('P3', 'icd11'),
('P3', 'ppdgj3'),
('P3', 'who-anxiety-2026'),
('P4', 'dsm5tr'),
('P4', 'icd11'),
('P4', 'ppdgj3'),
('P4', 'nice-cg31'),
('P5', 'dsm5tr'),
('P5', 'icd11'),
('P5', 'ppdgj3'),
('P5', 'nice-ng116'),
('P5', 'apa-ptsd-2025'),
('P6', 'dsm5tr'),
('P6', 'icd11'),
('P6', 'ppdgj3'),
('P6', 'nice-cg159'),
('P6', 'who-anxiety-2026'),
('P7', 'dsm5tr'),
('P7', 'icd11'),
('P7', 'ppdgj3'),
('P7', 'nice-cg113'),
('P7', 'who-anxiety-2026'),
('P8', 'dsm5tr'),
('P8', 'icd11'),
('P8', 'ppdgj3'),
('P8', 'who-anxiety-2026');

-- akun contoh: username ilyas, password ilyas
INSERT INTO `user` (`id_user`, `nama_user`, `username`, `password`, `hak_akses`) VALUES
(1, 'ilyas', 'ilyas', '$2y$10$bX0lGhvApnjuaiCEisegue5D395raEFyb/i8Se30ejP.C6hrwuwAe', 'user');

COMMIT;
