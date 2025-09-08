import { Droplets, Leaf, Shield, Sun, VolumeX, Wrench } from "lucide-react";

export default function Advantages() {
  const advantages = [
    {
      icon: Droplets,
      title: "ВОДОНЕПРОНИЦАЕМОСТЬ",
      description: "100% влагостойкий материал, подходит для влажных помещений",
    },
    {
      icon: Leaf,
      title: "ИЗНОСОСТОЙКОСТЬ",
      description: "Ударопрочный, устойчив к вмятинам и истиранию",
    },
    {
      icon: Shield,
      title: "ПРОСТОЙ МОНТАЖ",
      description:
        "Резка и установка без пыли. Замковое соединение «SeamlessLock».",
    },
    {
      icon: Sun,
      title: "UV ЗАЩИТА",
      description: "Стойкость к ультрафиолетовому излучению",
    },
    {
      icon: VolumeX,
      title: "ПРОСТОТА УХОДА",
      description: "Для ухода подходят любые средства без абразива.",
    },
    {
      icon: Wrench,
      title: "ЭКОЛОГИЧНОСТЬ",
      description:
        "Изготовлен из безопасных материалов, не содержащих вредных веществ",
    },
  ];

  return (
    <section id="advantages" className="py-12 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6">
        <h2 className="text-2xl lg:text-4xl font-bold text-[#2f378b] text-center mb-8 lg:mb-16">
          ПРЕИМУЩЕСТВА
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <div
                key={index}
                className="bg-white p-4 lg:p-8 rounded-lg shadow-sm text-center"
              >
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-6">
                  <Icon className="text-accent text-lg lg:text-2xl w-5 h-5 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-sm lg:text-xl font-bold text-[#2f378b] mb-2 lg:mb-4">
                  {advantage.title}
                </h3>
                <p className="text-secondary text-xs lg:text-base leading-tight">
                  {advantage.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
