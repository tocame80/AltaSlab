import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/Header';

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Часто задаваемые вопросы</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ответы на популярные вопросы о панелях АЛЬТА СЛЭБ, монтаже и эксплуатации
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Technical Questions */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Технические вопросы</h2>
            <div className="space-y-4">
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>Можно ли укладывать панели на неровную поверхность?</span>
                  <span className="text-gray-400 text-xl">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                  Поверхность должна быть ровной с перепадами не более 2мм на 1м. При необходимости выровняйте основание шпаклевкой или грунтовкой. Неровная поверхность может привести к деформации панелей и нарушению герметичности стыков.
                </div>
              </details>
              
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>Какой клей лучше использовать для монтажа?</span>
                  <span className="text-gray-400 text-xl">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                  Рекомендуем использовать специальный клей для SPC панелей из нашего каталога. Он обеспечивает надежное сцепление и долговечность крепления. Обычные строительные клеи могут не обеспечить необходимую адгезию.
                </div>
              </details>
              
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>Можно ли использовать панели во влажных помещениях?</span>
                  <span className="text-gray-400 text-xl">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                  Да, SPC панели обладают высокой влагостойкостью и подходят для ванных комнат, кухонь и других влажных помещений. Материал не деформируется от воздействия влаги и легко очищается.
                </div>
              </details>

              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>Какая максимальная нагрузка на панели?</span>
                  <span className="text-gray-400 text-xl">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                  SPC панели выдерживают значительные механические нагрузки благодаря каменно-полимерной основе. Они устойчивы к ударам, царапинам и имеют высокий класс износостойкости.
                </div>
              </details>
            </div>
          </div>

          {/* Care and Maintenance */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Уход и эксплуатация</h2>
            <div className="space-y-4">
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>Как правильно ухаживать за панелями?</span>
                  <span className="text-gray-400 text-xl">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                  Для ухода достаточно влажной уборки обычными моющими средствами. Избегайте абразивных средств и растворителей. Регулярно протирайте поверхность мягкой тканью или губкой.
                </div>
              </details>
              
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>Можно ли устанавливать панели в детской комнате?</span>
                  <span className="text-gray-400 text-xl">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                  Да, панели абсолютно безопасны для детей. Они не выделяют вредных веществ и имеют экологические сертификаты. Поверхность легко очищается от детских рисунков и загрязнений.
                </div>
              </details>

              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>Как убрать царапины с поверхности?</span>
                  <span className="text-gray-400 text-xl">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                  Мелкие царапины можно убрать специальной полиролью для SPC покрытий. Глубокие повреждения требуют замены отдельной панели. Рекомендуем использовать защитные накладки под мебель.
                </div>
              </details>
            </div>
          </div>

          {/* Delivery and Payment */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Доставка и оплата</h2>
            <div className="space-y-4">
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>Какие способы доставки доступны?</span>
                  <span className="text-gray-400 text-xl">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                  Доступна доставка курьером по Москве и области, а также транспортными компаниями по всей России. Стоимость доставки рассчитывается индивидуально в зависимости от объема заказа и удаленности.
                </div>
              </details>
              
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>Можно ли вернуть товар если он не подошел?</span>
                  <span className="text-gray-400 text-xl">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                  Да, возврат возможен в течение 14 дней при сохранении товарного вида и упаковки. Стоимость обратной доставки оплачивает покупатель. Товар должен быть неиспользованным.
                </div>
              </details>

              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>Какие способы оплаты принимаются?</span>
                  <span className="text-gray-400 text-xl">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                  Принимаем оплату наличными при получении, банковскими картами, безналичным переводом для юридических лиц. Возможна рассрочка и кредитование через банки-партнеры.
                </div>
              </details>
            </div>
          </div>

          {/* Installation Questions */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Вопросы по монтажу</h2>
            <div className="space-y-4">
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>Можно ли монтировать панели самостоятельно?</span>
                  <span className="text-gray-400 text-xl">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                  Да, панели разработаны для простого монтажа. В комплекте идет подробная инструкция. Однако для гарантийных обязательств рекомендуем привлекать сертифицированных специалистов.
                </div>
              </details>
              
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                  <span>Сколько времени занимает монтаж?</span>
                  <span className="text-gray-400 text-xl">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                  Время монтажа зависит от площади помещения и сложности геометрии. В среднем один специалист монтирует 15-20 м² в день. Подготовка поверхности может занять дополнительное время.
                </div>
              </details>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-[#E95D22] rounded-xl p-8 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Не нашли ответ на ваш вопрос?</h3>
              <p className="text-lg mb-6">Обратитесь к нашим специалистам за персональной консультацией</p>
              <div className="space-y-2">
                <div className="text-lg font-semibold">8 (800) 555-35-35</div>
                <div>support@altaslab.ru</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}