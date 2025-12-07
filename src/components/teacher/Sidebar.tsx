import { Button } from "../ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Plus,
  Users,
  Swords,
  CheckCircle,
  Menu,
  LogOut,
  X
} from "lucide-react";
import { useAuth } from "../../contexts/AppContext";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  // 홈 페이지에서는 홈만 표시
  const homeNavItems = [
    { id: '/teacher/dashboard', label: '홈', icon: Home },
  ];

  // 다른 페이지에서는 모든 메뉴 표시
  const allNavItems = [
    { id: '/teacher/dashboard', label: '홈', icon: Home },
    { id: '/teacher/class', label: '반 관리', icon: Users },
    { id: '/teacher/quest', label: '퀘스트 등록', icon: Plus },
    { id: '/teacher/raid/create', label: '레이드 등록', icon: Swords },
    { id: '/teacher/quest/approval', label: '퀘스트 승인', icon: CheckCircle },
  ];

  const isDashboard = location.pathname === '/teacher/dashboard';
  const navItems = isDashboard ? homeNavItems : allNavItems;

  const handleNavClick = (path: string) => {
    navigate(path);
    if (onMobileClose) onMobileClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    if (onMobileClose) onMobileClose();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r-2 border-gray-300">
      {/* 헤더: 모바일에서만 닫기 버튼 표시 */}
      <div className="p-4 border-b-2 border-gray-300 flex justify-between items-center h-14 shrink-0">
        <span className="font-bold text-lg">메뉴</span>
        {/* 모바일 전용 닫기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* 메뉴 목록 */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start rounded-none h-10 px-3 ${isActive
                ? 'bg-black text-white hover:bg-gray-800'
                : 'hover:bg-gray-100'
                }`}
              onClick={() => handleNavClick(item.id)}
            >
              <Icon className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* 푸터: 로그아웃 */}
      <div className="p-4 border-t-2 border-gray-300 shrink-0">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-none text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2 shrink-0" />
          로그아웃
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: md 이상에서 항상 보임, 고정 너비 */}
      <div className="hidden md:block w-64 shrink-0 h-full">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay: md 미만에서 조건부 렌더링 */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}