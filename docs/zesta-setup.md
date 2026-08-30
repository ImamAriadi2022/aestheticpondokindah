Installation Setup Guide

To add the AESPI Live Chat live chat widget to your website, simply copy the code snippet below and paste it right before the closing </body> tag of your HTML pages.

Standard Code (for Public Sites)
HTML
Copy Code
<script>
  window.zestaConfig = {
    channelId: "573eb7f7-b6f0-4957-9778-daf531cd967c"
  };
</script>
<script src="https://zesta.id/widget.js?v=1" async></script>
Customer Code (Pass Authenticated Data)
HTML
Copy Code
<script>
  window.zestaConfig = {
    channelId: "573eb7f7-b6f0-4957-9778-daf531cd967c",
    visitor: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+628123456789",
      metadata: {
        "Pilih Layanan": "contoh",
        "Pilih Dokter": "contoh",
        "Pilih Jadwal": "contoh",
        "Kode Reservasi": "contoh",
        "Tanggal": "contoh",
        "Nama Dokter": "contoh",
        "last_visit_date": "contoh",
        "nama_faskes": "contoh"
      }
    }
  };
</script>
<script src="https://zesta.id/widget.js?v=1" async></script>