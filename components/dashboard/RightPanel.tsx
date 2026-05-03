"use client";
import { cn } from "@/lib/utils";
import { Bell, BookOpen } from "lucide-react";
import Image from "next/image";
import type { ReadingProgress, ReadingSession, User, Book } from "@/types";
import { useState, useRef, useEffect } from "react";

interface Props {
  currentBook: ReadingProgress | null;
  sessions: ReadingSession[];
  user: User;
  isMobile?: boolean;
  recentBooks?: Book[];
}

export function RightPanel({ currentBook, sessions, user, isMobile, recentBooks = [] }: Props) {
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const todayIndex = new Date().getDay();
  const [goalMins, setGoalMins] = useState(user.dailyGoalMins || 30);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Calculate today's minutes from sessions (session.duration is stored in seconds)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMins = Math.floor(sessions
    .filter(s => new Date(s.date) >= todayStart)
    .reduce((total, s) => total + s.duration, 0) / 60);

  const updateGoal = async () => {
    setIsEditingGoal(false);
    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, dailyGoalMins: goalMins })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate weekly activity data from actual sessions
  const activityData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const daySeconds = sessions
      .filter(s => new Date(s.date) >= d && new Date(s.date) < nextD)
      .reduce((total, s) => total + s.duration, 0);
      
    return Math.floor(daySeconds / 60);
  });
  const maxMins = Math.max(...activityData, 1);
  const heights = activityData.map(val => (val / maxMins) * 100);

  // Generate current week dates
  const currentWeekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - todayIndex + i);
    return d.getDate();
  });

  return (
    <aside className={cn(
      "space-y-6 bg-transparent",
      isMobile ? "w-full flex flex-col pb-12" : "w-80 h-screen sticky top-0 p-8"
    )}>
      
      {/* Header (Desktop only) */}
      {!isMobile && (
        <div className="flex justify-end items-center gap-4 relative">
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500 hover:text-black relative"
            >
              <Bell size={20} />
              {(goalMins - todayMins > 0 || recentBooks.length > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#F3EFE9]" />
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white shadow-xl border border-gray-100 rounded-2xl p-4 z-50">
                <h3 className="font-bold text-[#1D1D1F] mb-4 text-sm uppercase tracking-wider">Notifications</h3>
                
                <div className="space-y-4">
                  {/* Goal Notification */}
                  <div className="flex gap-3 items-start p-3 bg-[#F9F9F9] rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1D1D1F]">Daily Goal</p>
                      {todayMins >= goalMins ? (
                        <p className="text-xs text-gray-500 mt-0.5">Incredible! You've crushed your daily goal of {goalMins} mins. Keep going!</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-0.5">You are {goalMins - todayMins} mins away from hitting today's goal. Don't break your streak!</p>
                      )}
                    </div>
                  </div>

                  {/* Suggestions Notification */}
                  {recentBooks.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Suggested for you</p>
                      <div className="space-y-3">
                        {recentBooks.map(book => (
                          <div key={book.id} className="flex gap-3 items-center group cursor-pointer">
                            <div className="w-10 h-14 bg-gray-200 rounded overflow-hidden relative shrink-0">
                              {book.cover && <Image src={book.cover} alt="Cover" fill className="object-cover" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1D1D1F] group-hover:text-[#E85D5D] transition-colors line-clamp-1">{book.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">Added to library recently</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm bg-gray-200">
            {user.avatar ? (
               <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      )}

      {/* 1. Progress Card */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50 space-y-4">
        <h3 className="font-bold text-[10px] text-gray-400 uppercase tracking-[0.2em]">Reading Progress</h3>
        {currentBook ? (
          <div className="flex gap-4">
            <div className="relative w-12 h-16 shrink-0 rounded-md overflow-hidden shadow-sm border border-black/5 bg-orange-50">
              {currentBook.book.cover ? (
                <Image src={currentBook.book.cover} alt={currentBook.book.title} fill className="object-cover" sizes="48px" />
              ) : (
                <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-orange-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm leading-tight text-[#1D1D1F] truncate">{currentBook.book.title}</p>
              <p className="text-[10px] text-gray-400 font-bold truncate">{currentBook.book.author}</p>
              <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full transition-all duration-1000" style={{ width: `${(currentBook.currentPage / Math.max(1, currentBook.totalPages)) * 100}%` }}></div>
              </div>
              <p className="text-[9px] mt-1.5 text-gray-400 text-right font-black tracking-tighter">{currentBook.currentPage} / {currentBook.totalPages} PAGES</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No active reading session.</p>
        )}
      </div>

      {/* 2. Calendar Card */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50">
        <h3 className="font-bold text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-5">Reading Schedule</h3>
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((day, i) => (
            <span key={i} className="text-[10px] font-black text-gray-300 mb-2">{day}</span>
          ))}
          {[...Array(7)].map((_, i) => {
            const isToday = i === todayIndex;
            return (
              <div 
                key={i} 
                className={cn(
                  "py-2 text-xs rounded-full transition-all cursor-default font-semibold aspect-square flex items-center justify-center mx-auto w-6",
                  isToday 
                    ? "bg-[#D7D2C5] text-[#3A332C]" 
                    : "hover:bg-gray-50 text-gray-500"
                )}
              >
                {currentWeekDates[i]}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Activity Card */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[10px] text-gray-400 uppercase tracking-[0.2em]">Reading Activity</h3>
          <button 
            onClick={() => setIsEditingGoal(!isEditingGoal)}
            className="text-[9px] font-bold text-[#007AFF] uppercase tracking-wider hover:underline"
          >
            {isEditingGoal ? 'Save' : 'Edit Goal'}
          </button>
        </div>

        {isEditingGoal ? (
          <div className="flex items-center gap-2 mb-6">
            <input 
              type="number" 
              value={goalMins} 
              onChange={(e) => setGoalMins(Number(e.target.value))}
              className="w-16 p-1 text-xl font-black text-[#1D1D1F] border-b-2 border-black/10 focus:border-black outline-none bg-transparent"
              autoFocus
              onBlur={updateGoal}
              onKeyDown={(e) => e.key === 'Enter' && updateGoal()}
            />
            <span className="text-gray-400 font-bold text-xs uppercase tracking-tight">mins / day</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-4xl font-black text-[#1D1D1F]">{todayMins}</span>
            <span className="text-gray-400 font-bold text-xs uppercase tracking-tight">/ {goalMins} mins</span>
          </div>
        )}
        
        {/* Goal Progress Bar */}
        <div className="mb-6">
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-1000", todayMins >= goalMins ? "bg-green-500" : "bg-[#007AFF]")} 
              style={{ width: `${Math.min(100, (todayMins / Math.max(1, goalMins)) * 100)}%` }}
            ></div>
          </div>
          {todayMins >= goalMins && (
             <p className="text-[10px] font-bold text-green-500 mt-1.5">Daily goal reached! 🎉</p>
          )}
        </div>

        <div className="flex items-end gap-[4px] h-14 px-1">
          {heights.map((h, i) => (
            <div 
              key={i} 
              className={cn(
                "flex-1 rounded-t-[4px] transition-all duration-1000 ease-out",
                i === 6 ? "bg-[#D7D2C5] shadow-sm rounded-[4px]" : "bg-[#F3EFE9] hover:bg-[#E6E2D8]"
              )} 
              style={{ height: `${h}%` }}
            ></div>
          ))}
        </div>
      </div>
    </aside>
  );
}
