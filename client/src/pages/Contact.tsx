import { ArrowLeft, Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';
import Header from '@/components/Header';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика отправки формы
    console.log('Form submitted:', formData);
    alert('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Обратная связь</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Свяжитесь с нами для получения консультации, оформления заказа или решения любых вопросов
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Отправить сообщение</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
                      placeholder="Ваше имя"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e90039] focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тема обращения *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent"
                  >
                    <option value="">Выберите тему</option>
                    <option value="consultation">Консультация по продукции</option>
                    <option value="order">Оформление заказа</option>
                    <option value="delivery">Вопросы по доставке</option>
                    <option value="installation">Помощь с монтажом</option>
                    <option value="warranty">Гарантийные вопросы</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Сообщение *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E95D22] focus:border-transparent resize-vertical"
                    placeholder="Опишите ваш вопрос или требования..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#e90039] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#c8002f] transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Отправить сообщение
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Время ответа:</strong> Мы отвечаем на сообщения в течение 1-2 часов в рабочее время
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              
              {/* Contact Details */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Контактная информация</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Phone className="text-[#e90039] w-6 h-6 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">Телефон</div>
                      <div className="text-gray-600 mt-1">
                        <div className="text-lg font-semibold text-[#e90039]">8 (800) 555-35-35</div>
                        <div className="text-sm">Бесплатный звонок по России</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="text-[#e90039] w-6 h-6 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">Email</div>
                      <div className="text-gray-600 mt-1">
                        <div>info@altaslab.ru</div>
                        <div>sales@altaslab.ru</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="text-[#e90039] w-6 h-6 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">Адрес офиса</div>
                      <div className="text-gray-600 mt-1">
                        <div>г. Москва, ул. Промышленная, д. 15</div>
                        <div>БЦ "Индустрия", офис 205</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="text-[#e90039] w-6 h-6 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">Время работы</div>
                      <div className="text-gray-600 mt-1">
                        <div>Пн-Пт: 9:00 - 18:00</div>
                        <div>Сб-Вс: 10:00 - 16:00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Быстрые действия</h3>
                <div className="space-y-3">
                  <Link 
                    href="/calculator" 
                    className="block w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-colors"
                  >
                    <div className="font-semibold text-gray-900">Рассчитать материал</div>
                    <div className="text-sm text-gray-600">Калькулятор расхода панелей</div>
                  </Link>
                  
                  <Link 
                    href="/certificates" 
                    className="block w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-colors"
                  >
                    <div className="font-semibold text-gray-900">Скачать сертификаты</div>
                    <div className="text-sm text-gray-600">Документы качества</div>
                  </Link>
                  
                  <Link 
                    href="/faq" 
                    className="block w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-colors"
                  >
                    <div className="font-semibold text-gray-900">Часто задаваемые вопросы</div>
                    <div className="text-sm text-gray-600">Ответы на популярные вопросы</div>
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Emergency Contact - Full Width */}
          <div className="mt-12">
            <div className="bg-[#e90039] rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Срочные вопросы?</h3>
              <p className="mb-6 text-lg">Если у вас срочный вопрос по уже размещенному заказу или технической поддержке:</p>
              <div className="text-2xl font-bold mb-2">+7 (495) 123-45-67</div>
              <div className="text-base opacity-90">Круглосуточная техподдержка</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}