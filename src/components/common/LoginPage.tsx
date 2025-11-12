import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth, TeacherUser, StudentUser } from "../../contexts/AppContext";

type FormErrors = {
  username: string | null;
  password: string | null;
  formGeneral: string | null; // 아이디/비번 불일치, 서버 에러 등
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { role } = useParams<{ role: string }>();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    username: null,
    password: null,
    formGeneral: null,
  });

  // 입력 필드 변경을 처리하는 공통 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // 사용자가 필드를 수정하면, 해당 필드의 에러 메시지를 즉시 제거
    const errorKey = id as keyof FormErrors;
    if (formErrors[errorKey]) {
      setFormErrors(prev => ({ ...prev, [errorKey]: null }));
    }
  };

  // 역할에 따라 제목과 로그인 로직을 분기
  const title = role === 'teacher' ? '선생님 로그인' : '학생 로그인';

  const handleLogin = () => {
    // 역할(role)에 따라 다른 로그인 로직과 임시 데이터를 사용
    if (role === 'teacher') {
      const teacherUser: TeacherUser = {
        id: Math.random().toString(36).substr(2, 9),
        realName: '선생님',
        nickname: 'nickname',
        username: formData.username,
        email: 'teacher@example.com',
        classes: ['CLASS001', 'CLASS002']
      };
      login(teacherUser, 'teacher');
      navigate('/teacher/dashboard');
    } else if (role === 'student') {
      const studentUser: StudentUser = {
        id: Math.random().toString(36).substr(2, 9),
        realName: '학생',
        nickname: 'nickname',
        username: formData.username,
        email: 'student@example.com',
        classCode: 'CLASS001',
        currentCoral: 50,
        currentResearchData: 100,
        mainFish: '기본 물고기'
      };
      login(studentUser, 'student');
      navigate('/student/dashboard');
    } else {
      alert("잘못된 접근입니다.");
      navigate('/'); // 역할이 없으면 홈으로
    }
  };

  //백엔드 api 호출용
/*   const handleLogin = async () => {
    if (role !== 'teacher' && role !== 'student') {
      alert("잘못된 접근입니다.");
      navigate('/');
      return;
    }

    setIsLoading(true);
    setFormErrors({ username: null, password: null, formGeneral: null });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: role
        }),
      });

      if (!response.ok) {
        const status = response.status;
        const data = await response.json();

        if (status === 401) {
          setFormErrors(prev => ({ ...prev, formGeneral: data.message || '아이디 또는 비밀번호가 일치하지 않습니다.' }));
          return;
        }
        if (status === 400 && data.error_code === 'INVALID_INPUT' && data.data) {
          setFormErrors(prev => ({ ...prev, ...data.data }));
          return;
        }
        setFormErrors(prev => ({ ...prev, formGeneral: data.message || '로그인에 실패했습니다.' }));
        return;
      }

      const data = await response.json();

      login(data.user, role as 'teacher' | 'student');

      if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }

    } catch (error) {
      const message = (error instanceof Error) ? error.message : "알 수 없는 에러가 발생했습니다.";
      setFormErrors(prev => ({ ...prev, formGeneral: `네트워크 오류: ${message}` }));
    } finally {
      setIsLoading(false);
    }
  }; */

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-gray-300">
        <CardHeader className="text-center border-b-2 border-gray-300 relative">
          {/* 역할 선택 페이지('/')로 돌아가는 '뒤로가기' 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 border border-gray-300 hover:bg-gray-100"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-4"></div>
          <CardTitle className="text-black">{title}</CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">아이디</Label>
            <Input
              id="username"
              placeholder="아이디를 입력하세요"
              className="border-2 border-gray-300 rounded-lg"
              value={formData.username}
              onChange={handleChange}
            />
            {formErrors.username && (
              <p className="text-sm text-red-600 pt-1">{formErrors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="border-2 border-gray-300 rounded-lg"
              value={formData.password}
              onChange={handleChange}
            />
            {formErrors.password && (
              <p className="text-sm text-red-600 pt-1">{formErrors.password}</p>
            )}
          </div>

          {/* API 에러 메시지를 사용자에게 표시 */}
          {formErrors.formGeneral && (
            <p className="text-sm text-red-600 text-center">{formErrors.formGeneral}</p>
          )}

          <Button
            className="w-full bg-black hover:bg-gray-800 text-white rounded-lg h-12"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          <div className="text-center pt-2">
            {/* Link 컴포넌트를 사용해 통합 회원가입 페이지로 이동 */}
            <Link
              to="/signup" // SignupPage.tsx
              className="text-black underline"
            >
              회원가입하기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}