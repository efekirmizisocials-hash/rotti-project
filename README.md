# Rotti: Hayatının tamamı, tek yerde

Rotti, planlama, hedefler, finans, sağlık, yemek ve rutinleri tek ekranda toplayan, yapay zekâ destekli bir yaşam yönetimi uygulaması.

**Canlı uygulama:** https://rotti.life

![Rotti ana sayfa](docs/screenshot.png)

> Bu depo, projenin **vitrin** deposudur: tanıtım, ekran görüntüsü ve örnek bir kod dosyası içerir. Uygulamanın tam kaynak kodu özel (private) bir depoda tutulur.

## Ne yapar?

- **Planlayıcı:** görev, alışkanlık ve etkinlikler tek yapıda; Kanban, takvim ve zaman çizelgesi görünümleri
- **Hedefler:** hedef ve ilerleme takibi, hedeften yapay zekâ ile proje planı çıkarma
- **Finans:** hesaplar, işlemler, bütçe ve harcama dağılımı
- **Sağlık:** antrenman, ölçüm ve ruh hâli takibi
- **Yemek:** yemek planı, tarif defteri, yapay zekâ önerileri
- **Rutinler ve odak modu:** rutin takibi, Pomodoro tarzı odak oturumları
- **Yapay zekâ ile giriş:** “yarın saat 15’te süt al” gibi serbest yazıyı düzgün bir göreve çevirir
- **Türkçe ve İngilizce arayüz**, çevrimdışı çalışabilen PWA, Capacitor ile iOS/Android desteği

## Kullanılan teknolojiler

| Katman | Teknoloji |
|---|---|
| Arayüz | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Durum yönetimi | Zustand |
| Grafikler | Recharts, D3 |
| Veritabanı ve kimlik doğrulama | Supabase (PostgreSQL, Row Level Security) |
| Yapay zekâ | Google Gemini (`@google/genai`), anahtarlar sunucu tarafında |
| API katmanı | Supabase Edge Functions, Node.js/Express vekil sunucu |
| Mobil | Capacitor (iOS, Android), PWA |
| Test | Vitest, Playwright |
| Yayın | Vercel |

## Kurulum (tam proje için)

Tam kaynak kod özel depoda olduğu için aşağıdaki adımlar o depo içindir.

```bash
# 1. Bağımlılıkları kur
npm install

# 2. Ortam dosyasını oluştur (.env.local, git'e girmez)
#    İçine şu iki anahtarı yaz:
#    VITE_SUPABASE_URL=
#    VITE_SUPABASE_ANON_KEY=

# 3. Uygulamayı başlat (http://localhost:3000)
npm run dev
```

Yapay zekâ çağrıları Supabase Edge Function (`gemini-generate`) üzerinden geçer. Gemini anahtarı (`GEMINI_API_KEY`) tarayıcıya verilmez, Supabase projesinde gizli değişken (secret) olarak tanımlanır.

Gereksinimler: Node.js 20+, bir Supabase projesi, Google AI Studio’dan bir Gemini API anahtarı.

Testler için: `npm run test` (birim), `npm run test:e2e` (uçtan uca).

## Örnek kod

`examples/brainDumpTransformer.ts`: yapay zekânın çıkardığı öğeleri veritabanına girmeden önce doğrulayan saf (yan etkisiz) dönüşüm katmanı. Geçersiz bir değer gelirse güvenli varsayılana düşer. Bu dosya tek başına çalışmaz, projenin tip dosyalarına bağlıdır.

## Yapay zekâ kullanımı

**Üründe:** Gemini ile doğal dilden görev çıkarma, düşünce dökümünü görev/fikir/hedeflere ayırma, günlük koçluk önerileri, yemek önerileri ve sesli not çözümleme. API anahtarları tarayıcıya verilmez, istekler sunucu üzerinden geçer.

**Geliştirmede:** Claude Code (Anthropic) ile kod yazma, refactor ve test üretimi; proje içinde rol bazlı Claude Code ajanları (mimari, frontend, backend, test, güvenlik, denetim). Güvenlik, RLS ve bağımlılık denetimi kapıları ile bu ajan şablonları için Optimus adlı yerel altyapı kullanıldı. Üretilen kod elle gözden geçirilip testlerden geçirildi.

## Ekran görüntüsü hakkında

Yukarıdaki görsel uygulamanın ana sayfasıdır.

## İletişim

Efe Kırmızı · [GitHub](https://github.com/efekirmizisocials-hash)
