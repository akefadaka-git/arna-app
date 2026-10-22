<script setup lang="ts">
import '@/styles/reset.css';
import '@/styles/tokens.css';

const year = new Date().getFullYear();
</script>

<template>
  <div class="public-home" data-testid="public-home">
    <header class="public-home__header">
      <a class="public-home__brand" href="/" aria-label="ARNA — መነሻ">
        <span class="public-home__mark" aria-hidden="true">A</span>
        <span>
          <strong>ARNA</strong>
          <small>MAALE ARNA</small>
        </span>
      </a>
      <span class="public-home__status">
        <span aria-hidden="true" class="public-home__status-dot"></span>
        ድረ ገጹ በመዘጋጀት ላይ ነው
      </span>
    </header>

    <main class="public-home__main">
      <section class="public-home__hero" aria-labelledby="welcome-title">
        <p class="public-home__eyebrow">MAALE ARNA · TRUST · TRANSPARENCY · GOVERNANCE</p>
        <div class="public-home__ornament" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <h1 id="welcome-title" lang="am">እንኳን ወደ ARNA በደህና መጡ</h1>
        <p class="public-home__welcome" lang="am">
          እዚህ በመጡዎት ደስ ብሎናል። በመተማመን፣ በግልጽነት እና በተጠያቂነት
          ላይ የተመሠረተ የጋራ ጉዞ እንገንባ።
        </p>
        <h2>Something meaningful is on the way.</h2>
        <p class="public-home__coming" lang="am">
          የARNA ይፋዊ ድረ ገጽ በመዘጋጀት ላይ ነው። በቅርቡ በአዲስ መልክ እንመለሳለን።
        </p>
        <div class="public-home__badge" role="status" aria-live="polite">
          <span class="public-home__badge-icon" aria-hidden="true">✦</span>
          <span>
            <strong>Coming soon</strong>
            <small>ይፋዊ ድረ ገጻችን በቅርቡ ይመጣል</small>
          </span>
        </div>
      </section>

      <section class="public-home__principles" aria-label="Our principles">
        <article>
          <span class="public-home__principle-number">01</span>
          <h3>Trust</h3>
          <p>Building confidence through clear and dependable systems.</p>
        </article>
        <article>
          <span class="public-home__principle-number">02</span>
          <h3>Transparency</h3>
          <p>Making information and decisions easier to understand.</p>
        </article>
        <article>
          <span class="public-home__principle-number">03</span>
          <h3>Accountability</h3>
          <p>Supporting responsible stewardship and good governance.</p>
        </article>
      </section>

      <p class="public-home__note" lang="am">
        የይፋዊ ድረ ገጹ ከARNA የአስተዳደር፣ የሥራ ቦታ እና የባለአክሲዮን ፖርታል መተግበሪያዎች የተለየ ነው።
      </p>
    </main>

    <footer class="public-home__footer">
      <span>© {{ year }} ARNA · Maale Arna</span>
      <span>Built on trust. Guided by purpose.</span>
    </footer>
  </div>
</template>

<style scoped>
.public-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--arna-public-text-primary);
  background:
    radial-gradient(ellipse at 78% 14%, var(--arna-public-accent-wash), transparent 34rem),
    radial-gradient(ellipse at 8% 55%, var(--arna-public-action-wash), transparent 30rem),
    var(--arna-public-page-surface);
  font-family: "Noto Sans Ethiopic", Inter, system-ui, sans-serif;
}
.public-home__header,
.public-home__footer {
  width: min(100% - 3rem, 76rem);
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.public-home__header {
  min-height: 6rem;
  border-bottom: 1px solid var(--arna-public-border-subtle);
}
.public-home__brand {
  display: inline-flex;
  align-items: center;
  gap: .75rem;
  color: var(--arna-public-brand-anchor);
  text-decoration: none;
}
.public-home__brand > span:last-child { display: grid; gap: .1rem; }
.public-home__brand strong { font-size: 1.25rem; letter-spacing: .13em; }
.public-home__brand small { font-size: .65rem; letter-spacing: .16em; }
.public-home__mark {
  width: 2.7rem;
  height: 2.7rem;
  display: grid;
  place-items: center;
  border-radius: 50% 50% 50% 12%;
  color: var(--arna-color-white);
  background: var(--arna-public-brand-anchor);
  font-family: Georgia, serif;
  font-size: 1.6rem;
}
.public-home__status {
  display: inline-flex;
  align-items: center;
  gap: .55rem;
  color: var(--arna-public-text-secondary);
  font-size: .85rem;
}
.public-home__status-dot {
  width: .5rem;
  height: .5rem;
  border-radius: 50%;
  background: var(--arna-public-accent);
}
.public-home__main {
  width: min(100% - 3rem, 76rem);
  margin-inline: auto;
  flex: 1;
}
.public-home__hero {
  max-width: 54rem;
  margin: clamp(4rem, 10vh, 7rem) auto 4.5rem;
  text-align: center;
}
.public-home__eyebrow {
  margin: 0;
  color: var(--arna-public-brand-anchor);
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .14em;
}
.public-home__ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .35rem;
  margin: 1.6rem 0;
}
.public-home__ornament span {
  display: block;
  width: .38rem;
  height: .38rem;
  transform: rotate(45deg);
  background: var(--arna-public-accent);
}
.public-home__ornament span:nth-child(2) {
  width: .65rem;
  height: .65rem;
  background: var(--arna-public-brand-anchor);
}
.public-home h1 {
  margin: 0;
  color: var(--arna-public-brand-anchor);
  font-size: clamp(2rem, 5vw, 3.7rem);
  line-height: 1.35;
  font-weight: 750;
  letter-spacing: -.035em;
}
.public-home__welcome {
  max-width: 43rem;
  margin: 1.35rem auto 2.8rem;
  color: var(--arna-public-text-secondary);
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 2;
}
.public-home h2 {
  margin: 0;
  color: var(--arna-public-text-primary);
  font-size: clamp(1.35rem, 3vw, 2rem);
  line-height: 1.4;
}
.public-home__coming {
  margin: .9rem auto 1.5rem;
  color: var(--arna-public-text-secondary);
  line-height: 1.9;
}
.public-home__badge {
  display: inline-flex;
  align-items: center;
  gap: .85rem;
  padding: .85rem 1.25rem;
  border: 1px solid var(--arna-public-brand-border);
  border-radius: 999px;
  background: var(--arna-public-surface-overlay);
  box-shadow: 0 12px 35px var(--arna-public-card-shadow);
  text-align: left;
}
.public-home__badge-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--arna-public-brand-anchor);
  background: var(--arna-public-accent-soft);
  font-size: 1.3rem;
}
.public-home__badge strong,
.public-home__badge small { display: block; }
.public-home__badge strong { color: var(--arna-public-brand-anchor); }
.public-home__badge small { margin-top: .15rem; color: var(--arna-public-text-secondary); }
.public-home__principles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin: 0 auto 3.5rem;
}
.public-home__principles article {
  padding: 1.4rem 1.5rem;
  border: 1px solid var(--arna-public-border-subtle);
  border-radius: 1rem;
  background: var(--arna-public-surface-soft);
}
.public-home__principle-number {
  color: var(--arna-public-brand-anchor);
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .12em;
}
.public-home__principles h3 {
  margin: .65rem 0 .35rem;
  color: var(--arna-public-brand-anchor);
  font-size: 1.05rem;
}
.public-home__principles p {
  margin: 0;
  color: var(--arna-public-text-secondary);
  font-size: .9rem;
  line-height: 1.7;
}
.public-home__note {
  margin: 0 auto 2rem;
  padding: 1rem 1.25rem;
  border-inline-start: 3px solid var(--arna-public-accent);
  color: var(--arna-public-text-secondary);
  font-size: .88rem;
  line-height: 1.8;
}
.public-home__footer {
  min-height: 5rem;
  border-top: 1px solid var(--arna-public-border-subtle);
  color: var(--arna-public-text-secondary);
  font-size: .78rem;
}
@media (max-width: 42rem) {
  .public-home__header,
  .public-home__footer {
    width: min(100% - 2rem, 76rem);
  }
  .public-home__main { width: min(100% - 2rem, 76rem); }
  .public-home__header { align-items: flex-start; flex-direction: column; justify-content: center; padding-block: 1rem; }
  .public-home__status { font-size: .75rem; }
  .public-home__hero { margin-top: 3.5rem; }
  .public-home__principles { grid-template-columns: 1fr; }
  .public-home__footer { align-items: flex-start; flex-direction: column; justify-content: center; padding-block: 1rem; }
}
@media (prefers-reduced-motion: reduce) {
  .public-home * { scroll-behavior: auto !important; }
}
</style>
