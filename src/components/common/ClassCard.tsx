import React from "react";
import { Card, CardContent } from "../ui/card";

interface ClassCardProps {
  class_id: number;
  class_name: string;
  student_count: number;
  pending_quests: number;
  onClick?: (id: number) => void;
  className?: string;
}

function ClassCardInner({
  class_id,
  class_name,
  student_count,
  pending_quests= 0,
  onClick,
  className = ""
}: ClassCardProps) {
  return (
    <Card
      className={`
        border-2 border-gray-300 rounded-lg cursor-pointer hover:shadow-lg transition-all 
        bg-white w-full h-full flex flex-col
        ${className}
      `}
      onClick={() => onClick?.(class_id)}
    >
      <CardContent className="p-6 flex flex-col h-full justify-between">
        <h3 className="text-lg font-bold mb-4" title={class_name}>
          {class_name}
        </h3>
        <div className="space-y-3 text-sm mt-auto">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="text-gray-600">학생 수</span>
            <span className="text-base">{student_count}명</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">승인 대기중인 퀘스트</span>
            <span className={`text-base ${pending_quests > 0 ? 'text-red-600 font-bold' : ''}`}>
              {pending_quests}개
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const ClassCard = React.memo(ClassCardInner);
