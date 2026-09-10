import { z } from 'zod';

export const siteSettingKeys = {
  businessIdentity: 'business_identity',
  companyPageContent: 'company_page_content',
  homePageContent: 'home_page_content',
} as const;

const trimmedText = (maximumLength: number) =>
  z.string().trim().max(maximumLength);

const requiredText = (
  minimumLength: number,
  maximumLength: number,
  message: string,
) => trimmedText(maximumLength).min(minimumLength, message);

const optionalText = (maximumLength: number) =>
  trimmedText(maximumLength).transform((value) => value || '');

const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .refine(
    (value) => value === '' || z.email().safeParse(value).success,
    'Enter a valid email address.',
  );

const defaultRegisteredAddress =
  'Plot No. 231, Yogeshwar Nagar, Kidana, Gandhidham, Kachchh, Gujarat - 370205';
const defaultOfficeAddress =
  'Shop No. 22, Plot No. 58, Sec 9/C, Mohan Market, Nr. Hotel Gokul, Gandhidham, Kachchh - 370201';

export const businessIdentitySchema = z.object({
  companyName: requiredText(2, 140, 'Enter the company name.'),
  city: requiredText(2, 140, 'Enter the city and state.'),
  address: optionalText(500),
  registeredAddress: optionalText(500).default(defaultRegisteredAddress),
  officeAddress: optionalText(500).default(defaultOfficeAddress),
  email: optionalEmail,
  phone: optionalText(40),
  whatsApp: optionalText(40),
  exportStatement: optionalText(280),
});

export const companyPageContentSchema = z.object({
  eyebrow: requiredText(2, 80, 'Enter a short section label.'),
  title: requiredText(10, 180, 'Enter a clear page title.'),
  lede: requiredText(20, 600, 'Enter a short company introduction.'),
  body: requiredText(20, 4000, 'Enter the company story or working approach.'),
});

const internalOrHttpsUrl = z
  .string()
  .trim()
  .max(1_000)
  .refine(
    (value) => value.startsWith('/') || /^https:\/\//i.test(value),
    'Use a website path beginning with / or a secure https:// URL.',
  );

const homeHeroSlideSchema = z.object({
  imageSrc: internalOrHttpsUrl,
  imageAlt: requiredText(4, 180, 'Describe the hero image.'),
  eyebrow: requiredText(2, 100, 'Enter the small hero heading.'),
  title: requiredText(4, 160, 'Enter the hero title.'),
  lede: requiredText(20, 600, 'Enter the hero introduction.'),
  primaryLabel: requiredText(2, 60, 'Enter the primary button label.'),
  primaryHref: internalOrHttpsUrl,
  secondaryLabel: requiredText(2, 60, 'Enter the secondary button label.'),
  secondaryHref: internalOrHttpsUrl,
  indexLabel: requiredText(2, 80, 'Enter the slide category label.'),
});

const homeHighlightSchema = z.object({
  title: requiredText(2, 100, 'Enter the highlight title.'),
  text: requiredText(2, 180, 'Enter the highlight description.'),
});

const homeProcessStepSchema = z.object({
  title: requiredText(2, 100, 'Enter the step title.'),
  text: requiredText(2, 240, 'Enter the step description.'),
});

export const homePageContentSchema = z.object({
  heroSlides: z
    .array(homeHeroSlideSchema)
    .min(1, 'Add at least one hero slide.')
    .max(10, 'Use up to ten hero slides.'),
  marqueeItems: z
    .array(requiredText(2, 100, 'Enter a marquee item.'))
    .min(2, 'Add at least two marquee items.')
    .max(12),
  highlights: z.array(homeHighlightSchema).length(3),
  catalogueEyebrow: requiredText(2, 100, 'Enter the catalogue label.'),
  catalogueTitle: requiredText(4, 180, 'Enter the catalogue title.'),
  catalogueLinkLabel: requiredText(2, 80, 'Enter the catalogue link label.'),
  processEyebrow: requiredText(2, 100, 'Enter the process label.'),
  processTitle: requiredText(4, 180, 'Enter the process title.'),
  processLede: requiredText(20, 600, 'Enter the process introduction.'),
  processSteps: z.array(homeProcessStepSchema).length(3),
  closingEyebrow: requiredText(2, 100, 'Enter the closing label.'),
  closingTitle: requiredText(4, 180, 'Enter the closing title.'),
  closingButtonLabel: requiredText(2, 80, 'Enter the closing button label.'),
  closingButtonHref: internalOrHttpsUrl,
});

export type BusinessIdentity = z.infer<typeof businessIdentitySchema>;
export type CompanyPageContent = z.infer<typeof companyPageContentSchema>;
export type HomePageContent = z.infer<typeof homePageContentSchema>;

export const defaultBusinessIdentity: BusinessIdentity = {
  companyName: 'Shreenathji Trade Links',
  city: 'Gandhidham, Gujarat, India',
  address: '',
  registeredAddress: defaultRegisteredAddress,
  officeAddress: defaultOfficeAddress,
  email: '',
  phone: '',
  whatsApp: '',
  exportStatement:
    'Supporting domestic and international buyer enquiries for industrial materials.',
};

export const defaultCompanyPageContent: CompanyPageContent = {
  eyebrow: 'Company profile',
  title: 'Practical sourcing for industrial material buyers.',
  lede: 'Shreenathji Trade Links is a Gandhidham, Gujarat-based B2B trading business focused on industrial raw materials and buyer enquiries.',
  body: 'Buyers share their material grade, quantity, packaging, and delivery requirements. We then take the conversation forward with the relevant material information and sourcing next steps.',
};

export const defaultHomePageContent: HomePageContent = {
  heroSlides: [
    {
      imageSrc: '/media/industrial-ore-stockyard.png',
      imageAlt: 'Iron ore material stockyard with port loading equipment',
      eyebrow: 'Industrial raw materials · India & export',
      title: 'Material supply, made dependable.',
      lede: 'Shreenathji Trade Links connects industrial buyers with bulk iron, carbon, and mineral materials—with clear specifications and direct enquiry support.',
      primaryLabel: 'Request a quote',
      primaryHref: '/request-a-quote',
      secondaryLabel: 'Explore materials',
      secondaryHref: '/products',
      indexLabel: 'FERROUS MATERIALS',
    },
    {
      imageSrc: '/media/industrial-carbon-yard.png',
      imageAlt: 'Carbon materials at an industrial processing yard',
      eyebrow: 'Built for buyer clarity',
      title: 'Get the grade. Know the route.',
      lede: 'Start with the material, volume, destination, and timeline. Our enquiry team keeps every next step direct and practical.',
      primaryLabel: 'Send requirements',
      primaryHref: '/request-a-quote',
      secondaryLabel: 'Talk to our team',
      secondaryHref: '/contact',
      indexLabel: 'CARBON MATERIALS',
    },
    {
      imageSrc: '/media/industrial-dolomite-quarry.png',
      imageAlt: 'Dolomite aggregate quarry with processing machinery',
      eyebrow: 'Mineral supply, specified clearly',
      title: 'From source to specification.',
      lede: 'Mineral requirements move faster when grade, form, and delivery details are clear from the first enquiry.',
      primaryLabel: 'Browse materials',
      primaryHref: '/products',
      secondaryLabel: 'Request a quote',
      secondaryHref: '/request-a-quote',
      indexLabel: 'INDUSTRIAL MINERALS',
    },
    {
      imageSrc: '/media/industrial-export-terminal.png',
      imageAlt:
        'Bulk cargo export terminal with ship, containers, and loading equipment',
      eyebrow: 'India & export enquiries',
      title: 'Logistics-aware conversations.',
      lede: 'Tell us the destination, quantity, and timeline. We structure the first conversation around the supply route that matters.',
      primaryLabel: 'Start an export enquiry',
      primaryHref: '/request-a-quote',
      secondaryLabel: 'Contact us',
      secondaryHref: '/contact',
      indexLabel: 'EXPORT LOGISTICS',
    },
    {
      imageSrc: '/media/industrial-melamine-granules.png',
      imageAlt: 'Melamine granules in industrial bulk handling',
      eyebrow: 'Material presentation matters',
      title: 'Ready for the next requirement.',
      lede: 'From bulk minerals to specialist materials, share the specification and we will take the enquiry forward directly.',
      primaryLabel: 'Send an enquiry',
      primaryHref: '/request-a-quote',
      secondaryLabel: 'View catalogue',
      secondaryHref: '/products',
      indexLabel: 'SPECIALITY MATERIALS',
    },
  ],
  marqueeItems: [
    'Industrial raw materials',
    'India · Export enquiries',
    'Grade · Quantity · Destination',
    'Direct buyer response',
  ],
  highlights: [
    { title: 'Bulk-led sourcing', text: 'For industrial requirements' },
    { title: 'Direct buyer enquiries', text: 'Clear material specifications' },
    { title: 'India & international', text: 'Export-ready conversation' },
  ],
  catalogueEyebrow: 'Featured catalogue',
  catalogueTitle: 'Materials ready to quote.',
  catalogueLinkLabel: 'View all products',
  processEyebrow: 'How enquiries move',
  processTitle: 'A direct route from requirement to response.',
  processLede:
    'No checkout flow or generic lead funnel. Start with the facts that matter to your material requirement.',
  processSteps: [
    {
      title: 'Define the material',
      text: 'Share grade, form, and application.',
    },
    {
      title: 'Set the commercial context',
      text: 'Tell us the quantity, packaging, destination, and timeline.',
    },
    {
      title: 'Continue directly',
      text: 'We respond with the next practical sourcing step.',
    },
  ],
  closingEyebrow: 'Tell us what you need',
  closingTitle: 'Send the specifications. We’ll take it from there.',
  closingButtonLabel: 'Start an enquiry',
  closingButtonHref: '/request-a-quote',
};

const getTextField = (formData: FormData, field: string) => {
  const value = formData.get(field);

  return typeof value === 'string' ? value : '';
};

export const parseBusinessIdentityForm = (formData: FormData) =>
  businessIdentitySchema.safeParse({
    companyName: getTextField(formData, 'companyName'),
    city: getTextField(formData, 'city'),
    address: getTextField(formData, 'address'),
    registeredAddress: getTextField(formData, 'registeredAddress'),
    officeAddress: getTextField(formData, 'officeAddress'),
    email: getTextField(formData, 'email'),
    phone: getTextField(formData, 'phone'),
    whatsApp: getTextField(formData, 'whatsApp'),
    exportStatement: getTextField(formData, 'exportStatement'),
  });

export const parseCompanyPageContentForm = (formData: FormData) =>
  companyPageContentSchema.safeParse({
    eyebrow: getTextField(formData, 'eyebrow'),
    title: getTextField(formData, 'title'),
    lede: getTextField(formData, 'lede'),
    body: getTextField(formData, 'body'),
  });

const homeTextField = (formData: FormData, name: string) =>
  getTextField(formData, name);

export const parseHomePageContentForm = (formData: FormData) =>
  homePageContentSchema.safeParse({
    heroSlides: Array.from(
      {
        length: Math.min(
          11,
          Math.max(
            0,
            Number.parseInt(getTextField(formData, 'heroCount'), 10) || 0,
          ),
        ),
      },
      (_, index) => ({
        imageSrc: homeTextField(formData, `hero-${index}-imageSrc`),
        imageAlt: homeTextField(formData, `hero-${index}-imageAlt`),
        eyebrow: homeTextField(formData, `hero-${index}-eyebrow`),
        title: homeTextField(formData, `hero-${index}-title`),
        lede: homeTextField(formData, `hero-${index}-lede`),
        primaryLabel: homeTextField(formData, `hero-${index}-primaryLabel`),
        primaryHref: homeTextField(formData, `hero-${index}-primaryHref`),
        secondaryLabel: homeTextField(formData, `hero-${index}-secondaryLabel`),
        secondaryHref: homeTextField(formData, `hero-${index}-secondaryHref`),
        indexLabel: homeTextField(formData, `hero-${index}-indexLabel`),
      }),
    ),
    marqueeItems: Array.from(
      {
        length: Math.min(
          13,
          Math.max(
            0,
            Number.parseInt(getTextField(formData, 'marqueeCount'), 10) || 0,
          ),
        ),
      },
      (_, index) => homeTextField(formData, `marquee-${index}`),
    ),
    highlights: defaultHomePageContent.highlights.map((_, index) => ({
      title: homeTextField(formData, `highlight-${index}-title`),
      text: homeTextField(formData, `highlight-${index}-text`),
    })),
    catalogueEyebrow: homeTextField(formData, 'catalogueEyebrow'),
    catalogueTitle: homeTextField(formData, 'catalogueTitle'),
    catalogueLinkLabel: homeTextField(formData, 'catalogueLinkLabel'),
    processEyebrow: homeTextField(formData, 'processEyebrow'),
    processTitle: homeTextField(formData, 'processTitle'),
    processLede: homeTextField(formData, 'processLede'),
    processSteps: defaultHomePageContent.processSteps.map((_, index) => ({
      title: homeTextField(formData, `process-${index}-title`),
      text: homeTextField(formData, `process-${index}-text`),
    })),
    closingEyebrow: homeTextField(formData, 'closingEyebrow'),
    closingTitle: homeTextField(formData, 'closingTitle'),
    closingButtonLabel: homeTextField(formData, 'closingButtonLabel'),
    closingButtonHref: homeTextField(formData, 'closingButtonHref'),
  });

export const parseBusinessIdentitySetting = (
  value: unknown,
): BusinessIdentity => {
  const result = businessIdentitySchema.safeParse(value);

  return result.success ? result.data : defaultBusinessIdentity;
};

export const parseCompanyPageContentSetting = (
  value: unknown,
): CompanyPageContent => {
  const result = companyPageContentSchema.safeParse(value);

  return result.success ? result.data : defaultCompanyPageContent;
};

export const parseHomePageContentSetting = (
  value: unknown,
): HomePageContent => {
  const result = homePageContentSchema.safeParse(value);

  return result.success ? result.data : defaultHomePageContent;
};
