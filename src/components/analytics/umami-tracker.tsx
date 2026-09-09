type UmamiTrackerProps = {
  scriptUrl?: string;
  websiteId?: string;
};

const defaultScriptUrl =
  'https://analytics.shreenathjitradelinks.com/script.js';

export const UmamiTracker = ({
  scriptUrl = defaultScriptUrl,
  websiteId,
}: UmamiTrackerProps) => {
  if (!websiteId) return null;

  return (
    <script
      async
      data-domains="shreenathjitradelinks.com"
      data-website-id={websiteId}
      defer
      src={scriptUrl}
    />
  );
};
