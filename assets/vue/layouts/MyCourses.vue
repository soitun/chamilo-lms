<template>
  <SectionHeader :title="t('My courses')">
    <BaseButton
      v-if="showPendingAssignmentsLink"
      :label="t('Pending assignments')"
      icon="assignment"
      to-url="/main/work/pending.php"
      type="primary"
    />
  </SectionHeader>

  <router-view />
</template>

<script setup>
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import SectionHeader from "../components/layout/SectionHeader.vue"
import BaseButton from "../components/basecomponents/BaseButton.vue"
import { usePlatformConfig } from "../store/platformConfig"
import { useSecurityStore } from "../store/securityStore"

const { t } = useI18n()
const platformConfigStore = usePlatformConfig()
const securityStore = useSecurityStore()

const showPendingAssignmentsSetting = computed(() => {
  const value = platformConfigStore.getSetting("work.my_courses_show_pending_work")

  return value === true || value === "true" || value === 1 || value === "1"
})

const canReviewAssignments = computed(() => {
  return Boolean(
    securityStore.isAdmin ||
    securityStore.isTeacher ||
    securityStore.isCurrentTeacher ||
    securityStore.isCurrentCourseTeacher,
  )
})

const showPendingAssignmentsLink = computed(() => {
  return showPendingAssignmentsSetting.value && canReviewAssignments.value
})
</script>
