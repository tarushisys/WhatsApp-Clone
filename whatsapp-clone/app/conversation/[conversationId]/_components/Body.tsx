import { useConversation } from "@/app/_hooks/useConversation";
import { FullMessageType } from "@/app/_types";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import MessageBox from "./MessageBox";
import { pusherClient } from "@/lib/pusher";
import { find } from "lodash";
import MediaRoom from "./MediaRoom";

interface BodyProps {
  initialMessages: FullMessageType[];
  isInCall: boolean;
}

const Body = ({ initialMessages, isInCall }: BodyProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<FullMessageType[]>(
    initialMessages || []
  );
  const { conversationId } = useConversation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [isInCall]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`).catch((err) => {
      console.error("Error marking conversation as seen:", err);
    });
  }, [conversationId]);

  useEffect(() => {
    pusherClient.subscribe(conversationId);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    const newMessageHandler = (message: FullMessageType): void => {
      axios.post(`/api/conversations/${conversationId}/seen`).catch((err) => {
        console.error("Error marking message as seen:", err);
      });

      setMessages((current) => {
        if (current.find((msg) => msg.id === message.id)) {
          return current;
        }
        return [...current, message];
      });
    };

    const updateMessageHandler = (
      receivedMessages: FullMessageType[]
    ): void => {
      setMessages((current) =>
        current.map((currentMessage) => {
          const matchingReceivedMessage = receivedMessages.find(
            (receivedMessage) => receivedMessage.id === currentMessage.id
          );

          return matchingReceivedMessage || currentMessage;
        })
      );
    };

    pusherClient.bind("messages:new", newMessageHandler);
    pusherClient.bind("message:update", updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind("messages:new", newMessageHandler);
      pusherClient.unbind("message:update", updateMessageHandler);
    };
  }, [conversationId]);

  return (
    <div className="flex-1 overflow-y-auto bg-pink-100">
      {isInCall && (
        <MediaRoom chatId={conversationId} video={true} audio={true} />
      )}

      {!isInCall && (
        <div className="pt-24">
          {messages.map((message, i) => (
            <MessageBox
              isLast={i === messages.length - 1}
              key={message.id}
              data={message}
            />
          ))}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default Body;
