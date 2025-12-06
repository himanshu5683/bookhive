/* bookhive/src/components/Library.js */
import React, { useState, useEffect } from "react";
import BookCard from './BookCard';

const Library = () => {
    const books = [
        { title: "Physics Handbook", category: "Science", emoji: '📘', rating: 4.2 },
        { title: "JavaScript Basics", category: "Programming", emoji: '📗', rating: 4.6 },
        { title: "Modern Biology", category: "Biology", emoji: '📙', rating: 3.9 },
        { title: "Operating System Notes", category: "CS", emoji: '📕', rating: 4.1 }
    ];

    const [filter, setFilter] = useState("");
    const [saved, setSaved] = useState(() => {
        try {
            const raw = localStorage.getItem('bh_saved');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        // Pick up a search from the Navbar if present
        try {
            const q = sessionStorage.getItem('bh_search') || '';
            if (q) setFilter(q);
        } catch (e) {
            // ignore sessionStorage errors (e.g., SSR or privacy settings)
        }
    }, []);

    const persistSaved = (next) => {
        try {
            localStorage.setItem('bh_saved', JSON.stringify(next));
        } catch (e) {
            // ignore
        }
    };

    const toggleSave = (book) => {
        const key = book.title;
        setSaved(prev => {
            let next;
            if (prev.includes(key)) next = prev.filter(k => k !== key);
            else next = [key, ...prev];
            persistSaved(next);
            return next;
        });
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(filter.toLowerCase()) ||
        book.category.toLowerCase().includes(filter.toLowerCase())
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
                    <div className="library-item" key={index}>
                        <BookCard
                            book={book}
                            onRead={() => alert(`Open ${book.title}`)}
                            onSave={() => toggleSave(book)}
                            isSaved={saved.includes(book.title)}
                        />
                    </div>
                ))}
                {filteredBooks.length === 0 && <p>No results found.</p>}
            </div>
        </div>
    );
};

export default Library;
