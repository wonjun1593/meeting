import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';

// Agent 데이터를 기반으로 예시 일정 데이터 생성
function generateDemoData(agentData) {
  const participants = agentData.participants;
  const title = agentData.title;
  
  // 각 참여자별 예시 일정 생성
  const demoEvents = [];
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
  
  participants.forEach((participant, index) => {
    const color = colors[index % colors.length];
    
    // 각 참여자당 3-5개의 일정 생성
    const eventCount = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < eventCount; i++) {
      const day = Math.floor(Math.random() * 5); // 월~금
      const startHour = 9 + Math.floor(Math.random() * 8); // 9시~17시
      const duration = 0.5 + Math.random() * 2; // 0.5~2.5시간
      
      const eventTitles = [
        `${participant}님의 개인 미팅`,
        `${participant}님의 프로젝트 회의`,
        `${participant}님의 클라이언트 상담`,
        `${participant}님의 팀 미팅`,
        `${participant}님의 리뷰 미팅`
      ];
      
      demoEvents.push({
        id: `demo-${participant}-${i}`,
        participant: participant,
        day: day,
        start: startHour,
        end: startHour + duration,
        title: eventTitles[i % eventTitles.length],
        color: color,
        mandatory: Math.random() > 0.5 // 50% 확률로 필수 일정
      });
    }
  });
  
  return demoEvents;
}

function UserDemoView({ agentData, onInviteClick }) {
  const demoEvents = generateDemoData(agentData);
  const DAYS = ['월', '화', '수', '목', '금'];
  const START_HOUR = 9;
  const END_HOUR = 18;
  
  // 시간대별로 이벤트 그룹화
  const eventsByDay = {};
  DAYS.forEach((_, dayIndex) => {
    eventsByDay[dayIndex] = demoEvents.filter(event => event.day === dayIndex);
  });
  
  return (
    <div className="space-y-6">
      {/* 모임 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {agentData.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">참석자</span>
              <span className="text-sm text-gray-600">{agentData.participants.join(', ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">예상 시간</span>
              <span className="text-sm text-gray-600">1-2시간</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">장소</span>
              <span className="text-sm text-gray-600">2번 회의실</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 참석자별 일정 */}
      <Card>
        <CardHeader>
          <CardTitle>참석자별 일정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentData.participants.map((participant, index) => {
              const participantEvents = demoEvents.filter(event => event.participant === participant);
              return (
                <div key={participant} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: participantEvents[0]?.color || '#3B82F6' }}
                    ></div>
                    <h3 className="font-semibold">{participant}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {participantEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="bg-gray-50 rounded-lg p-3 text-sm"
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-gray-600">
                          {DAYS[event.day]} {Math.floor(event.start)}:{event.start % 1 === 0 ? '00' : '30'} - {Math.floor(event.end)}:{event.end % 1 === 0 ? '00' : '30'}
                        </div>
                        {event.mandatory && (
                          <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            필수
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* 액션 버튼 */}
      <div className="flex justify-center gap-4">
        <Button onClick={onInviteClick} className="px-6">
          새로운 일정 초대하기
        </Button>
        <Button variant="outline" className="px-6">
          일정 조율하기
        </Button>
      </div>
    </div>
  );
}

function EmptyStateView({ onInviteClick }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="text-center">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">일정 초대</h2>
        <p className="text-gray-600 mb-6">
          AI Agent를 통해 새로운 일정을 초대해보세요
        </p>
        <Button onClick={onInviteClick} size="lg" className="px-8">
          일정 초대하기
        </Button>
      </div>
    </div>
  );
}

export { UserDemoView, EmptyStateView };
