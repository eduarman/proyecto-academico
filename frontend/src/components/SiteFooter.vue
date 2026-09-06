<template>
  <footer class="site-footer">
    <p class="site-footer__text">
      Desarrollado por
      <a
        href="https://sitis.cl"
        target="_blank"
        rel="noopener noreferrer"
        class="site-footer__link"
      >
        <img :src="sitisLogo" alt="SITIS Academia" class="site-footer__logo" />
      </a>
    </p>
  </footer>
</template>

<script setup>
import sitisLogo from '../assets/sitis-wordmark.png';
</script>

<style scoped>
.site-footer {
  padding: 20px 40px;
  text-align: center;
  background: var(--cursos-bg);
  border-top: 1px solid var(--cursos-border);
}

.site-footer__text {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--cursos-font-body);
  font-size: 13px;
  color: var(--cursos-text-muted);
}

.site-footer__link {
  display: inline-flex;
  align-items: center;
  line-height: 0;
}

.site-footer__logo {
  height: 34px;
  width: auto;
  display: block;
  opacity: 0.9;
  transition: opacity 0.15s;
}

.site-footer__link:hover .site-footer__logo {
  opacity: 1;
}

@media (max-width: 768px) {
  .site-footer {
    padding: 16px 20px calc(16px + 64px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
