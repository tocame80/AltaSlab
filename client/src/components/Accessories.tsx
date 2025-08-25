import { accessories } from '@/data/accessories';

export default function Accessories() {
  return (
    <section id="accessories" className="py-12 lg:py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-primary text-center mb-8 lg:mb-16">КОМПЛЕКТУЮЩИЕ</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="bg-white border border-muted rounded-lg p-4 lg:p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-3 lg:mb-4">
                <img 
                  src={accessory.image} 
                  alt={accessory.name}
                  className="w-full h-24 lg:h-32 object-cover rounded"
                />
              </div>
              <h3 className="text-sm lg:text-lg font-bold text-primary mb-1 lg:mb-2">{accessory.name}</h3>
              <p className="text-secondary text-xs lg:text-sm mb-1 lg:mb-2">{accessory.description}</p>
              {accessory.colors && (
                <p className="text-secondary text-xs lg:text-sm mb-2 lg:mb-4">
                  {accessory.colors.join('/')}
                </p>
              )}
              <p className="text-accent font-bold text-sm lg:text-base">{accessory.price}₽/{accessory.unit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
