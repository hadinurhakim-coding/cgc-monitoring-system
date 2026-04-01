import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
	console.error("Missing SUPABASE credentials in .env");
	process.exit(1);
}

const db = createClient(url, key);

const bonusItems = [
	{ code: "(B)A.1.1", text: "Apakah perusahaan menyediakan dan menerapkan mekanisme pemungutan suara secara elektronik, yang aman dan real-time, bagi Pemegang Saham yang tidak dapat hadir secara fisik dalam Rapat Umum Pemegang Saham (RUPS)?" },
	{ code: "(B)A.2.1", text: "Apakah perusahaan menerbitkan panggilan RUPS (dengan rincian agenda dan penjelasannya) yang diumumkan pada Pemegang Saham, paling lambat 28 hari sebelum tanggal rapat (RUPS)?" },
	{ code: "(B)B.1.1", text: "Apakah perusahaan mengungkapkan cara mereka mengelola risiko dan peluang terkait perubahan iklim?" },
	{ code: "(B)B.1.2", text: "Apakah perusahaan mengungkapkan Laporan keberlanjutan/Sustainability Reporting miliknya yang terjamin secara eksternal?" },
	{ code: "(B)B.1.3", text: "Apakah perusahaan mengungkapkan saluran keterlibatan dengan kelompok pemangku kepentingan dan bagaimana perusahaan merespon perhatian pemangku kepentingan terhadap ESG?" },
	{ code: "(B)B.1.4", text: "Apakah perusahaan mempunyai unit/divisi/komite yang secara khusus bertanggung jawab mengelola urusan keberlanjutan?" },
	{ code: "(B)B.1.5", text: "Apakah perusahaan mengungkapkan pengawasan direksi/komisaris terhadap risiko dan peluang terkait keberlanjutan?" },
	{ code: "(B)B.1.6", text: "Apakah perusahaan mengungkapkan bagaimana pencapaian atau hasil keberlanjutan tahun sebelumnya mempengaruhi jumlah remunerasi yang diterima oleh direktur eksekutif dan manajemen senior?" },
	{ code: "(B)B.1.7", text: "Apakah Whistle Blowing System perusahaan dikelola oleh pihak / institusi independen?" },
	{ code: "(B)C.1.1", text: "Apakah laporan keuangan tahunan audited dirilis dalam waktu 60 hari dari akhir tahun keuangan?" },
	{ code: "(B)D.1.1", text: "Apakah perusahaan memiliki setidaknya satu orang Direksi/Komisaris Independen yang perempuan?" },
	{ code: "(B)D.1.2", text: "Apakah perusahaan memiliki kebijakan dan mengungkapkan indikator tujuan atas implementasi keberagaman Direksi dan Dewan Komisaris termasuk laporan perkembangan atas pencapaian tujuan tersebut?" },
	{ code: "(B)D.2.1", text: "Apakah Komite Nominasi seluruhnya terdiri dari Direksi/Komisaris independen?" },
	{ code: "(B)D.2.2", text: "Apakah Komite Nominasi melakukan proses identifikasi kandidat Direktur sejalan dengan arahan strategi Perusahaan?" },
	{ code: "(B)D.3.1", text: "Apakah perusahaan menggunakan jasa profesional dalam mencari kandidat Direksi/Dewan Komisaris (berdasarkan database Direksi maupun dari usulan pemegang saham)?" },
	{ code: "(B)D.4.1", text: "Apakah komposisi Komisaris Independen lebih dari 50% dari jumlah keseluruhan anggota Direksi/Dewan Komisaris?" },
	{ code: "(B)D.5.1", text: "Apakah perusahaan mengungkapkan bahwa Dewannya mengidentifikasi risiko utama terkait dengan teknologi informasi termasuk gangguan, keamanan siber, dan pemulihan bencana?" },
	{ code: "(B)D.6.1", text: "Apakah Perusahaan memiliki Komite Risiko secara terpisah?" }
];

const penaltyItems = [
	{ code: "(P)A.1.1", text: "Apakah perusahaan gagal atau lalai untuk menawarkan secara adil terkait pembelian kembali saham kepada para pemegang saham?" },
	{ code: "(P)A.2.1", text: "Apakah ada bukti hambatan yang mencegah pemegang saham saling berkomunikasi atau konsultasi dengan pemegang saham lainnya?" },
	{ code: "(P)A.3.1", text: "Apakah perusahaan memasukkan item agenda tambahan dan mendadak (darurat) ke dalam pemberitahuan RUPST/RUPSLB?" },
	{ code: "(P)A.3.2", text: "Apakah Komisaris Utama, Ketua Komite Audit dan direktur utama menghadiri RUPS terakhir?" },
	{ code: "(P)A.4.1", text: "Apakah perusahaan lalai untuk mengungkapkan adanya Kesepakatan dengan Pemegang Saham?" },
	{ code: "(P)A.4.2", text: "Apakah perusahaan lalai untuk mengungkapkan adanya Kekuatan lebih yang dimiliki Pemegang Saham dalam mempengaruhi Perusahaan melalui voting?" },
	{ code: "(P)A.4.3", text: "Apakah perusahaan lalai untuk mengungkapkan adanya Hak suara ganda?" },
	{ code: "(P)A.5.1", text: "Adakah struktur kepemilikan saham Perusahaan berbentuk piramid dan/atau kepemilikan saham secara silang, jelas terlihat?" },
	{ code: "(P)A.6.1", text: "Pernahkah ada hukuman terhadap insider trading yang melibatkan Direksi/Dewan Komisaris, manajemen dan karyawan dalam tiga tahun terakhir?" },
	{ code: "(P)A.7.1", text: "Apakah ada kasus ketidakpatuhan terhadap hukum, peraturan dan regulasi yang berkaitan dengan transaksi pihak berelasi yang material dalam tiga tahun terakhir?" },
	{ code: "(P)A.7.2", text: "Apakah ada transaksi pihak berelasi yang dapat digolongkan sebagai bantuan keuangan untuk entitas selain anak perusahaan yang dimiliki secara penuh?" },
	{ code: "(P)B.1.1", text: "Pernahkah ada pelanggaran hukum yang berkaitan dengan perburuhan/ketenagakerjaan/konsumen/kepailitan/komersial/kompetisi atau isu-isu lingkungan?" },
	{ code: "(P)B.2.1", text: "Apakah Perusahaan telah mendapatkan sanksi dari regulator terkait kelalaian dalam membuat pengumuman sesuai periode waktu?" },
	{ code: "(P)B.2.2", text: "Apakah terdapat bukti bahwa perusahaan melakukan kegiatan greenwashing (informasi palsu/menyesatkan terkait produk yang ramah lingkungan)?" },
	{ code: "(P)C.1.1", text: "Apakah laporan keuangan perusahaan mendapatkan \"pendapat wajar dengan pengecualian\" dari auditor eksternal?" },
	{ code: "(P)C.1.2", text: "Apakah laporan keuangan perusahaan mendapatkan \"pendapat tidak wajar\" dari auditor eksternal?" },
	{ code: "(P)C.1.3", text: "Apakah laporan keuangan perusahaan mendapatkan opini \"menolak memberi pendapat\" dari auditor eksternal?" },
	{ code: "(P)C.1.4", text: "Apakah perusahaan telah merevisi laporan keuangan tahun lalu di luar alasan perubahan kebijakan akuntansi?" },
	{ code: "(P)D.1.1", text: "Apakah ada bukti bahwa perusahaan tidak mematuhi peraturan dan ketentuan pencatatan selain peraturan pengungkapan selama setahun terakhir?" },
	{ code: "(P)D.1.2", text: "Apakah pernah terjadi kasus dimana Direksi/ Dewan Komisaris non eksekutif mengundurkan diri dan mengangkat isu-isu yang berkaitan dengan tata kelola?" },
	{ code: "(P)D.2.1", text: "Apakah perusahaan mempunyai direktur/komisaris independen yang telah menjabat lebih dari sembilan tahun atau dua periode masing-masing lima tahun?" },
	{ code: "(P)D.2.2", text: "Apakah perusahaan gagal mengidentifikasi dengan tepat gambaran seluruh direkturnya sebagai independen, non-eksekutif, dan eksekutif?" },
	{ code: "(P)D.2.3", text: "Apakah perusahaan mempunyai direktur /komisaris independen yang menjabat di lebih dari lima dewan di perusahaan publik?" },
	{ code: "(P)D.3.1", text: "Apakah ada di antara direktur atau manajemen senior yang merupakan mantan karyawan atau mitra auditor eksternal saat ini (dalam 2 tahun terakhir)?" },
	{ code: "(P)D.4.1", text: "Apakah Komisaris Utama pernah menjabat sebagai Direktur Utama perusahaan dalam tiga tahun terakhir?" },
	{ code: "(P)D.4.2", text: "Apakah non eksekutif direktur/komisaris menerima saham hasil kinerja atau bonus?" }
];

async function seed() {
	console.log("Seeding ACGS Parts...");
	const { error: partErr } = await db.from("acgs_parts").upsert([
		{
			code: "BONUS",
			title_en: "LEVEL 2 (BONUS ITEMS)",
			title_id: "LEVEL 2 (ITEM BONUS)",
			sort_order: 100
		},
		{ code: "PENALTY", title_en: "LEVEL 2 (PENALTY ITEMS)", title_id: "LEVEL 2 (PENALTY ITEMS)", sort_order: 200 }
	]);
	if (partErr) throw partErr;

	console.log("Seeding ACGS Sections...");
	const { error: secBErr } = await db.from("acgs_sections").upsert({ code: "ALL_BONUS", part_code: "BONUS", title_en: "BONUS ITEMS", title_id: "BONUS ITEMS", sort_order: 1 });
	const { error: secPErr } = await db.from("acgs_sections").upsert({ code: "ALL_PENALTY", part_code: "PENALTY", title_en: "PENALTY ITEMS", title_id: "PENALTY ITEMS", sort_order: 1 });
	if (secBErr) throw secBErr;
	if (secPErr) throw secPErr;

	const { data: bSec } = await db.from("acgs_sections").select("id").eq("code", "ALL_BONUS").single();
	const { data: pSec } = await db.from("acgs_sections").select("id").eq("code", "ALL_PENALTY").single();

	if (!bSec || !pSec) throw new Error("Sections not found");

	console.log("Seeding ACGS Questions...");
	const qs = [
		...bonusItems.map((item, i) => ({ section_id: bSec.id, code: item.code, question_en: item.text, question_id: item.text, sort_order: i + 1 })),
		...penaltyItems.map((item, i) => ({ section_id: pSec.id, code: item.code, question_en: item.text, question_id: item.text, sort_order: i + 1 }))
	];

	for (const q of qs) {
		const { error } = await db.from("acgs_questions").upsert(q, { onConflict: "code" });
		if (error) {
			console.error("Failed to insert question:", q.code, error.message);
		}
	}

	console.log("Seeding complete!");
}

seed().catch(console.error);
