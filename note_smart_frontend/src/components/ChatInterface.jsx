import { useState, useRef, useEffect } from 'react';
import { FiSend, FiZap, FiUser, FiAlertCircle } from 'react-icons/fi';

const API_BASE = 'http://localhost:8000';
const CHIPS = ['Summarize', 'Key points', 'To markdown', 'Translate'];

/**
 * ChatInterface
 * Props:
 *   collectionName: string | null — set after PDF is indexed
 */
const ChatInterface = ({ collectionName }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! Upload a PDF on the left and ask me anything about it.", isBot: true }
    ]);
    const [input, setInput]     = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef  = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessage = (text, isBot, isError = false) => {
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, isBot, isError }]);
    };

    const handleSend = async (overrideText) => {
        const question = (overrideText ?? input).trim();
        if (!question || loading) return;

        // Guard: no PDF indexed yet
        if (!collectionName) {
            addMessage('⚠️ Please upload a PDF first before asking questions.', true, true);
            return;
        }

        addMessage(question, false);
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    collection_name: collectionName,
                    top_k: 5,
                    rerank_top_k: 3,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Query failed');
            }

            addMessage(data.answer, true);

        } catch (err) {
            addMessage(`Error: ${err.message}`, true, true);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const autoResize = (el) => {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    return (
        <div style={{
            width: '100%', height: '100%',
            background: '#0d0d0f',
            display: 'flex', flexDirection: 'column',
            fontFamily: "'DM Sans', sans-serif",
        }}>
            {/* Header */}
            <div style={{
                padding: '28px 36px 22px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 12,
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(94,130,255,0.12)',
                    border: '1px solid rgba(94,130,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <FiZap size={16} color="#5e82ff" />
                </div>
                <div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#e8e5e0', lineHeight: 1.2 }}>AI Assistant</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
                        {collectionName ? `📄 ${collectionName}` : 'NoteLLM'}
                    </p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: collectionName ? '#34c759' : '#ff9f0a',
                        boxShadow: collectionName
                            ? '0 0 8px rgba(52,199,89,0.5)'
                            : '0 0 8px rgba(255,159,10,0.5)',
                    }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                        {collectionName ? 'ready' : 'waiting for PDF'}
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1, overflowY: 'auto',
                padding: '28px 36px',
                display: 'flex', flexDirection: 'column', gap: 20,
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.08) transparent',
            }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        flexDirection: msg.isBot ? 'row' : 'row-reverse',
                    }}>
                        {/* Avatar */}
                        <div style={{
                            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: msg.isBot ? 'rgba(94,130,255,0.12)' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${msg.isBot ? 'rgba(94,130,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                        }}>
                            {msg.isBot
                                ? (msg.isError
                                    ? <FiAlertCircle size={14} color="#ff453a" />
                                    : <FiZap size={14} color="#5e82ff" />)
                                : <FiUser size={14} color="rgba(255,255,255,0.5)" />
                            }
                        </div>

                        {/* Bubble */}
                        <div style={{
                            maxWidth: '72%',
                            padding: '11px 15px',
                            borderRadius: msg.isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                            fontSize: 14, lineHeight: 1.65,
                            background: msg.isError
                                ? 'rgba(255,69,58,0.08)'
                                : msg.isBot
                                    ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(94,130,255,0.15)',
                            border: `1px solid ${msg.isError
                                ? 'rgba(255,69,58,0.2)'
                                : msg.isBot
                                    ? 'rgba(255,255,255,0.07)'
                                    : 'rgba(94,130,255,0.25)'}`,
                            color: msg.isError ? '#ff453a' : msg.isBot ? '#c8c5c0' : '#d0d8ff',
                            whiteSpace: 'pre-wrap',
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(94,130,255,0.12)',
                            border: '1px solid rgba(94,130,255,0.2)',
                        }}>
                            <FiZap size={14} color="#5e82ff" />
                        </div>
                        <div style={{
                            padding: '11px 16px',
                            borderRadius: '4px 14px 14px 14px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            display: 'flex', gap: 5, alignItems: 'center',
                        }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: 'rgba(94,130,255,0.6)',
                                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                }} />
                            ))}
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Quick chips */}
            <div style={{ padding: '0 36px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CHIPS.map(chip => (
                    <button
                        key={chip}
                        onClick={() => handleSend(chip)}
                        disabled={loading}
                        style={{
                            padding: '5px 12px', borderRadius: 99,
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.03)',
                            fontSize: 12, fontWeight: 500,
                            color: 'rgba(255,255,255,0.4)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: "'DM Sans', sans-serif",
                            opacity: loading ? 0.4 : 1,
                        }}
                        onMouseEnter={e => {
                            if (loading) return;
                            e.currentTarget.style.borderColor = 'rgba(94,130,255,0.4)';
                            e.currentTarget.style.color = '#5e82ff';
                            e.currentTarget.style.background = 'rgba(94,130,255,0.07)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        }}
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div style={{
                padding: '12px 36px 28px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: 10, alignItems: 'flex-end',
            }}>
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={e => { setInput(e.target.value); autoResize(e.target); }}
                    onKeyDown={handleKey}
                    disabled={loading}
                    placeholder={collectionName
                        ? 'Ask anything about your document…'
                        : 'Upload a PDF first to start chatting…'}
                    style={{
                        flex: 1, resize: 'none',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        borderRadius: 12,
                        padding: '11px 16px',
                        fontSize: 14, lineHeight: 1.5,
                        color: '#e0ddd8',
                        fontFamily: "'DM Sans', sans-serif",
                        outline: 'none',
                        maxHeight: 120, overflowY: 'auto',
                        transition: 'border-color 0.15s',
                        opacity: loading ? 0.6 : 1,
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(94,130,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                    style={{
                        width: 42, height: 42, flexShrink: 0,
                        borderRadius: 12,
                        border: '1px solid rgba(94,130,255,0.3)',
                        background: 'rgba(94,130,255,0.15)',
                        cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                        opacity: loading || !input.trim() ? 0.4 : 1,
                    }}
                    onMouseEnter={e => {
                        if (loading || !input.trim()) return;
                        e.currentTarget.style.background = 'rgba(94,130,255,0.28)';
                        e.currentTarget.style.borderColor = 'rgba(94,130,255,0.5)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(94,130,255,0.15)';
                        e.currentTarget.style.borderColor = 'rgba(94,130,255,0.3)';
                    }}
                    aria-label="Send"
                >
                    <FiSend size={16} color="#5e82ff" />
                </button>
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ChatInterface;