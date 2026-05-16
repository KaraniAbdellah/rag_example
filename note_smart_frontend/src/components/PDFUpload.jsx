import { useState, useRef } from 'react';
import { FiUploadCloud, FiFileText, FiTrash2, FiCheckCircle } from 'react-icons/fi';

const PDFUpload = () => {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f?.type === 'application/pdf') setFile(f);
    };

    const formatSize = (bytes) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    return (
        <div style={{
            width: '100%', height: '100%',
            background: '#0d0d0f',
            display: 'flex', flexDirection: 'column',
            padding: '40px 36px',
            fontFamily: "'DM Sans', sans-serif",
        }}>
            {/* Header */}
            <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e8624a, #f0a07a)',
                        boxShadow: '0 0 12px rgba(232,98,74,0.6)'
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#e8624a', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        Source document
                    </span>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 300, color: '#f0ede8', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    Upload your PDF
                </h2>
            </div>

            {/* Drop Zone */}
            <div
                onClick={() => !file && inputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                    flex: 1,
                    border: `1.5px dashed ${dragging ? 'rgba(232,98,74,0.6)' : file ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 16,
                    background: dragging
                        ? 'rgba(232,98,74,0.04)'
                        : file ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.015)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: file ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    padding: 32, gap: 0,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Subtle radial glow */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: dragging
                        ? 'radial-gradient(ellipse at center, rgba(232,98,74,0.06) 0%, transparent 70%)'
                        : 'radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 70%)',
                    transition: 'all 0.3s ease'
                }} />

                {!file ? (
                    <>
                        <div style={{
                            width: 64, height: 64, borderRadius: 16,
                            background: 'rgba(232,98,74,0.1)',
                            border: '1px solid rgba(232,98,74,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 20,
                        }}>
                            <FiUploadCloud size={28} color="#e8624a" />
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 500, color: '#c8c5c0', marginBottom: 6 }}>
                            Drop your PDF here
                        </p>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', marginBottom: 24 }}>
                            or click to browse files
                        </p>
                        <div style={{
                            padding: '8px 20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.4)',
                            letterSpacing: '0.05em',
                        }}>
                            PDF only · max 50 MB
                        </div>
                    </>
                ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
                        {/* File card */}
                        <div style={{
                            width: '100%', maxWidth: 360,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 12, padding: '16px 18px',
                            display: 'flex', alignItems: 'center', gap: 14,
                        }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 10,
                                background: 'rgba(232,98,74,0.12)',
                                border: '1px solid rgba(232,98,74,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <FiFileText size={20} color="#e8624a" />
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <p style={{
                                    fontSize: 14, fontWeight: 500, color: '#e8e5e0',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    marginBottom: 2
                                }}>
                                    {file.name}
                                </p>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                                    {formatSize(file.size)}
                                </p>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'rgba(255,255,255,0.25)', padding: 4,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: 6, transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#e8624a'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
                                title="Remove file"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>

                        {/* Ready badge */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 7,
                            padding: '6px 14px',
                            background: 'rgba(52,199,89,0.08)',
                            border: '1px solid rgba(52,199,89,0.2)',
                            borderRadius: 99,
                        }}>
                            <FiCheckCircle size={13} color="#34c759" />
                            <span style={{ fontSize: 12, color: '#34c759', fontWeight: 500 }}>Ready to process</span>
                        </div>
                    </div>
                )}
            </div>

            <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
    );
};

export default PDFUpload;