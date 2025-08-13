import { Collection } from '@/types';

interface CollectionsNavProps {
  activeCollection: Collection;
  onCollectionChange: (collection: Collection) => void;
  favoriteCount?: number;
}

export default function CollectionsNav({ activeCollection, onCollectionChange, favoriteCount = 0 }: CollectionsNavProps) {
  const collections = [
    { key: 'all' as Collection, label: 'ВСЁ' },
    { key: 'concrete' as Collection, label: 'МАГИЯ БЕТОНА' },
    { key: 'fabric' as Collection, label: 'ТКАНЕВАЯ РОСКОШЬ' },
    { key: 'matte' as Collection, label: 'МАТОВАЯ ЭСТЕТИКА' },
    { key: 'marble' as Collection, label: 'МРАМОРНАЯ ФЕЕРИЯ' },
    { key: 'accessories' as Collection, label: 'КОМПЛЕКТУЮЩИЕ' },
    { key: 'favorites' as Collection, label: 'ИЗБРАННОЕ' },
  ];

  return (
    <div className="bg-white py-6 border-t sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-6">
        <nav className="collections-nav">
          {collections.map((collection) => (
            <button
              key={collection.key}
              onClick={() => onCollectionChange(collection.key)}
              className={`collection-link ${
                activeCollection === collection.key ? 'active' : ''
              }`}
            >
              {collection.label}
              {collection.key === 'favorites' && favoriteCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {favoriteCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
