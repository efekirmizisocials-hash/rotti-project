# Rotti: 

Rotti, planlama, hedefler, finans, sağlık, yemek ve rutinleri tek ekranda toplayan, yapay zekâ destekli bir yaşam yönetimi uygulamasıdır.
https://rotti.life 

### Dashboard

- Günlük ilerleme halkası, odak puanı, seri ve toplam bakiye özeti
- Enerji seçici ve seçilen enerjiye göre "şimdi bunu yap" odak görevi, odak zamanlayıcısı (Pomodoro tarzı)
- Görevler, yaklaşanlar, acil işler, mini takvim, alışkanlık ısı haritası, üretkenlik skoru, günlük inceleme ve finans mini grafiği widget'ları
- Widget'ları sürükleyip yeniden sıralama, gösterme/gizleme ve boyut ayarları

### Planlayıcı

- **Bugün:** saat saat zaman çizelgesi, enerji seviyesine göre "sıradaki en iyi görev" önerisi
- **Hafta, Ay:** haftalık ve aylık takvim görünümleri
- **Tüm görevler:** sıralanabilir liste
- **Pano (Kanban):** Yapılacak / Devam ediyor / Bitti sütunları, sürükle-bırak ile taşıma
- Tek yapıda üç öğe türü (görev, alışkanlık, etkinlik), alt görevler, etiketler, projeler, tekrar kuralları, hızlı ekleme çubuğu ve ayrıntılı ekleme paneli

### Finans

- Genel bakış, analiz, bütçeler, abonelikler ve işlem listesi sekmeleri
- Gelir/gider ekleme, kategori bazlı harcama dağılımı, 12 aylık gelir-gider trendi
- Kategori bazlı aylık bütçeler ve abonelik takibi


| Planlayıcı                                          | Finans                                  |
| --------------------------------------------------- | --------------------------------------- |
| ![Planlayıcı haftalık görünüm](docs/screenshot.png) | ![Finans genel bakış](docs/finance.png) |

## Kullanılan teknolojiler

| Katman         | Teknoloji                               |
| -------------- | --------------------------------------- |
| Arayüz         | React 19, TypeScript, Vite 6            |
| Stil           | Tailwind CSS 3                          |
| Durum yönetimi | Zustand                                 |
| Animasyon      | Framer Motion                           |
| Sürükle-bırak  | dnd-kit (Dashboard widget sıralama)     |
| Grafikler      | Recharts                                |
| Bildirimler    | react-hot-toast                         |
| Veri           | `localStorage` üzerinde yerel mock depo |



**Geliştirmede:** Claude Code (Anthropic) ile kod yazma, yeniden düzenleme ve test üretimi; proje içinde rol bazlı Claude Code ajanları kullanıldı. Bu uygulamanın hazırlanması (mock katmanı, örnek veri, ekran görüntüleri) de Claude Code ile yapıldı. Üretilen kod elle gözden geçirildi; tam projede birim ve uçtan uca testlerle doğrulanır.

## Proje yapısı

```
src/
  components/   Dashboard, Planlayıcı (Bugün, Hafta, Ay, Pano) ve Finans görünümleri
  hooks/        Mock veri hook'ları (localStorage tabanlı)
  mocks/        Yerel depo, örnek veriler (seed) ve yapay zekâ mock'ları
  store/        Zustand store'ları
  locales/      Arayüz metinleri (EN, TR)
```

## İletişim

Efe Kırmızı · [GitHub](https://github.com/efekirmizisocials-hash)
