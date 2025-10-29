import { useState, useEffect } from 'react'
import MeetingSchedulerMVP from '../MeetingSchedulerMVP.jsx'
import AgentScheduler from './components/AgentScheduler.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

function App() {
  const [activeTab, setActiveTab] = useState('agent')
  const [agentData, setAgentData] = useState(null) // Agent에서 생성된 데이터 저장
  const [showTutorial, setShowTutorial] = useState(false) // 튜토리얼 팝업 표시 상태
  const [showOrganizerTutorialOnCalendar, setShowOrganizerTutorialOnCalendar] = useState(false) // 캘린더 탭 진입 시 모임장 튜토리얼 표시

  // 매번 튜토리얼 팝업 표시
  useEffect(() => {
    setShowTutorial(true)
  }, [])

  const handleAgentCompose = (payload) => {
    console.log('일정 초대 요청:', payload);
    setAgentData(payload); // Agent 데이터 저장
    setActiveTab('calendar'); // 캘린더 탭으로 이동
    setShowOrganizerTutorialOnCalendar(true); // 모임장 튜토리얼 표시
  };

  const closeTutorial = () => {
    setShowTutorial(false)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        {/* 탭 네비게이션 */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('agent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'agent' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            AI 일정 초대 Agent
          </button>
          <button
            onClick={() => {
              setActiveTab('calendar');
              setShowOrganizerTutorialOnCalendar(true);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'calendar' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            캘린더 스케줄러
          </button>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1">
        {activeTab === 'calendar' && <MeetingSchedulerMVP agentData={agentData} showOrganizerTutorialOnCalendar={showOrganizerTutorialOnCalendar} onCloseOrganizerTutorial={() => setShowOrganizerTutorialOnCalendar(false)} />}
        {activeTab === 'agent' && (
          <div className="p-2">
            <div className="max-w-full mx-auto">
              <h1 className="text-2xl font-bold text-slate-900 mb-4 px-4">AI 일정 초대 Agent</h1>
              <AgentScheduler 
                onComposeSchedule={handleAgentCompose}
              />
            </div>
          </div>
        )}
      </div>

      {/* 튜토리얼 팝업 */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            {/* 닫기 버튼 */}
            <button
              onClick={closeTutorial}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 튜토리얼 내용 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                AI 일정 초대 Agent 🤖
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                Agent와 대화를 통해 일정을 예약해보세요.<br/>
                예시 버튼을 이용하여 편하게 예약해보세요.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold shrink-0">1</div>
                  <span className="text-left">참여자 이름을 입력해보세요.<br/>(또는, 예제 명령을 클릭하세요.)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">2</div>
                  <span>모임 이름을 정해보세요.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">3</div>
                  <span>초대장을 보내보세요</span>
                </div>
              </div>

              <button
                onClick={closeTutorial}
                className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  )
}

export default App
