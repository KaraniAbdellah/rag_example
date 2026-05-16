import  { useState, useRef, useEffect } from 'react';
import { FiSend, FiZap, FiUser } from 'react-icons/fi';

const CHIPS = ['Summarize', 'Key points', 'To markdown', 'Translate'];

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! Upload a PDF on the left and ask me anything about it.", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);

    const handleSend = (text) => {
        const t = (text ?? input).trim();
        if (!t) return;
        setMessages(prev => [...prev, { id: Date.now(), text: t, isBot: false }]);
        setInput('');
        if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: `I received: "${t}". Connect your LLM API here to generate real responses.`,
                isBot: true
            }]);
        }, 900);
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const autoResize = (el) => {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>NoteLLM</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34c759', boxShadow: '0 0 8px rgba(52,199,89,0.5)' }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>online</span>
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
                                ? <FiZap size={14} color="#5e82ff" />
                                : <FiUser size={14} color="rgba(255,255,255,0.5)" />
                            }
                        </div>
                        {/* Bubble */}
                        <div style={{
                            maxWidth: '72%',
                            padding: '11px 15px',
                            borderRadius: msg.isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                            fontSize: 14, lineHeight: 1.65,
                            background: msg.isBot
                                ? 'rgba(255,255,255,0.04)'
                                : 'rgba(94,130,255,0.15)',
                            border: `1px solid ${msg.isBot ? 'rgba(255,255,255,0.07)' : 'rgba(94,130,255,0.25)'}`,
                            color: msg.isBot ? '#c8c5c0' : '#d0d8ff',
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Quick chips */}
            <div style={{ padding: '0 36px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CHIPS.map(chip => (
                    <button
                        key={chip}
                        onClick={() => handleSend(chip)}
                        style={{
                            padding: '5px 12px',
                            borderRadius: 99,
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.03)',
                            fontSize: 12, fontWeight: 500,
                            color: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                        onMouseEnter={e => {
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
                    placeholder="Ask anything about your document…"
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
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(94,130,255,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
                />
                <button
                    onClick={() => handleSend()}
                    style={{
                        width: 42, height: 42, flexShrink: 0,
                        borderRadius: 12,
                        border: '1px solid rgba(94,130,255,0.3)',
                        background: 'rgba(94,130,255,0.15)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
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
        </div>
    );
};

export default ChatInterface;