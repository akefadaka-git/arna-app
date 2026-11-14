<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { masesBrandLabels } from '@/router/shell-labels';
import { api } from '@/core/api/client';

type SubmissionKind = 'news' | 'article' | 'announcement' | 'press-release';
const title = ref('');
const body = ref('');
const authorName = ref('');
const authorEmail = ref('');
const verificationCode = ref('');
const verificationChallengeId = ref('');
const verificationToken = ref('');
const verificationCodeSent = ref(false);
const emailVerified = computed(() => Boolean(verificationToken.value));
const kind = ref<SubmissionKind>('article');
const consent = ref(false);
const website = ref('');
const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const submissionReference = ref('');

const endpointAvailable = computed(() => Boolean(import.meta.env.VITE_API_BASE_URL));

const route = useRoute();
const locale = computed(() => route.query.locale === 'en' ? 'en' : 'am');
const copy = computed(() => locale.value === 'am' ? {
  invalidEmail: 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ።',
  verificationSent: 'የማረጋገጫ ኮድ ወደ ኢሜይልዎ ተልኳል።',
  sendCodeFailed: 'ኮዱን መላክ አልተቻለም።',
  codeInvalid: 'በኢሜይልዎ የተላከውን 6 አሃዝ ኮድ ያስገቡ።',
  emailVerified: 'ኢሜይልዎ ተረጋግጧል። አሁን ይዘቱን ማቅረብ ይችላሉ።',
  emailVerifyFailed: 'የኢሜይል ማረጋገጫ አልተሳካም።',
  apiUnavailable: 'የARNA API ግንኙነት አልተዋቀረም። እባክዎ በኋላ ይሞክሩ።',
  verifyEmailFirst: 'ይዘት ከማቅረብዎ በፊት ኢሜይልዎን ያረጋግጡ።',
  consentRequired: 'የግላዊነት መመሪያውን ማንበብና መቀበል ያስፈልጋል።',
  submitted: 'ይዘትዎ ተቀብሏል። ከሕዝብ ጋር ከመጋራቱ በፊት በARNA አስተዳዳሪ ይገመገማል።',
  unknownError: 'ያልታወቀ ስህተት ተፈጥሯል።',
  back: 'ወደ ዋና ገጽ ተመለስ', eyebrow: 'COMMUNITY CONTRIBUTIONS · የሕዝብ ተሳትፎ',
  title: 'ይዘት ያቅርቡ',
  lead: 'ዜና፣ ጽሑፍ፣ ማስታወቂያ ወይም ይፋዊ መረጃ ለARNA ያቅርቡ። ማንኛውም ሰው ማቅረብ ይችላል፤ ለሕዝብ የሚታይ የሚሆነው ግን በተፈቀደ አስተዳዳሪ ከተገመገመና ከጸደቀ በኋላ ብቻ ነው።',
  processLabel: 'የማተሚያ ሂደት', processTitle: 'የማተሚያ ሂደት',
  processBody: 'ማቅረብ → በግል የግምገማ ወረፋ → የአስተዳዳሪ ውሳኔ → ከጸደቀ በኋላ ማተም።',
  processFoot: 'ማቅረብ ማለት ማተም አይደለም። ጸሐፊው ራሱን ማጽደቅ ወይም ማተም አይችልም။',
  kind: 'የይዘት ዓይነት', article: 'ጽሑፍ / Blog article', news: 'ዜና / News',
  announcement: 'ማስታወቂያ / Announcement', pressRelease: 'የፕሬስ መግለጫ / Press release',
  titleLabel: 'ርዕስ', titlePlaceholder: 'የይዘቱን ርዕስ ያስገቡ',
  bodyLabel: 'ይዘት', bodyPlaceholder: 'የሚያቀርቡትን መረጃ በግልጽ ይጻፉ።',
  authorName: 'የጸሐፊ ስም', email: 'ኢሜይል', sending: 'በመላክ ላይ…',
  resend: 'ኮዱን እንደገና ላክ', sendCode: 'የማረጋገጫ ኮድ ላክ',
  codeLabel: 'ወደ ኢሜይልዎ የተላከው 6 አሃዝ ኮድ', verifyEmail: 'ኢሜይልን አረጋግጥ',
  emailVerifiedStatus: 'ኢሜይል ተረጋግጧል።',
  consent: 'የግላዊነት መመሪያውን አንብቤ ተቀብያለሁ፤ ይዘቱ ለግምገማ እንደሚቀርብ ተረድቻለሁ።',
  apiNotice: 'የARNA API ግንኙነት ሲኖር ማስገባት ይቻላል። የቀረበው ይዘት በአስተዳዳሪ እስኪጸድቅ ድረስ በግል ይቆያል።',
  reference: 'የማጣቀሻ ቁጥር', submit: 'ለግምገማ ያቅርቡ',
  footer: 'ይዘት የሚታተመው ከአስተዳዳሪ ፈቃድ በኋላ ብቻ ነው።'
} : {
  invalidEmail: 'Enter a valid email address.',
  verificationSent: 'A verification code has been sent to your email.',
  sendCodeFailed: 'The verification code could not be sent.',
  codeInvalid: 'Enter the six-digit code sent to your email.',
  emailVerified: 'Your email is verified. You can now submit content.',
  emailVerifyFailed: 'Email verification failed.',
  apiUnavailable: 'The ARNA API connection is not configured. Please try again later.',
  verifyEmailFirst: 'Verify your email before submitting content.',
  consentRequired: 'You must read and accept the privacy notice.',
  submitted: 'Your content has been received. An ARNA administrator will review it before it is shared publicly.',
  unknownError: 'An unexpected error occurred.',
  back: 'Back to homepage', eyebrow: 'COMMUNITY CONTRIBUTIONS',
  title: 'Submit content',
  lead: 'Send ARNA news, an article, an announcement or other official information. Anyone may submit content; publication is possible only after review and approval by an authorized administrator.',
  processLabel: 'Publishing process', processTitle: 'How publication works',
  processBody: 'Submit → Private review queue → Administrator decision → Publish only after approval.',
  processFoot: 'Submitting content does not publish it. Authors cannot approve or publish their own submissions.',
  kind: 'Content type', article: 'Blog article', news: 'News',
  announcement: 'Announcement', pressRelease: 'Press release',
  titleLabel: 'Title', titlePlaceholder: 'Enter a title for your content',
  bodyLabel: 'Content', bodyPlaceholder: 'Describe the information you are submitting.',
  authorName: 'Author name', email: 'Email address', sending: 'Sending…',
  resend: 'Resend code', sendCode: 'Send verification code',
  codeLabel: 'Six-digit code sent to your email', verifyEmail: 'Verify email',
  emailVerifiedStatus: 'Email verified.',
  consent: 'I have read and accept the privacy notice, and understand that my content will be reviewed.',
  apiNotice: 'Submissions are available when the ARNA API is configured. Submitted content remains private until an administrator approves it.',
  reference: 'Reference', submit: 'Submit for review',
  footer: 'Content is published only after administrator approval.'
});
onMounted(() => { document.documentElement.lang = locale.value; });
watch(locale, (value) => { document.documentElement.lang = value; });

watch(authorEmail, () => {
  verificationChallengeId.value = '';
  verificationToken.value = '';
  verificationCode.value = '';
  verificationCodeSent.value = false;
});

async function requestEmailVerification(): Promise<void> {
  errorMessage.value = '';
  if (!endpointAvailable.value || !authorEmail.value.trim()) {
    errorMessage.value = copy.value.invalidEmail;
    return;
  }
  submitting.value = true;
  try {
    await api.csrfCookie();
    const result = await api.post<{ challenge_id: string }>(
      '/api/public/content/verification-challenges',
      { email: authorEmail.value.trim() },
    );
    verificationChallengeId.value = result.challenge_id;
    verificationCodeSent.value = true;
    successMessage.value = copy.value.verificationSent;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : copy.value.sendCodeFailed;
  } finally {
    submitting.value = false;
  }
}

async function verifyEmail(): Promise<void> {
  errorMessage.value = '';
  if (!verificationChallengeId.value || !/^\\d{6}$/.test(verificationCode.value)) {
    errorMessage.value = copy.value.codeInvalid;
    return;
  }
  submitting.value = true;
  try {
    const result = await api.post<{ verification_token: string }>(
      '/api/public/content/verification-challenges/verify',
      {
        challenge_id: verificationChallengeId.value,
        email: authorEmail.value.trim(),
        code: verificationCode.value,
      },
    );
    verificationToken.value = result.verification_token;
    successMessage.value = copy.value.emailVerified;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : copy.value.emailVerifyFailed;
  } finally {
    submitting.value = false;
  }
}


async function submitContent(): Promise<void> {
  errorMessage.value = '';
  successMessage.value = '';
  submissionReference.value = '';

  if (!endpointAvailable.value) {
    errorMessage.value = copy.value.apiUnavailable;
    return;
  }

  if (!emailVerified.value) {
    errorMessage.value = copy.value.verifyEmailFirst;
    return;
  }

  if (!consent.value) {
    errorMessage.value = copy.value.consentRequired;
    return;
  }

  submitting.value = true;
  try {
    await api.csrfCookie();
    const result = await api.post<{ reference?: string | null; status: string }>(
      '/api/public/content/submissions',
      {
        content_type: kind.value === 'press-release' ? 'press_release' : kind.value,
        title: title.value.trim(),
        body: body.value.trim(),
        author_name: authorName.value.trim(),
        verification_challenge_id: verificationChallengeId.value,
        verification_token: verificationToken.value,
        consent: consent.value,
        website: website.value,
      },
    );
    submissionReference.value = typeof result.reference === 'string' ? result.reference : '';
    successMessage.value = copy.value.submitted;
    title.value = '';
    body.value = '';
    authorName.value = '';
    authorEmail.value = '';
    verificationCode.value = '';
    verificationChallengeId.value = '';
    verificationToken.value = '';
    verificationCodeSent.value = false;
    consent.value = false;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : copy.value.unknownError;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="contribute-page" :lang="locale">
    <header class="contribute-header">
      <RouterLink class="contribute-brand" :to="{ path: '/', query: { locale } }">
        <img src="/logo.png" alt="" width="42" height="42" />
        <span><strong>{{ masesBrandLabels.corporateName }}</strong><small>{{ masesBrandLabels.productName }} · PUBLIC</small></span>
      </RouterLink>
      <RouterLink class="contribute-back" :to="{ path: '/', query: { locale } }">{{ copy.back }}</RouterLink>
    </header>

    <main class="contribute-main">
      <p class="contribute-eyebrow">{{ copy.eyebrow }}</p>
      <h1>{{ copy.title }}</h1>
      <p class="contribute-lead">{{ copy.lead }}</p>

      <section class="governance-note" :aria-label="copy.processLabel">
        <strong>{{ copy.processTitle }}</strong>
        <p>{{ copy.processBody }}</p>
        <small>{{ copy.processFoot }}</small>
      </section>

      <form class="contribute-form" @submit.prevent="submitContent">
        <label>
          {{ copy.kind }}
          <select v-model="kind" required>
            <option value="article">{{ copy.article }}</option>
            <option value="news">{{ copy.news }}</option>
            <option value="announcement">{{ copy.announcement }}</option>
            <option value="press-release">{{ copy.pressRelease }}</option>
          </select>
        </label>
        <label>
          {{ copy.titleLabel }}
          <input v-model="title" maxlength="180" required autocomplete="off"  :placeholder="copy.titlePlaceholder" />
        </label>
        <label>
          {{ copy.bodyLabel }}
          <textarea v-model="body" rows="9" maxlength="20000" required  :placeholder="copy.bodyPlaceholder"></textarea>
        </label>
        <div class="contribute-form__row">
          <label>
            {{ copy.authorName }}
            <input v-model="authorName" maxlength="120" required autocomplete="name" />
          </label>
          <label>
            {{ copy.email }}
            <input v-model="authorEmail" type="email" maxlength="254" required autocomplete="email" :disabled="emailVerified" />
            <button type="button" class="verification-button" :disabled="submitting || !authorEmail.trim() || emailVerified" @click="requestEmailVerification">
              {{ submitting ? copy.sending : verificationCodeSent ? copy.resend : copy.sendCode }}
            </button>
          </label>
        </div>
        <label v-if="verificationCodeSent && !emailVerified" class="verification-code-field">
          {{ copy.codeLabel }}
          <input v-model="verificationCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" />
          <button type="button" class="verification-button" :disabled="submitting || verificationCode.length !== 6" @click="verifyEmail">{{ copy.verifyEmail }}</button>
        </label>
        <p v-if="emailVerified" class="contribute-status contribute-status--success" role="status">{{ copy.emailVerifiedStatus }}</p>
        <label class="contribute-honeypot" aria-hidden="true">
          Leave this field empty
          <input v-model="website" tabindex="-1" autocomplete="off" />
        </label>
        <label class="contribute-consent">
          <input v-model="consent" type="checkbox" required />
          <span>{{ copy.consent }}</span>
        </label>

        <p v-if="!endpointAvailable" class="contribute-status contribute-status--warning" role="status">{{ copy.apiNotice }}</p>
        <p v-if="errorMessage" class="contribute-status contribute-status--error" role="alert">{{ errorMessage }}</p>
        <p v-if="successMessage" class="contribute-status contribute-status--success" role="status">{{ successMessage }} <span v-if="submissionReference">{{ copy.reference }}: {{ submissionReference }}</span></p>

        <button type="submit" :disabled="submitting || !endpointAvailable || !emailVerified">
          {{ submitting ? copy.sending : copy.submit }}
        </button>
      </form>
    </main>
    <footer class="contribute-footer">© {{ new Date().getFullYear() }} {{ masesBrandLabels.corporateName }} · {{ copy.footer }}</footer>
  </div>
</template>

<style scoped>
.contribute-page{min-height:100vh;color:var(--arna-navy);background:var(--arna-public-page-surface);font-family:inherit}
.contribute-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem max(1.25rem,calc((100vw - 1120px)/2));border-bottom:1px solid var(--arna-line);background:var(--arna-public-surface-soft)}
.contribute-brand{display:flex;align-items:center;gap:.75rem;color:inherit;text-decoration:none}
.contribute-brand img{object-fit:contain}
.contribute-brand span{display:grid;gap:.12rem}
.contribute-brand strong{font-size:1.05rem}
.contribute-brand small{color:var(--arna-public-text-secondary);font-size:.65rem;letter-spacing:.12em}
.contribute-back{color:var(--arna-public-accent);font-size:.85rem;font-weight:650;text-decoration:none}
.contribute-main{width:min(100% - 2rem,760px);margin:0 auto;padding:clamp(2.5rem,7vw,5rem) 0}
.contribute-eyebrow{color:var(--arna-public-accent);font-size:.72rem;font-weight:800;letter-spacing:.1em}
.contribute-main h1{margin:.65rem 0;color:var(--arna-navy);font-size:clamp(2rem,5vw,3.2rem)}
.contribute-lead{color:var(--arna-public-text-secondary);line-height:1.9}
.governance-note{margin:2rem 0;padding:1.2rem 1.35rem;border-inline-start:4px solid var(--arna-gold);background:var(--arna-public-surface-soft)}
.governance-note p{margin:.45rem 0;color:var(--arna-navy);line-height:1.8}
.governance-note small{color:var(--arna-public-text-secondary);line-height:1.7}
.contribute-form{display:grid;gap:1.15rem;padding:clamp(1.1rem,4vw,2rem);border:1px solid var(--arna-line);background:white}
.contribute-form label{display:grid;gap:.45rem;font-size:.86rem;font-weight:650}
.contribute-form input:not([type=checkbox]),.contribute-form select,.contribute-form textarea{width:100%;min-height:46px;padding:.75rem .85rem;border:1px solid #cbd3dc;border-radius:3px;color:var(--arna-navy);background:#fff;font:inherit;font-weight:400}
.contribute-form textarea{resize:vertical;line-height:1.7}
.contribute-form__row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.contribute-consent{display:flex!important;grid-template-columns:auto 1fr;align-items:flex-start;gap:.7rem!important;font-weight:400!important;line-height:1.7}
.contribute-consent input{margin-top:.35rem}
.contribute-honeypot{position:absolute!important;left:-10000px!important;width:1px;height:1px;overflow:hidden}
.contribute-status{margin:0;padding:.8rem 1rem;line-height:1.7}
.contribute-status--warning{background:#fff7e6;color:#714b00}
.contribute-status--error{background:#fff0ef;color:#8d2020}
.contribute-status--success{background:#eaf7ee;color:#175b2c}
.contribute-form button{min-height:48px;padding:.8rem 1.2rem;border:0;border-radius:3px;color:white;background:var(--arna-public-brand-anchor);font:inherit;font-weight:700;cursor:pointer}
.contribute-form button:disabled{opacity:.5;cursor:not-allowed}
.verification-button{min-height:38px!important;padding:.45rem .75rem!important;border:1px solid var(--arna-public-accent)!important;border-radius:3px!important;color:var(--arna-public-accent)!important;background:transparent!important;font-size:.8rem!important}
.verification-code-field{max-width:360px}
.contribute-footer{padding:1.5rem;text-align:center;border-top:1px solid var(--arna-line);color:var(--arna-public-text-secondary);font-size:.75rem}
:where(.contribute-page a,.contribute-page button,.contribute-page input,.contribute-page select,.contribute-page textarea):focus-visible{outline:3px solid var(--arna-public-accent);outline-offset:3px}
@media(max-width:640px){.contribute-form__row{grid-template-columns:1fr}.contribute-header{padding-inline:1rem}.contribute-back{font-size:.75rem}}
</style>
