import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { TeacherSidebar } from "./TeacherSidebar";
import { Plus, Users, BookOpen, Calendar, Save } from "lucide-react";
import { useState } from "react";

interface ClassCreatePageProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function ClassCreatePage({ onNavigate, onLogout }: ClassCreatePageProps) {
  const [classInfo, setClassInfo] = useState({
    name: "",
    grade: "",
    subject: "수학",
    description: "",
    maxStudents: 20,
    startDate: "",
    endDate: "",
    schedule: "",
    inviteCode: ""
  });

  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const generateInviteCode = () => {
    setIsGeneratingCode(true);
    // 실제로는 서버에서 생성
    setTimeout(() => {
      const code = `CLASS${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      setClassInfo({...classInfo, inviteCode: code});
      setIsGeneratingCode(false);
    }, 1000);
  };

  const handleSave = () => {
    if (!classInfo.name || !classInfo.grade || !classInfo.inviteCode) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
    
    // 실제로는 API 호출로 반 생성
    alert(`반이 생성되었습니다!\n반명: ${classInfo.name}\n초대코드: ${classInfo.inviteCode}`);
    onNavigate('class-manage');
  };

  const handleCancel = () => {
    onNavigate('class-manage');
  };

  return (
    <div className="min-h-screen bg-white flex">
      <TeacherSidebar currentPage="class-create" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-black">새 반 만들기</h1>
              <p className="text-gray-600 mt-1">새로운 반을 생성하고 학생들을 초대하세요</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-4xl">
          <Card className="border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Plus className="w-5 h-5" />
                반 정보 입력
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-black font-medium">반 이름 *</Label>
                  <Input
                    id="name"
                    value={classInfo.name}
                    onChange={(e) => setClassInfo({...classInfo, name: e.target.value})}
                    placeholder="예: 중등 1반, 고등 2반"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-black font-medium">학년 *</Label>
                  <Input
                    id="grade"
                    value={classInfo.grade}
                    onChange={(e) => setClassInfo({...classInfo, grade: e.target.value})}
                    placeholder="예: 중1, 고2"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-black font-medium">과목</Label>
                  <Input
                    id="subject"
                    value={classInfo.subject}
                    onChange={(e) => setClassInfo({...classInfo, subject: e.target.value})}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStudents" className="text-black font-medium">최대 학생 수</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={classInfo.maxStudents}
                    onChange={(e) => setClassInfo({...classInfo, maxStudents: parseInt(e.target.value)})}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* 기간 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-black font-medium">시작일</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={classInfo.startDate}
                    onChange={(e) => setClassInfo({...classInfo, startDate: e.target.value})}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-black font-medium">종료일</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={classInfo.endDate}
                    onChange={(e) => setClassInfo({...classInfo, endDate: e.target.value})}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* 수업 일정 */}
              <div className="space-y-2">
                <Label htmlFor="schedule" className="text-black font-medium">수업 일정</Label>
                <Input
                  id="schedule"
                  value={classInfo.schedule}
                  onChange={(e) => setClassInfo({...classInfo, schedule: e.target.value})}
                  placeholder="예: 월, 수, 금 오후 3시"
                  className="border-2 border-gray-300 rounded-lg"
                />
              </div>

              {/* 반 설명 */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-black font-medium">반 설명</Label>
                <Textarea
                  id="description"
                  value={classInfo.description}
                  onChange={(e) => setClassInfo({...classInfo, description: e.target.value})}
                  placeholder="반에 대한 설명을 입력해주세요"
                  className="border-2 border-gray-300 rounded-lg min-h-20"
                />
              </div>

              {/* 초대 코드 */}
              <div className="space-y-2">
                <Label htmlFor="inviteCode" className="text-black font-medium">초대 코드 *</Label>
                <div className="flex gap-2">
                  <Input
                    id="inviteCode"
                    value={classInfo.inviteCode}
                    onChange={(e) => setClassInfo({...classInfo, inviteCode: e.target.value})}
                    placeholder="자동 생성 또는 직접 입력"
                    className="border-2 border-gray-300 rounded-lg flex-1"
                  />
                  <Button 
                    onClick={generateInviteCode}
                    disabled={isGeneratingCode}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    {isGeneratingCode ? "생성중..." : "자동 생성"}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">학생들이 이 코드로 반에 참여할 수 있습니다</p>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex gap-3 pt-6 border-t-2 border-gray-300">
                <Button 
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  반 생성하기
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleCancel}
                  className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 안내사항 */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">반 생성 안내</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 반이 생성되면 초대 코드가 발급됩니다</li>
                <li>• 학생들은 초대 코드를 사용해 반에 참여할 수 있습니다</li>
                <li>• 반 정보는 언제든지 수정할 수 있습니다</li>
                <li>• 생성된 반은 반 관리 페이지에서 확인할 수 있습니다</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
