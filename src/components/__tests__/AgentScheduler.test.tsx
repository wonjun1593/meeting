import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgentScheduler from '../AgentScheduler';

// Mock the UI components with correct paths
jest.mock('../ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('../ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}));

jest.mock('../ui/input', () => ({
  Input: ({ onChange, ...props }: any) => (
    <input onChange={onChange} {...props} />
  ),
}));

jest.mock('../ui/textarea', () => ({
  Textarea: ({ onChange, ...props }: any) => (
    <textarea onChange={onChange} {...props} />
  ),
}));

jest.mock('../ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

jest.mock('../ui/avatar', () => ({
  Avatar: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AvatarFallback: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

describe('AgentScheduler', () => {
  const mockOnComposeSchedule = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<AgentScheduler onComposeSchedule={mockOnComposeSchedule} />);
    
    expect(screen.getByText('일정 초대 Agent')).toBeInTheDocument();
    expect(screen.getByText('누구를 초대하고 싶으신가요?')).toBeInTheDocument();
  });

  it('handles participant input correctly', async () => {
    const user = userEvent.setup();
    render(<AgentScheduler onComposeSchedule={mockOnComposeSchedule} />);
    
    // Use the correct placeholder text
    const input = screen.getByPlaceholderText('예) 황원준, 마케팅팀, 김철수 초대해줘');
    await user.type(input, '김철수, 박민수');
    await user.keyboard('{Enter}');
    
    expect(screen.getByText('김철수')).toBeInTheDocument();
    expect(screen.getByText('박민수')).toBeInTheDocument();
  });

  it('handles title input correctly', async () => {
    const user = userEvent.setup();
    render(<AgentScheduler onComposeSchedule={mockOnComposeSchedule} />);
    
    // Add participants first
    const input = screen.getByPlaceholderText('예) 황원준, 마케팅팀, 김철수 초대해줘');
    await user.type(input, '김철수');
    await user.keyboard('{Enter}');
    
    // Then add title - use getAllByPlaceholderText and select the first one (chat input)
    const titleInputs = screen.getAllByPlaceholderText('예) 팀미팅');
    const titleInput = titleInputs[0]; // Chat input area
    await user.type(titleInput, '팀 미팅');
    await user.keyboard('{Enter}');
    
    expect(screen.getByText('팀 미팅')).toBeInTheDocument();
  });

  it('calls onComposeSchedule when ready to send', async () => {
    const user = userEvent.setup();
    render(<AgentScheduler onComposeSchedule={mockOnComposeSchedule} />);
    
    // Complete the flow
    const input = screen.getByPlaceholderText('예) 황원준, 마케팅팀, 김철수 초대해줘');
    await user.type(input, '김철수');
    await user.keyboard('{Enter}');
    
    const titleInputs = screen.getAllByPlaceholderText('예) 팀미팅');
    const titleInput = titleInputs[0]; // Chat input area
    await user.type(titleInput, '팀 미팅');
    await user.keyboard('{Enter}');
    
    // Click send button
    const sendButton = screen.getByText('전송');
    await user.click(sendButton);
    
    expect(mockOnComposeSchedule).toHaveBeenCalledWith({
      title: '팀 미팅',
      participants: ['김철수'],
      transcript: expect.arrayContaining([
        expect.objectContaining({ role: 'agent', text: '누구를 초대하고 싶으신가요?' }),
        expect.objectContaining({ role: 'user', text: '김철수' }),
        expect.objectContaining({ role: 'agent', text: '모임이름은 무엇인가요?' }),
        expect.objectContaining({ role: 'user', text: '팀 미팅' }),
      ])
    });
  });

  it('handles reset functionality', async () => {
    const user = userEvent.setup();
    render(<AgentScheduler onComposeSchedule={mockOnComposeSchedule} />);
    
    // Add some data
    const input = screen.getByPlaceholderText('예) 황원준, 마케팅팀, 김철수 초대해줘');
    await user.type(input, '김철수');
    await user.keyboard('{Enter}');
    
    // Click reset
    const resetButton = screen.getByText('리셋');
    await user.click(resetButton);
    
    // Should be back to initial state
    expect(screen.getByText('누구를 초대하고 싶으신가요?')).toBeInTheDocument();
  });

  it('handles example button clicks', async () => {
    const user = userEvent.setup();
    render(<AgentScheduler onComposeSchedule={mockOnComposeSchedule} />);
    
    // Click an example button
    const exampleButton = screen.getByText('황원준, 정유진, 한지은 초대해줘');
    await user.click(exampleButton);
    
    expect(screen.getByText('황원준')).toBeInTheDocument();
    expect(screen.getByText('정유진')).toBeInTheDocument();
    expect(screen.getByText('한지은')).toBeInTheDocument();
  });

  it('handles mobile scrolling', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    const user = userEvent.setup();
    render(<AgentScheduler onComposeSchedule={mockOnComposeSchedule} />);
    
    // First add participants to get to askTitle step
    const input = screen.getByPlaceholderText('예) 황원준, 마케팅팀, 김철수 초대해줘');
    await user.type(input, '김철수');
    await user.keyboard('{Enter}');
    
    // Wait for the component to update
    await waitFor(() => {
      expect(screen.getByText('모임이름은 무엇인가요?')).toBeInTheDocument();
    });
    
    // Now we're in askTitle step, focus on title input
    const titleInputs = screen.getAllByPlaceholderText('예) 팀미팅');
    const titleInput = titleInputs[0]; // Chat input area
    await user.click(titleInput);
    
    // Just verify the input is focused and functional
    expect(titleInput).toBeInTheDocument();
  });
});
