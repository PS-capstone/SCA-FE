import { Card, CardContent } from "../ui/card";

interface ClassCardProps {
  id: number;
  name: string;
  studentCount: number;
  activeQuests: number;
  onClick?: (id: number) => void;
  className?: string;
}

export function ClassCard({ 
  id, 
  name, 
  studentCount, 
  activeQuests, 
  onClick,
  className = ""
}: ClassCardProps) {
  return (
    <Card 
      className={`border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => onClick?.(id)}
    >
      <CardContent className="p-6">
        <h3 className="mb-4">{name}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2">
            <span className="text-gray-600">학생 수</span>
            <span className="font-medium">{studentCount}명</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">진행 중인 퀘스트</span>
            <span className="font-medium">{activeQuests}개</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
