import React from 'react';

export function TableRowSkeleton() {
    return (
        <tr className="animate-pulse border-b border-gray-50">
            <td className="px-8 py-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-200 shrink-0" />
                    <div className="space-y-2 w-full">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                        <div className="h-3 bg-gray-100 rounded w-16 md:hidden" />
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="h-6 w-16 bg-gray-100 rounded-full" />
            </td>
            <td className="px-6 py-4">
                <div className="h-4 w-12 bg-gray-200 rounded" />
            </td>
            <td className="px-6 py-4 hidden md:table-cell">
                <div className="h-4 w-32 bg-gray-200 rounded" />
            </td>
            <td className="px-6 py-4 hidden md:table-cell">
                <div className="h-4 w-24 bg-gray-200 rounded" />
            </td>
            <td className="px-8 py-4 text-right">
                <div className="flex justify-end gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-xl" />
                    <div className="w-8 h-8 bg-gray-100 rounded-xl" />
                </div>
            </td>
        </tr>
    );
}

export function TableSkeleton({ count = 5 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <TableRowSkeleton key={i} />
            ))}
        </>
    );
}
