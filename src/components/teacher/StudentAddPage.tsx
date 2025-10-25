import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { TeacherSidebar } from "./TeacherSidebar";
import { ArrowLeft, UserPlus, Save, Mail, Phone, User } from "lucide-react";
import { useState } from "react";

interface StudentAddPageProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function StudentAddPage({ onNavigate, onLogout }: StudentAddPageProps) {
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    parentPhone: "",
    grade: "",
    school: "",
    notes: ""
  });

  const [isAdding, setIsAdding] = useState(false);

  const handleSave = () => {
    if (!studentInfo.name || !studentInfo.username || !studentInfo.email) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
    
    setIsAdding(true);
    // 실제로는 API 호출로 학생 추가
    setTimeout(() => {
      alert(`학생이 추가되었습니다!\n이름: ${studentInfo.name}\n사용자명: ${studentInfo.username}`);
      setIsAdding(false);
      onNavigate('student-list');
    }, 1000);
  };

  const handleCancel = () => {
    onNavigate('student-list');
  };

  return (
    <div className="min-h-screen bg-white flex">
      <TeacherSidebar currentPage="class-list" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-black">학생 추가</h1>
              <p className="text-gray-600 mt-1">새로운 학생을 반에 추가합니다</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-4xl">
          <Card className="border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <UserPlus className="w-5 h-5" />
                학생 정보 입력
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-black font-medium">이름 *</Label>
                  <Input
                    id="name"
                    value={studentInfo.name}
                    onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                    placeholder="학생의 실명을 입력하세요"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-black font-medium">사용자명 *</Label>
                  <Input
                    id="username"
                    value={studentInfo.username}
                    onChange={(e) => setStudentInfo({...studentInfo, username: e.target.value})}
                    placeholder="게임 내 사용할 닉네임"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black font-medium">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={studentInfo.email}
                    onChange={(e) => setStudentInfo({...studentInfo, email: e.target.value})}
                    placeholder="student@example.com"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-black font-medium">학생 연락처</Label>
                  <Input
                    id="phone"
                    value={studentInfo.phone}
                    onChange={(e) => setStudentInfo({...studentInfo, phone: e.target.value})}
                    placeholder="010-1234-5678"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentPhone" className="text-black font-medium">보호자 연락처</Label>
                  <Input
                    id="parentPhone"
                    value={studentInfo.parentPhone}
                    onChange={(e) => setStudentInfo({...studentInfo, parentPhone: e.target.value})}
                    placeholder="010-1234-5678"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-black font-medium">학년</Label>
                  <Input
                    id="grade"
                    value={studentInfo.grade}
                    onChange={(e) => setStudentInfo({...studentInfo, grade: e.target.value})}
                    placeholder="예: 중1, 고2"
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* 학교 정보 */}
              <div className="space-y-2">
                <Label htmlFor="school" className="text-black font-medium">학교</Label>
                <Input
                  id="school"
                  value={studentInfo.school}
                  onChange={(e) => setStudentInfo({...studentInfo, school: e.target.value})}
                  placeholder="학교명을 입력하세요"
                  className="border-2 border-gray-300 rounded-lg"
                />
              </div>

              {/* 특이사항 */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-black font-medium">특이사항</Label>
                <Textarea
                  id="notes"
                  value={studentInfo.notes}
                  onChange={(e) => setStudentInfo({...studentInfo, notes: e.target.value})}
                  placeholder="학생에 대한 특이사항이나 메모를 입력하세요"
                  className="border-2 border-gray-300 rounded-lg min-h-20"
                />
              </div>

              {/* 액션 버튼들 */}
              <div className="flex gap-3 pt-6 border-t-2 border-gray-300">
                <Button 
                  onClick={handleSave}
                  disabled={isAdding}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isAdding ? "추가 중..." : "학생 추가"}
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
          <Card className="mt-6 bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-green-900 mb-2">학생 추가 안내</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 학생이 추가되면 자동으로 초대 코드가 발송됩니다</li>
                <li>• 학생은 이메일로 받은 초대 코드로 가입할 수 있습니다</li>
                <li>• 학생 정보는 언제든지 수정할 수 있습니다</li>
                <li>• 추가된 학생은 학생 목록에서 확인할 수 있습니다</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
