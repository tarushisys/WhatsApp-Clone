import { getCurrentUser } from "../_actions/getCurrentUser";
import EmptyState from "../_components/EmptyState";

const Conversation = async () => {
  const { currentUserPrisma } = await getCurrentUser();
  return (
    <div className="h-screen bg-gray-200">
      <EmptyState currentUser={currentUserPrisma} />
    </div>
  );
};

export default Conversation;
