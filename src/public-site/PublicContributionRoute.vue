<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { masesBrandLabels } from '@/router/shell-labels';
import { api } from '@/core/api/client';

type SubmissionKind = 'news' | 'article' | 'announcement' | 'press-release';
const title = ref('');
const body = ref('');
const authorName = ref('');
const authorEmail = ref('');
const kind = ref<SubmissionKind>('article');
const consent = ref(false);
const website = ref('');
const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const submissionReference = ref('');

const endpointAvailable = computed(() => Boolean(import.meta.env.VITE_API_BASE_URL));


async function submitContent(): Promise<void> {
  errorMessage.value = '';
  successMessage.value = '';
  submissionReference.value = '';

  if (!endpointAvailable.value) {
    errorMessage.value = 'የARNA API ግንኙነት አልተዋቀረም። እባክዎ በኋላ ይሞክሩ።';
    return;
  }

  if (!consent.value) {
    errorMessage.value = 'የግላዊነት መመሪያውን ማንበብና መቀበል ያስፈልጋል።';
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
        author_email: authorEmail.value.trim() || null,
        website: website.value,
      },
    );
    submissionReference.value = typeof result.reference === 'string' ? result.reference : '';
    successMessage.value = 'ይዘትዎ ተቀብሏል። ከሕዝብ ጋር ከመጋራቱ በፊት በARNA አስተዳዳሪ ይገመገማል።';
    title.value = '';
    body.value = '';
    authorName.value = '';
    authorEmail.value = '';
    consent.value = false;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ያልታወቀ ስህተት ተፈጥሯል።';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="contribute-page">
    <header class="contribute-header">
      <RouterLink class="contribute-brand" to="/">
        <img src="/logo.png" alt="" width="42" height="42" />
        <span><strong>{{ masesBrandLabels.corporateName }}</strong><small>{{ masesBrandLabels.productName }} · PUBLIC</small></span>
      </RouterLink>
      <RouterLink class="contribute-back" to="/">ወደ ዋና ገጽ ተመለስ</RouterLink>
    </header>

    <main class="contribute-main">
      <p class="contribute-eyebrow">COMMUNITY CONTRIBUTIONS · የሕዝብ ተሳትፎ</p>
      <h1>ይዘት ያቅርቡ</h1>
      <p class="contribute-lead">ዜና፣ ጽሑፍ፣ ማስታወቂያ ወይም ይፋዊ መረጃ ለARNA ያቅርቡ። ማንኛውም ሰው ማቅረብ ይችላል፤ ለሕዝብ የሚታይ የሚሆነው ግን በተፈቀደ አስተዳዳሪ ከተገመገመና ከጸደቀ በኋላ ብቻ ነው።</p>

      <section class="governance-note" aria-label="የማተሚያ ሂደት">
        <strong>የማተሚያ ሂደት</strong>
        <p>ማቅረብ → በግል የግምገማ ወረፋ → የአስተዳዳሪ ውሳኔ → ከጸደቀ በኋላ ማተም።</p>
        <small>ማቅረብ ማለት ማተም አይደለም። ጸሐፊው ራሱን ማጽደቅ ወይም ማተም አይችልም።</small>
      </section>

      <form class="contribute-form" @submit.prevent="submitContent">
        <label>
          የይዘት ዓይነት
          <select v-model="kind" required>
            <option value="article">ጽሑፍ / Blog article</option>
            <option value="news">ዜና / News</option>
            <option value="announcement">ማስታወቂያ / Announcement</option>
            <option value="press-release">የፕሬስ መግለጫ / Press release</option>
          </select>
        </label>
        <label>
          ርዕስ
          <input v-model="title" maxlength="180" required autocomplete="off" placeholder="የይዘቱን ርዕስ ያስገቡ" />
        </label>
        <label>
          ይዘት
          <textarea v-model="body" rows="9" maxlength="20000" required placeholder="የሚያቀርቡትን መረጃ በግልጽ ይጻፉ።"></textarea>
        </label>
        <div class="contribute-form__row">
          <label>
            የጸሐፊ ስም
            <input v-model="authorName" maxlength="120" required autocomplete="name" />
          </label>
          <label>
            ኢሜይል (አማራጭ)
            <input v-model="authorEmail" type="email" maxlength="254" autocomplete="email" />
          </label>
        </div>
        <label class="contribute-honeypot" aria-hidden="true">
          Leave this field empty
          <input v-model="website" tabindex="-1" autocomplete="off" />
        </label>
        <label class="contribute-consent">
          <input v-model="consent" type="checkbox" required />
          <span>የግላዊነት መመሪያውን አንብቤ ተቀብያለሁ፤ ይዘቱ ለግምገማ እንደሚቀርብ ተረድቻለሁ።</span>
        </label>

        <p v-if="!endpointAvailable" class="contribute-status contribute-status--warning" role="status">የARNA API ግንኙነት ሲኖር ማስገባት ይቻላል። የቀረበው ይዘት በአስተዳዳሪ እስኪጸድቅ ድረስ በግል ይቆያል።</p>
        <p v-if="errorMessage" class="contribute-status contribute-status--error" role="alert">{{ errorMessage }}</p>
        <p v-if="successMessage" class="contribute-status contribute-status--success" role="status">{{ successMessage }} <span v-if="submissionReference">የማጣቀሻ ቁጥር: {{ submissionReference }}</span></p>

        <button type="submit" :disabled="submitting || !endpointAvailable">
          {{ submitting ? 'በመላክ ላይ…' : 'ለግምገማ ያቅርቡ' }}
        </button>
      </form>
    </main>
    <footer class="contribute-footer">© {{ new Date().getFullYear() }} {{ masesBrandLabels.corporateName }} · ይዘት የሚታተመው ከአስተዳዳሪ ፈቃድ በኋላ ብቻ ነው።</footer>
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
.contribute-footer{padding:1.5rem;text-align:center;border-top:1px solid var(--arna-line);color:var(--arna-public-text-secondary);font-size:.75rem}
:where(.contribute-page a,.contribute-page button,.contribute-page input,.contribute-page select,.contribute-page textarea):focus-visible{outline:3px solid var(--arna-public-accent);outline-offset:3px}
@media(max-width:640px){.contribute-form__row{grid-template-columns:1fr}.contribute-header{padding-inline:1rem}.contribute-back{font-size:.75rem}}
</style>
