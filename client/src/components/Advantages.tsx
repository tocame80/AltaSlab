import { Droplets, Leaf, Shield, Sun, VolumeX, Wrench } from 'lucide-react';

export default function Advantages() {
  const advantages = [
    {
      icon: Droplets,
      title: 'Влагостойкость',
      description: '100% влагостойкий материал, подходит для влажных помещений'
    },
    {
      icon: Leaf,
      title: 'Экологичность',
      description: '0% формальдегидов, безопасно для здоровья'
    },
    {
      icon: Shield,
      title: 'Антибактериальное покрытие',
      description: 'Защищает от бактерий и микроорганизмов'
    },
    {
      icon: Sun,
      title: 'UV защита',
      description: 'Стойкость к ультрафиолетовому излучению'
    },
    {
      icon: VolumeX,
      title: 'Звукоизоляция',
      description: 'Отличные звукоизоляционные свойства'
    },
    {
      icon: Wrench,
      title: 'Простой монтаж',
      description: 'SeamlessLock + клей АЛЬТА СТИК'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-primary text-center mb-16">ПРЕИМУЩЕСТВА</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="text-accent text-2xl w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-4">{advantage.title}</h3>
                <p className="text-secondary">{advantage.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
