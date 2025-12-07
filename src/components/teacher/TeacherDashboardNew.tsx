import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Plus, Settings, Users } from "lucide-react";
import { ClassCard } from "../common/ClassCard";
import { useAuth, TeacherUser } from '../../contexts/AppContext';
import { get } from '../../utils/api';

interface classItem {
  class_id: number | string;
  class_name: string;
  student_count: number;
  pending_quests: number;
}

export function TeacherDashboardNew() {
  const navigate = useNavigate();

  const { user, isAuthenticated, userType, setCurrentClass } = useAuth();
  const [classes, setClasses] = useState<classItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    //로그인 여부 확인
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    if (userType !== 'teacher') {
      setIsLoading(false);
      setError("교사 전용 페이지입니다.");
      return;
    }

    // 반 목록을 불러오는 비동기 함수
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        // api.ts의 get 함수 사용 - 자동으로 Authorization 헤더에 Bearer token 추가
        const response = await get('/api/v1/classes');

        if (!response.ok) {
          throw new Error('반 목록을 불러오는 데 실패했습니다.');
        }

        const data = await response.json();
        console.log("API Response:", data);
        const mappedClasses = (data.data.classes || []).map((item: any) => ({
          class_id: item.class_id,
          class_name: item.class_name,
          student_count: item.student_count,
          pending_quests: item.pending_quests ?? item.waiting_quest_count ?? 0
        }));

        setClasses(mappedClasses);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("알 수 없는 에러가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [isAuthenticated, user, userType]);

  // 인증 가드 및 로딩/에러 상태에 따른 UI 분기 처리
  if (!isAuthenticated || !user) return <div className="p-6">로딩중...</div>;
  if (userType !== 'teacher') return <div className="p-6 text-red-600">접근 권한이 없습니다.</div>;
  if (isLoading) return <div className="p-6">반 목록을 불러오는 중...</div>;
  if (error) return <div className="p-6 text-red-600">오류: {error}</div>;

  const currentUser = user as TeacherUser;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4 md:px-6 md:py-5 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">{currentUser.real_name} 선생님, 환영합니다.</p>
        </div>
        <Button
          variant="outline"
          className="sm:w-auto border-gray-200 hover:bg-gray-50"
          onClick={() => navigate('/teacher/profile')}
        >
          <Settings className="w-4 h-4 mr-2" />
          회원정보 수정
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">나의 반 목록</h3>
          <Button
            className="sm:w-auto bg-black hover:bg-gray-800 text-white shadow-sm"
            onClick={() => navigate('/teacher/class/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            반 생성하기
          </Button>
        </div>

        {/* Responsive Grid Layout */}
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div key={classItem.class_id} className="h-full">
                <ClassCard
                  class_id={Number(classItem.class_id)}
                  class_name={classItem.class_name}
                  student_count={classItem.student_count}
                  pending_quests={classItem.pending_quests}
                  onClick={() => {
                    const classId = String(classItem.class_id);
                    if (setCurrentClass) {
                      setCurrentClass(classId);
                    }
                    navigate(`/teacher/class/${classItem.class_id}`);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 text-center mb-4">
              생성된 반이 없습니다.<br/>
              새로운 반을 만들어 학생들을 관리해보세요.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/teacher/class/create')}
            >
              첫 반 만들기
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}