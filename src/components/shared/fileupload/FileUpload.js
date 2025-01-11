import React, { useState } from 'react';

function FileUpload({ onUploadSuccess, currentImage }) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentImage || '');

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                onUploadSuccess(data.filePath);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="file-upload">
            <div className="preview-container">
                {previewUrl && (
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="image-preview"
                    />
                )}
            </div>
            <div className="upload-controls">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    id="file-input"
                    className="file-input"
                />
                <label htmlFor="file-input" className="file-input-label">
                    {uploading ? 'Uploading...' : 'Choose File'}
                </label>
            </div>
        </div>
    );
}

export default FileUpload; 