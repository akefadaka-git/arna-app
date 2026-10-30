<script setup lang="ts">
import '@/styles/reset.css';
import '@/styles/tokens.css';
import '@/styles/public-accessibility-overrides.css';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '@/core/api/client';
import { masesBrandLabels } from '@/router/shell-labels';

const year = new Date().getFullYear();

interface PublishedContent {
  readonly id: string;
  readonly type: 'news' | 'article' | 'announcement' | 'press_release';
  readonly title: string;
  readonly body: string;
  readonly published_at: string | null;
}

const publishedContent = ref<PublishedContent[]>([]);

onMounted(async () => {
  try {
    const page = await api.get<{ data: PublishedContent[] }>('/api/public/content', {
      params: { per_page: 3 },
    });
    publishedContent.value = page.data;
  } catch {
    // The public homepage remains usable while the API is unavailable.
    // No unapproved or locally fabricated content is substituted.
    publishedContent.value = [];
  }
});

function publishedDate(value: string | null): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('am-ET', { dateStyle: 'medium' }).format(new Date(value));
}


const principles = [
  {
    number: '01',
    titleAm: 'መተማመን',
    titleEn: 'Trust',
    description: 'በግልጽ ሂደቶች፣ በተጠያቂነት እና በታማኝ አሠራር ላይ የተመሠረተ ግንኙነት።',
  },
  {
    number: '02',
    titleAm: 'ግልጽነት',
    titleEn: 'Transparency',
    description: 'ውሳኔዎችና መረጃዎች በቀላሉ እንዲገኙና እንዲረዱ ማድረግ።',
  },
  {
    number: '03',
    titleAm: 'ተጠያቂነት',
    titleEn: 'Accountability',
    description: 'ኃላፊነት ያለውን አመራር፣ ቁጥጥር እና ጥንቃቄ የተሞላበት አስተዳደር መደገፍ።',
  },
];

const offerings = [
  {
    number: '01',
    label: 'የድርጅት ሥርዓቶች',
    title: 'Enterprise systems',
    description: 'ለድርጅታዊ ሥራዎች፣ ለአስተዳደር እና ለተቀናጀ አሠራር የተዘጋጁ ዲጂታል መሠረቶች።',
  },
  {
    number: '02',
    label: 'የአባላት እና የባለአክሲዮኖች አገልግሎቶች',
    title: 'Member services',
    description: 'የባለድርሻ ግንኙነቶችንና ተዛማጅ አገልግሎቶችን በተጠበቀ መንገድ ለማቀናጀት የሚያግዙ መፍትሄዎች።',
  },
  {
    number: '03',
    label: 'ዲጂታል ንግድ',
    title: 'Digital commerce',
    description: 'በደህንነትና በግልጽ መረጃ ላይ የተመሠረቱ የዲጂታል ንግድ አገልግሎቶች።',
  },
];

const businessAreas = [
  { number: '01', title: 'Enterprise & operations', titleAm: 'ድርጅታዊ አሠራር', description: 'የድርጅት አስተዳደርን፣ የሥራ ሂደቶችንና የተቀናጀ አገልግሎትን የሚደግፉ መፍትሄዎች።' },
  { number: '02', title: 'People & partnerships', titleAm: 'ሰዎችና አጋርነት', description: 'ከአባላት፣ ከባለድርሻ አካላትና ከንግድ አጋሮች ጋር ግልጽ ግንኙነት ለመገንባት የሚያግዙ አቅጣጫዎች።' },
  { number: '03', title: 'Commerce & innovation', titleAm: 'ንግድና ፈጠራ', description: 'የንግድ እድሎችን፣ የዲጂታል አገልግሎቶችንና ፈጠራን የሚያበረታቱ የወደፊት አቅጣጫዎች።' },
];

const publicationChannels = [
  { number: '01', title: 'News', titleAm: 'ዜና', description: 'የድርጅትና የሥራ እንቅስቃሴ ዜናዎች።', label: 'NEWS' },
  { number: '02', title: 'Insights & blog', titleAm: 'ጦማርና ሀሳቦች', description: 'ጠቃሚ ጽሑፎች፣ ትንታኔዎችና የእውቀት ልውውጥ።', label: 'INSIGHTS' },
  { number: '03', title: 'Official notices', titleAm: 'ይፋዊ ማስታወቂያዎች', description: 'በአስተዳዳሪ የተገመገሙ ይፋዊ ማሳወቂያዎችና መግለጫዎች።', label: 'ANNOUNCEMENTS' },
];
</script>

<template>
  <div class="arna-site" data-testid="public-home">
    <a class="skip-link" href="#main-content">ወደ ዋናው ይዘት ይሂዱ</a>

    <div class="announcement-bar">
      <div class="site-container announcement-bar__inner">
        <span class="announcement-bar__pulse" aria-hidden="true"></span>
        <p lang="am">የARNA ይፋዊ ድረ ገጽ እየተዘጋጀ ነው። የጸደቀ መረጃ በዚህ ይታተማል።</p>
        <span class="announcement-bar__english">OFFICIAL WEBSITE · IN DEVELOPMENT</span>
      </div>
    </div>

    <header class="site-header">
      <div class="site-container site-header__inner">
        <RouterLink class="brand" to="/" :aria-label="masesBrandLabels.corporateName">
          <img class="public-home__emblem" src="/logo.png" alt="" width="43" height="43" />
          <span class="brand__wordmark">
            <strong>{{ masesBrandLabels.corporateName }}</strong>
            <small>{{ masesBrandLabels.productName }}</small>
          </span>
        </RouterLink>

        <nav class="main-nav" aria-label="ዋና አሰሳ">
          <a href="#about">ስለ ARNA</a>
          <a href="#principles">እሴቶቻችን</a>
          <a href="#services">አገልግሎቶች</a>
          <a href="#businesses">የንግድ አቅጣጫዎች</a>
          <a href="#updates">ዜናና ጦማር</a>
          <a href="#advertise">ማስታወቂያ</a>
          <RouterLink to="/contribute">ይዘት ያቅርቡ</RouterLink>
        </nav>

        <RouterLink class="header-action" to="/verify">
          <span>ሰነድ ያረጋግጡ</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </RouterLink>
      </div>
    </header>

    <main id="main-content">
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
          <div class="service-grid">
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
          <div class="business-grid">
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
          <div v-if="publishedContent.length" class="publication-grid">
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
            <h2 id="advertising-title" lang="am">የንግድ እድልዎን <span>ከትክክለኛው ታዳሚ ጋር ያገናኙ።</span></h2>
            <p lang="am">የARNA የራስ ዘመቻዎችና የተፈቀዱ የአጋር ማስታወቂያዎች በግልጽ የስፖንሰር መለያ ይቀርባሉ። የማስታወቂያ ማተሚያ በአስተዳዳሪ ፈቃድ ብቻ ይከናወናል።</p>
          </div>
          <div class="advertising-section__aside">
            <span>ADVERTISING PLATFORM</span>
            <strong>COMING IN A LATER RELEASE</strong>
          </div>
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
            <RouterLink class="brand brand--footer" to="/" :aria-label="masesBrandLabels.corporateName">
              <img class="public-home__emblem" src="/logo.png" alt="" width="43" height="43" />
              <span class="brand__wordmark"><strong>{{ masesBrandLabels.corporateName }}</strong><small>{{ masesBrandLabels.productName }}</small></span>
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
</style>
