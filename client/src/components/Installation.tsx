export default function Installation() {
  const steps = [
    {
      number: 1,
      title: 'Подготовка основания',
      description: 'Очистите и выровняйте поверхность'
    },
    {
      number: 2,
      title: 'Нанесение клея',
      description: 'Равномерно распределите АЛЬТА СТИК'
    },
    {
      number: 3,
      title: 'Установка панелей',
      description: 'Соедините замки SeamlessLock'
    }
  ];

  return (
    <section id="installation" className="py-12 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6">
        <h2 className="text-2xl lg:text-4xl font-bold text-[#2f378b] text-center mb-8 lg:mb-16">МОНТАЖ</h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 lg:p-8 rounded-lg shadow-sm mb-6 lg:mb-8">
            <h3 className="text-xl lg:text-2xl font-bold text-[#2f378b] mb-4 lg:mb-6 text-center">Краткая инструкция</h3>
            <p className="text-secondary mb-4 lg:mb-6 text-sm lg:text-base">
              SeamlessLock + клей АЛЬТА СТИК. Следуйте допускам, используйте ровное основание, соблюдайте зазоры и рекомендации производителя.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                    <span className="text-accent font-bold text-lg lg:text-xl">{step.number}</span>
                  </div>
                  <h4 className="font-bold text-[#2f378b] mb-2 text-sm lg:text-base">{step.title}</h4>
                  <p className="text-secondary text-xs lg:text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
