import { useState, useRef } from "react";
import {
  FiUploadCloud,
  FiFile,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

const API_BASE = "http://localhost:8000";

/**
 * PDFUpload
 * Props:
 *   onIndexed(collectionName: string) — called after successful indexing
 */
const PDFUpload = ({ onIndexed }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState(null); // { pages, chunks }
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const uploadFile = async (f) => {
    setFile(f);
    setStatus("uploading");
    setMessage("");
    setStats(null);

    const formData = new FormData();
    formData.append("file", f);
    // collection name = file name without extension
    const collectionName = f.name
      .replace(/\.pdf$/i, "")
      .replace(/\s+/g, "_")
      .toLowerCase();
    formData.append("collection_name", collectionName);

    try {
      const res = await fetch(`${API_BASE}/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setStatus("success");
      setMessage(data.message);
      setStats({ pages: data.pages_extracted, chunks: data.chunks_indexed });
      onIndexed?.(collectionName);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) uploadFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") uploadFile(f);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0d0d0f",
        display: "flex",
        flexDirection: "column",
        padding: "28px 36px",
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#e8e5e0",
            marginBottom: 4,
          }}
        >
          Upload Document
        </p>
        <p
          style={{
            fontSize: 14,
            fontWeight: "bold",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <span className="text-red-800 font-bold">PDF files only · English Only · Small Files Only</span>
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          flex: 1,
          border: `2px dashed ${dragging ? "rgba(94,130,255,0.6)" : "rgba(255,255,255,0.09)"}`,
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          cursor: "pointer",
          background: dragging
            ? "rgba(94,130,255,0.04)"
            : "rgba(255,255,255,0.02)",
          transition: "all 0.2s",
          padding: 32,
          boxSizing: "border-box",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          onChange={onFileChange}
        />

        {status === "idle" && (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "rgba(94,130,255,0.08)",
                border: "1px solid rgba(94,130,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiUploadCloud size={24} color="#5e82ff" />
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 14,
                  color: "#c8c5c0",
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                Drop your PDF here
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                or click to browse
              </p>
            </div>
          </>
        )}

        {status === "uploading" && (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "rgba(94,130,255,0.08)",
                border: "1px solid rgba(94,130,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "spin 1s linear infinite",
              }}
            >
              <FiLoader size={24} color="#5e82ff" />
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              Indexing{" "}
              <strong style={{ color: "#c8c5c0" }}>{file?.name}</strong>…
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "rgba(52,199,89,0.08)",
                border: "1px solid rgba(52,199,89,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiCheckCircle size={24} color="#34c759" />
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 13,
                  color: "#34c759",
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                {message}
              </p>
              {stats && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                  {stats.pages} pages · {stats.chunks} chunks indexed
                </p>
              )}
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.2)",
                  marginTop: 8,
                }}
              >
                Click to upload another
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <FiFile size={13} color="rgba(255,255,255,0.3)" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {file?.name}
              </span>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "rgba(255,69,58,0.08)",
                border: "1px solid rgba(255,69,58,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiAlertCircle size={24} color="#ff453a" />
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 13,
                  color: "#ff453a",
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                Upload failed
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                {message}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.2)",
                  marginTop: 8,
                }}
              >
                Click to try again
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PDFUpload;
