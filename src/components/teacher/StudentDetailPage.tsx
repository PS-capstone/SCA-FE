import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Plus, CheckCircle } from "lucide-react";
import { Progress } from "../ui/progress";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AppContext";
import { get } from "../../utils/api";

export function StudentDetailPage() {
  const { classId, id: studentId } = useParams<{ classId: string; id: string }>();
  const navigate = useNavigate();
  const { access_token, isAuthenticated } = useAuth();
  const [student, setStudent] = useState<{
    name: string;
    avatar: string;
    coral: number;
    explorationData: number;
    questCompletion: number;
    completedQuests: number;
    incompleteQuests: number;
    className?: string;
  }>({
    name: "로딩중...",
    avatar: "",
    coral: 0,
    explorationData: 0,
    questCompletion: 0,
    completedQuests: 0,
    incompleteQuests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ongoingQuests, setOngoingQuests] = useState<Array<{
    id: number;
    title: string;
    progress: number;
    deadline: string;
  }>>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Array<{
    id: number;
    title: string;
    submittedAt: string;
    coral: number;
    explorationData: number;
  }>>([]);

  const fetchStudentData = async () => {
    if (!classId || !studentId) {
      return;
    }

    if (!isAuthenticated || !access_token) {
      navigate("/login/teacher");
      return;
    }

    try {
      // 학생 목록에서 해당 학생 찾기
      const response = await get(`/api/v1/classes/${classId}/students`);

        if (response.status === 401) {
          navigate("/login/teacher");
          return;
        }

        if (!response.ok) {
          throw new Error("학생 정보를 가져올 수 없습니다.");
        }

        const data = await response.json();
        const studentData = data.data?.students?.find(
          (s: any) => s.student_id === parseInt(studentId)
        );

        if (studentData) {
          setStudent({
            name: studentData.real_name || studentData.username || studentData.name || "이름 없음",
            avatar: (studentData.real_name || studentData.username || studentData.name || "?")[0],
            coral: studentData.coral || 0,
            explorationData: studentData.exploration_data || studentData.research_data || 0,
            questCompletion: studentData.quest_completion_rate || 0,
            completedQuests: studentData.completed_quests_count || 0,
            incompleteQuests: studentData.incomplete_quests_count || 0,
            className: data.data?.class_name || "",
          });
        } else {
          setError("학생을 찾을 수 없습니다.");
        }

        // 진행 중인 퀘스트 조회
        const ongoingResponse = await get(`/api/v1/quests/personal/student/${studentId}`);
        if (ongoingResponse.ok) {
          const ongoingData = await ongoingResponse.json();
          if (ongoingData.success && ongoingData.data?.active_quests) {
            const quests = ongoingData.data.active_quests.map((q: any) => ({
              id: q.assignment_id || q.quest_id,
              title: q.title || "제목 없음",
              progress: 0, // 진행률은 별도 계산 필요
              deadline: q.created_at ? new Date(q.created_at).toLocaleDateString('ko-KR') : "마감일 없음",
            }));
            setOngoingQuests(quests);
          }
        }

        // 승인 대기 중인 퀘스트 조회
        const pendingResponse = await get(`/api/v1/quests/personal/pending?class_id=${classId}`);
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          if (pendingData.success && pendingData.data?.assignments) {
            // 해당 학생의 승인 대기 퀘스트만 필터링
            const studentPendingQuests = pendingData.data.assignments
              .filter((a: any) => a.student_id === parseInt(studentId))
              .map((a: any) => ({
                id: a.assignment_id || a.quest_id,
                title: a.title || "제목 없음",
                submittedAt: a.submitted_at 
                  ? new Date(a.submitted_at).toLocaleString('ko-KR') 
                  : "제출 시간 없음",
                coral: a.reward_coral_personal || 0,
                explorationData: a.reward_research_data_personal || 0,
              }));
            setPendingApprovals(studentPendingQuests);
          }
        }
      } catch (error) {
        console.error("학생 정보 로딩 실패:", error);
        setError("학생 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchStudentData();
  }, [classId, studentId, access_token, isAuthenticated, navigate]);

  // 페이지 포커스 시 데이터 다시 불러오기 (퀘스트 승인 후 돌아올 때 갱신)
  useEffect(() => {
    const handleFocus = () => {
      if (classId && studentId && isAuthenticated && access_token) {
        fetchStudentData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [classId, studentId, isAuthenticated, access_token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>로딩중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h1>{student.name}</h1>
              <p className="text-gray-600 mt-1">{student.className || "반 정보 없음"}</p>
            </div>
            <Button 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              variant="outline"
              onClick={() => navigate('/teacher/quest')}
            >
              <Plus className="w-4 h-4 mr-2" />
              퀘스트 등록
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6 max-w-4xl">
          {/* Stats */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4">
              <h3 className="mb-4">학생 스테이터스</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">코랄</p>
                  <h3>{student.coral}</h3>
                </div>
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">탐사데이터</p>
                  <h3>{student.explorationData}</h3>
                </div>
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">퀘스트 달성률</p>
                  <h3>{student.questCompletion}%</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t-2 border-gray-300 pt-4">
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">달성한 퀘스트</p>
                  <h3>{student.completedQuests}개</h3>
                </div>
                <div className="text-center border-2 border-gray-300 p-3">
                  <p className="text-sm text-gray-600 mb-1">달성 못한 퀘스트</p>
                  <h3>{student.incompleteQuests}개</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3>승인 대기 중인 퀘스트</h3>
                <Badge className="bg-black text-white rounded-lg">
                  {pendingApprovals.length}건
                </Badge>
              </div>
              <div className="space-y-3">
                {pendingApprovals.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">승인 대기 중인 퀘스트가 없습니다.</p>
                ) : (
                  pendingApprovals.map((quest) => (
                    <Card key={quest.id} className="border-2 border-gray-300 rounded-lg">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4>{quest.title}</h4>
                            <p className="text-sm text-gray-600">제출: {quest.submittedAt}</p>
                          </div>
                          <Button 
                            size="sm"
                            className="bg-black text-white hover:bg-gray-800 rounded-lg"
                            onClick={() => navigate('/teacher/quest/approval')}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            승인
                          </Button>
                        </div>
                        <div className="flex gap-2 text-sm border-t-2 border-gray-300 pt-2">
                          <span className="text-gray-600">보상:</span>
                          <span>코랄 {quest.coral}</span>
                          <span>탐사데이터 {quest.explorationData}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ongoing Quests */}
          <Card className="border-2 border-gray-300 rounded-lg">
            <CardContent className="p-4">
              <h3 className="mb-4">현재 진행 중인 퀘스트</h3>
              <div className="space-y-3">
                {ongoingQuests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">진행 중인 퀘스트가 없습니다.</p>
                ) : (
                  ongoingQuests.map((quest) => (
                    <Card key={quest.id} className="border-2 border-gray-300 rounded-lg">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4>{quest.title}</h4>
                          <span className="text-sm text-gray-600">마감: {quest.deadline}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">진행률</span>
                            <span>{quest.progress}%</span>
                          </div>
                          <div className="border-2 border-gray-300 h-4 overflow-hidden">
                            <div 
                              className="h-full bg-black transition-all"
                              style={{ width: `${quest.progress}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}