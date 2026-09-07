import {
  defaultBusinessIdentity,
  defaultCompanyPageContent,
  parseBusinessIdentityForm,
  parseBusinessIdentitySetting,
  parseCompanyPageContentForm,
  parseCompanyPageContentSetting,
} from '@/features/content/site-content';

describe('website content settings', () => {
  it('uses the business identity defaults when a stored setting is malformed', () => {
    expect(parseBusinessIdentitySetting({ companyName: 42 })).toEqual(
      defaultBusinessIdentity,
    );
  });

  it('parses and trims valid business identity form fields', () => {
    const formData = new FormData();
    formData.set('companyName', '  Shreenathji Trade Links  ');
    formData.set('city', ' Gandhidham, Gujarat ');
    formData.set('address', ' Plot 14, Industrial Estate ');
    formData.set('email', ' sales@example.com ');
    formData.set('phone', ' +91 98765 43210 ');
    formData.set('whatsApp', ' +91 98765 43210 ');
    formData.set('exportStatement', ' Export enquiries welcome. ');

    const result = parseBusinessIdentityForm(formData);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toMatchObject({
      companyName: 'Shreenathji Trade Links',
      email: 'sales@example.com',
      exportStatement: 'Export enquiries welcome.',
    });
  });

  it('rejects an invalid business email address', () => {
    const formData = new FormData();
    formData.set('companyName', 'Shreenathji Trade Links');
    formData.set('city', 'Gandhidham, Gujarat');
    formData.set('address', '');
    formData.set('email', 'not-an-email');
    formData.set('phone', '');
    formData.set('whatsApp', '');
    formData.set('exportStatement', '');

    const result = parseBusinessIdentityForm(formData);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.email).toEqual([
      'Enter a valid email address.',
    ]);
  });

  it('falls back to company page defaults when stored page content is incomplete', () => {
    expect(parseCompanyPageContentSetting({ title: 'Only a title' })).toEqual(
      defaultCompanyPageContent,
    );
  });

  it('parses company page content from structured form fields', () => {
    const formData = new FormData();
    formData.set('eyebrow', ' Our story ');
    formData.set('title', ' Reliable material sourcing. ');
    formData.set('lede', ' A concise company introduction for buyers. ');
    formData.set(
      'body',
      ' More detail about how the business supports buyers. ',
    );

    const result = parseCompanyPageContentForm(formData);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual({
      eyebrow: 'Our story',
      title: 'Reliable material sourcing.',
      lede: 'A concise company introduction for buyers.',
      body: 'More detail about how the business supports buyers.',
    });
  });
});
