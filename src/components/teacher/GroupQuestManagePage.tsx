import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Target, Award, Calendar, Plus, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AppContext";
import { get } from "../../utils/api";

interface CompletionStatus {
  completed_count: number;
  required_count: number;
  total_count: number;
  completion_rate?: number;
  is_achievable: boolean;
}

interface GroupQuestSummary {
  quest_id: number;
  template: string;
  title: string;
  content: string;
  status: "IN_PROGRESS" | "ACHIEVABLE" | "COMPLETED" | "EXPIRED";
  reward_coral: number;
  deadline: string;
  completion_status: CompletionStatus;
  created_at: string;
}

export function GroupQuestManagePage() {
  const navigate = useNavigate();
  const { currentClassId, access_token } = useAuth();

  const [quests, setQuests] = useState<GroupQuestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentClassId || !access_token) return;

    const fetchQuests = async () => {
      setIsLoading(true);
      try {
        const response = await get(`/api/v1/quests/group?class_id=${currentClassId}`);
        const json = await response.json();

        if (response.ok && json.success) {
          setQuests(json.data.quests);
        } else {
          throw new Error(json.message || "퀘스트 목록을 불러오지 못했습니다.");
        }
      } catch (err) {
        console.error("Error fetching quests:", err);
        setError("퀘스트 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuests();
  }, [currentClassId, access_token]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS": return <Badge className="bg-blue-100 text-blue-800 border-blue-200">진행 중</Badge>;
      case "ACHIEVABLE": return <Badge className="bg-green-100 text-green-800 border-green-200 animate-pulse">달성 가능</Badge>;
      case "COMPLETED": return <Badge className="bg-gray-800 text-white border-black">완료됨</Badge>;
      case "EXPIRED": return <Badge className="bg-red-100 text-red-800 border-red-200">만료됨</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <>
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">단체 퀘스트 관리</h1>
            <p className="text-gray-600 mt-1">진행 중인 단체 퀘스트를 관리합니다</p>
          </div>
          <Button
            className="bg-black hover:bg-gray-800 text-white rounded-lg border-2 border-gray-300"
            onClick={() => navigate('/teacher/quest/group')}
          >
            <Plus className="w-4 h-4 mr-2" />
            단체 퀘스트 등록
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {error && <div className="text-red-600">{error}</div>}

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {error && <div className="text-red-600">{error}</div>}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black">퀘스트 목록</h2>

            {quests.length === 0 ? (
              <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                등록된 단체 퀘스트가 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quests.map((quest) => (
                  <Card key={quest.quest_id} className="border-2 border-gray-300 hover:border-gray-500 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{quest.template}</Badge>
                        {getStatusBadge(quest.status)}
                      </div>
                      <CardTitle className="text-lg text-black">{quest.title}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{quest.content}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 진행률 */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">달성 현황</span>
                          <span className="text-black font-semibold">
                            {quest.completion_status.completed_count} / {quest.completion_status.total_count}명
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${quest.completion_status.is_achievable ? 'bg-green-600' : 'bg-black'
                              }`}
                            style={{ width: `${(quest.completion_status.completed_count / quest.completion_status.total_count) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>목표: {quest.completion_status.required_count}명 이상</span>
                          {quest.completion_status.is_achievable && (
                            <span className="text-green-600 font-bold flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" /> 조건 달성!
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 보상 및 마감일 */}
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-blue-600 font-medium">
                          <Award className="w-4 h-4" />
                          <span>{quest.reward_coral} 코랄</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>~{quest.deadline.split('T')[0]}</span>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <Button
                        variant="outline"
                        className={`w-full border-2 rounded-lg ${quest.status === 'ACHIEVABLE'
                            ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300'
                            : 'border-gray-300 hover:bg-gray-100'
                          }`}
                        onClick={() => navigate(`/teacher/quest/group/detail/${quest.quest_id}`)}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        {quest.status === 'ACHIEVABLE' ? '달성 확인 및 완료' : '달성 현황 관리'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
