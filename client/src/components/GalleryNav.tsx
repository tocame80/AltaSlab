import { useStickyNav } from '@/hooks/useStickyNav';

interface GalleryNavProps {
  activeApplication: string;
  onApplicationChange: (application: string) => void;
  projectCount?: number;
}

export default function GalleryNav({ activeApplication, onApplicationChange, projectCount = 0 }: GalleryNavProps) {
  const isSticky = useStickyNav();
  const applications = [
    { key: '', label: 'ВСЕ ПРОЕКТЫ', mobileLabel: 'ВСЕ' },
    { key: 'interior', label: 'ИНТЕРЬЕР', mobileLabel: 'ИНТЕРЬЕР' },
    { key: 'exterior', label: 'ЭКСТЕРЬЕР', mobileLabel: 'ЭКСТЕРЬЕР' },
    { key: 'commercial', label: 'КОММЕРЧЕСКИЕ', mobileLabel: 'КОММЕРЦ.' },
    { key: 'residential', label: 'ЖИЛЫЕ', mobileLabel: 'ЖИЛЫЕ' },
  ];

  return (
    <div className={`bg-white py-4 lg:py-6 border-t ${isSticky ? 'sticky top-0 z-50 shadow-sm' : 'relative'}`}>
      <div className="container mx-auto">
        <div className="px-4 lg:px-6 overflow-x-auto scrollbar-hide">
          <nav className="collections-nav">
            {applications.map((application) => (
              <button
                key={application.key}
                onClick={() => onApplicationChange(application.key)}
                className={`collection-link whitespace-nowrap ${
                  activeApplication === application.key ? 'active' : ''
                }`}
                data-testid={`button-application-${application.key || 'all'}`}
              >
                {/* Show full label on desktop, short on mobile */}
                <span className="hidden lg:inline">{application.label}</span>
                <span className="lg:hidden">{application.mobileLabel}</span>
                {application.key === '' && projectCount > 0 && (
                  <span className="ml-1 lg:ml-2 bg-[#e90039] text-white text-xs px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                    {projectCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}