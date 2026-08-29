import { ConversationThreadView } from '@/components/messaging/ConversationThreadView';

export default async function ConversationPage(props: PageProps<'/messagerie/[conversationId]'>) {
  const { conversationId } = await props.params;
  return <ConversationThreadView conversationId={conversationId} />;
}
