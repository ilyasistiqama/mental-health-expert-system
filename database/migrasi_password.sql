-- Jalankan sekali di database lama agar kolom password muat hash (password_hash butuh 60+ karakter)
ALTER TABLE `user` MODIFY `password` varchar(255) NOT NULL;
