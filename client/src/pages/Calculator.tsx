import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function Calculator() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [margin, setMargin] = useState('5');
  const [result, setResult] = useState<{
    area: number;
    areaWithMargin: number;
    packages: number;
    cost: number;
  } | null>(null);

  const calculateMaterial = () => {
    const lengthNum = parseFloat(length);
    const widthNum = parseFloat(width);
    const marginNum = parseFloat(margin);

    if (!lengthNum || !widthNum || lengthNum <= 0 || widthNum <= 0) {
      return;
    }

    const area = lengthNum * widthNum;
    const areaWithMargin = area * (1 + marginNum / 100);
    
    // Примерные значения для расчета (можно настроить)
    const areaPerPackage = 1.44; // м² в упаковке
    const pricePerPackage = 4739; // цена за упаковку

    const packages = Math.ceil(areaWithMargin / areaPerPackage);
    const cost = packages * pricePerPackage;

    setResult({
      area: Math.round(area * 100) / 100,
      areaWithMargin: Math.round(areaWithMargin * 100) / 100,
      packages,
      cost
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
            Вернуться к каталогу
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Калькулятор материала</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Рассчитайте необходимое количество панелей и стоимость для вашего проекта
          </p>
        </div>

        {/* Calculator */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Параметры помещения</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Длина помещения (м)</label>
                    <input 
                      type="number" 
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent" 
                      placeholder="Введите длину"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ширина помещения (м)</label>
                    <input 
                      type="number" 
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent" 
                      placeholder="Введите ширину"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Запас материала (%)</label>
                    <select 
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                    >
                      <option value="5">5% - стандартный запас</option>
                      <option value="10">10% - с учетом подрезки</option>
                      <option value="15">15% - сложная геометрия</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={calculateMaterial}
                    className="w-full bg-[#E95D22] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#d54a1a] transition-colors"
                  >
                    Рассчитать
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Результат расчета</h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Площадь помещения:</span>
                    <span className="font-medium text-gray-900">
                      {result ? `${result.area} м²` : '-- м²'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">С учетом запаса:</span>
                    <span className="font-medium text-gray-900">
                      {result ? `${result.areaWithMargin} м²` : '-- м²'}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Количество упаковок:</span>
                      <span className="font-semibold text-gray-900">
                        {result ? `${result.packages} шт` : '-- шт'}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-600">Общая стоимость:</span>
                      <span className="font-bold text-[#E95D22] text-lg">
                        {result ? `${result.cost.toLocaleString('ru-RU')} ₽` : '-- ₽'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">i</span>
                </div>
                <div>
                  <div className="font-semibold text-blue-900 mb-2">Рекомендации:</div>
                  <div className="text-blue-800 text-sm space-y-1">
                    <div>• Для помещений сложной формы рекомендуем увеличить запас до 15%</div>
                    <div>• При диагональной укладке добавьте дополнительно 10% к общему количеству</div>
                    <div>• Окончательный расчет уточняйте с менеджером</div>
                    <div>• Расчет выполнен для стандартной упаковки 1.44 м²</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}