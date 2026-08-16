<?php

namespace App\Data;

use App\Models\Guest\Wilayah\Wilayah;
use Illuminate\Support\Facades\Schema;

class RegionData
{
    public static array $provinces = [
        "Aceh",
        "Bali",
        "Banten",
        "Bengkulu",
        "DI Yogyakarta",
        "DKI Jakarta",
        "Gorontalo",
        "Jambi",
        "Jawa Barat",
        "Jawa Tengah",
        "Jawa Timur",
        "Kalimantan Barat",
        "Kalimantan Selatan",
        "Kalimantan Tengah",
        "Kalimantan Timur",
        "Kalimantan Utara",
        "Kepulauan Bangka Belitung",
        "Kepulauan Riau",
        "Lampung",
        "Maluku",
        "Maluku Utara",
        "Nusa Tenggara Barat",
        "Nusa Tenggara Timur",
        "Papua",
        "Papua Barat",
        "Papua Barat Daya",
        "Papua Pegunungan",
        "Papua Selatan",
        "Papua Tengah",
        "Riau",
        "Sulawesi Barat",
        "Sulawesi Selatan",
        "Sulawesi Tengah",
        "Sulawesi Tenggara",
        "Sulawesi Utara",
        "Sumatera Barat",
        "Sumatera Selatan",
        "Sumatera Utara",
    ];

    public static array $citiesByProvince = [
        "DKI Jakarta" => [
            "Jakarta Pusat",
            "Jakarta Utara",
            "Jakarta Barat",
            "Jakarta Selatan",
            "Jakarta Timur",
            "Kabupaten Kepulauan Seribu",
        ],
        "Banten" => [
            "Kota Serang",
            "Kota Cilegon",
            "Kota Tangerang",
            "Kota Tangerang Selatan",
            "Kabupaten Serang",
            "Kabupaten Tangerang",
            "Kabupaten Pandeglang",
            "Kabupaten Lebak",
        ],
        "Jawa Barat" => [
            "Kota Bandung",
            "Kota Bekasi",
            "Kota Bogor",
            "Kota Depok",
            "Kota Cimahi",
            "Kota Sukabumi",
            "Kota Tasikmalaya",
            "Kabupaten Bandung",
            "Kabupaten Bekasi",
            "Kabupaten Bogor",
            "Kabupaten Karawang",
            "Kabupaten Purwakarta",
        ],
        "Jawa Tengah" => [
            "Kota Semarang",
            "Kota Surakarta",
            "Kota Magelang",
            "Kota Salatiga",
            "Kota Pekalongan",
            "Kota Tegal",
            "Kabupaten Banyumas",
            "Kabupaten Boyolali",
        ],
        "DI Yogyakarta" => [
            "Kota Yogyakarta",
            "Kabupaten Sleman",
            "Kabupaten Bantul",
            "Kabupaten Gunungkidul",
            "Kabupaten Kulon Progo",
        ],
        "Jawa Timur" => [
            "Kota Surabaya",
            "Kota Malang",
            "Kota Madiun",
            "Kota Mojokerto",
            "Kota Pasuruan",
            "Kota Sidoarjo",
            "Kabupaten Sidoarjo",
            "Kabupaten Gresik",
        ],
        "Sumatera Utara" => ["Kota Medan", "Kota Binjai", "Kabupaten Deli Serdang"],
        "Sumatera Barat" => ["Kota Padang", "Kota Bukittinggi", "Kabupaten Agam"],
        "Riau" => ["Kota Pekanbaru", "Kabupaten Kampar"],
        "Jambi" => ["Kota Jambi", "Kabupaten Muaro Jambi"],
        "Sumatera Selatan" => ["Kota Palembang", "Kabupaten Ogan Ilir"],
        "Lampung" => ["Kota Bandar Lampung", "Kabupaten Lampung Selatan"],
        "Kepulauan Riau" => ["Kota Batam", "Kota Tanjungpinang"],
        "Nusa Tenggara Barat" => ["Kota Mataram", "Kabupaten Lombok Barat"],
        "Bali" => ["Kota Denpasar", "Kabupaten Badung", "Kabupaten Gianyar"],
        "Kalimantan Barat" => ["Kota Pontianak", "Kabupaten Kubu Raya"],
        "Kalimantan Tengah" => ["Kota Palangka Raya", "Kabupaten Katingan"],
        "Kalimantan Selatan" => ["Kota Banjarmasin", "Kota Banjarbaru"],
        "Kalimantan Timur" => ["Kota Samarinda", "Kota Balikpapan"],
        "Kalimantan Utara" => ["Kota Tarakan", "Kabupaten Bulungan"],
        "Sulawesi Utara" => ["Kota Manado", "Kabupaten Minahasa"],
        "Gorontalo" => ["Kota Gorontalo", "Kabupaten Gorontalo"],
        "Sulawesi Tengah" => ["Kota Palu", "Kabupaten Sigi"],
        "Sulawesi Selatan" => ["Kota Makassar", "Kota Parepare"],
        "Sulawesi Tenggara" => ["Kota Kendari", "Kabupaten Konawe"],
        "Maluku" => ["Kota Ambon", "Kabupaten Maluku Tengah"],
        "Maluku Utara" => ["Kota Ternate", "Kabupaten Halmahera Utara"],
        "Papua" => ["Kota Jayapura", "Kabupaten Jayapura"],
        "Papua Barat" => ["Kota Sorong", "Kabupaten Manokwari"],
        "Papua Selatan" => ["Kota Merauke", "Kabupaten Boven Digoel"],
        "Papua Tengah" => ["Kota Nabire", "Kabupaten Mimika"],
        "Papua Pegunungan" => ["Kota Jayawijaya", "Kabupaten Jayawijaya"],
        "Papua Barat Daya" => ["Kota Sorong Selatan", "Kabupaten Sorong Selatan"],
        "Aceh" => ["Kota Banda Aceh", "Kabupaten Aceh Besar"],
        "Bengkulu" => ["Kota Bengkulu", "Kabupaten Bengkulu Selatan"],
        "Kepulauan Bangka Belitung" => ["Kota Pangkalpinang", "Kabupaten Bangka"],
        "Nusa Tenggara Timur" => ["Kota Kupang", "Kabupaten Timor Tengah Selatan"],
        "Sulawesi Barat" => ["Kota Mamuju", "Kabupaten Mamuju"],
    ];

    public static array $districtsByCity = [
        "Jakarta Pusat" => [
            "Gambir",
            "Sawah Besar",
            "Kemayoran",
            "Senen",
            "Cempaka Putih",
            "Menteng",
            "Tanah Abang",
            "Johar Baru",
        ],
        "Jakarta Utara" => [
            "Penjaringan",
            "Tanjung Priok",
            "Koja",
            "Cilincing",
            "Pademangan",
            "Kelapa Gading",
        ],
        "Jakarta Barat" => [
            "Cengkareng",
            "Grogol Petamburan",
            "Taman Sari",
            "Tambora",
            "Palmerah",
            "Kebon Jeruk",
            "Kembangan",
            "Kalideres",
        ],
        "Jakarta Selatan" => [
            "Jagakarsa",
            "Mampang Prapatan",
            "Pancoran",
            "Pasar Minggu",
            "Pesanggrahan",
            "Setiabudi",
            "Tebet",
            "Cilandak",
            "Kebayoran Baru",
            "Kebayoran Lama",
        ],
        "Jakarta Timur" => [
            "Cakung",
            "Cipayung",
            "Ciracas",
            "Duren Sawit",
            "Jatinegara",
            "Kramat Jati",
            "Makasar",
            "Matraman",
            "Pasar Rebo",
            "Pulo Gadung",
        ],
        "Kabupaten Kepulauan Seribu" => [
            "Kepulauan Seribu Utara",
            "Kepulauan Seribu Selatan",
        ],
        "Kota Tangerang" => [
            "Ciledug",
            "Cipondoh",
            "Karawaci",
            "Cibeber",
            "Periuk",
            "Batuceper",
            "Tangerang",
            "Neglasari",
            "Benda",
            "Jatiuwung",
        ],
        "Kota Tangerang Selatan" => [
            "Serpong",
            "Serpong Utara",
            "Pondok Aren",
            "Ciputat",
            "Ciputat Timur",
            "Pamulang",
            "Setu",
        ],
        "Kota Serang" => [
            "Serang",
            "Kasemen",
            "Cipocok Jaya",
            "Curug",
            "Taktakan",
            "Walantaka",
        ],
        "Kota Cilegon" => [
            "Cilegon",
            "Cibeber",
            "Citangkil",
            "Pulomerak",
            "Purwakarta",
            "Gerogol",
        ],
        "Kota Bandung" => [
            "Andir",
            "Astanaanyar",
            "Antapani",
            "Arcamanik",
            "Babakan Ciparay",
            "Bandung Kidul",
            "Bandung Kulon",
            "Bandung Wetan",
            "Batununggal",
            "Bojongloa Kaler",
            "Bojongloa Kidul",
            "Buahbatu",
            "Cibeunying Kaler",
            "Cibeunying Kidul",
            "Cibiru",
            "Cicendo",
            "Cidadap",
            "Cinambo",
            "Coblong",
            "Gedebage",
            "Kiaracondong",
            "Lengkong",
            "Mandalajati",
            "Panyileukan",
            "Rancasari",
            "Regol",
            "Sukajadi",
            "Sukasari",
            "Sumur Bandung",
            "Ujungberung",
        ],
        "Kota Bekasi" => [
            "Bekasi Barat",
            "Bekasi Selatan",
            "Bekasi Timur",
            "Bekasi Utara",
            "Jatiasih",
            "Jatisampurna",
            "Medan Satria",
            "Mustika Jaya",
            "Pondok Gede",
            "Pondok Melati",
            "Rawalumbu",
        ],
        "Kota Depok" => [
            "Beji",
            "Bojongsari",
            "Cilodong",
            "Cimanggis",
            "Cinere",
            "Cipayung",
            "Limo",
            "Pancoran Mas",
            "Sawangan",
            "Sukmajaya",
            "Tapos",
        ],
        "Kota Bogor" => [
            "Bogor Barat",
            "Bogor Selatan",
            "Bogor Tengah",
            "Bogor Timur",
            "Bogor Utara",
            "Tanah Sereal",
        ],
        "Kota Cimahi" => [
            "Cimahi Selatan",
            "Cimahi Tengah",
            "Cimahi Utara",
        ],
    ];

    private static array $fallbackDistricts = [
        "Kecamatan 1",
        "Kecamatan 2",
        "Kecamatan 3",
        "Kecamatan 4",
        "Kecamatan 5",
    ];

    public static function provinces(): array
    {
        if (Schema::hasTable('wilayah') && Wilayah::query()->exists()) {
            return Wilayah::provinces()
                ->orderBy('nama')
                ->get()
                ->map(fn ($w) => ['id' => $w->kode, 'name' => $w->nama, 'kode' => $w->kode])
                ->toArray();
        }

        return array_map(
            fn ($name) => ['id' => $name, 'name' => $name, 'kode' => ''],
            self::$provinces
        );
    }

    public static function regencies(string $provinceParam): array
    {
        if (Schema::hasTable('wilayah') && Wilayah::query()->exists()) {
            $provinceKode = $provinceParam;
            if (!preg_match('/^\d{2}$/', $provinceParam)) {
                $prov = Wilayah::provinces()->where('nama', $provinceParam)->first();
                $provinceKode = $prov ? $prov->kode : null;
            }

            if ($provinceKode) {
                return Wilayah::regencies($provinceKode)
                    ->orderBy('nama')
                    ->get()
                    ->map(fn ($w) => ['id' => $w->kode, 'name' => $w->nama, 'kode' => $w->kode])
                    ->toArray();
            }
        }

        $cities = self::$citiesByProvince[$provinceParam] ?? [];
        return array_map(
            fn ($name) => ['id' => $name, 'name' => $name, 'kode' => ''],
            $cities
        );
    }

    public static function districts(string $cityParam): array
    {
        if (Schema::hasTable('wilayah') && Wilayah::query()->exists()) {
            $regencyKode = $cityParam;
            if (!preg_match('/^\d{2}\.\d{2}$/', $cityParam)) {
                $reg = Wilayah::query()->whereRaw('CHAR_LENGTH(kode) = 5')->where('nama', $cityParam)->first();
                $regencyKode = $reg ? $reg->kode : null;
            }

            if ($regencyKode) {
                return Wilayah::districts($regencyKode)
                    ->orderBy('nama')
                    ->get()
                    ->map(fn ($w) => ['id' => $w->kode, 'name' => $w->nama, 'kode' => $w->kode])
                    ->toArray();
            }
        }

        $districts = self::$districtsByCity[$cityParam] ?? self::$fallbackDistricts;
        return array_map(
            fn ($name) => ['id' => $name, 'name' => $name, 'kode' => ''],
            $districts
        );
    }

    public static function villages(string $districtParam): array
    {
        if (Schema::hasTable('wilayah') && Wilayah::query()->exists()) {
            $districtKode = $districtParam;
            if (!preg_match('/^\d{2}\.\d{2}\.\d{2}$/', $districtParam)) {
                $dist = Wilayah::query()->whereRaw('CHAR_LENGTH(kode) = 8')->where('nama', $districtParam)->first();
                $districtKode = $dist ? $dist->kode : null;
            }

            if ($districtKode) {
                return Wilayah::villages($districtKode)
                    ->orderBy('nama')
                    ->get()
                    ->map(fn ($w) => ['id' => $w->kode, 'name' => $w->nama, 'kode' => $w->kode])
                    ->toArray();
            }
        }

        return [];
    }
}
