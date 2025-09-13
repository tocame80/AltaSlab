import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VideoInstructionsComponent from '@/components/VideoInstructionsComponent';

export default function VideoPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Видеоинструкции
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Наглядные видеоуроки по монтажу SPC панелей АЛЬТА СЛЭБ. 
              Изучайте профессиональные техники установки и следуйте нашим 
              рекомендациям для качественного результата.
            </p>
          </div>

          {/* Video Instructions Component with all improvements */}
          <VideoInstructionsComponent 
            title="Все видеоинструкции"
            showByCategory={true}
          />

          {/* Subscribe Section */}
          <div className="mt-16 bg-gradient-to-r from-[#e90039] to-[#c8002f] rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Подпишитесь на наш канал</h2>
            <p className="text-lg opacity-90 mb-6">
              Получайте уведомления о новых видеоинструкциях и обучающих материалах
            </p>
            <a 
              href="https://www.youtube.com/user/altaprofil1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-white text-[#e90039] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Подписаться на YouTube
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}