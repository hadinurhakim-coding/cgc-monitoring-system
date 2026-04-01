import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db = createClient(url, key);

const newData = [
  {
    "section_id": "SECTION_ID_A",
    "code": "(B)A.1",
    "question_en": "Right to participate effectively in and vote in general shareholders meeting and should be informed of the rules, including voting procedures, that govern general shareholders meeting.",
    "question_id": "Hak untuk berpartisipasi secara efektif dan memberikan suara dalam Rapat Umum Pemegang Saham dan harus diberitahu terkait aturan, termasuk prosedur pemungutan suara, yang mengatur Rapat Umum Pemegang Saham.",
    "sort_order": 1,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_A",
    "code": "(B)A.1.1",
    "question_en": "Does the company practice real time secure electronic voting in absentia at general meetings of shareholders?",
    "question_id": "Apakah perusahaan menyediakan dan menerapkan mekanisme pemungutan suara secara elektronik, yang aman dan real-time, bagi Pemegang Saham yang tidak dapat hadir secara fisik dalam Rapat Umum Pemegang Saham (RUPS)?",
    "sort_order": 2,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_A",
    "code": "(B)A.2.1",
    "question_en": "Does the company release its notice of AGM (with detailed agendas and explanatory circulars), as announced to the Exchange, at least 28 days before the date of the meeting?",
    "question_id": "Apakah perusahaan menerbitkan panggilan RUPS (dengan rincian agenda dan penjelasannya) yang diumumkan pada Pemegang Saham, paling lambat 28 hari sebelum tanggal rapat (RUPS)?",
    "sort_order": 3,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_B",
    "code": "(B)B.1.1",
    "question_en": "Does the company disclose how it manages climate-related risks and opportunities?",
    "question_id": "Apakah perusahaan mengungkapkan cara mereka mengelola risiko dan peluang terkait perubahan iklim?",
    "sort_order": 3,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_B",
    "code": "(B)B.1.2",
    "question_en": "Does the company disclose that its Sustainability Report / Sustainability Reporting is externally assured?",
    "question_id": "Apakah perusahaan mengungkapkan Laporan keberlanjutan/Sustainability Reporting miliknya yang terjamin secara eksternal?",
    "sort_order": 4,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_B",
    "code": "(B)B.1.3",
    "question_en": "Does the company disclose the engagement channel with stakeholder group and how the company responds to stakeholders' ESG concerns?",
    "question_id": "Apakah perusahaan mengungkapkan saluran keterlibatan dengan kelompok pemangku kepentingan dan bagaimana perusahaan merespon perhatian pemangku kepentingan terhadap ESG?",
    "sort_order": 5,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_B",
    "code": "(B)B.1.4",
    "question_en": "Does the company have a unit / division/committee who is specifically responsible to manage the sustainability matters?",
    "question_id": "Apakah perusahaan mempunyai unit/divisi/komite yang secara khusus bertanggung jawab mengelola urusan keberlanjutan?",
    "sort_order": 6,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_B",
    "code": "(B)B.1.5",
    "question_en": "Does the company disclose board of directors/commissioners' oversight of sustainability-related risks and opportunities?",
    "question_id": "Apakah perusahaan mengungkapkan pengawasan direksi/komisaris terhadap risiko dan peluang terkait keberlanjutan?",
    "sort_order": 7,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_B",
    "code": "(B)B.1.6",
    "question_en": "Does the company disclose the linkage between executive directors and senior management remuneration and sustainability performance for the previous year?",
    "question_id": "Apakah perusahaan mengungkapkan bagaimana pencapaian atau hasil keberlanjutan tahun sebelumnya mempengaruhi jumlah remunerasi yang diterima oleh direktur eksekutif dan manajemen senior?",
    "sort_order": 8,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_B",
    "code": "(B)B.1.7",
    "question_en": "Is the company's Whistle Blowing System managed by independent parties / institutions?",
    "question_id": "Apakah Whistle Blowing System perusahaan dikelola oleh pihak / institusi independen?",
    "sort_order": 9,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_C",
    "code": "(B)C.1.1",
    "question_en": "Are the audited annual financial report/statement released within 60 days from the financial year end?",
    "question_id": "Apakah laporan keuangan tahunan audited dirilis dalam waktu 60 hari dari akhir tahun keuangan?",
    "sort_order": 10,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_D",
    "code": "(B)D.1.1",
    "question_en": "Does the company have at least one female independent director/commissioner?",
    "question_id": "Apakah perusahaan memiliki setidaknya satu orang Direksi/Komisaris Independen yang perempuan?",
    "sort_order": 11,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_D",
    "code": "(B)D.1.2",
    "question_en": "Does the company have a policy and disclose measurable objectives for implementing its board diversity and report on progress in achieving its objectives?",
    "question_id": "Apakah perusahaan memiliki kebijakan dan mengungkapkan indikator tujuan atas implementasi keberagaman Direksi dan Dewan Komisaris termasuk laporan perkembangan atas pencapaian tujuan tersebut?",
    "sort_order": 12,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_D",
    "code": "(B)D.2.1",
    "question_en": "Is the Nominating Committee comprise entirely of independent directors/commissioners?",
    "question_id": "Apakah Komite Nominasi seluruhnya terdiri dari Direksi/Komisaris independen?",
    "sort_order": 13,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_D",
    "code": "(B)D.2.2",
    "question_en": "Does the Nominating Committee undertake the process of identifying the quality of directors aligned with the company' strategic directions?",
    "question_id": "Apakah Komite Nominasi melakukan proses identifikasi kandidat Direktur sejalan dengan arahan strategi Perusahaan?",
    "sort_order": 14,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_D",
    "code": "(B)D.3.1",
    "question_en": "Does the company use professional search firms or other external sources of candidates (such as director databases set up by director or shareholder bodies) when searching for candidates to the board of directors/ commissioners?",
    "question_id": "Apakah perusahaan menggunakan jasa profesional dalam mencari kandidat Direksi/Dewan Komisaris (berdasarkan database Direksi maupun dari usulan pemegang saham)?",
    "sort_order": 15,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_D",
    "code": "(B)D.4.1",
    "question_en": "Do independent non-executive directors/commissioners make up more than 50% of the board of directors/commissioners for a company with independent chairman?",
    "question_id": "Apakah komposisi Komisaris Independen lebih dari 50% dari jumlah keseluruhan anggota Direksi/Dewan Komisaris?",
    "sort_order": 16,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_D",
    "code": "(B)D.5.1",
    "question_en": "Does the company disclose that its Board identified key risk in relation to information technology including disruption, cyber security, and disaster recovery, to ensure that such risks are managed and integrated into the overall risk management framework?",
    "question_id": "Apakah perusahaan mengungkapkan bahwa Dewannya mengidentifikasi risiko utama terkait dengan teknologi informasi termasuk gangguan, keamanan siber, dan pemulihan bencana, untuk memastikan bahwa risiko tersebut dikelola dan diintegrasikan ke dalam kerangka manajemen risiko secara keseluruhan?",
    "sort_order": 17,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_D",
    "code": "(B)D.6.1",
    "question_en": "Does the company have a separate board level Risk Committee?",
    "question_id": "Apakah Perusahaan memiliki Komite Risiko secara terpisah?",
    "sort_order": 18,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_PENALTY",
    "code": "(P)A.1.1",
    "question_en": "Did the company fail or neglect to offer equal treatment for share repurchases to all shareholders?",
    "question_id": "Apakah perusahaan gagal atau lalai untuk menawarkan secara adil terkait pembelian kembali saham kepada para pemegang saham?",
    "sort_order": 19,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_PENALTY",
    "code": "(P)A.2.1",
    "question_en": "Is there evidence of barriers that prevent shareholders from communicating or consulting with other shareholders?",
    "question_id": "Apakah ada bukti hambatan yang mencegah pemegang saham saling berkomunikasi atau konsultasi dengan pemegang saham lainnya?",
    "sort_order": 20,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_PENALTY",
    "code": "(P)A.3.1",
    "question_en": "Did the company include any additional and unannounced agenda item into the notice of AGM/EGM?",
    "question_id": "Apakah perusahaan memasukkan item agenda tambahan dan mendadak (darurat) ke dalam pemberitahuan RUPST/RUPSLB?",
    "sort_order": 21,
    "is_active": true
  },
  {
    "section_id": "SECTION_ID_PENALTY",
    "code": "(P)A.3.2",
    "question_en": "Was the Chairman of the Board and the Chairmen of all Board Committees and the CEO absent from the most recent General Meeting?",
    "question_id": "Apakah Komisaris Utama, Ketua Komite Audit dan direktur utama menghadiri RUPS terakhir?",
    "sort_order": 22,
    "is_active": true
  }
];

const newSections = [
  { part_code: 'BONUS', code: '(B)A', title_en: 'RIGHTS AND EQUITABLE TREATMENT OF SHAREHOLDERS', title_id: 'HAK-HAK DAN PERLAKUAN SETARA TERHADAP PEMEGANG SAHAM', sort_order: 1 },
  { part_code: 'BONUS', code: '(B)B', title_en: 'BONUS - Role of Stakeholders', title_id: 'BONUS - Peran Pemangku Kepentingan', sort_order: 2 },
  { part_code: 'BONUS', code: '(B)C', title_en: 'BONUS - Disclosure and Transparency', title_id: 'BONUS - Pengungkapan dan Transparansi', sort_order: 3 },
  { part_code: 'BONUS', code: '(B)D', title_en: 'BONUS - Responsibilities of the Board', title_id: 'BONUS - Tanggung Jawab Dewan', sort_order: 4 },
  { part_code: 'PENALTY', code: '(P)A', title_en: 'PENALTY', title_id: 'PENALTI', sort_order: 1 }
];

async function updateLevel2() {
  console.log("Starting Level 2 Update...");

  const { error: partUpdError } = await db.from("acgs_parts").upsert(
    {
      code: "BONUS",
      title_en: "LEVEL 2 (BONUS ITEMS)",
      title_id: "LEVEL 2 (ITEM BONUS)",
      sort_order: 100
    },
    { onConflict: "code" }
  );
  if (partUpdError) {
    console.error("Failed to update BONUS part titles:", partUpdError);
  }

  // 1. Delete old questions ((B)% and (P)%)
  const { data: qBonus, error: qbError } = await db.from("acgs_questions").delete().like('code', '(B)%');
  console.log("Deleted old (B) questions:", qbError || "Success");

  const { data: qPenalty, error: qpError } = await db.from("acgs_questions").delete().like('code', '(P)%');
  console.log("Deleted old (P) questions:", qpError || "Success");

  // 2. Delete old sections (part_code BONUS or PENALTY)
  const { error: sError } = await db.from("acgs_sections").delete().in('part_code', ['BONUS', 'PENALTY']);
  console.log("Deleted old BONUS/PENALTY sections:", sError || "Success");

  // 3. Insert new sections
  const { data: insertedSections, error: isError } = await db.from("acgs_sections").insert(newSections).select();
  if (isError) {
    console.error("Failed to insert sections:", isError);
    process.exit(1);
  }
  console.log("Inserted new sections successfully.");

  // Create a map from our placeholder strings to the newly generated UUIDs
  const sectionMap: Record<string, string> = {};
  insertedSections.forEach(s => {
    if (s.code === '(B)A') sectionMap['SECTION_ID_A'] = s.id;
    if (s.code === '(B)B') sectionMap['SECTION_ID_B'] = s.id;
    if (s.code === '(B)C') sectionMap['SECTION_ID_C'] = s.id;
    if (s.code === '(B)D') sectionMap['SECTION_ID_D'] = s.id;
    if (s.code === '(P)A') sectionMap['SECTION_ID_PENALTY'] = s.id;
  });

  console.log("Section Map:", sectionMap);

  // 4. Map questions to actual section IDs
  const questionsToInsert = newData.map(q => ({
    section_id: sectionMap[q.section_id],
    code: q.code,
    question_en: q.question_en,
    question_id: q.question_id,
    sort_order: q.sort_order,
    is_active: q.is_active
  }));

  // 5. Insert newly mapped questions
  const { error: iqError } = await db.from("acgs_questions").insert(questionsToInsert);
  if (iqError) {
    console.error("Failed to insert new questions:", iqError);
  } else {
    console.log(`Successfully inserted ${questionsToInsert.length} level 2 questions!`);
  }
}

updateLevel2().catch(console.error);
