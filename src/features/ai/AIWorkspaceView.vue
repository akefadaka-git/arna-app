<script setup lang="ts">
const agents = [
  { key: 'executive_intelligence', am: 'የአስፈፃሚ መረጃ', en: 'Executive Intelligence' },
  { key: 'finance_intelligence', am: 'የፋይናንስ መረጃ', en: 'Finance Intelligence' },
  { key: 'governance_intelligence', am: 'የአስተዳደር መረጃ', en: 'Governance Intelligence' },
  { key: 'people_intelligence', am: 'የሰው ኃይል መረጃ', en: 'People Intelligence' },
  { key: 'document_intelligence', am: 'የሰነድ መረጃ', en: 'Document Intelligence' },
  { key: 'communication_intelligence', am: 'የግንኙነት መረጃ', en: 'Communication Intelligence' },
  { key: 'operations_intelligence', am: 'የሥራ ክንውን መረጃ', en: 'Operations Intelligence' },
  { key: 'analytics_intelligence', am: 'ትንታኔ', en: 'Analytics Intelligence' },
  { key: 'calendar_planning_intelligence', am: 'የቀን መቁጠሪያና ዕቅድ', en: 'Calendar & Planning Intelligence' },
] as const;
</script>

<template>
  <main class="ai-workspace" lang="am">
    <header class="ai-workspace__header">
      <div>
        <p class="ai-workspace__eyebrow">ARNA OS · INTELLIGENCE</p>
        <h1>የARNA AI የሥራ ቦታ</h1>
        <p class="ai-workspace__subtitle">Amharic-first enterprise intelligence workspace</p>
      </div>
      <span class="ai-workspace__status" role="status">ገና አልነቃም · NOT ACTIVE</span>
    </header>

    <section class="ai-workspace__notice" aria-labelledby="ai-safety-title">
      <h2 id="ai-safety-title">የደህንነት ሁኔታ · Safety boundary</h2>
      <p>የAI ሞዴል አገልግሎት አልተመረጠም ወይም አልተነቃም። ውጫዊ አቅራቢዎች እና የመረጃ መላክ በነባሪ ተዘግተዋል።</p>
      <p>No model provider is selected or active. External provider egress remains disabled. AI cannot post to the ledger, execute payments, grant roles, approve governed actions, or write directly to ARNA databases.</p>
    </section>

    <section aria-labelledby="ai-agents-title">
      <div class="ai-workspace__section-heading">
        <h2 id="ai-agents-title">የAI ወኪሎች · Agent catalogue</h2>
        <p>የታቀዱ ችሎታዎች — አሁን የሚሠሩ አይደሉም</p>
      </div>
      <ul class="ai-workspace__agents">
        <li v-for="agent in agents" :key="agent.key">
          <span class="ai-workspace__agent-name">
            <strong>{{ agent.am }}</strong>
            <small>{{ agent.en }}</small>
          </span>
          <span class="ai-workspace__agent-state">DISABLED</span>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.ai-workspace { max-width: 1120px; margin: 0 auto; padding: 1.5rem; color: var(--color-text, inherit); }
.ai-workspace__header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
.ai-workspace__eyebrow { margin: 0 0 .35rem; font-size: .72rem; letter-spacing: .12em; opacity: .7; }
.ai-workspace h1 { margin: 0; font-size: clamp(1.5rem, 4vw, 2.2rem); }
.ai-workspace__subtitle { margin: .5rem 0 0; opacity: .75; }
.ai-workspace__status, .ai-workspace__agent-state { border: 1px solid currentColor; border-radius: 999px; padding: .35rem .7rem; font-size: .72rem; font-weight: 700; letter-spacing: .04em; }
.ai-workspace__notice { border: 1px solid var(--color-border, #888); border-radius: .85rem; padding: 1rem 1.2rem; margin-bottom: 2rem; background: var(--color-surface-secondary, transparent); }
.ai-workspace__notice h2, .ai-workspace__section-heading h2 { margin: 0 0 .6rem; font-size: 1.1rem; }
.ai-workspace__notice p { line-height: 1.65; margin: .45rem 0; }
.ai-workspace__section-heading { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: .5rem; margin-bottom: .8rem; }
.ai-workspace__section-heading p { margin: 0; opacity: .7; font-size: .85rem; }
.ai-workspace__agents { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr)); gap: .75rem; }
.ai-workspace__agents li { display: flex; align-items: center; justify-content: space-between; gap: .75rem; min-width: 0; border: 1px solid var(--color-border, #888); border-radius: .75rem; padding: .9rem 1rem; }
.ai-workspace__agent-name { display: grid; gap: .2rem; min-width: 0; }
.ai-workspace__agent-name small { opacity: .7; }
</style>
