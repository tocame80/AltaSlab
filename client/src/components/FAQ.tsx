import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'wouter';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Что такое SPC панели и чем они отличаются от других материалов?',
      answer: 'SPC (Stone Plastic Composite) - это композитный материал, состоящий из каменной муки, PVC и стабилизаторов. Он обладает высокой прочностью, влагостойкостью и долговечностью, превосходя по характеристикам обычные пластиковые панели.'
    },
    {
      question: 'Можно ли устанавливать панели во влажных помещениях?',
      answer: 'Да, SPC панели АЛЬТА СЛЭБ полностью влагостойки и идеально подходят для ванных комнат, кухонь, саун и других влажных помещений. Материал не деформируется и не разбухает от воздействия влаги.'
    },
    {
      question: 'Как рассчитать необходимое количество материала?',
      answer: 'Используйте наш онлайн-калькулятор на сайте. Введите размеры помещения, и система автоматически рассчитает количество панелей с учетом отходов. Рекомендуем добавить 10% к расчетному количеству.'
    },
    {
      question: 'Какой срок службы у панелей АЛЬТА СЛЭБ?',
      answer: 'При правильном монтаже и эксплуатации срок службы панелей составляет более 25 лет. Мы предоставляем гарантию 10 лет на все коллекции.'
    },
    {
      question: 'Можно ли монтировать панели самостоятельно?',
      answer: 'Да, монтаж довольно простой и может выполняться самостоятельно при наличии базовых навыков. Мы предоставляем подробные видеоинструкции и рекомендации по установке.'
    }
  ];

  return (
    <section id="faq" className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-[#2f378b] mb-3 lg:mb-4">
            Часто задаваемые вопросы
          </h2>
          <p className="text-sm lg:text-lg text-gray-600 max-w-3xl mx-auto">
            Ответы на самые популярные вопросы о наших SPC панелях, 
            их характеристиках и особенностях монтажа.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-3 lg:space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="w-full text-left p-4 lg:p-6 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-semibold text-[#2f378b] pr-3 lg:pr-4 text-sm lg:text-base">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                    <p className="text-gray-600 leading-relaxed text-sm lg:text-base">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/faq">
              <button className="bg-[#e90039] text-white px-8 py-3 rounded-lg hover:bg-[#c8002f] transition-colors">
                Посмотреть все вопросы
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}