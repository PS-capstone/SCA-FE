import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, Settings, Users } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ClassCard } from "../common/ClassCard";

export function TeacherDashboardNew() {
  const navigate = useNavigate();
  const classes = [
    { id: 1, name: "중등 1반", studentCount: 15, activeQuests: 3 },
    { id: 2, name: "중등 2반", studentCount: 12, activeQuests: 2 },
    { id: 3, name: "고등 1반", studentCount: 18, activeQuests: 5 },
    { id: 4, name: "고등 2반", studentCount: 14, activeQuests: 4 },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      
      <div className="flex-1 border-l-2 border-gray-300">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-6">
          <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
            <div>
              <h1>대시보드</h1>
              <p className="text-gray-600 mt-1">선생님 이름</p>
            </div>
            <Button 
              variant="outline" 
              className="border-2 border-gray-300 rounded-lg hover:bg-gray-100"
              onClick={() => navigate('/teacher/profile')}
            >
              <Settings className="w-4 h-4 mr-2" />
              회원정보 수정
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2>반 목록</h2>
            <Button 
              className="bg-black hover:bg-gray-800 text-white rounded-lg"
              onClick={() => navigate('/teacher/class/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              반 생성하기
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {classes.map((classItem) => (
              <ClassCard
                key={classItem.id}
                id={classItem.id}
                name={classItem.name}
                studentCount={classItem.studentCount}
                activeQuests={classItem.activeQuests}
                onClick={() => navigate(`/teacher/class`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}