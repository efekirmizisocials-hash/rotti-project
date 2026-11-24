# Rotti Planner: planlama modülü

Rotti, planlama, hedefler, finans, sağlık, yemek ve rutinleri tek ekranda toplayan, yapay zekâ destekli bir yaşam yönetimi uygulamasıdır. Bu depo, uygulamanın **planlama modülünü** tek başına çalışan bir demo olarak sunar.

**Tam uygulama:** https://rotti.life · Tam uygulamanın kaynak kodu özel (private) bir depoda tutulur.

![Rotti Planner haftalık görünüm](docs/screenshot.png)

## Bu demoda neler var?

- **Bugün:** saat saat zaman çizelgesi, enerji seviyesine göre "sıradaki en iyi görev" önerisi
- **Hafta, Ay:** haftalık ve aylık takvim görünümleri
- **Tüm görevler:** sıralanabilir liste
- **Pano (Kanban):** Yapılacak / Devam ediyor / Bitti sütunları, sürükle-bırak ile taşıma
- **Tek yapıda üç öğe türü:** görev, alışkanlık, etkinlik
- Alt görevler, etiketler, projeler, tekrar kuralları, hızlı ekleme çubuğu ve ayrıntılı ekleme paneli
- Açık ve koyu tema, TR/EN dil düğmesi

## Demo nasıl çalışır?

Hesap, arka uç veya yapay zekâ hizmeti gerektirmeden doğrudan açılır:

- Giriş (auth) yoktur, tek bir sahte demo kullanıcı vardır.
- Veriler **sahte (mock)** örneklerdir ve yalnızca tarayıcının `localStorage` alanında tutulur. "Demoyu sıfırla" düğmesi örnek verileri geri yükler.
- Veritabanı, gerçek zamanlı senkronizasyon ve API anahtarı yoktur. Uygulama yalnızca yazı tipleri için Google Fonts'a istek yapar.
- Yapay zekâ çağrıları sabit/kural tabanlı **mock** cevaplarla değiştirilmiştir (aşağıya bakın).

## Kullanılan teknolojiler

| Katman         | Teknoloji                               |
| -------------- | --------------------------------------- |
| Arayüz         | React 19, TypeScript, Vite 6            |
| Stil           | Tailwind CSS 3                          |
| Durum yönetimi | Zustand                                 |
| Animasyon      | Framer Motion                           |
| Bildirimler    | react-hot-toast                         |
| Veri           | `localStorage` üzerinde yerel mock depo |

## Kurulum

Gereksinimler: Node.js 20.19+ (veya 22.12+)

```bash
npm install
npm run dev
```

Uygulama http://localhost:3000 adresinde açılır. Üretim derlemesi için `npm run build` (önce tip denetimi, sonra Vite derlemesi çalışır).

## Yapay zekâ kullanımı

**Üründe:** Tam uygulamada Google Gemini ile doğal dilden görev çıkarma, görevi alt adımlara bölme ve otomatik zamanlama gibi özellikler kullanılır. İstekler sunucu üzerinden geçer, API anahtarları tarayıcıya verilmez.

**Bu demoda:** Gemini yoktur, hiçbir ağ isteği yapılmaz. `src/mocks/aiMock.ts` ve `src/hooks/useAIScheduler.ts` içindeki mock'lar:

- Hızlı ekleme: "yarın", "bugün", "acil" gibi birkaç anahtar kelimeyi tanıyan basit kurallar
- Görevi alt adımlara bölme: her zaman aynı üç örnek alt görev
- Otomatik zamanlama ("Magic Schedule"): görevleri sıradaki boş saatlere yerleştirir

**Geliştirmede:** Claude Code (Anthropic) ile kod yazma, yeniden düzenleme ve test üretimi; proje içinde rol bazlı Claude Code ajanları kullanıldı. Bu demonun hazırlanması (mock katmanı, örnek veri, ekran görüntüsü) de Claude Code ile yapıldı. Üretilen kod elle gözden geçirildi; tam projede birim ve uçtan uca testlerle doğrulanır.

## Proje yapısı

```
src/
  components/   Planlayıcı görünümleri (Bugün, Hafta, Ay, Pano), ekleme paneli
  hooks/        Mock veri hook'ları (localStorage tabanlı)
  mocks/        Yerel depo, örnek veri (seed) ve yapay zekâ mock'ları
  store/        Zustand store'ları
  locales/      Arayüz metinleri (EN, TR)
```

## İletişim

Efe Kırmızı · [GitHub](https://github.com/efekirmizisocials-hash)
