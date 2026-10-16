import type { Item } from '../types';
import ItemCard from './ItemCard';

// Prints pinned unevenly: alternate a hair of rotation and drop every second column a little.
export default function ItemGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-6 px-4 pt-3">
      {items.map((i, n) => (
        <div key={i.id} className={n % 2 === 0 ? 'rotate-[-0.7deg]' : 'mt-5 rotate-[0.8deg]'}>
          <ItemCard item={i} priority={n < 2} />
        </div>
      ))}
    </div>
  );
}
