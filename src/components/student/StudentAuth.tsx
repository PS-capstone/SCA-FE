import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ArrowLeft } from 'lucide-react';

interface StudentUser {
  id: string;
  realName: string;
  username: string;
  classCode: string;
  totalCoral: number;
  currentCoral: number;
  totalExplorationData: number;
  mainFish: string;
}

interface StudentAuthProps {
  onLogin: (user: StudentUser) => void;
}

export function StudentAuth({ onLogin }: StudentAuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [formData, setFormData] = useState({
    realName: '',
    username: '',
    password: '',
    classCode: ''
  });

  const availableClasses = [
    { code: 'CLASS001', name: '3학년 1반' },
    { code: 'CLASS002', name: '3학년 2반' },
    { code: 'CLASS003', name: '5학년 1반' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // 회원가입 처리
      if (!formData.realName || !formData.username || !formData.password || !formData.classCode) {
        alert('모든 항목을 입력해주세요.');
        return;
      }
      
      // 기본 물고기 지급 모달 표시
      setShowWelcomeModal(true);
    } else {
      // 로그인 처리
      if (!formData.username || !formData.password) {
        alert('아이디와 비밀번호를 입력해주세요.');
        return;
      }
      
      // 실제로는 API 호출
      const user: StudentUser = {
        id: Math.random().toString(36).substr(2, 9),
        realName: formData.realName || '학생',
        username: formData.username,
        classCode: formData.classCode || 'CLASS001',
        totalCoral: 50,
        currentCoral: 50,
        totalExplorationData: 0,
        mainFish: '기본 물고기'
      };
      
      onLogin(user);
    }
  };

  const handleWelcomeComplete = () => {
    // 회원가입 완료 후 로그인 처리
    const user: StudentUser = {
      id: Math.random().toString(36).substr(2, 9),
      realName: formData.realName,
      username: formData.username,
      classCode: formData.classCode,
      totalCoral: 50,
      currentCoral: 50,
      totalExplorationData: 0,
      mainFish: '기본 물고기'
    };
    
    setShowWelcomeModal(false);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-gray-300">
        <CardHeader className="text-center border-b-2 border-gray-300">
          <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-4"></div>
          <CardTitle className="text-black">학습 관리 시스템</CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <Button 
            variant="outline"
            className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
          

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block mb-2 text-black">실명</label>
                  <Input
                    type="text"
                    value={formData.realName}
                    onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
                    placeholder="실명을 입력하세요"
                    className="border-gray-300 bg-white text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-black">반 코드</label>
                  <Input
                    type="text"
                    value={formData.classCode}
                    onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
                    placeholder="선생님이 제공한 반 코드를 입력하세요"
                    className="border-gray-300 bg-white text-black"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">예: CLASS001</p>
                </div>
              </>
            )}

            <div>
              <label className="block mb-2 text-black">아이디</label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="아이디를 입력하세요"
                className="border-gray-300 bg-white text-black"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-black">비밀번호</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="비밀번호를 입력하세요"
                className="border-gray-300 bg-white text-black"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              {isSignUp ? '회원가입' : '로그인'}
            </Button>

            {!isSignUp && (
              <div className="text-center pt-2">
                <Button 
                  variant="link" 
                  onClick={() => setIsSignUp(true)}
                  className="text-black underline"
                >
                  회원가입하기
                </Button>
              </div>
            )}

            {isSignUp && (
              <div className="text-center pt-2">
                <Button 
                  variant="link" 
                  onClick={() => setIsSignUp(false)}
                  className="text-black underline"
                >
                  로그인하기
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* 가입 완료 모달 */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="bg-white border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-black text-center">회원가입 완료!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-32 h-32 bg-gray-200 rounded mx-auto flex items-center justify-center">
              <span className="text-gray-600">기본 물고기</span>
            </div>
            <p className="text-black">기본 물고기를 받았습니다!</p>
            <Button 
              onClick={handleWelcomeComplete}
              className="w-full bg-black text-white"
            >
              시작하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}