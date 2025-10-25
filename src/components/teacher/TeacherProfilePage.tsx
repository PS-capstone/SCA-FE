import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { TeacherSidebar } from "./TeacherSidebar";
import { ArrowLeft, Save, User, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

interface TeacherProfilePageProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function TeacherProfilePage({ onNavigate, onLogout }: TeacherProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "김선생",
    email: "teacher@sca.com",
    phone: "010-1234-5678",
    school: "SCA 수학학원",
    subject: "수학",
    experience: "5년",
    address: "서울시 강남구 테헤란로 123",
    bio: "열정적인 수학 선생님입니다. 학생들의 성장을 돕는 것이 제 일입니다."
  });

  const handleSave = () => {
    setIsEditing(false);
    // 실제로는 API 호출로 데이터 저장
    alert("회원정보가 수정되었습니다.");
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 변경사항 되돌리기
  };

  return (
    <div className="min-h-screen bg-white flex">
      <TeacherSidebar currentPage="profile" onNavigate={onNavigate} onLogout={onLogout} />
      
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
              <h1 className="text-2xl font-bold text-black">회원정보 수정</h1>
              <p className="text-gray-600 mt-1">개인정보를 수정할 수 있습니다</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-4xl">
          <Card className="border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <User className="w-5 h-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 프로필 이미지 */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <Button 
                    variant="outline"
                    className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                    disabled={!isEditing}
                  >
                    사진 변경
                  </Button>
                  <p className="text-sm text-gray-600 mt-1">JPG, PNG 파일만 업로드 가능</p>
                </div>
              </div>

              {/* 기본 정보 폼 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-black font-medium">이름</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    disabled={!isEditing}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black font-medium">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    disabled={!isEditing}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-black font-medium">전화번호</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    disabled={!isEditing}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school" className="text-black font-medium">소속 학원</Label>
                  <Input
                    id="school"
                    value={profile.school}
                    onChange={(e) => setProfile({...profile, school: e.target.value})}
                    disabled={!isEditing}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-black font-medium">담당 과목</Label>
                  <Input
                    id="subject"
                    value={profile.subject}
                    onChange={(e) => setProfile({...profile, subject: e.target.value})}
                    disabled={!isEditing}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-black font-medium">경력</Label>
                  <Input
                    id="experience"
                    value={profile.experience}
                    onChange={(e) => setProfile({...profile, experience: e.target.value})}
                    disabled={!isEditing}
                    className="border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* 주소 */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-black font-medium">주소</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  disabled={!isEditing}
                  className="border-2 border-gray-300 rounded-lg"
                />
              </div>

              {/* 자기소개 */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-black font-medium">자기소개</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  disabled={!isEditing}
                  className="border-2 border-gray-300 rounded-lg min-h-24"
                  placeholder="자기소개를 입력해주세요"
                />
              </div>

              {/* 액션 버튼들 */}
              <div className="flex gap-3 pt-6 border-t-2 border-gray-300">
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-black hover:bg-gray-800 text-white rounded-lg"
                  >
                    <User className="w-4 h-4 mr-2" />
                    정보 수정
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      저장하기
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleCancel}
                      className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      취소
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
