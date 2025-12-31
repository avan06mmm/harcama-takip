# 🚀 Hızlı Başlangıç Kılavuzu

## İlk Çalıştırma

1. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

2. **Tarayıcınızda açın:**
   ```
   http://localhost:3000
   ```

## İlk İşleminizi Ekleyin

1. Sayfadaki "Yeni İşlem Ekle" butonuna tıklayın
2. İşlem türünü seçin (Gelir veya Gider)
3. Tutar girin
4. Kategori seçin
5. Tarih belirleyin (varsayılan olarak bugün)
6. İsteğe bağlı bir not ekleyin
7. "Kaydet" butonuna tıklayın

## Özellikler

### 💰 Bakiye Özeti
- Sayfanın üst kısmında toplam gelir, gider ve mevcut bakiyeyi görebilirsiniz
- Bakiye renkleri durumuna göre değişir (pozitif/negatif)

### 📊 Grafikler
- Giderleriniz kategori bazında pasta grafik ile gösterilir
- Hover ile kategorilerin detaylı tutarlarını görebilirsiniz

### 💾 Veri Saklama
- Tüm verileriniz tarayıcının LocalStorage'ında saklanır
- Sayfayı kapatsanız bile verileriniz korunur

### 📥 CSV Dışa Aktarım
- "CSV Dışa Aktar" butonuna tıklayarak verilerinizi indirebilirsiniz
- İndirilen dosyayı Excel veya Google Sheets ile açabilirsiniz

### 🌙 Karanlık Mod
- Sağ üstteki ay/güneş ikonuna tıklayarak tema değiştirebilirsiniz
- Tercihiniz tarayıcınızda saklanır

## Proje Yapısı

```
harcama-takip/
├── app/                    # Next.js App Router
│   ├── globals.css         # Global stiller
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Ana sayfa
├── components/             # React bileşenleri
│   ├── ui/                 # Temel UI bileşenleri
│   ├── balance-summary.tsx # Bakiye özeti
│   ├── category-chart.tsx # Grafikler
│   ├── theme-toggle.tsx    # Tema değiştirme
│   ├── transaction-form.tsx # Form bileşeni
│   └── transaction-list.tsx # İşlem listesi
├── lib/                    # Yardımcı fonksiyonlar
│   ├── store.ts           # Zustand state store
│   └── utils.ts           # Yardımcı fonksiyonlar
├── types/                  # TypeScript tipleri
│   └── transaction.ts     # Veri modelleri
└── public/                 # Statik dosyalar
```

## Geliştirme İpuçları

### Yeni Bir Özellik Eklemek

1. `components/` klasörüne yeni bileşen ekleyin
2. `lib/store.ts` içinde state yönetimini güncelleyin
3. `app/page.tsx` içinde bileşeni kullanın
4. Tailwind CSS ile stillendirin

### Stil Değişiklikleri

- `app/globals.css` içinde CSS değişkenleri bulunur
- `tailwind.config.ts` içinde tema ayarları bulunur

### Hata Ayıklama

- Geliştirme modunda konsol hatalarını kontrol edin
- TypeScript hatalarını düzeltin
- ESLint kurallarına uyun

## Yayın Yayınlama

Production build oluşturmak için:

```bash
npm run build
npm run start
```

## Destek

Sorun yaşarsanız:
1. [Issues](https://github.com/kullanici-adiniz/harcama-takip/issues) sayfasına gidin
2. Sorun detaylı olarak açıklayın
3. Ekran görüntüleri paylaşın
4. Hata mesajlarını ekleyin

İyi kodlamalar! 🎉
