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
      case "ACTIVE": return <Badge className="bg-blue-100 text-blue-800 border-blue-200">진행 중</Badge>;
      case "COMPLETED": return <Badge className="bg-green-100 text-green-800 border-green-200">완료됨</Badge>;
      case "FAILED": return <Badge className="bg-red-100 text-red-800 border-red-200">실패</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4 md:px-6 md:py-5 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">단체 퀘스트 관리</h1>
          <p className="text-sm text-gray-500 mt-1">진행 중인 단체 퀘스트를 관리합니다</p>
        </div>
        <Button
          className="bg-black hover:bg-gray-800 text-white h-10"
          onClick={() => navigate('/teacher/quest/group')}
        >
          <Plus className="w-4 h-4 mr-2" />
          단체 퀘스트 등록
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && <div className="text-red-600">{error}</div>}

          {quests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-lg shadow-sm">
              <p className="text-gray-500 mb-4">등록된 단체 퀘스트가 없습니다.</p>
              <Button variant="outline" onClick={() => navigate('/teacher/quest/group')}>퀘스트 등록</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:!grid-cols-2 gap-6">
              {quests.map((quest) => (
                <Card key={quest.quest_id} className="border border-gray-200 shadow-sm hover:border-gray-300 transition-all flex flex-col h-full bg-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="border-gray-200 text-gray-500">{quest.template}</Badge>
                      {getStatusBadge(quest.status)}
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 leading-tight">{quest.title}</CardTitle>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[40px]">{quest.content}</p>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                    {/* 진행률 */}
                    <div className="space-y-2 bg-gray-50 p-3 rounded-md border border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">달성 현황</span>
                        <span className="text-gray-900 font-bold">
                          {quest.completion_status.completed_count} / {quest.completion_status.total_count}명
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${quest.completion_status.is_achievable ? 'bg-green-600' : 'bg-blue-600'}`}
                          style={{ width: `${(quest.completion_status.completed_count / quest.completion_status.total_count) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs flex justify-between items-center pt-1">
                        <span>목표: {quest.completion_status.required_count}명 이상</span>
                        {quest.completion_status.is_achievable && (
                          <span className="text-green-600 font-bold flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" /> 조건 달성!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 보상 및 마감일 */}
                    <div className="grid grid-cols-1 gap-4 text-sm pt-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">{quest.reward_coral} 코랄</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>~{quest.deadline.split('T')[0]}</span>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <Button
                      variant="outline"
                      className={`w-full h-10 mt-2 ${quest.status === 'ACHIEVABLE'
                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                        : 'border-gray-200 hover:bg-gray-50'
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
      </main>
    </div>
  );
}
