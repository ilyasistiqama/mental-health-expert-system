// Basis pengetahuan sistem pakar (sebelumnya tabel penyakit & gjl_khusus di database)

export const PENYAKIT = {
    P0: {
        nama: "Tidak Terdeteksi Gangguan Kecemasan",
        singkat: "Tidak terdeteksi gangguan",
        deskripsi: "Berdasarkan jawaban anda, sistem tidak menemukan kecenderungan gangguan kecemasan. Rasa cemas sesekali adalah hal yang normal dan bahkan bisa membantu kita lebih waspada.",
        pengobatan: [
            "Jaga pola tidur, makan teratur, dan aktivitas fisik secara rutin.",
            "Luangkan waktu untuk relaksasi, misalnya latihan pernapasan atau meditasi.",
            "Jika suatu saat rasa cemas mulai mengganggu aktivitas sehari-hari, jangan ragu berkonsultasi dengan psikolog."
        ]
    },
    P1: {
        nama: "Gangguan Panik",
        singkat: "Serangan panik berulang",
        deskripsi: "Terjadinya serangan panik berulang, yang merupakan episode teror yang luar biasa disertai dengan simtom fisiologis yang kuat, pikiran-pikiran tentang bahaya yang segera datang atau malapetaka yang akan tiba, dan dorongan untuk melarikan diri.",
        pengobatan: [
            "Melakukan psikoterapi secara rutin. Psikoterapi yang sering digunakan adalah terapi kognitif perilaku (cognitive behavioral therapy).",
            "Mengonsumsi obat-obatan antiansietas (Selective serotonin reuptake inhibitors (SSRI), seperti fluoxetine atau sertraline), (benzodiazepine, seperti alprazolam atau clonazepam), atau (Serotonin and norepinephrine reuptake inhibitors (SNRI), seperti venlafaxine) untuk mengurangi gejala gangguan panik sesuai dengan resep yang diberikan oleh dokter."
        ]
    },
    P2: {
        nama: "Gangguan Kecemasan Menyeluruh",
        singkat: "Cemas persisten tanpa pemicu khusus",
        deskripsi: "Kecemasan yang persisten yang tidak terbatas pada suatu situasi tertentu.",
        pengobatan: [
            "Melakukan psikoterapi secara rutin. Psikoterapi yang sering digunakan untuk pengobatan Gangguan Kecemasan Menyeluruh adalah Terapi Perilaku Kognitif.",
            "Mengonsumsi obat-obatan untuk meringankan gejala yang dialami. Seperti, Antidepresan (escitalopram, paroxetine, sertraline, fluoxetine, dan citalopram) dan Antikecemasan sesuai dengan resep yang diberikan oleh dokter."
        ]
    },
    P3: {
        nama: "Gangguan Fobia",
        singkat: "Takut berlebihan pada objek/situasi",
        deskripsi: "Ketakutan yang berlebihan terhadap objek atau situasi tertentu.",
        pengobatan: [
            "Melakukan psikoterapi secara rutin. Psikoterapi yang paling efektif untuk pengobatan Gangguan Fobia adalah Terapi Perilaku Kognitif.",
            "Melakukan terapi mengendalikan diri. Misalkan teknik relaksasi dan juga teknik visualisasi.",
            "Mengonsumsi obat-obatan untuk meringankan gejala yang dialami. Seperti, Penghambat pelepasan serotonin (SSRIs), Penghambat beta (beta blockers), dan Benzodiazepine sesuai dengan resep yang diberikan oleh dokter."
        ]
    },
    P4: {
        nama: "Gangguan Obsesif-Kompulsif",
        singkat: "Pikiran & perilaku berulang",
        deskripsi: "Obsesi berulang (pikiran intrusif yang berulang) dan atau kompulsi (tingkah laku repetitif yang dirasakan sebagai sesuatu yang harus dilakukan).",
        pengobatan: [
            "Melakukan psikoterapi secara rutin. Psikoterapi yang sering digunakan untuk pengobatan Gangguan Obsesif-Kompulsif adalah Terapi Perilaku Kognitif.",
            "Mengonsumsi obat-obatan untuk mengontrol gejala yang dialami. Seperti, antidepresan atau obat pengurang stres (Clomipramine (Anafranil), Fluvoxamine (Luvox CR), Fluoxetine (Prozac), Paroxetine (Paxil, Pexeva), Sertraline (Zoloft)) sesuai dengan resep yang diberikan oleh dokter."
        ]
    },
    P5: {
        nama: "Gangguan Stres Traumatis",
        singkat: "Reaksi berkepanjangan setelah trauma",
        deskripsi: "Reaksi maladaptif akut yang segera timbul setelah peristiwa traumatis (gangguan stres akut) atau reaksi maladaptif berkelanjutan terhadap suatu peristiwa traumatis (gangguan stres pasca trauma).",
        pengobatan: [
            "Melakukan psikoterapi secara rutin. Psikoterapi untuk pengobatan Gangguan Stres Traumatis terdiri dari terapi perilaku kognitif atau cognitive behavioural therapy (CBT), terapi desensitisasi gerakan mata dan pemrosesan ulang atau eye movement desensitisation and reprocessing (EMDR), terapi penyingkapan (exposure therapy), dan terapi kelompok.",
            "Mengonsumsi obat-obatan untuk mengontrol gejala yang dialami. Seperti, Antidepresan (mirtazapine, amitriptyline, dan phenelzine), Prazosin, dan Antiansietas sesuai dengan resep yang diberikan oleh dokter."
        ]
    }
};

// Pohon keputusan forward chaining. ya/tidak berisi id pertanyaan berikutnya,
// "f" berarti konsultasi selesai. Pertanyaan 12 = tidak terdeteksi (P0),
// pertanyaan 13 = konfirmasi gejala sudah dialami selama 2 minggu.
export const GEJALA = {
    1: { gejala: "Kehilangan Kendali", pertanyaan: "Apakah anda pernah tiba-tiba merasakan kehilangan kendali?", penyakit: "P1", ya: 13, tidak: 2 },
    2: { gejala: "Merasa Tegang", pertanyaan: "Ketika anda merasa cemas, apakah anda sering merasakan tegang berlebih?", penyakit: "P2", ya: 3, tidak: 7 },
    3: { gejala: "Was-was", pertanyaan: "Apakah ketika anda melakukan sesuatu atau saat beraktivitas, anda sering terjebak dalam pikiran-pikiran negatif?", penyakit: "P2", ya: 4, tidak: 5 },
    4: { gejala: "Khawatir", pertanyaan: "Saat anda meninggalkan rumah, apakah anda sering merasa khawatir apakah pintu rumah anda sudah dikunci atau belum?", penyakit: "P2", ya: 5, tidak: 6 },
    5: { gejala: "Susah tidur", pertanyaan: "Apakah anda sering susah tidur walaupun anda merasakan kantuk?", penyakit: "P2", ya: 6, tidak: 7 },
    6: { gejala: "Susah berkonsentrasi", pertanyaan: "Apakah saat anda beraktivitas atau mengerjakan sesuatu anda sulit untuk berkonsentrasi?", penyakit: "P2", ya: 13, tidak: 13 },
    7: { gejala: "Takut terhadap sesuatu secara berlebihan", pertanyaan: "Apakah anda sering merasakan ketakutan yang luar biasa terhadap sesuatu atau kondisi tertentu?", penyakit: "P3", ya: 13, tidak: 8 },
    8: { gejala: "Memikirkan sesuatu secara berlebihan", pertanyaan: "Apakah anda takut ketika memulai sesuatu yang baru?", penyakit: "P4", ya: 9, tidak: 10 },
    9: { gejala: "Gelisah", pertanyaan: "Pernahkah anda merasakan kegelisahan yang luar biasa terhadap sesuatu yang sedang anda alami?", penyakit: "P4", ya: 13, tidak: 13 },
    10: { gejala: "Sulit menyesuaikan diri pada situasi yang mirip dengan kejadian tidak menyenangkan yang pernah terjadi", pertanyaan: "Apakah anda pernah berada di suatu tempat yang mirip dengan tempat anda mengalami kejadian buruk di masa lalu, lalu merasa kejadian itu akan terulang kembali dan mengalami kecemasan yang berlebih?", penyakit: "P5", ya: 11, tidak: 12 },
    11: { gejala: "Pikiran terasa kosong", pertanyaan: "Apakah anda sering memikirkan kejadian buruk yang pernah terjadi pada masa lalu?", penyakit: "P5", ya: 13, tidak: 13 },
    12: { gejala: "Tidak Terdeteksi", pertanyaan: "Anda tidak mengalami gangguan apapun.", penyakit: "P0", ya: "f", tidak: "f" },
    13: { gejala: "Menderita 2 Minggu", pertanyaan: "Apakah anda sudah mengalami gejala-gejala tersebut selama 2 minggu atau lebih?", penyakit: "P0", ya: "f", tidak: 12 }
};
