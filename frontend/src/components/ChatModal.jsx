import React from 'react';
import ChatPanel from './ChatPanel';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ChatModal = ({ isOpen, onClose, contextType, contextId, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-900/60 backdrop-blur-sm"
                    onClick={onClose}
                ></div>

                <div className="inline-block w-full max-w-2xl text-left align-middle transition-all transform bg-[#f3f4f6] dark:bg-[#1a1a20] shadow-2xl rounded-3xl border border-white/40 dark:border-white/5 relative z-10 h-[80vh] flex flex-col">

                    <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-white/10 shrink-0">
                        <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                            {title || 'Discussion'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden p-4 bg-white dark:bg-[#0f0f11] rounded-b-3xl">
                        {/* We inject the internal chat panel here, letting it take up the rest of the modal */}
                        <ChatPanel contextType={contextType} contextId={contextId} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
