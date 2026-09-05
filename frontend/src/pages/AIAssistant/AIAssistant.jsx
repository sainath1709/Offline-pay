import { useState, useRef, useEffect } from "react";
import API from "../../services/api";
import { FaRobot, FaUser, FaPaperPlane, FaMagic, FaCheck, FaTimes } from "react-icons/fa";

const AIAssistant = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("ai_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
    return [
      {
        id: 1,
        sender: "ai",
        type: "TEXT",
        content: "Hello! I am your Agentic AI Assistant. I can help you create offline vouchers securely, analyze your spending, and explain risk flags. How can I assist you today?"
      }
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const suggestedPrompts = [
    "Create a ₹500 offline voucher",
    "Analyze my offline spending",
    "Why was my payment flagged?"
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    // Persist to local storage whenever messages change
    localStorage.setItem("ai_chat_history", JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      type: "TEXT",
      content: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/ai/chat", { message: text });
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        type: res.data.type,
        content: res.data.message,
        proposal: res.data.proposal
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "ai",
        type: "TEXT",
        content: "I'm sorry, my systems are currently unreachable. Please try again later."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (proposal, messageId) => {
    if (proposal.action === "CREATE_VOUCHER") {
      try {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, loadingAction: true } : msg
        ));

        // Deterministic Execution bypassing AI
        const res = await API.post("/voucher", { amount: proposal.amount });
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { 
            ...msg, 
            loadingAction: false, 
            actionCompleted: true, 
            actionResult: `Success! Voucher created with ID: ${res.data.voucher.voucherId}`
          } : msg
        ));

      } catch (err) {
        console.error(err);
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { 
            ...msg, 
            loadingAction: false, 
            actionCompleted: true, 
            actionResult: `Failed: ${err.response?.data?.error || err.message}`
          } : msg
        ));
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col text-white max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-600/20 rounded-xl text-violet-400">
            <FaMagic className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Agentic AI Assistant</h1>
            <p className="text-gray-400 mt-1">Smart intent parsing & deterministic execution</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            localStorage.removeItem("ai_chat_history");
            setMessages([{
              id: 1,
              sender: "ai",
              type: "TEXT",
              content: "Hello! I am your Agentic AI Assistant. I can help you create offline vouchers securely, analyze your spending, and explain risk flags. How can I assist you today?"
            }]);
          }}
          className="text-gray-400 hover:text-white bg-[#161B33] px-4 py-2 rounded-xl text-sm border border-gray-700/50 transition"
        >
          Clear Chat
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-[#161B33] rounded-3xl border border-gray-700/50 shadow-xl flex flex-col overflow-hidden">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-4 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === "user" ? "bg-blue-600" : "bg-violet-600"
                }`}>
                  {msg.sender === "user" ? <FaUser /> : <FaRobot />}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  
                  {msg.type === "TEXT" && (
                    <div className={`p-4 rounded-2xl ${
                      msg.sender === "user" 
                        ? "bg-blue-600 text-white rounded-tr-sm" 
                        : "bg-[#242B45] text-gray-200 rounded-tl-sm border border-gray-700/50"
                    }`}>
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                  )}

                  {msg.type === "PROPOSAL" && msg.proposal && (
                    <div className="bg-[#242B45] border-2 border-violet-500/30 rounded-2xl p-5 rounded-tl-sm w-full min-w-[350px]">
                      <div className="flex items-center gap-2 text-violet-400 font-bold mb-3 uppercase tracking-wider text-sm">
                        <FaMagic /> Action Proposal
                      </div>
                      
                      <p className="text-gray-200 mb-4">{msg.content}</p>
                      
                      <div className="bg-[#090B1A] rounded-xl p-4 space-y-3 mb-5 border border-gray-800">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Action</span>
                          <span className="font-mono font-bold text-blue-400">{msg.proposal.action}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount</span>
                          <span className="font-bold text-white">₹{msg.proposal.amount}</span>
                        </div>
                        <hr className="border-gray-800" />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Current Balance</span>
                          <span className="text-gray-400">₹{msg.proposal.onlineBalance}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Resulting Balance</span>
                          <span className="text-yellow-400">₹{msg.proposal.resultingBalance}</span>
                        </div>
                      </div>

                      {msg.actionCompleted ? (
                        <div className={`p-3 rounded-xl font-medium flex items-center gap-2 ${
                          msg.actionResult.includes("Success") ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}>
                          {msg.actionResult.includes("Success") ? <FaCheck /> : <FaTimes />}
                          {msg.actionResult}
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleConfirmAction(msg.proposal, msg.id)}
                            disabled={msg.loadingAction}
                            className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
                          >
                            {msg.loadingAction ? "Executing..." : "Confirm & Execute"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <span className="text-xs text-gray-500 mt-2 mx-1">
                    {new Date(msg.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4 max-w-[80%] flex-row">
                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                  <FaRobot />
                </div>
                <div className="p-4 rounded-2xl bg-[#242B45] text-gray-200 rounded-tl-sm border border-gray-700/50 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#0D1126] border-t border-gray-700/50">
          
          {/* Suggested Prompts */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
            {suggestedPrompts.map((prompt, i) => (
              <button 
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap bg-[#242B45] hover:bg-[#2d3656] text-gray-300 px-4 py-2 rounded-full text-sm transition border border-gray-700/50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex gap-3 relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI to create a voucher or analyze spending..."
              className="flex-1 bg-[#1A203C] border border-gray-700 text-white rounded-2xl px-6 py-4 outline-none focus:border-violet-500 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 bottom-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 text-white w-12 rounded-xl flex items-center justify-center transition"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AIAssistant;
