<template>
  <div class="mt-2 flex items-center justify-center">
    <div
      id="recaptcha-container"
      class="g-recaptcha"
      :data-sitekey="RECAPTCHA"
      data-callback="onReCAPTCHASuccess"
      data-theme="light"
    />
  </div>
</template>

<script setup lang="ts">
declare global {
  interface Window {
    onReCAPTCHASuccess: (token: string) => void
    grecaptcha: any
  }
}

const emit = defineEmits<{ recaptchaToken: [token: string] }>()

const config = useRuntimeConfig()
const RECAPTCHA = (config?.public?.RECAPTCHA_SITE_KEY as string) || ''

const resetCaptcha = () => {
  if (window.grecaptcha?.enterprise) {
    window.grecaptcha.enterprise.reset()
  }
  else if (window.grecaptcha) {
    window.grecaptcha.reset()
  }
}

defineExpose({ resetCaptcha })

onMounted(() => {
  window.onReCAPTCHASuccess = (token: string) => {
    emit('recaptchaToken', token)
  }

  if (document.querySelector('script[src*="recaptcha/enterprise.js"]')) return

  const script = document.createElement('script')
  script.src = 'https://www.google.com/recaptcha/enterprise.js'
  script.defer = true
  document.head.appendChild(script)
})
</script>
