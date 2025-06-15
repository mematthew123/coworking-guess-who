/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import {
  EditorProvider,
  PortableTextBlock,
  PortableTextEditable,
  useEditor,
  useEditorSelector,
  RenderDecoratorFunction} from "@portabletext/editor";
import { EventListenerPlugin } from "@portabletext/editor/plugins";
import * as selectors from "@portabletext/editor/selectors";
import { defineSchema } from "@portabletext/editor";
import { 
  Bold, 
  Italic, 
  Send, 
  MessageSquare,
  X,
  Minimize2,
  Maximize2} from "lucide-react";

// Define the schema for game chat
const gameChatSchema = defineSchema({
  decorators: [
    { name: "strong" },
    { name: "em" }
  ],
  styles: [
    { name: "normal", title: "Normal" }
  ],
  annotations: [],
  lists: [],
  inlineObjects: [],
  blockObjects: []
});

// Simplified Chat Message Type
type ChatMessage = {
  id: string;
  userId: string;
  userName: string;
  content: PortableTextBlock[];
  timestamp: string;
  gameEvent?: {
    type: 'question' | 'answer' | 'guess' | 'elimination';
    details: string;
  };
};

// Chat Toolbar Component
const ChatToolbar: React.FC<{ onSend: () => void; canSend: boolean }> = ({ onSend, canSend }) => {
  const editor = useEditor();
  const isBold = useEditorSelector(editor, selectors.isActiveDecorator("strong"));
  const isItalic = useEditorSelector(editor, selectors.isActiveDecorator("em"));

  const toggleDecorator = (decorator: string) => {
    editor.send({ type: "decorator.toggle", decorator });
    editor.send({ type: "focus" });
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200">
      <div className="flex gap-1">
        <button
          onClick={() => toggleDecorator("strong")}
          className={`p-1.5 rounded transition-colors ${
            isBold ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() => toggleDecorator("em")}
          className={`p-1.5 rounded transition-colors ${
            isItalic ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Italic"
        >
          <Italic size={14} />
        </button>
      </div>
      <button
        onClick={onSend}
        disabled={!canSend}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all ${
          canSend
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Send size={14} />
        Send
      </button>
    </div>
  );
};

// Custom render functions
const renderDecorator: RenderDecoratorFunction = (props) => {
  switch (props.value) {
    case "strong":
      return <strong className="font-semibold">{props.children}</strong>;
    case "em":
      return <em className="italic">{props.children}</em>;
    default:
      return <>{props.children}</>;
  }
};

// Message Component
const ChatMessage: React.FC<{ message: ChatMessage; isCurrentUser: boolean }> = ({ message, isCurrentUser }) => {
  return (
    <div className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
        isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
      }`}>
        {message.userName[0].toUpperCase()}
      </div>
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-medium text-gray-700">{message.userName}</span>
          <span className="text-xs text-gray-500">{message.timestamp}</span>
        </div>
        
        {message.gameEvent && (
          <div className={`text-xs px-2 py-1 rounded mb-1 ${
            message.gameEvent.type === 'question' ? 'bg-purple-100 text-purple-700' :
            message.gameEvent.type === 'answer' ? 'bg-green-100 text-green-700' :
            message.gameEvent.type === 'guess' ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }`}>
            {message.gameEvent.details}
          </div>
        )}
        
        <div className={`px-3 py-2 rounded-lg ${
          isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
        }`}>
          <EditorProvider
            initialConfig={{
              schemaDefinition: gameChatSchema,
              initialValue: message.content,
              readOnly: true
            }}
          >
            <PortableTextEditable
              renderDecorator={renderDecorator}
              readOnly
              className="text-sm"
            />
          </EditorProvider>
        </div>
      </div>
    </div>
  );
};

// Main Game Chat Component
interface GameChatProps {
  gameId: string;
  currentUserId: string;
  currentUserName: string;
  opponentName: string;
  isMyTurn: boolean;
  onSendMessage?: (message: ChatMessage) => void;
}

const GameChat: React.FC<GameChatProps> = ({ 
  currentUserId, 
  currentUserName,
  opponentName,
  isMyTurn,
  onSendMessage 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      userName: 'Game',
      content: [{
        _type: "block",
        _key: "welcome",
        children: [{ _type: "span", _key: "s1", text: `Game started! ${currentUserName} vs ${opponentName}` }]
      }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState<PortableTextBlock[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (
      currentMessage.length > 0 &&
      currentMessage.some(
        block =>
          Array.isArray(block.children) &&
          block.children[0]?.text
      )
    ) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: currentUserId,
        userName: currentUserName,
        content: currentMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([...messages, newMessage]);
      setCurrentMessage([]);
      
      // Call the callback if provided
      if (onSendMessage) {
        onSendMessage(newMessage);
      }
      
      scrollToBottom();
    }
  };

  const canSend = currentMessage.length > 0 && 
    currentMessage.some(block => 
      Array.isArray(block.children) && 
      block.children[0]?.text?.trim()
    );

  // Add game event messages
  const addGameEvent = (type: 'question' | 'answer' | 'guess' | 'elimination', details: string) => {
    const eventMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'Game',
      content: [{
        _type: "block",
        _key: Date.now().toString(),
        children: [{ _type: "span", _key: "s1", text: details }]
      }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gameEvent: { type, details }
    };
    
    setMessages(prev => [...prev, eventMessage]);
    if (!isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Expose game event method
  useEffect(() => {
    (window as any).gameChatAddEvent = addGameEvent;
    return () => {
      delete (window as any).gameChatAddEvent;
    };
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <MessageSquare size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl transition-all ${
      isMinimized ? 'w-64 h-12' : 'w-96 h-[500px]'
    } flex flex-col`}>
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} />
          <span className="font-medium">Game Chat</span>
          {isMyTurn && <span className="text-xs bg-blue-500 px-2 py-0.5 rounded">Your turn</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                isCurrentUser={msg.userId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Editor Area */}
          <div className="border-t border-gray-200 bg-white">
            <EditorProvider
              initialConfig={{
                schemaDefinition: gameChatSchema,
                initialValue: currentMessage
              }}
            >
              <EventListenerPlugin
                on={(event) => {
                  if (event.type === "mutation" && event.value) {
                    setCurrentMessage(event.value);
                  }
                }}
              />
              <div>
                <PortableTextEditable
                  className="px-3 py-2 min-h-[60px] max-h-[120px] overflow-y-auto focus:outline-none text-sm"
                  placeholder="Type a message..."
                  renderDecorator={renderDecorator}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <ChatToolbar onSend={handleSend} canSend={canSend} />
              </div>
            </EditorProvider>
          </div>
        </>
      )}
    </div>
  );
};

export default GameChat;