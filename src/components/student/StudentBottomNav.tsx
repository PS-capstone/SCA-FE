import React from 'react';
import { Home, BookOpen, Gamepad2, Book, Sword, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AppContext';

const BUTTON_RAISED = "inset -1px -1px var(--box-shadow), inset 1px 1px var(--color-white), inset -2px -2px var(--button-shadow), inset 2px 2px var(--border-top)";
const BUTTON_SUNKEN = "inset -1px -1px var(--color-white), inset 1px 1px var(--box-shadow), inset -2px -2px var(--border-top), inset 2px 2px var(--button-shadow)";

type StudentScreen = 'dashboard' | 'quest' | 'gacha' | 'collection' | 'raid';

export function StudentBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const navItems = [
    { id: 'dashboard' as StudentScreen, label: '홈', icon: Home, path: '/student/dashboard' },
    { id: 'quest' as StudentScreen, label: '퀘스트', icon: BookOpen, path: '/student/quests' },
    { id: 'gacha' as StudentScreen, label: '가챠', icon: Gamepad2, path: '/student/gacha' },
    { id: 'collection' as StudentScreen, label: '도감', icon: Book, path: '/student/collection' },
    { id: 'raid' as StudentScreen, label: '레이드', icon: Sword, path: '/student/raid' },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0"
      style={{
        backgroundColor: "var(--bg-gray)",
        borderTop: "2px solid var(--border-top)",
        boxShadow: "0 -1px 0 var(--box-shadow)",
        padding: "6px",
        zIndex: 100
      }}
    >
      <div className="max-w-lg mx-auto">
        <div className="flex gap-1 p-2 overflow-x-auto no-scrollbar" style={{ paddingBottom: "2px" }}>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center h-12 min-w-5 p-1 m-0 cursor-pointer whitespace-nowrap`}
                style={{ 
                  flex: "1 0 auto",
                  border: "none",
                  outline: "none",
                  boxShadow: isActive ? BUTTON_SUNKEN : BUTTON_RAISED, 
                  backgroundColor: isActive ? "var(--border-top)" : "var(--bg-gray)", 
                  transform: isActive ? "translate(1px, 1px)" : "none", 
                }}
              >
                <IconComponent size={20} className="mb-1" style={{color: "var(--text-color)"}} />
                <span className="text-xs mt-1" style={{ fontWeight: isActive ? "bold" : "normal", color: "var(--text-color)" }}>{item.label}</span>
              </button>
            );
          })}

          <div style={{ width: "2px", borderLeft: "1px solid var(--button-shadow)", borderRight: "1px solid var(--color-white)", margin: "0 4px" }}></div>

          {/* 로그아웃 버튼 */}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex flex-col items-center justify-center h-12 min-w-10 p-1 cursor-pointer whitespace-nowrap"
            style={{ boxShadow: BUTTON_RAISED, backgroundColor: "var(--bg-gray)", border: 'none' }}
          >
            <LogOut size={20} style={{ color: "#d32f2f", marginBottom: "4px" }} />
            <span style={{ fontSize: "11px", color: "#d32f2f" }}>로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  );
}