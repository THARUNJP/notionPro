import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const RowActions: React.FC<RowActionsProps> = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 shadow-lg rounded-md z-10">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default RowActions;
