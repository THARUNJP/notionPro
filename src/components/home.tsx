import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import SkeletonLoader from "./loader";
import { handleDownloadCSV } from "../service/CSVdownloader";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface Book {
  Title: string;
  Author: string;
  Genre: string;
  PublishedYear: string;
  ISBN: string;
  isEdit?: boolean; // flag for edit mode
}

const Home: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [originalBooks, setOriginalBooks] = useState<Book[]>([]); // Original uploaded data
  const [filteredData, setFilteredData] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [loader, setLoader] = useState(false);
console.log(books,"/");

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  // Upload CSV
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
        setOriginalBooks(results.data); // Save original uploaded data
        setLoader(false);
      },
      error: () => setLoader(false),
    });
  };

  // Edit row
  const handleEdit = (isbn: string) => {
    setFilteredData((prev) =>
      prev.map((book) =>
        book.ISBN === isbn ? { ...book, isEdit: true } : book
      )
    );
  };

  // Save edited row
  const handleSave = (isbn: string) => {

    setFilteredData((prev) => {
  const updatedBooks = prev.map((book) =>
    book.ISBN === isbn ? { ...book, isEdit: false } : book
  );
  setBooks(updatedBooks)
  return updatedBooks;
});


    // Update main books array with latest filteredData without isEdit
   
  };

  // Input change during edit
  const handleInputChange = (
    isbn: string,
    field: keyof Book,
    value: string
  ) => {
    setFilteredData((prev) =>
      prev.map((book) =>
        book.ISBN === isbn ? { ...book, [field]: value } : book
      )
    );
  };

  // Search
const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setSearch(value);

  if (value.trim() === "") {
    setFilteredData(books); // keep the latest edited books
    return;
  }

  const filtered = books.filter((book) =>
    book.Title.toLowerCase().includes(value.toLowerCase()) ||
    book.Author.toLowerCase().includes(value.toLowerCase()) ||
    book.Genre.toLowerCase().includes(value.toLowerCase())
  );

  setFilteredData(filtered);
};
  // Sort
  const handleSort = (column: string) => {
    setSortColumn(column);
    if (!column) {
      setFilteredData(books);
      return;
    }

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[column as keyof Book]?.toString() || "";
      const bValue = b[column as keyof Book]?.toString() || "";
      return aValue.localeCompare(bValue);
    });

    setFilteredData(sorted);
  };

  // Revert all
  const handleRevertAll = () => {
    setFilteredData(originalBooks);
    setBooks(originalBooks);
    setSearch("");
    setSortColumn("");
  };

 return (
  <div className="min-h-screen bg-gray-100 p-2 sm:p-4 md:p-6">
    {/* Header */}
    <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
      Book CSV Editor
    </h1>

    {/* Upload + Controls */}
    <div className="flex flex-col gap-3 mb-4 sm:mb-6">
      {/* Row 1: Upload and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Upload */}
        <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50 border border-gray-300 flex-shrink-0">
          <Upload className="w-5 h-5 text-gray-400" />
          <span className="text-gray-700 font-medium text-sm sm:text-base">Upload CSV</span>
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
          className="px-3 py-2 rounded-lg border border-gray-300 shadow-sm flex-1 text-sm sm:text-base"
        />
      </div>

      {/* Row 2: Sort and Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Sort */}
        <select
          value={sortColumn}
          onChange={(e) => handleSort(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 shadow-sm flex-1 text-sm sm:text-base"
        >
          <option value="">Sort By</option>
          <option value="Title">Title</option>
          <option value="Author">Author</option>
          <option value="Genre">Genre</option>
          <option value="PublishedYear">Year</option>
        </select>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            disabled={books.length === 0}
            className={`flex-1 px-3 py-2 text-sm sm:text-base cursor-pointer bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 border border-blue-600 ${
              books.length === 0
                ? "opacity-50 cursor-not-allowed hover:bg-blue-600"
                : ""
            }`}
            onClick={handleRevertAll}
          >
            Revert all
          </button>

          <button
            disabled={books.length === 0}
            className={`flex-1 px-3 py-2 text-sm sm:text-base cursor-pointer bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 border border-blue-600 ${
              books.length === 0
                ? "opacity-50 cursor-not-allowed hover:bg-blue-600"
                : ""
            }`}
            onClick={() => handleDownloadCSV(books)}
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Card View (< md screens) */}
    <div className="md:hidden">
      {loader ? (
        <SkeletonLoader count={5} />
      ) : (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {filteredData.map((book) => (
            <div
              key={book.ISBN}
              className={`bg-white rounded-lg shadow-md p-4 ${
                "isEdit" in book && !book.isEdit ? "bg-yellow-100" : ""
              }`}
            >
              {book.isEdit ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                      value={book.Title}
                      onChange={(e) =>
                        handleInputChange(book.ISBN, "Title", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Author</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                      value={book.Author}
                      onChange={(e) =>
                        handleInputChange(book.ISBN, "Author", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Genre</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                      value={book.Genre}
                      onChange={(e) =>
                        handleInputChange(book.ISBN, "Genre", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Published Year</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                      value={book.PublishedYear}
                      onChange={(e) =>
                        handleInputChange(book.ISBN, "PublishedYear", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">ISBN</label>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{book.ISBN}</div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      className="flex-1 px-3 py-2 bg-green-500 text-white rounded text-sm font-medium"
                      onClick={() => handleSave(book.ISBN)}
                    >
                      Save
                    </button>
                    <button
                      className="flex-1 px-3 py-2 bg-gray-300 rounded text-sm font-medium"
                      onClick={() =>
                        setFilteredData((prev) =>
                          prev.map((b) =>
                            b.ISBN === book.ISBN ? { ...b, isEdit: false } : b
                          )
                        )
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <div className="text-xs font-medium text-gray-500">Title</div>
                    <div className="text-sm font-medium text-gray-900 break-words">{book.Title}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">Author</div>
                    <div className="text-sm text-gray-700 break-words">{book.Author}</div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-xs font-medium text-gray-500">Genre</div>
                      <div className="text-sm text-gray-700">{book.Genre}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500">Year</div>
                      <div className="text-sm text-gray-700">{book.PublishedYear}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">ISBN</div>
                    <div className="text-xs text-gray-600 font-mono">{book.ISBN}</div>
                  </div>
                  <div className="pt-2">
                    <button
                      className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium"
                      onClick={() => handleEdit(book.ISBN)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Desktop Table View (>= md screens) */}
    <div className="hidden md:block bg-white rounded-lg shadow-md">
      {/* Table Header */}
      <div className="grid grid-cols-6 bg-gray-50 border-b border-gray-200">
        {["Title", "Author", "Genre", "Published Year", "ISBN", "Actions"].map(
          (col) => (
            <div
              key={col}
              className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
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
          <div
            style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const book = filteredData[virtualRow.index];
              return (
                <div
                  key={book.ISBN}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={`grid grid-cols-6 border-b text-center border-gray-200 hover:bg-gray-50 items-center ${
                    "isEdit" in book && !book.isEdit ? "bg-yellow-300" : ""
                  }`}
                >
                  {book.isEdit ? (
                    <>
                      <input
                        className="mx-2 px-2 py-1 border border-gray-200 rounded text-center text-sm"
                        value={book.Title}
                        onChange={(e) =>
                          handleInputChange(book.ISBN, "Title", e.target.value)
                        }
                      />
                      <input
                        className="mx-2 px-2 py-1 border border-gray-200 rounded text-center text-sm"
                        value={book.Author}
                        onChange={(e) =>
                          handleInputChange(book.ISBN, "Author", e.target.value)
                        }
                      />
                      <input
                        className="mx-2 px-2 py-1 border border-gray-200 rounded text-center text-sm"
                        value={book.Genre}
                        onChange={(e) =>
                          handleInputChange(book.ISBN, "Genre", e.target.value)
                        }
                      />
                      <input
                        className="mx-2 px-2 py-1 border border-gray-200 rounded text-center text-sm"
                        value={book.PublishedYear}
                        onChange={(e) =>
                          handleInputChange(book.ISBN, "PublishedYear", e.target.value)
                        }
                      />
                      <div className="px-2 py-1 text-sm">{book.ISBN}</div>
                      <div className="flex gap-1 justify-center">
                        <button
                          className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                          onClick={() => handleSave(book.ISBN)}
                        >
                          Save
                        </button>
                        <button
                          className="px-2 py-1 bg-gray-300 rounded text-sm"
                          onClick={() =>
                            setFilteredData((prev) =>
                              prev.map((b) =>
                                b.ISBN === book.ISBN ? { ...b, isEdit: false } : b
                              )
                            )
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-4 lg:px-6 py-3 truncate text-sm">{book.Title}</div>
                      <div className="px-4 lg:px-6 py-3 truncate text-sm">{book.Author}</div>
                      <div className="px-4 lg:px-6 py-3 truncate text-sm">{book.Genre}</div>
                      <div className="px-4 lg:px-6 py-3 truncate text-sm">{book.PublishedYear}</div>
                      <div className="px-4 lg:px-6 py-3 truncate text-xs font-mono">{book.ISBN}</div>
                      <div className="px-4 lg:px-6 py-3 flex justify-center">
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                          onClick={() => handleEdit(book.ISBN)}
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  )}
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
