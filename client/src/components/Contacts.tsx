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
    <section id="contacts" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-primary text-center mb-16">КОНТАКТЫ</h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-6">Свяжитесь с нами</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="text-accent mr-4 w-5 h-5" />
                  <span className="text-lg font-semibold text-primary">8 800 555-77-73</span>
                </div>
                
                <div className="flex items-center">
                  <Mail className="text-accent mr-4 w-5 h-5" />
                  <span className="text-secondary">info@alta-slab.ru</span>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="text-accent mr-4 mt-1 w-5 h-5" />
                  <span className="text-secondary">Россия, производство АЛЬТА-ПРОФИЛЬ</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-primary mb-6">Оставить заявку</h3>
              
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
