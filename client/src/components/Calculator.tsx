import { useState } from 'react';
import { CalculationResult } from '@/types';
import { ChevronDown } from 'lucide-react';

export default function Calculator() {
  const [roomArea, setRoomArea] = useState<number>(0);
  const [panelFormat, setPanelFormat] = useState<number>(0.18);
  const [wastePercentage, setWastePercentage] = useState<number>(5);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateMaterials = () => {
    if (!roomArea || roomArea <= 0) {
      alert('Пожалуйста, введите корректную площадь помещения');
      return;
    }

    const areaWithWaste = roomArea * (1 + wastePercentage / 100);
    const panelsNeeded = Math.ceil(areaWithWaste / panelFormat);

    let panelsPerPackage, areaPerPackage;
    if (panelFormat === 0.18) {
      panelsPerPackage = 24;
      areaPerPackage = 4.32;
    } else {
      panelsPerPackage = 7;
      areaPerPackage = 5.04;
    }

    const packagesNeeded = Math.ceil(panelsNeeded / panelsPerPackage);
    const adhesiveTubes = Math.ceil(areaWithWaste / 10);

    setResult({
      areaWithWaste,
      panelsNeeded,
      packagesNeeded,
      totalArea: packagesNeeded * areaPerPackage,
      adhesiveTubes
    });
  };

  return (
    <section id="calculator" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-primary text-center mb-16">КАЛЬКУЛЯТОР МАТЕРИАЛОВ</h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-primary mb-6">Параметры помещения</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-secondary mb-2">Площадь помещения (м²)</label>
                    <input
                      type="number"
                      value={roomArea}
                      onChange={(e) => setRoomArea(parseFloat(e.target.value))}
                      className="w-full border border-muted rounded-lg px-4 py-2"
                      placeholder="Введите площадь"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-secondary mb-2">Формат панелей</label>
                    <div className="relative">
                      <select
                        value={panelFormat}
                        onChange={(e) => setPanelFormat(parseFloat(e.target.value))}
                        className="w-full border border-muted rounded-lg px-4 py-2 appearance-none pr-8"
                      >
                        <option value={0.18}>300×600×2.4мм (0.18м²/шт)</option>
                        <option value={0.72}>600×1200×2.4мм (0.72м²/шт)</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-secondary mb-2">Запас на подрезку (%)</label>
                    <div className="relative">
                      <select
                        value={wastePercentage}
                        onChange={(e) => setWastePercentage(parseInt(e.target.value))}
                        className="w-full border border-muted rounded-lg px-4 py-2 appearance-none pr-8"
                      >
                        <option value={5}>5%</option>
                        <option value={7}>7%</option>
                        <option value={10}>10%</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                    </div>
                  </div>
                  
                  <button
                    onClick={calculateMaterials}
                    className="w-full btn-primary py-3 rounded-lg font-medium"
                  >
                    Рассчитать
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-primary mb-6">Результат расчета</h3>
                
                <div className="space-y-4 text-secondary">
                  {result ? (
                    <div className="space-y-3">
                      <p><strong>Площадь с запасом:</strong> {result.areaWithWaste.toFixed(2)} м²</p>
                      <p><strong>Необходимо панелей:</strong> {result.panelsNeeded} шт</p>
                      <p><strong>Необходимо упаковок:</strong> {result.packagesNeeded} уп</p>
                      <p><strong>Всего материала:</strong> {result.totalArea.toFixed(2)} м²</p>
                      <p><strong>Клей АЛЬТА СТИК:</strong> {result.adhesiveTubes} туб</p>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-accent font-semibold">Рекомендуется также приобрести:</p>
                        <ul className="list-disc list-inside text-sm mt-2">
                          <li>Торцевой профиль</li>
                          <li>Соединительный профиль</li>
                          <li>Угловой профиль (при необходимости)</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p>Введите параметры для расчета</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
