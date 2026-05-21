"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { LogOut, User, Edit3, X, Check, Camera, Loader2, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, storage } from "@/firebase/client";
import { signOut } from "firebase/auth";
import { removeSession, updateProfileData } from "@/lib/actions/auth.action";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";

export default function UserDropdown({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"menu" | "edit">("menu");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Edit State
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhotoURL, setEditPhotoURL] = useState(user?.photoURL || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setView("menu"); // Reset view when closing
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await removeSession();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size too large. Max 2MB.");
      return;
    }

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditPhotoURL(url);
      toast.success("Photo uploaded! Click save to apply.");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Upload failed. Verify storage permissions.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await updateProfileData(user.uid, { name: editName, photoURL: editPhotoURL });
      if (res.success) {
        toast.success("Profile updated!");
        setView("menu");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const firstName = user.name?.split(" ")[0] || "";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full glass-strong hover:ring-glow transition-all group"
      >
        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-secondary ring-1 ring-white/10 group-hover:ring-aurora/50 transition-all">
          {user.photoURL ? (
            <Image src={user.photoURL} alt={user.name} fill sizes="32px" unoptimized className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-aurora/20 text-aurora font-semibold">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-white group-hover:text-aurora transition-colors">
          Hi, {firstName}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 p-3 rounded-2xl glass-strong shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-200 z-50 border border-white/10">
          
          {view === "menu" ? (
            <div className="space-y-1">
              <div className="px-3 py-3 flex items-center gap-3 border-b border-white/5 mb-2">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-secondary ring-1 ring-white/10">
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt={user.name} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-aurora/20 text-aurora font-semibold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={() => setView("edit")}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground group-hover:text-aurora" />
                  <span>Profile Settings</span>
                </div>
                <ChevronLeft className="h-3.5 w-3.5 rotate-180 text-muted-foreground" />
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-pink-400 hover:bg-pink-500/10 rounded-xl transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={() => setView("menu")}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="text-sm font-semibold text-white">Edit Profile</h3>
              </div>

              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div 
                  className="relative h-20 w-20 rounded-full group cursor-pointer overflow-hidden border-2 border-white/10 hover:border-aurora/50 transition-all shadow-xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image 
                    src={editPhotoURL || "/avatars/default.png"} 
                    alt="Preview" 
                    fill 
                    unoptimized
                    className={`object-cover transition-all duration-500 ${isUploading ? 'opacity-30 blur-sm' : 'group-hover:scale-110 group-hover:brightness-50'}`} 
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white mb-1" />
                    <span className="text-[10px] font-bold text-white uppercase">Upload</span>
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="h-6 w-6 text-aurora animate-spin" />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Display Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 bg-secondary/50 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-aurora/50 transition-all"
                    placeholder="Your Name"
                  />
                </div>
                
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving || isUploading}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-aurora text-primary-foreground text-sm font-bold shadow-lg shadow-aurora/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
