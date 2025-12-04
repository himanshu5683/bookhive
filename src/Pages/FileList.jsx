import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthContext";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import "../styles/FileList.css";

const FileList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Query files collection ordered by newest first
    const filesRef = collection(db, "files");
    const q = query(filesRef, orderBy("uploadedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const filesData = [];
        snapshot.forEach((doc) => {
          filesData.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setFiles(filesData);
        setLoading(false);
      },
      (err) => {
        setError("Failed to load files. Please try again.");
        console.error("Error fetching files:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, navigate]);

  if (loading) {
    return <div className="file-list-loading">Loading files...</div>;
  }

  if (error) {
    return <div className="file-list-error">{error}</div>;
  }

  return (
    <div className="file-list-container">
      <h1>Your Files</h1>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <div className="file-grid">
          {files.map((file) => (
            <div key={file.id} className="file-item">
              <h3>{file.name}</h3>
              <p>Uploaded: {file.uploadedAt?.toDate().toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;
