import { Button } from "../ui/button";
import { 
  Home, 
  Plus, 
  Users, 
  Swords, 
  CheckCircle,
  Menu,
  LogOut
} from "lucide-react";
import { useState } from "react";

interface TeacherSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function TeacherSidebar({ currentPage, onNavigate, onLogout }: TeacherSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  // 홈 페이지에서는 홈만 표시
  const homeNavItems = [
    { id: 'dashboard', label: '홈', icon: Home },
  ];

  // 다른 페이지에서는 모든 메뉴 표시
  const allNavItems = [
    { id: 'dashboard', label: '홈', icon: Home },
    { id: 'quest-create-new', label: '퀘스트 등록', icon: Plus },
    { id: 'class-list', label: '반 관리', icon: Users },
    { id: 'raid-create-new', label: '레이드 등록', icon: Swords },
    { id: 'quest-approval-new', label: '퀘스트 승인', icon: CheckCircle },
  ];

  // 현재 페이지에 따라 네비게이션 아이템 결정
  const navItems = currentPage === 'dashboard' ? homeNavItems : allNavItems;

  return (
    <div className={`bg-white border-r-2 border-gray-300 transition-all ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 border-b-2 border-gray-300">
        <div className="flex items-center justify-between">
          {!collapsed && <h2>SCA 수학학원</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="border border-gray-300 hover:bg-gray-100"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col h-full">
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || 
                            (item.id === 'dashboard' && currentPage.includes('teacher-dashboard'));
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start rounded-none ${
                  isActive 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'hover:bg-gray-100 border border-transparent hover:border-gray-300'
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {!collapsed && item.label}
              </Button>
            );
          })}
        </nav>
        
        {/* Logout Button at Bottom */}
        {onLogout && (
          <div className="p-4 border-t-2 border-gray-300">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-none text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-300"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {!collapsed && "로그아웃"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}