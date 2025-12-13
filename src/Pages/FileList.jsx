import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthContext";
import { resourcesService } from "../services/api";
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

    // Fetch user's files
    const fetchUserFiles = async () => {
      try {
        setLoading(true);
        const response = await resourcesService.getMyFiles();
        setFiles(response.resources || []);
      } catch (err) {
        console.error("Failed to fetch user files:", err);
        setError("Failed to load your files. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserFiles();
  }, [user, navigate]);

  const handleDelete = async (fileId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await resourcesService.delete(fileId);
        // Remove the file from the list
        setFiles(files.filter(file => file._id !== fileId));
      } catch (err) {
        console.error("Failed to delete file:", err);
        alert("Failed to delete file. Please try again.");
      }
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const response = await resourcesService.download(fileId, {});
      // In a real app, this would trigger the actual download
      alert("File download initiated!");
    } catch (err) {
      console.error("Failed to download file:", err);
      alert("Failed to download file. Please try again.");
    }
  };

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
            <div key={file._id} className="file-item">
              <h3>{file.title}</h3>
              <p>Category: {file.category}</p>
              <p>Type: {file.type}</p>
              <p>Uploaded: {new Date(file.createdAt).toLocaleString()}</p>
              <div className="file-actions">
                <button onClick={() => handleDownload(file._id)}>Download</button>
                <button onClick={() => handleDelete(file._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;