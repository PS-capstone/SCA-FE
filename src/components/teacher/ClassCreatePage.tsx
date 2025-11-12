import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Plus, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type FormErrors = {
  name?: string | null;
  grade?: string | null;
  invite_code?: string | null;
  formGeneral?: string | null;
};

export function ClassCreatePage() {
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState({
    name: "",
    grade: "",
    subject: "수학",
    description: "",
    invite_code: ""
  });

  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // 입력 필드 변경을 처리하는 공통 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setClassInfo(prev => ({ ...prev, [id]: value }));
    // 필드 수정 시, 해당 필드의 에러를 즉시 제거
    if (formErrors[id as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [id as keyof FormErrors]: null }));
    }
  };

  const generateinvite_code = () => {
    setIsGeneratingCode(true);

    //임시 코드
    setTimeout(() => {
      const code = `CLASS${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      setClassInfo({ ...classInfo, invite_code: code });
      setIsGeneratingCode(false);
    }, 1000);

  };

  //백엔드 api 호출용(초대코드 생성 api 필요! 임시 '/api/class/generate-code')
  /*   const generateinvite_code = async () => {
      setIsGeneratingCode(true);
      setFormErrors(prev => ({ ...prev, invite_code: null, formGeneral: null }));
  
      try {
        const response = await fetch('/api/class/generate-code', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
  
        if (!response.ok) {
          throw new Error('API 호출에 실패했습니다.');
        }
  
        const data = await response.json();
  
        if (data.invite_code) {
          setClassInfo({ ...classInfo, invite_code: data.invite_code });
        } else {
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error("초대 코드 생성 실패:", error);
        const message = (error instanceof Error) ? error.message : "초대 코드 생성에 실패했습니다.";
        setFormErrors(prev => ({ ...prev, formGeneral: message }));
      } finally {
        setIsGeneratingCode(false);
      }
    }; */

  const handleSave = () => {
    if (!classInfo.name || !classInfo.grade) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    const finalClassInfo = { ...classInfo };
    if (!finalClassInfo.invite_code) {
      finalClassInfo.invite_code = `TEMP${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }

    //임시 코드
    console.log("저장될 반 정보:", finalClassInfo);
    alert(`반이 생성되었습니다!\n반명: ${finalClassInfo.name}\n초대코드: ${finalClassInfo.invite_code}`);
    navigate('class-manage');
  };

  //백엔드 api 호출용
  /*   const handleSave = async () => {
      if (!classInfo.name || !classInfo.grade) {
        setFormErrors({
          name: !classInfo.name ? "반 이름을 입력해주세요." : null,
          grade: !classInfo.grade ? "학년을 입력해주세요." : null
        });
        return;
      }
  
      setIsLoading(true);
      setFormErrors({});
  
      try {
        const response = await fetch('/api/classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(classInfo)
        });
  
        if (!response.ok) {
          const status = response.status;
          const data = await response.json();
          if (status === 400 && data.error_code === 'INVALID_INPUT' && data.data) {
            setFormErrors(data.data);
            return;
          }
          throw new Error(data.message || '반 생성에 실패했습니다.');
        }
  
        alert(`반이 생성되었습니다!\n반명: ${classInfo.name}\n초대코드: ${classInfo.invite_code}`);
        navigate('/teacher/class');
  
      } catch (error) {
        if (error instanceof Error) {
          console.error("반 생성 실패:", error.message);
          alert(`반 생성에 실패했습니다: ${error.message}`);
        } else {
          console.error("반 생성 실패:", error);
          alert("알 수 없는 에러가 발생했습니다.");
        }
      }
    }; */

  const handleCancel = () => {
    navigate('/teacher/class');
  };

  return (
    <>
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
                  onChange={handleChange}
                  placeholder="예: 중등 1반, 고등 2반"
                  className="border-2 border-gray-300 rounded-lg"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 pt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade" className="text-black font-medium">학년 *</Label>
                <Input
                  id="grade"
                  value={classInfo.grade}
                  onChange={handleChange}
                  placeholder="예: 중1, 고2"
                  className="border-2 border-gray-300 rounded-lg"
                />
                {formErrors.grade && (
                  <p className="text-sm text-red-600 pt-1">{formErrors.grade}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-black font-medium">과목</Label>
                <Input
                  id="subject"
                  value={classInfo.subject}
                  onChange={handleChange}
                  className="border-2 border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* 반 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-black font-medium">반 설명</Label>
              <Textarea
                id="description"
                value={classInfo.description}
                onChange={handleChange}
                placeholder="반에 대한 설명을 입력해주세요"
                className="border-2 border-gray-300 rounded-lg min-h-20"
              />
            </div>

            {/* 액션 버튼들 */}
            <div className="flex gap-3 pt-6 border-t-2 border-gray-300">
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                disabled={isLoading || isGeneratingCode}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "생성 중..." : "반 생성하기"}
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
    </>
  );
}
