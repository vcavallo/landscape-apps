import { debounce } from 'lodash';
import cn from 'classnames';
import { deSig } from '@urbit/api';
import React, {
  ChangeEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import fuzzy from 'fuzzy';
import { Link, useLocation } from 'react-router-dom';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useModalNavigate } from '@/logic/routing';
import Avatar from '@/components/Avatar';
import ShipName from '@/components/ShipName';
import { useContacts } from '@/state/contact';
import {
  useAmAdmin,
  useGroup,
  useGroupState,
  useRouteGroup,
} from '@/state/groups/groups';
import ElipsisCircleIcon from '@/components/icons/EllipsisCircleIcon';
import ElipsisIcon from '@/components/icons/EllipsisIcon';
import LeaveIcon from '@/components/icons/LeaveIcon';
import CheckIcon from '@/components/icons/CheckIcon';
import CaretDown16Icon from '@/components/icons/CaretDown16Icon';
import { getSectTitle, toTitleCase } from '@/logic/utils';
import { Vessel } from '@/types/groups';
import { Status } from '@/logic/status';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';

export default function GroupMemberManager() {
  const [sectStatus, setSecStatus] = useState<Status>('initial');
  const location = useLocation();
  const flag = useRouteGroup();
  const group = useGroup(flag);
  const isAdmin = useAmAdmin(flag);
  const contacts = useContacts();
  const modalNavigate = useModalNavigate();
  const [rawInput, setRawInput] = useState('');
  const [search, setSearch] = useState('');
  const members = useMemo(() => {
    if (!group) {
      return [];
    }
    return Object.keys(group.fleet).filter((k) => {
      if ('shut' in group.cordon) {
        return (
          !group.cordon.shut.ask.includes(k) &&
          !group.cordon.shut.pending.includes(k)
        );
      }
      return true;
    });
  }, [group]);

  const results = useMemo(
    () =>
      fuzzy
        .filter(search, members)
        .sort((a, b) => {
          const filter = deSig(search) || '';
          const left = deSig(a.string)?.startsWith(filter)
            ? a.score + 1
            : a.score;
          const right = deSig(b.string)?.startsWith(filter)
            ? b.score + 1
            : b.score;

          return right - left;
        })
        .map((result) => members[result.index]),
    [search, members]
  );

  const onUpdate = useRef(
    debounce((value: string) => {
      setSearch(value);
    }, 150)
  );

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setRawInput(value);
    onUpdate.current(value);
  }, []);

  const toggleSect = useCallback(
    (ship: string, sect: string, vessel: Vessel) => async (event: Event) => {
      event.preventDefault();

      setSecStatus('loading');

      const inSect = vessel.sects.includes(sect);
      if (inSect) {
        try {
          await useGroupState.getState().delSects(flag, ship, [sect]);
          setSecStatus('success');
        } catch (e) {
          setSecStatus('error');
          console.error(e);
        }
      } else {
        try {
          await useGroupState.getState().addSects(flag, ship, [sect]);
          setSecStatus('success');
        } catch (e) {
          setSecStatus('error');
          console.log(e);
        }
      }
    },
    [flag]
  );

  const kick = useCallback(
    (ship: string) => () => {
      useGroupState.getState().delMembers(flag, [ship]);
    },
    [flag]
  );

  const ban = useCallback(
    (ship: string) => () => {
      useGroupState.getState().banShips(flag, [ship]);
    },
    [flag]
  );

  const onViewProfile = (ship: string) => {
    modalNavigate(`/profile/${ship}`, {
      state: { backgroundLocation: location },
    });
  };

  if (!group) {
    return null;
  }

  const sects = Object.keys(group.cabals);

  return (
    <div>
      <p className="mb-4 text-sm font-semibold text-gray-400">
        {members.length} total
      </p>
      <div className="mb-4 flex items-center">
        <input
          value={rawInput}
          onChange={onChange}
          className="input flex-1 font-semibold"
          placeholder="Search Members"
          aria-label="Search Members"
        />
        <Link
          to={`/groups/${flag}/invite`}
          state={{ backgroundLocation: location }}
          className="button ml-2 bg-blue dark:text-black"
        >
          Invite
        </Link>
      </div>
      <ul className="space-y-6 py-2">
        {results.map((m) => {
          const vessel = group.fleet[m];
          return (
            <li key={m} className="flex items-center font-semibold">
              <div className="cursor-pointer" onClick={() => onViewProfile(m)}>
                <Avatar ship={m} size="small" className="mr-2" />
              </div>
              <div className="flex flex-1 flex-col">
                <h2>
                  {contacts[m]?.nickname ? (
                    contacts[m].nickname
                  ) : (
                    <ShipName name={m} />
                  )}
                </h2>
                {contacts[m]?.nickname ? (
                  <p className="text-sm text-gray-400">{m}</p>
                ) : null}
              </div>
              {isAdmin && vessel ? (
                <Dropdown.Root>
                  <Dropdown.Trigger className="default-focus mr-2 flex items-center rounded px-2 py-1.5 text-gray-400">
                    {vessel.sects
                      .map((s) => toTitleCase(getSectTitle(group.cabals, s)))
                      .join(', ')}
                    <CaretDown16Icon className="ml-2 h-4 w-4" />
                  </Dropdown.Trigger>
                  <Dropdown.Content className="dropdown min-w-52 text-gray-800">
                    {sects.map((s) => (
                      <Dropdown.Item
                        key={s}
                        className={cn(
                          'dropdown-item flex items-center',
                          !vessel.sects.includes(s) && 'text-gray-400'
                        )}
                        onSelect={toggleSect(m, s, vessel)}
                      >
                        {getSectTitle(group.cabals, s)}
                        {sectStatus === 'loading' ? (
                          <LoadingSpinner className="ml-auto h-4 w-4" />
                        ) : vessel.sects.includes(s) ? (
                          <CheckIcon className="ml-auto h-6 w-6 text-green" />
                        ) : (
                          <div className="ml-auto h-6 w-6" />
                        )}
                      </Dropdown.Item>
                    ))}
                    <Dropdown.Item
                      className={cn(
                        'dropdown-item flex items-center',
                        'text-gray-400'
                      )}
                    >
                      Member
                      <CheckIcon className="ml-auto h-6 w-6 text-green" />
                    </Dropdown.Item>
                  </Dropdown.Content>
                </Dropdown.Root>
              ) : null}
              {isAdmin ? (
                <Dropdown.Root>
                  {m !== window.our ? (
                    <Dropdown.Trigger className="default-focus ml-auto rounded text-gray-400">
                      <ElipsisCircleIcon className="h-6 w-6" />
                    </Dropdown.Trigger>
                  ) : (
                    <div className="h-6 w-6" />
                  )}

                  <Dropdown.Content className="dropdown min-w-52 text-gray-800">
                    <Dropdown.Item
                      className="dropdown-item flex items-center text-red"
                      onSelect={kick(m)}
                    >
                      <LeaveIcon className="mr-2 h-6 w-6" />
                      Kick
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="dropdown-item flex items-center text-red"
                      onSelect={ban(m)}
                    >
                      <LeaveIcon className="mr-2 h-6 w-6" />
                      Ban
                    </Dropdown.Item>
                  </Dropdown.Content>
                </Dropdown.Root>
              ) : (
                <Dropdown.Root>
                  <Dropdown.Trigger className="default-focus ml-auto rounded text-gray-400">
                    <ElipsisIcon className="h-6 w-6" />
                  </Dropdown.Trigger>
                  <Dropdown.Content className="dropdown min-w-52 text-gray-800">
                    <Dropdown.Item
                      className="dropdown-item flex items-center"
                      onSelect={() => onViewProfile(m)}
                    >
                      View Profile
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="dropdown-item flex items-center"
                      onSelect={(e) => e.preventDefault}
                    >
                      Send Message
                    </Dropdown.Item>
                  </Dropdown.Content>
                </Dropdown.Root>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
