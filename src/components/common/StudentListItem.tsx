import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface StudentListItemProps {
  id: number;
  name: string;
  pending_quests: number;
  coral: number;
  research_data: number;
  classId: number;
  grade?: number;
}

function StudentListItemInner({
  id,
  name,
  pending_quests = 0,
  coral,
  research_data,
  classId,
  grade = 0
}: StudentListItemProps) {
  const navigate = useNavigate();

  return (
    <Card
      className={`border-2 border-gray-300 rounded-lg cursor-default`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1">
            <h4>{name}</h4>
            {pending_quests > 0 && (
              <Badge className="mt-1 bg-black text-white rounded-lg">
                승인 요청 {pending_quests}건
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm border-t-2 border-gray-300 pt-3">
          <div className="flex justify-between">
            <span className="text-gray-600">코랄</span>
            <span>{coral}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">탐사데이터</span>
            <span>{research_data}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">점수</span>
            <span>{grade}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export const StudentListItem = React.memo(StudentListItemInner);
