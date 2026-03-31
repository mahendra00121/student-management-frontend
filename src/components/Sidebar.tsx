'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Users, GraduationCap, LayoutDashboard, Settings, LogOut,
    School, Book, Banknote, CalendarCheck, Award, X,
    ChevronRight, MoreVertical, ChevronLeft
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Classes', href: '/classes', icon: School },
    { name: 'Subjects', href: '/subjects', icon: Book },
    { name: 'Students', href: '/students', icon: GraduationCap },
    { name: 'Teachers', href: '/teachers', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck },
    { name: 'Exams & Results', href: '/exams', icon: Award },
    { name: 'Fees', href: '/fees', icon: Banknote },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        // Hydrate user from local storage
        try {
            const userData = localStorage.getItem("user");
            if (userData) setUser(JSON.parse(userData));
            else setUser({ name: "Admin User", email: "admin@school.com" }); // Fallback
        } catch {
            setUser({ name: "Admin User", email: "admin@school.com" });
        }
    }, []);

    const handleLogout = () => {
        toast.info("Logging out...", { duration: 1000 });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => {
            router.push('/login');
            toast.success("Logged out successfully");
        }, 1000);
    };

    const SidebarContent = ({ isMobile = false }) => (
        <div className={clsx(
            "flex flex-col h-full bg-white transition-all duration-300 relative",
            !isMobile && isCollapsed ? "w-[88px]" : "w-full",
            !isMobile ? "border-r border-gray-200/50 shadow-[0_0_40px_-15px_rgba(0,0,0,0.05)]" : ""
        )}>
            {/* Collapse Toggle Button (Desktop Only) */}
            {!isMobile && (
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-4 top-10 z-[100] bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 p-1.5 rounded-full shadow-lg hover:shadow-indigo-500/10 transition-all hover:scale-110 active:scale-95"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            )}

            {/* Logo Area */}
            <div className={clsx("p-6 flex items-center shrink-0 transition-all", isCollapsed && !isMobile ? "justify-center px-4" : "justify-between md:p-8 md:pb-6")}>
                <div className="flex items-center gap-4 group cursor-pointer overflow-hidden">
                    <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:rotate-6 transition-transform duration-300">
                            <GraduationCap className="w-6 h-6 fill-white/10" />
                        </div>
                        {(!isCollapsed || isMobile) && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>}
                    </div>
                    {(!isCollapsed || isMobile) && (
                        <div className="flex flex-col min-w-0 transition-all duration-300">
                            <span className="text-lg font-black tracking-tight text-gray-900 leading-tight truncate">Student </span>
                            <span className="text-[10px] font-bold text-indigo-500/70 uppercase tracking-[0.2em] mt-0.5 truncate"> Management System</span>
                        </div>
                    )}
                </div>
                {/* Close Button - Only Mobile */}
                <button
                    onClick={onClose}
                    className="md:hidden p-2 -mr-2 text-gray-400 hover:bg-gray-100/50 rounded-2xl transition-all active:scale-90"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
                {(!isCollapsed || isMobile) && (
                    <div className="px-5 mb-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] opacity-60">Main Menu</p>
                    </div>
                )}

                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link key={item.name} href={item.href} onClick={() => onClose?.()}>
                            <div className="relative group px-1" title={isCollapsed && !isMobile ? item.name : ''}>
                                <div
                                    className={clsx(
                                        "flex items-center gap-4 rounded-2xl transition-all duration-300 relative overflow-hidden",
                                        isCollapsed && !isMobile ? "justify-center px-0 py-4" : "px-4 py-4",
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                            : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                                    )}
                                >
                                    <item.icon
                                        className={clsx(
                                            "w-5 h-5 transition-all duration-300 shrink-0",
                                            isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-600 group-hover:scale-110",
                                            "stroke-[2px]"
                                        )}
                                    />
                                    {(!isCollapsed || isMobile) && (
                                        <>
                                            <span className="font-bold text-[14px] truncate flex-1">{item.name}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-dot"
                                                    className="w-1.5 h-1.5 rounded-full bg-white opacity-80"
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Bottom Actions */}
            <div className={clsx("p-4 md:p-6 shrink-0 border-t border-gray-100", isCollapsed && !isMobile ? "flex flex-col items-center" : "")}>
                <div className={clsx(
                    "rounded-3xl flex items-center group transition-all duration-300",
                    isCollapsed && !isMobile ? "p-1 justify-center" : "p-3 bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200 justify-between"
                )}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5 shrink-0 shadow-md">
                            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-xs font-black text-indigo-600 uppercase">
                                {user?.name?.slice(0, 2) || 'AD'}
                            </div>
                        </div>
                        {(!isCollapsed || isMobile) && (
                            <div className="flex flex-col min-w-0 transition-all duration-300">
                                <span className="text-sm font-black text-gray-900 truncate max-w-[100px] leading-tight">{user?.name}</span>
                                <span className="text-[10px] font-bold text-gray-400 truncate max-w-[100px]">{user?.email}</span>
                            </div>
                        )}
                    </div>

                    {(!isCollapsed || isMobile) && (
                        <button
                            onClick={handleLogout}
                            className="p-2.5 rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {(!isCollapsed || isMobile) && (
                    <div className="mt-6 flex gap-3 justify-center text-[10px] font-black text-gray-300 uppercase tracking-widest opacity-60">
                        <Link href="#" className="hover:text-indigo-600 transition-colors">Help</Link>
                        <span>•</span>
                        <Link href="#" className="hover:text-indigo-600 transition-colors">Privacy</Link>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={clsx(
                "h-screen hidden md:block sticky top-0 z-40 transition-all duration-300",
                isCollapsed ? "w-[88px]" : "w-[280px]"
            )}>
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar (Slide-over) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/30 z-[50] md:hidden backdrop-blur-[2px]"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[60] md:hidden shadow-2xl"
                        >
                            <SidebarContent isMobile={true} />
                            {/* Decorative element for mobile menu */}
                            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 opacity-50"></div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
