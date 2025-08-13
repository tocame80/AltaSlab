import { Collection } from '@/types';

interface CollectionsNavProps {
  activeCollection: Collection;
  onCollectionChange: (collection: Collection) => void;
}

export default function CollectionsNav({ activeCollection, onCollectionChange }: CollectionsNavProps) {
  const collections = [
    { key: 'all' as Collection, label: 'ВСЁ' },
    { key: 'concrete' as Collection, label: 'МАГИЯ БЕТОНА' },
    { key: 'fabric' as Collection, label: 'ТКАНЕВАЯ РОСКОШЬ' },
    { key: 'matte' as Collection, label: 'МАТОВАЯ ЭСТЕТИКА' },
    { key: 'marble' as Collection, label: 'МРАМОРНАЯ ФЕЕРИЯ' },
    { key: 'favorites' as Collection, label: 'ИЗБРАННОЕ' },
  ];

  return (
    <div className="bg-white py-6 border-t">
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
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
