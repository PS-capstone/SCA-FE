import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StudentListItem } from "../common/StudentListItem";
import { get, put } from "../../utils/api";
import { useAuth } from "../../contexts/AppContext";
import { Loader2, Save, X, Pencil } from "lucide-react";
import { Button } from '../ui/button';

interface ApiStudent {
  student_id: number;
  name: string;
  pending_quests: number;
  coral: number;
  research_data: number;
  grade: number;
}

interface StudentListData {
  class_id: number;
  class_name: string;
  student_count: number;
  students: ApiStudent[];
}

export function StudentListPage() {
  const navigate = useNavigate();
  const { classId: urlClassId } = useParams<{ classId?: string }>();
  const { currentClassId, access_token } = useAuth();

  const [listData, setListData] = useState<StudentListData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedStudents, setEditedStudents] = useState<ApiStudent[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // 데이터 로드
  const fetchStudents = async (targetId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await get(`/api/v1/classes/${targetId}/students`);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "학생 목록을 불러오는데 실패했습니다.");
      }
      const data = await response.json();
      if (data.success) {
        setListData(data.data);
        // 데이터를 불러올 때 에디팅용 State도 초기화
        setEditedStudents(data.data.students);
      } else {
        throw new Error(data.message || "데이터 포맷 오류");
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentClassId || !access_token) {
      setError("반 정보를 불러올 수 없습니다. (인증 오류)");
      setIsLoading(false);
      return;
    }

    // 1. 조회할 반 ID 결정 (URL 파라미터 우선 -> 없으면 전역 상태 사용)
    let targetClassId: number | null = null;

    if (urlClassId) {
      const parsed = Number(urlClassId);
      if (!isNaN(parsed)) {
        targetClassId = parsed;
      }
    }

    if (!targetClassId && currentClassId) {
      targetClassId = Number(currentClassId);
    }

    // 2. 유효한 ID가 없으면 반 관리 페이지로 리다이렉트
    if (!targetClassId) {
      navigate('/teacher/class', { replace: true });
      return;
    }

    if (!access_token) {
      setError("접근 권한이 없습니다. (로그인 필요)");
      setIsLoading(false);
      return;
    }

    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await get(
          `/api/v1/classes/${targetClassId}/students`
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "학생 목록을 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        if (data.success) {
          setListData(data.data);
        } else {
          throw new Error(data.message || "데이터 포맷 오류");
        }
      } catch (err: any) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [urlClassId, currentClassId, access_token, navigate]);

  // --- 수정 모드 진입/취소 ---
  const handleEditToggle = () => {
    if (listData) {
      setEditedStudents(listData.students.map(s => ({ ...s })));
    }
    setIsEditing(!isEditing);
  };

  // --- 입력 값 변경 ---
  const handleInputChange = (studentId: number, value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) return; // 음수 방지 및 숫자 체크

    setEditedStudents((prev) =>
      prev.map((student) =>
        student.student_id === studentId
          ? { ...student, grade: numValue }
          : student
      )
    );
  };

  // --- 저장 ---
  const handleSave = async () => {
    if (!listData) return;

    // 1. 변경된 데이터만 필터링 (최적화)
    const changedStudents = editedStudents.filter(edited => {
      const original = listData.students.find(s => s.student_id === edited.student_id);
      // 값이 변경된 경우만 추출
      return original && original.grade !== edited.grade;
    });

    // 변경사항이 없으면 바로 모드 종료
    if (changedStudents.length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      // 2. API 요청 데이터 구성
      const payload = {
        student_scores: changedStudents.map(s => ({
          student_id: s.student_id,
          initial_score: s.grade // UI의 'grade'를 API의 'initial_score'로 매핑
        }))
      };

      // 3. PUT 요청 전송
      const response = await put(`/api/v1/classes/${listData.class_id}/students`, payload);

      if (!response.ok) {
        throw new Error("저장에 실패했습니다.");
      }

      const resData = await response.json();

      if (resData.success) {
        // 4. 성공 시 목록 갱신 (변경된 계수 등 최신 데이터 반영)
        await fetchStudents(listData.class_id);
        setIsEditing(false);
        alert("성적이 저장되었습니다.");
      } else {
        throw new Error(resData.message || "저장 실패");
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        학생 목록을 불러오는 중...
      </div>
    );
  }
  // 에러 발생
  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 font-medium mb-2">오류: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-red-600 underline hover:text-red-800"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  // 데이터가 없을 때
  if (!listData) {
    return <div className="flex-1 p-6">학생 데이터를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white p-4 md:px-6 md:py-5 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">학생 목록</h1>
          <p className="text-sm text-gray-500 mt-1">
            {listData.class_name} - 총 {listData.student_count}명
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleEditToggle}
                disabled={isSaving}
                className="h-9 border-gray-200 hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                취소
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                저장
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEditToggle}
              className="h-9 bg-green-600 hover:bg-green-700 text-white"
            >
              <Pencil className="w-4 h-4 mr-2" />
              성적 입력
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          <div className="grid grid-cols-1 lg:!grid-cols-2 gap-6">
            {isEditing ? (
              // 수정 모드
              editedStudents.map((student) => (
                <div key={student.student_id} className="border border-blue-200 bg-white rounded-lg p-5 shadow-sm ring-1 ring-blue-100">
                  <div className="font-bold text-lg text-gray-900 mb-4">{student.name}</div>
                  <div className="space-y-4">
                     <div className="grid !grid-cols-2 gap-3 text-sm bg-gray-50 p-2 rounded border border-gray-100">
                        <div><span className="text-xs text-gray-500">코랄: </span><span className="font-mono font-bold"> {student.coral}</span></div>
                        <div><span className="text-xs text-gray-500">탐사 데이터: </span><span className="font-mono font-bold"> {student.research_data}</span></div>
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-blue-700 mb-1">성적</label>
                        <input
                          type="number"
                          value={student.grade}
                          onChange={(e) => handleInputChange(student.student_id, e.target.value)}
                          className="w-full h-10 p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-right font-bold"
                        />
                     </div>
                  </div>
                </div>
              ))
            ) : (
              // 조회 모드
              listData.students.length > 0 ? (
                 listData.students.map((student) => (
                    <StudentListItem
                       key={student.student_id}
                       id={student.student_id}
                       name={student.name}
                       pending_quests={student.pending_quests}
                       coral={student.coral}
                       research_data={student.research_data}
                       classId={listData.class_id}
                       grade={student.grade}
                    />
                 ))
              ) : (
                 <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-dashed rounded-lg">학생 없음</div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}