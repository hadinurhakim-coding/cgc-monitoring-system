<script lang="ts">
  // Komponen Tabel Ringkasan Skor ACGS persis seperti mockup gambar.
</script>

<div class="w-full overflow-x-auto">
  <table class="w-full min-w-[700px] border-collapse border-2 border-black font-sans text-[13px] text-black bg-white">
    <thead>
      <tr class="bg-[#002060] text-white text-center">
        <th rowspan="2" colspan="2" class="border border-white px-3 py-2 font-semibold align-middle w-[30%]">Standar Tata Kelola Perusahaan</th>
        <th rowspan="2" class="border border-white px-3 py-2 font-semibold align-middle leading-snug">Jumlah<br/>Pertanyaan</th>
        <th rowspan="2" class="border border-white px-3 py-2 font-semibold align-middle leading-snug">Skor<br/>Maksimal</th>
        <th colspan="3" class="border border-white px-2 py-1 font-semibold">Pemenuhan</th>
        <th rowspan="2" class="border border-white px-3 py-2 font-semibold align-middle leading-snug">Total<br/>Skor</th>
      </tr>
      <tr class="bg-[#002060] text-white text-center">
        <th class="border border-white px-2 py-1 font-semibold leading-snug"><span class="italic font-normal">Not<br/>Applicable</span><br/>(N/A)</th>
        <th class="border border-white px-3 py-1 font-semibold align-middle">Tidak</th>
        <th class="border border-white px-3 py-1 font-semibold align-middle">Ya</th>
      </tr>
    </thead>
    <tbody>
      <!-- LEVEL 1 -->
      <tr>
        <td colspan="8" class="border border-black px-2 py-1.5 font-bold">LEVEL 1</td>
      </tr>
      <tr>
        <td class="border border-black px-2 py-1.5 align-top whitespace-nowrap text-center">Bagian A</td>
        <td class="border border-black px-2 py-1.5 align-top">Hak-hak dan Perlakuan<br/>Setara terhadap<br/>Pemegang Saham</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">30</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">20,00</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">12</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">8</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">10</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">14,67</td>
      </tr>
      <tr>
        <td class="border border-black px-2 py-1.5 align-top whitespace-nowrap text-center">Bagian B</td>
        <td class="border border-black px-2 py-1.5 align-top">Keberlanjutan dan<br/>Ketahanan</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">22</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">15,00</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">0</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">4</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">18</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">12,27</td>
      </tr>
      <tr>
        <td class="border border-black px-2 py-1.5 align-top whitespace-nowrap text-center">Bagian C</td>
        <td class="border border-black px-2 py-1.5 align-top">Transparansi dan<br/>Pengungkapan</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">34</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">25,00</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">1</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">11</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">22</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">16,91</td>
      </tr>
      <tr>
        <td class="border border-black px-2 py-1.5 align-top whitespace-nowrap text-center">Bagian D</td>
        <td class="border border-black px-2 py-1.5 align-top">Tanggung Jawab Dewan</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">63</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">40,00</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">3</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">14</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">46</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">31,11</td>
      </tr>
      <tr class="bg-[#b4c6e7] font-bold">
        <td colspan="2" class="border border-black px-2 py-1.5 uppercase">TOTAL LEVEL 1</td>
        <td class="border border-black px-2 py-1.5 text-right">149</td>
        <td class="border border-black px-2 py-1.5 text-right">100,00</td>
        <td class="border border-black px-2 py-1.5 text-right">16</td>
        <td class="border border-black px-2 py-1.5 text-right">37</td>
        <td class="border border-black px-2 py-1.5 text-right">96</td>
        <td class="border border-black px-2 py-1.5 text-right">74,96</td>
      </tr>

      <!-- LEVEL 2 -->
      <tr>
        <td colspan="8" class="border border-black px-2 py-1.5 font-bold">LEVEL 2</td>
      </tr>
      <tr>
        <td class="border border-black px-2 py-1.5 align-top"></td>
        <td class="border border-black px-2 py-1.5 align-top">Bonus</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">18</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">30</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">3</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">7</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">8</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">13,33</td>
      </tr>
      <tr>
        <td class="border border-black px-2 py-1.5 align-top"></td>
        <td class="border border-black px-2 py-1.5 align-top">Penalti</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">26</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">-67</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">5</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">20</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">1</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">(2,58)</td>
      </tr>
      <tr class="bg-[#b4c6e7] font-bold">
        <td colspan="2" class="border border-black px-2 py-1.5 uppercase">TOTAL LEVEL 2</td>
        <td class="border border-black px-2 py-1.5 text-right">44</td>
        <td class="border border-black px-2 py-1.5 text-right">30,00</td>
        <td class="border border-black px-2 py-1.5 text-right">8</td>
        <td class="border border-black px-2 py-1.5 text-right"></td>
        <td class="border border-black px-2 py-1.5 text-right"></td>
        <td class="border border-black px-2 py-1.5 text-right">10,75</td>
      </tr>

      <!-- TOTAL -->
      <tr class="bg-[#b4c6e7] font-bold">
        <td colspan="2" class="border border-black px-2 py-1.5">TOTAL</td>
        <td class="border border-black px-2 py-1.5 text-right">193</td>
        <td class="border border-black px-2 py-1.5 text-right">130,00</td>
        <td class="border border-black px-2 py-1.5 text-right">24</td>
        <td class="border border-black px-2 py-1.5 text-right"></td>
        <td class="border border-black px-2 py-1.5 text-right"></td>
        <td class="border border-black px-2 py-1.5 text-right">85,71</td>
      </tr>
    </tbody>
  </table>
</div>
