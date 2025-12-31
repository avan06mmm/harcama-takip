# Changelog

Tüm projedeki önemli değişiklikler bu dosyada kaydedilir.

Format: [Proje](https://github.com/kullanici-adiniz/harcama-takip)/issues/[İssue Numarası]

## [Unreleased]

### Planlanan Özellikler
- [ ] Bütçe hedefleri sistemi
- [ ] Döviz çevirici API entegrasyonu
- [ ] Aylık ve yıllık raporlar
- [ ] Veri yedekleme ve senkronizasyon
- [ ] Çoklu dil desteği (İngilizce, Almanca vb.)
- [ ] PWA desteği (kurulabilir web uygulaması)
- [ ] Mobil uygulama (React Native)
- [ ] Kategori yönetimi (özel kategori ekleme)
- [ ] Etiket sistemi
- [ ] Arama ve filtreleme özellikleri
- [ ] PDF rapor çıkarma

## [1.0.0] - 2025-12-31

### Eklendi
- ✨ Gelir ve gider ekleme formu
- ✨ İşlem listesi (son işlemleri gösterme)
- ✨ Bakiye özeti (toplam gelir, gider, net bakiye)
- ✨ Pasta grafik ile gider dağılımı
- ✨ LocalStorage ile veri saklama
- ✨ CSV dışa aktarım özelliği
- ✨ Karanlık mod desteği
- ✨ Responsive tasarım (mobil uyumlu)
- ✨ TypeScript desteği
- ✨ Tailwind CSS ile modern UI

### Teknik Detaylar
- Next.js 16 (App Router) kullanıldı
- Zustand state management entegre edildi
- Recharts grafik kütüphanesi eklendi
- Lucide React ikonları kullanıldı
- Class Variance Authority (CVA) ile bileşen varyasyonları oluşturuldu

### Kategoriler
- Gelir kategorileri: Maaş, Yatırım, Freelance, Hediye, Diğer
- Gider kategorileri: Gıda, Ulaşım, Konut, Eğlence, Sağlık, Eğitim, Alışveriş, Faturalar, Diğer

---

## Sürüm Formatı

Bu proje [Semantic Versioning](https://semver.org/spec/v2.0.0.html) kullanır:
- MAJOR: Uyumsuz API değişiklikleri
- MINOR: Yeni özellikler, geriye uyumlu
- PATCH: Hata düzeltmeleri, geriye uyumlu
