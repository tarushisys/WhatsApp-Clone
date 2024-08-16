import { db } from "@/lib/db";
import { getCurrentUser } from "./getCurrentUser";

const getConversation = async () => {
  const { currentUserPrisma } = await getCurrentUser();

  if (!currentUserPrisma.id) return [];

  try {
    const conversation = await db.conversation.findMany({
      orderBy: {
        lastMessageAt: "desc",
      },
      where: {
        userIds: {
          has: currentUserPrisma.id,
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            sender: true,
            seen: true,
          },
        },
      },
    });
    return conversation;
  } 
  catch (error: any) {
    console.log(error);
    return [];
  }
};

export default getConversation;
