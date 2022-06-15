import React from 'react';
import cn from 'classnames';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import NewMessageIcon from '../components/icons/NewMessageIcon';
import { useIsMobile } from '../logic/useMedia';
import SidebarLink from '../components/Sidebar/SidebarLink';
import MagnifyingGlass from '../components/icons/MagnifyingGlass16Icon';
import CaretDown16Icon from '../components/icons/CaretDown16Icon';
import ChatSmallIcon from '../components/icons/ChatSmallIcon';
import PersonSmallIcon from '../components/icons/PersonSmallIcon';
import CmdSmallIcon from '../components/icons/CmdSmallIcon';
import MobileMessagesSidebar from './MobileMessagesSidebar';
import MessagesList from './MessagesList';
import useMessagesFilter, { filters } from './useMessagesFilter';

export default function MessagesSidebar() {
  const isMobile = useIsMobile();
  const { filter, setFilter } = useMessagesFilter();

  if (isMobile) {
    return <MobileMessagesSidebar />;
  }

  return (
    <nav className="flex h-full w-64 flex-col border-r-2 border-gray-50 bg-white">
      <ul className="flex w-64 flex-col p-2">
        <SidebarLink
          icon={<MagnifyingGlass className="m-1 h-4 w-4" />}
          to="/dm/search"
        >
          Search Messages
        </SidebarLink>
        <SidebarLink
          to="/dm/new"
          color="text-blue"
          icon={<NewMessageIcon className="h-6 w-6" />}
        >
          New Message
        </SidebarLink>
        <li className="p-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              className={
                'default-focus flex items-center space-x-2 rounded-lg bg-gray-50 p-2 text-base font-semibold'
              }
              aria-label="Groups Filter Options"
            >
              <span className="pl-1">{filter}</span>
              <CaretDown16Icon className="w-4 text-gray-400" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="dropdown text-gray-600">
              <DropdownMenu.Item
                className={cn(
                  'dropdown-item flex items-center space-x-2 rounded-none',
                  filter === filters.all && 'bg-gray-50 text-gray-800'
                )}
                onClick={() => setFilter(filters.all)}
              >
                <ChatSmallIcon className="mr-2 h-4 w-4" />
                All Messages
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={cn(
                  'dropdown-item flex items-center space-x-2 rounded-none',
                  filter === filters.dms && 'bg-gray-50 text-gray-800'
                )}
                onClick={() => setFilter(filters.dms)}
              >
                <PersonSmallIcon className="mr-2 h-4 w-4" />
                Direct Messages
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={cn(
                  'dropdown-item flex items-center space-x-2 rounded-none',
                  filter === filters.groups && 'bg-gray-50 text-gray-800'
                )}
                onClick={() => setFilter(filters.groups)}
              >
                <CmdSmallIcon className="mr-2 h-4 w-4" />
                Group Talk Channels
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </li>
      </ul>
      <MessagesList filter={filter} />
    </nav>
  );
}
