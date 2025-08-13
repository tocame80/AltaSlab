export default function Applications() {
  const applications = [
    {
      title: 'Жилые помещения',
      description: 'Квартиры, дома, коттеджи',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
    },
    {
      title: 'Офисы',
      description: 'Деловые центры, коворкинги',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
    },
    {
      title: 'Медучреждения',
      description: 'Клиники, поликлиники',
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
    },
    {
      title: 'Гостиницы',
      description: 'Отели, хостелы, апартаменты',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-primary text-center mb-16">ПРИМЕНЕНИЕ</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {applications.map((application, index) => (
            <div key={index} className="text-center">
              <img 
                src={application.image} 
                alt={application.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-bold text-primary mb-2">{application.title}</h3>
              <p className="text-secondary text-sm">{application.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
