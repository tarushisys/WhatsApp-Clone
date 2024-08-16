import { getCurrentUser } from "@/app/_actions/getCurrentUser";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { removePlusSign } from "@/lib/phoneNumberUtil";

export async function GET() {
  try {
    const { currentUserPrisma } = await getCurrentUser();

    if (!currentUserPrisma?.id) {
      return new NextResponse("Unauthorised", { status: 400 });
    }

    const conversation = await db.conversation.findMany({
      orderBy: {
        lastMessageAt: "desc",
      },
      where: {
        userIds: {
          has: currentUserPrisma.id,
        },
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { currentUserPrisma, currentUserClerk } = await getCurrentUser();

    const body = await request.json();
    const { userId, isGroup, members, name } = body;

    if (
      !currentUserPrisma.id ||
      !currentUserClerk?.phoneNumbers[0]?.phoneNumber
    ) {
      return new NextResponse("Unauthorised", { status: 400 });
    }

    // For Group Conversation
    if (isGroup) {
      const newConversation = await db.conversation.create({
        data: {
          name,
          isGroup,
          isChannel: false,
          ownerId: [currentUserPrisma.id],
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUserPrisma.id,
              },
            ],
          },
        },
        include: {
          users: true,
        },
      });

      //Update connections with new conversation
      newConversation.users.forEach((user) => {
        if (user.phoneNumber) {
          pusherServer.trigger(
            removePlusSign(user.phoneNumber),
            "conversation:new",
            newConversation
          );
        }
      });

      return NextResponse.json(newConversation);
    }

    //For existing conversation
    const existingConversation = await db.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUserPrisma.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUserPrisma.id],
            },
          },
        ],
      },
    });

    //For single conversation
    const singleConversation = existingConversation[0];
    if (singleConversation) {
      return NextResponse.json(singleConversation);
    }

    //For a new conversation
    const newConversation = await db.conversation.create({
      data: {
        ownerId: [currentUserPrisma.id],
        users: {
          connect: [
            {
              id: currentUserPrisma.id,
            },
            {
              id: userId,
            },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    newConversation.users.map((user) => {
      if (user.phoneNumber) {
        pusherServer.trigger(
          removePlusSign(user.phoneNumber),
          "conversation:new",
          newConversation
        );
      }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
