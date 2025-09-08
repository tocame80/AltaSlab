import { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQComponentProps {
  title?: string;
  maxItems?: number;
  showCategories?: string[];
}

export default function FAQComponent({ 
  title = "Часто задаваемые вопросы",
  maxItems,
  showCategories
}: FAQComponentProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // FAQ data from FAQPage.tsx
  const allFAQs: FAQItem[] = [
    {
      question: "Панель идет с пазом?",
      answer: "Все панели имеют замковое соединение SeamlessLock. С двух сторон паз и с двух сторон гребень.",
      category: "general"
    },
    {
      question: "Как устанавливать панель — гребнем вверх или вниз?",
      answer: "Рекомендуется установка панелей с соединением SeamlessLock гребнем вверх. Это исключает попадание влаги через замковое соединение.",
      category: "installation"
    },
    {
      question: "Поверхность глянцевая или матовая?",
      answer: "Все коллекции представлены в матовом исполнении. Глянцевые панели пока не производятся.",
      category: "technical"
    },
    {
      question: "Есть ли тиснение на панели как на ламинате?",
      answer: "На коллекциях «Мраморная феерия», «Тканевая роскошь», «Магия Бетона», «Матовая Эстетика» тиснение не наносится.",
      category: "technical"
    },
    {
      question: "Может ли быть разнотон в разных упаковках?",
      answer: "Незначительные отличия в оттенках допустимы только в разных партиях, как и у кафельной плитки или обоев.",
      category: "general"
    },
    {
      question: "Можно ли клеить ещё на какой-то клей?",
      answer: "Да, можно. Необходимо подобрать клей для SPC покрытий и материала стены. Клей Альта Стик разработан для SPC-панелей Альта Слэб с учётом гарантийных обязательств.",
      category: "installation"
    },
    {
      question: "На какую основу можно приклеить панель?",
      answer: "Основание должно быть ровным, чистым, монолитным, твёрдым. Допустимые материалы: бетон, гипсокартон, ОСБ, стекло-магниевый лист, влагостойкая фанера. Следуйте инструкции производителя.",
      category: "installation"
    },
    {
      question: "Нужно ли грунтовать стену перед монтажом?",
      answer: "Грунтование необходимо для улучшения адгезии, укрепления поверхности и снижения расхода клея.",
      category: "installation"
    },
    {
      question: "Можно ли на пол класть?",
      answer: "Использование стеновых SPC-панелей на полу запрещено.",
      category: "installation"
    },
    {
      question: "Если стена больше 15 метров, нужен ли зазор и как его делать?",
      answer: "Зазор нужен для компенсации линейных расширений. Используйте соединительный профиль или оконные/дверные проёмы в качестве демпфера.",
      category: "installation"
    },
    {
      question: "Нужно ли делать упор для первого ряда панелей?",
      answer: "Первый ряд панелей необходимо зафиксировать для избежания смещения и образования зазоров.",
      category: "installation"
    },
    {
      question: "Можно ли использовать в неотапливаемых помещениях с температурой ниже -30°C?",
      answer: "Панели предназначены для помещений со стабильной плюсовой температурой от +10°C до +35°C. Использование ниже этого диапазона не входит в гарантию.",
      category: "care"
    },
    {
      question: "Можно и как комбинировать панели 600х300 и 1200х600мм?",
      answer: "Панели, произведённые с июля 2025 года, совместимы по замковому соединению с любым типоразмером и коллекцией Альта Слэб.",
      category: "installation"
    },
    {
      question: "Обязательно ли сдвигать панели при монтаже и на сколько?",
      answer: "Смещать панели не требуется, монтаж допускается как со смещением, так и без — это расширяет возможности дизайна.",
      category: "installation"
    },
    {
      question: "В чём разница SPC и кварцвиниловых панелей?",
      answer: "Главное различие — состав минералов. В SPC Альта Слэб используется карбонат кальция (до 2000 кг/м³), что обеспечивает прочность и термостабильность.",
      category: "technical"
    },
    {
      question: "Почему используется термин «кварцвинил» при отсутствии кварца?",
      answer: "Термин «кварцвинил» применяется для узнаваемости с 1990-х годов, хотя современные панели содержат карбонат кальция.",
      category: "technical"
    },
    {
      question: "Какие способы доставки доступны?",
      answer: "Доступна доставка курьером по Москве и области, а также транспортными компаниями по всей России. Подробности уточняйте у менеджера.",
      category: "purchase"
    },
    {
      question: "Можно ли вернуть товар если он не подошел?",
      answer: "Да, возврат возможен в течение 14 дней при сохранении товарного вида и упаковки. Стоимость обратной доставки оплачивает покупатель.",
      category: "purchase"
    }
  ];

  // Filter FAQs by categories if specified
  let filteredFAQs = showCategories 
    ? allFAQs.filter(faq => showCategories.includes(faq.category || 'general'))
    : allFAQs;

  // Limit number of items if specified
  if (maxItems) {
    filteredFAQs = filteredFAQs.slice(0, maxItems);
  }

  if (filteredFAQs.length === 0) {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        <div className="text-center py-8">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Вопросы не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
      
      <div className="space-y-3">
        {filteredFAQs.map((faq, index) => (
          <details 
            key={index} 
            className="bg-white border border-gray-200 rounded-lg group"
            open={openIndex === index}
          >
            <summary 
              className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between list-none"
              onClick={(e) => {
                e.preventDefault();
                setOpenIndex(openIndex === index ? null : index);
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#e90039] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle className="w-3 h-3 text-[#e90039]" />
                </div>
                <span className="text-sm font-medium text-gray-900 pr-4">
                  {faq.question}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${
                  openIndex === index ? "transform rotate-180" : ""
                }`}
              />
            </summary>
            
            {openIndex === index && (
              <div className="px-4 pb-4">
                <div className="pl-9">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )}
          </details>
        ))}
      </div>
      
      {maxItems && allFAQs.length > maxItems && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600">
            Показано {filteredFAQs.length} из {allFAQs.length} вопросов.{' '}
            <a href="/faq" className="text-[#e90039] hover:text-[#c8002f] font-medium">
              Посмотреть все вопросы
            </a>
          </p>
        </div>
      )}
    </div>
  );
}