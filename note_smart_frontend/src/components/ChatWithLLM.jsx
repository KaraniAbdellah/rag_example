import { useState } from 'react';
import PDFUpload from './PDFUpload';
import ChatInterface from './ChatInterface';

/**
 * ChatWithLLM
 *
 * Layout: left = PDFUpload, right = ChatInterface
 * State: collectionName is lifted here and passed to both children.
 *
 * Flow:
 *   1. User uploads a PDF → PDFUpload calls POST /upload-pdf
 *   2. On success, PDFUpload calls onIndexed(collectionName)
 *   3. collectionName flows into ChatInterface
 *   4. ChatInterface calls POST /query with that collection_name
 */
const ChatWithLLM = () => {
    const [collectionName, setCollectionName] = useState(null);

    return (
        <div
            className="w-screen h-[100vh] flex overflow-hidden"
            style={{ background: '#0d0d0f', fontFamily: "'DM Sans', sans-serif" }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap"
                rel="stylesheet"
            />

            {/* Left Side: PDF Upload */}
            <div className="h-full flex-1" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <PDFUpload onIndexed={setCollectionName} />
            </div>

            {/* Right Side: Chat Interface */}
            <div className="h-full flex-1">
                <ChatInterface collectionName={collectionName} />
            </div>
        </div>
    );
};

export default ChatWithLLM;