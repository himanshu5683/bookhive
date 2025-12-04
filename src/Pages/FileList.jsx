import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import "../styles/FileList.css";

const FileList = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user] = React.useState(auth.currentUser);

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

  const handleDownload = (downloadURL, fileName) => {
    const a = document.createElement("a");
    a.href = downloadURL;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.startsWith("video/")) return "🎬";
    if (fileType === "application/pdf") return "📄";
    return "📦";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="files-container">
        <div className="files-card">
          <div className="loading-spinner">Loading files...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="files-container">
      <div className="files-header">
        <div>
          <h1 className="files-title">📚 Community Files</h1>
          <p className="files-subtitle">
            Browse and download files shared by the BookHive community
          </p>
        </div>
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {files.length === 0 ? (
        <div className="files-card empty-state">
          <div className="empty-icon">📭</div>
          <h2>No Files Yet</h2>
          <p>Be the first to upload a file to the community!</p>
          <button
            className="upload-link-btn"
            onClick={() => navigate("/upload")}
          >
            📤 Upload Your File
          </button>
        </div>
      ) : (
        <div className="files-grid">
          {files.map((file) => (
            <div key={file.id} className="file-card">
              <div className="file-header">
                <div className="file-icon">{getFileIcon(file.fileType)}</div>
                <div className="file-meta">
                  <h3 className="file-name" title={file.fileName}>
                    {file.fileName}
                  </h3>
                  <p className="file-type">{file.fileType}</p>
                </div>
              </div>

              <div className="file-details">
                <div className="detail-item">
                  <span className="detail-label">Uploader:</span>
                  <span className="detail-value">{file.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">
                    {formatFileSize(file.fileSize)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Uploaded:</span>
                  <span className="detail-value">
                    {formatDate(file.uploadedAt)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Downloads:</span>
                  <span className="detail-value">{file.downloads || 0}</span>
                </div>
              </div>

              <button
                className="download-btn"
                onClick={() => handleDownload(file.downloadURL, file.fileName)}
              >
                ⬇️ Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;
