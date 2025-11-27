import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { User, ArrowLeft, Loader2, Save, Lock, Trash2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { get, patch, post, apiCall } from "../../utils/api";
import { useAuth } from "../../contexts/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";

interface TeacherProfile {
  teacher_id: number;
  username: string;
  real_name: string;
  nickname: string;
  email: string;
  role: string;
  created_at: string;
}

export function TeacherProfilePage() {
  const navigate = useNavigate();
  const { access_token, logout } = useAuth();

  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    real_name: "",
    nickname: "",
    email: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  // 비밀번호 변경 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 회원 탈퇴 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // 프로필 조회
  const fetchProfile = async () => {
    if (!access_token) {
      setIsLoading(false);
      setError("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await get('/api/v1/auth/me');

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
        }
        const errData = await response.json();
        throw new Error(errData.message || "내 정보를 불러오는데 실패했습니다.");
      }

      const json = await response.json();
      if (json.success) {
        const data = json.data;
        // 선생님 데이터 매핑
        const teacherProfile: TeacherProfile = {
          teacher_id: data.teacher_id,
          username: data.username,
          real_name: data.real_name,
          nickname: data.nickname,
          email: data.email,
          role: data.role,
          created_at: data.created_at,
        };
        setProfile(teacherProfile);
        // 수정 폼 초기화
        setEditForm({
          real_name: teacherProfile.real_name,
          nickname: teacherProfile.nickname,
          email: teacherProfile.email
        });
      } else {
        throw new Error(json.message || "데이터 형식이 올바르지 않습니다.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [access_token, logout]);

  // 회원 정보 수정 핸들러
  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const response = await patch('/api/v1/auth/me', editForm);
      const json = await response.json();

      if (response.ok && json.success) {
        alert("회원 정보가 수정되었습니다.");
        setIsEditing(false);
        fetchProfile(); // 최신 정보 다시 불러오기
      } else {
        throw new Error(json.message || "수정에 실패했습니다.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 비밀번호 변경 핸들러
  const handleChangePassword = async () => {
    setPasswordError(null);

    // 유효성 검사 (프론트엔드 1차)
    if (passwordForm.new_password.length < 8) {
      setPasswordError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(passwordForm.new_password);
    const hasNumber = /[0-9]/.test(passwordForm.new_password);
    if (!hasLetter || !hasNumber) {
      setPasswordError("비밀번호는 영문과 숫자를 포함해야 합니다.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await post('/api/v1/auth/password/change', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      const json = await response.json();

      if (response.ok && json.success) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        setIsPasswordModalOpen(false);
        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      } else {
        // 에러 메시지 처리
        if (json.errors && json.errors.message) {
          setPasswordError(json.errors.message);
        } else {
          setPasswordError(json.message || "비밀번호 변경 실패");
        }
      }
    } catch (err) {
      setPasswordError("서버 통신 오류가 발생했습니다.");
    }
  };

  // 회원 탈퇴 핸들러
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (!confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      const response = await apiCall('/api/v1/auth/me', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword })
      });

      const json = await response.json();

      if (response.ok && json.success) {
        alert("회원 탈퇴가 완료되었습니다.");
        logout();
        navigate('/');
      } else {
        alert(json.message || "탈퇴 실패: 비밀번호를 확인해주세요.");
      }
    } catch (err) {
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        내 정보를 불러오는 중...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 flex flex-col justify-center items-center h-screen gap-4">
        <p className="text-red-600">{error || "프로필 정보가 없습니다."}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          돌아가기
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black">회원정보 수정</h1>
            <p className="text-gray-600 mt-1">개인정보를 수정할 수 있습니다</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* 기본 정보 카드 */}
        <Card className="border-2 border-gray-300">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-black">
                <User className="w-5 h-5" />
                기본 정보
              </CardTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  정보 수정
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 프로필 요약 */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
                {profile.real_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold">{profile.real_name} ({profile.nickname})</h3>
                <p className="text-sm text-gray-600">@{profile.username}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    가입일: {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 수정 가능한 정보 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="real_name" className="text-gray-600">이름</Label>
                  <Input
                    id="real_name"
                    value={editForm.real_name}
                    onChange={(e) => setEditForm({ ...editForm, real_name: e.target.value })}
                    disabled={!isEditing}
                    className={isEditing ? "bg-white" : "bg-gray-50"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-gray-600">닉네임</Label>
                  <Input
                    id="nickname"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                    disabled={!isEditing}
                    className={isEditing ? "bg-white" : "bg-gray-50"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-600">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    disabled={!isEditing}
                    className={isEditing ? "bg-white" : "bg-gray-50"}
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  setEditForm({ // 취소 시 원래 값으로 복구
                    real_name: profile.real_name,
                    nickname: profile.nickname,
                    email: profile.email
                  });
                }}>취소</Button>
                <Button onClick={handleUpdateProfile} disabled={isSaving} className="bg-black text-white hover:bg-gray-800">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  저장하기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 계정 보안 및 관리 (비밀번호 변경, 탈퇴) */}
        <Card className="border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Lock className="w-5 h-5" />
              보안 및 계정 관리
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">비밀번호 변경</h4>
                <p className="text-sm text-gray-500">주기적으로 비밀번호를 변경하여 계정을 보호하세요.</p>
              </div>
              <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>변경</Button>
            </div>

            <div className="flex justify-between items-center p-3 border border-red-200 bg-red-50 rounded-lg">
              <div>
                <h4 className="font-medium text-red-700">회원 탈퇴</h4>
                <p className="text-sm text-red-500">계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
              </div>
              <Button
                variant="destructive"
                className="bg-white text-red-600 border-2 border-red-200 hover:bg-red-100"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                탈퇴하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 비밀번호 변경 모달 */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
            <DialogDescription>
              현재 비밀번호와 새로운 비밀번호를 입력해주세요. (8자 이상, 영문+숫자 포함)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">현재 비밀번호</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_password">새 비밀번호</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="8자 이상, 영문+숫자 포함"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">새 비밀번호 확인</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              />
            </div>
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>취소</Button>
            <Button onClick={handleChangePassword} className="bg-black text-white hover:bg-gray-800">변경하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 회원 탈퇴 모달 */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md border-red-200">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              회원 탈퇴
            </DialogTitle>
            <DialogDescription>
              정말로 탈퇴하시겠습니까? 본인 확인을 위해 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete_password">비밀번호 확인</Label>
              <Input
                id="delete_password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>취소</Button>
            <Button onClick={handleDeleteAccount} className="bg-red-600 text-white hover:bg-red-700">탈퇴하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
