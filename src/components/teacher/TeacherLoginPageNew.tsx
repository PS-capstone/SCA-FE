import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

interface TeacherLoginPageNewProps {
  onNavigate: (page: string) => void;
}

export function TeacherLoginPageNew({ onNavigate }: TeacherLoginPageNewProps) {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-gray-300">
        <CardHeader className="text-center border-b-2 border-gray-300">
          <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-4"></div>
          <CardTitle className="text-black">학습 관리 시스템</CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {!isSignUp && (
            <Button 
              variant="outline"
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              onClick={() => window.location.href = '/'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
          )}
          

          {!isSignUp ? (
            <>
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
                  onClick={() => setIsSignUp(true)}
                  className="text-black underline"
                >
                  회원가입하기
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="teacher-name">이름</Label>
                <Input 
                  id="teacher-name" 
                  placeholder="이름을 입력하세요"
                  className="border-2 border-gray-300 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-email">이메일</Label>
                <Input 
                  id="teacher-email" 
                  type="email"
                  placeholder="이메일을 입력하세요"
                  className="border-2 border-gray-300 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-password">비밀번호</Label>
                <Input 
                  id="teacher-password" 
                  type="password" 
                  placeholder="비밀번호를 입력하세요"
                  className="border-2 border-gray-300 rounded-lg"
                />
              </div>

              <Button 
                className="w-full bg-black hover:bg-gray-800 text-white rounded-lg h-12"
                onClick={() => onNavigate('teacher-dashboard-new')}
              >
                회원가입
              </Button>

              <div className="text-center pt-2">
                <Button 
                  variant="link" 
                  onClick={() => setIsSignUp(false)}
                  className="text-black underline"
                >
                  로그인하기
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}