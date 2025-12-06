/* bookhive/src/components/Upload.js */
import React, { useState } from "react";

const Upload = () => {
    const [name, setName] = useState("");
    const [file, setFile] = useState(null);

    const handleUpload = () => {
        alert(`Uploaded: ${name}\nFile Name: ${file?.name}`);
    };

    return (
        <div className="component">
            <h1>Upload Notes</h1>

            <div className="profile-box">
                <label>Title</label>
                <input 
                    type="text" 
                    placeholder="Enter title"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginTop: "5px" }}
                />

                <label style={{ marginTop: "1rem" }}>File</label>
                <input 
                    type="file"
                    onChange={e => setFile(e.target.files[0])}
                />

                <button className="btn" style={{ marginTop: "1rem" }} onClick={handleUpload}>
                    Upload
                </button>
            </div>
        </div>
    );
};

export default Upload;
