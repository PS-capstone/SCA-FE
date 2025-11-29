import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StudentListItem } from "../common/StudentListItem";
import { get, put } from "../../utils/api";
import { useAuth } from "../../contexts/AppContext";
import { Loader2, Save, X, Pencil } from "lucide-react";

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
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1>학생 목록</h1>
              <p className="text-gray-600 mt-1">
                {listData.class_name} - 총 {listData.student_count}명
              </p>
            </div>
            {/* 우측 상단 버튼 영역 */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleEditToggle}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    저장
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  성적 입력
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {isEditing ? (
              // 수정 모드: Coral/Data는 읽기 전용, Grade는 입력 가능
              editedStudents.length > 0 ? (
                editedStudents.map((student) => (
                  <div key={student.student_id} className="border rounded-lg p-4 shadow-sm bg-white border-blue-200 ring-2 ring-blue-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-lg">{student.name}</span>
                    </div>

                    <div className="space-y-4">
                      {/* 읽기 전용 정보 (Coral, Research Data) */}
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <div>
                          <span className="block text-xs text-gray-400">코랄</span>
                          <span className="font-medium">{student.coral}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-400">탐사데이터</span>
                          <span className="font-medium">{student.research_data}</span>
                        </div>
                      </div>

                      {/* 수정 가능한 정보 (Grade) */}
                      <div>
                        <label className="block text-sm font-bold text-blue-700 mb-1">
                          Grade (성적)
                        </label>
                        <input
                          type="number"
                          value={student.grade}
                          onChange={(e) => handleInputChange(student.student_id, e.target.value)}
                          placeholder="점수 입력"
                          className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-right"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center py-10">학생이 없습니다.</p>
              )
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
                <p className="text-gray-500 col-span-full text-center py-10">
                  반에 등록된 학생이 없습니다.
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}