import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

interface TeacherLoginPageNewProps {
  onNavigate: (page: string) => void;
}

export function TeacherLoginPageNew({ onNavigate }: TeacherLoginPageNewProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-gray-300">
        <CardHeader className="border-b-2 border-gray-300">
          <CardTitle className="text-center">선생님 로그인</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="teacher-id">아이디</Label>
            <Input 
              id="teacher-id" 
              placeholder="아이디를 입력하세요"
              className="border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="비밀번호를 입력하세요"
              className="border-2 border-gray-300 rounded-lg"
            />
          </div>

          <Button 
            className="w-full bg-black hover:bg-gray-800 text-white rounded-lg h-12"
            onClick={() => onNavigate('teacher-dashboard-new')}
          >
            로그인
          </Button>

          <div className="text-center pt-2">
            <Button 
              variant="link" 
              onClick={() => onNavigate('teacher-signup-new')}
              className="text-black underline"
            >
              회원가입하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}