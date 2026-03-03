import { useOutletContext } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Stories } from '../components/Stories';
import { Feed } from '../components/Feed';

interface OutletContext {
  openChat: (id: string | number) => void;
  isChatOpen: boolean;
  activeChatId: string | number | null;
}

export const HomePage = () => {
  const { openChat, activeChatId } = useOutletContext<OutletContext>();
  const navigate = useNavigate();

  return (
    <>
      <Stories onClickStory={(id) => navigate(`/live/${id}`)} />
      <Feed
        onOpenChat={(id) => openChat(id)}
        isChatActive={activeChatId !== null}
        onClickCard={(username) => navigate(`/profile/${username}`)}
      />
    </>
  );
};
