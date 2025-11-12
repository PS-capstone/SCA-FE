import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { User, GraduationCap } from "lucide-react";

export function RoleSelection() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-gray-300">
        <CardHeader className="text-center border-b-2 border-gray-300">
          {/* <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-4"></div> */}
          <CardTitle className="text-black">학습 관리 시스템</CardTitle>
          <p className="text-gray-600 pt-2">역할을 선택하여 로그인하세요.</p>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <Button
            className="w-full h-16 text-lg bg-black hover:bg-gray-800 text-white rounded-lg"
            onClick={() => navigate('/login/teacher')}
          >
            <User className="w-5 h-5 mr-2" />
            선생님으로 로그인
          </Button>

          <Button
            className="w-full h-16 text-lg bg-black hover:bg-gray-800 text-white rounded-lg"
            onClick={() => navigate('/login/student')}
          >
            <GraduationCap className="w-5 h-5 mr-2" />
            학생으로 로그인
          </Button>

          <div className="text-center pt-4">
            <span className="text-gray-700">계정이 없으신가요? </span>
            <Button
              variant="link"
              onClick={() => navigate('/signup')}
              className="text-black underline p-0"
            >
              회원가입하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
