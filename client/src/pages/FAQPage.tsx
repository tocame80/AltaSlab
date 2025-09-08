import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { ChevronDown, MessageCircle, Search } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "Все вопросы" },
    { id: "general", name: "Общие вопросы" },
    { id: "installation", name: "Монтаж" },
    { id: "care", name: "Уход и эксплуатация" },
    { id: "technical", name: "Технические характеристики" },
    { id: "purchase", name: "Покупка и доставка" },
  ];

  const faqs = [
    {
      question: "Панель идет с пазом?",
      answer:
        "Все панели имеют замковое соединение SeamlessLock. С двух сторон паз и с двух сторон гребень.",
    },
    {
      question: "Как устанавливать панель — гребнем вверх или вниз?",
      answer:
        "Рекомендуется установка панелей с соединением SeamlessLock гребнем вверх. Это исключает попадание влаги через замковое соединение.",
    },
    {
      question: "Поверхность глянцевая или матовая?",
      answer:
        "Все коллекции представлены в матовом исполнении. Глянцевые панели пока не производятся.",
    },
    {
      question: "Есть ли тиснение на панели как на ламинате?",
      answer:
        "На коллекциях «Мраморная феерия», «Тканевая роскошь», «Магия Бетона», «Матовая Эстетика» тиснение не наносится.",
    },
    {
      question: "Может ли быть разнотон в разных упаковках?",
      answer:
        "Незначительные отличия в оттенках допустимы только в разных партиях, как и у кафельной плитки или обоев.",
    },
    {
      question: "Можно ли клеить ещё на какой-то клей?",
      answer:
        "Да, можно. Необходимо подобрать клей для SPC покрытий и материала стены. Клей Альта Стик разработан для SPC-панелей Альта Слэб с учётом гарантийных обязательств.",
    },
    {
      question: "На какую основу можно приклеить панель?",
      answer:
        "Основание должно быть ровным, чистым, монолитным, твёрдым. Допустимые материалы: бетон, гипсокартон, ОСБ, стекло-магниевый лист, влагостойкая фанера. Следуйте инструкции производителя.",
    },
    {
      question: "Нужно ли грунтовать стену перед монтажом?",
      answer:
        "Грунтование необходимо для улучшения адгезии, укрепления поверхности и снижения расхода клея.",
    },
    {
      question: "Можно ли на пол класть?",
      answer: "Использование стеновых SPC-панелей на полу запрещено.",
    },
    {
      question: "Если стена больше 15 метров, нужен ли зазор и как его делать?",
      answer:
        "Зазор нужен для компенсации линейных расширений. Используйте соединительный профиль или оконные/дверные проёмы в качестве демпфера.",
    },
    {
      question: "Нужно ли делать упор для первого ряда панелей?",
      answer:
        "Первый ряд панелей необходимо зафиксировать для избежания смещения и образования зазоров.",
    },
    {
      question:
        "Можно ли использовать в неотапливаемых помещениях с температурой ниже -30°C?",
      answer:
        "Панели предназначены для помещений со стабильной плюсовой температурой от +10°C до +35°C. Использование ниже этого диапазона не входит в гарантию.",
    },
    {
      question: "Можно и как комбинировать панели 600х300 и 1200х600мм?",
      answer:
        "Панели, произведённые с июля 2025 года, совместимы по замковому соединению с любым типоразмером и коллекцией Альта Слэб.",
    },
    {
      question: "Обязательно ли сдвигать панели при монтаже и на сколько?",
      answer:
        "Смещать панели не требуется, монтаж допускается как со смещением, так и без — это расширяет возможности дизайна.",
    },
    {
      question: "В чём разница SPC и кварцвиниловых панелей?",
      answer:
        "Главное различие — состав минералов. В SPC Альта Слэб используется карбонат кальция (до 2000 кг/м³), что обеспечивает прочность и термостабильность.",
    },
    {
      question:
        "Почему используется термин «кварцвинил» при отсутствии кварца?",
      answer:
        "Термин «кварцвинил» применяется для узнаваемости с 1990-х годов, хотя современные панели содержат карбонат кальция.",
    },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    // For now, since FAQs don't have categories, we'll show all when category is "all"
    const matchesCategory = activeCategory === "all";
    const matchesSearch =
      searchQuery === "" ||
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
              Ответы на самые популярные вопросы о наших SPC панелях, их
              характеристиках, особенностях монтажа и эксплуатации.
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
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
                      ? "bg-[#e90039] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    className="w-full text-left p-6 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#e90039] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <MessageCircle className="w-4 h-4 text-[#e90039]" />
                      </div>
                      <span className="font-semibold text-gray-900 pr-4 text-lg">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                        openIndex === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6">
                      <div className="pl-12">
                        <p className="text-gray-600 leading-relaxed text-lg">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Вопросы не найдены
                </h3>
                <p className="text-gray-600">
                  Попробуйте изменить поисковый запрос или выберите другую
                  категорию
                </p>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-r from-[#e90039] to-[#c8002f] rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              Не нашли ответ на свой вопрос?
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Свяжитесь с нами, и наши специалисты ответят на любые вопросы о
              продукции и услугах
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:88005557773"
                className="bg-white text-[#e90039] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                8 800 555-77-73
              </a>
              <a
                href="mailto:info@alta-slab.ru"
                className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors"
              >
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
