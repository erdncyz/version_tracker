# Version Tracker / Versiyon Takipçisi

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

A comprehensive tool for tracking third-party library versions with GitHub API integration. Built with Next.js, TypeScript, Prisma, and Tailwind CSS.

GitHub API entegrasyonu ile üçüncü parti kütüphane versiyonlarını takip etmek için kapsamlı bir araç. Next.js, TypeScript, Prisma ve Tailwind CSS ile geliştirilmiştir.

---

## 🌟 Features / Özellikler

### 🔍 **Repository Search / Depo Arama**
- Search and discover GitHub repositories / GitHub depolarını arayın ve keşfedin
- Smart suggestions with 3+ character input / 3+ karakter girişi ile akıllı öneriler
- Popular repositories auto-suggestions / Popüler depolar otomatik öneriler
- Real-time search results / Gerçek zamanlı arama sonuçları

### 📊 **Version Tracking / Versiyon Takibi**
- Track releases and version changes / Sürümleri ve versiyon değişikliklerini takip edin
- Detailed release notes and changelogs / Detaylı sürüm notları ve değişiklik günlükleri
- Pre-release and stable version filtering / Ön sürüm ve kararlı versiyon filtreleme
- Version comparison and history / Versiyon karşılaştırma ve geçmiş

### 🔔 **Notifications / Bildirimler**
- Get notified when new versions are released / Yeni versiyonlar yayınlandığında bildirim alın
- Email and in-app notifications / E-posta ve uygulama içi bildirimler
- Customizable notification preferences / Özelleştirilebilir bildirim tercihleri
- Notification history and management / Bildirim geçmişi ve yönetimi

### 📈 **Dashboard / Kontrol Paneli**
- Overview of all tracked projects and statistics / Tüm takip edilen projelerin genel bakışı ve istatistikleri
- Project statistics and metrics / Proje istatistikleri ve metrikleri
- Top programming languages analysis / En popüler programlama dilleri analizi
- Recent activity feed with pagination / Sayfalama ile son aktiviteler akışı

### 🎨 **Modern UI/UX / Modern Arayüz**
- GitHub-style clean interface / GitHub tarzı temiz arayüz
- Responsive design for all devices / Tüm cihazlar için duyarlı tasarım
- Dark/light theme support / Karanlık/aydınlık tema desteği
- Intuitive navigation and user experience / Sezgisel navigasyon ve kullanıcı deneyimi

### 🚀 **Real-time Updates / Gerçek Zamanlı Güncellemeler**
- Automatic version checking and updates / Otomatik versiyon kontrolü ve güncellemeleri
- Background sync with GitHub API / GitHub API ile arka plan senkronizasyonu
- Live project status updates / Canlı proje durumu güncellemeleri
- Performance optimized API calls / Performans optimizasyonlu API çağrıları

---

## 🛠️ Tech Stack / Teknoloji Yığını

### Frontend / Ön Yüz
- **Next.js 14** - React framework with App Router / App Router ile React framework
- **React 18** - Modern React with hooks and concurrent features / Hook'lar ve eşzamanlı özelliklerle modern React
- **TypeScript 5** - Type-safe JavaScript development / Tip güvenli JavaScript geliştirme
- **Tailwind CSS 3** - Utility-first CSS framework / Utility-first CSS framework
- **Radix UI** - Accessible component primitives / Erişilebilir bileşen primitifleri
- **Lucide React** - Beautiful icon library / Güzel ikon kütüphanesi

### Backend / Arka Yüz
- **Next.js API Routes** - Serverless API endpoints / Sunucusuz API endpoint'leri
- **Prisma 5** - Modern database ORM / Modern veritabanı ORM'i
- **SQLite** - Lightweight database / Hafif veritabanı
- **NextAuth.js** - Authentication library / Kimlik doğrulama kütüphanesi
- **bcryptjs** - Password hashing / Şifre hashleme

### External APIs / Harici API'ler
- **GitHub REST API** - Repository and release data / Depo ve sürüm verileri
- **GitHub OAuth** - User authentication / Kullanıcı kimlik doğrulama
- **Rate limiting** - API usage optimization / API kullanım optimizasyonu

---

## 🚀 Getting Started / Başlangıç

### Prerequisites / Ön Gereksinimler

- **Node.js 18+** - JavaScript runtime / JavaScript çalışma zamanı
- **npm or yarn** - Package manager / Paket yöneticisi
- **GitHub Personal Access Token** - API access / API erişimi
- **Git** - Version control / Versiyon kontrolü

### Installation / Kurulum

#### 1. Clone the repository / Depoyu klonlayın
```bash
git clone https://github.com/your-username/version-tracker.git
cd version-tracker
```

#### 2. Install dependencies / Bağımlılıkları yükleyin
```bash
npm install
# or
yarn install
```

#### 3. Set up environment variables / Ortam değişkenlerini ayarlayın
```bash
cp env.example .env.local
```

Edit `.env.local` and add your configuration / `.env.local` dosyasını düzenleyin ve yapılandırmanızı ekleyin:

```env
# Database / Veritabanı
DATABASE_URL="file:./prisma/dev.db"

# GitHub API
GITHUB_TOKEN=your_github_token_here

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# App Configuration / Uygulama Yapılandırması
NEXT_PUBLIC_APP_NAME="Version Tracker"
NEXT_PUBLIC_APP_DESCRIPTION="Track third-party library versions with GitHub integration"
```

#### 4. Set up the database / Veritabanını ayarlayın
```bash
# Generate Prisma client / Prisma client'ını oluşturun
npm run db:generate

# Push database schema / Veritabanı şemasını gönderin
npm run db:push

# (Optional) Seed the database / (İsteğe bağlı) Veritabanını doldurun
npm run db:seed
```

#### 5. Start the development server / Geliştirme sunucusunu başlatın
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application / Uygulamayı görüntülemek için [http://localhost:3000](http://localhost:3000) adresini açın.

---

## 📖 Usage / Kullanım

### Adding Projects / Proje Ekleme

#### Method 1: Search and Track / Arama ve Takip
1. Go to the **Search** tab / **Arama** sekmesine gidin
2. Enter a repository name (e.g., "selenium", "appium", "react") / Depo adını girin (örn: "selenium", "appium", "react")
3. Use smart suggestions (type 3+ characters) / Akıllı önerileri kullanın (3+ karakter yazın)
4. Click **Track** on any repository you want to monitor / İzlemek istediğiniz herhangi bir depoda **Takip Et**'e tıklayın
5. The project will be added to your tracked projects / Proje takip edilen projelerinize eklenecek

#### Method 2: Direct GitHub URL / Doğrudan GitHub URL'si
1. Go to the **Projects** tab / **Projeler** sekmesine gidin
2. Click **Add Project** / **Proje Ekle**'ye tıklayın
3. Enter the full GitHub repository URL / Tam GitHub depo URL'sini girin
4. Click **Add** to start tracking / Takip etmeye başlamak için **Ekle**'ye tıklayın

### Viewing Versions / Versiyonları Görüntüleme

#### Project Overview / Proje Genel Bakışı
1. Go to the **Projects** tab to see all tracked projects / Tüm takip edilen projeleri görmek için **Projeler** sekmesine gidin
2. Each project shows: / Her proje şunları gösterir:
   - Latest version with green badge / Yeşil rozet ile en son versiyon
   - Star and fork counts / Yıldız ve çatal sayıları
   - Last update time / Son güncelleme zamanı
   - Project language and topics / Proje dili ve konuları

#### Detailed Version Information / Detaylı Versiyon Bilgileri
1. Click on any project card / Herhangi bir proje kartına tıklayın
2. View release history with pagination / Sayfalama ile sürüm geçmişini görüntüleyin
3. See detailed release notes and changelogs / Detaylı sürüm notları ve değişiklik günlüklerini görün
4. Filter by release type (stable, pre-release, draft) / Sürüm türüne göre filtreleyin (kararlı, ön sürüm, taslak)

### Dashboard Features / Kontrol Paneli Özellikleri

#### Statistics Cards / İstatistik Kartları
- **Total Projects** / **Toplam Projeler**: Number of tracked repositories / Takip edilen depo sayısı
- **Total Versions** / **Toplam Versiyonlar**: Total number of tracked versions / Takip edilen toplam versiyon sayısı
- **Outdated Projects** / **Güncel Olmayan Projeler**: Projects with versions older than 30 days / 30 günden eski versiyonları olan projeler
- **Recent Releases** / **Son Sürümler**: Releases in the last 7 days / Son 7 gündeki sürümler

#### Top Languages / En Popüler Diller
- Programming languages used in tracked projects / Takip edilen projelerde kullanılan programlama dilleri
- Project count per language / Dil başına proje sayısı
- Detailed project list for each language / Her dil için detaylı proje listesi
- Pagination for large language lists / Büyük dil listeleri için sayfalama

#### Recent Activity / Son Aktiviteler
- Chronological feed of all project activities / Tüm proje aktivitelerinin kronolojik akışı
- Activity types: / Aktivite türleri:
  - 🟢 **New Release** / **Yeni Sürüm**: New version published / Yeni versiyon yayınlandı
  - 🔵 **Project Added** / **Proje Eklendi**: Project added to tracking / Proje takibe eklendi
  - 🟡 **Project Updated** / **Proje Güncellendi**: Project information updated / Proje bilgileri güncellendi
- Detailed timestamps with relative and absolute dates / Göreceli ve mutlak tarihlerle detaylı zaman damgaları
- Pagination for activity history / Aktivite geçmişi için sayfalama

---

## 🔧 API Endpoints / API Uç Noktaları

### Search / Arama
- `GET /api/search` - Search GitHub repositories / GitHub depolarını ara
- `GET /api/search/suggestions` - Get search suggestions / Arama önerilerini al

### Projects / Projeler
- `GET /api/projects` - Get tracked projects / Takip edilen projeleri al
- `POST /api/projects` - Add a new project to track / Takip etmek için yeni proje ekle
- `PUT /api/projects/[id]` - Update project data / Proje verilerini güncelle
- `DELETE /api/projects/[id]` - Remove project tracking / Proje takibini kaldır

### Versions / Versiyonlar
- `GET /api/versions` - Get project versions / Proje versiyonlarını al
- `GET /api/releases` - Get all releases for a project / Bir proje için tüm sürümleri al

### Authentication / Kimlik Doğrulama
- `POST /api/auth/register` - Register new user / Yeni kullanıcı kaydet
- `GET /api/auth/[...nextauth]` - NextAuth.js endpoints / NextAuth.js uç noktaları

### Notifications / Bildirimler
- `GET /api/notifications` - Get user notifications / Kullanıcı bildirimlerini al
- `PUT /api/notifications/[id]` - Mark notification as read / Bildirimi okundu olarak işaretle
- `DELETE /api/notifications/[id]` - Delete notification / Bildirimi sil

### GitHub Integration / GitHub Entegrasyonu
- `GET /api/github/stars` - Get user's starred repositories / Kullanıcının yıldızlı depolarını al
- `POST /api/github/stars` - Sync starred repositories / Yıldızlı depoları senkronize et

---

## 🗄️ Database Schema / Veritabanı Şeması

The application uses Prisma with the following main models / Uygulama aşağıdaki ana modellerle Prisma kullanır:

### User / Kullanıcı
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  projects      Project[] @relation("UserProjects")
  notifications Notification[]
}
```

### Project / Proje
```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  fullName    String   @unique
  description String?
  language    String?
  stars       Int      @default(0)
  forks       Int      @default(0)
  watchers    Int      @default(0)
  avatar      String?
  homepage    String?
  topics      String?
  isPrivate   Boolean  @default(false)
  isArchived  Boolean  @default(false)
  lastChecked DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  trackedBy   User[]        @relation("UserProjects")
  versions    Version[]
  notifications Notification[]
}
```

### Version / Versiyon
```prisma
model Version {
  id           String   @id @default(cuid())
  tagName      String
  name         String?
  body         String?
  isPrerelease Boolean  @default(false)
  isDraft      Boolean  @default(false)
  publishedAt  DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  projectId    String
  project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

### Notification / Bildirim
```prisma
model Notification {
  id        String   @id @default(cuid())
  title     String
  message   String
  type      String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId String?
  project   Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

---

## 🎨 UI Components / Arayüz Bileşenleri

### Core Components / Temel Bileşenler
- **Header** - Navigation and search / Navigasyon ve arama
- **Dashboard** - Statistics and overview / İstatistikler ve genel bakış
- **ProjectCard** - Individual project display / Bireysel proje görüntüleme
- **SearchResults** - Search results with pagination / Sayfalama ile arama sonuçları
- **SearchSuggestions** - Smart search suggestions / Akıllı arama önerileri

### UI Library / Arayüz Kütüphanesi
- **Card** - Content containers / İçerik konteynerleri
- **Button** - Interactive buttons / Etkileşimli butonlar
- **Badge** - Status indicators / Durum göstergeleri
- **Input** - Form inputs / Form girişleri
- **Tabs** - Tabbed navigation / Sekmeli navigasyon
- **Avatar** - User profile images / Kullanıcı profil resimleri

---

## 🔐 Authentication / Kimlik Doğrulama

### Supported Methods / Desteklenen Yöntemler
- **Email/Password** - Traditional authentication / Geleneksel kimlik doğrulama
- **GitHub OAuth** - Social authentication (optional) / Sosyal kimlik doğrulama (isteğe bağlı)

### Security Features / Güvenlik Özellikleri
- Password hashing with bcryptjs / bcryptjs ile şifre hashleme
- JWT tokens for session management / Oturum yönetimi için JWT token'ları
- CSRF protection / CSRF koruması
- Rate limiting on API endpoints / API uç noktalarında hız sınırlama

---

## 🚀 Deployment / Dağıtım

### Vercel (Recommended) / Vercel (Önerilen)
1. Push your code to GitHub / Kodunuzu GitHub'a gönderin
2. Connect your repository to Vercel / Deponuzu Vercel'e bağlayın
3. Set environment variables / Ortam değişkenlerini ayarlayın
4. Deploy automatically / Otomatik olarak dağıtın

### Docker / Docker
```bash
# Build the image / Görüntüyü oluşturun
docker build -t version-tracker .

# Run the container / Konteyneri çalıştırın
docker run -p 3000:3000 version-tracker
```

### Manual Deployment / Manuel Dağıtım
```bash
# Build the application / Uygulamayı oluşturun
npm run build

# Start the production server / Üretim sunucusunu başlatın
npm start
```

---

## 🧪 Testing / Test Etme

### Running Tests / Testleri Çalıştırma
```bash
# Run all tests / Tüm testleri çalıştır
npm test

# Run tests in watch mode / Testleri izleme modunda çalıştır
npm run test:watch

# Run tests with coverage / Kapsam ile testleri çalıştır
npm run test:coverage
```

### Test Structure / Test Yapısı
- **Unit Tests** - Component and utility testing / Bileşen ve yardımcı test etme
- **Integration Tests** - API endpoint testing / API uç nokta test etme
- **E2E Tests** - End-to-end user flow testing / Uçtan uca kullanıcı akışı test etme

---

## 📊 Performance / Performans

### Optimization Features / Optimizasyon Özellikleri
- **Image Optimization** - Next.js automatic image optimization / Next.js otomatik görüntü optimizasyonu
- **Code Splitting** - Automatic code splitting / Otomatik kod bölme
- **Lazy Loading** - Component lazy loading / Bileşen tembel yükleme
- **Caching** - API response caching / API yanıt önbellekleme
- **Bundle Analysis** - Webpack bundle analyzer / Webpack paket analizörü

### Monitoring / İzleme
- **Performance Metrics** - Core Web Vitals tracking / Temel Web Vitals takibi
- **Error Tracking** - Error boundary and logging / Hata sınırı ve günlükleme
- **Analytics** - User behavior tracking / Kullanıcı davranış takibi

---

## 🤝 Contributing / Katkıda Bulunma

### Development Setup / Geliştirme Kurulumu
1. Fork the repository / Depoyu çatallayın
2. Create a feature branch / Özellik dalı oluşturun
```bash
git checkout -b feature/amazing-feature
```
3. Make your changes / Değişikliklerinizi yapın
4. Add tests if applicable / Uygunsa test ekleyin
5. Commit your changes / Değişikliklerinizi kaydedin
```bash
git commit -m 'Add some amazing feature'
```
6. Push to the branch / Dala gönderin
```bash
git push origin feature/amazing-feature
```
7. Open a Pull Request / Pull Request açın

### Code Style / Kod Stili
- **ESLint** - Code linting / Kod linting
- **Prettier** - Code formatting / Kod formatlama
- **TypeScript** - Type safety / Tip güvenliği
- **Conventional Commits** - Commit message format / Commit mesaj formatı

### Pull Request Guidelines / Pull Request Yönergeleri
- Clear description of changes / Değişikliklerin net açıklaması
- Screenshots for UI changes / UI değişiklikleri için ekran görüntüleri
- Tests for new features / Yeni özellikler için testler
- Documentation updates / Dokümantasyon güncellemeleri

---

## 📝 License / Lisans

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 🆘 Support / Destek

### Getting Help / Yardım Alma
- **GitHub Issues** - Bug reports and feature requests / Hata raporları ve özellik istekleri
- **Discussions** - General questions and community support / Genel sorular ve topluluk desteği
- **Documentation** - Comprehensive guides and API docs / Kapsamlı kılavuzlar ve API dokümanları

### Community / Topluluk
- **Discord** - Real-time chat and support / Gerçek zamanlı sohbet ve destek
- **Twitter** - Updates and announcements / Güncellemeler ve duyurular
- **Blog** - Tutorials and best practices / Öğreticiler ve en iyi uygulamalar

---

## 🙏 Acknowledgments / Teşekkürler

### Open Source Libraries / Açık Kaynak Kütüphaneler
- **Next.js** - React framework / React framework
- **Prisma** - Database toolkit / Veritabanı araç seti
- **Tailwind CSS** - Utility-first CSS / Utility-first CSS
- **Radix UI** - Accessible components / Erişilebilir bileşenler
- **Lucide** - Beautiful icons / Güzel ikonlar

### Inspiration / İlham
- **GitHub** - UI/UX inspiration / UI/UX ilhamı
- **Vercel** - Deployment platform / Dağıtım platformu
- **Open Source Community** - Continuous improvement / Sürekli iyileştirme

---

## 📈 Roadmap / Yol Haritası

### Upcoming Features / Yaklaşan Özellikler
- [ ] **Multi-language Support** - Internationalization / Uluslararasılaştırma
- [ ] **Advanced Filtering** - Complex search filters / Karmaşık arama filtreleri
- [ ] **Team Collaboration** - Shared project tracking / Paylaşılan proje takibi
- [ ] **API Webhooks** - Real-time notifications / Gerçek zamanlı bildirimler
- [ ] **Mobile App** - React Native application / React Native uygulaması
- [ ] **Chrome Extension** - Browser integration / Tarayıcı entegrasyonu

### Long-term Goals / Uzun Vadeli Hedefler
- [ ] **Enterprise Features** - Advanced analytics and reporting / Gelişmiş analitik ve raporlama
- [ ] **Custom Integrations** - Third-party service connections / Üçüncü parti hizmet bağlantıları
- [ ] **Machine Learning** - Intelligent version recommendations / Akıllı versiyon önerileri
- [ ] **Global CDN** - Worldwide performance optimization / Dünya çapında performans optimizasyonu

---

## 📊 Statistics / İstatistikler

![GitHub stars](https://img.shields.io/github/stars/your-username/version-tracker?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-username/version-tracker?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-username/version-tracker)
![GitHub pull requests](https://img.shields.io/github/issues-pr/your-username/version-tracker)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/version-tracker)

---

**Made with ❤️ by [Your Name](https://github.com/your-username)**

**[Your Name](https://github.com/your-username) tarafından ❤️ ile yapıldı**
