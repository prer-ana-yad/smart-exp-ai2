import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./ScanBill.css";

export default function ScanBill() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [extractedData, setExtractedData] = useState(null);

  /* ================= HANDLE SCAN ================= */

  const handleScan = async (file) => {

    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setError("");
    setExtractedData(null);

    const formData = new FormData();
    formData.append("image", file);

    try {

      const res = await API.post("/ocr", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });

      const savedExpense = res.data.savedExpense; 

      setExtractedData( res.data.data);

      alert("Receipt scanned & saved successfully!");

      // Navigate back after 1.5 sec
      

// Clear any cached data






// Navigate and force reload
navigate("/home");


    } catch (err) {

      console.log("OCR ERROR:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to scan receipt. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="scan-container">

      <div className="scan-card">

        {/* PREVIEW */}
        {preview ? (
          <img src={preview} alt="preview" className="preview-img" />
        ) : (
          <p className="scan-placeholder">
            Upload or capture receipt image
          </p>
        )}

        {/* UPLOAD FROM GALLERY */}
        <label className="upload-btn">
          📁 Upload from Gallery
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleScan(e.target.files[0])}
          />
        </label>

        {/* CAPTURE FROM CAMERA */}
        <label className="upload-btn camera-btn">
          📷 Capture from Camera
          <input
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => handleScan(e.target.files[0])}
          />
        </label>

        {/* LOADING */}
        {loading && (
          <p className="loading">
            Scanning receipt... Please wait
          </p>
        )}

        {/* ERROR */}
        {error && (
          <p className="error-text">
            {error}
          </p>
        )}

        {/* SHOW EXTRACTED RESULT (OPTIONAL PREVIEW) */}
        {extractedData && (
          <div className="extracted-box">

            <h3>Detected Details</h3>

            <p><strong>Store:</strong> {extractedData.merchantName}</p>
            <p><strong>Date:</strong> {extractedData.date}</p>
            <p><strong>Total:</strong> ₹ {extractedData.totalAmount}</p>
            <p><strong>Category:</strong> {extractedData.category}</p>

            {extractedData.items?.length > 0 && (
              <div>
                <h4>Items:</h4>
                <ul>
                  {extractedData.items.map((item, index) => (
                    <li key={index}>
                      {item.name} — ₹ {item.price}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}