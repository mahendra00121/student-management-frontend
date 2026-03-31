"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight, User, GraduationCap, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

export default function AuthPage() {
    const router = useRouter();
    const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
    const [loading, setLoading] = useState(false);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let endpoint = "";
            let body = {};

            if (authMode === "forgot") {
                endpoint = "/api/auth/reset-password";
                body = { email, newPassword: password };
            } else if (authMode === "login") {
                endpoint = "/api/auth/login";
                body = { email, password };
            } else {
                endpoint = "/api/auth/register";
                body = { name, email, password };
            }

            const res = await fetch(`http://localhost:5081${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                // If the response is not JSON, it might help to log it or handle it gracefully
                data = { message: text || res.statusText };
            }

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            if (authMode === "forgot") {
                toast.success("Password reset!", { description: "You can now login with your new password." });
                setAuthMode("login");
                setPassword("");
            } else if (authMode === "login") {
                toast.success("Welcome back!", { description: "Successfully logged in to Student Management System." });
                localStorage.setItem("token", data.token);
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                }
                router.push("/");
            } else {
                toast.success("Account created!", { description: "Please sign in with your new account." });
                setAuthMode("login");
                setName("");
                setPassword("");
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Action Failed", {
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
            {/* Left Section - Hero/Brand */}
            <div className="hidden lg:flex w-[45%] relative bg-[#0a0a0b] overflow-hidden flex-col justify-between p-16 text-white shrink-0">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[100px] animate-pulse delay-1000"></div>

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-20 group cursor-default">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <GraduationCap className="w-7 h-7 text-white fill-white/10" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tighter">Student Management</span>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] -mt-1">System</span>
                        </div>
                    </div>

                    <motion.div
                        key={authMode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        <h1 className="text-6xl font-black leading-[1.05] tracking-tighter">
                            {authMode === "register" ? "Build your academic future." : "Your workspace, simplified."}
                        </h1>
                        <p className="text-xl text-gray-400 max-w-md leading-relaxed font-medium">
                            The next generation of institutional management. Efficient, secure, and built for speed.
                        </p>
                    </motion.div>
                </div>

                <div className="relative z-10 flex flex-col gap-8">
                    <div className="flex gap-4">
                        {[
                            { label: "Secure", icon: Lock },
                            { label: "Real-time", icon: Sparkles },
                            { label: "Scalable", icon: CheckCircle2 }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-indigo-200 shadow-sm">
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Section - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/50 relative">
                {/* Decorative background for mobile */}
                <div className="lg:hidden absolute inset-0 bg-[#0a0a0b] -z-10"></div>
                <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -z-10 animate-pulse"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[440px] bg-white p-10 sm:p-12 rounded-[2.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-gray-100 relative"
                >
                    {/* Floating Tab Switcher */}
                    <div className="absolute -top-14 left-0 right-0 flex justify-center lg:justify-start">
                        <div className="bg-white/90 backdrop-blur-xl p-1.5 rounded-[1.25rem] inline-flex shadow-xl shadow-black/5 border border-gray-200/50">
                            {(['login', 'register'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => { setAuthMode(mode); setEmail(""); setPassword(""); setName(""); }}
                                    className={clsx(
                                        "px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                                        authMode === mode
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 px-10"
                                            : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                                    )}
                                >
                                    {mode === "login" ? "Sign In" : "Register"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-left mb-10">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
                            {authMode === "forgot" ? "Reset Access" : (authMode === "login" ? "Welcome Back" : "Get Started")}
                        </h2>
                        <p className="mt-2.5 text-sm font-medium text-gray-400">
                            {authMode === "forgot"
                                ? "Enter your email to restore your account access."
                                : (authMode === "login" ? "Welcome back! Please enter your details." : "Join our platform and manage your school with ease.")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="popLayout">
                            {authMode === "register" && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, y: -20 }}
                                    animate={{ height: "auto", opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: -20 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-[0.2em]">Full Name</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-medium"
                                                placeholder="John Doe"
                                                required={authMode === "register"}
                                            />
                                            <User className="absolute right-5 top-4.5 h-5 w-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-[0.2em]">Email Address</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-medium"
                                    placeholder="admin@school.com"
                                    required
                                />
                                <Mail className="absolute right-5 top-4.5 h-5 w-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-[0.2em]">
                                    {authMode === "forgot" ? "New Password" : "Password"}
                                </label>
                                {authMode === "login" && (
                                    <button
                                        type="button"
                                        onClick={() => setAuthMode("forgot")}
                                        className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                                    >
                                        Forgot?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-4.5 text-gray-300 hover:text-gray-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-5 px-6 bg-[#0a0a0b] hover:bg-black text-white rounded-2xl shadow-xl shadow-black/10 font-black uppercase tracking-[0.15em] text-xs transition-all disabled:opacity-70 disabled:cursor-not-allowed gap-3 mt-10"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {authMode === "forgot" ? "Reset Password" : (authMode === "login" ? "Sign In" : "Register")}
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </motion.button>

                        {authMode === "forgot" && (
                            <button
                                type="button"
                                onClick={() => { setAuthMode("login"); setPassword(""); }}
                                className="w-full text-center text-[10px] font-black text-gray-400 hover:text-gray-900 transition-colors mt-6 uppercase tracking-widest"
                            >
                                ← Back to Sign In
                            </button>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
