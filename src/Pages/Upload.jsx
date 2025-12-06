import React, { useState, useContext } from "react";
import AuthContext from "../auth/AuthContext";
import apiClient from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/Upload.css";

const Upload = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Programming");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Available categories
  const categories = ["Programming", "Science", "Mathematics", "Technology", "Business", "Arts", "Languages", "Other"];

  // Allowed file types
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "video/mp4", "video/webm", "video/quicktime"];
  const maxFileSize = 100 * 1024 * 1024; // 100MB

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="upload-container">
        <div className="upload-card">
          <h1 className="upload-title">Access Denied</h1>
          <p className="upload-message">You must be logged in to upload files.</p>
          <button className="upload-btn primary" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setError("");
    setSuccess("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Invalid file type. Only images (JPG, PNG, GIF, WebP), PDFs, and videos (MP4, WebM, MOV) are allowed.");
      setFile(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > maxFileSize) {
      setError("File size exceeds 100MB limit.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setUploadProgress(0);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!title.trim()) {
      setError("Please enter a title for your resource.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description for your resource.");
      return;
    }

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    if (!user) {
      setError("You must be logged in to upload files.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress while creating resource
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Determine resource type based on file type
      let resourceType = 'document';
      if (file.type.includes('pdf')) resourceType = 'pdf';
      else if (file.type.includes('image')) resourceType = 'note';
      else if (file.type.includes('video')) resourceType = 'video';
      else if (file.type.includes('audio')) resourceType = 'audio';

      // Create resource in backend
      // Note: In a real app, you'd upload the file to cloud storage first
      // and get a URL, then create the resource with that URL
      const resourceData = {
        title: title.trim(),
        description: description.trim(),
        type: resourceType,
        category: category,

        url: `https://storage.example.com/${Date.now()}_${file.name}`, // Placeholder URL
        tags: [category.toLowerCase()]
      };

      await apiClient.resourcesAPI.create(resourceData);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploading(false);
      setSuccess(`✓ "${title}" uploaded successfully!`);
      
      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setCategory("Programming");
      
      // Auto-clear message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An error occurred during upload.");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h1 className="upload-title">📤 Upload Files</h1>
        <p className="upload-subtitle">Share your resources with the BookHive community</p>

        {error && <div className="upload-error">{error}</div>}
        {success && <div className="upload-success">{success}</div>}

        <form className="upload-form" onSubmit={handleUpload}>
          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your resource"
              disabled={uploading}
              required
            />
          </div>

          {/* Description Input */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your resource..."
              disabled={uploading}
              rows={3}
              required
            />
          </div>

          {/* Category Select */}
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* File Input Area */}
          <div className="file-input-wrapper">
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.mp4,.webm,.mov"
              className="file-input"
            />
            <label htmlFor="file-input" className="file-input-label">
              <div className="file-input-icon">📁</div>
              <div className="file-input-text">
                {file ? (
                  <div className="file-selected">
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                  </div>
                ) : (
                  <>
                    <p className="file-drag-text">Drag & drop your file here or click to browse</p>
                    <p className="file-help-text">Supported: Images, PDFs, Videos (Max 100MB)</p>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Upload Progress Bar */}
          {uploading && uploadProgress > 0 && (
            <div className="progress-section">
              <div className="progress-label">
                <span className="progress-text">Uploading...</span>
                <span className="progress-percentage">{uploadProgress}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          {/* File Info */}
          {file && (
            <div className="file-info">
              <div className="file-info-item">
                <span className="file-info-label">File Name:</span>
                <span className="file-info-value">{file.name}</span>
              </div>
              <div className="file-info-item">
                <span className="file-info-label">File Size:</span>
                <span className="file-info-value">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="file-info-item">
                <span className="file-info-label">File Type:</span>
                <span className="file-info-value">{file.type || "Unknown"}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="upload-actions">
            <button
              type="submit"
              className="upload-btn primary"
              disabled={!file || uploading}
            >
              {uploading ? `Uploading (${uploadProgress}%)...` : "Upload File"}
            </button>

            {file && !uploading && (
              <button
                type="button"
                className="upload-btn secondary"
                onClick={() => {
                  setFile(null);
                  setTitle("");
                  setDescription("");
                  setUploadProgress(0);
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Info Box */}
        <div className="upload-info">
          <h3>Upload Guidelines</h3>
          <ul>
            <li>✓ Maximum file size: 100MB</li>
            <li>✓ Supported formats: JPG, PNG, GIF, WebP, PDF, MP4, WebM, MOV</li>
            <li>✓ Files are securely processed by our backend</li>
            <li>✓ You can manage your uploads in your profile</li>
            <li>✓ Only you can see your uploads unless you make them public</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Upload;