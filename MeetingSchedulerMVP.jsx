import React, { useMemo, useState, useRef } from "react";

/**
 * MeetingSchedulerMVP — 전체 기능 복원 + 겹침 선택 팝업 + 오버레이(필수/삭제)
 * 변경점: "공통 빈 시간"의 녹색 시각화(하이라이트 박스)만 제거하고,
 *         기능(계산/리스트/필터)은 모두 유지합니다.
 */

export default function MeetingSchedulerMVP() {
  // ====== 상수 ======
  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
  const START_HOUR = 9;
  const END_HOUR = 19; // exclusive

  const palette = [
    "#60a5fa", // 원준
    "#f472b6", // 유진
    "#34d399", // 지은
    "#fbbf24",
    "#a78bfa",
  ];

  // ====== 샘플 데이터 ======
  const initialParticipants = [
    {
      id: "p1",
      name: "황원준",
      color: palette[0],
      events: [
        { id: "e1", day: 1, start: 9.0, end: 10.5, title: "주간 킥오프", mandatory: false },
        { id: "e2", day: 2, start: 13.0, end: 14.0, title: "클라이언트 콜", mandatory: false },
        { id: "e3", day: 4, start: 15.0, end: 16.5, title: "디자인 리뷰", mandatory: false },
      ],
    },
    {
      id: "p2",
      name: "정유진",
      color: palette[1],
      events: [
        { id: "e4", day: 1, start: 10.0, end: 12.0, title: "세일즈 미팅", mandatory: false },
        { id: "e5", day: 3, start: 9.5, end: 11.0, title: "콘텐츠 기획", mandatory: false },
        { id: "e6", day: 4, start: 15.5, end: 17.0, title: "파트너 협의", mandatory: false },
      ],
    },
    {
      id: "p3",
      name: "한지은",
      color: palette[2],
      events: [
        { id: "e7", day: 2, start: 13.0, end: 15.0, title: "촬영 스케줄", mandatory: false },
        { id: "e8", day: 3, start: 11.0, end: 12.5, title: "브랜드 미팅", mandatory: false },
        { id: "e9", day: 5, start: 9.0, end: 10.0, title: "계약서 검토", mandatory: false },
      ],
    },
  ];

  // 10명 참여자 데이터
  const largeParticipants = [
    {
      id: "p1", name: "김철수", color: "#3B82F6", mandatory: true,
      events: [
        { id: "e1", day: 0, start: 9.0, end: 10.0, title: "팀 미팅", mandatory: true },
        { id: "e2", day: 0, start: 10.5, end: 11.5, title: "고객 상담", mandatory: false },
        { id: "e3", day: 0, start: 14.0, end: 15.0, title: "코드 리뷰", mandatory: false },
        { id: "e4", day: 1, start: 9.5, end: 10.5, title: "프로젝트 검토", mandatory: true },
        { id: "e5", day: 1, start: 11.0, end: 12.0, title: "기술 세미나", mandatory: false },
        { id: "e6", day: 2, start: 9.0, end: 10.0, title: "아키텍처 설계", mandatory: true },
        { id: "e7", day: 2, start: 10.5, end: 11.5, title: "성능 최적화", mandatory: false },
        { id: "e8", day: 3, start: 14.5, end: 15.5, title: "기획 회의", mandatory: true },
        { id: "e9", day: 4, start: 9.0, end: 10.0, title: "데이터 분석", mandatory: false },
        { id: "e10", day: 4, start: 10.5, end: 11.5, title: "프레젠테이션", mandatory: true },
      ],
    },
    {
      id: "p2", name: "이영희", color: "#EF4444", mandatory: true,
      events: [
        { id: "e11", day: 0, start: 9.0, end: 10.0, title: "팀 미팅", mandatory: true },
        { id: "e12", day: 0, start: 10.5, end: 11.5, title: "디자인 리뷰", mandatory: false },
        { id: "e13", day: 0, start: 14.5, end: 15.5, title: "사용자 테스트", mandatory: false },
        { id: "e14", day: 1, start: 9.0, end: 10.0, title: "마케팅 회의", mandatory: true },
        { id: "e15", day: 1, start: 11.5, end: 12.5, title: "브랜드 전략", mandatory: false },
        { id: "e16", day: 2, start: 9.5, end: 10.5, title: "콘텐츠 기획", mandatory: false },
        { id: "e17", day: 2, start: 14.0, end: 15.0, title: "프로토타입", mandatory: false },
        { id: "e18", day: 3, start: 10.0, end: 11.0, title: "사용성 테스트", mandatory: true },
        { id: "e19", day: 3, start: 11.5, end: 12.5, title: "결과 분석", mandatory: false },
        { id: "e20", day: 4, start: 9.0, end: 10.0, title: "프레젠테이션", mandatory: true },
      ],
    },
    {
      id: "p3", name: "박민수", color: "#10B981", mandatory: true,
      events: [
        { id: "e21", day: 0, start: 9.0, end: 10.0, title: "팀 미팅", mandatory: true },
        { id: "e22", day: 0, start: 11.0, end: 12.0, title: "기술 세미나", mandatory: false },
        { id: "e23", day: 0, start: 15.5, end: 16.5, title: "코드 리뷰", mandatory: false },
        { id: "e24", day: 1, start: 9.5, end: 10.5, title: "아키텍처 설계", mandatory: true },
        { id: "e25", day: 1, start: 11.0, end: 12.0, title: "데이터 분석", mandatory: false },
        { id: "e26", day: 2, start: 9.0, end: 10.0, title: "성능 최적화", mandatory: true },
        { id: "e27", day: 2, start: 10.5, end: 11.5, title: "시스템 모니터링", mandatory: false },
        { id: "e28", day: 3, start: 11.0, end: 12.0, title: "기술 검토", mandatory: false },
        { id: "e29", day: 3, start: 14.0, end: 15.0, title: "최적화 회의", mandatory: true },
        { id: "e30", day: 4, start: 9.5, end: 10.5, title: "프로젝트 마무리", mandatory: true },
      ],
    },
    {
      id: "p4", name: "정수진", color: "#F59E0B", mandatory: false,
      events: [
        { id: "e31", day: 0, start: 10.0, end: 11.0, title: "고객 지원", mandatory: false },
        { id: "e32", day: 0, start: 11.5, end: 12.5, title: "품질 관리", mandatory: true },
        { id: "e33", day: 1, start: 9.0, end: 10.0, title: "테스트 계획", mandatory: false },
        { id: "e34", day: 1, start: 10.5, end: 11.5, title: "버그 수정", mandatory: false },
        { id: "e35", day: 2, start: 9.5, end: 10.5, title: "문서화", mandatory: false },
        { id: "e36", day: 2, start: 14.5, end: 15.5, title: "테스트 실행", mandatory: true },
        { id: "e37", day: 3, start: 9.0, end: 10.0, title: "품질 검토", mandatory: true },
        { id: "e38", day: 3, start: 11.0, end: 12.0, title: "팀 빌딩", mandatory: false },
        { id: "e39", day: 4, start: 10.0, end: 11.0, title: "최종 검토", mandatory: false },
        { id: "e40", day: 4, start: 11.5, end: 12.5, title: "보고서 작성", mandatory: false },
      ],
    },
    {
      id: "p5", name: "최지훈", color: "#8B5CF6", mandatory: false,
      events: [
        { id: "e41", day: 0, start: 9.5, end: 10.5, title: "보안 점검", mandatory: true },
        { id: "e42", day: 0, start: 11.0, end: 12.0, title: "인프라 관리", mandatory: false },
        { id: "e43", day: 1, start: 9.0, end: 10.0, title: "모니터링 설정", mandatory: false },
        { id: "e44", day: 1, start: 10.5, end: 11.5, title: "시스템 업데이트", mandatory: false },
        { id: "e45", day: 2, start: 9.0, end: 10.0, title: "백업 검토", mandatory: true },
        { id: "e46", day: 2, start: 11.0, end: 12.0, title: "보안 강화", mandatory: false },
        { id: "e47", day: 3, start: 9.5, end: 10.5, title: "인프라 점검", mandatory: true },
        { id: "e48", day: 3, start: 14.0, end: 15.0, title: "시스템 최적화", mandatory: false },
        { id: "e49", day: 4, start: 9.0, end: 10.0, title: "모니터링 분석", mandatory: false },
        { id: "e50", day: 4, start: 10.5, end: 11.5, title: "보안 보고", mandatory: true },
      ],
    },
    {
      id: "p6", name: "한소영", color: "#EC4899", mandatory: false,
      events: [
        { id: "e51", day: 0, start: 10.0, end: 11.0, title: "콘텐츠 기획", mandatory: false },
        { id: "e52", day: 0, start: 13.0, end: 14.0, title: "사용자 리서치", mandatory: true },
        { id: "e53", day: 1, start: 9.5, end: 10.5, title: "프로토타입", mandatory: false },
        { id: "e54", day: 1, start: 11.0, end: 12.0, title: "디자인 시스템", mandatory: false },
        { id: "e55", day: 2, start: 9.0, end: 10.0, title: "사용성 테스트", mandatory: true },
        { id: "e56", day: 2, start: 10.5, end: 11.5, title: "결과 분석", mandatory: false },
        { id: "e57", day: 3, start: 9.0, end: 10.0, title: "사용자 피드백", mandatory: false },
        { id: "e58", day: 3, start: 11.5, end: 12.5, title: "개선 계획", mandatory: true },
        { id: "e59", day: 4, start: 9.5, end: 10.5, title: "최종 검토", mandatory: false },
        { id: "e60", day: 4, start: 15.0, end: 16.0, title: "프레젠테이션", mandatory: true },
      ],
    },
    {
      id: "p7", name: "강동현", color: "#06B6D4", mandatory: false,
      events: [
        { id: "e61", day: 0, start: 9.0, end: 10.0, title: "데이터 수집", mandatory: false },
        { id: "e62", day: 0, start: 10.5, end: 11.5, title: "분석 모델링", mandatory: true },
        { id: "e63", day: 1, start: 9.0, end: 10.0, title: "통계 검증", mandatory: false },
        { id: "e64", day: 1, start: 13.0, end: 14.0, title: "리포트 작성", mandatory: false },
        { id: "e65", day: 2, start: 9.5, end: 10.5, title: "데이터 시각화", mandatory: false },
        { id: "e66", day: 2, start: 11.0, end: 12.0, title: "결과 발표", mandatory: true },
        { id: "e67", day: 3, start: 9.0, end: 10.0, title: "추가 분석", mandatory: false },
        { id: "e68", day: 3, start: 10.5, end: 11.5, title: "인사이트 도출", mandatory: true },
        { id: "e69", day: 4, start: 9.0, end: 10.0, title: "최종 검토", mandatory: false },
        { id: "e70", day: 4, start: 13.0, end: 14.0, title: "발표 준비", mandatory: true },
      ],
    },
    {
      id: "p8", name: "윤서연", color: "#84CC16", mandatory: false,
      events: [
        { id: "e71", day: 0, start: 9.5, end: 10.5, title: "회계 정리", mandatory: false },
        { id: "e72", day: 0, start: 11.0, end: 12.0, title: "예산 계획", mandatory: true },
        { id: "e73", day: 1, start: 9.0, end: 10.0, title: "비용 분석", mandatory: false },
        { id: "e74", day: 1, start: 10.5, end: 11.5, title: "재무 보고", mandatory: true },
        { id: "e75", day: 2, start: 9.0, end: 10.0, title: "예산 승인", mandatory: false },
        { id: "e76", day: 2, start: 13.0, end: 14.0, title: "투자 검토", mandatory: false },
        { id: "e77", day: 3, start: 9.5, end: 10.5, title: "재무 계획", mandatory: true },
        { id: "e78", day: 3, start: 11.0, end: 12.0, title: "예산 조정", mandatory: false },
        { id: "e79", day: 4, start: 9.0, end: 10.0, title: "최종 정리", mandatory: false },
        { id: "e80", day: 4, start: 10.5, end: 11.5, title: "재무 보고", mandatory: true },
      ],
    },
    {
      id: "p9", name: "임태호", color: "#F97316", mandatory: false,
      events: [
        { id: "e81", day: 0, start: 9.0, end: 10.0, title: "법무 검토", mandatory: false },
        { id: "e82", day: 0, start: 14.0, end: 15.0, title: "계약서 검토", mandatory: true },
        { id: "e83", day: 1, start: 9.5, end: 10.5, title: "규정 준수", mandatory: false },
        { id: "e84", day: 1, start: 11.0, end: 12.0, title: "리스크 관리", mandatory: true },
        { id: "e85", day: 2, start: 9.0, end: 10.0, title: "컴플라이언스", mandatory: false },
        { id: "e86", day: 2, start: 10.5, end: 11.5, title: "법무 검토", mandatory: false },
        { id: "e87", day: 3, start: 9.0, end: 10.0, title: "계약 갱신", mandatory: true },
        { id: "e88", day: 3, start: 13.0, end: 14.0, title: "법무 보고", mandatory: false },
        { id: "e89", day: 4, start: 9.5, end: 10.5, title: "최종 검토", mandatory: false },
        { id: "e90", day: 4, start: 11.0, end: 12.0, title: "법무 정리", mandatory: true },
      ],
    },
    {
      id: "p10", name: "송미래", color: "#6366F1", mandatory: false,
      events: [
        { id: "e91", day: 0, start: 9.0, end: 10.0, title: "HR 정책", mandatory: false },
        { id: "e92", day: 0, start: 12.0, end: 13.0, title: "채용 면접", mandatory: true },
        { id: "e93", day: 1, start: 9.5, end: 10.5, title: "교육 계획", mandatory: false },
        { id: "e94", day: 1, start: 15.0, end: 16.0, title: "성과 평가", mandatory: true },
        { id: "e95", day: 2, start: 9.0, end: 10.0, title: "팀 관리", mandatory: false },
        { id: "e96", day: 2, start: 10.5, end: 11.5, title: "인사 정책", mandatory: false },
        { id: "e97", day: 3, start: 9.0, end: 10.0, title: "채용 계획", mandatory: true },
        { id: "e98", day: 3, start: 11.0, end: 12.0, title: "교육 실행", mandatory: false },
        { id: "e99", day: 4, start: 9.5, end: 10.5, title: "성과 검토", mandatory: false },
        { id: "e100", day: 4, start: 13.0, end: 14.0, title: "팀 빌딩", mandatory: true },
      ],
    },
  ];

  // ====== 상태 ======
  const [participants, setParticipants] = useState(initialParticipants);
  const [demoMode, setDemoMode] = useState("small"); // small | large - 데모 모드
  
  // 데모 모드에 따른 참여자 데이터 선택
  const currentParticipants = demoMode === "large" ? largeParticipants : initialParticipants;
  const [mode, setMode] = useState("organizer"); // organizer | participant
  const [activeParticipantId, setActiveParticipantId] = useState("p1");
  const [considerOnlyMandatory, setConsiderOnlyMandatory] = useState(false);
  const [ignoredEventIds, setIgnoredEventIds] = useState(new Set());
  const [selectedRequiredParticipantIds, setSelectedRequiredParticipantIds] = useState(new Set(["p1", "p2", "p3"]));
  
  // 데모 모드에 따른 필수 참여자 초기화
  React.useEffect(() => {
    if (demoMode === "large") {
      setSelectedRequiredParticipantIds(new Set(["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"]));
    } else {
      setSelectedRequiredParticipantIds(new Set(["p1", "p2", "p3"]));
    }
  }, [demoMode]);
  const [selectedEvent, setSelectedEvent] = useState(null); // {participantId,eventId,day,start}
  const [overlapPicker, setOverlapPicker] = useState(null); // {day, topPct, items:[{participantId,eventId,title,participantName}]}
  const [isAddingEvent, setIsAddingEvent] = useState(false); // 일정 추가 모드
  const [dragSelection, setDragSelection] = useState(null); // {day, start, end}
  const [touchStartPoint, setTouchStartPoint] = useState(null); // {day, time} - 모바일 터치 시작점
  const [showMobileInput, setShowMobileInput] = useState(false); // 모바일 전용 입력 박스 표시

  // ====== 유틸 ======
  const hours = useMemo(() => {
    const arr = [];
    for (let h = START_HOUR; h < END_HOUR; h += 1) arr.push(h);
    return arr;
  }, []);

  // 모바일 감지
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0);
  }, []);

  function timeToPct(t) {
    return ((t - START_HOUR) / (END_HOUR - START_HOUR)) * 100;
  }

  function fmtTime(t) {
    const h = Math.floor(t);
    const m = Math.round((t - h) * 60);
    return `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`;
  }

  function fmtHour(h) {
    return `${h}시`;
  }

  // ====== 조작 ======
  function toggleMandatory(participantId, eventId) {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id !== participantId
          ? p
          : {
              ...p,
              events: p.events.map((e) => (e.id === eventId ? { ...e, mandatory: !e.mandatory } : e)),
            }
      )
    );
  }

  function deleteEvent(participantId, eventId) {
    setParticipants((prev) =>
      prev.map((p) => (p.id !== participantId ? p : { ...p, events: p.events.filter((e) => e.id !== eventId) }))
    );
    setSelectedEvent(null);
  }

  function addEvent(participantId, title, day, start, end) {
    const newEvent = {
      id: `e${Date.now()}`, // 간단한 ID 생성
      day,
      start,
      end,
      title,
      mandatory: false
    };
    
    setParticipants((prev) =>
      prev.map((p) =>
        p.id !== participantId
          ? p
          : { ...p, events: [...p.events, newEvent] }
      )
    );
    
    setDragSelection(null);
  }

  function onSendReply() {
    alert("회신이 전송되었습니다. (MVP 시뮬레이션)");
  }

  function toggleIgnore(eventId) {
    setIgnoredEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  }

  function toggleRequiredParticipant(pid) {
    setSelectedRequiredParticipantIds((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  }

  // 화면에 표시할 이벤트 집합(필터 적용)
  const visibleEvents = useMemo(() => {
    const out = [];
    
    if (mode === "participant") {
      // 참여자 모드: 선택된 참여자의 일정만 표시
      const activeParticipant = currentParticipants.find(p => p.id === activeParticipantId);
      if (activeParticipant) {
        for (const e of activeParticipant.events) {
          out.push({ ...e, participantId: activeParticipant.id, participantName: activeParticipant.name, color: activeParticipant.color });
        }
      }
    } else {
      // 모임장 모드: 필터 적용된 모든 일정 표시
      for (const p of currentParticipants) {
        for (const e of p.events) {
          if (ignoredEventIds.has(e.id)) continue; // 모임장 무시
          if (considerOnlyMandatory && !e.mandatory) continue; // 필수만
          if (!selectedRequiredParticipantIds.has(p.id)) continue; // 필수 참여자 필터
          out.push({ ...e, participantId: p.id, participantName: p.name, color: p.color });
        }
      }
    }
    
    return out;
  }, [currentParticipants, ignoredEventIds, considerOnlyMandatory, selectedRequiredParticipantIds, mode, activeParticipantId]);

  // ====== 공통 빈 시간 계산(리스트용) ======
  const freeSlotsByDay = useMemo(() => {
    const selectedP = currentParticipants.filter((p) => selectedRequiredParticipantIds.has(p.id));
    const slots = {};
    for (let d = 0; d < 7; d++) {
      const busy = [];
      for (const p of selectedP) {
        for (const e of p.events) {
          if (ignoredEventIds.has(e.id)) continue;
          if (considerOnlyMandatory && !e.mandatory) continue;
          if (e.day !== d) continue;
          busy.push([Math.max(START_HOUR, e.start), Math.min(END_HOUR, e.end)]);
        }
      }
      busy.sort((a, b) => a[0] - b[0]);
      const merged = [];
      for (const [s, e] of busy) {
        if (!merged.length || s > merged[merged.length - 1][1]) merged.push([s, e]);
        else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
      }
      const dayFree = [];
      let cur = START_HOUR;
      for (const [s, e] of merged) {
        if (s > cur) dayFree.push([cur, s]);
        cur = Math.max(cur, e);
      }
      if (cur < END_HOUR) dayFree.push([cur, END_HOUR]);
      slots[d] = dayFree;
    }
    return slots;
  }, [participants, selectedRequiredParticipantIds, considerOnlyMandatory, ignoredEventIds]);

  // ====== 보조 컴포넌트 ======
  function ParticipantLegend() {
    return (
      <div className="flex flex-wrap gap-3">
        {participants.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded-2xl px-3 py-2 bg-white shadow-sm border">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-sm font-medium">{p.name}</span>
            <label className="text-xs ml-2 flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedRequiredParticipantIds.has(p.id)}
                onChange={() => toggleRequiredParticipant(p.id)}
              />
              필수로 포함
            </label>
          </div>
        ))}
      </div>
    );
  }

  function ParticipantPanel() {
    const me = participants.find((p) => p.id === activeParticipantId) ?? participants[0];
    const myEvents = me.events;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <select className="border rounded-xl px-3 py-2" value={activeParticipantId} onChange={(e) => setActiveParticipantId(e.target.value)}>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button onClick={onSendReply} className="px-4 py-2 rounded-xl bg-slate-900 text-white shadow hover:bg-slate-800">회신 전송</button>
        </div>


        <div className="grid md:grid-cols-2 gap-4">
          {myEvents.map((e) => (
            <div key={e.id} className="rounded-2xl border bg-white shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-800">{e.title}</div>
                <label className="text-xs flex items-center gap-1">
                  <input type="checkbox" checked={e.mandatory} onChange={() => toggleMandatory(me.id, e.id)} />
                  필수 참석
                </label>
              </div>
              <div className="text-sm text-slate-600 mt-1">{DAYS[e.day]} {fmtTime(e.start)}–{fmtTime(e.end)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function OrganizerPanel() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <ParticipantLegend />
          <label className="text-sm flex items-center gap-2 md:ml-auto">
            <input type="checkbox" checked={considerOnlyMandatory} onChange={() => setConsiderOnlyMandatory((v) => !v)} />
            필수 일정만 고려
          </label>
        </div>

        {/* 전체 일정 리스트 + 무시 토글 */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="px-4 py-3 border-b text-sm font-semibold">전체 일정 (필터 반영)</div>
          <div className="divide-y">
            {visibleEvents.length === 0 && <div className="p-4 text-sm text-slate-500">표시할 일정이 없습니다.</div>}
            {visibleEvents.map((e) => (
              <div key={e.id + e.participantId} className="p-4 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.title} — {e.participantName}</div>
                  <div className="text-xs text-slate-500">{DAYS[e.day]} {fmtTime(e.start)}–{fmtTime(e.end)}</div>
                </div>
                <button onClick={() => toggleIgnore(e.id)} className={"px-3 py-1 rounded-lg text-xs border " + (ignoredEventIds.has(e.id) ? "bg-slate-100 text-slate-500" : "bg-white hover:bg-slate-50")}>{ignoredEventIds.has(e.id) ? "무시 해제" : "일정 무시"}</button>
              </div>
            ))}
          </div>
        </div>

        {/* 공통 빈 시간 리스트 (색상 시각화는 제거) */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="px-4 py-3 border-b text-sm font-semibold">공통 빈 시간 (선택된 필수 참여자 기준)</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {Object.entries(freeSlotsByDay).map(([d, slots]) => (
              <div key={d} className="border rounded-xl p-3 bg-slate-50">
                <div className="text-sm font-semibold mb-2">{DAYS[Number(d)]}</div>
                {slots.length === 0 ? (
                  <div className="text-xs text-slate-500">없음</div>
                ) : (
                  <ul className="space-y-1 text-xs text-slate-700">
                    {slots.map(([s, e], idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>{fmtTime(s)}–{fmtTime(e)}</span>
                        <button className="text-[11px] px-2 py-1 rounded-lg border bg-white hover:bg-slate-100">선택</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ====== 주간 그리드 ======
  function DayColumn({ dayIndex, events }) {
    // 클릭 위치를 시간으로 변환
    const colRef = useRef(null);
    function yToTime(clientY) {
      const rect = colRef.current?.getBoundingClientRect();
      if (!rect) return START_HOUR;
      const y = clientY - rect.top;
      const pct = Math.min(Math.max(y / rect.height, 0), 1);
      // 퍼센트를 실제 시간으로 변환 (더 정확한 계산)
      const time = START_HOUR + (END_HOUR - START_HOUR) * pct;
      // 30분 단위로 반올림하여 더 정확한 시간 선택
      return Math.round(time * 2) / 2;
    }

    function getEventById(participantId, eventId) {
      const p = currentParticipants.find((pp) => pp.id === participantId);
      return p?.events.find((ee) => ee.id === eventId) ?? null;
    }

    const sel = (() => {
      if (!selectedEvent) return null;
      const p = currentParticipants.find((pp) => pp.id === selectedEvent.participantId);
      const ev = p?.events.find((ee) => ee.id === selectedEvent.eventId);
      return ev ? { ...ev, participantId: p?.id, participantName: p?.name, color: p?.color } : null;
    })();

    return (
      <div 
        ref={colRef} 
        className="relative border-l border-slate-200" 
        onClick={() => { setSelectedEvent(null); setOverlapPicker(null); }}
        style={{ 
          touchAction: isAddingEvent && !isMobile ? 'none' : 'auto',
          userSelect: isAddingEvent ? 'none' : 'auto',
          pointerEvents: 'auto'
        }}
        onMouseDown={(ev) => {
          // 일정 요소가 아닌 경우에만 처리
          if (ev.target.closest('[data-event]')) {
            return; // 일정 요소는 무시
          }
          
          if (mode === "participant" && isAddingEvent) {
            // 일정 추가 모드에서만 드래그 처리
            ev.preventDefault();
            const startTime = yToTime(ev.clientY);
            setDragSelection({ day: dayIndex, start: startTime, end: startTime });
          }
        }}
        onMouseMove={(ev) => {
          if (mode === "participant" && isAddingEvent && dragSelection && dragSelection.day === dayIndex) {
            const currentTime = yToTime(ev.clientY);
            setDragSelection(prev => ({ ...prev, end: currentTime }));
          }
        }}
        onMouseUp={() => {
          if (mode === "participant" && isAddingEvent && dragSelection) {
            setIsAddingEvent(false);
            // 드래그 선택이 완료되면 바로 일정명 입력 오버레이 표시
          }
        }}
        onMouseLeave={() => {
          if (mode === "participant" && isAddingEvent && dragSelection) {
            setIsAddingEvent(false);
          }
        }}
        onTouchStart={(ev) => {
          // 일정 요소가 아닌 경우에만 처리
          if (ev.target.closest('[data-event]')) {
            return; // 일정 요소는 무시
          }
          
          if (mode === "participant" && isAddingEvent && isMobile) {
            // 일정 추가 모드에서만 터치 처리
            ev.preventDefault();
            ev.stopPropagation();
            const touch = ev.touches[0];
            const touchTime = yToTime(touch.clientY);
            
            if (!touchStartPoint) {
              // 첫 번째 터치: 시작점 설정
              setTouchStartPoint({ day: dayIndex, time: touchTime });
              setDragSelection({ day: dayIndex, start: touchTime, end: touchTime });
            } else {
              // 두 번째 터치: 종료점 설정
              if (dayIndex !== touchStartPoint.day || touchTime < touchStartPoint.time) {
                // 다른 요일이거나 종료점이 시작점보다 이전이면 새 시작점으로 설정
                setTouchStartPoint({ day: dayIndex, time: touchTime });
                setDragSelection({ day: dayIndex, start: touchTime, end: touchTime });
              } else {
                // 정상적인 종료점 설정
                setDragSelection({ day: dayIndex, start: touchStartPoint.time, end: touchTime });
                setTouchStartPoint(null);
                setIsAddingEvent(false);
                if (isMobile) {
                  setShowMobileInput(true);
                }
              }
            }
          }
        }}
        onTouchMove={(ev) => {
          // 모바일에서는 터치 이동 무시 (드래그 방식 사용 안함)
        }}
        onTouchEnd={(ev) => {
          // 모바일에서는 터치 종료 무시
        }}
      >
        {/* 시간 가이드 */}
        {hours.map((h) => (
          <div key={h} className="h-16 border-b border-slate-100 text-xs text-slate-400 pl-1 relative">
            {fmtHour(h)}
            {/* 정각 시간대 선택을 위한 확장 영역 */}
            <div 
              className="absolute inset-0 cursor-crosshair"
              style={{ 
                top: '-8px', 
                height: 'calc(100% + 16px)',
                zIndex: 1
              }}
            />
          </div>
        ))}

            {/* 드래그 선택 영역 */}
            {mode === "participant" && isAddingEvent && dragSelection && dragSelection.day === dayIndex && (
              <div
                className="absolute left-1 right-1 bg-blue-200 border-2 border-blue-400 rounded-xl opacity-60"
                style={{
                  top: `${timeToPct(Math.min(dragSelection.start, dragSelection.end))}%`,
                  height: `${Math.max(4, Math.abs(timeToPct(dragSelection.end) - timeToPct(dragSelection.start)))}%`
                }}
              >
                <div className="p-2 text-xs text-blue-800 font-medium">
                  {fmtTime(Math.min(dragSelection.start, dragSelection.end))} - {fmtTime(Math.max(dragSelection.start, dragSelection.end))}
                </div>
              </div>
            )}
            
            {/* 모바일 터치 시작점 표시 */}
            {mode === "participant" && isAddingEvent && isMobile && touchStartPoint && touchStartPoint.day === dayIndex && (
              <div
                className="absolute left-1 right-1 bg-green-200 border-2 border-green-400 rounded-xl opacity-80"
                style={{
                  top: `${timeToPct(touchStartPoint.time)}%`,
                  height: '4%'
                }}
              >
                <div className="p-2 text-xs text-green-800 font-medium text-center">
                  시작: {fmtTime(touchStartPoint.time)} (종료점 터치하세요)
                </div>
              </div>
            )}

        {/* 드래그 완료 후 일정명 입력 오버레이 (데스크톱만) */}
        {mode === "participant" && !isAddingEvent && dragSelection && dragSelection.day === dayIndex && !isMobile && (
          <div
            className="absolute left-1 right-1 bg-green-200 border-2 border-green-400 rounded-xl opacity-80"
            style={{
              top: `${timeToPct(Math.min(dragSelection.start, dragSelection.end))}%`,
              height: `${Math.max(isMobile ? 8 : 4, Math.abs(timeToPct(dragSelection.end) - timeToPct(dragSelection.start)))}%`
            }}
          >
            <div className={isMobile ? "p-4" : "p-2"}>
              <input
                type="text"
                placeholder="일정명을 입력하세요"
                className={`w-full bg-white border border-green-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isMobile ? 'text-base py-3 px-4' : 'text-xs'
                }`}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const title = e.target.value.trim();
                    if (title) {
                      addEvent(
                        activeParticipantId, 
                        title, 
                        dragSelection.day, 
                        Math.min(dragSelection.start, dragSelection.end), 
                        Math.max(dragSelection.start, dragSelection.end)
                      );
                    }
                  } else if (e.key === 'Escape') {
                    setDragSelection(null);
                  }
                }}
                onBlur={(e) => {
                  const title = e.target.value.trim();
                  if (title) {
                    addEvent(
                      activeParticipantId, 
                      title, 
                      dragSelection.day, 
                      Math.min(dragSelection.start, dragSelection.end), 
                      Math.max(dragSelection.start, dragSelection.end)
                    );
                  } else {
                    setDragSelection(null);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* 이벤트 층 */}
        <div className="absolute inset-0">
          {events.filter((e) => e.day === dayIndex).map((e) => {
            const top = timeToPct(e.start);
            const height = Math.max(2, timeToPct(e.end) - timeToPct(e.start));
            return (
              <div
                key={e.id + e.participantId}
                data-event="true"
                className="absolute left-1 right-1 rounded-xl shadow-sm p-2 text-xs font-medium overflow-hidden cursor-pointer ring-1 ring-black/0 hover:ring-black/10 z-10"
                style={{ top: `${top}%`, height: `${height}%`, backgroundColor: e.color, opacity: e.mandatory ? 0.9 : 0.55, mixBlendMode: "multiply" }}
                title={`${e.title} — ${e.participantName}`}
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  console.log('일정 마우스다운:', e.title, e.participantName);
                  const clickTime = yToTime(ev.clientY);
                  const overlaps = events.filter((x) => x.day === dayIndex && x.start <= clickTime && x.end >= clickTime);
                  if (overlaps.length > 1) {
                    setSelectedEvent(null);
                    setOverlapPicker({
                      day: dayIndex,
                      topPct: timeToPct(clickTime),
                      items: overlaps.map((x) => ({ participantId: x.participantId, eventId: x.id, title: x.title, participantName: x.participantName })),
                    });
                  } else {
                    setOverlapPicker(null);
                    setSelectedEvent({ participantId: e.participantId, eventId: e.id, day: dayIndex, start: e.start });
                  }
                }}
                onClick={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  console.log('일정 클릭됨:', e.title, e.participantName);
                }}
                onTouchStart={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  console.log('일정 터치됨:', e.title, e.participantName);
                  const touch = ev.touches[0];
                  const clickTime = yToTime(touch.clientY);
                  const overlaps = events.filter((x) => x.day === dayIndex && x.start <= clickTime && x.end >= clickTime);
                  if (overlaps.length > 1) {
                    setSelectedEvent(null);
                    setOverlapPicker({
                      day: dayIndex,
                      topPct: timeToPct(clickTime),
                      items: overlaps.map((x) => ({ participantId: x.participantId, eventId: x.id, title: x.title, participantName: x.participantName })),
                    });
                  } else {
                    setOverlapPicker(null);
                    setSelectedEvent({ participantId: e.participantId, eventId: e.id, day: dayIndex, start: e.start });
                  }
                }}
              >
                <div className="truncate text-white drop-shadow-sm">{e.title} <span className="opacity-90">· {e.participantName}</span></div>
                <div className="text-[10px] text-white/90 mt-1">{fmtTime(e.start)}–{fmtTime(e.end)}</div>
              </div>
            );
          })}
        </div>

        {/* (주의) 공통 빈 시간의 녹색 시각화는 제거되었습니다. 리스트에는 유지 */}

        {/* 겹침 선택 팝업 */}
        {overlapPicker && overlapPicker.day === dayIndex && (
          <div className="absolute z-50 right-2 translate-y-[-6px]" style={{ top: `${overlapPicker.topPct}%` }} onClick={(ev) => ev.stopPropagation()}>
            <div className="bg-white border shadow-xl rounded-2xl p-2 w-56">
              <div className="px-2 py-1 text-xs text-slate-500">어떤 일정을 변경할까요?</div>
              <div className="max-h-48 overflow-auto mt-1 flex flex-col gap-1">
                {overlapPicker.items.map((it, idx) => (
                  <button key={`${it.participantId}-${it.eventId}-${idx}`} className="text-left text-sm px-3 py-2 rounded-xl border hover:bg-slate-50" onClick={() => {
                    const evObj = getEventById(it.participantId, it.eventId);
                    const start = evObj ? evObj.start : START_HOUR;
                    console.log('겹친 일정 선택:', it.participantId, it.eventId, overlapPicker.day, start);
                    setOverlapPicker(null);
                    setSelectedEvent({ participantId: it.participantId, eventId: it.eventId, day: overlapPicker.day, start });
                  }}>
                    {it.title} · <span className="text-slate-500">{it.participantName}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button className="text-xs px-2 py-1 rounded-lg border hover:bg-slate-50" onClick={() => setOverlapPicker(null)}>취소</button>
              </div>
            </div>
          </div>
        )}

        {/* 이벤트 컨텍스트 오버레이 */}
        {sel && selectedEvent?.day === dayIndex && (
          <div className="absolute z-50 right-2 translate-y-[-6px]" style={{ top: `${timeToPct(selectedEvent.start ?? sel.start)}%` }} onClick={(ev) => ev.stopPropagation()}>
            <div className="bg-white border shadow-xl rounded-2xl p-2 w-44">
              <div className="px-2 py-1 text-xs text-slate-500">{sel.title} · {sel.participantName}</div>
              <div className="flex flex-col gap-2 mt-1">
                <button 
                  className="text-sm px-3 py-2 rounded-xl border hover:bg-slate-50 text-slate-700" 
                  onClick={() => {
                    console.log('필수 토글:', selectedEvent.participantId, selectedEvent.eventId);
                    toggleMandatory(selectedEvent.participantId, selectedEvent.eventId);
                  }}
                >
                  {sel.mandatory ? "필수 해제" : "필수로 표시"}
                </button>
                <button 
                  className="text-sm px-3 py-2 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50" 
                  onClick={() => {
                    console.log('일정 삭제:', selectedEvent.participantId, selectedEvent.eventId);
                    deleteEvent(selectedEvent.participantId, selectedEvent.eventId);
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function WeekGrid() {
    return (
      <div 
        className="rounded-3xl border bg-white shadow-sm overflow-hidden" 
        style={{ 
          touchAction: isAddingEvent && !isMobile ? 'none' : 'pan-y',
          userSelect: isAddingEvent ? 'none' : 'auto'
        }}
      >
        <div className="grid grid-cols-8 bg-slate-50 border-b">
          <div className="p-3 text-xs text-slate-500">시간</div>
          {DAYS.map((d) => (
            <div key={d} className="p-3 text-center text-xs font-semibold text-slate-700 border-l">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-8">
          {/* 시간 라벨 열 */}
          <div className="border-r">
            {hours.map((h) => (
              <div key={h} className="h-16 border-b border-slate-100 text-xs text-slate-500 flex items-start justify-end pr-2 pt-1">{fmtHour(h)}</div>
            ))}
          </div>
          {/* 요일별 컬럼 */}
          {DAYS.map((_, dayIdx) => (
            <DayColumn key={dayIdx} dayIndex={dayIdx} events={visibleEvents} />
          ))}
        </div>
      </div>
    );
  }

  // ====== 렌더 ======
  return (
    <div className="p-6 md:p-10 bg-gradient-to-b from-slate-50 to-white text-slate-900 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">모임 초대·조율 — 주간 캘린더 MVP</h1>
          <p className="text-sm text-slate-600 mt-1">초대 구간: <b>10월 24일 ~ 10월 31일</b> · 목적: <b>팀미팅</b> · 구성: {demoMode === "large" ? "10명 참여자" : "황원준, 정유진, 한지은"}</p>
        </div>
        
        {/* 데모 모드 탭 */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setDemoMode("small")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                demoMode === "small" 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3명 데모
            </button>
            <button
              onClick={() => setDemoMode("large")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                demoMode === "large" 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              10명 데모
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:ml-auto">
          <button className={"px-4 py-2 rounded-xl border shadow-sm " + (mode === "organizer" ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50")} onClick={() => setMode("organizer")}>
            모임장 보기
          </button>
          <button className={"px-4 py-2 rounded-xl border shadow-sm " + (mode === "participant" ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50")} onClick={() => setMode("participant")}>
            참여자 보기
          </button>
          {mode === "participant" && (
            <button
              onClick={() => {
                setIsAddingEvent(!isAddingEvent);
                if (!isAddingEvent) {
                  // 추가 모드로 전환할 때 터치 시작점 초기화
                  setTouchStartPoint(null);
                  setDragSelection(null);
                  setShowMobileInput(false);
                }
              }}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                isAddingEvent 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isAddingEvent ? '저장' : '추가'}
            </button>
          )}
        </div>
      </div>

      {/* 주간 캘린더 */}
      <WeekGrid />
      
      {/* 추가 모드 안내 */}
      {mode === "participant" && isAddingEvent && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-blue-800 font-medium mb-2">📅 일정 추가 모드</div>
          <div className="text-sm text-blue-600">
            {isMobile ? (
              <>
                <div>1️⃣ 첫 번째 터치: 시작 시간</div>
                <div>2️⃣ 두 번째 터치: 종료 시간</div>
                <div className="text-xs text-blue-500 mt-1">다른 요일이나 이전 시간을 터치하면 새 시작점으로 설정됩니다</div>
              </>
            ) : (
              "달력에서 원하는 시간대를 드래그하여 일정을 추가하세요"
            )}
          </div>
        </div>
      )}

      {/* 모바일 전용 입력 박스 */}
      {showMobileInput && dragSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-lg font-semibold text-gray-800 mb-2">📅 일정 추가</div>
            </div>
            
            {/* 시간 설정 */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">시간 설정</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">시작 시간</label>
                  <select
                    value={hours.find(h => fmtTime(h) === fmtTime(Math.min(dragSelection.start, dragSelection.end))) || Math.min(dragSelection.start, dragSelection.end)}
                    onChange={(e) => {
                      const newStart = parseFloat(e.target.value);
                      const currentEnd = Math.max(dragSelection.start, dragSelection.end);
                      setDragSelection(prev => ({
                        ...prev,
                        start: newStart,
                        end: Math.max(newStart, currentEnd)
                      }));
                    }}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {hours.map(h => (
                      <option key={h} value={h}>{fmtTime(h)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">종료 시간</label>
                  <select
                    value={hours.find(h => fmtTime(h) === fmtTime(Math.max(dragSelection.start, dragSelection.end))) || Math.max(dragSelection.start, dragSelection.end)}
                    onChange={(e) => {
                      const newEnd = parseFloat(e.target.value);
                      const currentStart = Math.min(dragSelection.start, dragSelection.end);
                      setDragSelection(prev => ({
                        ...prev,
                        start: Math.min(currentStart, newEnd),
                        end: newEnd
                      }));
                    }}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {hours.map(h => (
                      <option key={h} value={h}>{fmtTime(h)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                현재 선택: {fmtTime(Math.min(dragSelection.start, dragSelection.end))} - {fmtTime(Math.max(dragSelection.start, dragSelection.end))}
              </div>
            </div>

            {/* 일정명 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">일정명</label>
              <input
                type="text"
                placeholder="일정명을 입력하세요 (최대 10글자)"
                className="w-full text-lg py-4 px-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={10}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const title = e.target.value.trim();
                    if (title) {
                      addEvent(
                        activeParticipantId, 
                        title, 
                        dragSelection.day, 
                        Math.min(dragSelection.start, dragSelection.end), 
                        Math.max(dragSelection.start, dragSelection.end)
                      );
                      setShowMobileInput(false);
                      setDragSelection(null);
                    }
                  } else if (e.key === 'Escape') {
                    setShowMobileInput(false);
                    setDragSelection(null);
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMobileInput(false);
                  setDragSelection(null);
                }}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="일정명을 입력하세요"]');
                  const title = input?.value.trim();
                  if (title) {
                    addEvent(
                      activeParticipantId, 
                      title, 
                      dragSelection.day, 
                      Math.min(dragSelection.start, dragSelection.end), 
                      Math.max(dragSelection.start, dragSelection.end)
                    );
                  }
                  setShowMobileInput(false);
                  setDragSelection(null);
                }}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 패널 */}
      {mode === "participant" ? <ParticipantPanel /> : <OrganizerPanel />}

      <div className="text-xs text-slate-500 pt-4">
        · 겹침 표현: 참여자 색상 + <code>opacity</code> + <code>mix-blend-multiply</code> 사용. 클릭 위치 기반 겹침 선택 팝업 제공.<br />
        · 공통 빈 시간: 그리드 상의 녹색 하이라이트는 제거되었고, **리스트**로만 제공합니다.
      </div>
    </div>
  );
}
