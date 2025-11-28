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
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b-2 border-gray-300 pb-4">
        <div>
          <h1>레이드 관리</h1>
          <p className="text-sm text-gray-600 mt-1">레이드 상태를 확인하고 관리하세요.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
            className={statusFilter === 'ACTIVE' ? 'bg-black text-white hover:bg-gray-800' : 'border-2 border-gray-300'}
            onClick={() => {
              setStatusFilter('ACTIVE');
              setSelectedRaidId(null);
            }}
          >
            진행 중 레이드
          </Button>
          <Button
            variant={statusFilter === 'ENDED' ? 'default' : 'outline'}
            className={statusFilter === 'ENDED' ? 'bg-black text-white hover:bg-gray-800' : 'border-2 border-gray-300'}
            onClick={() => {
              setStatusFilter('ENDED');
              setSelectedRaidId(null);
            }}
          >
            마감된 레이드
          </Button>
          <Button className="bg-black text-white hover:bg-gray-800" onClick={fetchRaids}>
            새로고침
          </Button>
        </div>
      </div>

      {actionMessage && <p className="text-sm text-center">{actionMessage}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-gray-300 rounded-lg">
          <CardHeader>
            <CardTitle>레이드 목록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredRaids.length === 0 && (
              <p className="text-sm text-gray-500">
                {statusFilter === 'ACTIVE' ? '진행 중인 레이드가 없습니다.' : '마감된 레이드가 없습니다.'}
              </p>
            )}
            {filteredRaids.map((raid) => (
              <Card
                key={raid.raid_id}
                className={`border-2 ${raid.raid_id === selectedRaidId ? 'border-black' : 'border-gray-200'} cursor-pointer`}
                onClick={() => setSelectedRaidId(raid.raid_id)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4>{raid.raid_name}</h4>
                      <p className="text-sm text-gray-500">{raid.class_name}</p>
                    </div>
                    <Badge variant={raid.status === 'ACTIVE' ? 'destructive' : 'secondary'}>
                      {raid.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">보스 HP</span>
                      <span>{(raid.current_boss_hp ?? 0).toLocaleString()} / {(raid.total_boss_hp ?? 0).toLocaleString()}</span>
                    </div>
                    <Progress value={raid.total_boss_hp > 0 ? (raid.current_boss_hp / raid.total_boss_hp) * 100 : 0} className="h-2" />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>참여자</span>
                    <span>{raid.participant_count}명</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-300 rounded-lg">
          <CardHeader>
            <CardTitle>레이드 상세</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailLoading && <p>상세 정보를 불러오는 중...</p>}
            {!detailLoading && raidDetail ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold">{raidDetail.raid_name}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{raidDetail.class_name}</span>
                    <Badge variant="outline">{raidDetail.difficulty}</Badge>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">보스 HP 상태</span>
                    <span>{raidDetail.progress_percent}% 남음</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>현재: {raidDetail.current_boss_hp.toLocaleString()}</span>
                    <span>전체: {raidDetail.total_boss_hp.toLocaleString()}</span>
                  </div>
                  <Progress value={raidDetail.progress_percent} className="h-4" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-600">코랄 보상</p>
                    <p className="font-semibold">{raidDetail.reward_coral}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">남은 시간</p>
                    <p className="font-semibold">{formatRemainingTime(raidDetail.remaining_seconds)}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs text-gray-500">참여자 수</p>
                     <p className="font-bold">{raidDetail.participant_count}명</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs text-gray-500">상태</p>
                     <p className="font-bold">{raidDetail.status}</p>
                  </div>
                </div>

                {raidDetail.special_reward_description && (
                  <div>
                    <p className="text-sm text-gray-600">특별 보상</p>
                    <p className="text-sm">{raidDetail.special_reward_description}</p>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-500 pt-2">
                   <span>시작일: {new Date(raidDetail.start_date).toLocaleDateString()}</span>
                   <span>종료일: {new Date(raidDetail.end_date).toLocaleDateString()}</span>
                </div>

                {raidDetail.status === 'ACTIVE' && (
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 mt-4"
                    onClick={() => handleTerminate(raidDetail.raid_id)}
                  >
                    레이드 강제 종료
                  </Button>
                )}
              </>
            ) : (
              !detailLoading && <p className="text-sm text-gray-500">레이드를 선택하세요.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

