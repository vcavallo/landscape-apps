import cn from 'classnames';
import React, { useRef } from 'react';
import { useLocation, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { VirtuosoHandle } from 'react-virtuoso';
import { useChannelFlag } from '@/hooks';
import { useChatState, useReplies, useWrit } from '@/state/chat';
import { useChannel, useRouteGroup } from '@/state/groups/groups';
import ChatInput from '@/chat/ChatInput/ChatInput';
import BranchIcon from '@/components/icons/BranchIcon';
import X16Icon from '@/components/icons/X16Icon';
import ChatScroller from '@/chat/ChatScroller/ChatScroller';
import { whomIsFlag } from '@/logic/utils';

export default function ChatThread() {
  const { name, chShip, ship, chName, idTime, idShip } = useParams<{
    name: string;
    chShip: string;
    ship: string;
    chName: string;
    idShip: string;
    idTime: string;
  }>();
  const scrollerRef = useRef<VirtuosoHandle>(null);
  const flag = useChannelFlag()!;
  const whom = flag || ship || '';
  const groupFlag = useRouteGroup();
  const { sendMessage } = useChatState.getState();
  const location = useLocation();
  const channel = useChannel(groupFlag, `chat/${flag}`)!;
  const id = `${idShip!}/${idTime!}`;
  const maybeWrit = useWrit(whom, id);
  const replies = useReplies(whom, id);

  if (!maybeWrit) {
    return null;
  }
  const [time, writ] = maybeWrit;
  const thread = replies.set(time, writ);

  const returnURL = () => {
    if (location.pathname.includes('groups')) {
      return `/groups/${ship}/${name}/channels/chat/${chShip}/${chName}?msg=${time.toString()}`;
    }
    return `/dm/${ship}?msg=${time.toString()}`;
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto border-gray-50 bg-white lg:w-96 lg:border-l-2">
      <header className={'header z-40'}>
        <div className="flex h-full w-full items-center justify-between border-b-2 border-gray-50 bg-white p-4">
          <div className="flex items-center space-x-3 font-semibold">
            <div className="rounded bg-gray-50 p-1">
              <BranchIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              Thread : {whomIsFlag(whom) ? channel?.meta.title || '' : ship}
            </div>
          </div>
          <Link
            to={returnURL()}
            aria-label="Close"
            className="icon-button h-8 w-8 bg-transparent"
          >
            <X16Icon className="h-6 w-6 text-gray-400" />
          </Link>
        </div>
      </header>
      <div className="flex flex-1 flex-col px-2 py-0">
        <ChatScroller
          key={idTime}
          messages={thread}
          whom={whom}
          scrollerRef={scrollerRef}
          replying
        />
      </div>
      <div className="sticky bottom-0 z-10 border-t-2 border-gray-50 bg-white p-4">
        <ChatInput whom={whom} replying={id} sendMessage={sendMessage} />
      </div>
    </div>
  );
}
