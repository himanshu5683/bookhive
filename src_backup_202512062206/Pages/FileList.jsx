import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthContext";
import "../styles/FileList.css";

const FileList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState("");

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Simulate loading files
    // In a real app, this would fetch from your backend API
    setTimeout(() => {
      // Mock data
      const mockFiles = [
        {
          id: '1',
          fileName: 'Sample PDF Document.pdf',
          fileType: 'application/pdf',
          fileSize: 2457600,
          uploadedAt: new Date(),
          email: 'user@example.com',
          isPublic: true,
          views: 42,
          downloads: 18
        },
        {
          id: '2',
          fileName: 'Research Paper.jpg',
          fileType: 'image/jpeg',
          fileSize: 1024000,
          uploadedAt: new Date(Date.now() - 86400000), // 1 day ago
          email: 'user@example.com',
          isPublic: false,
          views: 27,
          downloads: 9
        }
      ];
      setFiles(mockFiles);
      setLoading(false);
    }, 1000);
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
              <h3>{file.fileName}</h3>
              <p>Uploaded: {file.uploadedAt?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;