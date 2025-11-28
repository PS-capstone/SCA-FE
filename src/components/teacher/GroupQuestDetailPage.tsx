import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft, CheckCircle, X, Users, Award, Calendar, Target, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AppContext";
import { get, post, apiCall } from "../../utils/api";

interface StudentStatus {
  student_id: number;
  student_name: string;
  class_name: string;
  is_completed: boolean;
  completed_at: string | null;
}

interface QuestDetailData {
  quest_id: number;
  class_id: number;
  class_name: string;
  template: string;
  title: string;
  content: string;
  status: "IN_PROGRESS" | "ACHIEVABLE" | "COMPLETED" | "EXPIRED";
  reward_coral: number;
  deadline: string;
  completion_status: {
    completed_count: number;
    required_count: number;
    total_count: number;
    completion_rate: number;
    is_achievable: boolean;
  };
  completion_condition: {
    description: string;
  };
  students: StudentStatus[];
}

export function GroupQuestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { access_token } = useAuth();

  const [questData, setQuestData] = useState<QuestDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!id || !access_token) return;

    try {
      const response = await get(`/api/v1/quests/group/${id}/detail`);
      const json = await response.json();

      if (response.ok && json.success) {
        setQuestData(json.data);
      } else {
        throw new Error(json.message || "상세 정보를 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("Fetch detail error:", err);
      setError("정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, access_token]);

  // 학생 달성 체크
  const handleToggleCheck = async (student: StudentStatus) => {
    if (!questData || isProcessing) return;

    // 이미 완료된 퀘스트나 만료된 퀘스트는 수정 불가
    if (questData.status === 'COMPLETED' || questData.status === 'EXPIRED') {
      alert("완료되거나 만료된 퀘스트는 수정할 수 없습니다.");
      return;
    }

    setIsProcessing(true);
    try {
      let response;
      if (student.is_completed) {
        // 취소 (DELETE)
        response = await apiCall(`/api/v1/quests/group/${questData.quest_id}/students/${student.student_id}/check`, {
          method: 'DELETE'
        });
      } else {
        // 체크 (POST)
        response = await post(`/api/v1/quests/group/${questData.quest_id}/students/${student.student_id}/check`, {
          is_completed: true
        });
      }

      const json = await response.json();
      if (response.ok && json.success) {
        // 성공 시 데이터 새로고침 (상태 변화 반영을 위해)
        await fetchDetail();
      } else {
        alert(json.message || "처리 실패");
      }
    } catch (err) {
      console.error("Check toggle error:", err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 단체 퀘스트 완료 처리 (보상 지급)
  const handleCompleteQuest = async () => {
    if (!questData || isProcessing) return;

    if (!confirm(`현재 달성한 ${questData.completion_status.completed_count}명의 학생에게 보상을 지급하고 퀘스트를 완료하시겠습니까?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await post(`/api/v1/quests/group/${questData.quest_id}/complete`, {});
      const json = await response.json();

      if (response.ok && json.success) {
        alert("퀘스트가 완료 처리되었으며 보상이 지급되었습니다.");
        navigate('/teacher/quest/group/manage');
      } else {
        alert(json.message || "완료 처리 실패");
      }
    } catch (err) {
      console.error("Complete quest error:", err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (error || !questData) return <div className="p-10 text-red-600 text-center">{error || "데이터 없음"}</div>;

  const { completion_status } = questData;

  return (
    <>
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
            onClick={() => navigate('/teacher/quest/group/manage')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black flex items-center gap-2">
              {questData.title}
              {questData.status === 'COMPLETED' && <Badge className="bg-black text-white">완료됨</Badge>}
              {questData.status === 'EXPIRED' && <Badge className="bg-red-100 text-red-800">만료됨</Badge>}
            </h1>
            <p className="text-gray-600 mt-1">{questData.content}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* 퀘스트 정보 */}
        <Card className="border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Target className="w-5 h-5" />
              퀘스트 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <div>
                    <span className="text-xs text-gray-500 block">보상</span>
                    <span className="text-black font-medium">{questData.reward_coral} 코랄</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-xs text-gray-500 block">마감일</span>
                    <span className="text-black font-medium">{questData.deadline}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="text-xs text-gray-500 block">달성 현황</span>
                    <span className="text-black font-medium">
                      {completion_status.completed_count} / {completion_status.total_count}명
                    </span>
                  </div>
                </div>
              </div>

              {/* 완료 조건 및 액션 */}
              <div className={`border-2 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4 ${completion_status.is_achievable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold ${completion_status.is_achievable ? 'text-green-800' : 'text-gray-700'}`}>
                      완료 조건: {completion_status.required_count}명 이상 달성
                    </span>
                    {completion_status.is_achievable && (
                      <Badge className="bg-green-600 text-white border-none">조건 달성!</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    현재 {completion_status.completed_count}명이 달성했습니다. (진행률: {completion_status.completion_rate}%)
                  </p>
                </div>

                {/* 완료 처리 버튼 */}
                {questData.status !== 'COMPLETED' && questData.status !== 'EXPIRED' && (
                  <Button
                    className={`min-w-[150px] ${completion_status.is_achievable
                      ? 'bg-black hover:bg-gray-800 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    disabled={!completion_status.is_achievable || isProcessing}
                    onClick={handleCompleteQuest}
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    퀘스트 완료 처리
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 학생 목록 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-black">학생별 달성 현황</h2>
            <span className="text-sm text-gray-500">클릭하여 달성 여부를 변경하세요</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {questData.students.map((student) => (
              <Card
                key={student.student_id}
                className={`border-2 cursor-pointer transition-all ${student.is_completed
                    ? 'border-green-500 bg-green-50/30'
                    : 'border-gray-200 hover:border-gray-400'
                  }`}
                onClick={() => handleToggleCheck(student)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${student.is_completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {student.student_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-black">{student.student_name}</p>
                      <p className="text-xs text-gray-500">{student.is_completed ? student.completed_at?.split('T')[0] : '미달성'}</p>
                    </div>
                  </div>

                  {student.is_completed ? (
                    <CheckCircle className="w-6 h-6 text-green-600 fill-green-100" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
