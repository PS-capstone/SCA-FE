import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { ArrowLeft } from "lucide-react";

interface TeacherSignupPageNewProps {
  onNavigate: (page: string) => void;
}

export function TeacherSignupPageNew({ onNavigate }: TeacherSignupPageNewProps) {
  const [agreed, setAgreed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = () => {
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!agreed) {
      alert("서비스 이용약관에 동의해주세요.");
      return;
    }
    onNavigate('teacher-dashboard-new');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-gray-300">
        <CardHeader className="border-b-2 border-gray-300 relative">
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute left-4 top-4 border border-gray-300 hover:bg-gray-100"
            onClick={() => onNavigate('login')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-center pt-8">선생님 회원가입</CardTitle>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">비밀번호 확인</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-2 border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-start space-x-2 pt-4 border-t-2 border-gray-300">
            <Checkbox 
              id="terms" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="border-2 border-gray-300 rounded-lg mt-1"
            />
            <div className="space-y-1">
              <Label 
                htmlFor="terms" 
                className="cursor-pointer leading-none"
              >
                서비스 이용약관에 동의합니다
              </Label>
              <p className="text-sm text-gray-600">
                개인정보 처리방침 및 이용약관을 확인하였으며 이에 동의합니다.
              </p>
            </div>
          </div>

          <Button 
            className="w-full bg-black hover:bg-gray-800 text-white rounded-lg h-12"
            onClick={handleSignup}
          >
            회원가입
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}