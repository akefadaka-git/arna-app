<script setup lang="ts">
import { RouterLink } from 'vue-router';

const appName: string = import.meta.env.VITE_APP_NAME;
</script>

<template>
  <div class="public-site-layout" data-testid="public-site-layout">
    <a class="public-site-layout__skip-link" href="#public-site-main">ወደ ዋናው ይዘት ዝለል</a>
    <header class="public-site-layout__header">
      <nav class="public-site-layout__nav" aria-label="ዋና አሰሳ">
        <RouterLink class="public-site-layout__brand" to="/login">{{ appName }}</RouterLink>
        <div class="public-site-layout__links">
          <RouterLink to="/login">ግባ</RouterLink>
          <RouterLink to="/verify">ሰነድ ማረጋገጫ</RouterLink>
          <RouterLink to="/legal">ሕጋዊ መረጃ</RouterLink>
        </div>
      </nav>
    </header>
    <main id="public-site-main" class="public-site-layout__content" tabindex="-1">
      <slot />
    </main>
    <footer class="public-site-layout__footer">
      <nav aria-label="የግርጌ አሰሳ">
        <RouterLink to="/legal">ሕጋዊ መረጃ</RouterLink>
        <span aria-hidden="true">·</span>
        <RouterLink to="/verify">የሰነድ ትክክለኛነት ማረጋገጫ</RouterLink>
      </nav>
      <small>© {{ new Date().getFullYear() }} {{ appName }}</small>
    </footer>
  </div>
</template>

<style scoped>
.public-site-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--mases-color-text-primary);
  background: var(--mases-color-surface, var(--mases-color-background));
}
.public-site-layout__header,
.public-site-layout__footer {
  width: 100%;
  border-color: var(--mases-color-border, currentColor);
  border-style: solid;
  border-width: 0 0 1px;
  padding: var(--mases-space-4, 1rem) clamp(1rem, 4vw, 3rem);
}
.public-site-layout__footer {
  margin-top: auto;
  border-width: 1px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.public-site-layout__nav,
.public-site-layout__links,
.public-site-layout__footer nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.public-site-layout__brand {
  font-weight: var(--mases-font-weight-semibold, 700);
  text-decoration: none;
}
.public-site-layout__skip-link {
  position: absolute;
  z-index: 1000;
  inset-block-start: 0.5rem;
  inset-inline-start: 0.5rem;
  padding: 0.65rem 0.9rem;
  color: var(--mases-color-text-primary);
  background: var(--mases-color-surface, var(--mases-color-background));
  border: 2px solid currentColor;
  border-radius: 0.25rem;
  transform: translateY(calc(-100% - 1rem));
}
.public-site-layout__skip-link:focus {
  transform: translateY(0);
}
.public-site-layout a {
  color: var(--mases-color-text-primary);
  text-underline-offset: 0.2em;
}
.public-site-layout a:focus-visible,
.public-site-layout__content:focus-visible {
  outline: 3px solid var(--mases-color-focus, currentColor);
  outline-offset: 3px;
}
.public-site-layout__content {
  flex: 1;
  min-width: 0;
}
@media (max-width: 36rem) {
  .public-site-layout__nav {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (forced-colors: active) {
  .public-site-layout {
    background: Canvas;
    color: CanvasText;
  }

  .public-site-layout__header,
  .public-site-layout__footer {
    border-color: CanvasText;
  }

  .public-site-layout a {
    color: LinkText;
  }

  .public-site-layout a:focus-visible,
  .public-site-layout__content:focus-visible {
    outline-color: Highlight;
  }

  .public-site-layout__skip-link,
  .public-site-layout__skip-link:focus {
    color: HighlightText;
    background: Highlight;
    border-color: Highlight;
  }
}

</style>
