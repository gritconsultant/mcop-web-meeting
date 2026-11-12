<script setup lang="ts">
import { DEFAULT_ROUTE } from "~/composables/useNavigation";

await navigateTo(DEFAULT_ROUTE, { replace: true });
</script>
