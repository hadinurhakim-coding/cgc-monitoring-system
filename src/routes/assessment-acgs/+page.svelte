<script lang="ts">
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
</script>

<Sidebar.Provider
  style="--sidebar-width: calc(var(--spacing) * 80); --header-height: calc(var(--spacing) * 14);"
>
  <AppSidebar
    variant="inset"
    user={{ name: "Pengguna", email: "user@example.com", avatarUrl: null }}
  />
  <Sidebar.Inset>
    <header
      class="bg-background sticky top-0 z-20 flex h-(--header-height) items-center gap-3 border-b px-4 md:px-6"
    >
      <Sidebar.Trigger class="-ms-1" />
      <Separator
        orientation="vertical"
        class="data-[orientation=vertical]:h-5"
      />
      <h1 class="text-lg font-semibold">ASSESSMENT ACGS</h1>
    </header>

    <main
      class="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 overflow-hidden"
    >
      <div class="overflow-x-auto w-full border border-slate-900 rounded-sm">
        <table class="w-full border-collapse text-xs">
          <!-- HEADER -->
          <thead
            class="bg-[#002060] text-white text-center font-bold sticky top-0 z-10"
          >
            <tr>
              <th
                class="border border-slate-900 w-[8%] p-3 align-middle uppercase"
                >ITEM</th
              >
              <th
                class="border border-slate-900 w-[42%] p-3 align-middle uppercase leading-tight"
                >STANDAR TATA KELOLA<br />PERUSAHAAN</th
              >
              <th
                class="border border-slate-900 w-[15%] p-3 align-middle uppercase"
                >IMPLEMENTASI</th
              >
              <th
                class="border border-slate-900 w-[15%] p-3 align-middle uppercase"
                >EVIDENCE</th
              >
              <th
                class="border border-slate-900 w-[5%] p-3 align-middle uppercase leading-tight"
                >STATUS<br />YES OR NO</th
              >
              <th
                class="border border-slate-900 w-[15%] p-3 align-middle uppercase"
                >REKOMENDASI</th
              >
            </tr>
          </thead>

          <!-- BODY -->
          <tbody class="align-top">
            <!-- LEVEL ROW -->
            <tr class="bg-[#dce6f1]">
              <td
                colspan="6"
                class="border border-slate-900 p-1.5 align-top font-bold text-black uppercase"
              >
                LEVEL 1
              </td>
            </tr>

            <!-- PART ROW -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top font-bold">
                <div class="text-black uppercase">PART A</div>
                <div class="text-[#0070c0] uppercase">BAGIAN A</div>
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black uppercase">
                  RIGHTS AND EQUITABLE TREATMENT OF SHAREHOLDERS
                </div>
                <div class="text-[#0070c0] uppercase">
                  HAK-HAK DAN PERLAKUAN SETARA TERHADAP PEMEGANG SAHAM
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                A.1
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">Basic Shareholder Rights</div>
                <div class="text-[#0070c0]">Hak Dasar Pemegang Saham</div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.1.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company pay (interim and final/annual) dividends in
                  an equitable and timely manner; that is, all shareholders are
                  treated equally and paid within 30 days after being (i)
                  declared for interim dividends and (ii) approved by
                  shareholders at annual general meetings (AGM) for final
                  dividends? In case the company has offered scrip dividend, did
                  the company pay the dividend within 60 days.
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah Perusahaan membayarkan deviden (interim dan
                  final/tahunan)secara adil dan tepat waktu; yaitu, semua
                  pemegang saham diperlakukan sama dan dibayar dalam waktu 30
                  hari setelah (i) dividen interim telah dinyatakan dan (ii)
                  disetujui pada Rapat Umum Pemegang Saham Tahunan (RUPST) untuk
                  dividen final? Dalam hal perusahaan telah menawarkan dividen
                  scrip (tanda kesediaan membayar deviden), apakah perusahaan
                  membayar dividen dalam waktu 60 hari?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW A.2 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                A.2
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black italic">
                  Right to participate effectively in and vote in general
                  shareholder meetings and should be informed of the rules,
                  including voting procedures, that govern general shareholder
                  meetings.
                </div>
                <div class="text-[#0070c0] font-bold">
                  Hak untuk berpartisipasi secara efektif dan memberikan suara
                  dalam rapat umum pemegang saham dan harus mengetahui
                  peraturan, termasuk prosedur pemungutan suara, yang mengatur
                  rapat umum pemegang saham.
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify uppercase">
                  Do shareholders have the opportunity, evidenced by an agenda
                  item, to approve remuneration (fees, allowances,
                  benefit-in-kind and other emoluments) or any increases in
                  remuneration for the non-executive directors / commissioners?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah pemegang saham mempunyai kesempatan, yang dibuktikan
                  dengan mata acara, untuk menyetujui remunerasi (fee,
                  tunjangan, benefit natura, dan honorarium lainnya) atau
                  kenaikan remunerasi bagi non eksekutif direktur/komisaris?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company provide non-controlling shareholders a right
                  to nominate candidates for board of directors / commissioners?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan memberikan hak kepada pemegang saham
                  nonpengendali untuk mencalonkan calon direksi/komisaris?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.3</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company allow shareholders to elect directors /
                  commissioners individually?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan memperbolehkan pemegang saham memilih
                  direktur/komisaris secara individu?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.4</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose the voting procedures used before
                  the start of meeting?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan prosedur pemungutan suara yang
                  digunakan sebelum rapat dimulai?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.5</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Do the minutes of the most recent AGM record that the
                  shareholders were given the opportunity to ask questions and
                  the questions raised by shareholders and answers given
                  recorded?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah risalah RUPST terakhir mencatat bahwa pemegang saham
                  diberi kesempatan untuk mengajukan pertanyaan dan pertanyaan
                  yang diajukan pemegang saham serta jawaban yang diberikan
                  dicatat?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.6 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.6</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose the voting results including
                  approving, dissenting, and abstaining votes for all
                  resolutions/each agenda item for the most recent AGM?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan hasil pemungutan suara
                  termasuk suara setuju, tidak setuju, dan abstain untuk seluruh
                  keputusan/setiap mata acara RUPST terkini?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.7 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.7</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose the list of board members who
                  attended the most recent AGM?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan daftar anggota dewan komisaris
                  dan direksi yang menghadiri RUPST terakhir?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.8 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.8</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose that all board members and the CEO
                  (if he is not a board member) attended the most recent AGM?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan bahwa seluruh anggota dewan
                  direksi dan direktur utama menghadiri RUPST terakhir?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.9 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.9</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company allow voting in absentia?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Apakah memperbolehkan pemungutan suara tanpa kehadiran (voting
                  inabsentia).
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.10 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.10</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Did the company vote by poll (as opposed to by show of hands)
                  for all resolutions at the most recent AGM?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan memberikan suara melalui jajak pendapat
                  (bukan dengan mengacungkan tangan) untuk semua keputusan pada
                  RUPST terbaru?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.11 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.11</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose that it has appointed an independent
                  party (scrutineers/inspectors) to count and/or validate the
                  votes at the AGM?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan telah menunjuk pihak
                  independen (pengawas/pemeriksa) untuk menghitung dan/atau
                  memvalidasi suara dalam RUPST?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.12 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.12</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company make publicly available by the next working
                  day the result of the votes taken during the most recent
                  AGM/EGM for all resolutions?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengumumkan kepada publik pada hari kerja
                  berikutnya hasil pemungutan suara pada RUPST/RUPSLB terkini
                  untuk semua keputusan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.13 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.13</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company provide at least 21 days notice for all AGMs
                  and EGMs?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan memberikan pemberitahuan setidaknya 21 hari
                  sebelumnya untuk semua RUPST dan RUPSLB?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.14 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.14</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company provide the rationale and explanation for
                  each agenda item which require shareholders' approval in the
                  notice of AGM/circulars and/or the accompanying statement?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan memberikan alasan dan penjelasan atas setiap
                  mata acara yang memerlukan persetujuan pemegang saham dalam
                  pemanggilan RUPST/sirkuler dan/atau pernyataan yang
                  menyertainya?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.2.15 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.2.15</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company give the opportunity for shareholders to
                  place item/s on the agenda of general meetings and/or to
                  request for general meetings subject to a certain percentage?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan memberikan kesempatan kepada pemegang saham
                  untuk memasukkan mata acara rapat umum dan/atau meminta
                  diadakannya rapat umum dengan persentase tertentu?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW A.3 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                A.3
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black italic">
                  Markets for corporate control should be allowed to function in
                  an efficient and transparent manner.
                </div>
                <div class="text-[#0070c0] font-bold uppercase">
                  Pasar untuk pengendalian perusahaan harus diizinkan agar
                  berfungsi secara efisien dan transparan.
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.3.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.3.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  In cases of mergers, acquisitions and/or takeovers requiring
                  shareholders' approval, does the board of
                  directors/commissioners of the company appoint an independent
                  party to evaluate the fairness of the transaction price?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Dalam kasus merger, akuisisi dan/atau pengambilalihan, yang
                  melibatkan pemegang saham, apakah direksi/dewan komisaris
                  perusahaan menunjuk pihak independen untuk mengevaluasi
                  kewajaran harga transaksi?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW A.4 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                A.4
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black italic">
                  The exercise of ownership rights by all shareholders,
                  including institutional investors, should be facilitated.
                </div>
                <div class="text-[#0070c0] font-bold">
                  Pelaksanaan hak-hak kepemilikan oleh seluruh pemegang saham,
                  termasuk investor kelembagaan, harus difasilitasi.
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.4.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.4.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose its practice to encourage
                  shareholders to engage with the company beyond general
                  meetings?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan praktiknya untuk mendorong
                  pemegang saham terlibat dengan perusahaan di luar rapat umum?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW A.5 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                A.5
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">Shares and voting rights</div>
                <div class="text-[#0070c0]">
                  Hak suara dan kepemilikan saham
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.5.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.5.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Where the company has more than one class of shares, does the
                  company publicise the voting rights attached to each class of
                  shares (e.g. through the company website/reports/the stock
                  exchange/the regulator's website)?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apabila perusahaan memiliki lebih dari satu kelas saham,
                  apakah perusahaan mempublikasikan hak suara yang melekat pada
                  masing-masing kelas saham (misalnya melalui situs yang
                  dimiliki perusahaan/laporan/Bursa/situs regulator?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW A.6 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                A.6
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">Notice of AGM</div>
                <div class="text-[#0070c0]">Pemberitahuan RUPST</div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.6.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.6.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does each of the resolutions tabled at the most recent annual
                  general meeting deal with only one item, i.e., there is no
                  bundling of several items into the same resolution?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah setiap keputusan yang diambil pada rapat umum tahunan
                  terakhir hanya membahas satu hal saja, yaitu tidak ada
                  penggabungan beberapa hal menjadi satu keputusan yang sama?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.6.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.6.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Are the company's notice of the most recent AGM/circulars
                  fully translated into English and published on the same date
                  as the local-language version?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah Perusahaan menerjemahkan pemberitahuan RUPS ke dalam
                  bahasa Inggris dan diterbitkan pada waktu yang sama dalam
                  versi bahasa lokal?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.6.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.6.3</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Are the profiles of directors/commissioners (at least age,
                  academic qualification, date of first appointment, experience,
                  and directorships in other listed companies) in seeking
                  election/re-election included?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah profil direksi/dewan komisaris (setidaknya usia,
                  kualifikasi, tanggal penunjukan awal, pengalaman, dan jabatan
                  direktur di perusahaan lain) dalam pemilihan/pemilihan kembali
                  tersedia?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.6.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.6.4</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Are the auditors seeking appointment/re-appointment clearly
                  identified?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Apakah auditor yang ditunjuk/ditunjuk kembali diidentifikasi
                  dengan jelas?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.6.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.6.5</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Were the proxy documents made easily available?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah dokumen surat kuasa dapat diperoleh dengan mudah?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW A.7 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                A.7
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">
                  Insider trading and abusive self-dealing should be prohibited.
                </div>
                <div class="text-[#0070c0]">
                  Menghindari <span class="italic">Insider trading</span> dan penyalahgunaan.
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.7.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.7.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Are the directors/commissioners required to report their
                  dealings in company shares within 3 business days?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah direksi/komisaris wajib melaporkan transaksi saham
                  perseroan dalam waktu 3 hari kerja?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW A.8 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                A.8
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">
                  Related party transactions by directors and key executives.
                </div>
                <div class="text-[#0070c0]">
                  Transaksi pihak berelasi yang dilakukan oleh dewan komisaris
                  dan direksi.
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.8.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.8.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company have a policy requiring a committee of
                  independent directors/commissioners to review material/RPTs to
                  determine whether they are in the best interests of the
                  company and shareholders?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan memiliki kebijakan yang memerlukan komite
                  direksi/komisaris independen untuk menelaah materi/transaksi
                  pihak berelasi untuk menentukan apakah mereka berada dalam
                  kepentingan terbaik perusahaan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.8.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.8.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company have a policy requiring board members
                  (directors/commissioners) to abstain from participating in the
                  board discussion on a particular agenda when they are
                  conflicted?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah Perusahaan memiliki kebijakan yang mengatur anggota
                  dewan (direksi/komisaris) untuk tidak berpartisipasi dalam
                  diskusi dewan pada agenda tertentu ketika terdapat benturan
                  kepentingan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.8.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.8.3</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company have policies on loans to directors and
                  commissioners either forbidding these practices or ensuring
                  that they are being conducted at arm's length basis and at
                  market rates?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan memiliki kebijakan atas pinjaman kepada
                  direksi/komisaris baik melarang praktik ini atau memastikan
                  bahwa transaksi dilakukan secara wajar dan dengan harga pasar?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW A.9 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                A.9
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">
                  Protecting minority shareholders from abusive actions.
                </div>
                <div class="text-[#0070c0]">
                  Melindungi pemegang saham minoritas dari tindakan pelanggaran.
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.9.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.9.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose that RPTs are conducted in such a
                  way to ensure that they are fair and at arm's length?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah Perusahaan mengungkapkan bahwa transaksi pihak berelasi
                  dilakukan sedemikian rupa untuk memastikan bahwa transaksi
                  tersebut adalah adil dan termasuk dalam kegiatan usaha
                  perusahaan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW A.9.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">A.9.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  In case of related party transaction requiring shareholders
                  approval, is the decision made by disinterested shareholders?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Dalam hal transaksi pihak berelasi membutuhkan persetujuan
                  pemegang saham, apakah keputusan diambil oleh Pemegang Saham
                  yang tidak berkepentingan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- PART ROW B -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top font-bold">
                <div class="text-black uppercase">PART B</div>
                <div class="text-[#0070c0] uppercase">BAGIAN B</div>
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black uppercase">
                  SUSTAINABILITY AND RESILIENCE
                </div>
                <div class="text-[#0070c0] uppercase">
                  KEBERLANJUTAN DAN KETAHANAN
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW B.1 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                B.1
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black mb-1">
                  Sustainability-related disclosure should be consistent,
                  comparable and reliable, and include retrospective and
                  forward-looking material information that a reasonable
                  investor would consider important in making an investment or
                  voting decision
                </div>
                <div class="text-[#0070c0] leading-tight">
                  Pengungkapan terkait keberlanjutan harus konsisten, dapat
                  dibandingkan, dan dapat diandalkan, serta mencakup informasi
                  material yang bersifat retrospektif dan berwawasan ke depan
                  yang akan dianggap penting oleh investor yang masuk akal dalam
                  membuat keputusan investasi atau pemungutan suara.
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- B.1 SUBTITLE ROW -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black mb-1 italic">
                  Material Sustainability-related information should be
                  specified
                </div>
                <div class="text-[#0070c0]">
                  Apakah Informasi penting terkait keberlanjutan disebutkan
                  perusahaan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.1.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company identify/report ESG topics that are material
                  to the organization's strategy?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah Perusahaan mengidentifikasi/melaporkan ESG topik-topik
                  ESG yang penting bagi strategi organisasi?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.1.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.1.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company identify climate change as an issue?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengidentifikasi perubahan iklim sebagai
                  sebuah isu?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.1.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.1.3</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify leading-tight">
                  Does the company adopt an internationally recognized reporting
                  framework or standard for sustainability (i.e. GRI, Integrated
                  Reporting, SASB, IFRS Sustainability Disclosure Standards)?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Apakah perusahaan mengadopsi kerangka atau standar pelaporan
                  keberlanjutan yang diakui secara internasional (yaitu GRI,
                  Pelaporan Terintegrasi, SASB, Standar Pengungkapan
                  Keberlanjutan IFRS)?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- B.1 SECOND SUBTITLE ROW -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black mb-1 italic">
                  If a company publicly sets a sustainability-related goal or
                  target, the disclosure framework should provide that reliable
                  metrics are regularly disclosed in an easily accessible form /
                </div>
                <div class="text-[#0070c0]">
                  Jika perusahaan secara publik menetapkan tujuan atau target
                  terkait keberlanjutan, kerangka pengungkapan harus menyediakan
                  metrik (standar pengukuran) yang andal dan diungkapkan secara
                  berkala dalam bentuk yang mudah diakses.
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.1.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.1.4</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose quantitative sustainability target?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan target keberlanjutan
                  kuantitatif?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.1.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.1.5</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose sustainability-related performance
                  progress in relation to its previously set targets?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan kemajuan kinerja terkait
                  keberlanjutan sehubungan dengan target yang telah ditetapkan
                  sebelumnya?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.1.6 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.1.6</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company confirm that its Sustainability Report /
                  Reporting is reviewed and / or approved by the Board or Board
                  Committee?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan memastikan bahwa Laporan
                  Keberlanjutan/Pelaporannya telah ditinjau dan/atau disetujui
                  oleh Dewan atau Komite Dewan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW B.2 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                B.2
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black mb-1 italic">
                  Corporate governance frameworks should allow for dialogue
                  between a company, its shareholders and stakeholders to
                  exchange views on sustainability matters
                </div>
                <div class="text-[#0070c0]">
                  Kerangka tata kelola perusahaan harus memungkinkan terjadinya
                  dialog antara perusahaan, pemegang saham, dan pemangku
                  kepentingan untuk bertukar pandangan mengenai masalah
                  keberlanjutan
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.2.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.2.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company engage internal stakeholders to exchange
                  views and gather feedback on sustainability matters that are
                  material to the business of the company?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan melibatkan pemangku kepentingan internal
                  untuk bertukar pandangan dan mengumpulkan umpan balik mengenai
                  permasalahan keberlanjutan yang penting bagi bisnis
                  perusahaan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.2.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.2.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company engage external stakeholders to exchange
                  views and gather feedback on sustainability matters that are
                  material to the business of the company?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan melibatkan pemangku kepentingan eksternal
                  untuk bertukar pandangan dan mengumpulkan umpan balik mengenai
                  permasalahan keberlanjutan yang penting bagi bisnis
                  perusahaan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW B.3 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                B.3
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black mb-1 italic">
                  The corporate governance framework should ensure that boards
                  adequately consider material sustainability risks and
                  opportunities when fulfilling their key functions in
                  reviewing, monitoring and guiding governance practices,
                  disclosure, strategy, risk management and internal control
                  systems, including with respect to climate-related physical
                  and transition risks
                </div>
                <div class="text-[#0070c0] leading-tight">
                  Kerangka tata kelola perusahaan harus memastikan bahwa dewan
                  direksi secara memadai mempertimbangkan risiko dan peluang
                  keberlanjutan yang material ketika memenuhi fungsi utama
                  mereka dalam meninjau, memantau dan memandu praktik tata
                  kelola, pengungkapan, strategi, manajemen risiko dan sistem
                  pengendalian internal, termasuk yang berkaitan dengan sistem
                  fisik dan transisi terkait perubahan iklim risiko
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- B.3 SUBTITLE ROW -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black mb-1 italic">
                  Boards should assess whether the company's capital structure
                  is compatible with its strategic goals and its associated risk
                  appetite to ensure it is resilient to different scenarios
                </div>
                <div class="text-[#0070c0]">
                  Dewan harus menilai apakah struktur permodalan perusahaan
                  sesuai dengan tujuan strategis dan selera risiko yang terkait
                  untuk memastikan ketahanannya terhadap berbagai skenario.
                  Apakah perusahaan mengungkapkan
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.3.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.3.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose that the board reviews on an annual
                  basis that the company's capital and debt structure is
                  compatible with its strategic goals and its associated risk
                  appetite?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan bahwa direksi melakukan review
                  setiap tahun untuk memastikan struktur modal dan utang
                  perusahaan sesuai dengan tujuan strategis dan selera risiko
                  yang terkait?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW B.4 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                B.4
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black mb-1 italic">
                  The corporate governance framework should recognise the rights
                  of stakeholders established by law or through mutual
                  agreements and encourage active co-operation between
                  corporations and stakeholders in creating wealth, jobs, and
                  the sustainability of financially sound enterprises.
                </div>
                <div class="text-[#0070c0]">
                  perusahaan harus mengakui hak-hak pemangku kepentingan yang
                  ditetapkan berdasarkan undang-undang atau melalui kesepakatan
                  bersama dan mendorong kerja sama aktif antara perusahaan dan
                  pemangku kepentingan dalam menciptakan kekayaan, lapangan
                  kerja, dan keberlanjutan perusahaan yang sehat secara
                  finansial
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- B.4 SUBTITLE ROW -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black mb-1 italic">
                  Does the company disclose a policy and practices that address:
                </div>
                <div class="text-[#0070c0]">
                  Apakah perusahaan mengungkapkan kebijakan dan praktik yang
                  membahas:
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.4.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.4.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify italic leading-tight">
                  The existence and scope of the company's efforts to address
                  customers' welfare?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Keberadaan dan ruang lingkup upaya perusahaan dalam mengatasi
                  kesejahteraan pelanggan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.4.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.4.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify italic leading-tight">
                  Supplier/contractor selection procedures?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Prosedur pemilihan pemasok/kontraktor?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.4.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.4.3</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify italic leading-tight">
                  The company's efforts to ensure that its value chain is
                  environmentally friendly or is consistent with promoting
                  sustainable development?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Upaya perusahaan untuk memastikan rantai nilainya ramah
                  lingkungan atau konsisten dengan mendorong pembangunan
                  berkelanjutan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.4.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.4.4</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify italic leading-tight">
                  The company's efforts to interact with the communities in
                  which they operate?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Upaya perusahaan untuk berinteraksi dengan masyarakat di mana
                  mereka beroperasi?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.4.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.4.5</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify italic leading-tight">
                  The company's anti-corruption programmes and procedures?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Program dan prosedur anti-korupsi perusahaan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.4.6 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.4.6</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify italic leading-tight">
                  How creditors' rights are safeguarded?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Bagaimana hak-hak kreditur dilindungi?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.4.7 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.4.7</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company have a separate report/section that discusses
                  its efforts on environment/economy and social issues?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mempunyai laporan/bagian terpisah yang
                  membahas upayanya dalam isu lingkungan/ekonomi dan sosial?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW B.5 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                B.5
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black mb-1 italic">
                  Where stakeholder interests are protected by law, stakeholders
                  should have the opportunity to obtain effective redress for
                  violation of their rights.
                </div>
                <div class="text-[#0070c0]">
                  Kepentingan pemangku kepentingan dilindungi oleh hukum,
                  pemangku kepentingan harus mendapatkan ganti rugi efektif
                  untuk setiap pelanggaran atas hak-hak mereka.
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.5.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.5.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company provide contact details via the company's
                  website or Annual Report which stakeholders (e.g., customers,
                  suppliers, general public, etc.) can use to voice their
                  concerns and/or complaints for possible violation of their
                  rights?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan menyediakan kontak melalui situs perusahaan
                  atau Laporan Tahunan dimana pemangku kepentingan (pelanggan,
                  pemasok, masyarakat umum, dll) dapat menggunakannya untuk
                  menyuarakan perhatian dan/atau keluhan mereka terkait
                  kemungkinan pelanggaran atas hak-hak mereka?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW B.6 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                B.6
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black mb-1 italic">
                  Mechanisms for employee participation should be permitted to
                  develop.
                </div>
                <div class="text-[#0070c0]">
                  Mengembangkan mekanisme peningkatan kinerja untuk karyawan.
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.6.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.6.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company explicitly disclose the policies and
                  practices on health, safety, and welfare for its employees?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan secara eksplisit mengungkapkan kebijakan
                  kesehatan, keselamatan dan kesejahteraan bagi karyawannya?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.6.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.6.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company explicitly disclose the policies and
                  practices on training and development programmes for its
                  employees?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan secara eksplisit mengungkapkan kebijakan
                  program pelatihan dan pengembangan bagi karyawannya?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.6.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.6.3</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company have a reward/compensation policy that
                  accounts for the performance of the company beyond short-term
                  financial measures?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah Perusahaan memiliki kebijakan penghargaan/kompensasi
                  atas kinerja perusahaan yang dihitung tidak hanya berdasarkan
                  ukuran pencapaian jangka keuangan dalam jangka pendek?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW B.7 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                B.7
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black mb-1 italic">
                  Stakeholders including individual employee and their
                  representative bodies, should be able to freely communicate
                  their concerns about illegal or unethical practices to the
                  board and their rights should not be compromised for doing
                  this.
                </div>
                <div class="text-[#0070c0] leading-tight">
                  Pemangku kepentingan termasuk karyawan individu dan
                  badan-badan perwakilan mereka, harus dapat berkomunikasi
                  secara bebas atas perhatian mereka tentang praktik ilegal atau
                  tindakan tidak etis kepada Dewan Komisaris dan hak-hak mereka
                  tidak boleh dikompromikan dalam melakukan hal ini.
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.7.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.7.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company have a whistle blowing policy which includes
                  procedures for complaints by employees and other stakeholders
                  concerning alleged illegal and unethical behaviour and provide
                  contact details via the company's website or annual report?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan memiliki kebijakan whistleblowing yang
                  mencakup tata cara pengaduan karyawan dan pemangku kepentingan
                  lainnya mengenai dugaan perilaku ilegal dan tidak etis serta
                  memberikan rincian kontak melalui situs web perusahaan atau
                  laporan tahunan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW B.7.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">B.7.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company have a policy or procedures to protect an
                  employee/person who reveals illegal/unethical behavior from
                  retaliation?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan memiliki kebijakan atau prosedur untuk
                  melindungi karyawan/orang yang mengungkapkan perilaku
                  ilegal/tidak etis dari pembalasan dendam?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- PART ROW C -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top font-bold">
                <div class="text-black uppercase">PART C</div>
                <div class="text-[#0070c0] uppercase">BAGIAN C</div>
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black uppercase">
                  DISCLOSURE AND TRANSPARENCY
                </div>
                <div class="text-[#0070c0] uppercase">
                  TRANSPARANSI DAN PENGUNGKAPAN
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW C.1 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                C.1
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">Transparent Ownership Structure</div>
                <div class="text-[#0070c0]">
                  Struktur Kepemilikan yang Transparan
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.1.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the information on shareholdings reveal the identity of
                  beneficial owners, holding 5% shareholding or more?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah informasi terkait Kepemilikan saham mengungkapkan
                  identitas pemilik saham, dengan kepemilikan saham 5% atau
                  lebih?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.1.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.1.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose the direct and indirect (deemed)
                  shareholdings of major and/or substantial shareholders?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan kepemilikan saham baik yang
                  langsung dan tidak langsung (jika ada) dari pemegang saham
                  utama dan/atau pemegang saham dalam jumlah besar?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.1.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.1.3</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose the direct and indirect (deemed)
                  shareholdings of directors (commissioners)?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan kepemilikan saham para
                  direksi/dewan komisaris baik langsung dan tidak langsung?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.1.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.1.4</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose the direct and indirect (deemed)
                  shareholdings of senior management?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan kepemilikan saham langsung dan
                  tidak langsung yang dimiliki oleh manajemen senior?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.1.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.1.5</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose details of the parent/holding
                  company, subsidiaries, associates, joint ventures and special
                  purpose enterprises/vehicles (SPEs)/(SPVs)?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Apakah perusahaan mengungkapkan secara detail mengenai
                  kelompok usahanya termasuk anak Perseroan, asosiasi, usaha
                  patungan dan <span class="italic font-bold"
                    >special purpose enterprises (SPE)/special purpose vehicles
                    (SPV)?</span
                  >
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW C.2 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                C.2
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">Quality of Annual Report</div>
                <div class="text-[#0070c0]">Kualitas Laporan Tahunan</div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- C.2 SUBTITLE ROW -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top font-bold"
              ></td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black italic">
                  Does the company's Annual Report disclose the following items:
                </div>
                <div class="text-[#0070c0]">
                  Apakah laporan tahunan perusahaan mengungkapkan item berikut:
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.2.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.2.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify font-bold">
                  Corporate objectives
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Tujuan perusahaan
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.2.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.2.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify font-bold">
                  Financial performance indicators
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Indikator kinerja keuangan
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.2.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.2.3</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify font-bold">
                  Non-financial performance indicators
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Indikator kinerja non-keuangan
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.2.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.2.4</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify font-bold">
                  Dividend policy
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Kebijakan dividen
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.2.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.2.5</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Biographical details (at least age, academic qualifications,
                  date of first appointment, relevant experience, and any other
                  directorships of listed companies) of all
                  directors/commissioners.
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Rincian Biografi (setidaknya usia, kualifikasi akademis,
                  tanggal pengangkatan pertama, pengalaman yang relevan, dan
                  jabatan direktur/dewan komisaris pada <span class="italic"
                    >listed company</span
                  > lain.
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- C.2 SUBTITLE ROW (CONFORMATION STATEMENT) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top font-bold"
              ></td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black italic">
                  Corporate Governance Confirmation Statement
                </div>
                <div class="text-[#0070c0]">
                  Pernyataan Konfirmasi Tata Kelola Perusahaan
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.2.6 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.2.6</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify leading-tight">
                  Does the annual report contain a statement confirming the
                  company's full compliance with the code of corporate
                  governance and where there is non-compliance, identify and
                  explain reasons for each such issue?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Apakah laporan tahunan memuat pernyataan yang menyatakan
                  kepatuhan perusahaan sejalan dengan Pedoman Tata Kelola dan
                  adanya ketidakpatuhan, mengidentifikasi dan menjelaskan alasan
                  untuk setiap masalah tersebut?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW C.3 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                C.3
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">
                  Remuneration of Members of the Board and Key Executives
                </div>
                <div class="text-[#0070c0]">
                  Remunerasi Anggota Dewan dan Eksekutif Kunci
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.3.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.3.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Is there disclosure of the fee structure for non-executive
                  directors/commissioners?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah ada pengungkapan struktur remunerasi untuk
                  direktur/komisaris non-eksekutif?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.3.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.3.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company publicly disclose [i.e. annual report or
                  other publicly disclosed documents] details of remuneration of
                  each non-executive director/commissioner?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan secara publik [yaitu laporan
                  tahunan atau dokumen lain yang diungkapkan kepada publik]
                  rincian remunerasi masing-masing direktur/komisaris
                  non-eksekutif?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.3.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.3.3</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify leading-tight">
                  Does the company disclose its remuneration (fees, allowances,
                  benefit-in-kind and other emoluments) policy/practices (i.e.
                  the use of short term and long term incentives and performance
                  measures) for its executive directors and CEO?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Apakah perusahaan mengungkapkan kebijakan/praktik remunerasi
                  (biaya, tunjangan, fasilitas serta imbalan lainnya, yaitu
                  insentif berdasarkan ukuran kinerja jangka pendek dan jangka
                  panjang) untuk anggota Direksi dan Direktur Utama?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.3.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.3.4</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify leading-tight">
                  Does the company publicly disclose [i.e. annual report or
                  other publicly disclosed documents] the details of
                  remuneration of each of the executive directors and CEO [if
                  he/she is not a member of the Board]?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Perusahaan mengungkapkan secara publik (yaitu laporan tahunan
                  atau dokumen lain yang diungkapkan secara publik) rincian
                  remunerasi masing-masing untuk anggota Dewan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW C.4 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                C.4
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">
                  Disclosure of related party transactions (RPT)
                </div>
                <div class="text-[#0070c0]">
                  Pengungkapan transaksi pihak berelasi (RPT)
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.4.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.4.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify leadng-snug">
                  Does the company disclose its policy covering the review and
                  approval of material/significant RPTs?
                </div>
                <div class="text-[#0070c0] text-justify italic leading-tight">
                  Apakah perusahaan mengungkapkan kebijakan terkait review dan
                  persetujuan atas transaksi pihak berelasi yang
                  material/signifikan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.4.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.4.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose the name, relationship, nature and
                  value for each material RPTs?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan nama, hubungan, sifat dan
                  nilai setiap RPT material?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW C.5 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                C.5
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">
                  Directors and Commissioners Dealings in Shares of the Company
                </div>
                <div class="text-[#0070c0]">
                  Hubungan Direktur dan Dewan Komisaris dalam Saham Perusahaan
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.5.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.5.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the company disclose trading in the company's shares by
                  insiders?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah perusahaan mengungkapkan perdagangan saham perusahaan
                  oleh orang dalam?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW C.6 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                C.6
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">
                  External Auditor and Auditor Report
                </div>
                <div class="text-[#0070c0]">
                  Auditor Eksternal dan Laporan Auditor
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- C.6 SUBTITLE ROW -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black italic">
                  Where the same audit firm is engaged for both audit and
                  non-audit services
                </div>
                <div class="text-[#0070c0]">
                  Dimana perusahaan audit yang sama bergerak untuk layanan baik
                  audit dan non-audit
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.6.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.6.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Are the audit and non-audit fees disclosed?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah biaya audit dan non-audit diungkapkan?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.6.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.6.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify">
                  Does the non-audit fee exceed the audit fees?
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Apakah biaya non-audit melebihi biaya audit?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW C.7 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                C.7
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">Medium of Communications</div>
                <div class="text-[#0070c0]">Media Komunikasi</div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- C.7 SUBTITLE ROW -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black italic">
                  Does the company use the following modes of communication?
                </div>
                <div class="text-[#0070c0]">
                  Apakah perusahaan menggunakan bentuk komunikasi berikut?
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.7.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.7.1</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify font-bold">
                  Quarterly reporting
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Pelaporan Kuartalan
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.7.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.7.2</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify font-bold">
                  Company website
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Website Perusahaan
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.7.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.7.3</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify font-bold">
                  Analyst's briefing
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Briefing Analis
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.7.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-1.5 align-top">
                <span class="text-[#0070c0]">C.7.4</span>
              </td>
              <td class="border border-slate-900 p-1.5 align-top leading-tight">
                <div class="text-black mb-1 text-justify font-bold">
                  Media briefings/press conferences
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Penjelasan media/ konferensi pers
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- SECTION ROW C.8 -->
            <tr class="bg-white">
              <td
                class="border border-slate-900 p-1.5 align-top font-bold text-black"
              >
                C.8
              </td>
              <td
                class="border border-slate-900 p-1.5 align-top font-bold leading-tight"
              >
                <div class="text-black">
                  Timely Filing/Release of Annual/Financial Reports
                </div>
                <div class="text-[#0070c0]">
                  Pengajuan Tepat Waktu/Penerbitan Laporan Tahunan/Keuangan
                </div>
              </td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
              <td class="border border-slate-900 p-1.5 align-top"></td>
            </tr>

            <!-- QUESTION ROW C.8.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">C.8.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal">
                  Are the audited annual financial report/statement released
                  within 120 days from the financial year end?
                </div>
                <div class="text-[#0070c0] text-justify font-normal italic">
                  Apakah laporan keuangan tahunan yang telah diaudit diterbitkan
                  dalam waktu 120 hari dari akhir tahun buku?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW C.8.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">C.8.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal">
                  Is the annual report released within 120 days from the
                  financial year end?
                </div>
                <div class="text-[#0070c0] text-justify font-normal italic">
                  Apakah laporan tahunan diterbitkan dalam waktu 120 hari sejak
                  dari akhir tahun buku?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW C.8.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">C.8.3</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal">
                  Is the true and fairness/fair representation of the annual
                  financial statement/reports affirmed by the board of
                  directors/commissioners and/or the relevant officers of the
                  company?
                </div>
                <div class="text-[#0070c0] text-justify font-normal italic">
                  Apakah pernyataan kebenaran dan kewajaran dari Laporan
                  Keuangan Tahunan telah ditegaskan oleh Direksi/Dewan Komisaris
                  dan atau pihak yang relevan dalam perusahaan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- SECTION ROW C.9 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                C.9
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Company Website</div>
                <div class="text-[#0070c0]">Website Perusahaan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- C.9 SUBTITLE ROW -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">
                  Does the company have a website disclosing up-to-date
                  information on the following:
                </div>
                <div class="text-[#0070c0]">
                  Apakah perusahaan memiliki website yang mengungkapkan
                  informasi terkini dari item berikut:
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW C.9.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">C.9.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal font-bold">
                  Financial statements/reports (latest quarterly)
                </div>
                <div class="text-[#0070c0] text-justify font-normal italic">
                  Laporan keuangan (triwulanan terbaru)
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW C.9.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">C.9.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal font-bold">
                  Materials provided in briefings to analysts and media
                </div>
                <div class="text-[#0070c0] text-justify font-normal italic">
                  Materi briefing untuk analis dan media
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW C.9.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">C.9.3</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal font-bold">
                  Downloadable Annual Reports
                </div>
                <div class="text-[#0070c0] text-justify font-normal italic">
                  Laporan tahunan dapat diunduh
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW C.9.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">C.9.4</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal font-bold">
                  Notice of AGM and/or EGM
                </div>
                <div class="text-[#0070c0] text-justify font-normal italic">
                  Pemberitahuan RUPST dan/atau RUPSLB
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW C.9.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">C.9.5</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal font-bold">
                  Minutes of AGM and/or EGM
                </div>
                <div class="text-[#0070c0] text-justify font-normal italic">
                  Ringkasan RUPST dan/atau RUPSLB
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW C.9.6 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">C.9.6</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal font-bold leading-tight"
                >
                  Company's constitution (company's by-laws, memorandum and
                  articles of association)
                </div>
                <div class="text-[#0070c0] text-justify font-normal italic">
                  Anggaran dasar perusahaan
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- SECTION ROW C.10 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                C.10
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Investor Relations</div>
                <div class="text-[#0070c0]">Hubungan Investor</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW C.10.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">C.10.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose the contact details (e.g.,
                  telephone, fax, and email) of the officer responsible for
                  investor relations?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan rincian kontak (misalnya
                  telepon, fax, dan email) dari petugas yang bertanggung jawab
                  dalam hubungan investor?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- PART ROW D -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold">
                <div class="text-black uppercase">PART D</div>
                <div class="text-[#0070c0] uppercase">BAGIAN D</div>
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black uppercase">
                  RESPONSIBILITIES OF THE BOARD
                </div>
                <div class="text-[#0070c0] uppercase">TANGGUNG JAWAB DEWAN</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- SECTION ROW D.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                D.1
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black mb-1">
                  Board Duties and Responsibilities
                </div>
                <div class="text-[#0070c0]">Tugas dan Tanggung Jawab Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.1 SUBTITLE ROW -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">
                  Clearly defined board responsibilities and corporate
                  governance policies
                </div>
                <div class="text-[#0070c0]">
                  Kejelasan tanggung jawab Dewan dan kebijakan tata kelola
                  perusahaan
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.1.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose its corporate governance
                  policy/board charter?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan kebijakan tata kelola
                  perusahaan/piagam dewan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.1.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.1.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Are the types of decisions requiring board of
                  directors/commissioners approval disclosed?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah jenis keputusan yang memerlukan persetujuan
                  direksi/dewan komisaris diungkapkan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.1.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.1.3</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Are the roles and responsibilities of the board of
                  directors/commissioners clearly stated?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah peran dan tanggung jawab direksi/dewan komisaris
                  diungkapkan dengan jelas?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.1 SUBTITLE ROW (VISION MISSION) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">Corporate Vision/Mission</div>
                <div class="text-[#0070c0]">Visi/Misi Perusahaan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.1.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.1.4</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have an updated vision and mission statement?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki visi dan misi yang
                  terkini/update/diperbaharui?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.1.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.1.5</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the board of directors play a leading role in the process
                  of developing and reviewing the company's strategy at least
                  annually?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah direksi memainkan peran utama dalam proses
                  mengembangkan dan meninjau ulang strategi perusahaan
                  setidaknya setiap tahun?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.1.6 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.1.6</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the board of directors have a process to review, monitor
                  and oversee the implementation of the corporate strategy?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah direksi memiliki proses untuk meninjau, memantau, dan
                  mengawasi pelaksanaan strategi perusahaan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- SECTION ROW D.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                D.2
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Board Structure</div>
                <div class="text-[#0070c0]">Struktur Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.2 SUBTITLE ROW (CODE OF ETHICS) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">Code of Ethics or Conduct</div>
                <div class="text-[#0070c0]">Pedoman Etika atau perilaku</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.2.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.2.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Are the details of the code of ethics or conduct disclosed?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah rincian pedoman etika atau perilaku diungkapkan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.2.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.2.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Are all directors/commissioners, senior management and
                  employees required to comply with the code/s?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah semua direktur/komisaris, manajemen senior dan karyawan
                  diharuskan mematuhi Kode Etik?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.2.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.2.3</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have a process to implement and monitor
                  compliance with the codes of ethics or conduct?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki proses untuk menerapkan dan
                  memantau kepatuhan terhadap pedoman etika atau perilaku?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.2.4 (BOARD APPOINTMENT) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">
                  Board Structure & Composition
                </div>
                <div class="text-[#0070c0]">Struktur dan Komposisi Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.2.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.2.4</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Do independent directors/ commissioners make up at least 50%
                  of the board of directors/commissioners?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  the board of directors/commissioners? Apakah komposisi
                  komisaris independen memenuhi setidaknya 50% dari total dewan
                  komisaris?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.2.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.2.5</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose the criteria used in selecting new
                  directors/commissioners?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan kriteria yang digunakan dalam
                  memilih direksi/dewan komisaris yang baru?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.2.6 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.2.6</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug font-bold"
                >
                  Board Diversity
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Diversitas Dewan
                </div>
                <div
                  class="text-black mt-1 text-justify font-normal leading-snug"
                >
                  Does the company have a policy on board diversity (e.g.
                  gender, skills, experience)?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki kebijakan tentang diversitas dewan
                  (misalnya jenis kelamin, keterampilan, pengalaman)?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- SECTION ROW D.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                D.3
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Board Independence</div>
                <div class="text-[#0070c0]">Independensi Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.3.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.3.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Do independent directors/commissioners make up at least 50% of
                  the board of directors/commissioners?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah komposisi komisaris independen memenuhi setidaknya 50%
                  dari total dewan komisaris?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.3.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.3.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have a term limit for independent
                  directors/commissioners?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki batas waktu masa jabatan untuk
                  direktur/komisaris independen?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.3.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.3.3</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Has the board of directors/commissioners set a policy that
                  limits the term of independent directors/commissioners to nine
                  years or less?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah direksi/dewan komisaris menetapkan kebijakan yang
                  membatasi masa jabatan direktur/komisaris independen selama
                  sembilan tahun atau kurang?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- SECTION ROW D.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                D.4
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Board Performance</div>
                <div class="text-[#0070c0]">Kinerja Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.4 SUBTITLE ROW (ORIENTATION) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">
                  Orientation Program for New Directors/Commissioners
                </div>
                <div class="text-[#0070c0]">
                  Program Orientasi untuk Direktur/Komisaris Baru
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.4.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.4.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have an orientation program for new
                  directors/commissioners?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki program orientasi untuk
                  direktur/komisaris baru?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.4 SUBTITLE ROW (BOARD TRAINING) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">
                  Director/Commissioner Training
                </div>
                <div class="text-[#0070c0]">Pelatihan Direktur/Komisaris</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.4.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.4.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have a policy that encourages
                  directors/commissioners to attend professional training?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki kebijakan yang mendorong
                  direktur/komisaris untuk mengikuti pelatihan profesional?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.4.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.4.3</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose the training/continuing education
                  programs attended by each director/commissioner?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan program pelatihan/pendidikan
                  berkelanjutan yang diikuti oleh masing-masing
                  direktur/komisaris?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.4 SUBTITLE ROW (BOARD EVALUATION) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">Board Evaluation</div>
                <div class="text-[#0070c0]">Evaluasi Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.4.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.4.4</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the board of directors/commissioners conduct an annual
                  performance assessment of the board as a whole?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah direksi/dewan komisaris melakukan penilaian kinerja
                  tahunan dewan secara keseluruhan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.4.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.4.5</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose the process and criteria used in the
                  performance assessment of the board of
                  directors/commissioners?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan proses dan kriteria yang
                  digunakan dalam penilaian kinerja direksi/dewan komisaris?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.4 SUBTITLE ROW (DIRECTOR APPRAISAL) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">Director Appraisal</div>
                <div class="text-[#0070c0]">Penilaian Direktur/Komisaris</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.4.6 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.4.6</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Did the company conduct an annual performance assessment of
                  the individual directors/commissioners and disclose the
                  criteria and process followed for the assessment?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan melakukan penilaian kinerja tahunan terhadap
                  masing-masing direktur/komisaris dan mengungkapkan kriteria
                  serta proses yang diikuti dalam penilaian tersebut?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.4 SUBTITLE ROW (COMMITTEE APPRAISAL) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">Committee Appraisal</div>
                <div class="text-[#0070c0]">Penilaian Komite Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.4.7 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.4.7</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Did the company conduct an annual performance assessment of
                  the board committees and disclose the criteria and process
                  followed for the assessment?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan melakukan penilaian kinerja tahunan terhadap
                  komite dewan dan mengungkapkan kriteria serta proses yang
                  diikuti dalam penilaian tersebut?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.4 SUBTITLE ROW (CEO / KEY MANAGEMENT) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">
                  CEO/Executive Management Appointments and Performance
                </div>
                <div class="text-[#0070c0]">
                  Pengangkatan dan Kinerja CEO/Manajemen Eksekutif
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.4.8 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.4.8</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose the process on how the board of
                  directors/commissioners plans for the succession of the
                  CEO/Managing Director/President and key management?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan proses perencanaan suksesi
                  Direktur Utama/Presiden Direktur/Presiden dan manajemen kunci
                  oleh direksi/dewan komisaris?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.4.9 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.4.9</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the board of directors/commissioners conduct an annual
                  performance assessment of the CEO/Managing
                  Director/President?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah direksi/dewan komisaris melakukan penilaian kinerja
                  tahunan terhadap Direktur Utama/Presiden Direktur/Presiden?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- SECTION ROW D.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                D.5
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">People on the Board</div>
                <div class="text-[#0070c0]">Pihak dalam Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.5 SUBTITLE ROW (BOARD CHAIRMAN) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">Board Chairman</div>
                <div class="text-[#0070c0]">Ketua Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.5.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.5.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Do different persons assume the roles of chairman of the board
                  of directors/commissioners and chief executive officer (CEO)
                  (or the President in a two-tier board)?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah orang yang berbeda memegang peran ketua dewan
                  direksi/dewan komisaris dan chief executive officer (CEO)
                  (atau Presiden dalam struktur dewan dua tingkat)?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.5.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.5.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Is the chairman an independent director/commissioner?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah ketua dewan merupakan direktur/komisaris independen?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.5.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.5.3</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Is any of the directors/commissioners a former CEO of the
                  company in the past two years?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah ada direktur/komisaris yang merupakan mantan CEO
                  perusahaan dalam dua tahun terakhir?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.5.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.5.4</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Are the roles and responsibilities of the chairman disclosed?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah peran dan tanggung jawab ketua dewan diungkapkan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.5 SUBTITLE ROW (LEAD INDEPENDENT DIRECTOR) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">Lead Independent Director</div>
                <div class="text-[#0070c0]">Direktur Independen Utama</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.5.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.5.5</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  If the chairman is not independent, has the board of
                  directors/commissioners appointed a lead independent
                  director/senior independent director and has his/her role
                  been defined?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apabila ketua dewan bukan independen, apakah
                  direksi/dewan komisaris telah menunjuk direktur independen
                  utama/senior independen dan apakah perannya telah ditetapkan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.5 SUBTITLE ROW (SKILLS AND COMPETENCIES) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">Skills and Competencies</div>
                <div class="text-[#0070c0]">Keterampilan dan Kompetensi</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.5.6 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.5.6</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does at least one member of the board of
                  directors/commissioners have prior working experience in the
                  major sector that the company is operating in?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah setidaknya satu anggota direksi/dewan komisaris memiliki
                  pengalaman kerja di sektor utama yang menjadi bidang usaha
                  perusahaan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- SECTION ROW D.6 — Tahap 5 (Board Processes, bagian 1) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                D.6
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Board Processes</div>
                <div class="text-[#0070c0]">Proses Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.6 SUBTITLE (BOARD MEETINGS) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">
                  Board Meetings and Attendance
                </div>
                <div class="text-[#0070c0]">Rapat Dewan dan Kehadiran</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Are the board of directors/commissioners meetings scheduled
                  before the start of the financial year?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah rapat direksi/dewan komisaris dijadwalkan sebelum dimulai
                  tahun buku?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the board of directors/commissioners meet at least six
                  times during the year?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah direksi/dewan komisaris mengadakan rapat setidaknya enam
                  kali dalam setahun?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.3</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Has each of the directors/commissioners attended at least 75%
                  of all the board meetings held during the year?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah masing-masing direktur/komisaris hadir setidaknya pada
                  75% dari seluruh rapat dewan yang diselenggarakan dalam tahun
                  tersebut?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.4</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company require a minimum quorum of at least two-thirds
                  for board decisions?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mensyaratkan kuorum minimum setidaknya dua
                  pertiga untuk keputusan dewan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.5</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Did the non-executive directors/commissioners meet separately
                  at least once during the year without any executives present?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah direktur/komisaris non-eksekutif mengadakan pertemuan
                  terpisah setidaknya satu kali dalam tahun tersebut tanpa
                  kehadiran eksekutif?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.6 SUBTITLE (ACCESS TO INFORMATION) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">Access to Information</div>
                <div class="text-[#0070c0]">Akses terhadap Informasi</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.6 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.6</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Are board papers for board of directors/commissioners meetings
                  provided to the board at least five business days in advance of
                  the board meeting?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah materi rapat direksi/dewan komisaris disampaikan kepada
                  dewan setidaknya lima hari kerja sebelum rapat dewan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.7 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.7</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company secretary play a significant role in supporting
                  the board in discharging the board's responsibilities?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah sekretaris perusahaan memiliki peran penting dalam
                  mendukung dewan menjalankan tanggung jawab dewan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.8 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.8</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Is the company secretary trained in legal, accountancy or
                  company secretarial practices and kept abreast of relevant
                  developments?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah sekretaris perusahaan berpendidikan di bidang hukum,
                  akuntansi atau praktik sekretaris perusahaan dan mengikuti
                  perkembangan terkait?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.6 SUBTITLE (BOARD APPOINTMENT) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">
                  Board Appointment and Re-Election
                </div>
                <div class="text-[#0070c0]">
                  Pengangkatan dan Pemilihan Kembali Anggota Dewan
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.9 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.9</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose the criteria used in selecting new
                  directors/commissioners?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan kriteria yang digunakan dalam
                  memilih direktur/komisaris baru?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.10 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.10</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Did the company describe the process followed in appointing new
                  directors/commissioners?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan menjelaskan proses yang diikuti dalam
                  mengangkat direktur/komisaris baru?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.11 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.11</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Are all directors/commissioners subject to re-election every
                  three years; or five years for listed companies in countries
                  whose legislation prescribes a term of five years each (the five
                  years term must be required by legislation which pre-existed the
                  introduction of the ASEAN Corporate Governance Scorecard in
                  2011)?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah seluruh direktur/komisaris wajib dipilih kembali setiap
                  tiga tahun; atau lima tahun bagi emiten di yurisdiksi yang
                  mengatur masa jabatan lima tahun (ketentuan lima tahun harus
                  telah ada sebelum penerapan ASEAN Corporate Governance Scorecard
                  tahun 2011)?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.6 SUBTITLE (REMUNERATION MATTERS) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">Remuneration Matters</div>
                <div class="text-[#0070c0]">Hal-Hal Remunerasi</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.12 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.12</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Do the shareholders or the board of directors approve the
                  remuneration of the executive directors and/or the senior
                  executives?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah pemegang saham atau direksi menyetujui remunerasi
                  direktur eksekutif dan/atau eksekutif senior?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.13 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.13</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have measurable standards to align the
                  performance-based remuneration of the executive directors and
                  senior executives with the long-term interests of the company,
                  such as claw back provisions and deferred bonuses?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki standar terukur untuk menyelaraskan
                  remunerasi berbasis kinerja direktur eksekutif dan eksekutif
                  senior dengan kepentingan jangka panjang perusahaan, seperti
                  ketentuan claw back dan bonus tangguhan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.6 SUBTITLE (INTERNAL AUDIT) — Tahap 6 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">Internal Audit</div>
                <div class="text-[#0070c0]">Audit Internal</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.14 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.14</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have a separate internal audit function?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki fungsi audit internal yang terpisah?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.15 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.15</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Is the head of internal audit identified or, if outsourced, is
                  the name of the external firm disclosed?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah kepala audit internal diidentifikasi atau, jika
                  dialihdayakan, apakah nama firma eksternal diungkapkan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.16 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.16</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the appointment and removal of the internal auditor
                  require the approval of the Audit Committee?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah pengangkatan dan pemberhentian auditor internal
                  memerlukan persetujuan Komite Audit?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- D.6 SUBTITLE (RISK OVERSIGHT) -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold"></td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black italic">Risk Oversight</div>
                <div class="text-[#0070c0]">Pengawasan Risiko</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.17 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.17</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company establish sound internal control procedures
                  and a risk management framework and periodically review the
                  effectiveness of that framework?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan menetapkan prosedur pengendalian intern yang
                  baik dan kerangka manajemen risiko serta meninjau efektivitasnya
                  secara berkala?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.18 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.18</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the Annual Report/Annual CG Report disclose that the board
                  of directors/commissioners has conducted a review of the
                  company's material controls (including operational, financial
                  and compliance controls) and risk management systems?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah Laporan Tahunan/Laporan TK mengungkapkan bahwa
                  direksi/dewan komisaris telah meninjau pengendalian material
                  perusahaan (termasuk operasional, keuangan, dan kepatuhan) serta
                  sistem manajemen risiko?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.19 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.19</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose the key risks to which the company is
                  materially exposed (i.e. financial, operational including IT,
                  environmental, social, economic)?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan risiko utama yang secara
                  material menimpa perusahaan (misalnya keuangan, operasional
                  termasuk TI, lingkungan, sosial, ekonomi)?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION ROW D.6.20 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">D.6.20</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the Annual Report/Annual CG Report contain a statement from
                  the board of directors/commissioners or Audit Committee
                  commenting on the adequacy of the company's internal controls
                  and risk management systems?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah Laporan Tahunan/Laporan TK memuat pernyataan dari
                  direksi/dewan komisaris atau Komite Audit mengenai kecukupan
                  pengendalian intern dan sistem manajemen risiko perusahaan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- LEVEL 2 (baris 1 — sesuai mockup) -->
            <tr class="bg-[#dce6f1]">
              <td
                colspan="2"
                class="border border-slate-900 p-1.5 align-top font-bold text-black uppercase"
              >
                LEVEL 2
              </td>
              <td class="border border-slate-900 p-1.5 bg-[#dce6f1]"></td>
              <td class="border border-slate-900 p-1.5 bg-[#dce6f1]"></td>
              <td class="border border-slate-900 p-1.5 bg-[#dce6f1]"></td>
              <td class="border border-slate-900 p-1.5 bg-[#dce6f1]"></td>
            </tr>

            <!-- LEVEL 2 (BONUS ITEMS) (baris 2 — putih, hanya Inggris) -->
            <tr class="bg-white">
              <td
                colspan="2"
                class="border border-slate-900 p-1.5 align-top font-bold text-black uppercase leading-tight"
              >
                LEVEL 2 (BONUS ITEMS)
              </td>
              <td class="border border-slate-900 p-1.5"></td>
              <td class="border border-slate-900 p-1.5"></td>
              <td class="border border-slate-900 p-1.5"></td>
              <td class="border border-slate-900 p-1.5"></td>
            </tr>

            <!-- PART ROW (B)A -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold">
                <div class="text-black uppercase">PART (B)A</div>
                <div class="text-[#0070c0] uppercase">BAGIAN (B)A</div>
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black uppercase">
                  RIGHTS AND EQUITABLE TREATMENT OF SHAREHOLDERS
                </div>
                <div class="text-[#0070c0] uppercase">
                  HAK-HAK DAN PERLAKUAN SETARA TERHADAP PEMEGANG SAHAM
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- (B)A.1 DESCRIPTOR -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (B)A.1
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal">
                  Right to participate effectively in and vote in general
                  shareholders meeting and should be informed of the rules,
                  including voting procedures, that govern general shareholders
                  meeting.
                </div>
                <div class="text-[#0070c0] text-justify italic">
                  Hak untuk berpartisipasi secara efektif dan memberikan suara
                  dalam Rapat Umum Pemegang Saham dan harus diberitahu terkait
                  aturan, termasuk prosedur pemungutan suara, yang mengatur Rapat
                  Umum Pemegang Saham.
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)A.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)A.1.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company practice real
time secure electronic voting in
absentia at general meetings of
shareholders?

                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan menyediakan
dan menerapkan mekanisme
pemungutan suara secara
elektronik, yang aman dan realtime, bagi Pemegang Saham yang
tidak dapat hadir secara fisik dalam
Rapat Umum Pemegang Saham
(RUPS)?

                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- PART ROW (B)B -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold">
                <div class="text-black uppercase">(B)B</div>
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black uppercase">
                  EQUITABLE TREATMENT OF SHAREHOLDERS
                </div>
                <div class="text-[#0070c0] uppercase">
                  PERLAKUAN SETARA TERHADAP PEMEGANG SAHAM
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (B)B.1
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Notice of AGM</div>
                <div class="text-[#0070c0]">Pemberitahuan RUPS</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)B.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)B.1.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company release its notice of AGM (with detailed
                  agendas and explanatory circulars), as announced to the
                  Exchange, at least 28 days before the date of the meeting?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan menerbitkan pemberitahuan RUPS (dengan acara
                  rinci dan penjelasan), sebagaimana diumumkan ke Bursa,
                  setidaknya 28 hari sebelum tanggal rapat?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- PART ROW (B)C -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold">
                <div class="text-black uppercase">(B)C</div>
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black uppercase">ROLE OF STAKEHOLDERS</div>
                <div class="text-[#0070c0] uppercase">PERAN PEMANGKU KEPENTINGAN</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)C.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)C.1.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company adopt an internationally recognized reporting
                  framework for sustainability (i.e. GRI, Integrated Reporting,
                  SASB)?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengadopsi kerangka pelaporan keberlanjutan
                  yang diakui secara internasional (mis. GRI, Integrated
                  Reporting, SASB)?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)C.1.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)C.1.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose that its Sustainability Report /
                  Sustainability Reporting is externally assured?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan bahwa Laporan Keberlanjutan /
                  pelaporan keberlanjutannya dijamin secara eksternal?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)C.1.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)C.1.3</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose the engagement channel with
                  stakeholder groups and how the company responds to
                  stakeholders' ESG concerns?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan saluran keterlibatan dengan
                  kelompok pemangku kepentingan dan bagaimana perusahaan
                  menanggapi kekhawatiran ESG mereka?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)C.1.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)C.1.4</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have a unit/division/committee specifically
                  responsible for managing sustainability matters?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki unit/divisi/komite yang secara
                  khusus bertanggung jawab mengelola hal-hal keberlanjutan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)C.1.5 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)C.1.5</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose board of directors/commissioners'
                  oversight of sustainability-related risks and opportunities?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan pengawasan direksi/dewan
                  komisaris atas risiko dan peluang terkait keberlanjutan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)C.1.6 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)C.1.6</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose the linkage between executive
                  directors' and senior management remuneration and sustainability
                  performance for the previous year?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan hubungan antara remunerasi
                  direktur eksekutif dan manajemen senior dengan kinerja
                  keberlanjutan pada tahun sebelumnya?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)C.1.7 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)C.1.7</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Is the company's whistle-blowing system managed by independent
                  parties or institutions?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah sistem pelaporan pelanggaran (whistle-blowing) perusahaan
                  dikelola oleh pihak atau lembaga independen?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- PART ROW (B)D -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold">
                <div class="text-black uppercase">(B)D</div>
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black uppercase">
                  DISCLOSURE AND TRANSPARENCY
                </div>
                <div class="text-[#0070c0] uppercase">
                  PENGUNGKAPAN DAN TRANSPARANSI
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (B)D.1
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Quality of Annual Report</div>
                <div class="text-[#0070c0]">Mutu Laporan Tahunan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)D.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)D.1.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Are the audited annual financial report/statements released
                  within 60 days from the financial year end?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah laporan keuangan tahunan yang diaudit diterbitkan dalam
                  waktu 60 hari sejak akhir tahun buku?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- PART ROW (B)E -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold">
                <div class="text-black uppercase">(B)E</div>
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black uppercase">
                  RESPONSIBILITIES OF THE BOARD
                </div>
                <div class="text-[#0070c0] uppercase">TANGGUNG JAWAB DEWAN</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (B)E.1
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Board Competencies and Diversity</div>
                <div class="text-[#0070c0]">Kompetensi dan Diversitas Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)E.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)E.1.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have at least one female independent
                  director/commissioner?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki setidaknya satu direktur/komisaris
                  independen perempuan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)E.1.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)E.1.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have a policy and disclose measurable
                  objectives for implementing its board diversity and report on
                  progress in achieving its objectives?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki kebijakan dan mengungkapkan sasaran
                  terukur untuk menerapkan diversitas dewan serta melaporkan
                  kemajuan pencapaiannya?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (B)E.2
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Board Structure</div>
                <div class="text-[#0070c0]">Struktur Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)E.2.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)E.2.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Is the Nominating Committee comprised entirely of independent
                  directors/commissioners?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah Komite Nominasi seluruhnya terdiri dari
                  direktur/komisaris independen?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)E.2.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)E.2.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the Nominating Committee undertake the process of
                  identifying the quality of directors aligned with the company's
                  strategic directions?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah Komite Nominasi melaksanakan proses mengidentifikasi
                  kualitas direktur yang selaras dengan arah strategis perusahaan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (B)E.3
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Board Appointments and Re-Election</div>
                <div class="text-[#0070c0]">
                  Pengangkatan dan Pemilihan Kembali Dewan
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)E.3.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)E.3.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company use professional search firms or other
                  external sources of candidates when searching for candidates to
                  the board of directors/commissioners?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan menggunakan firma pencarian profesional atau
                  sumber eksternal lain untuk calon anggota direksi/dewan
                  komisaris?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (B)E.4
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Board Structure &amp; Composition</div>
                <div class="text-[#0070c0]">Struktur dan Komposisi Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)E.4.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)E.4.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Do independent non-executive directors/commissioners make up
                  more than 50% of the board for a company with an independent
                  chairman?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah direktur/komisaris independen non-eksekutif membentuk
                  lebih dari 50% dewan bagi perusahaan dengan ketua dewan yang
                  independen?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (B)E.5
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Risk Oversight</div>
                <div class="text-[#0070c0]">Pengawasan Risiko</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)E.5.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)E.5.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company disclose that its board identified key risks
                  relating to information technology including disruption,
                  cybersecurity, and disaster recovery, and that such risks are
                  managed and integrated into the overall risk management
                  framework?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan mengungkapkan bahwa dewan mengidentifikasi
                  risiko utama terkait teknologi informasi termasuk gangguan,
                  keamanan siber, dan pemulihan bencana, serta risiko tersebut
                  dikelola dan diintegrasikan ke dalam kerangka manajemen risiko
                  secara menyeluruh?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (B)E.6
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Board Performance</div>
                <div class="text-[#0070c0]">Kinerja Dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (B)E.6.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(B)E.6.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have a separate board-level Risk Committee?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki Komite Risiko terpisah di tingkat
                  dewan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- LEVEL 2 sebelum PENALTY (pola sama seperti BONUS) -->
            <tr class="bg-[#dce6f1]">
              <td
                colspan="2"
                class="border border-slate-900 p-1.5 align-top font-bold text-black uppercase"
              >
                LEVEL 2
              </td>
              <td class="border border-slate-900 p-1.5 bg-[#dce6f1]"></td>
              <td class="border border-slate-900 p-1.5 bg-[#dce6f1]"></td>
              <td class="border border-slate-900 p-1.5 bg-[#dce6f1]"></td>
              <td class="border border-slate-900 p-1.5 bg-[#dce6f1]"></td>
            </tr>

            <!-- LEVEL 2 (PENALTY ITEMS) -->
            <tr class="bg-white">
              <td
                colspan="2"
                class="border border-slate-900 p-1.5 align-top font-bold text-black uppercase leading-tight"
              >
                LEVEL 2 (PENALTY ITEMS)
              </td>
              <td class="border border-slate-900 p-1.5"></td>
              <td class="border border-slate-900 p-1.5"></td>
              <td class="border border-slate-900 p-1.5"></td>
              <td class="border border-slate-900 p-1.5"></td>
            </tr>

            <!-- PART ROW (P)A -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold">
                <div class="text-black uppercase">PART (P)A</div>
                <div class="text-[#0070c0] uppercase">BAGIAN (P)A</div>
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black uppercase">
                  RIGHTS AND EQUITABLE TREATMENT OF SHAREHOLDERS
                </div>
                <div class="text-[#0070c0] uppercase">
                  HAK-HAK DAN PERLAKUAN SETARA TERHADAP PEMEGANG SAHAM
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)A.1
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Basic shareholder rights</div>
                <div class="text-[#0070c0]">Hak dasar pemegang saham</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)A.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)A.1.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Did the company fail or neglect to offer equal treatment for
                  share repurchases to all shareholders?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan gagal atau mengabaikan memberikan perlakuan
                  setara bagi pembelian kembali saham kepada seluruh pemegang
                  saham?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- DESCRIPTOR (P)A.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)A.2
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal text-sm">
                  Shareholders should be allowed to consult with each other on
                  issues concerning their basic shareholder rights, subject to
                  exceptions to prevent abuse.
                </div>
                <div class="text-[#0070c0] text-justify italic text-sm">
                  Pemegang saham diperbolehkan berkonsultasi satu sama lain
                  mengenai hak dasar pemegang saham, dengan pengecualian untuk
                  mencegah penyalahgunaan.
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)A.2.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)A.2.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Is there evidence of barriers that prevent shareholders from
                  communicating or consulting with other shareholders?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah terdapat bukti hambatan yang menghalangi pemegang saham
                  berkomunikasi atau berkonsultasi dengan pemegang saham lain?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- DESCRIPTOR (P)A.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)A.3
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal text-sm">
                  Right to participate effectively in and vote in general
                  shareholders meetings and be informed of the rules, including
                  voting procedures, that govern general shareholders meetings.
                </div>
                <div class="text-[#0070c0] text-justify italic text-sm">
                  Hak berpartisipasi efektif dan memberikan suara dalam RUPS serta
                  mengetahui aturan, termasuk prosedur pemungutan suara, yang
                  mengatur RUPS.
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)A.3.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)A.3.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Did the company include any additional and unannounced agenda
                  item in the notice of AGM/EGM?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memasukkan mata acara tambahan yang tidak
                  diumumkan dalam pemberitahuan RUPS/RUPSLB?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)A.3.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)A.3.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Did the Chairman of the Board, Audit Committee Chairman and CEO
                  attend the most recent AGM?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah Ketua Dewan, Ketua Komite Audit, dan CEO hadir pada RUPS
                  terakhir?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)A.4
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal text-sm">
                  Did the company fail to disclose the existence of: shareholders
                  agreement, voting cap, or multiple voting rights?
                </div>
                <div class="text-[#0070c0] text-justify italic text-sm">
                  Apakah perusahaan gagal mengungkapkan keberadaan: perjanjian
                  pemegang saham, batas pemungutan suara, atau hak suara ganda?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)A.4.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)A.4.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Shareholders agreement?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Perjanjian pemegang saham?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)A.4.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)A.4.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Voting cap?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Batas pemungutan suara?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)A.4.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)A.4.3</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Multiple voting rights?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Hak suara ganda?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)A.5
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div class="text-black mb-1 text-justify font-normal text-sm">
                  Pyramid ownership structure and/or cross-holding structure.
                </div>
                <div class="text-[#0070c0] text-justify italic text-sm">
                  Struktur kepemilikan piramida dan/atau saling kepemilikan silang.
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)A.5.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)A.5.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Is a pyramid ownership structure and/or cross-holding structure
                  apparent?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah struktur kepemilikan piramida dan/atau saling kepemilikan
                  silang tampak nyata?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- PART (P)B -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold">
                <div class="text-black uppercase">(P)B</div>
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black uppercase">
                  EQUITABLE TREATMENT OF SHAREHOLDERS
                </div>
                <div class="text-[#0070c0] uppercase">
                  PERLAKUAN SETARA TERHADAP PEMEGANG SAHAM
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)B.1
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Insider trading and abusive self-dealing</div>
                <div class="text-[#0070c0]">
                  Perdagangan orang dalam dan penyalahgunaan kepentingan diri
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)B.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)B.1.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Has there been any conviction of insider trading involving
                  directors/commissioners, management and employees in the past
                  three years?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah terdapat hukuman atas perdagangan orang dalam yang
                  melibatkan direktur/komisaris, manajemen, dan karyawan dalam tiga
                  tahun terakhir?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)B.2
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Protecting minority shareholders</div>
                <div class="text-[#0070c0]">Perlindungan pemegang saham minoritas</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)B.2.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)B.2.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Have there been any cases of non-compliance with laws, rules
                  and regulations pertaining to material related party
                  transactions in the past three years?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah terdapat kasus ketidakpatuhan terhadap hukum dan
                  peraturan terkait transaksi pihak berelasi material dalam tiga
                  tahun terakhir?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)B.2.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)B.2.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Were there any RPTs that can be classified as financial
                  assistance (i.e. not conducted at arm's length) to entities
                  other than wholly-owned subsidiaries?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah terdapat transaksi PBR yang dapat diklasifikasikan sebagai
                  bantuan keuangan (bukan pada harga wajar) kepada pihak selain
                  anak perusahaan yang sepenuhnya dimiliki?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- PART (P)C -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold">
                <div class="text-black uppercase">(P)C</div>
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black uppercase">ROLE OF STAKEHOLDERS</div>
                <div class="text-[#0070c0] uppercase">PERAN PEMANGKU KEPENTINGAN</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)C.1
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Stakeholder rights established by law</div>
                <div class="text-[#0070c0]">Hak pemangku kepentingan menurut hukum</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)C.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)C.1.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Have there been any violations of laws pertaining to
                  labour/employment, consumer, insolvency, commercial, competition
                  or environmental issues?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah terdapat pelanggaran hukum terkait ketenagakerjaan,
                  konsumen, kepailitan, komersial, persaingan, atau lingkungan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)C.2
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Stakeholder participation in governance</div>
                <div class="text-[#0070c0]">
                  Partisipasi pemangku kepentingan dalam tata kelola
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)C.2.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)C.2.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Has the company faced sanctions by regulators for failure to
                  make announcements within the requisite time period for
                  material events?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan dikenai sanksi regulator karena gagal
                  mengumumkan peristiwa material dalam jangka waktu yang ditetapkan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)C.2.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)C.2.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Is there any evidence that the company is engaging in
                  greenwashing activities?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah terdapat bukti perusahaan melakukan aktivitas greenwashing?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- PART (P)D -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold">
                <div class="text-black uppercase">(P)D</div>
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black uppercase">
                  DISCLOSURE AND TRANSPARENCY
                </div>
                <div class="text-[#0070c0] uppercase">
                  PENGUNGKAPAN DAN TRANSPARANSI
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)D.1
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Sanctions from regulator on financial reports</div>
                <div class="text-[#0070c0]">Sanksi regulator atas laporan keuangan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)D.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)D.1.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Did the company receive a qualified opinion in its external
                  audit report?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memperoleh opini wajar dengan pengecualian
                  dalam laporan audit eksternal?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)D.1.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)D.1.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Did the company receive an adverse opinion in its external
                  audit report?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memperoleh opini tidak wajar dalam laporan
                  audit eksternal?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)D.1.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)D.1.3</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Did the company receive a disclaimer of opinion in its external
                  audit report?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memperoleh opini menolak memberikan pendapat
                  dalam laporan audit eksternal?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)D.1.4 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)D.1.4</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Has the company in the past year revised its financial
                  statements for reasons other than changes in accounting
                  policies?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan dalam tahun terakhir merevisi laporan
                  keuangannya karena alasan selain perubahan kebijakan akuntansi?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- PART (P)E -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold">
                <div class="text-black uppercase">(P)E</div>
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black uppercase">
                  RESPONSIBILITIES OF THE BOARD
                </div>
                <div class="text-[#0070c0] uppercase">TANGGUNG JAWAB DEWAN</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)E.1
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Compliance with listing rules and laws</div>
                <div class="text-[#0070c0]">Kepatuhan aturan pencatatan dan hukum</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)E.1.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)E.1.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Is there any evidence that the company has not complied with any
                  listing rules and regulations over the past year apart from
                  disclosure rules?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah terdapat bukti perusahaan tidak mematuhi aturan
                  pencatatan dan peraturan dalam setahun terakhir selain aturan
                  pengungkapan?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)E.1.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)E.1.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Have there been any instances where non-executive
                  directors/commissioners have resigned and raised governance-related
                  concerns?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah terdapat kasus direktur/komisaris non-eksekutif mengundurkan
                  diri sambil mengangkat isu terkait tata kelola?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)E.2
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Board structure</div>
                <div class="text-[#0070c0]">Struktur dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)E.2.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)E.2.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have any independent directors/commissioners
                  who have served more than nine years or two terms of five years
                  each (whichever is higher) in the same capacity?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki direktur/komisaris independen yang
                  menjabat lebih dari sembilan tahun atau dua periode lima tahun
                  (mana yang lebih tinggi) dalam kapasitas yang sama?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)E.2.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)E.2.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Did the company fail to identify who the independent
                  director(s)/commissioner(s) are?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan gagal mengidentifikasi siapa
                  direktur/komisaris independennya?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)E.2.3 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)E.2.3</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Does the company have any independent non-executive
                  directors/commissioners who serve on more than five boards of
                  publicly listed companies?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah perusahaan memiliki direktur/komisaris independen
                  non-eksekutif yang duduk di lebih dari lima dewan emiten publik?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)E.3
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">External audit</div>
                <div class="text-[#0070c0]">Audit eksternal</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)E.3.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)E.3.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Is any of the directors or senior management a former employee or
                  partner of the current external auditor in the past two years?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah ada direktur atau manajemen senior yang merupakan mantan
                  karyawan atau mitra auditor eksternal saat ini dalam dua tahun
                  terakhir?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <tr class="bg-white">
              <td class="border border-slate-900 p-2 font-bold text-black">
                (P)E.4
              </td>
              <td class="border border-slate-900 p-2 font-bold leading-tight">
                <div class="text-black">Board structure and composition</div>
                <div class="text-[#0070c0]">Struktur dan komposisi dewan</div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)E.4.1 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)E.4.1</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Has the chairman been the company CEO in the last three years?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah ketua dewan pernah menjadi CEO perusahaan dalam tiga tahun
                  terakhir?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>

            <!-- QUESTION (P)E.4.2 -->
            <tr class="bg-white">
              <td class="border border-slate-900 p-2">
                <span class="text-[#0070c0] font-normal">(P)E.4.2</span>
              </td>
              <td class="border border-slate-900 p-2 leading-snug">
                <div
                  class="text-black mb-1 text-justify font-normal leading-snug"
                >
                  Do non-executive directors/commissioners receive options,
                  performance shares or bonuses?
                </div>
                <div
                  class="text-[#0070c0] text-justify font-normal italic leading-snug"
                >
                  Apakah direktur/komisaris non-eksekutif menerima opsi, saham
                  kinerja, atau bonus?
                </div>
              </td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
              <td class="border border-slate-900 p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
