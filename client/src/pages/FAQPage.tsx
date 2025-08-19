import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { ChevronDown, MessageCircle, Search } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Все вопросы' },
    { id: 'general', name: 'Общие вопросы' },
    { id: 'installation', name: 'Монтаж' },
    { id: 'care', name: 'Уход и эксплуатация' },
    { id: 'technical', name: 'Технические характеристики' },
    { id: 'purchase', name: 'Покупка и доставка' }
  ];

  const faqs = [
    {
      category: 'general',
      question: 'Что такое SPC панели и чем они отличаются от других материалов?',
      answer: 'SPC (Stone Plastic Composite) - это композитный материал, состоящий из каменной муки (около 60%), PVC смолы (около 30%) и стабилизаторов (около 10%). Он обладает высокой прочностью, влагостойкостью и долговечностью, превосходя по характеристикам обычные пластиковые панели, МДФ и даже некоторые виды керамической плитки.'
    },
    {
      category: 'general',
      question: 'Можно ли устанавливать панели во влажных помещениях?',
      answer: 'Да, SPC панели АЛЬТА СЛЭБ полностью влагостойки и идеально подходят для ванных комнат, кухонь, саун, бассейнов и других влажных помещений. Материал не деформируется, не разбухает от воздействия влаги и не подвержен образованию плесени и грибка.'
    },
    {
      category: 'technical',
      question: 'Какие размеры панелей доступны?',
      answer: 'Мы предлагаем панели различных размеров: 122×244 мм, 153×2440 мм, 200×3000 мм и другие форматы. Каждая коллекция может иметь свои стандартные размеры. Точные размеры указаны в характеристиках каждой коллекции.'
    },
    {
      category: 'purchase',
      question: 'Как рассчитать необходимое количество материала?',
      answer: 'Используйте наш онлайн-калькулятор на сайте. Введите размеры помещения, и система автоматически рассчитает количество панелей с учетом отходов. Рекомендуем добавить 10-15% к расчетному количеству для компенсации отходов при резке и возможных повреждений.'
    },
    {
      category: 'general',
      question: 'Какой срок службы у панелей АЛЬТА СЛЭБ?',
      answer: 'При правильном монтаже и эксплуатации срок службы панелей составляет более 25 лет. Мы предоставляем гарантию 10 лет на все коллекции от производственных дефектов и потери первоначального внешнего вида при нормальных условиях эксплуатации.'
    },
    {
      category: 'installation',
      question: 'Можно ли монтировать панели самостоятельно?',
      answer: 'Да, монтаж довольно простой и может выполняться самостоятельно при наличии базовых навыков работы с инструментами. Мы предоставляем подробные видеоинструкции, схемы раскладки и рекомендации по установке. Основные инструменты: дрель, уровень, рулетка, клей для SPC панелей.'
    },
    {
      category: 'installation',
      question: 'Какая подготовка поверхности требуется?',
      answer: 'Поверхность должна быть чистой, сухой, ровной и прочной. Максимально допустимые неровности - 2 мм на 1 метр. При необходимости выровняйте поверхность шпаклевкой или штукатуркой. Обязательно обработайте поверхность грунтовкой глубокого проникновения.'
    },
    {
      category: 'installation',
      question: 'Какой клей использовать для монтажа?',
      answer: 'Рекомендуем использовать специальный клей для SPC панелей или универсальный строительный клей на полиуретановой основе. В нашем ассортименте есть клей собственного производства, оптимально подходящий для наших панелей. Расход клея составляет примерно 300-400 г на 1 м².'
    },
    {
      category: 'care',
      question: 'Как ухаживать за панелями?',
      answer: 'Панели не требуют специального ухода. Для очистки используйте влажную тряпку с мягким моющим средством. Избегайте абразивных средств и жестких щеток. При сильных загрязнениях можно использовать спиртосодержащие средства. Панели не требуют покраски, лакировки или других видов обработки.'
    },
    {
      category: 'care',
      question: 'Устойчивы ли панели к механическим повреждениям?',
      answer: 'SPC панели обладают высокой устойчивостью к ударам, царапинам и другим механическим воздействиям. Однако при сильных ударах острыми предметами возможны повреждения. В случае серьезного повреждения отдельную панель можно заменить без демонтажа всей поверхности.'
    },
    {
      category: 'technical',
      question: 'При какой температуре можно эксплуатировать панели?',
      answer: 'Панели АЛЬТА СЛЭБ выдерживают температуры от -40°C до +60°C без изменения свойств. Они подходят для неотапливаемых помещений, саун (до +80°C кратковременно), а также для наружного применения в климатических условиях России.'
    },
    {
      category: 'technical',
      question: 'Можно ли резать панели?',
      answer: 'Да, панели легко режутся обычными инструментами: ножовкой по металлу, электролобзиком, болгаркой с диском по пластику. При резке используйте мелкозубчатые пилки для получения ровного среза. Обязательно используйте средства защиты глаз и органов дыхания.'
    },
    {
      category: 'purchase',
      question: 'Как заказать продукцию?',
      answer: 'Заказ можно оформить через наш сайт, по телефону 8 800 555-77-73 или в офисе продаж. Мы принимаем заказы от частных лиц и организаций. Для крупных заказов предоставляем скидки. Минимальная сумма заказа для доставки составляет 5000 рублей.'
    },
    {
      category: 'purchase',
      question: 'Какие способы доставки доступны?',
      answer: 'Доставка осуществляется по Москве и Московской области нашим транспортом, в регионы - транспортными компаниями. Стоимость доставки рассчитывается индивидуально в зависимости от объема и удаленности. Самовывоз доступен с нашего склада в Москве.'
    },
    {
      category: 'purchase',
      question: 'Предоставляете ли вы образцы?',
      answer: 'Да, мы предоставляем бесплатные образцы размером 10×10 см для ознакомления с фактурой и цветом. Вы можете заказать до 5 образцов бесплатно. Образцы отправляем почтой России или можете забрать в нашем офисе.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Часто задаваемые вопросы
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Ответы на самые популярные вопросы о наших SPC панелях, 
              их характеристиках, особенностях монтажа и эксплуатации.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-12">
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Поиск по вопросам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-[#E95D22] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <button
                    className="w-full text-left p-6 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#E95D22] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <MessageCircle className="w-4 h-4 text-[#E95D22]" />
                      </div>
                      <span className="font-semibold text-gray-900 pr-4 text-lg">{faq.question}</span>
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                        openIndex === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6">
                      <div className="pl-12">
                        <p className="text-gray-600 leading-relaxed text-lg">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Вопросы не найдены</h3>
                <p className="text-gray-600">Попробуйте изменить поисковый запрос или выберите другую категорию</p>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-r from-[#E95D22] to-[#d54a1a] rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Не нашли ответ на свой вопрос?</h2>
            <p className="text-lg opacity-90 mb-6">
              Свяжитесь с нами, и наши специалисты ответят на любые вопросы о продукции и услугах
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:88005557773" className="bg-white text-[#E95D22] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                8 800 555-77-73
              </a>
              <a href="mailto:info@alta-slab.ru" className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors">
                info@alta-slab.ru
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}