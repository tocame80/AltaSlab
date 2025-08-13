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
    <section id="installation" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-primary text-center mb-16">МОНТАЖ</h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
            <h3 className="text-2xl font-bold text-primary mb-6">Краткая инструкция</h3>
            <p className="text-secondary mb-6">
              SeamlessLock + клей АЛЬТА СТИК. Следуйте допускам, используйте ровное основание, соблюдайте зазоры и рекомендации производителя.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="w-16 h-16 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent font-bold text-xl">{step.number}</span>
                  </div>
                  <h4 className="font-bold text-primary mb-2">{step.title}</h4>
                  <p className="text-secondary text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
