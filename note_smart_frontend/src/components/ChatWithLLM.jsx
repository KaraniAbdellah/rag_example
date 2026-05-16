import PDFUpload from './PDFUpload';
import ChatInterface from './ChatInterface';

const ChatWithLLM = () => {
    return (
        <div className="w-screen h-[100vh] flex overflow-hidden" style={{ background: '#0d0d0f', fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

            {/* Left Side: PDF Upload */}
            <div className="h-full flex-1" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <PDFUpload />
            </div>

            {/* Right Side: Chat Interface */}
            <div className="h-full flex-1">
                <ChatInterface />
            </div>
        </div>
    );
};

export default ChatWithLLM;