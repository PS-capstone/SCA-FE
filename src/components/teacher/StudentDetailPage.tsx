import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Plus } from "lucide-react";
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
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4 md:px-6 md:py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{student.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{student.className || "반 정보 없음"}</p>
        </div>
        <Button 
          className="bg-black hover:bg-gray-800 text-white shadow-sm"
          onClick={() => navigate('/teacher/quest')}
        >
          <Plus className="w-4 h-4 mr-2" />
          퀘스트 등록
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stats */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-bold text-gray-900">학생 스테이터스</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="text-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">코랄</p>
                  <h3 className="text-2xl font-bold text-gray-900">{student.coral}</h3>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">탐사데이터</p>
                  <h3 className="text-2xl font-bold text-gray-900">{student.explorationData}</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col items-center justify-center p-3 border border-dashed border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">달성한 퀘스트</p>
                  <h3 className="text-lg font-semibold text-green-600">{student.completedQuests}개</h3>
                </div>
                <div className="flex flex-col items-center justify-center p-3 border border-dashed border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">미달성 퀘스트</p>
                  <h3 className="text-lg font-semibold text-gray-600">{student.incompleteQuests}개</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Approvals */}
            <Card className="border border-gray-200 shadow-sm flex flex-col h-full">
              <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-bold text-gray-900">승인 대기 중</CardTitle>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200">
                  {pendingApprovals.length}건
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 flex-1 overflow-y-auto max-h-[400px]">
                <div className="space-y-3">
                  {pendingApprovals.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <p className="text-sm">승인 대기 중인 퀘스트가 없습니다.</p>
                    </div>
                  ) : (
                    pendingApprovals.map((quest) => (
                      <div key={quest.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{quest.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">제출: {quest.submittedAt}</p>
                          </div>
                          <Button 
                            size="sm"
                            className="h-8 bg-black text-white hover:bg-gray-800 text-xs"
                            onClick={() => navigate('/teacher/quest/approval')}
                          >
                            승인하기
                          </Button>
                        </div>
                        <div className="flex items-center gap-3 text-xs bg-gray-50 p-2 rounded border border-gray-100">
                          <span className="font-medium text-gray-500">보상:</span>
                          <span className="text-blue-600 font-medium">C {quest.coral}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-purple-600 font-medium">R {quest.explorationData}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ongoing Quests */}
            <Card className="border border-gray-200 shadow-sm flex flex-col h-full">
              <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-bold text-gray-900">진행 중인 퀘스트</CardTitle>
                <Badge variant="outline" className="text-gray-600 border-gray-300">
                  {ongoingQuests.length}건
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 flex-1 overflow-y-auto max-h-[400px]">
                <div className="space-y-3">
                  {ongoingQuests.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <p className="text-sm">진행 중인 퀘스트가 없습니다.</p>
                    </div>
                  ) : (
                    ongoingQuests.map((quest) => (
                      <div key={quest.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{quest.title}</h4>
                          <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal">
                             마감: {quest.deadline}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}