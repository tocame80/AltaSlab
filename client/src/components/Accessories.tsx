import { accessories } from '@/data/accessories';

export default function Accessories() {
  return (
    <section id="accessories" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-primary text-center mb-16">АКСЕССУАРЫ</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="bg-white border border-muted rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <img 
                  src={accessory.image} 
                  alt={accessory.name}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">{accessory.name}</h3>
              <p className="text-secondary text-sm mb-2">{accessory.description}</p>
              {accessory.colors && (
                <p className="text-secondary text-sm mb-4">
                  {accessory.colors.join('/')}
                </p>
              )}
              <p className="text-accent font-bold">{accessory.price}₽/{accessory.unit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
