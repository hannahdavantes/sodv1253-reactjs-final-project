import { useEffect, useRef, useState } from "react";
import { Client as ConversationsClient } from "@twilio/conversations";
import styled from "styled-components";
import { apiFetch } from "../utils/api";
import Button from "../components/Button";

const Wrapper = styled.main`
  min-height: calc(100vh - 7rem);
  display: grid;
  place-items: center;
  background-color: var(--off-white);
  padding: 4rem 2rem;

  .chat-box {
    width: 100%;
    max-width: 70rem;
    background-color: var(--white);
    border-radius: 1rem;
    box-shadow: 0 0.8rem 2rem rgba(0, 0, 0, 0.08);
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow: hidden;
  }

  .chat-header {
    padding: 2rem 3rem;
    background-color: var(--primary-color-dark);
    border-bottom: 1px solid var(--primary-color-light);

    h1 {
      font-size: 2.2rem;
      color: var(--off-white);
    }

    p {
      font-size: 1.2rem;
      color: var(--gray-4);
      margin-top: 0.2rem;
    }
  }

  .message-list {
    height: 45rem;
    overflow-y: auto;
    padding: 2rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    background-color: var(--off-white);

    &::-webkit-scrollbar {
      width: 0.5rem;
    }

    &::-webkit-scrollbar-track {
      background: var(--gray-2);
    }

    &::-webkit-scrollbar-thumb {
      background: var(--gray-4);
      border-radius: 1rem;
    }
  }

  .message {
    display: flex;
    flex-direction: column;

    &.own {
      align-items: flex-end;
    }

    &.other {
      align-items: flex-start;
    }

    .author {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--gray-6);
      margin-bottom: 0.3rem;
    }

    .bubble {
      max-width: 60%;
      padding: 1rem 1.4rem;
      font-size: 1.4rem;
      box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.06);
      word-break: break-word;
      color: var(--primary-color-dark);
    }

    &.own .bubble {
      background-color: var(--tertiary-color);
      border-radius: 1rem 1rem 0 1rem;
      border: none;
    }

    &.other .bubble {
      background-color: var(--white);
      border-radius: 1rem 1rem 1rem 0;
      border: 1px solid var(--gray-3);
    }
  }

  .status-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.2rem;
    height: 45rem;
    background-color: var(--off-white);

    p {
      font-size: 1.5rem;
      color: var(--gray-6);
      text-align: center;
      max-width: 40rem;

      &.error {
        color: var(--secondary-color);
      }
    }

    .spinner {
      width: 3.2rem;
      height: 3.2rem;
      border: 3px solid var(--gray-3);
      border-top-color: var(--tertiary-color);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  }

  .chat-form {
    display: flex;
    gap: 1.2rem;
    padding: 2rem 3rem;
    background-color: var(--white);
    border-top: 1px solid var(--gray-2);

    input {
      flex: 1;
      padding: 1.2rem 1.4rem;
      border: 0.1rem solid var(--gray-4);
      border-radius: 0.8rem;
      font-size: 1.4rem;
      background-color: var(--off-white);
      color: var(--primary-color-dark);
      font-family: var(--font-body);
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: var(--tertiary-color);
        box-shadow: 0 0 0 0.2rem rgba(238, 162, 52, 0.2);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: var(--gray-2);
      }
    }
  }
`;

const ChatPage = () => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [identity, setIdentity] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let client;

    const initChat = async () => {
      try {
        const data = await apiFetch("/api/chat/token");

        client = new ConversationsClient(data.token);
        setIdentity(data.identity);

        const convo = await client.getConversationByUniqueName(
          data.conversationUniqueName,
        );

        if (convo.status !== "joined") {
          await convo.join();
        }

        const msgs = await convo.getMessages();
        setMessages(msgs.items);

        convo.on("messageAdded", (msg) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.sid === msg.sid);
            if (exists) return prev;
            return [...prev, msg];
          });
        });

        setConversation(convo);
      } catch (err) {
        console.error("Chat error:", err);
        setError(
          err?.message || "Failed to connect to chat. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (client) client.shutdown();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() || !conversation || error) return;

    try {
      setIsSending(true);
      await conversation.sendMessage(text);
      setText("");
    } catch (err) {
      console.error("Send message error:", err);
      setError("Failed to send message. Please refresh and try again.");
    } finally {
      setIsSending(false);
    }
  };

  const formatAuthor = (author) => {
    const parts = author.split("-");
    if (parts.length >= 4) {
      const firstName = parts[2];
      const lastName = parts[3];
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }
    }
    return "Unknown User";
  };

  const isDisabled = !!error || isSending;

  const renderMessageList = () => {
    if (loading) {
      return (
        <div className="status-box">
          <div className="spinner" />
          <p>Connecting to chat...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="status-box">
          <p className="error">⚠️ {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="status-box">
          <p>No messages yet. Be the first to say something!</p>
        </div>
      );
    }

    return (
      <div className="message-list">
        {messages.map((msg) => {
          const isOwn = msg.author === identity;
          return (
            <div key={msg.sid} className={`message ${isOwn ? "own" : "other"}`}>
              <span className="author">
                {isOwn ? "You" : formatAuthor(msg.author)}
              </span>
              <div className="bubble">{msg.body}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    );
  };

  return (
    <Wrapper>
      <div className="chat-box">
        <div className="chat-header">
          <h1>Global Stock Chat</h1>
          <p>Discuss stocks with other users</p>
        </div>

        {renderMessageList()}

        <form className="chat-form" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder={error ? "Chat unavailable" : "Type a message..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isDisabled}
          />
          <Button type="submit" isLoading={isSending} disabled={isDisabled}>
            Send
          </Button>
        </form>
      </div>
    </Wrapper>
  );
};

export default ChatPage;
