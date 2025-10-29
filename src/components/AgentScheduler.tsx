import React, { useMemo, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, MousePointerClick, PlusCircle, Trash2 } from "lucide-react";

// Types
interface Message {
  id: string;
  role: "agent" | "user";
  text: string;
}

type Step = "idle" | "askInvite" | "askParticipants" | "askTitle" | "readyToSend";

interface AgentSchedulerProps {
  onComposeSchedule?: (payload: { title: string; participants: string[]; transcript: Message[] }) => void;
}

// Helper: naive Korean name parser from free text
function extractNames(text: string): string[] {
  // 무작위 이름 생성 함수
  const generateRandomNames = (count: number): string[] => {
    const surnames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '고'];
    const givenNames = ['민수', '지영', '현우', '서연', '준호', '미영', '성민', '예진', '동현', '수진', '태현', '지현', '민호', '은지', '재현', '혜진', '승우', '지민', '현수', '유진'];
    
    const names: string[] = [];
    const usedNames = new Set<string>();
    
    while (names.length < count && names.length < surnames.length * givenNames.length) {
      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
      const fullName = surname + givenName;
      
      if (!usedNames.has(fullName)) {
        usedNames.add(fullName);
        names.push(fullName);
      }
    }
    
    return names;
  };

  // Split by , 와 그리고 공백
  const replaced = text
    .replaceAll("초대해줘", "")
    .replaceAll("초대", "")
    .replaceAll("와", ",")
    .replaceAll("그리고", ",")
    .replaceAll(" 및 ", ",")
    .replaceAll("  ", " ");
  
  const raw = replaced
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const finalNames: string[] = [];
  
  for (const token of raw) {
    const trimmedToken = token.trim();
    
    // 팀 이름으로 끝나는 경우 (예: "마케팅팀", "개발팀", "디자인팀")
    if (trimmedToken.endsWith('팀')) {
      const teamName = trimmedToken;
      const randomNames = generateRandomNames(10);
      finalNames.push(...randomNames);
      console.log(`${teamName}에 대해 무작위 10명 생성:`, randomNames);
    }
    // 사람 이름인 경우 (한글 이름 패턴)
    else if (/^[가-힣]{2,4}$/.test(trimmedToken) && !trimmedToken.endsWith('팀')) {
      finalNames.push(trimmedToken);
    }
    // 혼합된 경우 (예: "김철수, 마케팅팀, 이영희")
    else {
      // 공백으로 분리하여 각각 처리
      const parts = trimmedToken.split(/\s+/);
      for (const part of parts) {
        if (part.endsWith('팀')) {
          const randomNames = generateRandomNames(10);
          finalNames.push(...randomNames);
          console.log(`${part}에 대해 무작위 10명 생성:`, randomNames);
        } else if (/^[가-힣]{2,4}$/.test(part)) {
          finalNames.push(part);
        }
      }
    }
  }

  // Filter out generic words
  const blacklist = new Set(["사람", "인원", "모두", "전체"]);
  const filteredNames = finalNames
    .map((s) => s.replace(/[~!@#$%^&*()_+\-={}\[\]:;"'<>.?/`]|초대|해주세요|해줘|추가|제거|삭제/g, ""))
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && !blacklist.has(s));

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const uniq: string[] = [];
  for (const n of filteredNames) {
    if (!seen.has(n)) {
      seen.add(n);
      uniq.push(n);
    }
  }
  
  return uniq;
}

export default function AgentScheduler({ onComposeSchedule }: AgentSchedulerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: crypto.randomUUID(), role: "user", text: "일정 초대하고 싶어." },
    { id: crypto.randomUUID(), role: "agent", text: "누구를 초대하고 싶으신가요?" },
  ]);
  const [step, setStep] = useState<Step>("askParticipants");
  const [input, setInput] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [isComposing, setIsComposing] = useState(false); // 한글 조합 중인지 추적
  
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const canSend = useMemo(() => participants.length > 0 && title.trim().length > 0, [participants, title]);

  // 새로운 메시지가 추가될 때 자동으로 하단으로 스크롤
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  function push(role: Message["role"], text: string) {
    setMessages((m) => [...m, { id: crypto.randomUUID(), role, text }]);
  }

  function focusInput() {
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleChipClick(example: string, autoSubmit = true) {
    // "전송 버튼 누르기" 예제인 경우 실제 전송 함수 호출
    if (example === "전송 버튼 누르기" && step === "readyToSend") {
      sendSchedule();
      return;
    }
    
    setInput(example);
    if (autoSubmit) {
      handleSubmit(example);
    } else {
      focusInput();
    }
  }

  function handleSubmit(forceText?: string) {
    const text = (forceText ?? input).trim();
    if (!text) return;
    push("user", text);
    setInput("");

    if (step === "askParticipants") {
      const names = extractNames(text);
      if (names.length > 0) {
        const merged = Array.from(new Set([...participants, ...names]));
        setParticipants(merged);
      }
      push("agent", "모임이름은 무엇인가요?");
      setStep("askTitle");
    } else if (step === "askTitle") {
      const guess = text
        .replaceAll("모임이름은", "")
        .replaceAll("모임 이름은", "")
        .replaceAll("팀미팅", "팀미팅")
        .replaceAll("이에요", "")
        .replaceAll(":", "")
        .trim();
      const nextTitle = guess || text;
      setTitle(nextTitle);
      push("agent", "전송 버튼을 눌러 일정을 조율해주세요.");
      setStep("readyToSend");
    } else if (step === "askInvite") {
      // First intent message like "일정 초대하고 싶어"
      push("agent", "누구를 초대하고 싶으신가요?");
      setStep("askParticipants");
    }
  }

  function removeParticipant(name: string) {
    setParticipants((prev) => prev.filter((n) => n !== name));
  }

  function clearAll() {
    setParticipants([]);
    setTitle("");
    setMessages([
      { id: crypto.randomUUID(), role: "user", text: "일정 초대하고 싶어." },
      { id: crypto.randomUUID(), role: "agent", text: "누구를 초대하고 싶으신가요?" },
    ]);
    setStep("askParticipants");
    setInput("");
    focusInput();
  }

  function sendSchedule() {
    if (!canSend) return;
    const transcript = messages;
    onComposeSchedule?.({ title: title.trim(), participants, transcript });
    // Simple UX feedback
    push("agent", `좋아요. "${title.trim()}" 모임으로 초대장을 준비할게요.`);
  }

  const examplesByStep: Record<Step, string[]> = {
    idle: ["일정 초대하고 싶어."],
    askInvite: ["일정 초대하고 싶어."],
    askParticipants: [
      "황원준, 정유진, 한지은 초대해줘",
      "마케팅팀 초대",
      "김철수, 개발팀, 이영희 초대해줘",
      "디자인팀과 기획팀 초대",
    ],
    askTitle: ["팀미팅", "디자인 리뷰", "월간 리포트 공유"],
    readyToSend: ["전송 버튼 누르기"],
  };

  const placeholderByStep: Record<Step, string> = {
    idle: "일정 초대하고 싶어",
    askInvite: "일정 초대하고 싶어",
    askParticipants: "예) 황원준, 마케팅팀, 김철수 초대해줘",
    askTitle: "예) 팀미팅",
    readyToSend: "필요 시 메모를 남겨주세요",
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-4 p-4">
      {/* Chat Area */}
      <Card className="lg:col-span-3 shadow-lg flex flex-col h-[70vh]">
        <CardHeader className="flex flex-row items-center gap-2 border-b">
          <Bot className="h-5 w-5" />
          <CardTitle>일정 초대 Agent</CardTitle>
        </CardHeader>
        
        {/* 대화창 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Transcript - 대화 내용 */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "agent" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-600">🤖</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm shadow-sm max-w-[80%] ${
                      m.role === "agent" 
                        ? "bg-slate-100 text-slate-900 border" 
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-blue-600 text-white">U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 입력 영역 구분선 */}
          <div className="border-t bg-slate-50">
            {/* Context chips */}
            <div className="p-4 pb-2">
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <MousePointerClick className="h-3.5 w-3.5" />
                예제 명령을 클릭하면 자동으로 입력됩니다
              </div>
              <div className="flex flex-wrap gap-2">
                {examplesByStep[step].map((ex) => (
                  <Button key={ex} variant="secondary" size="sm" className="rounded-full"
                    onClick={() => handleChipClick(ex, true)}>
                    {ex}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 pt-2 flex items-end gap-2">
              {step === "readyToSend" ? (
                <Textarea
                  ref={inputRef as any}
                  placeholder={placeholderByStep[step]}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
              ) : (
                <Input
                  ref={inputRef as any}
                  placeholder={placeholderByStep[step]}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // 한글 조합 중이면 전송하지 않음
                      if (isComposing || e.nativeEvent.isComposing) {
                        return;
                      }
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  className="flex-1"
                />
              )}
              <Button onClick={() => handleSubmit()} className="gap-1 shrink-0" variant="default">
                <Send className="h-4 w-4" />
                보내기
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Composer Area */}
      <Card className="lg:col-span-2 shadow-lg h-[70vh] flex flex-col">
        <CardHeader>
          <CardTitle>초대 구성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 overflow-y-auto">
          <div>
            <div className="text-sm mb-2 font-medium">참석자</div>
            <div className="flex flex-wrap gap-2">
              {participants.length === 0 && (
                <div className="text-xs text-muted-foreground">아직 추가된 사람이 없어요</div>
              )}
              {participants.map((p) => (
                <Badge key={p} variant="secondary" className="px-2 py-1 rounded-full flex items-center gap-1">
                  {p}
                  <button aria-label={`${p} 제거`} onClick={() => removeParticipant(p)} className="ml-1">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <Input
                placeholder="이름을 쉼표로 구분해 입력 후 추가"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const names = extractNames((e.target as HTMLInputElement).value || "");
                    if (names.length > 0) {
                      setParticipants((prev) => Array.from(new Set([...prev, ...names])));
                    }
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  const el = document.querySelector<HTMLInputElement>("input[placeholder='이름을 쉼표로 구분해 입력 후 추가']");
                  const names = extractNames(el?.value || "");
                  if (names.length > 0) {
                    setParticipants((prev) => Array.from(new Set([...prev, ...names])));
                  }
                  if (el) el.value = "";
                }}
                className="gap-1"
              >
                <PlusCircle className="h-4 w-4" /> 추가
              </Button>
            </div>
          </div>

          <div>
            <div className="text-sm mb-2 font-medium">모임 이름</div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예) 팀미팅" />
          </div>

          <div className="flex gap-2">
            <Button onClick={sendSchedule} disabled={!canSend} className="gap-1">
              <Send className="h-4 w-4" /> 전송
            </Button>
            <Button variant="secondary" onClick={clearAll}>리셋</Button>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">시나리오 미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal ml-5 space-y-1 text-sm">
                <li>User: 일정 초대하고 싶어.</li>
                <li>Agent: 누구를 초대하고 싶으신가요?</li>
                <li>User: 황원준, 정유진, 한지은 초대해줘</li>
                <li>Agent: 모임이름은 무엇인가요?</li>
                <li>User: 팀미팅</li>
                <li>Agent: 전송 버튼을 눌러 일정을 조율해주세요.</li>
              </ol>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
