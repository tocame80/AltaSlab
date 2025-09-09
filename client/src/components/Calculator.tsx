import { useState } from 'react';
import { Link } from 'wouter';

// Panel size options
const PANEL_SIZES = [
  {
    id: '300x600',
    name: '300×600×2,4мм',
    areaPerPackage: 4.32,
    pricePerPackage: 4739,
    piecesPerPackage: 24
  },
  {
    id: '600x1200', 
    name: '600×1200×2,4мм',
    areaPerPackage: 5.04,
    pricePerPackage: 5529,
    piecesPerPackage: 7
  }
];

export default function Calculator() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [margin, setMargin] = useState('5');
  const [selectedPanelSize, setSelectedPanelSize] = useState('300x600');
  const [result, setResult] = useState<{
    area: number;
    areaWithMargin: number;
    packages: number;
    cost: number;
    panelSize: string;
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
    
    // Get selected panel size data
    const selectedPanel = PANEL_SIZES.find(p => p.id === selectedPanelSize);
    if (!selectedPanel) return;

    const packages = Math.ceil(areaWithMargin / selectedPanel.areaPerPackage);
    const cost = packages * selectedPanel.pricePerPackage;

    setResult({
      area: Math.round(area * 100) / 100,
      areaWithMargin: Math.round(areaWithMargin * 100) / 100,
      packages,
      cost,
      panelSize: selectedPanel.name
    });
  };

  return (
    <section id="calculator" className="py-12 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-[#2f378b] mb-3 lg:mb-4">
            Калькулятор материала
          </h2>
          <p className="text-sm lg:text-lg text-gray-600 max-w-3xl mx-auto">
            Рассчитайте необходимое количество панелей и стоимость для вашего проекта
          </p>
        </div>

        {/* Calculator */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm">
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-[#2f378b] mb-4 lg:mb-6">Параметры помещения</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Длина помещения (м)</label>
                    <input 
                      type="number" 
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e90039] focus:border-transparent" 
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e90039] focus:border-transparent" 
                      placeholder="Введите ширину"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Размер панели</label>
                    <select 
                      value={selectedPanelSize}
                      onChange={(e) => setSelectedPanelSize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
                    >
                      {PANEL_SIZES.map(panel => (
                        <option key={panel.id} value={panel.id}>
                          {panel.name} - {panel.areaPerPackage} м²/уп - {panel.pricePerPackage.toLocaleString()} ₽
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Запас материала (%)</label>
                    <select 
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
                    >
                      <option value="5">5% - стандартный запас</option>
                      <option value="10">10% - с учетом подрезки</option>
                      <option value="15">15% - сложная геометрия</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={calculateMaterial}
                    className="w-full bg-[#e90039] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#c8002f] transition-colors"
                  >
                    Рассчитать
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-[#2f378b] mb-4 lg:mb-6">Результат расчета</h3>
                <div className="bg-gray-50 rounded-lg p-4 lg:p-6 space-y-3 lg:space-y-4">
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
                  {result && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Размер панели:</span>
                      <span className="font-medium text-gray-900">
                        {result.panelSize}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Количество упаковок:</span>
                      <span className="font-semibold text-gray-900">
                        {result ? `${result.packages} шт` : '-- шт'}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-600">Общая стоимость:</span>
                      <span className="font-bold text-[#e90039] text-lg">
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
                    <div>• Панели 300×600 мм подходят для небольших и средних помещений</div>
                    <div>• Панели 600×1200 мм идеальны для больших пространств</div>
                    <div>• Окончательный расчет уточняйте с менеджером</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Link to full calculator */}
            <div className="text-center mt-8">
              <Link href="/calculator">
                <button className="bg-[#e90039] text-white px-8 py-3 rounded-lg hover:bg-[#c8002f] transition-colors">
                  Открыть полный калькулятор
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}