import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useNavigate } from "react-router-dom";

export function RoleSelection() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            학습 관리 시스템
          </h1>
          <p className="text-lg text-gray-600">
            역할을 선택하여 시작하세요
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* 학생 선택 카드 */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-800 w-full h-full flex flex-col" onClick={() => navigate('/student/auth')}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800">학생</CardTitle>
              <CardDescription className="text-gray-600">
                퀘스트를 수행하고, 가챠를 돌며, 친구들과 배틀하세요!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-center">
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• 퀘스트 수행 및 보상 획득</li>
                <li>• 가챠로 새로운 캐릭터 수집</li>
                <li>• 레이드 수행</li>
                <li>• 개인 진도 및 성취도 확인</li>
              </ul>
            </CardContent>
          </Card>

          {/* 선생님 선택 카드 */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-800 w-full h-full flex flex-col" onClick={() => navigate('/teacher/login')}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800">선생님</CardTitle>
              <CardDescription className="text-gray-600">
                클래스를 관리하고, 퀘스트를 생성하며, 학생들을 지도하세요!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-center">
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• 클래스 및 학생 관리</li>
                <li>• 퀘스트 생성 및 승인</li>
                <li>• 레이드 생성 및 관리</li>
                <li>• 학생 진도 모니터링</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
