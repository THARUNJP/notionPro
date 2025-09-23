import React from 'react';
import { faker } from '@faker-js/faker';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { Download } from 'lucide-react';

const GenerateCSV: React.FC = () => {
  const generateCSV = () => {
    const books = Array.from({ length: 10000 }).map(() => ({
      Title: faker.lorem.words(3),
      Author: faker.person.fullName(),        // updated API
      Genre: faker.music.genre(),
      PublishedYear: faker.number.int({ min: 1900, max: 2025 }), // updated API
      ISBN: faker.string.uuid(),              // updated API
    }));

    const csv = Papa.unparse(books);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'fake_books.csv');
  };

  return (
    <button
      onClick={generateCSV}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
    >
      <Download className="w-5 h-5" />
      Generate 10k CSV
    </button>
  );
};

export default GenerateCSV;
