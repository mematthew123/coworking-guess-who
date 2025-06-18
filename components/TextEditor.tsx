import React, { useState, useEffect, useRef } from 'react';
import {
  EditorProvider,
  PortableTextBlock,
  PortableTextEditable,
  useEditor,
  useEditorSelector,
  RenderDecoratorFunction,
  RenderAnnotationFunction,
  RenderBlockFunction
} from "@portabletext/editor";
import { EventListenerPlugin } from "@portabletext/editor/plugins";
import * as selectors from "@portabletext/editor/selectors";
import { defineSchema } from "@portabletext/editor";
import { 
  Bold, 
  Italic, 
  Code, 
  Smile, 
  Send, 
  AtSign,
  Hash,
  Gamepad2,
  Sparkles,
  Dice1,
  Trophy,
  Shield,
  Swords
} from "lucide-react";

// Define the schema for game chat
const gameChatSchema = defineSchema({
  decorators: [
    { name: "strong" },
    { name: "em" },
    { name: "code" },
    { name: "highlight" },
    { name: "spoiler" }
  ],
  styles: [
    { name: "normal", title: "Normal" },
    { name: "system", title: "System Message" }
  ],
  annotations: [
    { name: "link", title: "Link" },
    { name: "mention", title: "Player Mention" },
    { name: "channel", title: "Channel Link" },
    { name: "item", title: "Game Item" }
  ],
  lists: [],
  inlineObjects: [
    { name: "emoji", title: "Emoji" },
    { name: "dice", title: "Dice Roll" },
    { name: "achievement", title: "Achievement" }
  ],
  blockObjects: [
    { name: "embed", title: "Game Embed" }
  ]
});

// Icon Button Component
type IconButtonProps = {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  variant?: "default" | "accent";
};

const IconButton: React.FC<IconButtonProps> = ({ icon: Icon, label, onClick, active = false, disabled = false, variant = "default" }) => {
  const baseClasses = "p-2 rounded transition-all";
  const variants = {
    default: active 
      ? 'bg-purple-600 text-white' 
      : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
    accent: active
      ? 'bg-orange-600 text-white'
      : 'bg-gray-700 text-orange-400 hover:bg-gray-600'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={label}
    >
      <Icon size={16} />
    </button>
  );
};

// Chat Toolbar Component
type ChatToolbarProps = {
  onSend: () => void;
  canSend: boolean;
};

const ChatToolbar: React.FC<ChatToolbarProps> = ({ onSend, canSend }) => {
  const editor = useEditor();
  const [showEmojis, setShowEmojis] = useState(false);
  
  const isBold = useEditorSelector(editor, selectors.isActiveDecorator("strong"));
  const isItalic = useEditorSelector(editor, selectors.isActiveDecorator("em"));
  const isCode = useEditorSelector(editor, selectors.isActiveDecorator("code"));
  const isHighlight = useEditorSelector(editor, selectors.isActiveDecorator("highlight"));
  const isSpoiler = useEditorSelector(editor, selectors.isActiveDecorator("spoiler"));

  const toggleDecorator = (decorator: string) => {
    editor.send({ type: "decorator.toggle", decorator });
    editor.send({ type: "focus" });
  };

  const insertMention = () => {
    const text = window.prompt("Enter player name:");
    if (text) {
      editor.send({
        type: "annotation.add",
        annotation: {
          name: "mention",
          value: { userId: text.toLowerCase(), username: text }
        }
      });
    }
    editor.send({ type: "focus" });
  };

  const insertEmoji = (emoji: string) => {
    editor.send({
      type: "insert.inline object",
      inlineObject: {
        name: "emoji",
        value: { emoji }
      }
    });
    setShowEmojis(false);
    editor.send({ type: "focus" });
  };

  const insertDiceRoll = () => {
    const sides = window.prompt("Roll dice (e.g., '2d6' for 2 six-sided dice):", "1d20");
    if (sides) {
      editor.send({
        type: "insert.inline object",
        inlineObject: {
          name: "dice",
          value: { 
            roll: sides,
            result: Math.floor(Math.random() * 20) + 1 // Simplified for demo
          }
        }
      });
    }
    editor.send({ type: "focus" });
  };

  const insertGameItem = () => {
    editor.send({
      type: "annotation.add",
      annotation: {
        name: "item",
        value: { 
          itemId: "sword_001",
          itemName: "Legendary Sword",
          rarity: "legendary"
        }
      }
    });
    editor.send({ type: "focus" });
  };

  const gameEmojis = ['⚔️', '🛡️', '🏹', '🎯', '💎', '🔮', '⚡', '🔥', '❄️', '🌟', '💀', '🐉'];

  return (
    <div className="flex items-center justify-between p-2 bg-gray-800 border-t border-gray-700">
      <div className="flex gap-1 items-center">
        <IconButton
          icon={Bold}
          label="Bold (Ctrl+B)"
          onClick={() => toggleDecorator("strong")}
          active={isBold}
        />
        <IconButton
          icon={Italic}
          label="Italic (Ctrl+I)"
          onClick={() => toggleDecorator("em")}
          active={isItalic}
        />
        <IconButton
          icon={Code}
          label="Code"
          onClick={() => toggleDecorator("code")}
          active={isCode}
        />
        <IconButton
          icon={Sparkles}
          label="Highlight"
          onClick={() => toggleDecorator("highlight")}
          active={isHighlight}
        />
        <IconButton
          icon={Shield}
          label="Spoiler"
          onClick={() => toggleDecorator("spoiler")}
          active={isSpoiler}
          variant="accent"
        />
        <div className="w-px h-6 bg-gray-600 mx-1" />
        <IconButton
          icon={AtSign}
          label="Mention Player"
          onClick={insertMention}
        />
        <div className="relative">
          <IconButton
            icon={Smile}
            label="Emoji"
            onClick={() => setShowEmojis(!showEmojis)}
            active={showEmojis}
          />
          {showEmojis && (
            <div className="absolute bottom-full left-0 mb-1 p-2 bg-gray-700 rounded shadow-lg grid grid-cols-6 gap-1">
              {gameEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => insertEmoji(emoji)}
                  className="p-1 hover:bg-gray-600 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <IconButton
          icon={Dice1}
          label="Roll Dice"
          onClick={insertDiceRoll}
          variant="accent"
        />
        <IconButton
          icon={Swords}
          label="Link Item"
          onClick={insertGameItem}
        />
      </div>
      <button
        onClick={onSend}
        disabled={!canSend}
        className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all ${
          canSend
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Send size={16} />
        Send
      </button>
    </div>
  );
};

// Custom render functions
const renderDecorator: RenderDecoratorFunction = (props) => {
  switch (props.value) {
    case "strong":
      return <strong className="font-bold">{props.children}</strong>;
    case "em":
      return <em className="italic">{props.children}</em>;
    case "code":
      return <code className="px-1 py-0.5 bg-gray-700 text-purple-300 rounded text-sm font-mono">{props.children}</code>;
    case "highlight":
      return <span className="bg-yellow-400 bg-opacity-30 px-1 rounded">{props.children}</span>;
    case "spoiler":
      return (
        <span className="bg-gray-800 text-gray-800 hover:text-gray-200 transition-colors cursor-help px-1 rounded">
          {props.children}
        </span>
      );
    default:
      return <>{props.children}</>;
  }
};

const renderAnnotation: RenderAnnotationFunction = (props) => {
  switch (props.schemaType.name) {
    case "link":
      return (
        <a href={typeof props.value?.url === "string" ? props.value.url : undefined} className="text-blue-400 underline hover:text-blue-300">
          {props.children}
        </a>
      );
    case "mention":
      return (
        <span className="text-purple-400 font-medium cursor-pointer hover:text-purple-300">
          {props.value?.username ? `@${props.value.username}` : props.children}
        </span>
      );
    case "channel":
      return (
        <span className="text-green-400 font-medium cursor-pointer hover:text-green-300">
          #{typeof props.value?.channel === "string"
            ? props.value.channel
            : (typeof props.children === "string" ? props.children : "")}
        </span>
      );
    case "item":
      const rarityColors: Record<string, string> = {
        common: "text-gray-400 border-gray-600",
        uncommon: "text-green-400 border-green-600",
        rare: "text-blue-400 border-blue-600",
        epic: "text-purple-400 border-purple-600",
        legendary: "text-orange-400 border-orange-600"
      };
      const rarity: string = typeof props.value?.rarity === "string" ? props.value.rarity : "common";
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded cursor-pointer hover:bg-gray-800 ${rarityColors[rarity]}`}>
          <Gamepad2 size={14} />
          <span className="font-medium">{typeof props.value?.itemName === "string" ? props.value.itemName : ""}</span>
        </span>
      );
    default:
      return <>{props.children}</>;
  }
};

const renderBlock: RenderBlockFunction = (props) => {
  // Handle inline objects
  if (props.schemaType.name === "emoji") {
    const emojiValue = props.value as { emoji?: string };
    return <span className="inline-block mx-0.5 text-xl">{emojiValue?.emoji || "😀"}</span>;
  }
  
  if (props.schemaType.name === "dice") {
    const diceValue = props.value as { roll?: string; result?: number };
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-900 bg-opacity-50 text-purple-300 rounded">
        <Dice1 size={14} />
        <span className="font-mono">{diceValue?.roll}: {diceValue?.result}</span>
      </span>
    );
  }
  
  if (props.schemaType.name === "achievement") {
    const achievementValue = props.value as { name?: string };
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-900 bg-opacity-50 text-yellow-300 rounded">
        <Trophy size={14} />
        <span className="font-medium">{achievementValue?.name || "Achievement Unlocked!"}</span>
      </span>
    );
  }

  // Handle block objects
  if (props.schemaType.name === "embed") {
    return (
      <div className="my-2 p-3 bg-gray-800 rounded border border-gray-700">
        <div className="text-sm text-gray-400">Game Embed</div>
        <div className="text-purple-300">{typeof props.value === "object" && props.value && "title" in props.value ? (props.value as { title?: string }).title : "Embedded Content"}</div>
      </div>
    );
  }

  // Handle styles
  if (props.style === "system") {
    return (
      <div className="text-center text-gray-500 text-sm italic my-2">
        {props.children}
      </div>
    );
  }

  // Default paragraph
  return <div className="leading-7">{props.children}</div>;
};

// Message Component
type ChatMessageProps = {
  message: {
    id: number;
    user: string;
    content: PortableTextBlock[];
    timestamp: string;
  };
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className="flex gap-3 hover:bg-gray-800 hover:bg-opacity-50 p-2 rounded transition-colors">
      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
        {message.user[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-bold text-purple-400">{message.user}</span>
          <span className="text-xs text-gray-500">{message.timestamp}</span>
        </div>
        <div className="text-gray-200 break-words">
          <EditorProvider
            initialConfig={{
              schemaDefinition: gameChatSchema,
              initialValue: message.content,
              readOnly: true
            }}
          >
            <PortableTextEditable
              renderDecorator={renderDecorator}
              renderAnnotation={renderAnnotation}
              renderBlock={renderBlock}
              readOnly
            />
          </EditorProvider>
        </div>
      </div>
    </div>
  );
};

// Main Chat Editor Component
const GameChatEditor = () => {
  const [editorKey, setEditorKey] = useState(0);
  const [messages, setMessages] = useState<Array<{
    id: number;
    user: string;
    content: PortableTextBlock[];
    timestamp: string;
  }>>([
    {
      id: 1,
      user: "System",
      content: [{
        _type: "block",
        _key: "system-welcome",
        style: "system",
        children: [{ _type: "span", _key: "welcome-span", text: "Welcome to the game chat!" }]
      }],
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState<PortableTextBlock[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (
      currentMessage.length > 0 &&
      currentMessage.some(
        block =>
          Array.isArray(block.children) &&
          (block.children[0] as { text?: string })?.text
      )
    ) {
      const newMessage = {
        id: Date.now(),
        user: "Player1",
        content: currentMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([...messages, newMessage]);
      setCurrentMessage([]);
      setEditorKey(editorKey + 1); // Reset editor
    }
  };

  const canSend =
    currentMessage.length > 0 &&
    currentMessage.some(
      (block) =>
        Array.isArray(block.children) &&
        typeof block.children[0]?.text === "string" &&
        block.children[0].text.trim().length > 0
    );

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Hash size={20} className="text-gray-500" />
          <h1 className="font-bold text-lg">general</h1>
          <span className="text-sm text-gray-500">- Main game chat</span>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Editor Area */}
      <div className="border-t border-gray-700">
        <EditorProvider
          key={editorKey}
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
          <div className="bg-gray-800">
            <PortableTextEditable
              className="p-4 min-h-[80px] max-h-[200px] overflow-y-auto focus:outline-none placeholder-gray-500"
              placeholder="Type a message..."
              renderDecorator={renderDecorator}
              renderAnnotation={renderAnnotation}
              renderBlock={renderBlock}
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
    </div>
  );
};

export default GameChatEditor;