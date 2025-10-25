import React from 'react';
import { Home, BookOpen, Gamepad2, Book, User, MapPin, Sword, LogOut } from 'lucide-react';

type StudentScreen = 'dashboard' | 'quest' | 'gacha' | 'collection' | 'profile' | 'battle';

interface StudentBottomNavProps {
  currentScreen: StudentScreen;
  onNavigate: (screen: StudentScreen) => void;
  onLogout?: () => void;
}

export function StudentBottomNav({ currentScreen, onNavigate, onLogout }: StudentBottomNavProps) {
  const navItems = [
    { id: 'dashboard' as StudentScreen, label: '홈', icon: Home },
    { id: 'quest' as StudentScreen, label: '퀘스트', icon: BookOpen },
    { id: 'gacha' as StudentScreen, label: '가챠', icon: Gamepad2 },
    { id: 'collection' as StudentScreen, label: '도감', icon: Book },
    { id: 'profile' as StudentScreen, label: '내정보', icon: User },
    { id: 'battle' as StudentScreen, label: '전투', icon: Sword },
  ];


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300">
      <div className="max-w-md mx-auto">
        <div className="flex gap-1 p-2 overflow-x-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconComponent size={20} />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
          
          {/* 로그아웃 버튼 */}
          <button
            onClick={() => onLogout && onLogout()}
            className="flex flex-col items-center justify-center py-2 px-3 rounded transition-all text-gray-600 hover:bg-red-100 hover:text-red-600 whitespace-nowrap"
          >
            <LogOut size={20} />
            <span className="text-xs mt-1">로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  );
}