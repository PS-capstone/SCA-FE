import { useState, useEffect, useRef } from 'react';
import { Badge } from '../ui/badge';
import { useAuth } from "../../contexts/AppContext";
import { get } from "../../utils/api";

// 이미지 임시 경로
const IMG_URL = "https://placehold.co";

type FishGrade = 'COMMON' | 'RARE' | 'LEGENDARY';

interface AquariumFishItem {
  entry_id: number;
  fish_id: number;
  fish_name: string;
  grade: FishGrade;
  fish_count: number;
}

interface EncyclopediaFishItem {
  fish_id: number;
  fish_name: string;
  grade: FishGrade;
  is_collected: boolean;
  fish_count: number;
}

interface UIFish {
  fish_id: number;
  fish_name: string;
  grade: FishGrade;
  current_count: number;
  is_owned: boolean;
  size: number;
}

const getGradeColor = (grade: FishGrade) => {
  switch (grade) {
    case 'COMMON': return "var(--color-gray-400)";
    case 'RARE': return "var(--color-blue-500)";
    case 'LEGENDARY': return "var(--color-yellow-600)";
    default: return "var(--color-black)";
  }
};

const getFishSize = (grade: FishGrade) => {
  switch (grade) {
    case 'LEGENDARY': return 64;
    default: return 32;
  }
};

export function StudentCollection() {
  const { user, isAuthenticated, userType, access_token } = useAuth();
  const [currentView, setCurrentView] = useState<'aquarium' | 'book'>('aquarium');
  const [fishList, setFishList] = useState<UIFish[]>([]);
  const [selectedFish, setSelectedFish] = useState<UIFish | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [stats, setStats] = useState({ current: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fishTankRef = useRef<HTMLDivElement | null>(null);

  // API 호출 함수
  const fetchData = async () => {
    if (!access_token) return;

    setIsLoading(true);
    setError(null);

    try {
      if (currentView === 'aquarium') {
        const response = await get('/api/v1/collection/aquarium');
        if (!response.ok) throw new Error('수족관 정보를 불러오는데 실패했습니다.');
        const resJson = await response.json();
        const data = resJson.data;

        const converted: UIFish[] = (data.collected_fish as AquariumFishItem[]).map(item => ({
          fish_id: item.fish_id,
          fish_name: item.fish_name,
          grade: item.grade as FishGrade,
          current_count: item.fish_count,
          is_owned: true,
          size: getFishSize(item.grade as FishGrade)
        }));

        setFishList(converted);
        setStats({ current: converted.length, total: 0 }); // 수족관은 종류 수만 표시하거나 총 마리수 표시

      } else {
        // 도감 조회
          const response = await get('/api/v1/collection/encyclopedia');
          if (!response.ok) throw new Error('도감 정보를 불러오는데 실패했습니다.');
          const resJson = await response.json();
          const data = resJson.data;

        const converted: UIFish[] = (data.fish_list as EncyclopediaFishItem[]).map(item => ({
          fish_id: item.fish_id,
          fish_name: item.fish_name,
          grade: item.grade as FishGrade,
          current_count: item.fish_count,
          is_owned: item.is_collected,
          size: getFishSize(item.grade as FishGrade)
        }));

        setFishList(converted);
        setStats({ current: data.collected_count, total: data.total_fish });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userType === 'student') {
      fetchData();
    }
  }, [isAuthenticated, userType, access_token, currentView]);

  const handleFishClick = (fish: UIFish) => {
    setSelectedFish(fish);
    setIsDetailOpen(true);
  };

  useEffect(() => {
    if (currentView !== "aquarium" || isLoading || error) return;

    const tank = fishTankRef.current;
    if (!tank) return;

    while (tank.firstChild) tank.removeChild(tank.firstChild);

    const fishElements: HTMLElement[] = [];
    fishList.forEach((fish) => {
      Array.from({ length: fish.current_count }).forEach(() => {
        const fishContainer = document.createElement("div");
        fishContainer.style.position = "absolute";
        fishContainer.style.width = fish.size + "px";
        fishContainer.style.height = fish.size + "px";
        fishContainer.style.cursor = "pointer";
        fishContainer.onclick = () => handleFishClick(fish);

        const img = document.createElement("img");
        img.src = `${IMG_URL}`;
        img.alt = fish.fish_name;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";

        img.onerror = (e: any) => {
          (e.target as HTMLImageElement).style.display = 'none';
          const fallbackText = document.createElement("span");
          fallbackText.innerText = "🐟";
          fallbackText.style.fontSize = `${fish.size / 1.5}px`;
          fallbackText.style.display = "block";
          fallbackText.style.textAlign = "center";
          fishContainer.appendChild(fallbackText);
        };
        fishContainer.appendChild(img);
        tank.appendChild(fishContainer);
        fishElements.push(fishContainer); // 물고기 요소 배열에 추가

        setRandomPosition(fishContainer, tank);
        moveFishRandomly(fishContainer, tank);
      });
    });

    return () => {
      fishElements.forEach(fish => clearTimeout((fish as any).moveTimer));
    };
  }, [currentView, fishList, isLoading])

  function setRandomPosition(fish: HTMLElement, tank: HTMLDivElement) {
    const rect = tank.getBoundingClientRect();
    const padding = 10;
    fish.style.left = Math.random() * (rect.width - fish.offsetWidth - padding * 2) + padding + "px";
    fish.style.top = Math.random() * (rect.height - fish.offsetHeight - padding * 2) + padding + "px";
  }

  function moveFishRandomly(fish: HTMLElement, tank: HTMLDivElement) {
    const animate = () => {
      const rect = tank.getBoundingClientRect();
      const oldX = parseFloat(fish.style.left) || 0;
      const padding = 10;
      const newX = Math.random() * (rect.width - fish.offsetWidth - padding * 2) + padding;
      const newY = Math.random() * (rect.height - fish.offsetWidth - padding * 2) + padding;

      fish.style.transform = newX > oldX ? "scaleX(1)" : "scaleX(-1)";
      fish.style.transition = "left 6s linear, top 6s linear";
      fish.style.left = `${newX}px`;
      fish.style.top = `${newY}px`;

      if ((fish as any).moveTimer) clearTimeout((fish as any).moveTimer);
      (fish as any).moveTimer = setTimeout(animate, 3000 + Math.random() * 3000);
    };
    animate();
  }

  const getRarityBadge = (grade: FishGrade) => {
    let bgClass = "bg-gray-400";
    if (grade === 'RARE') bgClass = "bg-blue-500";
    if (grade === 'LEGENDARY') bgClass = "bg-yellow-600";

    return <Badge className={bgClass}>{grade}</Badge>;
  };

  //로그인 여부 확인
  if (!isAuthenticated || !user) {
    return <div className="p-6">로그인 정보 확인 중...</div>;
  }

  if (userType !== 'student') {
    return <div className="p-6">접근 권한이 없습니다.</div>;
  }
  if (isLoading) return <div className="p-4">컬렉션 정보 로딩 중...</div>;
  if (error) return <div className="p-4" style={{ color: "red" }}>오류: {error}</div>;

  return (
    <div className="p-4 space-y-4 pb-20 max-w-screen-xl mx-auto" style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}>
      <menu role="tablist" style={{ margin: "0 0 -2px 0" }}>
        <li role="tab" aria-selected={currentView === 'aquarium'}>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('aquarium'); }}>수족관</a>
        </li>
        <li role="tab" aria-selected={currentView === 'book'}>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('book'); }}>도감</a>
        </li>
      </menu>

      {/* 메인 윈도우 */}
      <div className="window" role="tabpanel" style={{ width: "100%", margin: "0" }}>
        <div className="window-body">

          {/* 수족관 뷰 */}
          {currentView === 'aquarium' && (
            <>
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                내 수족관: 총 {fishList.reduce((acc, cur) => acc + cur.current_count, 0)}마리 헤엄치는 중
              </div>

              <div className="sunken-panel" style={{ width: "100%", height: "300px", background: "#e0f7fa", position: "relative", overflow: "hidden" }} ref={fishTankRef}>
                {/* 수조 */}
              </div>
            </>
          )}

          {/* 도감 뷰 */}
          {currentView === 'book' && (
            <>
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                수집 진행도: {stats.current} / {stats.total} ({((stats.current / stats.total) * 100).toFixed(1)}%)
              </div>

              <div className="sunken-panel" style={{ height: "400px", overflowY: "scroll", padding: "10px", background: "#fff" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
                  {fishList.map((fish) => (
                    <div
                      key={fish.fish_id}
                      className="window"
                      onClick={() => fish.is_owned && handleFishClick(fish)}
                      style={{
                        cursor: fish.is_owned ? "pointer" : "default",
                        opacity: fish.is_owned ? 1 : 0.5,
                        backgroundColor: fish.is_owned ? "#fff" : "#eee"
                      }}
                    >
                      <div className="window-body" style={{ textAlign: "center", padding: "5px" }}>
                        <div style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "5px" }}>
                          {fish.is_owned ? (
                            <img
                              src={`${IMG_URL}`}
                              alt={fish.fish_name}
                              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                                e.currentTarget.parentElement!.innerText = "🐟";
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: "30px" }}>❓</span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {fish.fish_name}
                        </div>
                        <div style={{ fontSize: "10px", marginTop: "2px", color: getGradeColor(fish.grade) }}>
                          {fish.grade}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* [모달] 물고기 상세 정보 */}
      {isDetailOpen && selectedFish && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="window" style={{ width: '90%', maxWidth: '300px' }}>
            <div className="title-bar">
              <div className="title-bar-text">상세 정보</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={() => setIsDetailOpen(false)} />
              </div>
            </div>
            <div className="window-body text-center">
              <div className="sunken-panel" style={{ width: "100px", height: "100px", margin: "0 auto 10px auto", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                <img
                  src={`${IMG_URL}`}
                  alt={selectedFish.fish_name}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    e.currentTarget.parentElement!.innerText = "🐟";
                  }}
                />
              </div>
              <h4 style={{ margin: "5px 0" }}>{selectedFish.fish_name}</h4>
              <div style={{ marginBottom: "10px" }}>{getRarityBadge(selectedFish.grade)}</div>
              <fieldset>
                <legend>정보</legend>
                <p style={{ fontSize: "12px", margin: "4px 0" }}>보유 수량: {selectedFish.current_count}마리</p>
                <p style={{ fontSize: "12px", margin: "4px 0" }}>등급: {selectedFish.size}</p>
              </fieldset>
              <div style={{ marginTop: "15px" }}>
                <button onClick={() => setIsDetailOpen(false)}>닫기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}