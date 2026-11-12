<script setup lang="ts">
import '@/styles/reset.css';
import '@/styles/tokens.css';
import '@/styles/public-accessibility-overrides.css';
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api } from '@/core/api/client';
import { masesBrandLabels } from '@/router/shell-labels';
import { formatCalendarDate } from '@/core/dates/calendar';
import { fetchCorporateHome, fetchCorporateEntries, fetchCorporatePages, submitCorporateInquiry, submitCorporateOpportunity, type CorporateSitePage, type CorporateSiteSection, type CorporatePublicEntry } from '@/features/public-site/api';

const route = useRoute();
const locale = ref<'am' | 'en'>(route.query.locale === 'en' ? 'en' : 'am');

const copy = computed(() => locale.value === 'am' ? {
  skip: 'ወደ ዋናው ይዘት ይሂዱ', announcement: 'የARNA ይፋዊ ድረ ገጽ። የተጸደቀ መረጃ ብቻ እዚህ ይታያል።',
  navAbout: 'ስለ ARNA', navValues: 'እሴቶቻችን', navServices: 'አገልግሎቶች', navBusiness: 'የንግድ አቅጣጫዎች', navUpdates: 'ዜናና ጦማር', navMedia: 'ሚዲያ', navAds: 'ማስታወቂያ', verify: 'ሰነድ ያረጋግጡ',
  heroTitle1: 'የጋራ እድገት።', heroTitle2: 'በታማኝነት የተመራ።', heroLead: 'ወደ ARNA እንኳን በደህና መጡ። ግልጽነትን፣ ተጠያቂነትን እና ዘላቂ እድገትን በማዕከል የሚያደርግ የጋራ ጉዞ እየገነባን ነው።',
  aboutButton: 'ARNAን ይወቁ', verifyCertificate: 'የአክሲዮን ምስክር ወረቀት ያረጋግጡ', trustline: 'መተማመን የሚገነባው በግልጽነት ነው።',
  aboutEyebrow: 'ስለ እኛ', aboutTitle1: 'ሥራን የሚያቀላጥፍ፣', aboutTitle2: 'እምነትን የሚያጠናክር', aboutAccent: 'ሥርዓት።',
  aboutP1: 'ARNA የድርጅት አሠራርን ከተጠያቂነትና ከግልጽ አስተዳደር ጋር ለማገናኘት የሚያተኩር የዲጂታል ሥርዓት ነው።',
  aboutP2: 'ይህ ይፋዊ ድረ ገጽ ስለ ድርጅቱ፣ አገልግሎቶቹ እና የተጸደቁ ማስታወቂያዎች መረጃን በአንድ ቦታ ለማቅረብ ይዘጋጃል።',
  valuesEyebrow: 'የምንመራባቸው እሴቶች', valuesTitle: 'መሠረታችን', valuesAccent: 'ግልጽ ነው።', valuesIntro: 'የምንገነባው ሥርዓት በሰዎች እምነት ላይ መመሥረት አለበት።',
  servicesEyebrow: 'አገልግሎቶችና መፍትሄዎች', servicesTitle: 'የምንገነባው', servicesAccent: 'ለወደፊት ነው።', servicesIntro: 'ዝርዝር የአገልግሎት መረጃዎች በይፋ ከጸደቁ በኋላ በዚህ ይታያሉ።',
  preparing: 'በመዘጋጀት ላይ', servicesNote: 'እነዚህ የአገልግሎት ምድቦች የድረ ገጹን መዋቅር ለማሳየት ቀርበዋል፤ የተወሰኑ ምርቶች፣ ዋጋዎች ወይም የግዢ ተግባራት እስኪጸድቁ ድረስ አይታዩም።',
  businessTitle: 'እድሎችን የሚያገናኙ', businessAccent: 'የሥራ አቅጣጫዎች።', businessIntro: 'የተረጋገጡ የንግድ ክፍሎችና ኩባንያዎች መገለጫዎች በአስተዳዳሪ ከጸደቁ በኋላ እዚህ ይታያሉ።',
  businessStatus: 'ዝርዝር መረጃ በማረጋገጥ ላይ', businessDisclaimer: 'ማስታወሻ፦ ከላይ ያሉት ምድቦች የድረ ገጹን መዋቅር ያሳያሉ፤ የተረጋገጡ የሕጋዊ ኩባንያ ስሞች፣ ባለቤትነት ወይም የንግድ ጥያቄዎች አይደሉም።',
  updatesTitle: 'የቅርብ መረጃዎች።', updatesAccent: 'ከታመነ ምንጭ።', updatesIntro: 'የድርጅቱ ዜናዎች፣ ማስታወቂያዎች እና ይፋዊ ማሻሻያዎች በአስተዳዳሪ ከተጸደቁ በኋላ እዚህ ይታያሉ።',
  approvedContent: 'የጸደቀ ይዘት ሲኖር ይታያል', mediaTitle: 'የARNA ሚዲያ', mediaAccent: 'ማዕከል።', mediaIntro: 'ፎቶዎችና ህትመቶች ከማረጋገጫና ከአስተዳዳሪ ፈቃድ በኋላ ብቻ ይታያሉ።',
  mediaEmpty: 'በአሁኑ ጊዜ የታተመ ሚዲያ የለም።', publicationsTitle: 'ህትመቶችና', publicationsAccent: 'ይፋዊ ማስታወቂያዎች።', publicationsEmpty: 'በአሁኑ ጊዜ የታተሙ ህትመቶች የሉም።',
  opportunitiesTitle: 'የሚቀጥለውን እድል', opportunitiesAccent: 'ከዚህ ይጀምሩ።', opportunitiesIntro: 'የተጸደቁ የሥራ እድሎች፣ የንግድ ማስታወቂያዎችና የገበያ ዝርዝሮች እዚህ ይታያሉ።',
  opportunitiesEmpty: 'በአሁኑ ጊዜ የታተመ እድል የለም። አዲስ ዝርዝሮች ከግምገማ በኋላ ይታያሉ።', contactTitle: 'ከእኛ ጋር ይገናኙ።',
  inquiryGeneral: 'አጠቃላይ', inquiryInvestor: 'ባለአክሲዮን / ኢንቨስተር', inquiryPartnership: 'አጋርነት', inquiryMedia: 'ሚዲያ', inquiryCareer: 'ሥራ', inquiryAdvertising: 'ማስታወቂያ', inquiryMarketplace: 'ገበያ',
  verificationTitle: 'የአክሲዮን ምስክር ወረቀት እውነተኛነት ያረጋግጡ።', verificationIntro: 'የARNA የአክሲዮን ምስክር ወረቀት ማጣቀሻ ቁጥርን በመጠቀም የሰነዱን ሁኔታ ይፈትሹ።',
  footerTagline: 'በመተማመን የሚገነባ የጋራ እድገት።', footerAbout: 'ይወቁን', footerOfficial: 'ይፋዊ አገናኞች', footerDisclosure: 'የተጸደቀ መረጃ ብቻ። ግልጽነት ሁልጊዜ።', backToTop: 'ወደ ላይ ↑'
} : {
  skip: 'Skip to main content', announcement: 'ARNA official corporate website. Only approved information is published here.',
  navAbout: 'About ARNA', navValues: 'Our values', navServices: 'Services', navBusiness: 'Business areas', navUpdates: 'News & insights', navMedia: 'Media', navAds: 'Advertising', verify: 'Verify a document',
  heroTitle1: 'Shared progress.', heroTitle2: 'Led by trust.', heroLead: 'Welcome to ARNA. We are building a shared journey centered on transparency, accountability and sustainable progress.',
  aboutButton: 'Discover ARNA', verifyCertificate: 'Verify a share certificate', trustline: 'Trust is built through transparency.',
  aboutEyebrow: 'About us', aboutTitle1: 'A system that', aboutTitle2: 'simplifies work and strengthens', aboutAccent: 'trust.',
  aboutP1: 'ARNA is a digital operating system focused on connecting enterprise operations with accountability and transparent governance.',
  aboutP2: 'This official website brings together approved information about the organization, its services and public announcements.',
  valuesEyebrow: 'Our guiding principles', valuesTitle: 'Our foundation is', valuesAccent: 'clear.', valuesIntro: 'The system we build must be grounded in the trust of the people it serves.',
  servicesEyebrow: 'Services & solutions', servicesTitle: 'What we build is', servicesAccent: 'for the future.', servicesIntro: 'Detailed service information will appear here after formal approval.',
  preparing: 'In preparation', servicesNote: 'These service categories illustrate the website structure. Specific products, prices and purchasing functions will appear only after approval.',
  businessTitle: 'Connecting opportunities through', businessAccent: 'business areas.', businessIntro: 'Verified business-unit and company profiles will appear here after administrative approval.',
  businessStatus: 'Details under verification', businessDisclaimer: 'Note: The categories above illustrate the website structure. They are not verified legal company names, ownership statements or commercial claims.',
  updatesTitle: 'The latest updates.', updatesAccent: 'From trusted sources.', updatesIntro: 'Corporate news, announcements and official updates appear here after administrative approval.',
  approvedContent: 'Shown when approved content is available', mediaTitle: 'The ARNA media', mediaAccent: 'center.', mediaIntro: 'Photos and publications appear only after verification and administrative approval.',
  mediaEmpty: 'There is no published media at this time.', publicationsTitle: 'Publications &', publicationsAccent: 'official notices.', publicationsEmpty: 'There are no published notices or publications at this time.',
  opportunitiesTitle: 'Your next opportunity', opportunitiesAccent: 'starts here.', opportunitiesIntro: 'Approved career opportunities, business advertisements and marketplace listings appear here.',
  opportunitiesEmpty: 'There are no published opportunities at this time. New listings appear after review.', contactTitle: 'Get in touch with ARNA.',
  inquiryGeneral: 'General', inquiryInvestor: 'Shareholder / Investor', inquiryPartnership: 'Partnership', inquiryMedia: 'Media', inquiryCareer: 'Career', inquiryAdvertising: 'Advertising', inquiryMarketplace: 'Marketplace',
  verificationTitle: 'Verify the authenticity of a share certificate.', verificationIntro: 'Use the ARNA share-certificate reference number to check the document status.',
  footerTagline: 'Shared progress built on trust.', footerAbout: 'Explore', footerOfficial: 'Official links', footerDisclosure: 'Approved information only. Transparency, always.', backToTop: 'Back to top ↑'
});

const year = formatCalendarDate(new Date(), { year: 'numeric' });

interface PublishedContent {
  readonly id: string;
  readonly type: 'news' | 'article' | 'announcement' | 'press_release';
  readonly title: string;
  readonly body: string;
  readonly published_at: string | null;
}

const publishedContent = ref<PublishedContent[]>([]);
const corporateHome = ref<CorporateSitePage | null>(null);
const corporatePages = ref<CorporateSitePage[]>([]);
const navigationPages = computed(() => corporatePages.value.filter((page) => page.page_key !== 'home' && page.slug));
const corporateNews = ref<CorporatePublicEntry[]>([]);
const corporateAnnouncements = ref<CorporatePublicEntry[]>([]);
const corporatePublications = ref<CorporatePublicEntry[]>([]);
const corporateMedia = ref<CorporatePublicEntry[]>([]);
const corporateBusinesses = ref<CorporatePublicEntry[]>([]);
const corporateServices = ref<CorporatePublicEntry[]>([]);
const corporateCareers = ref<CorporatePublicEntry[]>([]);
const corporateMarket = ref<CorporatePublicEntry[]>([]);
const corporateAds = ref<CorporatePublicEntry[]>([]);
const inquiry = ref({ inquiry_type: 'general' as const, name: '', email: '', phone: '', subject: '', message: '', consent: false, website: '' });
const inquiryStatus = ref('');
const opportunity = ref({ type: 'career' as 'career' | 'opportunity' | 'advertisement' | 'marketplace', name: '', email: '', title: '', description: '', organization: '' });
const opportunityStatus = ref('');
const submitting = ref(false);

function sectionText(section: CorporateSiteSection, field: string): string {
  const localeContent = section.content[locale.value];
  if (typeof localeContent !== 'object' || localeContent === null) return '';
  const value = (localeContent as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : '';
}

async function loadPublicContent(): Promise<void> {
  document.documentElement.lang = locale.value;
  document.title = locale.value === 'am' ? 'ARNA | ይፋዊ ድረ ገጽ' : 'ARNA | Official Website';
  let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!description) { description = document.createElement('meta'); description.name = 'description'; document.head.append(description); }
  description.content = locale.value === 'am'
    ? 'የARNA ይፋዊ ድረ ገጽ። ስለ ድርጅቱ፣ አገልግሎቶች፣ ዜናዎችና እድሎች ይወቁ።'
    : 'ARNA official corporate website: organization, services, news, opportunities and publications.';

  try { corporatePages.value = await fetchCorporatePages(locale.value); }
  catch { corporatePages.value = []; }

  try {
    corporateHome.value = await fetchCorporateHome(locale.value);
    if (corporateHome.value?.seo?.title) document.title = corporateHome.value.seo.title;
    if (corporateHome.value?.seo?.description && description) description.content = corporateHome.value.seo.description;
  } catch { corporateHome.value = null; }

  try {
    const [news, announcements, publications, media, businesses, services, careers, market, ads] = await Promise.all([
      fetchCorporateEntries('news', locale.value),
      fetchCorporateEntries('announcement', locale.value),
      fetchCorporateEntries('publication', locale.value),
      fetchCorporateEntries('media', locale.value),
      fetchCorporateEntries('business', locale.value),
      fetchCorporateEntries('service', locale.value),
      fetchCorporateEntries('career', locale.value),
      fetchCorporateEntries('marketplace', locale.value),
      fetchCorporateEntries('advertisement', locale.value),
    ]);
    corporateNews.value = news;
    corporateAnnouncements.value = announcements;
    corporatePublications.value = publications;
    corporateMedia.value = media;
    corporateBusinesses.value = businesses;
    corporateServices.value = services;
    corporateCareers.value = careers;
    corporateMarket.value = market;
    corporateAds.value = ads;
  } catch {
    corporateNews.value = [];
    corporateAnnouncements.value = []; corporatePublications.value = []; corporateMedia.value = [];
    corporateBusinesses.value = [];
    corporateServices.value = [];
    corporateCareers.value = [];
    corporateMarket.value = [];
    corporateAds.value = [];
  }

  try {
    const page = await api.get<{ data: PublishedContent[] }>('/api/public/content', { params: { per_page: 3 } });
    publishedContent.value = page.data;
  } catch { publishedContent.value = []; }
}

onMounted(() => void loadPublicContent());
watch(() => route.query.locale, (next) => {
  locale.value = next === 'en' ? 'en' : 'am';
  void loadPublicContent();
});


async function sendInquiry(): Promise<void> {
  submitting.value = true;
  inquiryStatus.value = '';
  try {
    const result = await submitCorporateInquiry(inquiry.value);
    inquiryStatus.value = locale.value === 'am' ? `ጥያቄዎ ተቀብሏል። የማጣቀሻ ቁጥር: ${result.reference}` : `Your inquiry was received. Reference: ${result.reference}`;
    inquiry.value = { inquiry_type: 'general', name: '', email: '', phone: '', subject: '', message: '', consent: false, website: '' };
  } catch {
    inquiryStatus.value = locale.value === 'am' ? 'ጥያቄው አልተላከም። እባክዎ መረጃውን ያረጋግጡና እንደገና ይሞክሩ።' : 'The inquiry could not be sent. Check the details and try again.';
  } finally { submitting.value = false; }
}

async function sendOpportunity(): Promise<void> {
  submitting.value = true;
  opportunityStatus.value = '';
  try {
    const result = await submitCorporateOpportunity(opportunity.value.type, { ...opportunity.value, locale: locale.value });
    opportunityStatus.value = locale.value === 'am' ? `ማቅረቢያዎ ተቀብሏል። የማጣቀሻ ቁጥር: ${result.reference}` : `Your submission was received. Reference: ${result.reference}`;
    opportunity.value = { type: 'career', name: '', email: '', title: '', description: '', organization: '' };
  } catch {
    opportunityStatus.value = locale.value === 'am' ? 'ማቅረቢያው አልተላከም። እባክዎ መረጃውን ያረጋግጡ።' : 'The submission could not be sent. Check the details and try again.';
  } finally { submitting.value = false; }
}

function publishedDate(value: string | null): string {
  if (!value) return '';
  return formatCalendarDate(value, { dateStyle: 'medium' });
}


const principles = [
  {
    number: '01',
    titleAm: 'መተማመን',
    titleEn: 'Trust',
    description: 'በግልጽ ሂደቶች፣ በተጠያቂነት እና በታማኝ አሠራር ላይ የተመሠረተ ግንኙነት።', descriptionEn: 'Relationships grounded in clear processes, accountability and trustworthy practice.',
  },
  {
    number: '02',
    titleAm: 'ግልጽነት',
    titleEn: 'Transparency',
    description: 'ውሳኔዎችና መረጃዎች በቀላሉ እንዲገኙና እንዲረዱ ማድረግ።', descriptionEn: 'Making decisions and information easy to access and understand.',
  },
  {
    number: '03',
    titleAm: 'ተጠያቂነት',
    titleEn: 'Accountability',
    description: 'ኃላፊነት ያለውን አመራር፣ ቁጥጥር እና ጥንቃቄ የተሞላበት አስተዳደር መደገፍ።', descriptionEn: 'Supporting responsible leadership, oversight and careful governance.',
  },
];

const offerings = [
  {
    number: '01',
    label: 'የድርጅት ሥርዓቶች', labelEn: 'Enterprise systems',
    title: 'Enterprise systems',
    description: 'ለድርጅታዊ ሥራዎች፣ ለአስተዳደር እና ለተቀናጀ አሠራር የተዘጋጁ ዲጂታል መሠረቶች።', descriptionEn: 'Digital foundations for enterprise operations, administration and integrated workflows.',
  },
  {
    number: '02',
    label: 'የአባላት እና የባለአክሲዮኖች አገልግሎቶች', labelEn: 'Member and shareholder services',
    title: 'Member services',
    description: 'የባለድርሻ ግንኙነቶችንና ተዛማጅ አገልግሎቶችን በተጠበቀ መንገድ ለማቀናጀት የሚያግዙ መፍትሄዎች።', descriptionEn: 'Secure solutions for coordinating stakeholder relationships and related services.',
  },
  {
    number: '03',
    label: 'ዲጂታል ንግድ', labelEn: 'Digital commerce',
    title: 'Digital commerce',
    description: 'በደህንነትና በግልጽ መረጃ ላይ የተመሠረቱ የዲጂታል ንግድ አገልግሎቶች።', descriptionEn: 'Digital commerce services grounded in security and clear information.',
  },
];

const businessAreas = [
  { number: '01', title: 'Enterprise & operations', titleAm: 'ድርጅታዊ አሠራር', description: 'የድርጅት አስተዳደርን፣ የሥራ ሂደቶችንና የተቀናጀ አገልግሎትን የሚደግፉ መፍትሄዎች።', descriptionEn: 'Solutions supporting enterprise governance, workflows and integrated services.' },
  { number: '02', title: 'People & partnerships', titleAm: 'ሰዎችና አጋርነት', description: 'ከአባላት፣ ከባለድርሻ አካላትና ከንግድ አጋሮች ጋር ግልጽ ግንኙነት ለመገንባት የሚያግዙ አቅጣጫዎች።', descriptionEn: 'Clear partnerships with members, stakeholders and business partners.' },
  { number: '03', title: 'Commerce & innovation', titleAm: 'ንግድና ፈጠራ', description: 'የንግድ እድሎችን፣ የዲጂታል አገልግሎቶችንና ፈጠራን የሚያበረታቱ የወደፊት አቅጣጫዎች።', descriptionEn: 'Future directions that enable business opportunities, digital services and innovation.' },
];

const publicationChannels = [
  { number: '01', title: 'News', titleAm: 'ዜና', description: 'የድርጅትና የሥራ እንቅስቃሴ ዜናዎች።', descriptionEn: 'Company and operational news.', label: 'NEWS' },
  { number: '02', title: 'Insights & blog', titleAm: 'ጦማርና ሀሳቦች', description: 'ጠቃሚ ጽሑፎች፣ ትንታኔዎችና የእውቀት ልውውጥ።', descriptionEn: 'Useful articles, analysis and knowledge exchange.', label: 'INSIGHTS' },
  { number: '03', title: 'Official notices', titleAm: 'ይፋዊ ማስታወቂያዎች', description: 'በአስተዳዳሪ የተገመገሙ ይፋዊ ማሳወቂያዎችና መግለጫዎች።', descriptionEn: 'Official notices and statements reviewed by administrators.', label: 'ANNOUNCEMENTS' },
];
</script>

<template>
  <div class="arna-site" data-testid="public-home">
    <a class="skip-link" href="#main-content">ወደ ዋናው ይዘት ይሂዱ</a>

    <div class="announcement-bar">
      <div class="site-container announcement-bar__inner">
        <span class="announcement-bar__pulse" aria-hidden="true"></span>
        <p lang="am">የARNA ይፋዊ ድረ ገጽ። የተጸደቀ መረጃ ብቻ እዚህ ይታያል።</p>
        <span class="announcement-bar__english">OFFICIAL CORPORATE WEBSITE</span>
      </div>
    </div>

    <header class="site-header">
      <div class="site-container site-header__inner">
        <RouterLink class="brand" to="/">
          <img class="public-home__emblem" src="/logo.png" alt="" width="43" height="43" />
          <span class="brand__wordmark">
            <strong>ARNA</strong>
            <small>{{ masesBrandLabels.corporateName }}</small>
          </span>
        </RouterLink>

        <nav class="main-nav" aria-label="ዋና አሰሳ">
          <a href="#about">ስለ ARNA</a>
          <RouterLink v-for="page in navigationPages" :key="page.public_id" :to="`/${locale}/${page.slug}`">{{ page.title }}</RouterLink>
          <a href="#principles">እሴቶቻችን</a>
          <a href="#services">አገልግሎቶች</a>
          <a href="#businesses">የንግድ አቅጣጫዎች</a>
          <a href="#updates">ዜናና ጦማር</a>
          <a href="#gallery">ሚዲያ</a>
          <a href="#advertise">ማስታወቂያ</a>
          <RouterLink to="/contribute">ይዘት ያቅርቡ</RouterLink>
        </nav>

        <RouterLink class="header-action" :to="{ path: '/', query: { locale: locale === 'am' ? 'en' : 'am' } }">{{ locale === 'am' ? 'English' : 'አማርኛ' }}</RouterLink>
        <RouterLink class="header-action" to="/verify">
          <span>ሰነድ ያረጋግጡ</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </RouterLink>
      </div>
    </header>

    <main id="main-content">
      <section v-if="corporateHome" class="corporate-home-published" aria-labelledby="corporate-home-title">
        <div class="site-container">
          <h1 id="corporate-home-title">{{ corporateHome.title }}</h1>
          <p v-if="corporateHome.summary">{{ corporateHome.summary }}</p>
          <div v-if="corporateHome.sections.length" class="corporate-home-published__sections">
            <article v-for="(section, index) in corporateHome.sections" :key="section.id ?? index">
              <h2 v-if="sectionText(section, 'title')">{{ sectionText(section, 'title') }}</h2>
              <p v-if="sectionText(section, 'body')">{{ sectionText(section, 'body') }}</p>
            </article>
          </div>
        </div>
      </section>
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero__glow hero__glow--one" aria-hidden="true"></div>
        <div class="hero__glow hero__glow--two" aria-hidden="true"></div>
        <div class="site-container hero__grid">
          <div class="hero__copy">
            <p class="eyebrow"><span></span> ማአሌ አርና <span class="eyebrow__divider">/</span> TRUST · PURPOSE · PROGRESS</p>
            <h1 id="hero-title" lang="am">የጋራ እድገት።<br/><span>በታማኝነት የተመራ።</span></h1>
            <p class="hero__lead" lang="am">
              ወደ ARNA እንኳን በደህና መጡ። ግልጽነትን፣ ተጠያቂነትን እና ዘላቂ እድገትን
              በማዕከል የሚያደርግ የጋራ ጉዞ እየገነባን ነው።
            </p>
            <div class="hero__actions">
              <a class="button button--primary" href="#about">
                <span>ARNAን ይወቁ</span>
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </a>
              <RouterLink class="button button--quiet" to="/verify">
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M10 2.5 16 5v4.7c0 3.7-2.5 6.2-6 7.8-3.5-1.6-6-4.1-6-7.8V5l6-2.5Z" stroke="currentColor" stroke-width="1.4"/><path d="m7 9.8 2 2 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>የአክሲዮን ምስክር ወረቀት ያረጋግጡ</span>
              </RouterLink>
            </div>
            <div class="hero__trustline">
              <span class="hero__trustline-icon" aria-hidden="true">✦</span>
              <p lang="am">መተማመን የሚገነባው በግልጽነት ነው።</p>
            </div>
          </div>

          <div class="hero-art" aria-label="ARNA የጋራ እድገት ምልክት" role="img">
            <div class="hero-art__orbit hero-art__orbit--outer"></div>
            <div class="hero-art__orbit hero-art__orbit--middle"></div>
            <div class="hero-art__orbit hero-art__orbit--inner"></div>
            <div class="hero-art__cross hero-art__cross--horizontal"></div>
            <div class="hero-art__cross hero-art__cross--vertical"></div>
            <div class="hero-art__core">
              <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
                <path d="M60 10 103 35v50L60 110 17 85V35L60 10Z" stroke="currentColor" stroke-width="1.4"/>
                <path d="m34 80 26-49 26 49M45 60h30" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="60" cy="60" r="6" fill="var(--arna-public-accent)"/>
              </svg>
            </div>
            <div class="hero-art__label hero-art__label--top"><span>01</span><b>TRUST</b></div>
            <div class="hero-art__label hero-art__label--right"><span>02</span><b>CLARITY</b></div>
            <div class="hero-art__label hero-art__label--bottom"><span>03</span><b>PROGRESS</b></div>
            <div class="hero-art__caption">
              <span class="hero-art__caption-line"></span>
              <span>BUILT FOR SHARED PROGRESS</span>
            </div>
          </div>
        </div>
        <div class="hero__bottom-rule" aria-hidden="true"><span></span></div>
      </section>

      <section id="about" class="intro-section section-pad" aria-labelledby="about-title">
        <div class="site-container intro-section__grid">
          <div class="section-kicker">
            <span class="section-kicker__number">01</span>
            <span class="section-kicker__label">ABOUT ARNA</span>
          </div>
          <div class="intro-section__content">
            <p class="eyebrow eyebrow--dark">ስለ እኛ</p>
            <h2 id="about-title" lang="am">ሥራን የሚያቀላጥፍ፣<br/>እምነትን የሚያጠናክር <span>ሥርዓት።</span></h2>
            <div class="intro-section__columns">
              <p lang="am">ARNA የድርጅት አሠራርን ከተጠያቂነትና ከግልጽ አስተዳደር ጋር ለማገናኘት የሚያተኩር የዲጂታል ሥርዓት ነው።</p>
              <p lang="am">ይህ ይፋዊ ድረ ገጽ ስለ ድርጅቱ፣ አገልግሎቶቹ እና የተጸደቁ ማስታወቂያዎች መረጃን በአንድ ቦታ ለማቅረብ ይዘጋጃል።</p>
            </div>
          </div>
        </div>
      </section>

      <section id="principles" class="principles-section section-pad" aria-labelledby="principles-title">
        <div class="site-container">
          <div class="section-heading">
            <div>
              <p class="eyebrow eyebrow--dark">የምንመራባቸው እሴቶች</p>
              <h2 id="principles-title" lang="am">መሠረታችን <span>ግልጽ ነው።</span></h2>
            </div>
            <p lang="am">የምንገነባው ሥርዓት በሰዎች እምነት ላይ መመሥረት አለበት።</p>
          </div>
          <div class="principle-grid">
            <article v-for="principle in principles" :key="principle.number" class="principle-card">
              <div class="principle-card__top"><span>{{ principle.number }}</span><span class="principle-card__symbol" aria-hidden="true">↗</span></div>
              <h3 lang="am">{{ principle.titleAm }}</h3>
              <p class="principle-card__english">{{ principle.titleEn }}</p>
              <p class="principle-card__description" lang="am">{{ principle.description }}</p>
              <span class="principle-card__rule" aria-hidden="true"></span>
            </article>
          </div>
        </div>
      </section>

      <section id="services" class="services-section section-pad" aria-labelledby="services-title">
        <div class="site-container">
          <div class="section-heading section-heading--light">
            <div>
              <p class="eyebrow">አገልግሎቶችና መፍትሄዎች</p>
              <h2 id="services-title" lang="am">የምንገነባው <span>ለወደፊት ነው።</span></h2>
            </div>
            <p lang="am">ዝርዝር የአገልግሎት መረጃዎች በይፋ ከጸደቁ በኋላ በዚህ ይታያሉ።</p>
          </div>
          <div v-if="corporateServices.length" class="service-grid">
            <article v-for="service in corporateServices" :key="service.public_id" class="service-card">
              <div class="service-card__top"><span>ARNA</span><span aria-hidden="true">↗</span></div>
              <h3>{{ service.title }}</h3><p class="service-card__description">{{ service.summary || service.body }}</p>
            </article>
          </div>
          <div v-else class="service-grid">
            <article v-for="offering in offerings" :key="offering.number" class="service-card">
              <div class="service-card__top"><span>{{ offering.number }}</span><span aria-hidden="true">↗</span></div>
              <p class="service-card__label" lang="am">{{ offering.label }}</p>
              <h3>{{ offering.title }}</h3>
              <p class="service-card__description" lang="am">{{ offering.description }}</p>
              <div class="service-card__status"><span></span> በመዘጋጀት ላይ</div>
            </article>
          </div>
          <p class="services-section__note" lang="am"><span aria-hidden="true">ⓘ</span> እነዚህ የአገልግሎት ምድቦች የድረ ገጹን መዋቅር ለማሳየት ቀርበዋል፤ የተወሰኑ ምርቶች፣ ዋጋዎች ወይም የግዢ ተግባራት እስኪጸድቁ ድረስ አይታዩም።</p>
        </div>
      </section>


      <section id="businesses" class="businesses-section section-pad" aria-labelledby="businesses-title">
        <div class="site-container">
          <div class="section-heading">
            <div>
              <p class="eyebrow eyebrow--dark">OUR BUSINESS LANDSCAPE</p>
              <h2 id="businesses-title" lang="am">እድሎችን የሚያገናኙ <span>የሥራ አቅጣጫዎች።</span></h2>
            </div>
            <p lang="am">የተረጋገጡ የንግድ ክፍሎችና ኩባንያዎች መገለጫዎች በአስተዳዳሪ ከጸደቁ በኋላ እዚህ ይታያሉ።</p>
          </div>
          <div v-if="corporateBusinesses.length" class="business-grid">
            <article v-for="business in corporateBusinesses" :key="business.public_id" class="business-card">
              <span class="business-card__number">ARNA</span><h3>{{ business.title }}</h3><p class="business-card__description">{{ business.summary || business.body }}</p>
            </article>
          </div>
          <div v-else class="business-grid">
            <article v-for="area in businessAreas" :key="area.number" class="business-card">
              <span class="business-card__number">{{ area.number }}</span>
              <p lang="am">{{ area.titleAm }}</p>
              <h3>{{ area.title }}</h3>
              <p class="business-card__description" lang="am">{{ area.description }}</p>
              <span class="business-card__status">ዝርዝር መረጃ በማረጋገጥ ላይ</span>
            </article>
          </div>
          <p class="businesses-disclaimer" lang="am">ማስታወሻ፦ ከላይ ያሉት ምድቦች የድረ ገጹን መዋቅር ያሳያሉ፤ የተረጋገጡ የሕጋዊ ኩባንያ ስሞች፣ ባለቤትነት ወይም የንግድ ጥያቄዎች አይደሉም።</p>
        </div>
      </section>

      <section id="updates" class="updates-section section-pad" aria-labelledby="updates-title">
        <div class="site-container updates-section__grid">
          <div class="updates-section__intro">
            <p class="eyebrow eyebrow--dark">NEWS · ANNOUNCEMENTS</p>
            <h2 id="updates-title" lang="am">የቅርብ መረጃዎች።<br/><span>ከታመነ ምንጭ።</span></h2>
            <p lang="am">የድርጅቱ ዜናዎች፣ ማስታወቂያዎች እና ይፋዊ ማሻሻያዎች በአስተዳዳሪ ከተጸደቁ በኋላ እዚህ ይታያሉ።</p>
          </div>
          <div v-if="corporateNews.length" class="publication-grid">
            <article v-for="item in corporateNews" :key="item.public_id" class="publication-card">
              <div class="publication-card__top"><span>ARNA</span><span>NEWS</span></div>
              <h3>{{ item.title }}</h3><p class="publication-card__description">{{ item.summary || item.body }}</p>
              <span class="publication-card__status">{{ publishedDate(item.published_at) }}</span>
            </article>
          </div>
          <div v-else-if="publishedContent.length" class="publication-grid">
            <article v-for="item in publishedContent" :key="item.id" class="publication-card">
              <div class="publication-card__top"><span>ARNA JOURNAL</span><span>{{ item.type.replace('_', ' ').toUpperCase() }}</span></div>
              <h3>{{ item.title }}</h3>
              <p class="publication-card__description">{{ item.body.length > 220 ? `${item.body.slice(0, 220)}…` : item.body }}</p>
              <span class="publication-card__status"><span></span> {{ publishedDate(item.published_at) }} · OFFICIAL</span>
            </article>
          </div>
          <div v-else class="publication-grid">
            <article v-for="channel in publicationChannels" :key="channel.number" class="publication-card">
              <div class="publication-card__top"><span>{{ channel.number }}</span><span>{{ channel.label }}</span></div>
              <h3 lang="am">{{ channel.titleAm }}</h3>
              <p class="publication-card__english">{{ channel.title }}</p>
              <p class="publication-card__description" lang="am">{{ channel.description }}</p>
              <span class="publication-card__status"><span></span> የጸደቀ ይዘት ሲኖር ይታያል</span>
            </article>
          </div>
        </div>
      </section>


      <section id="advertise" class="advertising-section" aria-labelledby="advertising-title">
        <div class="site-container advertising-section__inner">
          <div class="advertising-section__mark" aria-hidden="true">AD</div>
          <div class="advertising-section__copy">
            <p class="eyebrow">COMMERCIAL & PARTNERSHIPS</p>
            <h2 id="advertising-title">{{ locale === 'am' ? 'የንግድ እድልዎን ከትክክለኛው ታዳሚ ጋር ያገናኙ።' : 'Reach the right audience with your business.' }}</h2>
            <p>{{ locale === 'am' ? 'የማስታወቂያ ጥያቄዎች ለግምገማ ማቅረብ ይችላሉ። ማንኛውም ማስታወቂያ በግልጽ የስፖንሰር መለያ እና በአስተዳዳሪ ፈቃድ ብቻ ይታተማል።' : 'Advertising submissions are reviewed before publication. Approved ads are clearly labelled as sponsored.' }}</p>
          </div>
          <div class="advertising-section__aside">
            <span>ADVERTISING PLATFORM</span>
            <strong>{{ locale === 'am' ? 'ማቅረቢያ ክፍት · ከፈቃድ በኋላ ህትመት' : 'SUBMISSIONS OPEN · PUBLISHING BY APPROVAL' }}</strong>
          </div>
        </div>
      </section>



      <section id="gallery" class="section-pad" aria-labelledby="gallery-title">
        <div class="site-container">
          <div class="section-heading"><div><p class="eyebrow eyebrow--dark">MEDIA · GALLERY</p><h2 id="gallery-title" lang="am">የARNA ሚዲያ <span>ማዕከል።</span></h2></div><p lang="am">ፎቶዎችና ህትመቶች ከማረጋገጫና ከአስተዳዳሪ ፈቃድ በኋላ ብቻ ይታያሉ።</p></div>
          <div class="publication-grid">
            <article v-for="item in corporateMedia" :key="item.public_id" class="publication-card">
              <img v-if="item.asset_url" :src="item.asset_url" :alt="item.title" loading="lazy" />
              <h3>{{ item.title }}</h3><p>{{ item.summary || item.body }}</p>
            </article>
            <p v-if="!corporateMedia.length" lang="am">በአሁኑ ጊዜ የታተመ ሚዲያ የለም።</p>
          </div>
        </div>
      </section>

      <section id="publications" class="section-pad" aria-labelledby="publications-title">
        <div class="site-container">
          <div class="section-heading"><div><p class="eyebrow eyebrow--dark">PUBLICATIONS · OFFICIAL NOTICES</p><h2 id="publications-title" lang="am">ህትመቶችና <span>ይፋዊ ማስታወቂያዎች።</span></h2></div></div>
          <div class="publication-grid">
            <article v-for="item in [...corporateAnnouncements, ...corporatePublications]" :key="item.public_id" class="publication-card">
              <div class="publication-card__top"><span>{{ item.type.toUpperCase() }}</span><span>{{ publishedDate(item.published_at) }}</span></div>
              <h3>{{ item.title }}</h3><p class="publication-card__description">{{ item.summary || item.body }}</p>
            </article>
            <p v-if="!corporateAnnouncements.length && !corporatePublications.length" lang="am">በአሁኑ ጊዜ የታተሙ ህትመቶች የሉም።</p>
          </div>
        </div>
      </section>

      <section id="opportunities" class="section-pad" aria-labelledby="opportunities-title">
        <div class="site-container">
          <div class="section-heading">
            <div><p class="eyebrow eyebrow--dark">CAREERS · OPPORTUNITIES · MARKETPLACE</p><h2 id="opportunities-title" lang="am">የሚቀጥለውን እድል <span>ከዚህ ይጀምሩ።</span></h2></div>
            <p lang="am">የተጸደቁ የሥራ እድሎች፣ የንግድ ማስታወቂያዎችና የገበያ ዝርዝሮች እዚህ ይታያሉ።</p>
          </div>
          <div class="business-grid">
            <article v-for="item in [...corporateCareers, ...corporateMarket]" :key="item.public_id" class="business-card">
              <span class="business-card__number">{{ item.type.toUpperCase() }}</span><h3>{{ item.title }}</h3><p class="business-card__description">{{ item.summary || item.body }}</p>
            </article>
            <p v-if="!corporateCareers.length && !corporateMarket.length" lang="am">በአሁኑ ጊዜ የታተመ እድል የለም። አዲስ ዝርዝሮች ከግምገማ በኋላ ይታያሉ።</p>
          </div>
          <form class="public-opportunity-form" @submit.prevent="sendOpportunity">
            <h3>{{ locale === 'am' ? 'የሥራ፣ የማስታወቂያ ወይም የገበያ ማቅረቢያ' : 'Submit a career, advertising or marketplace listing' }}</h3>
            <label>{{ locale === 'am' ? 'ምድብ' : 'Category' }} <select v-model="opportunity.type"><option value="career">{{ locale === 'am' ? 'ሥራ' : 'Career' }}</option><option value="opportunity">{{ locale === 'am' ? 'እድል' : 'Opportunity' }}</option><option value="advertisement">{{ locale === 'am' ? 'ማስታወቂያ' : 'Advertisement' }}</option><option value="marketplace">{{ locale === 'am' ? 'የገበያ ዝርዝር' : 'Marketplace listing' }}</option></select></label>
            <label>{{ locale === 'am' ? 'ስም' : 'Name' }} <input v-model="opportunity.name" required maxlength="160" /></label>
            <label>{{ locale === 'am' ? 'ኢሜይል' : 'Email' }} <input v-model="opportunity.email" required type="email" maxlength="190" /></label>
            <label>{{ locale === 'am' ? 'ድርጅት' : 'Organization' }} <input v-model="opportunity.organization" maxlength="180" /></label>
            <label>{{ locale === 'am' ? 'ርዕስ' : 'Title' }} <input v-model="opportunity.title" required maxlength="180" /></label>
            <label>{{ locale === 'am' ? 'ዝርዝር' : 'Description' }} <textarea v-model="opportunity.description" required maxlength="12000" rows="3" /></label>
            <button type="submit" :disabled="submitting">{{ locale === 'am' ? 'ለግምገማ ያቅርቡ' : 'Submit for review' }}</button>
            <p role="status" aria-live="polite">{{ opportunityStatus }}</p>
          </form>
        </div>
      </section>

      <section id="contact" class="section-pad" aria-labelledby="contact-title">
        <div class="site-container">
          <div class="section-heading"><div><p class="eyebrow eyebrow--dark">CONTACT · INQUIRIES</p><h2 id="contact-title">{{ locale === 'am' ? 'ከእኛ ጋር ይገናኙ።' : 'Get in touch with ARNA.' }}</h2></div></div>
          <form class="public-opportunity-form" @submit.prevent="sendInquiry">
            <label>{{ locale === 'am' ? 'ምድብ' : 'Inquiry type' }} <select v-model="inquiry.inquiry_type"><option value="general">አጠቃላይ</option><option value="investor">ባለአክሲዮን / ኢንቨስተር</option><option value="partnership">አጋርነት</option><option value="media">ሚዲያ</option><option value="career">ሥራ</option><option value="advertising">ማስታወቂያ</option><option value="marketplace">ገበያ</option></select></label>
            <label>{{ locale === 'am' ? 'ስም' : 'Name' }} <input v-model="inquiry.name" required maxlength="160" /></label>
            <label>{{ locale === 'am' ? 'ኢሜይል' : 'Email' }} <input v-model="inquiry.email" required type="email" maxlength="190" /></label>
            <label>{{ locale === 'am' ? 'ስልክ' : 'Phone' }} <input v-model="inquiry.phone" maxlength="50" /></label>
            <label>{{ locale === 'am' ? 'ርዕስ' : 'Subject' }} <input v-model="inquiry.subject" required maxlength="200" /></label>
            <label>{{ locale === 'am' ? 'መልዕክት' : 'Message' }} <textarea v-model="inquiry.message" required maxlength="10000" rows="4" /></label>
            <label class="public-opportunity-form__consent"><input v-model="inquiry.consent" type="checkbox" required /> {{ locale === 'am' ? 'የመልዕክቴን መረጃ ለጥያቄዬ ምላሽ ለመስጠት እንዲጠቀሙበት እስማማለሁ።' : 'I consent to ARNA using this information to respond to my inquiry.' }}</label>
            <label class="public-opportunity-form__trap" aria-hidden="true">Website <input v-model="inquiry.website" tabindex="-1" autocomplete="off" /></label>
            <button type="submit" :disabled="submitting || !inquiry.consent">{{ locale === 'am' ? 'መልዕክብ ይላኩ' : 'Send inquiry' }}</button>
            <p role="status" aria-live="polite">{{ inquiryStatus }}</p>
          </form>
        </div>
      </section>

      <section class="verification-banner" aria-labelledby="verification-title">
        <div class="site-container verification-banner__inner">
          <div class="verification-banner__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none"><path d="M24 4 40 11v12c0 10-7 17-16 21C15 40 8 33 8 23V11L24 4Z" stroke="currentColor" stroke-width="1.6"/><path d="m16 24 5 5 11-12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="verification-banner__copy">
            <p class="eyebrow">PUBLIC VERIFICATION</p>
            <h2 id="verification-title" lang="am">የአክሲዮን ምስክር ወረቀት እውነተኛነት ያረጋግጡ።</h2>
            <p lang="am">የARNA የአክሲዮን ምስክር ወረቀት ማጣቀሻ ቁጥርን በመጠቀም የሰነዱን ሁኔታ ይፈትሹ።</p>
          </div>
          <RouterLink class="button button--gold" to="/verify">
            <span>ሰነድ ያረጋግጡ</span>
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </RouterLink>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="site-container">
        <div class="site-footer__main">
          <div class="site-footer__brand">
            <RouterLink class="brand brand--footer" to="/">
              <img class="public-home__emblem" src="/logo.png" alt="" width="43" height="43" />
              <span class="brand__wordmark"><strong>ARNA</strong><small>{{ masesBrandLabels.corporateName }}</small></span>
            </RouterLink>
            <p lang="am">በመተማመን የሚገነባ የጋራ እድገት።</p>
          </div>
          <div class="site-footer__links">
            <div>
              <h3 lang="am">ይወቁን</h3>
              <a href="#about">ስለ ARNA</a>
              <a href="#principles">እሴቶቻችን</a>
              <a href="#services">አገልግሎቶች</a>
              <a href="#businesses">የንግድ አቅጣጫዎች</a>
            </div>
            <div>
              <h3 lang="am">ይፋዊ አገናኞች</h3>
              <RouterLink to="/verify">ሰነድ ማረጋገጫ</RouterLink>
              <RouterLink to="/legal">ሕጋዊ መረጃ</RouterLink>
              <RouterLink to="/contribute">ይዘት ያቅርቡ</RouterLink>
              <a href="#updates">ዜናዎችና ማስታወቂያዎች</a>
              <a href="#advertise">ማስታወቂያ ያስተዋውቁ</a>
              <a href="#publications">ህትመቶች</a>
              <a href="#opportunities">የሥራና የገበያ እድሎች</a>
              <a href="#contact">ያግኙን</a>
            </div>
          </div>
        </div>
        <div class="site-footer__bottom">
          <span>© {{ year }} ARNA · Maale Arna</span>
          <span lang="am">የተጸደቀ መረጃ ብቻ። ግልጽነት ሁልጊዜ።</span>
          <a href="#main-content">ወደ ላይ ↑</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.public-opportunity-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem; max-width: 820px; margin-block: 1.5rem; padding: 1.25rem; border: 1px solid var(--arna-line); border-radius: .75rem; background: var(--arna-public-page-surface); }
.public-opportunity-form h3, .public-opportunity-form > p, .public-opportunity-form button { grid-column: 1 / -1; }
.public-opportunity-form label { display: grid; gap: .3rem; font-weight: 600; }
.public-opportunity-form input, .public-opportunity-form select, .public-opportunity-form textarea { width: 100%; min-width: 0; padding: .65rem; border: 1px solid var(--arna-line); border-radius: .4rem; background: var(--arna-paper); color: var(--arna-ink); }
.public-opportunity-form button { min-height: 44px; padding: .65rem 1rem; border: 0; border-radius: .4rem; background: var(--arna-navy); color: white; }
.public-opportunity-form__consent { grid-column: 1 / -1; display: flex !important; align-items: flex-start; gap: .6rem !important; font-weight: 400 !important; line-height: 1.6; }
.public-opportunity-form__consent input { width: auto; margin-top: .25rem; }
.public-opportunity-form__trap { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
@media (max-width: 680px) { .public-opportunity-form { grid-template-columns: 1fr; } }
.arna-site {
  --arna-navy: var(--arna-public-brand-anchor);
  --arna-deep: var(--arna-color-enterprise-blue);
  --arna-blue: var(--arna-public-action);
  --arna-gold: var(--arna-public-accent);
  --arna-paper: var(--arna-public-page-surface);
  --arna-ink: var(--arna-public-text-primary);
  --arna-muted: var(--arna-public-text-secondary);
  --arna-line: var(--arna-public-border-subtle);
  min-height: 100vh;
  overflow: clip;
  color: var(--arna-ink);
  background: var(--arna-paper);
  font-family: "Noto Sans Ethiopic", "Abyssinica SIL", Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.arna-site * { box-sizing: border-box; }
.arna-site a { color: inherit; }
.site-container { width: min(100% - 3.5rem, 1200px); margin-inline: auto; }
.skip-link {
  position: absolute; z-index: 20; inset-block-start: .75rem; inset-inline-start: .75rem;
  padding: .75rem 1rem; transform: translateY(-180%); border-radius: .4rem;
  color: white !important; background: var(--arna-navy); font-size: .9rem;
}
.skip-link:focus { transform: translateY(0); }
.announcement-bar { color: var(--arna-public-page-surface); background: var(--arna-deep); }
.announcement-bar__inner { min-height: 35px; display: flex; align-items: center; gap: .65rem; }
.announcement-bar__pulse, .service-card__status span, .updates-empty__status span {
  width: 6px; height: 6px; flex: 0 0 auto; border-radius: 50%; background: var(--arna-gold);
}
.announcement-bar__inner p { margin: 0; font-size: .72rem; letter-spacing: .015em; }
.announcement-bar__english { margin-inline-start: auto; color: var(--arna-color-cloud-surface); font-size: .58rem; letter-spacing: .12em; white-space: nowrap; }
.site-header { position: relative; z-index: 5; background: var(--arna-public-page-surface); border-bottom: 1px solid var(--arna-line); }
.site-header__inner { min-height: 88px; display: flex; align-items: center; justify-content: space-between; gap: 2rem; }
.brand { display: inline-flex; align-items: center; gap: .7rem; flex: 0 0 auto; text-decoration: none; }
.brand__symbol { display: grid; place-items: center; width: 43px; height: 43px; color: var(--arna-navy); }
.brand__symbol svg { display: block; width: 100%; height: 100%; }
.public-home__emblem { display: block; width: 43px; height: 43px; flex: 0 0 auto; object-fit: contain; }
.brand__wordmark { display: grid; gap: .12rem; }
.brand__wordmark strong { color: var(--arna-navy); font-family: Georgia, serif; font-size: 1.24rem; letter-spacing: .19em; line-height: 1; }
.brand__wordmark small { color: var(--arna-public-text-secondary); font-size: .55rem; letter-spacing: .16em; }
.main-nav { display: flex; align-items: center; gap: clamp(1rem, 2.5vw, 2.25rem); }
.main-nav a { position: relative; padding-block: .6rem; color: var(--arna-public-text-primary); font-size: .84rem; text-decoration: none; transition: color .18s ease; }
.main-nav a::after { position: absolute; inset-inline: 0; inset-block-end: .1rem; height: 1px; content: ""; transform: scaleX(0); transform-origin: right; background: var(--arna-gold); transition: transform .18s ease; }
.main-nav a:hover, .main-nav a:focus-visible { color: var(--arna-navy); }
.main-nav a:hover::after, .main-nav a:focus-visible::after { transform: scaleX(1); transform-origin: left; }
.header-action { display: inline-flex; align-items: center; justify-content: center; gap: .55rem; min-height: 42px; padding: .6rem .85rem; border: 1px solid rgba(16,45,77,.22); color: var(--arna-navy) !important; font-size: .78rem; font-weight: 650; text-decoration: none; white-space: nowrap; transition: background .18s ease, color .18s ease; }
.header-action svg, .button svg { width: 18px; height: 18px; flex: 0 0 auto; }
.header-action:hover { color: white !important; background: var(--arna-navy); }
.hero { position: relative; isolation: isolate; color: var(--arna-public-page-surface); background: var(--arna-deep); }
.hero::before { position: absolute; z-index: -1; inset: 0; content: ""; opacity: .17; background-image: linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px); background-size: 64px 64px; mask-image: linear-gradient(90deg, black, transparent 90%); }
.hero__glow { position: absolute; z-index: -1; width: 35rem; height: 35rem; border-radius: 50%; pointer-events: none; }
.hero__glow--one { inset-block-start: -20rem; inset-inline-end: 4%; background: radial-gradient(circle, rgba(35,105,166,.34), transparent 70%); }
.hero__glow--two { inset-block-end: -22rem; inset-inline-start: 14%; background: radial-gradient(circle, rgba(213,171,85,.12), transparent 70%); }
.hero__grid { min-height: 590px; display: grid; grid-template-columns: 1.05fr .95fr; align-items: center; gap: 2rem; padding-block: 4.5rem 5rem; }
.hero__copy { position: relative; z-index: 2; padding-block: 1rem; }
.eyebrow { display: flex; align-items: center; gap: .6rem; margin: 0 0 1.35rem; color: var(--arna-public-accent); font-size: .67rem; font-weight: 700; letter-spacing: .12em; line-height: 1.6; }
.eyebrow > span:first-child { width: 22px; height: 1px; background: var(--arna-gold); }
.eyebrow__divider { color: var(--arna-public-text-secondary); }
.hero h1 { max-width: 680px; margin: 0; color: var(--arna-public-page-surface); font-size: clamp(2.65rem, 5vw, 4.7rem); font-weight: 650; letter-spacing: -.045em; line-height: 1.38; }
.hero h1 span { color: var(--arna-public-accent); }
.hero__lead { max-width: 560px; margin: 1.35rem 0 0; color: var(--arna-color-cloud-surface); font-size: clamp(.98rem, 1.5vw, 1.12rem); line-height: 2; }
.hero__actions { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin-block-start: 2rem; }
.button { display: inline-flex; min-height: 48px; align-items: center; justify-content: center; gap: .7rem; padding: .75rem 1.1rem; border: 1px solid transparent; font-size: .83rem; font-weight: 700; text-decoration: none; transition: transform .18s ease, background .18s ease, border-color .18s ease; }
.button:hover { transform: translateY(-2px); }
.button--primary { color: var(--arna-deep) !important; background: var(--arna-gold); }
.button--primary:hover { background: var(--arna-public-accent); }
.button--quiet { border-color: rgba(240,245,250,.24); color: var(--arna-public-page-surface) !important; background: rgba(255,255,255,.035); }
.button--quiet:hover { border-color: rgba(240,245,250,.58); background: rgba(255,255,255,.08); }
.hero__trustline { display: flex; align-items: center; gap: .7rem; margin-block-start: 2.25rem; color: var(--arna-color-cloud-surface); }
.hero__trustline-icon { color: var(--arna-gold); font-size: 1rem; }
.hero__trustline p { margin: 0; font-size: .8rem; }
.hero-art { position: relative; width: min(100%, 510px); aspect-ratio: 1; justify-self: end; display: grid; place-items: center; }
.hero-art::before, .hero-art::after { position: absolute; content: ""; border: 1px solid rgba(213,171,85,.17); border-radius: 50%; }
.hero-art::before { inset: 8%; }
.hero-art::after { inset: 17%; border-style: dashed; border-color: rgba(182,203,220,.2); }
.hero-art__orbit { position: absolute; border: 1px solid rgba(213,171,85,.45); border-radius: 50%; transform: rotate(-26deg); }
.hero-art__orbit--outer { inset: 3%; border-left-color: transparent; border-bottom-color: rgba(213,171,85,.12); }
.hero-art__orbit--middle { inset: 14%; transform: rotate(35deg); border-top-color: transparent; border-right-color: rgba(182,203,220,.3); }
.hero-art__orbit--inner { inset: 25%; border-color: rgba(182,203,220,.18); }
.hero-art__cross { position: absolute; background: rgba(182,203,220,.16); }
.hero-art__cross--horizontal { width: 90%; height: 1px; }
.hero-art__cross--vertical { width: 1px; height: 90%; }
.hero-art__core { z-index: 1; display: grid; place-items: center; width: 32%; aspect-ratio: 1; border: 1px solid rgba(213,171,85,.65); border-radius: 50%; color: var(--arna-public-surface-soft); background: radial-gradient(circle at 35% 25%, var(--arna-public-brand-anchor), var(--arna-color-enterprise-blue) 72%); box-shadow: 0 0 0 12px rgba(213,171,85,.035), 0 0 65px rgba(35,105,166,.24); }
.hero-art__core svg { width: 62%; height: 62%; }
.hero-art__label { position: absolute; z-index: 2; display: flex; align-items: center; gap: .45rem; padding: .5rem .65rem; border: 1px solid rgba(182,203,220,.2); color: var(--arna-color-cloud-surface); background: rgba(10,32,56,.82); font-size: .55rem; letter-spacing: .12em; }
.hero-art__label span { color: var(--arna-gold); font-size: .58rem; }
.hero-art__label--top { inset-block-start: 10%; inset-inline-start: 17%; }
.hero-art__label--right { inset-block-start: 47%; inset-inline-end: -1%; }
.hero-art__label--bottom { inset-block-end: 10%; inset-inline-start: 27%; }
.hero-art__caption { position: absolute; inset-block-end: 1%; inset-inline-end: 0; display: flex; align-items: center; gap: .6rem; color: var(--arna-public-text-secondary); font-size: .52rem; letter-spacing: .16em; }
.hero-art__caption-line { width: 25px; height: 1px; background: var(--arna-gold); }
.hero__bottom-rule { position: absolute; inset-inline: 0; inset-block-end: 0; height: 3px; background: rgba(255,255,255,.05); }
.hero__bottom-rule span { display: block; width: 21%; height: 100%; background: var(--arna-gold); }
.section-pad { padding-block: clamp(4rem, 8vw, 7rem); }
.intro-section { background: var(--arna-public-page-surface); }
.intro-section__grid { display: grid; grid-template-columns: .45fr 1.55fr; gap: 2rem; }
.section-kicker { display: flex; align-items: flex-start; gap: .75rem; padding-block-start: .35rem; color: var(--arna-public-text-secondary); }
.section-kicker__number { color: var(--arna-public-accent); font-size: .8rem; font-weight: 800; letter-spacing: .08em; }
.section-kicker__label { font-size: .62rem; letter-spacing: .12em; }
.eyebrow--dark { color: var(--arna-public-accent); }
.intro-section h2, .section-heading h2, .updates-section h2 { margin: 0; color: var(--arna-navy); font-size: clamp(2rem, 3.5vw, 3.1rem); font-weight: 650; letter-spacing: -.04em; line-height: 1.5; }
.intro-section h2 span, .section-heading h2 span, .updates-section h2 span { color: var(--arna-public-accent); }
.intro-section__columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-block-start: 1.5rem; padding-block-start: 1.4rem; border-top: 1px solid var(--arna-line); }
.intro-section__columns p { margin: 0; color: var(--arna-public-text-secondary); font-size: .94rem; line-height: 2; }
.principles-section { background: var(--arna-public-surface-soft); }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-block-end: 2.5rem; }
.section-heading .eyebrow { margin-block-end: .7rem; }
.section-heading > p { max-width: 360px; margin: 0 0 .45rem; color: var(--arna-public-text-secondary); font-size: .9rem; line-height: 1.9; }
.principle-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; }
.principle-card { position: relative; min-height: 270px; padding: 1.55rem 1.55rem 1.7rem; border: 1px solid rgba(16,45,77,.11); background: rgba(251,250,246,.8); }
.principle-card__top, .service-card__top { display: flex; align-items: center; justify-content: space-between; color: var(--arna-public-accent); font-size: .7rem; font-weight: 750; letter-spacing: .12em; }
.principle-card__symbol { display: grid; place-items: center; width: 28px; height: 28px; border: 1px solid rgba(16,45,77,.16); border-radius: 50%; color: var(--arna-navy); font-size: .9rem; }
.principle-card h3 { margin: 1.45rem 0 .1rem; color: var(--arna-navy); font-size: 1.5rem; font-weight: 700; }
.principle-card__english { margin: 0; color: var(--arna-public-accent); font-size: .68rem; font-weight: 750; letter-spacing: .12em; text-transform: uppercase; }
.principle-card__description { margin: .9rem 0 1.5rem; color: var(--arna-public-text-secondary); font-size: .85rem; line-height: 1.9; }
.principle-card__rule { position: absolute; inset-inline: 1.55rem; inset-block-end: 0; height: 3px; transform: scaleX(.22); transform-origin: left; background: var(--arna-gold); transition: transform .2s ease; }
.principle-card:hover .principle-card__rule { transform: scaleX(1); }
.services-section { color: var(--arna-public-page-surface); background: var(--arna-navy); }
.section-heading--light h2 { color: var(--arna-public-page-surface); }
.section-heading--light h2 span { color: var(--arna-gold); }
.section-heading--light > p { color: var(--arna-color-cloud-surface); }
.service-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; }
.service-card { display: flex; min-height: 310px; flex-direction: column; padding: 1.45rem; border: 1px solid rgba(230,238,245,.17); background: linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.015)); }
.service-card__top { color: var(--arna-gold); }
.service-card__top span:last-child { font-size: 1.1rem; }
.service-card__label { margin: 1.6rem 0 .4rem; color: var(--arna-public-accent); font-size: .77rem; line-height: 1.7; }
.service-card h3 { margin: 0; color: var(--arna-public-page-surface); font-size: 1.18rem; font-weight: 650; }
.service-card__description { margin: .9rem 0 1.5rem; color: var(--arna-color-cloud-surface); font-size: .85rem; line-height: 1.9; }
.service-card__status { display: inline-flex; align-items: center; gap: .5rem; align-self: flex-start; margin-block-start: auto; padding: .45rem .6rem; border: 1px solid rgba(213,171,85,.28); color: var(--arna-public-accent-soft); font-size: .69rem; }
.service-card__status span { width: 5px; height: 5px; }
.services-section__note { display: flex; gap: .55rem; align-items: flex-start; margin: 1.4rem 0 0; color: var(--arna-color-cloud-surface); font-size: .74rem; line-height: 1.9; }
.services-section__note span { color: var(--arna-gold); }
.updates-section { background: var(--arna-public-page-surface); }
.updates-section__grid { display: grid; grid-template-columns: .85fr 1.15fr; align-items: center; gap: clamp(2rem, 6vw, 6rem); }
.updates-section__intro > p:last-child { max-width: 430px; margin: 1.2rem 0 0; color: var(--arna-public-text-secondary); font-size: .9rem; line-height: 2; }
.updates-empty { padding: clamp(1.5rem, 4vw, 2.75rem); border: 1px solid var(--arna-line); background: var(--arna-public-page-surface); }
.updates-empty__icon { display: grid; place-items: center; width: 48px; height: 48px; margin-block-end: 1.2rem; color: var(--arna-navy); }
.updates-empty__icon svg { width: 100%; height: 100%; }
.updates-empty__label { margin: 0 0 .7rem; color: var(--arna-public-accent); font-size: .62rem; font-weight: 800; letter-spacing: .14em; }
.updates-empty h3 { margin: 0; color: var(--arna-navy); font-size: 1.35rem; line-height: 1.7; }
.updates-empty > p:not(.updates-empty__label) { margin: .6rem 0 1.25rem; color: var(--arna-public-text-secondary); font-size: .84rem; line-height: 1.9; }
.updates-empty__status { display: inline-flex; align-items: center; gap: .55rem; color: var(--arna-public-text-secondary); font-size: .7rem; }
.updates-empty__status span { background: var(--arna-public-accent); }
.verification-banner { color: var(--arna-public-page-surface); background: var(--arna-public-brand-anchor); }
.verification-banner__inner { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 1.5rem; padding-block: 2.4rem; }
.verification-banner__icon { display: grid; place-items: center; width: 58px; height: 58px; border: 1px solid rgba(213,171,85,.45); border-radius: 50%; color: var(--arna-gold); }
.verification-banner__icon svg { width: 34px; height: 34px; }
.verification-banner__copy .eyebrow { margin: 0 0 .35rem; font-size: .58rem; }
.verification-banner__copy h2 { margin: 0; font-size: clamp(1.05rem, 2vw, 1.4rem); font-weight: 650; line-height: 1.8; }
.verification-banner__copy p:last-child { margin: .25rem 0 0; color: var(--arna-color-cloud-surface); font-size: .8rem; line-height: 1.8; }
.button--gold { color: var(--arna-deep) !important; background: var(--arna-gold); white-space: nowrap; }
.button--gold:hover { background: var(--arna-public-accent); }
.site-footer { color: var(--arna-color-cloud-surface); background: var(--arna-color-enterprise-blue); }
.site-footer__main { display: flex; justify-content: space-between; gap: 3rem; padding-block: 3rem; }
.brand--footer .brand__wordmark strong { color: var(--arna-public-page-surface); }
.brand--footer .brand__wordmark small { color: var(--arna-public-text-secondary); }
.brand--footer .brand__symbol { color: var(--arna-public-accent); }
.site-footer__brand > p { margin: .85rem 0 0; color: var(--arna-color-cloud-surface); font-size: .8rem; }
.site-footer__links { display: flex; gap: clamp(2.5rem, 7vw, 6rem); }
.site-footer__links > div { display: grid; align-content: start; gap: .75rem; }
.site-footer__links h3 { margin: 0 0 .2rem; color: var(--arna-public-accent); font-size: .8rem; font-weight: 700; }
.site-footer__links a { color: var(--arna-color-cloud-surface); font-size: .78rem; text-decoration: none; }
.site-footer__links a:hover { color: white; text-decoration: underline; text-underline-offset: .25rem; }
.site-footer__bottom { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 58px; border-top: 1px solid rgba(220,231,240,.13); color: var(--arna-public-text-secondary); font-size: .69rem; }
.site-footer__bottom a { color: var(--arna-color-cloud-surface); text-decoration: none; white-space: nowrap; }
.site-footer__bottom a:hover { color: white; }
:where(.arna-site a, .arna-site button):focus-visible { outline: 3px solid var(--arna-public-accent); outline-offset: 3px; }
@media (max-width: 1000px) {
  .site-header__inner { gap: 1rem; }
  .main-nav { gap: 1rem; }
  .main-nav a { font-size: .77rem; }
  .hero__grid { min-height: 530px; grid-template-columns: 1.1fr .9fr; gap: .5rem; }
  .hero-art { width: 110%; margin-inline-end: -5%; }
  .hero-art__label--right { inset-inline-end: -2%; }
  .updates-section__grid { gap: 2.5rem; }
}
@media (max-width: 760px) {
  .site-container { width: min(100% - 2rem, 1200px); }
  .announcement-bar__inner { min-height: 38px; }
  .announcement-bar__inner p { font-size: .66rem; }
  .announcement-bar__english { display: none; }
  .site-header__inner { min-height: 76px; flex-wrap: wrap; padding-block: .85rem; }
  .brand__symbol, .public-home__emblem { width: 38px; height: 38px; }
  .brand__wordmark strong { font-size: 1.12rem; }
  .main-nav { order: 3; width: 100%; justify-content: space-between; gap: .5rem; overflow-x: auto; padding-block: .25rem .1rem; }
  .main-nav a { flex: 0 0 auto; font-size: .75rem; }
  .header-action { margin-inline-start: auto; min-height: 38px; padding: .5rem .65rem; font-size: .7rem; }
  .header-action svg { width: 16px; height: 16px; }
  .hero__grid { min-height: auto; grid-template-columns: 1fr; padding-block: 4rem 3rem; }
  .hero__copy { padding: 0; }
  .hero h1 { font-size: clamp(2.45rem, 8vw, 4rem); }
  .hero__lead { max-width: 640px; }
  .hero-art { width: min(100%, 420px); margin: 1.2rem auto 0; justify-self: center; }
  .hero-art__label--right { inset-inline-end: -1%; }
  .intro-section__grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .section-kicker { padding-block-start: 0; }
  .section-heading { align-items: flex-start; flex-direction: column; gap: .8rem; }
  .section-heading > p { max-width: 540px; }
  .principle-grid, .service-grid { grid-template-columns: 1fr; }
  .principle-card { min-height: 0; }
  .principle-card__description { max-width: 520px; }
  .service-card { min-height: 0; }
  .updates-section__grid { grid-template-columns: 1fr; }
  .verification-banner__inner { grid-template-columns: auto 1fr; gap: 1rem; }
  .verification-banner__icon { width: 48px; height: 48px; }
  .verification-banner__copy { min-width: 0; }
  .verification-banner .button { grid-column: 1 / -1; justify-self: start; }
  .site-footer__main { flex-direction: column; gap: 2.5rem; }
}
@media (max-width: 480px) {
  .site-container { width: min(100% - 1.5rem, 1200px); }
  .announcement-bar__inner { gap: .45rem; }
  .announcement-bar__inner p { font-size: .61rem; line-height: 1.6; }
  .header-action span { max-width: 7rem; line-height: 1.4; white-space: normal; }
  .main-nav { gap: .9rem; }
  .main-nav a { font-size: .7rem; }
  .hero__grid { padding-block: 3rem 2.5rem; }
  .eyebrow { font-size: .58rem; letter-spacing: .08em; }
  .hero h1 { font-size: clamp(2.15rem, 9vw, 2.8rem); }
  .hero__lead { font-size: .91rem; line-height: 1.9; }
  .hero__actions { align-items: stretch; flex-direction: column; }
  .button { width: 100%; font-size: .78rem; }
  .hero__trustline { margin-block-start: 1.5rem; }
  .hero-art { width: 105%; margin-inline: -2.5%; }
  .hero-art__label { padding: .4rem .45rem; font-size: .48rem; }
  .hero-art__caption { font-size: .43rem; }
  .intro-section__columns { grid-template-columns: 1fr; gap: 1rem; }
  .intro-section h2, .section-heading h2, .updates-section h2 { font-size: 2rem; }
  .principle-card, .service-card { padding: 1.25rem; }
  .verification-banner__inner { grid-template-columns: 1fr; }
  .verification-banner__icon { width: 46px; height: 46px; }
  .verification-banner .button { grid-column: auto; }
  .site-footer__links { gap: 1.6rem; }
  .site-footer__bottom { align-items: flex-start; flex-direction: column; justify-content: center; padding-block: 1rem; gap: .55rem; }
}

.businesses-section { background: var(--arna-public-surface-soft); }
.business-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 1rem; }
.business-card { min-height: 260px; display: flex; flex-direction: column; padding: 1.5rem; border: 1px solid var(--arna-line); background: var(--arna-public-page-surface); }
.business-card__number { color: var(--arna-public-accent); font-size: .72rem; font-weight: 800; letter-spacing: .12em; }
.business-card > p:first-of-type { margin: 1.5rem 0 .35rem; color: var(--arna-public-action); font-size: .82rem; }
.business-card h3 { margin: 0; color: var(--arna-navy); font-size: 1.18rem; }
.business-card__description { margin: .8rem 0 1.2rem; color: var(--arna-public-text-secondary); font-size: .83rem; line-height: 1.9; }
.business-card__status { margin-block-start: auto; color: var(--arna-public-text-secondary); font-size: .68rem; }
.businesses-disclaimer { margin: 1.2rem 0 0; color: var(--arna-public-text-secondary); font-size: .72rem; line-height: 1.8; }
.publication-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: .75rem; }
.publication-card { min-height: 270px; display: flex; flex-direction: column; padding: 1.35rem; border: 1px solid var(--arna-line); background: var(--arna-public-surface); }
.publication-card__top { display: flex; justify-content: space-between; gap: .5rem; color: var(--arna-public-accent); font-size: .61rem; font-weight: 800; letter-spacing: .1em; }
.publication-card h3 { margin: 1.5rem 0 .15rem; color: var(--arna-navy); font-size: 1.25rem; }
.publication-card__english { margin: 0; color: var(--arna-public-action); font-size: .68rem; font-weight: 700; }
.publication-card__description { margin: .8rem 0 1.1rem; color: var(--arna-public-text-secondary); font-size: .82rem; line-height: 1.85; }
.publication-card__status { display: flex; align-items: center; gap: .45rem; margin-block-start: auto; color: var(--arna-public-text-secondary); font-size: .65rem; }
.publication-card__status span { width: 6px; height: 6px; border-radius: 50%; background: var(--arna-public-accent); }
.advertising-section { padding-block: clamp(2.5rem,5vw,4rem); color: var(--arna-public-page-surface); background: var(--arna-public-brand-anchor); }
.advertising-section__inner { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 1.5rem; }
.advertising-section__mark { display: grid; place-items: center; width: 58px; height: 58px; border: 1px solid rgba(212,160,23,.65); border-radius: 50%; color: var(--arna-public-accent); font-size: .95rem; font-weight: 800; letter-spacing: .1em; }
.advertising-section__copy .eyebrow { margin: 0 0 .45rem; font-size: .6rem; }
.advertising-section__copy h2 { max-width: 680px; margin: 0; color: white; font-size: clamp(1.25rem,2.5vw,1.8rem); line-height: 1.6; }
.advertising-section__copy h2 span { color: var(--arna-public-accent); }
.advertising-section__copy > p:last-child { max-width: 680px; margin: .5rem 0 0; color: var(--arna-color-cloud-surface); font-size: .8rem; line-height: 1.9; }
.advertising-section__aside { display: grid; gap: .4rem; min-width: 180px; padding-inline-start: 1.2rem; border-inline-start: 1px solid rgba(255,255,255,.2); }
.advertising-section__aside span { color: var(--arna-public-accent); font-size: .58rem; letter-spacing: .1em; }
.advertising-section__aside strong { color: white; font-size: .7rem; line-height: 1.6; }
@media(max-width:760px) {
 .business-grid,.publication-grid { grid-template-columns: 1fr; }
 .business-card,.publication-card { min-height: 0; }
 .advertising-section__inner { grid-template-columns: auto 1fr; align-items: start; }
 .advertising-section__aside { grid-column: 1 / -1; margin-inline-start: 4.25rem; padding: .8rem 0 0; border-inline-start: 0; border-top: 1px solid rgba(255,255,255,.2); }
}

@media (prefers-reduced-motion: reduce) {
  .arna-site *, .arna-site *::before, .arna-site *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}

/* ============================================================================
   ARNA UI enhancement — responsive navigation and intermediate-width grids
   ----------------------------------------------------------------------------
   Keep every public destination visible and keyboard reachable on phones.
   The previous single-line overflow strip concealed links off-screen and
   provided no indication that additional destinations were available.
   ============================================================================ */
@media (min-width: 761px) and (max-width: 1000px) {
  .business-grid,
  .publication-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .main-nav {
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: .2rem .55rem;
    overflow: visible;
    padding-block: .45rem .2rem;
  }

  .main-nav a {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: .35rem .55rem;
    border-radius: var(--mases-radius-sm, .25rem);
    white-space: normal;
    line-height: 1.55;
  }

  .main-nav a:hover,
  .main-nav a:focus-visible {
    background: var(--arna-public-surface-soft);
  }
}

@media (max-width: 480px) {
  .site-header__inner {
    align-items: center;
    column-gap: .65rem;
  }

  .main-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
    gap: .2rem .4rem;
  }

  .main-nav a {
    min-width: 0;
    padding-inline: .35rem;
    font-size: .72rem;
    overflow-wrap: anywhere;
  }

  .header-action {
    max-width: 48%;
    white-space: normal;
    text-align: center;
  }

  .hero-art {
    max-width: 100%;
  }
}

</style>
