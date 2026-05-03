"use client";
import { MoreHorizontal, Check } from "lucide-react";

export function ReaderFriends() {
  const friends = [
    {
      id: 1,
      name: "Roberto Jordan",
      avatar: "https://ui-avatars.com/api/?name=Roberto+Jordan&background=random",
      text: "An exceptionally crafted chapter that masterfully transports the reader into the heart of the wizarding world.",
      chapter: "Chapter Five: Diagon Alley",
      time: "2 min ago"
    },
    {
      id: 2,
      name: "Anna Henry",
      avatar: "https://ui-avatars.com/api/?name=Anna+Henry&background=random",
      text: "I concluded this chapter yesterday evening; the narrative execution was truly breathtaking.",
      chapter: "Chapter Four: The Keeper of the Keys",
      time: "1 hour ago"
    }
  ];

  return (
    <div className="bg-transparent border-t border-gray-100 pt-10 mt-10">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-3xl font-serif font-semibold text-black tracking-tight">Reader Friends</h3>
        <button className="text-gray-400 hover:text-black transition-colors p-2 -mr-2">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      <div className="relative">
        {/* Vertical dotted line */}
        <div className="absolute left-7 top-4 bottom-4 w-px border-l-2 border-dotted border-gray-200"></div>

        <div className="space-y-10 relative">
          {friends.map((friend) => (
            <div key={friend.id} className="flex gap-6">
              <div className="relative z-10 shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-lg bg-white ring-4 ring-gray-50">
                  <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h4 className="text-sm font-bold text-black mb-2">{friend.name}</h4>
                <p className="text-xs text-gray-500 italic leading-relaxed mb-4">
                  &ldquo;{friend.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#007AFF] text-[11px] font-bold">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    {friend.chapter}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{friend.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
