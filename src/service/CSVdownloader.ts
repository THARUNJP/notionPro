import type { Book } from "../components/home";



export const handleDownloadCSV = (books:Book[]) => {
  if (books.length === 0) return;

  // 1. Prepare CSV header
  const headers = ['Title', 'Author', 'Genre', 'PublishedYear', 'ISBN'];
  const rows = books.map((book) =>
    headers.map((header) => `"${book[header as keyof Book]}"`).join(',')
  );

  // 2. Combine header + rows
  const csvContent = [headers.join(','), ...rows].join('\n');

  // 3. Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'books.csv'); // filename
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
