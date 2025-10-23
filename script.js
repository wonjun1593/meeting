// 전역 변수
let meetingData = {
    title: '',
    startDate: '',
    endDate: '',
    participants: [],
    responses: {}
};

let currentParticipant = '';
let participantSchedules = {};

// 페이지 전환 기능
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupInviteForm();
    setupParticipantPage();
    setupSummaryPage();
    generateSampleData();
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            
            // 모든 버튼과 페이지 비활성화
            navButtons.forEach(btn => btn.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));
            
            // 선택된 버튼과 페이지 활성화
            this.classList.add('active');
            document.getElementById(targetPage + '-page').classList.add('active');
            
            // 페이지별 초기화
            if (targetPage === 'participant') {
                initializeParticipantPage();
            } else if (targetPage === 'summary') {
                initializeSummaryPage();
            }
        });
    });
}

// 모임장 페이지 기능
function setupInviteForm() {
    const form = document.getElementById('invite-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('meeting-title').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const participantsText = document.getElementById('participants').value;
        
        // 참여자 목록 파싱
        const participants = participantsText.split(',').map(name => name.trim());
        
        // 모임 데이터 저장
        meetingData = {
            title: title,
            startDate: startDate,
            endDate: endDate,
            participants: participants,
            responses: {}
        };
        
        // 참여자별 초기 응답 데이터 생성
        participants.forEach(participant => {
            meetingData.responses[participant] = {
                selectedSchedules: [],
                availableTimes: []
            };
        });
        
        alert(`초대 알림이 ${participants.length}명의 참여자에게 전송되었습니다!`);
        
        // 참여자 페이지로 이동
        document.querySelector('[data-page="participant"]').click();
    });
}

// 참여자 페이지 기능
function setupParticipantPage() {
    const nameInput = document.getElementById('participant-name');
    const sendButton = document.getElementById('send-response');
    
    nameInput.addEventListener('change', function() {
        currentParticipant = this.value;
        if (currentParticipant && meetingData.participants.includes(currentParticipant)) {
            loadParticipantSchedules();
            generateWeekCalendar();
        }
    });
    
    sendButton.addEventListener('click', function() {
        if (!currentParticipant) {
            alert('이름을 입력해주세요.');
            return;
        }
        
        if (!meetingData.participants.includes(currentParticipant)) {
            alert('참여자 목록에 없는 이름입니다.');
            return;
        }
        
        const selectedSchedules = getSelectedSchedules();
        meetingData.responses[currentParticipant] = {
            selectedSchedules: selectedSchedules,
            availableTimes: getAvailableTimes()
        };
        
        alert('응답이 전송되었습니다!');
        
        // 종합보기 페이지로 이동
        document.querySelector('[data-page="summary"]').click();
    });
}

function initializeParticipantPage() {
    if (currentParticipant && meetingData.participants.includes(currentParticipant)) {
        loadParticipantSchedules();
        generateWeekCalendar();
    }
}

// 주간 달력 생성
function generateWeekCalendar() {
    const calendar = document.getElementById('week-calendar');
    calendar.innerHTML = '';
    
    // 요일 헤더 생성
    const dayHeaders = ['시간', '일', '월', '화', '수', '목', '금', '토'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // 시간 슬롯 생성 (9시부터 18시까지)
    for (let hour = 9; hour <= 18; hour++) {
        // 시간 헤더
        const timeHeader = document.createElement('div');
        timeHeader.className = 'time-header';
        timeHeader.textContent = `${hour}:00`;
        calendar.appendChild(timeHeader);
        
        // 각 요일별 셀 생성
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            cell.dataset.hour = hour;
            cell.dataset.day = day;
            
            // 해당 시간대의 일정이 있는지 확인
            const schedule = findScheduleAtTime(day, hour);
            if (schedule) {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = `schedule-item ${schedule.essential ? 'essential' : ''}`;
                scheduleItem.textContent = schedule.title;
                scheduleItem.dataset.scheduleId = schedule.id;
                scheduleItem.addEventListener('click', function() {
                    toggleScheduleSelection(schedule.id);
                });
                cell.appendChild(scheduleItem);
            }
            
            calendar.appendChild(cell);
        }
    }
}

// 일정 데이터 로드 (샘플 데이터)
function loadParticipantSchedules() {
    if (!currentParticipant) return;
    
    // 샘플 일정 데이터 생성
    participantSchedules = {
        '황원준': [
            { id: 1, title: '팀미팅', day: 1, hour: 10, duration: 2, essential: true },
            { id: 2, title: '코드리뷰', day: 2, hour: 14, duration: 1, essential: false },
            { id: 3, title: '클라이언트 미팅', day: 3, hour: 11, duration: 1, essential: true }
        ],
        '정유진': [
            { id: 4, title: '프로젝트 회의', day: 1, hour: 9, duration: 1, essential: true },
            { id: 5, title: '디자인 리뷰', day: 2, hour: 15, duration: 2, essential: false },
            { id: 6, title: '마케팅 미팅', day: 4, hour: 13, duration: 1, essential: true }
        ],
        '한지은': [
            { id: 7, title: '기획 회의', day: 1, hour: 11, duration: 1, essential: true },
            { id: 8, title: '사용자 테스트', day: 3, hour: 10, duration: 2, essential: false },
            { id: 9, title: '문서 작성', day: 5, hour: 14, duration: 1, essential: false }
        ]
    };
    
    updateScheduleList();
}

function updateScheduleList() {
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = '';
    
    if (!currentParticipant || !participantSchedules[currentParticipant]) return;
    
    participantSchedules[currentParticipant].forEach(schedule => {
        const scheduleCard = document.createElement('div');
        scheduleCard.className = `schedule-item-card ${schedule.essential ? 'essential' : ''}`;
        scheduleCard.dataset.scheduleId = schedule.id;
        
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const dayName = dayNames[schedule.day];
        const endHour = schedule.hour + schedule.duration;
        
        scheduleCard.innerHTML = `
            <div><strong>${schedule.title}</strong></div>
            <div>${dayName}요일 ${schedule.hour}:00 - ${endHour}:00</div>
            <div>${schedule.essential ? '필수 참석' : '선택 참석'}</div>
        `;
        
        scheduleCard.addEventListener('click', function() {
            toggleScheduleSelection(schedule.id);
        });
        
        scheduleList.appendChild(scheduleCard);
    });
}

function findScheduleAtTime(day, hour) {
    if (!currentParticipant || !participantSchedules[currentParticipant]) return null;
    
    return participantSchedules[currentParticipant].find(schedule => {
        return schedule.day === day && 
               hour >= schedule.hour && 
               hour < schedule.hour + schedule.duration;
    });
}

function toggleScheduleSelection(scheduleId) {
    const scheduleElements = document.querySelectorAll(`[data-schedule-id="${scheduleId}"]`);
    const isSelected = scheduleElements[0].classList.contains('selected');
    
    scheduleElements.forEach(element => {
        if (isSelected) {
            element.classList.remove('selected');
        } else {
            element.classList.add('selected');
        }
    });
}

function getSelectedSchedules() {
    const selectedElements = document.querySelectorAll('.schedule-item.selected, .schedule-item-card.selected');
    const selectedSchedules = [];
    
    selectedElements.forEach(element => {
        const scheduleId = parseInt(element.dataset.scheduleId);
        const schedule = participantSchedules[currentParticipant].find(s => s.id === scheduleId);
        if (schedule) {
            selectedSchedules.push(schedule);
        }
    });
    
    return selectedSchedules;
}

function getAvailableTimes() {
    // 빈 시간 계산 로직 (간단한 구현)
    const availableTimes = [];
    for (let day = 0; day < 7; day++) {
        for (let hour = 9; hour <= 18; hour++) {
            const schedule = findScheduleAtTime(day, hour);
            if (!schedule) {
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                availableTimes.push({
                    day: day,
                    dayName: dayNames[day],
                    hour: hour,
                    timeString: `${dayNames[day]}요일 ${hour}:00`
                });
            }
        }
    }
    return availableTimes;
}

// 종합보기 페이지 기능
function setupSummaryPage() {
    const essentialCheckbox = document.getElementById('show-essential');
    const optionalCheckbox = document.getElementById('hide-optional');
    const essentialSelect = document.getElementById('essential-participants');
    
    essentialCheckbox.addEventListener('change', updateSummaryDisplay);
    optionalCheckbox.addEventListener('change', updateSummaryDisplay);
    essentialSelect.addEventListener('change', updateSummaryDisplay);
}

function initializeSummaryPage() {
    updateParticipantSelector();
    generateSummaryCalendar();
    updateEmptySlots();
}

function updateParticipantSelector() {
    const select = document.getElementById('essential-participants');
    select.innerHTML = '';
    
    meetingData.participants.forEach(participant => {
        const option = document.createElement('option');
        option.value = participant;
        option.textContent = participant;
        select.appendChild(option);
    });
}

function generateSummaryCalendar() {
    const calendar = document.getElementById('summary-calendar');
    calendar.innerHTML = '';
    
    // 요일 헤더 생성
    const dayHeaders = ['시간', '일', '월', '화', '수', '목', '금', '토'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // 시간 슬롯 생성
    for (let hour = 9; hour <= 18; hour++) {
        // 시간 헤더
        const timeHeader = document.createElement('div');
        timeHeader.className = 'time-header';
        timeHeader.textContent = `${hour}:00`;
        calendar.appendChild(timeHeader);
        
        // 각 요일별 셀 생성
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            cell.dataset.hour = hour;
            cell.dataset.day = day;
            
            // 모든 참여자의 일정을 표시
            const allSchedules = getAllSchedulesAtTime(day, hour);
            if (allSchedules.length > 0) {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = 'schedule-item';
                
                if (allSchedules.length === 1) {
                    scheduleItem.style.backgroundColor = getParticipantColor(allSchedules[0].participant);
                } else {
                    scheduleItem.className += ' schedule-overlap';
                    scheduleItem.style.background = getOverlapColor(allSchedules);
                }
                
                scheduleItem.textContent = allSchedules.map(s => s.title).join(', ');
                cell.appendChild(scheduleItem);
            }
            
            calendar.appendChild(cell);
        }
    }
}

function getAllSchedulesAtTime(day, hour) {
    const allSchedules = [];
    
    meetingData.participants.forEach(participant => {
        const response = meetingData.responses[participant];
        if (response && response.selectedSchedules) {
            response.selectedSchedules.forEach(schedule => {
                if (schedule.day === day && 
                    hour >= schedule.hour && 
                    hour < schedule.hour + schedule.duration) {
                    allSchedules.push({
                        ...schedule,
                        participant: participant
                    });
                }
            });
        }
    });
    
    return allSchedules;
}

function getParticipantColor(participant) {
    const colors = {
        '황원준': 'rgba(52, 152, 219, 0.3)',
        '정유진': 'rgba(46, 204, 113, 0.3)',
        '한지은': 'rgba(155, 89, 182, 0.3)'
    };
    return colors[participant] || 'rgba(149, 165, 166, 0.3)';
}

function getOverlapColor(schedules) {
    const colors = schedules.map(s => getParticipantColor(s.participant));
    return `linear-gradient(45deg, ${colors.join(', ')})`;
}

function updateSummaryDisplay() {
    generateSummaryCalendar();
    updateEmptySlots();
}

function updateEmptySlots() {
    const emptySlotsList = document.getElementById('empty-slots-list');
    emptySlotsList.innerHTML = '';
    
    const emptySlots = findEmptyTimeSlots();
    
    emptySlots.forEach(slot => {
        const slotItem = document.createElement('div');
        slotItem.className = 'empty-slot-item';
        slotItem.textContent = `${slot.dayName}요일 ${slot.hour}:00 - ${slot.hour + 1}:00`;
        emptySlotsList.appendChild(slotItem);
    });
}

function findEmptyTimeSlots() {
    const emptySlots = [];
    
    for (let day = 0; day < 7; day++) {
        for (let hour = 9; hour <= 18; hour++) {
            const allSchedules = getAllSchedulesAtTime(day, hour);
            if (allSchedules.length === 0) {
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                emptySlots.push({
                    day: day,
                    dayName: dayNames[day],
                    hour: hour
                });
            }
        }
    }
    
    return emptySlots;
}

// 샘플 데이터 생성
function generateSampleData() {
    // 기본 날짜 설정
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    document.getElementById('start-date').value = today.toISOString().split('T')[0];
    document.getElementById('end-date').value = nextWeek.toISOString().split('T')[0];
}
