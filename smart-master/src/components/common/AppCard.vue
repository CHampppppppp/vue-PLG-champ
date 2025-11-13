<template>
  <section
    class="app-card"
    :class="{
      'app-card--elevated': elevated,
      'app-card--bordered': bordered,
      'app-card--padded': padded
    }"
  >
    <header v-if="showHeader" class="app-card__header">
      <div class="app-card__header-left">
        <div v-if="$slots.icon" class="app-card__icon">
          <slot name="icon" />
        </div>
        <div class="app-card__header-text">
          <h3 v-if="title" class="app-card__title">{{ title }}</h3>
          <p v-if="subtitle" class="app-card__subtitle">{{ subtitle }}</p>
        </div>
        <slot v-if="!title" name="title" />
      </div>
      <div class="app-card__header-actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="app-card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="app-card__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  elevated: {
    type: Boolean,
    default: false
  },
  bordered: {
    type: Boolean,
    default: true
  },
  padded: {
    type: Boolean,
    default: true
  }
})

const slots = useSlots()

const showHeader = computed(() => props.title || props.subtitle || !!slots.title || !!slots.actions || !!slots.icon)
</script>

<style scoped>
.app-card {
  background: #fff;
  border-radius: var(--card-radius, 12px);
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: none;
  transition: transform var(--transition-base, 0.25s ease), box-shadow var(--transition-base, 0.25s ease);
  display: flex;
  flex-direction: column;
}

.app-card--elevated {
  box-shadow: var(--card-shadow, 0 12px 32px rgba(15, 23, 42, 0.08));
}

.app-card--bordered {
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.app-card--padded .app-card__body {
  padding: 20px;
}

.app-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
  background: linear-gradient(180deg, #f8fbff 0%, #f3f4f6 100%);
}

.app-card__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.app-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(64, 158, 255, 0.12);
  color: #1d4ed8;
}

.app-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.app-card__subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.app-card__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-card__body {
  flex: 1;
}

.app-card__footer {
  border-top: 1px solid rgba(226, 232, 240, 0.7);
  padding: 16px 20px;
  background: rgba(248, 250, 252, 0.65);
}
</style>
