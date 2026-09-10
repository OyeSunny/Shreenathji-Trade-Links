'use server';

import { requireOwnerPageSession } from '@/features/auth/server/session';
import {
  InvalidUploadedImageError,
  removeLocalUpload,
  storeLocalImage,
} from '@/features/catalogue/server/local-image-upload';
import {
  parseBusinessIdentityForm,
  parseCompanyPageContentForm,
  parseHomePageContentForm,
  siteSettingKeys,
} from '@/features/content/site-content';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export type WebsiteContentFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  status?: 'error' | 'success';
};

const revalidateWebsiteContentPaths = () => {
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/contact');
  revalidatePath('/products');
  revalidatePath('/request-a-quote');
  revalidatePath('/admin/content');
  revalidatePath('/admin/content/homepage');
  revalidatePath('/admin/content/company-details');
  revalidatePath('/admin/content/company-page');
};

export const saveBusinessIdentity = async (
  _previousState: WebsiteContentFormState,
  formData: FormData,
): Promise<WebsiteContentFormState> => {
  await requireOwnerPageSession();

  const result = parseBusinessIdentityForm(formData);
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      message: 'Review the highlighted details and try again.',
      status: 'error',
    };
  }

  try {
    await db.siteSetting.upsert({
      where: { key: siteSettingKeys.businessIdentity },
      create: {
        key: siteSettingKeys.businessIdentity,
        value: result.data,
      },
      update: { value: result.data },
    });
  } catch {
    return {
      message: 'We could not save these details. Please try again.',
      status: 'error',
    };
  }

  revalidateWebsiteContentPaths();
  return {
    message: 'Company and contact details have been saved.',
    status: 'success',
  };
};

export const saveCompanyPageContent = async (
  _previousState: WebsiteContentFormState,
  formData: FormData,
): Promise<WebsiteContentFormState> => {
  await requireOwnerPageSession();

  const result = parseCompanyPageContentForm(formData);
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      message: 'Review the highlighted text and try again.',
      status: 'error',
    };
  }

  try {
    await db.siteSetting.upsert({
      where: { key: siteSettingKeys.companyPageContent },
      create: {
        key: siteSettingKeys.companyPageContent,
        value: result.data,
      },
      update: { value: result.data },
    });
  } catch {
    return {
      message: 'We could not save the company page text. Please try again.',
      status: 'error',
    };
  }

  revalidateWebsiteContentPaths();
  return {
    message: 'Company page text has been saved.',
    status: 'success',
  };
};

export const saveHomePageContent = async (
  _previousState: WebsiteContentFormState,
  formData: FormData,
): Promise<WebsiteContentFormState> => {
  await requireOwnerPageSession();

  const result = parseHomePageContentForm(formData);
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      message: 'Review the homepage fields and try again.',
      status: 'error',
    };
  }

  const uploadedStorageKeys: string[] = [];

  try {
    for (const [index, slide] of result.data.heroSlides.entries()) {
      const field = formData.get(`hero-${index}-image`);
      if (!(field instanceof File) || field.size === 0) continue;

      const upload = await storeLocalImage(field);
      slide.imageSrc = upload.publicUrl;
      uploadedStorageKeys.push(upload.storageKey);
    }
  } catch (error) {
    await Promise.all(uploadedStorageKeys.map((key) => removeLocalUpload(key)));
    return {
      message:
        error instanceof InvalidUploadedImageError
          ? 'Use a valid JPG, PNG, WebP, or AVIF image under 10 MB.'
          : 'We could not store one of the hero images. Please try again.',
      status: 'error',
    };
  }

  try {
    await db.siteSetting.upsert({
      where: { key: siteSettingKeys.homePageContent },
      create: { key: siteSettingKeys.homePageContent, value: result.data },
      update: { value: result.data },
    });
  } catch {
    await Promise.all(uploadedStorageKeys.map((key) => removeLocalUpload(key)));
    return {
      message: 'We could not save the homepage content. Please try again.',
      status: 'error',
    };
  }

  revalidateWebsiteContentPaths();
  return { message: 'Homepage content has been saved.', status: 'success' };
};
