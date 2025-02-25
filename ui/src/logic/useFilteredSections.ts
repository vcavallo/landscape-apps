import { useVessel } from '@/state/groups';
import useAllBriefs from './useAllBriefs';
import useChannelSections from './useChannelSections';
import { canReadChannel, isChannelJoined } from './utils';

const useFilteredSections = (flag: string, filterJoined?: boolean) => {
  const briefs = useAllBriefs();
  const { sections, sectionedChannels } = useChannelSections(flag);
  const vessel = useVessel(flag, window.our);

  const filteredSections = sections.filter(
    (s) =>
      sectionedChannels[s] &&
      sectionedChannels[s].some((sectionedChan) => {
        if (filterJoined) {
          return (
            sectionedChan[1] &&
            canReadChannel(sectionedChan[1], vessel) &&
            isChannelJoined(sectionedChan[0], briefs)
          );
        }
        return sectionedChan[1] && canReadChannel(sectionedChan[1], vessel);
      })
  );
  return filteredSections;
};

export default useFilteredSections;
