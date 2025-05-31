import { useState } from 'react';

interface SkillsInterestsSectionProps {
  title: string;
  items: string[];
  placeholder: string;
  colorScheme: 'blue' | 'green';
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
}

export default function SkillsInterestsSection({
  title,
  items,
  placeholder,
  colorScheme,
  onAdd,
  onRemove
}: SkillsInterestsSectionProps) {
  const [newItem, setNewItem] = useState('');
  
  const handleAdd = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onAdd(newItem.trim());
      setNewItem('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };
  
  const colors = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      hover: 'hover:text-blue-800',
      base: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      hover: 'hover:text-green-800',
      base: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700'
    }
  };
  
  const color = colors[colorScheme];
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title}
      </label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleAdd}
          className={`px-4 py-2 text-white rounded-md ${color.button}`}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`px-3 py-1 ${color.bg} ${color.text} rounded-full text-sm flex items-center`}
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className={`ml-2 ${color.base} ${color.hover}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}