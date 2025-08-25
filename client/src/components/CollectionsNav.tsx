import { Collection } from '@/types';
import { useStickyNav } from '@/hooks/useStickyNav';

interface CollectionsNavProps {
  activeCollection: Collection;
  onCollectionChange: (collection: Collection) => void;
  favoriteCount?: number;
}

export default function CollectionsNav({ activeCollection, onCollectionChange, favoriteCount = 0 }: CollectionsNavProps) {
  const isSticky = useStickyNav();
  const collections = [
    { key: 'all' as Collection, label: 'ВСЁ', mobileLabel: 'ВСЁ' },
    { key: 'concrete' as Collection, label: 'МАГИЯ БЕТОНА', mobileLabel: 'БЕТОН' },
    { key: 'fabric' as Collection, label: 'ТКАНЕВАЯ РОСКОШЬ', mobileLabel: 'ТКАНЬ' },
    { key: 'matte' as Collection, label: 'МАТОВАЯ ЭСТЕТИКА', mobileLabel: 'МАТОВАЯ' },
    { key: 'marble' as Collection, label: 'МРАМОРНАЯ ФЕЕРИЯ', mobileLabel: 'МРАМОР' },
    { key: 'accessories' as Collection, label: 'КОМПЛЕКТУЮЩИЕ', mobileLabel: 'КОМПЛ.' },
    { key: 'favorites' as Collection, label: 'ИЗБРАННОЕ', mobileLabel: 'ИЗБР.' },
  ];

  return (
    <div className={`bg-white py-4 lg:py-6 border-t ${isSticky ? 'sticky top-0 z-50 shadow-sm' : 'relative'}`}>
      <div className="container mx-auto">
        <div className="px-4 lg:px-6 overflow-x-auto scrollbar-hide">
          <nav className="collections-nav">
            {collections.map((collection) => (
              <button
                key={collection.key}
                onClick={() => onCollectionChange(collection.key)}
                className={`collection-link whitespace-nowrap ${
                  activeCollection === collection.key ? 'active' : ''
                }`}
                data-testid={`button-collection-${collection.key}`}
              >
                {/* Show full label on desktop, short on mobile */}
                <span className="hidden lg:inline">{collection.label}</span>
                <span className="lg:hidden">{collection.mobileLabel}</span>
                {collection.key === 'favorites' && favoriteCount > 0 && (
                  <span className="ml-1 lg:ml-2 bg-red-500 text-white text-xs px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                    {favoriteCount}
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
