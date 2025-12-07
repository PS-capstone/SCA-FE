import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { get, post } from "../../utils/api";
import { useLocation } from "react-router-dom";

interface RaidSummary {
  raid_id: number;
  class_id: number;
  class_name: string;
  raid_name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'TERMINATED';
  difficulty: string;
  current_boss_hp: number;
  total_boss_hp: number;
  participant_count: number;
  end_date: string;
}

interface RaidDetail {
  raid_id: number;
  class_id: number;
  class_name: string;
  raid_name: string;
  template: string;
  difficulty: string;
  status: string;
  start_date: string;
  end_date: string;
  total_boss_hp: number;
  current_boss_hp: number;
  progress_percent: number;
  reward_coral: number;
  special_reward_description?: string;
  participant_count: number;
  remaining_seconds: number;
  contributions: {
    student_id: number;
    student_name: string;
    damage: number;
    contribution_percent: number;
  }[];
}

type StatusFilter = 'ACTIVE' | 'ENDED';
const ENDED_STATUSES: RaidSummary['status'][] = ['COMPLETED', 'EXPIRED', 'TERMINATED'];

export function RaidManagePage() {
  const location = useLocation();
  const locationState = location.state as { initialFilter?: StatusFilter; focusRaidId?: number } | null;
  const [raids, setRaids] = useState<RaidSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaidId, setSelectedRaidId] = useState<number | null>(null);
  const [raidDetail, setRaidDetail] = useState<RaidDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const initialFilterRef = useRef<StatusFilter>(locationState?.initialFilter ?? 'ACTIVE');
  const initialFocusRef = useRef<number | null>(locationState?.focusRaidId ?? null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialFilterRef.current);
  const [pendingFocusRaidId, setPendingFocusRaidId] = useState<number | null>(initialFocusRef.current);

  const formatRemainingTime = (seconds: number) => {
    if (seconds <= 0) return "종료됨";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}일 ${hours}시간 ${minutes}분`;
    }
    return `${hours}시간 ${minutes}분`;
  };

  const fetchRaids = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get('/api/v1/raids');
      const json = await response.json();
      if (response.ok) {
        setRaids(json.data?.raids ?? []);
      } else {
        setError(json?.message ?? '레이드 목록을 불러오지 못했습니다.');
      }
    } catch (err) {
      setError('레이드 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaids();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedRaidId) {
        setRaidDetail(null);
        return;
      }
      setDetailLoading(true);
      try {
        const response = await get(`/api/v1/raids/${selectedRaidId}/detail`);
        const json = await response.json();
        if (response.ok) {
          setRaidDetail(json.data);
        } else {
          setRaidDetail(null);
        }
      } catch (err) {
        console.error(err);
        setRaidDetail(null);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [selectedRaidId]);

  const handleTerminate = async (raidId: number) => {
    if (!window.confirm("정말 이 레이드를 강제 종료하시겠습니까?")) return;

    setActionMessage(null);
    try {
      const response = await post(`/api/v1/raids/${raidId}/terminate`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.message ?? '레이드 종료에 실패했습니다.');
      }
      setActionMessage('레이드를 종료했습니다.');
      fetchRaids();
      if (selectedRaidId === raidId) {
        setRaidDetail(prev => prev ? { ...prev, status: 'TERMINATED' } : null);
      }
    } catch (err: any) {
      setActionMessage(err.message ?? '레이드 종료에 실패했습니다.');
    }
  };

  const filteredRaids = useMemo(() => {
    if (statusFilter === 'ACTIVE') {
      return raids.filter((raid) => raid.status === 'ACTIVE');
    }
    return raids.filter((raid) => ENDED_STATUSES.includes(raid.status));
  }, [raids, statusFilter]);

  useEffect(() => {
    if (raids.length === 0) return;

    if (pendingFocusRaidId) {
      const targetExists = raids.some(r => r.raid_id === pendingFocusRaidId);
      if (targetExists) {
        setSelectedRaidId(pendingFocusRaidId);
        const target = raids.find(r => r.raid_id === pendingFocusRaidId);
        if (target && target.status !== 'ACTIVE') setStatusFilter('ENDED');
      }
      setPendingFocusRaidId(null);
      return;
    }

    const exists = filteredRaids.some((raid) => raid.raid_id === selectedRaidId);
    if (!exists && filteredRaids.length > 0 && !selectedRaidId) {
      setSelectedRaidId(filteredRaids[0].raid_id);
    }
  }, [raids, filteredRaids, pendingFocusRaidId, selectedRaidId]);

  const selectedRaidSummary = useMemo(
    () => raids.find((raid) => raid.raid_id === selectedRaidId),
    [raids, selectedRaidId]
  );

  if (loading) {
    return <div className="p-6">레이드 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4 md:px-6 md:py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">레이드 관리</h1>
          <p className="text-sm text-gray-500 mt-1">레이드 상태를 확인하고 관리하세요.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
            className={`h-9 ${statusFilter === 'ACTIVE' ? 'bg-black text-white hover:bg-gray-800' : 'border-gray-200 text-gray-600'}`}
            onClick={() => {
              setStatusFilter('ACTIVE');
              setSelectedRaidId(null);
            }}
          >
            진행 중
          </Button>
          <Button
            variant={statusFilter === 'ENDED' ? 'default' : 'outline'}
            className={`h-9 ${statusFilter === 'ENDED' ? 'bg-black text-white hover:bg-gray-800' : 'border-gray-200 text-gray-600'}`}
            onClick={() => {
              setStatusFilter('ENDED');
              setSelectedRaidId(null);
            }}
          >
            종료됨
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchRaids} className="text-gray-500 hover:text-gray-900">
            새로고침
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {actionMessage && (
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md text-sm border border-blue-100 mb-4">
              {actionMessage}
            </div>
          )}
          {/* List Column */}
          <Card className="md:col-span-5 lg:col-span-4 border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-100 py-4 bg-gray-50/50 shrink-0">
              <CardTitle className="text-base font-semibold text-gray-900">레이드 목록</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {filteredRaids.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  {statusFilter === 'ACTIVE' ? '진행 중인 레이드가 없습니다.' : '마감된 레이드가 없습니다.'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredRaids.map((raid) => (
                    <div
                      key={raid.raid_id}
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${raid.raid_id === selectedRaidId ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                        }`}
                      onClick={() => setSelectedRaidId(raid.raid_id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{raid.raid_name}</h4>
                          <span className="text-xs text-gray-500">{raid.class_name}</span>
                        </div>
                        <Badge variant={raid.status === 'ACTIVE' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                          {raid.status}
                        </Badge>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>HP {(raid.current_boss_hp ?? 0).toLocaleString()} / {(raid.total_boss_hp ?? 0).toLocaleString()}</span>
                          <span>{raid.participant_count}명 참여</span>
                        </div>
                        <Progress
                          value={raid.total_boss_hp > 0 ? (raid.current_boss_hp / raid.total_boss_hp) * 100 : 0}
                          className="h-1.5"
                          indicatorClassName={raid.status === 'ACTIVE' ? 'bg-red-500' : 'bg-gray-400'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detail Column */}
          <Card className="md:col-span-7 lg:col-span-8 border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden bg-white">
            <CardHeader className="border-b border-gray-100 py-4 bg-gray-50/50 shrink-0">
              <CardTitle className="text-base font-semibold text-gray-900">상세 정보</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 overflow-y-auto">
              {detailLoading ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>불러오는 중...</p>
                </div>
              ) : raidDetail ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-normal border-gray-300">{raidDetail.difficulty}</Badge>
                      <span className="text-xs text-gray-500">{raidDetail.class_name}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{raidDetail.raid_name}</h3>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-semibold text-gray-700">보스 HP</span>
                      <span className="text-xs text-gray-500 font-mono">
                        {raidDetail.current_boss_hp.toLocaleString()} / {raidDetail.total_boss_hp.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={raidDetail.progress_percent} className="h-3" indicatorClassName="bg-red-600" />
                    <p className="text-right text-xs text-red-600 font-medium">{raidDetail.progress_percent}% 남음</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1 p-3 border border-gray-100 rounded-md">
                      <p className="text-xs text-gray-500">기본 보상</p>
                      <p className="font-semibold text-gray-900">{raidDetail.reward_coral} Coral</p>
                    </div>
                    <div className="space-y-1 p-3 border border-gray-100 rounded-md">
                      <p className="text-xs text-gray-500">참여자</p>
                      <p className="font-semibold text-gray-900">{raidDetail.participant_count}명</p>
                    </div>
                    <div className="space-y-1 p-3 border border-gray-100 rounded-md">
                      <p className="text-xs text-gray-500">상태</p>
                      <p className="font-semibold text-gray-900">{raidDetail.status}</p>
                    </div>
                    <div className="space-y-1 p-3 border border-gray-100 rounded-md">
                      <p className="text-xs text-gray-500">남은 시간</p>
                      <p className="font-semibold text-gray-900">{formatRemainingTime(raidDetail.remaining_seconds)}</p>
                    </div>
                  </div>

                  {raidDetail.special_reward_description && (
                    <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                      <p className="text-xs text-yellow-800 font-semibold mb-1">🎁 특별 보상</p>
                      <p className="text-sm text-yellow-900">{raidDetail.special_reward_description}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                    <span>시작: {new Date(raidDetail.start_date).toLocaleDateString()}</span>
                    <span>종료: {new Date(raidDetail.end_date).toLocaleDateString()}</span>
                  </div>

                  {raidDetail.status === 'ACTIVE' && (
                    <div className="pt-2">
                      <Button
                        variant="destructive"
                        className="w-full bg-black hover:bg-gray-800 text-white"
                        onClick={() => handleTerminate(raidDetail.raid_id)}
                      >
                        레이드 강제 종료
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>왼쪽 목록에서 레이드를 선택하세요.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}

