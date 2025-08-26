import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package, Tag, Truck } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  collection: string;
  design: string;
  format: string;
  price: number;
  image: string;
  images?: string | string[];
  category: string;
  surface: string;
  color: string;
  barcode: string;
  gallery: string[];
  specifications: Record<string, string>;
  availability: {
    inStock: boolean;
    deliveryTime: string;
    quantity: number;
  };
}

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/catalog-products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.color.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCollection = selectedCollection === 'all' || product.collection === selectedCollection;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCollection && matchesCategory;
  });

  const collections = Array.from(new Set(products.map(p => p.collection))).filter(Boolean);
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E95D22]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-products"
            />
          </div>
          
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger data-testid="select-collection">
              <SelectValue placeholder="Коллекция" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все коллекции</SelectItem>
              {collections.map(collection => (
                <SelectItem key={collection} value={collection}>
                  {collection}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCollection('all');
              setSelectedCategory('all');
            }}
            variant="outline"
            data-testid="button-clear-filters"
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow" data-testid={`card-product-${product.id}`}>
            <CardHeader className="p-0">
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={(() => {
                    if (product.images) {
                      try {
                        const images = Array.isArray(product.images) ? product.images : JSON.parse(product.images);
                        return images.length > 0 ? images[0] : '/placeholder-product.jpg';
                      } catch {
                        return '/placeholder-product.jpg';
                      }
                    }
                    return product.image || '/placeholder-product.jpg';
                  })()}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  data-testid={`img-product-${product.id}`}
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-4 space-y-3">
              <div>
                <CardTitle className="text-sm font-medium line-clamp-2 h-10" data-testid={`text-product-name-${product.id}`}>
                  {product.name}
                </CardTitle>
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.collection && (
                    <Badge variant="secondary" className="text-xs" data-testid={`badge-collection-${product.id}`}>
                      {product.collection}
                    </Badge>
                  )}
                  {product.color && (
                    <Badge variant="outline" className="text-xs" data-testid={`badge-color-${product.id}`}>
                      {product.color}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                {product.format && (
                  <div className="flex items-center gap-2">
                    <Package size={14} />
                    <span data-testid={`text-format-${product.id}`}>{product.format}</span>
                  </div>
                )}
                
                {product.barcode && (
                  <div className="flex items-center gap-2">
                    <Tag size={14} />
                    <span className="font-mono text-xs" data-testid={`text-barcode-${product.id}`}>{product.barcode}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Truck size={14} />
                  <span className={product.availability.inStock ? 'text-green-600' : 'text-orange-600'} data-testid={`text-availability-${product.id}`}>
                    {product.availability.deliveryTime}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <div>
                  <div className="text-lg font-bold text-[#E95D22]" data-testid={`text-price-${product.id}`}>
                    {product.price.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-xs text-gray-500">за {product.surface}</div>
                </div>
                
                <Badge 
                  variant={product.availability.inStock ? "default" : "secondary"}
                  className={product.availability.inStock ? "bg-green-100 text-green-800" : ""}
                  data-testid={`badge-stock-${product.id}`}
                >
                  {product.availability.quantity > 0 ? `${product.availability.quantity} шт` : 'Под заказ'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Товары не найдены</h3>
          <p className="text-gray-500">Попробуйте изменить параметры поиска или фильтры</p>
        </div>
      )}
    </div>
  );
}