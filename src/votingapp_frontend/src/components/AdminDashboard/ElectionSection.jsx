import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

export default function ElectionSection({
  title,
  columns,
  data = [],
  className = '',
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering logic
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    const q = searchQuery.toLowerCase();

    return data.filter(row =>
      Object.values(row)
        .filter(val => typeof val === 'string')
        .some(val => val.toLowerCase().includes(q))
    );
  }, [data, searchQuery]);

  const allHeaders = [...columns];

  return (
    <div
      className={`bg-democracy-card border border-democracy-gray-400 rounded-[15px] p-4 lg:p-11 ${className}`}
    >
      {title && (
        <h2 className="text-2xl lg:text-[35px] font-semibold text-black mb-6">
          {title}
        </h2>
      )}

      {/* Search */}
      <div className="relative w-full max-w-[400px] mb-8">
        <div className="flex items-center gap-3 px-4 py-2 border border-democracy-gray-300 rounded-[15px]">
          <Search className="w-6 h-6 text-democracy-gray-300" />
          <input
            type="text"
            placeholder="Search…"
            className="flex-1 bg-transparent outline-none text-democracy-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-12 gap-4 border-b-2 border-democracy-teal pb-2 mb-4">
        {allHeaders.map((hdr, i) => {
          let spanClass = '';
          switch (i) {
            case 0: spanClass = 'col-span-1'; break;  // No
            case 1: spanClass = 'col-span-4'; break;  // Title / Name
            case 2: spanClass = 'col-span-4'; break;  // Category / Partai
            case 3: spanClass = 'col-span-1'; break;  // Status / Election
            case 4: spanClass = 'col-span-2'; break;  // Actions
            default: spanClass = 'col-span-2';
          }
          return (
            <div key={hdr} className={`${spanClass} font-semibold text-democracy-teal`}>
              {hdr}
            </div>
          );
        })}
      </div>

      {/* Table Rows */}
      {filteredData.length === 0 ? (
        <div className="min-h-[100px] flex items-center justify-center text-democracy-gray">
          No results found
        </div>
      ) : (
        <div className="space-y-2">
          {filteredData.map((row, idx) => (
  <div
    key={idx}
    className="grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-100"
  >
    <div className="col-span-1 text-democracy-dark">{idx + 1}</div>
    <div className="col-span-4 text-democracy-dark">{row.name}</div>
    <div className="col-span-4 text-democracy-dark">{row.party}</div>
    <div className="col-span-1 text-democracy-dark">{row.district}</div>
    <div className="col-span-2 flex gap-2 justify-center">
      {row.actions}
    </div>
  </div>
))}

        </div>
      )}
    </div>
  );
}
