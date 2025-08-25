import { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Contacts() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    comment: '',
    consent: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      alert('Необходимо согласие на обработку персональных данных');
      return;
    }
    
    alert('Спасибо за заявку! Мы свяжемся с вами в ближайшее время.');
    
    setFormData({
      name: '',
      phone: '',
      comment: '',
      consent: false
    });
  };

  return (
    <section id="contacts" className="py-12 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6">
        <h2 className="text-2xl lg:text-4xl font-bold text-[#2f378b] text-center mb-8 lg:mb-16">КОНТАКТЫ</h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-[#2f378b] mb-4 lg:mb-6">Свяжитесь с нами</h3>
              
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center">
                  <Phone className="text-accent mr-3 lg:mr-4 w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-base lg:text-lg font-semibold text-[#2f378b]">8 800 555-77-73</span>
                </div>
                
                <div className="flex items-center">
                  <Mail className="text-accent mr-3 lg:mr-4 w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-secondary text-sm lg:text-base">info@alta-slab.ru</span>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="text-accent mr-3 lg:mr-4 mt-1 w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-secondary text-sm lg:text-base">Россия, производство АЛЬТА-ПРОФИЛЬ</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-[#2f378b] mb-4 lg:mb-6">Оставить заявку</h3>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full border border-muted rounded-lg px-4 py-2"
                    placeholder="Ваше имя"
                  />
                </div>
                
                <div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="w-full border border-muted rounded-lg px-4 py-2"
                    placeholder="Телефон"
                  />
                </div>
                
                <div>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full border border-muted rounded-lg px-4 py-2 h-24"
                    placeholder="Комментарий"
                  />
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="dataConsent"
                    checked={formData.consent}
                    onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                    required
                    className="mr-2 mt-1"
                  />
                  <label htmlFor="dataConsent" className="text-sm text-secondary">
                    Согласие на обработку персональных данных
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="w-full btn-primary py-3 rounded-lg font-medium"
                >
                  Отправить заявку
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
