import React, { useMemo, useState, useRef, useEffect } from "react";

/**
 * MeetingSchedulerMVP — 전체 기능 복원 + 겹침 선택 팝업 + 오버레이(필수/삭제)
 * 변경점: "공통 빈 시간"의 녹색 시각화(하이라이트 박스)만 제거하고,
 *         기능(계산/리스트/필터)은 모두 유지합니다.
 */

export default function MeetingSchedulerMVP({ agentData, showOrganizerTutorialOnCalendar, onCloseOrganizerTutorial }) {
  // ====== 상수 ======
  const DAYS = ["월", "화", "수", "목", "금"];
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
  // 팀 및 개인 데이터
  const teams = [
    {
      id: "team1",
      name: "개발팀",
      members: ["김철수", "박민수", "정수진", "최지훈"]
    },
    {
      id: "team2", 
      name: "디자인팀",
      members: ["이영희", "한소영"]
    },
    {
      id: "team3",
      name: "마케팅팀", 
      members: ["강동현", "윤서연"]
    },
    {
      id: "team4",
      name: "경영팀",
      members: ["임태호", "송미래"]
    }
  ];

  const allPeople = [
    "김철수", "이영희", "박민수", "정수진", "최지훈", 
    "한소영", "강동현", "윤서연", "임태호", "송미래",
    "황원준", "정유진", "한지은"
  ];

  const initialParticipants = [
    {
      id: "p1",
      name: "황원준",
      email: "hwang.wonjun@company.com",
      color: palette[0],
      events: [
        { id: "e1", day: 1, start: 9.0, end: 10.5, title: "주간 킥오프", mandatory: true },
        { id: "e2", day: 2, start: 13.0, end: 14.0, title: "클라이언트 콜", mandatory: true },
        { id: "e3", day: 4, start: 15.0, end: 16.5, title: "디자인 리뷰", mandatory: true },
      ],
    },
    {
      id: "p2",
      name: "정유진",
      email: "jung.yujin@company.com",
      color: palette[1],
      events: [
        { id: "e4", day: 1, start: 10.0, end: 12.0, title: "세일즈 미팅", mandatory: true },
        { id: "e5", day: 3, start: 9.5, end: 11.0, title: "콘텐츠 기획", mandatory: true },
        { id: "e6", day: 4, start: 15.5, end: 17.0, title: "파트너 협의", mandatory: true },
      ],
    },
    {
      id: "p3",
      name: "한지은",
      email: "han.jieun@company.com",
      color: palette[2],
      events: [
        { id: "e7", day: 2, start: 13.0, end: 15.0, title: "촬영 스케줄", mandatory: true },
        { id: "e8", day: 3, start: 11.0, end: 12.5, title: "브랜드 미팅", mandatory: true },
      ],
    },
  ];

  // 3명 데모용 2주차 데이터
  const secondWeekParticipants3 = [
    {
      id: "p1",
      name: "황원준",
      email: "hwang.wonjun@company.com",
      color: palette[0],
      events: [
        { id: "e1_w2_3", day: 0, start: 9.0, end: 10.0, title: "주간 리뷰", mandatory: true },
        { id: "e2_w2_3", day: 0, start: 14.0, end: 15.0, title: "프로젝트 검토", mandatory: true },
        { id: "e3_w2_3", day: 1, start: 10.0, end: 11.0, title: "클라이언트 미팅", mandatory: true },
        { id: "e4_w2_3", day: 2, start: 9.0, end: 10.0, title: "디자인 피드백", mandatory: true },
        { id: "e5_w2_3", day: 3, start: 15.0, end: 16.0, title: "최종 검토", mandatory: true },
        { id: "e6_w2_3", day: 4, start: 11.0, end: 12.0, title: "프레젠테이션 준비", mandatory: true },
      ],
    },
    {
      id: "p2",
      name: "정유진",
      email: "jung.yujin@company.com",
      color: palette[1],
      events: [
        { id: "e7_w2_3", day: 0, start: 9.0, end: 10.0, title: "주간 리뷰", mandatory: true },
        { id: "e8_w2_3", day: 0, start: 11.0, end: 12.0, title: "마케팅 전략", mandatory: true },
        { id: "e9_w2_3", day: 1, start: 9.0, end: 10.0, title: "세일즈 분석", mandatory: true },
        { id: "e10_w2_3", day: 1, start: 15.0, end: 16.0, title: "고객 상담", mandatory: true },
        { id: "e11_w2_3", day: 2, start: 10.0, end: 11.0, title: "콘텐츠 기획", mandatory: true },
        { id: "e12_w2_3", day: 3, start: 14.0, end: 15.0, title: "파트너 미팅", mandatory: true },
        { id: "e13_w2_3", day: 4, start: 9.0, end: 10.0, title: "성과 분석", mandatory: true },
      ],
    },
    {
      id: "p3",
      name: "한지은",
      email: "han.jieun@company.com",
      color: palette[2],
      events: [
        { id: "e14_w2_3", day: 0, start: 9.0, end: 10.0, title: "주간 리뷰", mandatory: true },
        { id: "e15_w2_3", day: 0, start: 13.0, end: 14.0, title: "촬영 준비", mandatory: true },
        { id: "e16_w2_3", day: 1, start: 11.0, end: 12.0, title: "브랜드 미팅", mandatory: true },
        { id: "e17_w2_3", day: 2, start: 9.0, end: 10.0, title: "디자인 리뷰", mandatory: true },
        { id: "e18_w2_3", day: 2, start: 14.0, end: 15.0, title: "포토샵 작업", mandatory: true },
        { id: "e19_w2_3", day: 3, start: 10.0, end: 11.0, title: "영상 편집", mandatory: true },
        { id: "e20_w2_3", day: 4, start: 13.0, end: 14.0, title: "최종 점검", mandatory: true },
      ],
    },
  ];

  // 10명 참여자 데이터 (월~금)
  const largeParticipants = [
    {
      id: "p1", name: "김철수", email: "kim.chulsoo@company.com", color: "#3B82F6", mandatory: true,
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
      id: "p2", name: "이영희", email: "lee.younghee@company.com", color: "#EF4444", mandatory: true,
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
      id: "p3", name: "박민수", email: "park.minsu@company.com", color: "#10B981", mandatory: true,
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
      id: "p4", name: "정수진", email: "jung.sujin@company.com", color: "#F59E0B", mandatory: false,
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
      id: "p5", name: "최지훈", email: "choi.jihun@company.com", color: "#8B5CF6", mandatory: false,
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
      id: "p6", name: "한소영", email: "han.soyoung@company.com", color: "#EC4899", mandatory: false,
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
      id: "p7", name: "강동현", email: "kang.donghyun@company.com", color: "#06B6D4", mandatory: false,
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
      id: "p8", name: "윤서연", email: "yoon.seoyeon@company.com", color: "#84CC16", mandatory: false,
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
      id: "p9", name: "임태호", email: "lim.taeho@company.com", color: "#F97316", mandatory: false,
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
      id: "p10", name: "송미래", email: "song.mirae@company.com", color: "#6366F1", mandatory: false,
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

  // 두 번째 주 데이터 (시간대 분산 + 겹치는 일정)
  const secondWeekParticipants = [
    {
      id: "p1", name: "김철수", email: "kim.chulsoo@company.com", color: "#3B82F6", mandatory: true,
      events: [
        { id: "e1_w2", day: 0, start: 9.0, end: 9.5, title: "주간 리뷰", mandatory: true },
        { id: "e2_w2", day: 0, start: 10.0, end: 11.0, title: "프로젝트 마무리", mandatory: false },
        { id: "e3_w2", day: 0, start: 14.0, end: 15.0, title: "고객 피드백", mandatory: true },
        { id: "e4_w2", day: 1, start: 9.5, end: 10.5, title: "품질 검토", mandatory: false },
        { id: "e5_w2", day: 1, start: 11.0, end: 12.0, title: "시스템 점검", mandatory: true },
        { id: "e6_w2", day: 2, start: 10.0, end: 11.0, title: "최종 발표", mandatory: true },
        { id: "e7_w2", day: 2, start: 15.0, end: 16.0, title: "결과 분석", mandatory: false },
        { id: "e8_w2", day: 3, start: 9.0, end: 10.0, title: "팀 회의", mandatory: true },
        { id: "e9_w2", day: 4, start: 11.0, end: 12.0, title: "문서 정리", mandatory: false },
      ],
    },
    {
      id: "p2", name: "이영희", email: "lee.younghee@company.com", color: "#EF4444", mandatory: true,
      events: [
        { id: "e10_w2", day: 0, start: 9.0, end: 9.5, title: "주간 리뷰", mandatory: true },
        { id: "e11_w2", day: 0, start: 10.5, end: 11.5, title: "디자인 최종", mandatory: false },
        { id: "e12_w2", day: 0, start: 14.5, end: 15.5, title: "사용자 테스트", mandatory: true },
        { id: "e13_w2", day: 1, start: 9.0, end: 10.0, title: "결과 정리", mandatory: false },
        { id: "e14_w2", day: 1, start: 11.5, end: 12.5, title: "프로토타입 완성", mandatory: true },
        { id: "e15_w2", day: 2, start: 9.5, end: 10.5, title: "최종 검토", mandatory: true },
        { id: "e16_w2", day: 2, start: 15.5, end: 16.5, title: "프레젠테이션", mandatory: false },
        { id: "e17_w2", day: 3, start: 10.0, end: 11.0, title: "디자인 리뷰", mandatory: true },
        { id: "e18_w2", day: 4, start: 9.0, end: 10.0, title: "최종 정리", mandatory: false },
      ],
    },
    {
      id: "p3", name: "박민수", email: "park.minsu@company.com", color: "#10B981", mandatory: true,
      events: [
        { id: "e19_w2", day: 0, start: 9.0, end: 9.5, title: "주간 리뷰", mandatory: true },
        { id: "e20_w2", day: 0, start: 11.0, end: 12.0, title: "코드 최적화", mandatory: false },
        { id: "e21_w2", day: 0, start: 16.0, end: 17.0, title: "성능 테스트", mandatory: true },
        { id: "e22_w2", day: 1, start: 9.5, end: 10.5, title: "버그 수정", mandatory: false },
        { id: "e23_w2", day: 1, start: 11.0, end: 12.0, title: "배포 준비", mandatory: true },
        { id: "e24_w2", day: 2, start: 9.0, end: 10.0, title: "최종 테스트", mandatory: true },
        { id: "e25_w2", day: 2, start: 14.0, end: 15.0, title: "문서화", mandatory: false },
        { id: "e26_w2", day: 3, start: 9.5, end: 10.5, title: "코드 리뷰", mandatory: true },
        { id: "e27_w2", day: 4, start: 10.0, end: 11.0, title: "시스템 점검", mandatory: false },
      ],
    },
    {
      id: "p4", name: "정수진", email: "jung.sujin@company.com", color: "#F59E0B", mandatory: false,
      events: [
        { id: "e28_w2", day: 0, start: 10.0, end: 11.0, title: "테스트 완료", mandatory: false },
        { id: "e29_w2", day: 0, start: 15.0, end: 16.0, title: "품질 보고", mandatory: true },
        { id: "e30_w2", day: 1, start: 9.0, end: 10.0, title: "최종 검증", mandatory: true },
        { id: "e31_w2", day: 1, start: 14.0, end: 15.0, title: "결과 정리", mandatory: false },
        { id: "e32_w2", day: 2, start: 10.5, end: 11.5, title: "최종 점검", mandatory: true },
        { id: "e33_w2", day: 2, start: 16.0, end: 17.0, title: "완료 보고", mandatory: false },
        { id: "e34_w2", day: 3, start: 9.0, end: 10.0, title: "품질 검토", mandatory: true },
        { id: "e35_w2", day: 4, start: 11.5, end: 12.5, title: "테스트 정리", mandatory: false },
      ],
    },
    {
      id: "p5", name: "최지훈", email: "choi.jihun@company.com", color: "#8B5CF6", mandatory: false,
      events: [
        { id: "e36_w2", day: 0, start: 9.5, end: 10.5, title: "보안 점검", mandatory: true },
        { id: "e37_w2", day: 0, start: 11.5, end: 12.5, title: "시스템 안정화", mandatory: false },
        { id: "e38_w2", day: 1, start: 9.0, end: 10.0, title: "모니터링 설정", mandatory: true },
        { id: "e39_w2", day: 1, start: 15.0, end: 16.0, title: "백업 완료", mandatory: false },
        { id: "e40_w2", day: 2, start: 9.0, end: 10.0, title: "최종 점검", mandatory: true },
        { id: "e41_w2", day: 2, start: 14.5, end: 15.5, title: "보고서 작성", mandatory: false },
        { id: "e42_w2", day: 3, start: 10.5, end: 11.5, title: "인프라 점검", mandatory: true },
        { id: "e43_w2", day: 4, start: 9.5, end: 10.5, title: "시스템 정리", mandatory: false },
      ],
    },
    {
      id: "p6", name: "한소영", email: "han.soyoung@company.com", color: "#EC4899", mandatory: false,
      events: [
        { id: "e44_w2", day: 0, start: 9.0, end: 10.0, title: "사용자 피드백", mandatory: true },
        { id: "e45_w2", day: 0, start: 15.0, end: 16.0, title: "개선사항 정리", mandatory: false },
        { id: "e46_w2", day: 1, start: 10.0, end: 11.0, title: "최종 디자인", mandatory: true },
        { id: "e47_w2", day: 1, start: 14.5, end: 15.5, title: "사용성 검증", mandatory: false },
        { id: "e48_w2", day: 2, start: 9.5, end: 10.5, title: "결과 발표", mandatory: true },
        { id: "e49_w2", day: 2, start: 16.0, end: 17.0, title: "최종 정리", mandatory: false },
        { id: "e50_w2", day: 3, start: 9.0, end: 10.0, title: "디자인 검토", mandatory: true },
        { id: "e51_w2", day: 4, start: 10.5, end: 11.5, title: "사용자 테스트", mandatory: false },
      ],
    },
    {
      id: "p7", name: "강동현", email: "kang.donghyun@company.com", color: "#06B6D4", mandatory: false,
      events: [
        { id: "e52_w2", day: 0, start: 9.5, end: 10.5, title: "데이터 분석 완료", mandatory: true },
        { id: "e53_w2", day: 0, start: 11.0, end: 12.0, title: "인사이트 정리", mandatory: false },
        { id: "e54_w2", day: 1, start: 9.0, end: 10.0, title: "최종 리포트", mandatory: true },
        { id: "e55_w2", day: 1, start: 15.5, end: 16.5, title: "시각화 완성", mandatory: false },
        { id: "e56_w2", day: 2, start: 9.0, end: 10.0, title: "발표 준비", mandatory: true },
        { id: "e57_w2", day: 2, start: 14.0, end: 15.0, title: "최종 검토", mandatory: false },
        { id: "e58_w2", day: 3, start: 10.0, end: 11.0, title: "데이터 정리", mandatory: true },
        { id: "e59_w2", day: 4, start: 9.0, end: 10.0, title: "분석 보고", mandatory: false },
      ],
    },
    {
      id: "p8", name: "윤서연", email: "yoon.seoyeon@company.com", color: "#84CC16", mandatory: false,
      events: [
        { id: "e60_w2", day: 0, start: 9.0, end: 10.0, title: "재무 정리", mandatory: true },
        { id: "e61_w2", day: 0, start: 14.5, end: 15.5, title: "예산 마무리", mandatory: false },
        { id: "e62_w2", day: 1, start: 9.5, end: 10.5, title: "최종 보고", mandatory: true },
        { id: "e63_w2", day: 1, start: 16.0, end: 17.0, title: "정산 완료", mandatory: false },
        { id: "e64_w2", day: 2, start: 9.0, end: 10.0, title: "재무 검토", mandatory: true },
        { id: "e65_w2", day: 2, start: 15.0, end: 16.0, title: "최종 정리", mandatory: false },
        { id: "e66_w2", day: 3, start: 9.5, end: 10.5, title: "예산 검토", mandatory: true },
        { id: "e67_w2", day: 4, start: 10.0, end: 11.0, title: "재무 보고", mandatory: false },
      ],
    },
    {
      id: "p9", name: "임태호", email: "lim.taeho@company.com", color: "#F97316", mandatory: false,
      events: [
        { id: "e68_w2", day: 0, start: 9.0, end: 10.0, title: "법무 검토 완료", mandatory: true },
        { id: "e69_w2", day: 0, start: 11.0, end: 12.0, title: "계약 마무리", mandatory: false },
        { id: "e70_w2", day: 1, start: 9.0, end: 10.0, title: "최종 검토", mandatory: true },
        { id: "e71_w2", day: 1, start: 15.0, end: 16.0, title: "문서 정리", mandatory: false },
        { id: "e72_w2", day: 2, start: 9.5, end: 10.5, title: "법무 보고", mandatory: true },
        { id: "e73_w2", day: 2, start: 16.0, end: 17.0, title: "최종 정리", mandatory: false },
        { id: "e74_w2", day: 3, start: 9.0, end: 10.0, title: "계약 검토", mandatory: true },
        { id: "e75_w2", day: 4, start: 11.0, end: 12.0, title: "법무 정리", mandatory: false },
      ],
    },
    {
      id: "p10", name: "송미래", email: "song.mirae@company.com", color: "#6366F1", mandatory: false,
      events: [
        { id: "e76_w2", day: 0, start: 9.5, end: 10.5, title: "HR 정리", mandatory: true },
        { id: "e77_w2", day: 0, start: 14.0, end: 15.0, title: "평가 완료", mandatory: false },
        { id: "e78_w2", day: 1, start: 9.0, end: 10.0, title: "교육 마무리", mandatory: true },
        { id: "e79_w2", day: 1, start: 15.5, end: 16.5, title: "성과 정리", mandatory: false },
        { id: "e80_w2", day: 2, start: 9.0, end: 10.0, title: "최종 보고", mandatory: true },
        { id: "e81_w2", day: 2, start: 14.5, end: 15.5, title: "팀 정리", mandatory: false },
        { id: "e82_w2", day: 3, start: 10.0, end: 11.0, title: "인사 검토", mandatory: true },
        { id: "e83_w2", day: 4, start: 9.5, end: 10.5, title: "HR 보고", mandatory: false },
      ],
    },
  ];

  // ====== 상태 ======
  const [demoMode, setDemoMode] = useState("small"); // small | large | user - 데모 모드
  const [currentWeek, setCurrentWeek] = useState(0); // 0: 첫 번째 주, 1: 두 번째 주
  
  // 각 데모 모드와 주차별로 데이터를 캐시
  const [cachedParticipants, setCachedParticipants] = useState({
    small: { 0: null, 1: null },
    large: { 0: null, 1: null },
    user: { 0: null, 1: null }
  });
  
  // 사용자 데모용 랜덤 일정 생성 함수
  const generateRandomEventsForUser = (name, index) => {
    const eventTitles = [
      "팀 미팅", "프로젝트 검토", "클라이언트 상담", "디자인 리뷰", 
      "코드 리뷰", "브레인스토밍", "보고서 작성", "데이터 분석",
      "사용자 테스트", "마케팅 회의", "세일즈 미팅", "HR 미팅"
    ];
    
    const events = [];
    const numEvents = Math.floor(Math.random() * 4) + 2; // 2-5개 일정
    
    for (let i = 0; i < numEvents; i++) {
      const day = Math.floor(Math.random() * 5); // 월-금
      const startHour = 9 + Math.floor(Math.random() * 8); // 9-16시
      const duration = 1 + Math.random() * 2; // 1-3시간 (최소 1시간)
      const endHour = Math.min(startHour + duration, 18);
      
      events.push({
        id: `user_event_${index}_${i}`,
        day: day,
        start: Math.floor(startHour * 2) / 2, // 0.5 단위로 정수화
        end: Math.floor(endHour * 2) / 2, // 0.5 단위로 정수화
        title: eventTitles[Math.floor(Math.random() * eventTitles.length)],
        mandatory: Math.random() > 0.4 // 60% 확률로 필수 일정
      });
    }
    
    return events;
  };
  
  // 데모 모드와 주간에 따른 참여자 데이터 선택 (캐시 사용)
  const getParticipantsForWeek = (demoMode, week) => {
    // 캐시된 데이터가 있으면 사용
    if (cachedParticipants[demoMode][week]) {
      return cachedParticipants[demoMode][week];
    }
    
    let participants;
    if (demoMode === "large") {
      participants = week === 0 ? largeParticipants : secondWeekParticipants;
    } else if (demoMode === "small") {
      participants = week === 0 ? initialParticipants : secondWeekParticipants3;
    } else if (demoMode === "user") {
      // 사용자 데모 모드에서는 Agent 데이터를 기반으로 참여자 생성
      if (agentData && agentData.participants) {
        participants = agentData.participants.map((name, index) => ({
          id: `user_${index}`,
          name: name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
          color: palette[index % palette.length],
          events: generateRandomEventsForUser(name, index)
        }));
      } else {
        participants = [];
      }
    } else {
      participants = initialParticipants; // 기본값
    }
    
    // 캐시에 저장
    setCachedParticipants(prev => ({
      ...prev,
      [demoMode]: {
        ...prev[demoMode],
        [week]: participants
      }
    }));
    
    return participants;
  };
  
  const currentParticipants = getParticipantsForWeek(demoMode, currentWeek);
  const [participants, setParticipants] = useState(currentParticipants);
  
  // 사용자 데모 모드일 때 모든 참여자를 필수로 포함
  useEffect(() => {
    if (demoMode === "user" && agentData && agentData.participants) {
      const allParticipantIds = participants.map(p => p.id);
      setSelectedRequiredParticipantIds(new Set(allParticipantIds));
    }
  }, [demoMode, agentData, participants]);

  // agentData가 있을 때 사용자 데모 탭으로 자동 전환
  useEffect(() => {
    if (agentData && agentData.participants && agentData.participants.length > 0) {
      setDemoMode("user");
    }
  }, [agentData]);
  const [mode, setMode] = useState("organizer"); // organizer | participant
  const [activeParticipantId, setActiveParticipantId] = useState("p1");
  const [considerOnlyMandatory, setConsiderOnlyMandatory] = useState(true);
  const [ignoredEventIds, setIgnoredEventIds] = useState(new Set());
  const [selectedRequiredParticipantIds, setSelectedRequiredParticipantIds] = useState(new Set(["p1", "p2", "p3"]));
  const [selectedEvent, setSelectedEvent] = useState(null); // {participantId,eventId,day,start}
  const [overlapPicker, setOverlapPicker] = useState(null); // {day, topPct, items:[{participantId,eventId,title,participantName}]}
  const [isAddingEvent, setIsAddingEvent] = useState(false); // 일정 추가 모드
  const [dragSelection, setDragSelection] = useState(null); // {day, start, end}
  const [touchStartPoint, setTouchStartPoint] = useState(null); // {day, time} - 모바일 터치 시작점
  const [showMobileInput, setShowMobileInput] = useState(false); // 모바일 전용 입력 박스 표시
  const [isEventListExpanded, setIsEventListExpanded] = useState(false); // 전체 일정 리스트 펼침/접힘 상태
  const [showParticipantPopup, setShowParticipantPopup] = useState(false); // 참여자 탭 클릭 시 팝업 표시
  const [showMobileTutorial, setShowMobileTutorial] = useState(false); // 모바일 일정 추가 튜토리얼 표시
  const [showOrganizerTutorial, setShowOrganizerTutorial] = useState(false); // 모임장 탭 튜토리얼 표시
  const [showParticipantTutorial, setShowParticipantTutorial] = useState(false); // 참여자 탭 튜토리얼 표시

  // App.jsx에서 전달받은 모임장 튜토리얼 표시 상태를 동기화
  useEffect(() => {
    if (showOrganizerTutorialOnCalendar) {
      setShowOrganizerTutorial(true);
    }
  }, [showOrganizerTutorialOnCalendar]);

  // ====== 유틸 ======
  const hours = useMemo(() => {
    const arr = [];
    for (let h = START_HOUR; h < END_HOUR; h += 1) arr.push(h);
    return arr;
  }, []);

  // 터치 지원 감지 (이벤트 핸들러에서만 사용)
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // 데모 모드와 주간에 따른 참여자 데이터 및 필수 참여자 초기화 (캐시 사용)
  React.useEffect(() => {
    const newParticipants = getParticipantsForWeek(demoMode, currentWeek);
    setParticipants(newParticipants);
    
    // activeParticipantId가 새로운 참여자 목록에 없으면 첫 번째 참여자로 설정
    const validParticipantId = newParticipants.find(p => p.id === activeParticipantId) ? activeParticipantId : newParticipants[0]?.id;
    if (validParticipantId !== activeParticipantId) {
      setActiveParticipantId(validParticipantId);
    }
    
    if (demoMode === "large") {
      setSelectedRequiredParticipantIds(new Set(["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"]));
    } else if (demoMode === "small") {
      setSelectedRequiredParticipantIds(new Set(["p1", "p2", "p3"]));
    } else if (demoMode === "user") {
      // 사용자 데모 모드일 때 모든 참여자를 필수로 포함
      const allParticipantIds = newParticipants.map(p => p.id);
      setSelectedRequiredParticipantIds(new Set(allParticipantIds));
    }
  }, [demoMode, currentWeek, agentData]); // agentData도 의존성에 추가

  // 일정 추가 모드에서 스크롤 방지
  React.useEffect(() => {
    if (mode === "participant" && isAddingEvent && !hasTouchSupport) {
      const preventScroll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      const preventWheel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      const preventTouch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      // body와 documentElement 스크롤 방지
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.width = '100%';
      document.documentElement.style.height = '100%';

      // 전역 이벤트 리스너 추가 (더 강력한 스크롤 방지)
      document.addEventListener('wheel', preventWheel, { passive: false, capture: true });
      document.addEventListener('touchmove', preventTouch, { passive: false, capture: true });
      document.addEventListener('scroll', preventScroll, { passive: false, capture: true });
      document.addEventListener('keydown', (e) => {
        if ([32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, { passive: false });

      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.position = '';
        document.documentElement.style.width = '';
        document.documentElement.style.height = '';
        
        document.removeEventListener('wheel', preventWheel, { capture: true });
        document.removeEventListener('touchmove', preventTouch, { capture: true });
        document.removeEventListener('scroll', preventScroll, { capture: true });
      };
    }
  }, [mode, isAddingEvent, hasTouchSupport]);

  function timeToPct(t) {
    return ((t - START_HOUR) / (END_HOUR - START_HOUR)) * 100;
  }

  function fmtTime(t) {
    const h = Math.floor(t);
    const m = Math.round((t - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function fmtHour(h) {
    const hour = Math.floor(h);
    const minute = h % 1 === 0.5 ? 30 : 0;
    return `${hour}시${minute === 30 ? ' 30분' : ''}`;
  }

  // ====== 조작 ======
  function toggleMandatory(participantId, eventId) {
    console.log('toggleMandatory 호출됨:', participantId, eventId);
    
    // participants 상태를 직접 업데이트
    setParticipants((prev) => {
      const updated = prev.map((p) =>
        p.id !== participantId
          ? p
          : {
              ...p,
              events: p.events.map((e) => (e.id === eventId ? { ...e, mandatory: !e.mandatory } : e)),
            }
      );
      console.log('업데이트된 participants:', updated);
      return updated;
    });
    
    // 필수 토글 후에는 오버레이를 닫지 않고 유지
    // setSelectedEvent(null); // 이 줄을 제거하여 오버레이 유지
  }

  function deleteEvent(participantId, eventId) {
    console.log('deleteEvent 호출됨:', participantId, eventId);
    
    // participants 상태를 직접 업데이트
    setParticipants((prev) => {
      const updated = prev.map((p) => 
        p.id !== participantId ? p : { ...p, events: p.events.filter((e) => e.id !== eventId) }
      );
      console.log('삭제 후 participants:', updated);
      return updated;
    });
    
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
    setIsAddingEvent(false); // 일정 추가 완료 시 모드 종료
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

  // ====== 초대 메시지 작성 관련 함수들 ======

  // 화면에 표시할 이벤트 집합(필터 적용)
  const visibleEvents = useMemo(() => {
    const out = [];
    
    if (mode === "participant") {
      // 참여자 모드: 선택된 참여자의 일정만 표시
      const activeParticipant = participants.find(p => p.id === activeParticipantId);
      if (activeParticipant) {
        for (const e of activeParticipant.events) {
          out.push({ ...e, participantId: activeParticipant.id, participantName: activeParticipant.name, color: activeParticipant.color });
        }
      }
    } else {
      // 모임장 모드: 필터 적용된 모든 일정 표시
      for (const p of participants) {
        for (const e of p.events) {
          if (ignoredEventIds.has(e.id)) continue; // 모임장 무시
          if (considerOnlyMandatory && !e.mandatory) continue; // 필수만
          if (!selectedRequiredParticipantIds.has(p.id)) continue; // 필수 참여자 필터
          out.push({ ...e, participantId: p.id, participantName: p.name, color: p.color });
        }
      }
    }
    
    return out;
  }, [participants, ignoredEventIds, considerOnlyMandatory, selectedRequiredParticipantIds, mode, activeParticipantId]);

  // ====== 공통 빈 시간 계산(리스트용) ======
  const freeSlotsByDay = useMemo(() => {
    const selectedP = participants.filter((p) => selectedRequiredParticipantIds.has(p.id));
    const slots = {};
    
    // 태그 생성 함수
    const generateTags = (startTime, endTime, dayIndex, busyTimes) => {
      const tags = [];
      
      // 1. 퇴근시간 임박 태그 (#퇴근시간 임박)
      if (endTime >= 18) {
        tags.push({ text: "#퇴근시간 임박", color: "bg-red-100 text-red-700" });
      }
      
      // 2. 점심시간 포함 태그 (#점심시간 포함)
      const lunchStart = 12;
      const lunchEnd = 13;
      const slotDuration = endTime - startTime;
      const lunchOverlapStart = Math.max(startTime, lunchStart);
      const lunchOverlapEnd = Math.min(endTime, lunchEnd);
      const lunchOverlapDuration = Math.max(0, lunchOverlapEnd - lunchOverlapStart);
      
      if (lunchOverlapDuration > 0 && lunchOverlapDuration >= slotDuration * 0.5) {
        tags.push({ text: "#점심시간 포함", color: "bg-yellow-100 text-yellow-700" });
      }
      
      // 3. 이전미팅 있음 태그 (#이전미팅 있음)
      const hasPreviousMeeting = busyTimes.some(([busyStart, busyEnd]) => 
        busyEnd <= startTime && busyEnd > startTime - 1 // 1시간 이내에 끝나는 미팅
      );
      if (hasPreviousMeeting) {
        tags.push({ text: "#이전미팅 있음", color: "bg-blue-100 text-blue-700" });
      }
      
      // 4. 이후미팅 있음 태그 (#이후미팅 있음)
      const hasNextMeeting = busyTimes.some(([busyStart, busyEnd]) => 
        busyStart >= endTime && busyStart < endTime + 1 // 1시간 이내에 시작하는 미팅
      );
      if (hasNextMeeting) {
        tags.push({ text: "#이후미팅 있음", color: "bg-purple-100 text-purple-700" });
      }
      
      return tags;
    };
    
    for (let d = 0; d < 5; d++) {
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
        if (s > cur) {
          const tags = generateTags(cur, s, d, merged);
          dayFree.push([cur, s, tags]);
        }
        cur = Math.max(cur, e);
      }
      if (cur < END_HOUR) {
        const tags = generateTags(cur, END_HOUR, d, merged);
        dayFree.push([cur, END_HOUR, tags]);
      }
      slots[d] = dayFree;
    }
    return slots;
  }, [participants, selectedRequiredParticipantIds, considerOnlyMandatory, ignoredEventIds]);

  // ====== 미팅 정보 팝업 상태 ======
  const [meetingPopup, setMeetingPopup] = useState(null); // { dayIndex, startTime, endTime, minStart, maxEnd }

  // ====== 미팅 정보 팝업 생성 ======
  const createMeetingPopup = (startTime, endTime, dayIndex) => {
    setMeetingPopup({
      dayIndex,
      startTime,
      endTime,
      minStart: startTime,
      maxEnd: endTime
    });
  };

  // ====== 미팅 전송 완료 ======
  const sendMeeting = () => {
    alert('전송이 완료되었습니다');
    setMeetingPopup(null);
  };

  // ====== 시간 포맷팅 함수들 ======
  const formatTimeForInput = (time) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const parseTimeFromInput = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + minutes / 60;
  };

  // ====== 시간 옵션 생성 함수 ======
  const generateTimeOptions = (minTime, maxTime, intervalMinutes = 30) => {
    const options = [];
    const startHour = Math.floor(minTime);
    const endHour = Math.ceil(maxTime);
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const timeValue = hour + minute / 60;
        
        // 선택된 구간 내의 시간만 포함 (경계값 포함)
        if (timeValue >= minTime && timeValue <= maxTime) {
          options.push({
            value: formatTimeForInput(timeValue),
            label: formatTimeForInput(timeValue),
            timeValue: timeValue
          });
        }
      }
    }
    
    return options;
  };

  function ParticipantLegend() {
    // 필터링 제거됨 - 모든 참여자 표시

    const total = participants.length;
    const selectedCount = selectedRequiredParticipantIds.size;

    // 사용하지 않는 함수들 제거됨

    return (
      <div className="space-y-3">
        {/* 컨트롤 바 제거됨 */}

        {/* 참여자 칩 목록 */}
      <div className="flex flex-wrap gap-3">
          {participants.map((p) => {
            const selected = selectedRequiredParticipantIds.has(p.id);
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 rounded-2xl px-3 py-2 border shadow-sm cursor-pointer transition
                  ${selected ? "bg-blue-50 border-blue-200" : "bg-white"}
                `}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleRequiredParticipant(p.id);
                }}
              >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-sm font-medium">{p.name}</span>

                {/* 스크롤 튐 방지: input은 클릭 비활성화, 상태는 부모 div에서 토글 */}
            <label className="text-xs ml-2 flex items-center gap-1">
              <input
                type="checkbox"
                    checked={selected}
                    readOnly
                    style={{ pointerEvents: "none" }}
              />
              필수로 포함
            </label>
          </div>
            );
          })}
        </div>
      </div>
    );
  }

  function ParticipantPanel() {
    const me = participants.find((p) => p.id === activeParticipantId) ?? participants[0];
    const myEvents = me.events;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <select
            className="border rounded-xl px-3 py-2"
            value={activeParticipantId}
            onChange={(e) => setActiveParticipantId(e.target.value)}
          >
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

  function UserDemoPanel() {
    if (!agentData) {
      return (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">일정 초대</h2>
            <p className="text-slate-600 mb-6">
              AI Agent를 통해 새로운 일정을 초대해보세요
            </p>
            <button 
              onClick={() => {
                // Agent 탭으로 이동하는 로직은 상위 컴포넌트에서 처리
                window.location.reload(); // 임시로 페이지 새로고침
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              일정 초대하기
            </button>
          </div>
        </div>
      );
    }

    // Agent 데이터가 있을 때 기존 캘린더와 동일한 디자인 사용
    // 필요한 변수들을 계산 (OrganizerPanel과 동일한 로직 사용)
    const visibleEvents = participants.flatMap(p => 
      p.events
        .filter(e => !ignoredEventIds.has(e.id))
        .filter(e => !considerOnlyMandatory || e.mandatory)
        .map(e => ({
          ...e,
          participantId: p.id,
          participantName: p.name,
          color: p.color
        }))
    );

    // 공통 빈 시간 계산 (OrganizerPanel과 동일한 로직)
    const freeSlotsByDay = useMemo(() => {
      const selectedP = participants.filter((p) => selectedRequiredParticipantIds.has(p.id));
      const slots = {};
      
      // 태그 생성 함수
      const generateTags = (startTime, endTime, dayIndex, busyTimes) => {
        const tags = [];
        
        // 1. 퇴근시간 임박 태그 (#퇴근시간 임박)
        if (endTime >= 18) {
          tags.push({ text: "#퇴근시간 임박", color: "bg-red-100 text-red-700" });
        }
        
        // 2. 점심시간 포함 태그 (#점심시간 포함)
        const lunchStart = 12;
        const lunchEnd = 13;
        const slotDuration = endTime - startTime;
        const lunchOverlapStart = Math.max(startTime, lunchStart);
        const lunchOverlapEnd = Math.min(endTime, lunchEnd);
        const lunchOverlapDuration = Math.max(0, lunchOverlapEnd - lunchOverlapStart);
        
        if (lunchOverlapDuration > 0 && lunchOverlapDuration >= slotDuration * 0.5) {
          tags.push({ text: "#점심시간 포함", color: "bg-yellow-100 text-yellow-700" });
        }
        
        // 3. 이전미팅 있음 태그 (#이전미팅 있음)
        const hasPreviousMeeting = busyTimes.some(([busyStart, busyEnd]) => 
          busyEnd <= startTime && busyEnd > startTime - 1 // 1시간 이내에 끝나는 미팅
        );
        if (hasPreviousMeeting) {
          tags.push({ text: "#이전미팅 있음", color: "bg-blue-100 text-blue-700" });
        }
        
        // 4. 이후미팅 있음 태그 (#이후미팅 있음)
        const hasNextMeeting = busyTimes.some(([busyStart, busyEnd]) => 
          busyStart >= endTime && busyStart < endTime + 1 // 1시간 이내에 시작하는 미팅
        );
        if (hasNextMeeting) {
          tags.push({ text: "#이후미팅 있음", color: "bg-purple-100 text-purple-700" });
        }
        
        return tags;
      };
      
      for (let d = 0; d < 5; d++) {
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
          if (s > cur) {
            const tags = generateTags(cur, s, d, merged);
            dayFree.push([cur, s, tags]);
          }
          cur = Math.max(cur, e);
        }
        if (cur < END_HOUR) {
          const tags = generateTags(cur, END_HOUR, d, merged);
          dayFree.push([cur, END_HOUR, tags]);
        }
        slots[d] = dayFree;
      }
      return slots;
    }, [participants, selectedRequiredParticipantIds, considerOnlyMandatory, ignoredEventIds]);

    // toggleIgnore 함수 정의
    const toggleIgnore = (eventId) => {
      setIgnoredEventIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(eventId)) {
          newSet.delete(eventId);
        } else {
          newSet.add(eventId);
        }
        return newSet;
      });
    };

    return (
      <div className="space-y-6">
        {/* 공통 빈 시간 리스트 (색상 시각화는 제거) */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="px-4 py-3 border-b text-sm font-semibold">공통 빈 시간 (선택된 필수 참여자 기준)</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {Object.entries(freeSlotsByDay)
              .sort(([a], [b]) => Number(a) - Number(b)) // 날짜 순 정렬
              .map(([d, slots]) => {
                const sortedSlots = slots.sort((a, b) => {
                  const [aStart, aEnd, aTags] = a;
                  const [bStart, bEnd, bTags] = b;
                  
                  // 1. 가능시간이 긴 순 (내림차순)
                  const aDuration = aEnd - aStart;
                  const bDuration = bEnd - bStart;
                  if (Math.abs(aDuration - bDuration) > 0.1) {
                    return bDuration - aDuration;
                  }
                  
                  // 2. 태그가 적은 순 (오름차순)
                  return aTags.length - bTags.length;
                });
                
                return (
                  <div key={d} className="border rounded-xl p-3 bg-slate-50">
                    <div className="text-sm font-semibold mb-2">{DAYS[Number(d)]}</div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {sortedSlots.map(([start, end, tags], idx) => (
                        <li key={idx} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span>{fmtTime(start)}–{fmtTime(end)}</span>
                            <button 
                              className="text-[11px] px-2 py-1 rounded-lg border bg-white hover:bg-slate-100"
                              onClick={() => createMeetingPopup(start, end, Number(d))}
                            >
                              선택
                            </button>
                          </div>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tags.map((tag, tagIdx) => (
                                <span key={tagIdx} className={`text-[10px] px-1.5 py-0.5 rounded ${tag.color}`}>
                                  {tag.text}
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 전체 일정 리스트 + 무시 토글 */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="px-4 py-3 border-b text-sm font-semibold flex items-center justify-between">
            <span>전체 일정 (필터 반영)</span>
            <button
              onClick={() => setIsEventListExpanded(!isEventListExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {isEventListExpanded ? '접기' : '펼치기'}
              <span className="text-xs">{isEventListExpanded ? '▲' : '▼'}</span>
            </button>
          </div>
          {isEventListExpanded && (
          <div className="divide-y">
            {visibleEvents.length === 0 && <div className="p-4 text-sm text-slate-500">표시할 일정이 없습니다.</div>}
            {visibleEvents.map((e) => (
              <div key={e.id + e.participantId} className="p-4 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.title} — {e.participantName}</div>
                  <div className="text-xs text-slate-500">{DAYS[e.day]} {fmtTime(e.start)}–{fmtTime(e.end)}</div>
                </div>
                  <button 
                    onClick={(event) => {
                      event.preventDefault();
                      toggleIgnore(e.id);
                    }} 
                    className={"px-3 py-1 rounded-lg text-xs border " + (ignoredEventIds.has(e.id) ? "bg-slate-100 text-slate-500" : "bg-white hover:bg-slate-50")}
                  >
                    {ignoredEventIds.has(e.id) ? "무시 해제" : "일정 무시"}
                  </button>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* 참여자 선택 영역 */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <ParticipantLegend />
        </div>
      </div>
    );
  }

  function OrganizerPanel() {
    return (
      <div className="space-y-6">
        {/* 공통 빈 시간 리스트 (색상 시각화는 제거) */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="px-4 py-3 border-b text-sm font-semibold">공통 빈 시간 (선택된 필수 참여자 기준)</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {Object.entries(freeSlotsByDay)
              .sort(([a], [b]) => Number(a) - Number(b)) // 날짜 순 정렬
              .map(([d, slots]) => {
                const sortedSlots = slots.sort((a, b) => {
                  const [aStart, aEnd, aTags] = a;
                  const [bStart, bEnd, bTags] = b;
                  
                  // 1. 가능시간이 긴 순 (내림차순)
                  const aDuration = aEnd - aStart;
                  const bDuration = bEnd - bStart;
                  if (aDuration !== bDuration) {
                    return bDuration - aDuration;
                  }
                  
                  // 2. 태그가 적은 순 (오름차순)
                  const aTagCount = aTags ? aTags.length : 0;
                  const bTagCount = bTags ? bTags.length : 0;
                  if (aTagCount !== bTagCount) {
                    return aTagCount - bTagCount;
                  }
                  
                  // 3. 시작시간 순 (오름차순)
                  return aStart - bStart;
                });
                
                return (
              <div key={d} className="border rounded-xl p-3 bg-slate-50">
                <div className="text-sm font-semibold mb-2">{DAYS[Number(d)]}</div>
                    {sortedSlots.length === 0 ? (
                  <div className="text-xs text-slate-500">없음</div>
                ) : (
                      <ul className="space-y-2 text-xs text-slate-700">
                        {sortedSlots.map((slot, idx) => {
                          const [s, e, tags] = slot;
                          return (
                            <li key={idx} className="space-y-1">
                              <div className="flex items-center justify-between">
                        <span>{fmtTime(s)}–{fmtTime(e)}</span>
                                <button 
                                  onClick={(event) => {
                                    event.preventDefault();
                                    createMeetingPopup(s, e, Number(d));
                                  }}
                                  className="text-[11px] px-2 py-1 rounded-lg border bg-white hover:bg-slate-100"
                                >
                                  선택
                                </button>
                              </div>
                              {tags && tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {tags.map((tag, tagIdx) => (
                                    <span
                                      key={tagIdx}
                                      className={`text-[10px] px-2 py-1 rounded-full ${tag.color}`}
                                    >
                                      {tag.text}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </li>
                          );
                        })}
                  </ul>
                )}
              </div>
                );
              })}
          </div>
        </div>

        {/* 전체 일정 리스트 + 무시 토글 */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="px-4 py-3 border-b text-sm font-semibold flex items-center justify-between">
            <span>전체 일정 (필터 반영)</span>
            <button
              onClick={() => setIsEventListExpanded(!isEventListExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {isEventListExpanded ? '접기' : '펼치기'}
              <span className="text-xs">{isEventListExpanded ? '▲' : '▼'}</span>
            </button>
          </div>
          {isEventListExpanded && (
          <div className="divide-y">
            {visibleEvents.length === 0 && <div className="p-4 text-sm text-slate-500">표시할 일정이 없습니다.</div>}
            {visibleEvents.map((e) => (
              <div key={e.id + e.participantId} className="p-4 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.title} — {e.participantName}</div>
                  <div className="text-xs text-slate-500">{DAYS[e.day]} {fmtTime(e.start)}–{fmtTime(e.end)}</div>
                </div>
                  <button 
                    onClick={(event) => {
                      event.preventDefault();
                      toggleIgnore(e.id);
                    }} 
                    className={"px-3 py-1 rounded-lg text-xs border " + (ignoredEventIds.has(e.id) ? "bg-slate-100 text-slate-500" : "bg-white hover:bg-slate-50")}
                  >
                    {ignoredEventIds.has(e.id) ? "무시 해제" : "일정 무시"}
                  </button>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* 참여자 선택 영역 */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <ParticipantLegend />
        </div>

        {/* 전체 일정 리스트 + 무시 토글 */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="px-4 py-3 border-b text-sm font-semibold flex items-center justify-between">
            <span>전체 일정 (필터 반영)</span>
            <button
              onClick={() => setIsEventListExpanded(!isEventListExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {isEventListExpanded ? '접기' : '펼치기'}
              <span className="text-xs">{isEventListExpanded ? '▲' : '▼'}</span>
            </button>
          </div>
          {isEventListExpanded && (
          <div className="divide-y">
            {visibleEvents.length === 0 && <div className="p-4 text-sm text-slate-500">표시할 일정이 없습니다.</div>}
            {visibleEvents.map((e) => (
              <div key={e.id + e.participantId} className="p-4 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.title} — {e.participantName}</div>
                  <div className="text-xs text-slate-500">{DAYS[e.day]} {fmtTime(e.start)}–{fmtTime(e.end)}</div>
                </div>
                  <button 
                    onClick={(event) => {
                      event.preventDefault();
                      toggleIgnore(e.id);
                    }} 
                    className={"px-3 py-1 rounded-lg text-xs border " + (ignoredEventIds.has(e.id) ? "bg-slate-100 text-slate-500" : "bg-white hover:bg-slate-50")}
                  >
                    {ignoredEventIds.has(e.id) ? "무시 해제" : "일정 무시"}
                  </button>
              </div>
            ))}
          </div>
          )}
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
      const p = participants.find((pp) => pp.id === participantId);
      return p?.events.find((ee) => ee.id === eventId) ?? null;
    }

    const sel = (() => {
      if (!selectedEvent) return null;
      const p = participants.find((pp) => pp.id === selectedEvent.participantId);
      const ev = p?.events.find((ee) => ee.id === selectedEvent.eventId);
      return ev ? { ...ev, participantId: p?.id, participantName: p?.name, color: p?.color } : null;
    })();

    return (
      <div 
        ref={colRef} 
        className="relative border-l border-slate-200"
        onClick={() => { setSelectedEvent(null); setOverlapPicker(null); }}
        style={{ 
          userSelect: isAddingEvent ? 'none' : 'auto',
          pointerEvents: 'auto',
          // PC에서 스크롤 완전 차단
          ...(isAddingEvent && !hasTouchSupport ? {
            overscrollBehavior: 'none',
            WebkitOverscrollBehavior: 'none',
            scrollBehavior: 'auto'
          } : {})
        }}
        onMouseDown={(ev) => {
          // 스크롤 방지 처리 (모든 경우에 적용)
          ev.preventDefault();
          ev.stopPropagation();
          
          // 일정 요소가 아닌 경우에만 처리
          if (ev.target.closest('[data-event]')) {
            return; // 일정 요소는 무시
          }
          
          if (mode === "participant" && isAddingEvent) {
            // 일정 추가 모드에서만 드래그 처리
            // 스크롤 방지를 위한 추가 처리
            ev.currentTarget.style.userSelect = 'none';
            ev.currentTarget.style.webkitUserSelect = 'none';
            ev.currentTarget.style.overscrollBehavior = 'none';
            ev.currentTarget.style.webkitOverscrollBehavior = 'none';
            ev.currentTarget.style.scrollBehavior = 'auto';
            
            // 전역 스크롤 방지 강화
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.position = 'fixed';
            document.documentElement.style.width = '100%';
            document.documentElement.style.height = '100%';
            
            const startTime = yToTime(ev.clientY);
            console.log('드래그 시작:', dayIndex, startTime);
            setDragSelection({ day: dayIndex, start: startTime, end: startTime });
          }
        }}
        onTouchStart={hasTouchSupport ? (ev) => {
          // 일정 요소가 아닌 경우에만 처리
          if (ev.target.closest('[data-event]')) {
            return; // 일정 요소는 무시
          }
          
          if (mode === "participant" && isAddingEvent) {
            // 모바일에서만 터치 처리
            // 이벤트 전파만 방지 (preventDefault 호출 안함)
            ev.stopPropagation();
            const touch = ev.touches[0];
            const touchTime = yToTime(touch.clientY);
            
            if (!touchStartPoint) {
              // 첫 번째 터치: 시작점 설정
              console.log('모바일 첫 번째 터치:', { dayIndex, touchTime });
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
                const startTime = touchStartPoint.time;
                const endTime = touchTime;
                console.log('모바일 터치 완료:', { startTime, endTime, dayIndex });
                setDragSelection({ day: dayIndex, start: startTime, end: endTime });
                setTouchStartPoint(null);
                setIsAddingEvent(false);
                setShowMobileInput(true);
              }
            }
          }
        } : undefined}
        onTouchMove={hasTouchSupport ? (ev) => {
          // 모바일에서는 터치 이동 무시 (드래그 방식 사용 안함)
        } : undefined}
        onTouchEnd={hasTouchSupport ? (ev) => {
          // 모바일에서는 터치 종료 무시
        } : undefined}
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
            {mode === "participant" && isAddingEvent && hasTouchSupport && touchStartPoint && touchStartPoint.day === dayIndex && (
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
        {mode === "participant" && !isAddingEvent && dragSelection && dragSelection.day === dayIndex && !hasTouchSupport && (
          <div
            className="absolute left-1 right-1 bg-green-200 border-2 border-green-400 rounded-xl opacity-80"
            style={{
              top: `${timeToPct(Math.min(dragSelection.start, dragSelection.end))}%`,
              height: `${Math.max(hasTouchSupport ? 8 : 4, Math.abs(timeToPct(dragSelection.end) - timeToPct(dragSelection.start)))}%`
            }}
          >
            <div className={hasTouchSupport ? "p-4" : "p-2"}>
              <input
                type="text"
                placeholder="일정명을 입력하세요"
                className={`w-full bg-white border border-green-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  hasTouchSupport ? 'text-base py-3 px-4' : 'text-xs'
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
                    setIsAddingEvent(false);
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
                    setIsAddingEvent(false);
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
                style={{ 
                  top: `${top}%`, 
                  height: `${height}%`, 
                  backgroundColor: e.color, 
                  opacity: e.mandatory ? 0.9 : 0.55, 
                  mixBlendMode: "multiply"
                }}
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
                  // 클릭 시에도 선택 처리
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
                onTouchStart={hasTouchSupport ? (ev) => {
                  // preventDefault를 호출하지 않고 이벤트 전파만 방지
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
                } : undefined}
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
          <div 
            className={`absolute z-50 translate-y-[-6px] ${
              dayIndex === 0 ? 'left-2' : 
              dayIndex === 4 ? 'right-2' : 
              'left-1/2 transform -translate-x-1/2'
            }`} 
            style={{ top: `${overlapPicker.topPct}%` }} 
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="bg-white border shadow-xl rounded-2xl p-2 w-56 max-w-[calc(100vw-2rem)]">
              <div className="px-2 py-1 text-xs text-slate-500">어떤 일정을 변경할까요?</div>
              <div className="max-h-48 overflow-auto mt-1 flex flex-col gap-1">
                {overlapPicker.items.map((it, idx) => (
                  <button key={`${it.participantId}-${it.eventId}-${idx}`} className="text-left text-sm px-3 py-2 rounded-xl border hover:bg-slate-50" onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
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
          <div 
            className={`absolute z-50 translate-y-[-6px] ${
              dayIndex === 0 ? 'left-2' : 
              dayIndex === 4 ? 'right-2' : 
              'left-1/2 transform -translate-x-1/2'
            }`}
            style={{ top: `${timeToPct(selectedEvent.start ?? sel.start)}%` }} 
            onMouseDown={(ev) => ev.stopPropagation()}
            onMouseUp={(ev) => ev.stopPropagation()}
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="bg-white border shadow-xl rounded-2xl p-2 w-44 max-w-[calc(100vw-2rem)]">
              <div className="px-2 py-1 text-xs text-slate-500">{sel.title} · {sel.participantName}</div>
              <div className="flex flex-col gap-2 mt-1">
                <button 
                  className="text-sm px-3 py-2 rounded-xl border hover:bg-slate-50 text-slate-700" 
                  onMouseDown={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                  }}
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    console.log('필수 토글:', selectedEvent.participantId, selectedEvent.eventId);
                    toggleMandatory(selectedEvent.participantId, selectedEvent.eventId);
                    // 오버레이를 닫지 않고 유지
                  }}
                >
                  {sel.mandatory ? "필수 해제" : "필수로 표시"}
                </button>
                <button 
                  className="text-sm px-3 py-2 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50" 
                  onMouseDown={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                  }}
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    console.log('일정 삭제:', selectedEvent.participantId, selectedEvent.eventId);
                    deleteEvent(selectedEvent.participantId, selectedEvent.eventId);
                    // 삭제 후에는 오버레이가 자동으로 닫힘
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
          userSelect: isAddingEvent ? 'none' : 'auto',
          // 스크롤 방지 처리
          overscrollBehavior: 'none',
          WebkitOverscrollBehavior: 'none',
          scrollBehavior: 'auto',
          // 드래그 시 스크롤 방지
          ...(isAddingEvent && !hasTouchSupport ? {
            overflow: 'hidden',
            position: 'relative',
            // PC에서 스크롤 완전 차단
            pointerEvents: 'auto'
          } : {})
        }}
        onMouseMove={(ev) => {
          if (mode === "participant" && isAddingEvent) {
            // 일정 추가 모드에서는 모든 마우스 이동에서 스크롤 방지
            ev.preventDefault();
            ev.stopPropagation();
            
            if (dragSelection) {
              // 드래그 중일 때만 처리
              const rect = ev.currentTarget.getBoundingClientRect();
              const y = ev.clientY - rect.top;
              const pct = Math.min(Math.max(y / rect.height, 0), 1);
              const currentTime = START_HOUR + (END_HOUR - START_HOUR) * pct;
              const roundedTime = Math.round(currentTime * 2) / 2;
              
              console.log('드래그 이동:', roundedTime);
              setDragSelection(prev => ({ ...prev, end: roundedTime }));
            }
          }
        }}
        onMouseUp={(ev) => {
          if (mode === "participant" && isAddingEvent && dragSelection) {
            console.log('드래그 종료:', dragSelection);
            ev.preventDefault();
            ev.stopPropagation();
            
            setIsAddingEvent(false);
            // 드래그 선택이 완료되면 바로 일정명 입력 오버레이 표시
          }
        }}
        onMouseLeave={() => {
          if (mode === "participant" && isAddingEvent && dragSelection) {
            console.log('마우스가 그리드 영역을 벗어남');
            setIsAddingEvent(false);
          }
        }}
      >
        <div className="grid grid-cols-6 bg-slate-50 border-b">
          <div className="p-3 text-xs text-slate-500">시간</div>
          {DAYS.map((d) => (
            <div key={d} className="p-3 text-center text-xs font-semibold text-slate-700 border-l">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-6">
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
          <p className="text-sm text-slate-600 mt-1">
            초대 구간: <b>10월 24일 ~ 10월 31일</b> · 목적: <b>{demoMode === "user" && agentData ? agentData.title : "팀미팅"}</b>
            <br />
            구성: <span className="font-medium">{
              demoMode === "large" ? "10명 참여자" : 
              demoMode === "user" && agentData ? agentData.participants.join(", ") + "," :
              "황원준, 정유진, 한지은,"
            }</span>
              <span className="ml-2 text-blue-600 font-medium">
                · {currentWeek === 0 ? '1주차 (10월 24일~30일)' : '2주차 (10월 31일~11월 6일)'}
              </span>
          </p>
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
            <button
              onClick={() => setDemoMode("user")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                demoMode === "user" 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              사용자 데모
            </button>
          </div>
        </div>

        {/* 주간 네비게이션 (모든 데모에서 표시) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              disabled={currentWeek === 0}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                currentWeek === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-slate-700 hover:bg-slate-50 border'
              }`}
            >
              ← 이전주
            </button>
            <span className="text-sm text-slate-600 font-medium">
              {currentWeek === 0 ? '1주차' : '2주차'}
            </span>
            <button
              onClick={() => setCurrentWeek(Math.min(1, currentWeek + 1))}
              disabled={currentWeek === 1}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                currentWeek === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-slate-700 hover:bg-slate-50 border'
              }`}
            >
              다음주 →
            </button>
          </div>
        
        <div className="flex items-center gap-2 md:ml-auto">
              <button className={"px-4 py-2 rounded-xl border shadow-sm " + (mode === "organizer" ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50")} onClick={() => {
                setMode("organizer");
                setShowOrganizerTutorial(true);
              }}>
                모임장
              </button>
              <button className={"px-4 py-2 rounded-xl border shadow-sm " + (mode === "participant" ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50")} onClick={() => {
                setMode("participant");
                setShowParticipantPopup(true);
                setShowParticipantTutorial(true);
              }}>
                참여자
              </button>
              {mode === "participant" && (
                <div className="flex items-center gap-2">
                  <select 
                    className="border rounded-xl px-3 py-2 text-sm" 
                    value={activeParticipantId} 
                    onChange={(e) => setActiveParticipantId(e.target.value)}
                  >
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
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
                </div>
              )}
        </div>
      </div>

          {/* 주간 캘린더 */}
      {(demoMode !== "user" || (demoMode === "user" && agentData)) && <WeekGrid />}
          
          {/* 추가 모드 안내 */}
          {mode === "participant" && isAddingEvent && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="text-blue-800 font-medium mb-2">📅 일정 추가 모드</div>
              <div className="text-sm text-blue-600">
                {hasTouchSupport ? (
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
                        value={formatTimeForInput(Math.min(dragSelection.start, dragSelection.end))}
                        onChange={(e) => {
                          const newStart = parseTimeFromInput(e.target.value);
                          const currentEnd = Math.max(dragSelection.start, dragSelection.end);
                          setDragSelection(prev => ({
                            ...prev,
                            start: newStart,
                            end: Math.max(newStart, currentEnd)
                          }));
                        }}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generateTimeOptions(Math.min(dragSelection.start, dragSelection.end), Math.max(dragSelection.start, dragSelection.end), 30).map(time => (
                          <option key={time.value} value={time.value}>
                            {time.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">종료 시간</label>
                      <select
                        value={formatTimeForInput(Math.max(dragSelection.start, dragSelection.end))}
                        onChange={(e) => {
                          const newEnd = parseTimeFromInput(e.target.value);
                          const currentStart = Math.min(dragSelection.start, dragSelection.end);
                          setDragSelection(prev => ({
                            ...prev,
                            start: Math.min(currentStart, newEnd),
                            end: newEnd
                          }));
                        }}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generateTimeOptions(Math.min(dragSelection.start, dragSelection.end) + 0.5, Math.max(dragSelection.start, dragSelection.end), 30).map(time => (
                          <option key={time.value} value={time.value}>
                            {time.label}
                          </option>
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

      {/* 미팅 정보 팝업 */}
      {meetingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">미팅 정보</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">모임명</label>
                <input
                  type="text"
                  defaultValue="팀미팅"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">참석자</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {participants.filter(p => selectedRequiredParticipantIds.has(p.id)).map(p => p.name).join(', ')}
                </div>
                      </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{DAYS[meetingPopup.dayIndex]}</span>
                  <select
                    value={formatTimeForInput(meetingPopup.startTime)}
                    onChange={(e) => {
                      const newTime = parseTimeFromInput(e.target.value);
                      if (newTime < meetingPopup.endTime) {
                        setMeetingPopup(prev => ({ ...prev, startTime: newTime }));
                      } else {
                        // 시작시간이 종료시간보다 크거나 같으면 종료시간을 시작시간 + 0.5시간으로 설정
                        setMeetingPopup(prev => ({ 
                          ...prev, 
                          startTime: newTime,
                          endTime: Math.min(newTime + 0.5, prev.maxEnd)
                        }));
                      }
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {generateTimeOptions(meetingPopup.minStart, meetingPopup.endTime - 0.5, 30).map(time => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-500">-</span>
                  <select
                    value={formatTimeForInput(meetingPopup.endTime)}
                    onChange={(e) => {
                      const newTime = parseTimeFromInput(e.target.value);
                      if (newTime > meetingPopup.startTime) {
                        setMeetingPopup(prev => ({ ...prev, endTime: newTime }));
                      }
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {generateTimeOptions(meetingPopup.startTime + 0.5, meetingPopup.maxEnd, 30).map(time => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                                </div>
                </div>
              </div>

            <div className="flex gap-3 mt-6">
                        <button
                onClick={() => setMeetingPopup(null)}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        취소
                        </button>
                      <button
                onClick={sendMeeting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                전송
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 패널 */}
      {demoMode === "user" ? (
        mode === "participant" ? <ParticipantPanel /> : <UserDemoPanel />
      ) : (
        mode === "participant" ? <ParticipantPanel /> : <OrganizerPanel />
      )}

      <div className="text-xs text-slate-500 pt-4">
        · 겹침 표현: 참여자 색상 + <code>opacity</code> + <code>mix-blend-multiply</code> 사용. 클릭 위치 기반 겹침 선택 팝업 제공.<br />
        · 공통 빈 시간: 그리드 상의 녹색 하이라이트는 제거되었고, **리스트**로만 제공합니다.
                    </div>

      {/* 참여자 탭 클릭 시 팝업 */}
      {showParticipantPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">일정 추가하기</h3>
              <p className="text-slate-600 mb-6">추가 버튼으로 일정을 추가해보세요</p>
              <div className="flex gap-3 justify-center">
                      <button
                  onClick={() => setShowParticipantPopup(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  확인
                      </button>
                      <button
                  onClick={() => {
                    setShowParticipantPopup(false);
                    setIsAddingEvent(true);
                    // 모바일에서 일정 추가 튜토리얼 표시
                    if (hasTouchSupport) {
                      setShowMobileTutorial(true);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  일정 추가하기
                      </button>
                    </div>
                  </div>
                </div>
            </div>
          )}

      {/* 모바일 일정 추가 튜토리얼 팝업 */}
      {showMobileTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowMobileTutorial(false)}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                📱 모바일 일정 추가 방법
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                시작시간과 종료시간을 클릭해서<br/>
                일정을 추가해보세요!
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">1</div>
                  <span>원하는 요일의 시작시간을 터치하세요</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">2</div>
                  <span>같은 요일의 종료시간을 터치하세요</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">3</div>
                  <span>일정 정보를 입력하고 저장하세요</span>
                </div>
              </div>

              <button
                onClick={() => setShowMobileTutorial(false)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모임장 탭 튜토리얼 팝업 */}
      {showOrganizerTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            {/* 닫기 버튼 */}
            <button
              onClick={() => {
                setShowOrganizerTutorial(false);
                onCloseOrganizerTutorial?.();
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 튜토리얼 내용 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                👑 모임장 탭
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                모임장 탭에서 공통으로 빈 시간을 확인해서<br/>
                초대 메세지를 보내보세요!
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">1</div>
                  <span>참여자들의 일정을 확인하세요</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">2</div>
                  <span>공통 빈 시간을 찾아보세요</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">3</div>
                  <span>적절한 시간을 선택하여 초대하세요</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowOrganizerTutorial(false);
                  onCloseOrganizerTutorial?.();
                }}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 참여자 탭 튜토리얼 팝업 */}
      {showParticipantTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowParticipantTutorial(false)}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                👤 참여자 탭
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                참여자 입장에서 자신의 일정을 추가하고<br/>
                모임장에게 일정 정보를 전달해보세요!
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">1</div>
                  <span>자신의 일정을 추가하세요</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">2</div>
                  <span>필수 일정을 표시하세요</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">3</div>
                  <span>모임장에게 일정 정보를 전달하세요</span>
                </div>
              </div>

              <button
                onClick={() => setShowParticipantTutorial(false)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
