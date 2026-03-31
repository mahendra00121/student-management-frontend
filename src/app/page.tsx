'use client';

import React, { useEffect, useState } from 'react';
import {
  Users, GraduationCap, School, Award, TrendingUp,
  ArrowUpRight, ArrowDownRight, Calendar, UserPlus,
  CheckCircle2, XCircle, Clock, Banknote, PieChart, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import Link from 'next/link';

import { useRouter } from 'next/navigation';

const API_DASHBOARD = "http://localhost:5081/api/dashboard/stats";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(API_DASHBOARD)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load dashboard statistics");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex-1 p-8 flex items-center justify-center bg-gray-50/50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const totalFeesExpected = stats?.totalFeesExpected || 0;
  const totalFeesCollected = stats?.totalFeesCollected || 0;
  const feePending = totalFeesExpected - totalFeesCollected;
  const collectionPercentage = totalFeesExpected > 0 ? (totalFeesCollected / totalFeesExpected) * 100 : 0;

  const cards = [
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: GraduationCap, color: 'indigo', growth: '+12%' },
    { title: 'Total Teachers', value: stats?.totalTeachers || 0, icon: Users, color: 'emerald', growth: '+3%' },
    { title: 'Pending Fees', value: `₹${feePending.toLocaleString()}`, icon: Banknote, color: 'amber', growth: 'Due' },
    { title: 'Total Classes', value: stats?.totalClasses || 0, icon: School, color: 'rose', growth: 'Created' }
  ];    return (
        <div className="flex-1 flex flex-col h-full bg-[#fbfbfc] overflow-hidden font-sans">
            <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 max-w-7xl mx-auto w-full pb-20 custom-scrollbar">

                {/* Hero Greeting */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">System Overview</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest opacity-80">Real-time Performance & Metrics</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2.5 pr-6 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 group hover:shadow-indigo-500/5 transition-all">
                        <div className="bg-indigo-600 text-white p-3 rounded-2xl group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-indigo-500 tracking-[0.2em] mb-0.5">Today is</p>
                            <p className="text-sm font-black text-gray-900 leading-none">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {cards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-[0_4px_30px_-10px_rgba(0,0,0,0.03)] border border-gray-100 relative group overflow-hidden hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500"
                        >
                            <div className="flex justify-between items-start z-10 relative">
                                <div className={clsx(
                                    "p-4 rounded-2xl transition-all duration-500",
                                    card.color === 'indigo' ? "bg-indigo-600/5 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white" :
                                        card.color === 'emerald' ? "bg-emerald-600/5 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" :
                                            card.color === 'amber' ? "bg-amber-600/5 text-amber-600 group-hover:bg-amber-600 group-hover:text-white" :
                                                "bg-rose-600/5 text-rose-600 group-hover:bg-rose-600 group-hover:text-white"
                                )}>
                                    <card.icon className="w-6 h-6 stroke-[2.5px]" />
                                </div>
                                <span className={clsx(
                                    "text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest",
                                    card.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                                        card.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                            card.color === 'amber' ? "bg-amber-50 text-amber-600" :
                                                "bg-rose-50 text-rose-600"
                                )}>{card.growth}</span>
                            </div>

                            <div className="mt-8 relative z-10">
                                <h3 className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] leading-none mb-3">{card.title}</h3>
                                <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{card.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { label: 'Add Student', link: '/students', icon: UserPlus, color: 'indigo' },
                        { label: 'Add Teacher', link: '/teachers', icon: Users, color: 'emerald' },
                        { label: 'Attendence', link: '/attendance', icon: CheckCircle2, color: 'rose' },
                        { label: 'Fees', link: '/fees', icon: Banknote, color: 'amber' },
                    ].map((action, i) => (
                        <Link key={i} href={action.link} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 hover:-translate-y-1 transition-all group relative overflow-hidden">
                            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                                action.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                                    action.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                        action.color === 'rose' ? "bg-rose-50 text-rose-600" :
                                            "bg-amber-50 text-amber-600"
                            )}>
                                <action.icon className="w-5 h-5 stroke-[2.5px]" />
                            </div>
                            <span className="font-black text-gray-800 text-xs uppercase tracking-widest group-hover:text-indigo-600">{action.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

                    {/* Today's Attendance Widget */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-4 bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden h-[460px]"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                                    <Activity className="w-6 h-6 stroke-[2.5px]" />
                                </div>
                                Attendance
                            </h2>
                        </div>

                        <div className="flex-1 flex items-end justify-center gap-10 pb-6 pr-2">
                            {/* Present Bar */}
                            <div className="flex flex-col items-center gap-6 w-24 group">
                                <div className="text-center group-hover:-translate-y-1 transition-transform">
                                    <span className="text-4xl font-black text-gray-900 block tracking-tighter mb-1">
                                        {stats?.presentToday || 0}
                                    </span>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">Present</span>
                                </div>
                                <div className="w-16 bg-gray-50 rounded-3xl h-56 relative overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${stats?.totalStudents > 0 ? ((stats?.presentToday || 0) / stats.totalStudents) * 100 : 0}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-3xl shadow-lg shadow-emerald-500/20"
                                    />
                                </div>
                            </div>

                            {/* Absent Bar */}
                            <div className="flex flex-col items-center gap-6 w-24 group">
                                <div className="text-center group-hover:-translate-y-1 transition-transform">
                                    <span className="text-4xl font-black text-gray-900 block tracking-tighter mb-1">
                                        {stats?.absentToday || 0}
                                    </span>
                                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">Absent</span>
                                </div>
                                <div className="w-16 bg-gray-50 rounded-3xl h-56 relative overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${stats?.totalStudents > 0 ? ((stats?.absentToday || 0) / stats.totalStudents) * 100 : 0}%` }}
                                        transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-3xl shadow-lg shadow-rose-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50 flex justify-center">
                            <Link href="/attendance" className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em] group">
                                Full Report <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>


                    {/* Class Distribution Breakdown */}
                    <div className="lg:col-span-4 bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col h-[460px]">
                        <h2 className="text-2xl font-black text-gray-900 mb-10 tracking-tighter flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <PieChart className="w-6 h-6 stroke-[2.5px]" />
                            </div>
                            Capacity
                        </h2>

                        <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
                            {stats?.classWiseStudents?.length > 0 ? stats.classWiseStudents.map((c: any, i: number) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Class {c.className}</span>
                                        </div>
                                        <span className="text-xs font-black text-gray-400">{c.count}</span>
                                    </div>
                                    <div className="h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(c.count / stats.totalStudents) * 100}%` }}
                                            transition={{ duration: 1.2, ease: "backOut" }}
                                            className="h-full bg-indigo-600 rounded-full shadow-md shadow-indigo-600/10 group-hover:bg-indigo-500"
                                        />
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300 text-sm font-black uppercase tracking-widest italic opacity-40">
                                    Empty Data
                                </div>
                            )}
                        </div>

                        <div className="mt-10 p-6 rounded-[2rem] bg-[#0a0a0b] text-white flex items-center justify-between shadow-2xl shadow-indigo-900/10">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                    <School className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-0.5">Global Status</p>
                                    <p className="text-sm font-black tracking-tight">{stats?.totalStudents || 0} / 500 Enrolled</p>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Recent Admissions */}
                    <div className="lg:col-span-4 bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 h-[460px] flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <UserPlus className="w-6 h-6 stroke-[2.5px]" />
                                </div>
                                New Entry
                            </h2>
                            <Link href="/students" className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest">All</Link>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1">
                            {stats?.recentAdmissions?.length > 0 ? stats.recentAdmissions.map((s: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-gray-50/50 border border-transparent hover:bg-white hover:border-gray-100 hover:shadow-xl hover:shadow-gray-200/40 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs uppercase shadow-sm transition-all group-hover:scale-110 group-hover:rotate-6",
                                            i % 2 === 0 ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"
                                        )}>
                                            {s.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors text-sm tracking-tight">{s.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Class {s.class} • Roll {s.rollNo}</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 group-hover:scale-125 transition-all" />
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-100 rounded-[2rem] gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <p className="text-gray-300 font-black text-[10px] uppercase tracking-widest">No Admissions</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
