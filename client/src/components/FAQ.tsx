import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
  ];

  return (
    <section id="faq" className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-[#2f378b] mb-3 lg:mb-4">
            Часто задаваемые вопросы
          </h2>
          <p className="text-sm lg:text-lg text-gray-600 max-w-3xl mx-auto">
            Ответы на самые популярные вопросы о наших SPC панелях, их
            характеристиках и особенностях монтажа.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-3 lg:space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  className="w-full text-left p-4 lg:p-6 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                >
                  <span className="font-semibold text-[#2f378b] pr-3 lg:pr-4 text-sm lg:text-base">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openIndex === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                    <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                      {faq.answer}
                    </p>
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
