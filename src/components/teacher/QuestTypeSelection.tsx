import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Users, User, Plus } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function QuestTypeSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'individual') {
      navigate('/teacher/quest/individual', { replace: true });
    } else if (tab === 'group') {
      navigate('/teacher/quest/group', { replace: true });
    }
  }, [location.search, navigate]);
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4 md:px-6 md:py-5 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">퀘스트 등록</h1>
          <p className="text-sm text-gray-500 mt-1">등록할 퀘스트의 유형을 선택해주세요.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* 개인 퀘스트 */}
            <Card className="border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-default">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <User className="w-6 h-6 text-blue-600" />
                  개인 퀘스트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 text-sm leading-relaxed">
                  특정 학생에게만 할당되는 개별 퀘스트입니다.
                  학생의 수준에 맞는 맞춤형 과제를 부여할 때 사용합니다.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> 개별 학생 선택 가능
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> 맞춤형 난이도 및 보상
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> AI 보상 추천 지원
                    </li>
                  </ul>
                </div>
                <Button
                  className="w-full bg-black hover:bg-gray-800 text-white"
                  onClick={() => navigate('/teacher/quest/individual')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  개인 퀘스트 등록
                </Button>
              </CardContent>
            </Card>

            {/* 단체 퀘스트 */}
            <Card className="border border-gray-200 shadow-sm hover:border-green-400 hover:shadow-md transition-all cursor-default">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Users className="w-6 h-6 text-green-600" />
                  단체 퀘스트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 text-sm leading-relaxed">
                  반 전체 학생에게 할당되는 공통 퀘스트입니다.
                  학급 전체의 목표 달성을 독려할 때 사용합니다.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full" /> 반 전체 자동 할당
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full" /> 공동 목표 달성률 추적
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full" /> 템플릿 기반 빠른 생성
                    </li>
                  </ul>
                </div>
                <Button
                  className="w-full bg-black hover:bg-gray-800 text-white"
                  onClick={() => navigate('/teacher/quest/group')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  단체 퀘스트 등록
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
