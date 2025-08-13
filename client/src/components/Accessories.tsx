import { products } from '@/data/products';

export default function Accessories() {
  // Filter products to show only accessories
  const accessoryProducts = products.filter(product => product.category === 'accessories');

  return (
    <section id="accessories" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-primary text-center mb-16">КОМПЛЕКТУЮЩИЕ</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accessoryProducts.map((product) => (
            <div key={product.id} className="bg-white border border-muted rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <img 
                  src={product.image} 
                  alt={product.design}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">{product.design}</h3>
              <p className="text-secondary text-sm mb-2">{product.name}</p>
              <p className="text-secondary text-sm mb-2">Артикул: {product.barcode}</p>
              {product.color && product.color !== '-' && (
                <p className="text-secondary text-sm mb-4">
                  Цвет: {product.color}
                </p>
              )}
              <div className="text-accent font-bold">
                {product.price}₽/{product.surface}
              </div>
              {product.piecesPerPackage > 0 && (
                <p className="text-muted text-xs mt-1">
                  Упаковка: {product.piecesPerPackage} шт
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
