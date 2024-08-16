import { getCurrentUser } from "@/app/_actions/getCurrentUser";
import DesktopSidebarHeader from "./DesktopSidebarHeader";
import getConversation from "@/app/_actions/getConversation";
import ConversationList from "@/app/conversation/_components/ConversationList";

async function Sidebar({ children }: { children: React.ReactNode }) {
  const { currentUserPrisma } = await getCurrentUser();
  const conversation = await getConversation();
  return (
    <div className="h-full w-screen flex">
      <aside className="h-full min-w-[300px]">
        <DesktopSidebarHeader currentUser={currentUserPrisma} />
        <ConversationList conversation={conversation} />
      </aside>
      <main className="w-full flex justify-center">{children}</main>
    </div>
  );
}

export default Sidebar;
