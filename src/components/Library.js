/* bookhive/src/components/Library.js */
import React, { useState } from "react";

const Library = () => {
    const books = [
        { title: "Physics Handbook", category: "Science" },
        { title: "JavaScript Basics", category: "Programming" },
        { title: "Modern Biology", category: "Biology" },
        { title: "Operating System Notes", category: "CS" }
    ];

    const [filter, setFilter] = useState("");

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="component">
            <h1>Library</h1>

            <input
                type="text"
                placeholder="Search books..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                    padding: "10px",
                    width: "70%",
                    marginBottom: "20px",
                    borderRadius: "8px",
                    border: "1px solid #ccc"
                }}
            />

            <div className="library-grid">
                {filteredBooks.map((book, index) => (
                    <div className="book-card" key={index}>
                        <h3>{book.title}</h3>
                        <p>{book.category}</p>
                        <button className="btn">Download</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Library;
