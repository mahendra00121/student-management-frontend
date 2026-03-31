'use client';

import { Menu, GraduationCap, Bell } from 'lucide-react';

interface MobileHeaderProps {
    onOpenSidebar: () => void;
}

export default function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
    return (
        <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={onOpenSidebar}
                    className="p-2 -ml-2 text-gray-900 bg-gray-50 rounded-xl transition-all active:scale-90"
                >
                    <Menu className="w-5 h-5 stroke-[2.5px]" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <GraduationCap className="w-5 h-5 fill-white/10" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 tracking-tight leading-none">Student Mgmt</span>
                        <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">System</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 rounded-xl transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5 shadow-md">
                    <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase">
                        AD
                    </div>
                </div>
            </div>
        </header>
    );
}
