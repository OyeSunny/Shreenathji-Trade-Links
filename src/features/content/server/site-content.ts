import {
  parseBusinessIdentitySetting,
  parseCompanyPageContentSetting,
  parseHomePageContentSetting,
  siteSettingKeys,
} from '@/features/content/site-content';
import { db } from '@/lib/db';
import 'server-only';

export const getWebsiteContent = async () => {
  const settings = await db.siteSetting.findMany({
    where: {
      key: {
        in: [
          siteSettingKeys.businessIdentity,
          siteSettingKeys.companyPageContent,
          siteSettingKeys.homePageContent,
        ],
      },
    },
    select: { key: true, value: true },
  });

  const byKey = new Map(
    settings.map((setting) => [setting.key, setting.value]),
  );

  return {
    businessIdentity: parseBusinessIdentitySetting(
      byKey.get(siteSettingKeys.businessIdentity),
    ),
    companyPageContent: parseCompanyPageContentSetting(
      byKey.get(siteSettingKeys.companyPageContent),
    ),
    homePageContent: parseHomePageContentSetting(
      byKey.get(siteSettingKeys.homePageContent),
    ),
  };
};
