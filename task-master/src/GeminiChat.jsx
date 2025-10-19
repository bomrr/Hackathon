import React, { useState, useEffect, useRef } from 'react';
import ChatInput from './ChatInput'; // Assuming this component exists
import ChatMessage from './ChatMessage'; // Assuming this component exists

// --- Placeholder/Mock Task & Tool Types ---
// In a real application, these would be imported from your shared schema.
// These local types are based on your provided backend structure.
interface Task {
    id: string;
    title: string;
    description: string;
    startDate: string;
    dueDate: string;
    completed: boolean;
}

interface ToolCall {
    name: string;
    args: Record<string, any>;
}

interface GeminiResponse {
    text: string;
    toolCalls?: ToolCall[];
}

// --- Custom Hook for Task Management (Simulates Database) ---
const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([
        { id: 't-001', title: 'Finish Gemini Chat Integration', description: 'Implement function calling logic.', startDate: '2025-10-18', dueDate: '2025-10-20', completed: false },
        { id: 't-002', title: 'Prepare for Demo', description: '', startDate: '2025-10-21', dueDate: '2025-10-22', completed: false },
    ]);

    // Function to simulate tool execution and update task state
    const executeToolCall = (toolCall: ToolCall): { result: string; updatedTasks: Task[] } => {
        const { name, args } = toolCall;
        let resultMessage = '';
        let updatedTasks = [...tasks];

        switch (name) {
            case 'createTask':
                const newTask: Task = {
                    id: `t-${Date.now()}`,
                    title: args.title,
                    description: args.description || '',
                    startDate: args.startDate,
                    dueDate: args.dueDate,
                    completed: false,
                };
                updatedTasks.push(newTask);
                resultMessage = `Successfully created task: "${newTask.title}" with ID ${newTask.id}.`;
                break;

            case 'updateTask':
                updatedTasks = updatedTasks.map(t =>
                    t.id === args.taskId
                        ? {
                            ...t,
                            title: args.title ?? t.title,
                            description: args.description ?? t.description,
                            startDate: args.startDate ?? t.startDate,
                            dueDate: args.dueDate ?? t.dueDate,
                            completed: args.completed ?? t.completed,
                        }
                        : t
                );
                resultMessage = `Task ${args.taskId} updated successfully.`;
                break;

            case 'deleteTask':
                updatedTasks = updatedTasks.filter(t => t.id !== args.taskId);
                resultMessage = `Task ${args.taskId} deleted.`;
                break;

            case 'listTasks':
                resultMessage = updatedTasks.length > 0
                    ? `Tasks found: ${JSON.stringify(updatedTasks.map(t => ({ id: t.id, title: t.title, completed: t.completed })))}`
                    : 'No tasks are currently defined.';
                break;

            default:
                resultMessage = `Unknown tool call: ${name}`;
        }
        setTasks(updatedTasks);
        return { result: resultMessage, updatedTasks };
    };

    return { tasks, executeToolCall };
};
// --------------------------------------------------------


export default function GeminiChat() {
    const [messages, setMessages] = useState([
        { role: 'gemini', text: 'Hi! I am Gemini. Ask me anything about your tasks, like "create a task to study for the exam on 11/15".' }
    ]);
    const { tasks, executeToolCall } = useTasks();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const messagesEndRef = useRef(null);

    // Auto-scroll to the bottom of the chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function sendMessage(text) {
        if (!text.trim()) return;
        
        // 1. Add user message
        const newUserMessage = { role: 'user', text };
        setMessages(msgs => [...msgs, newUserMessage]);
        
        setLoading(true);
        setError(null);

        let currentMessages = [...messages, newUserMessage];
        let geminiResponse: GeminiResponse | null = null;
        let toolResponsePart = null;
        let actionRequired = true; // Start the loop

        try {
            while (actionRequired) {
                // 2. Prepare data for the backend (which runs chatWithGemini)
                const payload = {
                    userMessage: currentMessages[currentMessages.length - 1].text,
                    conversationHistory: currentMessages.map(m => ({
                        role: m.role.startsWith('gemini') ? 'model' : 'user',
                        parts: [{ text: m.text }]
                    })),
                    currentTasks: tasks,
                    toolResponse: toolResponsePart // Send tool result back if needed
                };

                // The fetch call now targets a hypothetical backend proxy
                const res = await fetch('/api/gemini-chat-tool', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                
                geminiResponse = await res.json() as GeminiResponse;

                // 3. Check for Tool Calls
                if (geminiResponse.toolCalls && geminiResponse.toolCalls.length > 0) {
                    const toolCall = geminiResponse.toolCalls[0];
                    
                    // Execute the tool locally (on the client/in the hook)
                    const { result, updatedTasks } = executeToolCall(toolCall);
                    
                    // 4. Update the client-side task state immediately (done by useTasks hook)
                    // The loop continues, sending this tool output back to Gemini in the next turn
                    
                    // 5. Prepare data for the next turn: the tool result
                    toolResponsePart = {
                        functionResponse: {
                            name: toolCall.name,
                            response: result
                        }
                    };

                    // Add a temporary message to the history for context and visualization
                    currentMessages.push(
                        { role: 'model', parts: [{ functionCall: toolCall }] },
                        { role: 'tool', parts: [{ functionResponse: toolResponsePart.functionResponse }] }
                    );
                    
                    setMessages(msgs => [...msgs, { role: 'gemini-tool', text: `(Tool Action: ${toolCall.name} executed. Result sent back to AI)`}]);

                    // Action is still required (sending tool response back)
                    actionRequired = true;
                } else {
                    // 6. Final text response received
                    actionRequired = false;
                }
            }

            // 7. Add the final Gemini text response
            const finalReply = geminiResponse?.text || 'Sorry, I could not get a final text response.';
            setMessages(msgs => {
                // Remove the temporary tool message and add the final reply
                const filtered = msgs.filter(m => m.role !== 'gemini-tool');
                return [...filtered, { role: 'gemini', text: finalReply }];
            });

        } catch (err) {
            console.error(err);
            setError('Error contacting or processing Gemini API response.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{display:'flex',flexDirection:'column',height:'100%',maxHeight:550,border:'1px solid #eee',borderRadius:8,padding:12,background:'#fafcff', width: 450, margin: '20px auto'}}>
            
            {/* Task Context Display */}
            <div style={{ padding: '4px', marginBottom: '8px', borderBottom: '1px solid #ddd', fontSize: '0.85em', color: '#555' }}>
                **Tasks:** {tasks.length} total, {tasks.filter(t => !t.completed).length} active
            </div>

            <div style={{flex:1,overflowY:'auto',marginBottom:8}}>
                {messages.map((msg, i) => (
                    // Hide the temporary tool message from the main chat flow
                    msg.role !== 'gemini-tool' && <ChatMessage key={i} message={msg} />
                ))}

                <div ref={messagesEndRef} />
                {loading && <div style={{color:'#888', padding: '8px 0'}}>Gemini is processing…</div>}
                {error && <div style={{color:'red', padding: '8px 0'}}>{error}</div>}
            </div>
            <ChatInput onSend={sendMessage} disabled={loading} />
        </div>
    );
}