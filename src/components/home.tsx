import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import SkeletonLoader from "./loader";
import RowActions from "./actionDropDown";
import { handleDownloadCSV } from "../service/CSVdownloader";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface Book {
  Title: string;
  Author: string;
  Genre: string;
  PublishedYear: string | number;
  ISBN: string;
}

const Home: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredData, setFilteredData] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [loader, setLoader] = useState(false);

  // ref for virtualizer container
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualizer
const rowVirtualizer = useVirtualizer({
  count: filteredData.length,     // number of rows
  getScrollElement: () => parentRef.current, // scrolling container
  estimateSize: () => 50,         // height of each row
  overscan: 5,                    // extra rows to render outside viewport
});

  const handleCsvSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoader(true);

    Papa.parse<Book>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setBooks(results.data);
        setFilteredData(results.data);
        setLoader(false);
      },
      error: () => setLoader(false),
    });
  };

  const handleEdit = (isbn: string) => {
    console.log("Edit row with ISBN:", isbn);
  };

  const handleDelete = (isbn: string) => {
    console.log("Delete row with ISBN:", isbn);
    setBooks((prev) => prev.filter((book) => book.ISBN !== isbn));
    setFilteredData((prev) => prev.filter((book) => book.ISBN !== isbn));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === "") {
      setFilteredData(books);
      return;
    }

    const filtered = books.filter(
      (book) =>
        book.Title.toLowerCase().includes(value.toLowerCase()) ||
        book.Author.toLowerCase().includes(value.toLowerCase()) ||
        book.Genre.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredData(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Book CSV Editor
      </h1>

      {/* Upload + Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        {/* Upload */}
        <label className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50 border border-gray-300">
          <Upload className="w-6 h-6 text-gray-400" />
          <span className="text-gray-700 font-medium">Upload CSV</span>
          <input
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleCsvSubmit}
          />
        </label>

        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={handleSearch}
          className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm w-full md:w-1/3"
        />

        {/* Sort */}
        <select
          value={sortColumn}
          onChange={(e) => setSortColumn(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm w-full md:w-1/4"
        >
          <option value="">Sort By</option>
          <option value="Title">Title</option>
          <option value="Author">Author</option>
          <option value="Genre">Genre</option>
          <option value="PublishedYear">Year</option>
        </select>

        {/* Download */}
        <button
          disabled={books.length === 0}
          className={`px-4 py-2 cursor-pointer bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 border border-blue-600 ${
            books.length === 0
              ? "opacity-50 cursor-not-allowed hover:bg-blue-600"
              : ""
          }`}
          onClick={() => handleDownloadCSV(books)}
        >
          Download CSV
        </button>
      </div>

      {/* Virtualized Table */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Table Header */}
        <div className="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
          {["Title", "Author", "Genre", "Published Year", "ISBN", "Actions"].map(
            (col) => (
              <div
                key={col}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col}
              </div>
            )
          )}
        </div>

        {/* Table Body */}
        {loader ? (
          <SkeletonLoader count={10} />
        ) : (
         <div ref={parentRef} className="overflow-auto h-[600px] relative">
  <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
    {rowVirtualizer.getVirtualItems().map(virtualRow => {
      const book = filteredData[virtualRow.index];
      return (
        <div
          key={book.ISBN}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }}
          className="grid grid-cols-6 border-b border-gray-200 hover:bg-gray-50"
        >
          <div className="px-6 py-3 truncate">{book.Title}</div>
          <div className="px-6 py-3 truncate">{book.Author}</div>
          <div className="px-6 py-3 truncate">{book.Genre}</div>
          <div className="px-6 py-3 truncate">{book.PublishedYear}</div>
          <div className="px-6 py-3 truncate">{book.ISBN}</div>
          <div className="px-6 py-3">
            <RowActions
              onEdit={() => handleEdit(book.ISBN.toString())}
              onDelete={() => handleDelete(book.ISBN.toString())}
            />
          </div>
        </div>
      );
    })}
  </div>
</div>
        )}
      </div>
    </div>
  );
};

export default Home;
