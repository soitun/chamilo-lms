<script setup>
import { computed, ref, watch } from "vue"
import { storeToRefs } from "pinia"
import { useCidReqStore } from "../../store/cidReq"
import { usePlatformConfig } from "../../store/platformConfig"
import courseService from "../../services/courseService"

const cidReqStore = useCidReqStore()
const { course, session, group } = storeToRefs(cidReqStore)

const platformConfigStore = usePlatformConfig()

const tools = ref([])
const isLoading = ref(false)

const isEnabled = computed(() => {
  const value = platformConfigStore.getSetting("course.show_toolshortcuts")

  return value === true || value === "true" || value === 1 || value === "1"
})

const visibleTools = computed(() => {
  return tools.value.filter((courseTool) => {
    if (!courseTool?.url) {
      return false
    }

    return (
      courseTool.visibility === true ||
      courseTool.visibility === 1 ||
      courseTool.visibility === 2 ||
      courseTool.visibility === "true" ||
      courseTool.visibility === "1" ||
      courseTool.visibility === "2"
    )
  })
})

function getToolTitle(courseTool) {
  return courseTool?.tool?.titleToShow || courseTool?.title || courseTool?.tool?.title || ""
}

function getToolIconClass(courseTool) {
  const icon = courseTool?.tool?.icon || "mdi-tools"

  if (icon.startsWith("mdi-")) {
    return `mdi ${icon}`
  }

  return `mdi mdi-${icon}`
}

function appendMissingParam(url, key, value) {
  if (!value) {
    return url
  }

  try {
    const parsedUrl = new URL(url, window.location.origin)

    if (!parsedUrl.searchParams.has(key)) {
      parsedUrl.searchParams.set(key, value)
    }

    return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash
  } catch (error) {
    return url
  }
}

function getToolUrl(courseTool) {
  let url = courseTool?.url || "#"

  if (!url.startsWith("/") && !url.startsWith(window.location.origin)) {
    return "#"
  }

  if (session.value?.id) {
    url = appendMissingParam(url, "sid", session.value.id)
  }

  if (group.value?.id) {
    url = appendMissingParam(url, "gid", group.value.id)
  }

  return url
}

function isCurrentTool(courseTool) {
  try {
    const toolUrl = new URL(getToolUrl(courseTool), window.location.origin)

    return toolUrl.pathname === window.location.pathname
  } catch (error) {
    return false
  }
}

async function loadCourseTools() {
  if (!isEnabled.value || !course.value?.id) {
    tools.value = []
    return
  }

  isLoading.value = true

  try {
    tools.value = await courseService.loadCTools(course.value.id, session.value?.id || 0)
  } catch (error) {
    console.error("Error loading course tool shortcuts:", error)
    tools.value = []
  } finally {
    isLoading.value = false
  }
}

watch(
  () => [isEnabled.value, course.value?.id, session.value?.id],
  () => loadCourseTools(),
  { immediate: true },
)
</script>

<template>
  <nav
    v-if="isEnabled && !isLoading && visibleTools.length"
    class="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-gray-25 bg-white p-2 shadow-sm"
    aria-label="Course tool shortcuts"
  >
    <a
      v-for="courseTool in visibleTools"
      :key="courseTool.iid"
      :href="getToolUrl(courseTool)"
      :class="[
        'inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-70 transition hover:bg-primary hover:text-white',
        { 'bg-primary text-white': isCurrentTool(courseTool) },
      ]"
      :title="getToolTitle(courseTool)"
      :aria-label="getToolTitle(courseTool)"
    >
      <i
        :class="getToolIconClass(courseTool)"
        class="text-xl"
        aria-hidden="true"
      />
    </a>
  </nav>
</template>
