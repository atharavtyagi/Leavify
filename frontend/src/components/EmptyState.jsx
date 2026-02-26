import React from 'react';
import { ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';

const EmptyState = ({ title = "No Data Found", message = "There is currently no data to display here." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-slate-100 dark:bg-zinc-800/50 p-6 rounded-full mb-6">
                <ArchiveBoxXMarkIcon className="w-12 h-12 text-slate-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-zinc-200 mb-2">{title}</h3>
            <p className="text-slate-500 dark:text-zinc-400 text-center max-w-sm">{message}</p>
        </div>
    );
};

export default EmptyState;
