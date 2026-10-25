<template>
    <div class="flex items-start gap-3.5 rounded-2xl bg-warn-soft px-5 py-4 text-[.95rem]" role="note">
        <svg class="mt-0.5 size-5.5 flex-none text-warn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v5M12 16.5v.01" />
        </svg>
        <p><strong class="text-warn">Catatan penting:</strong> <slot /></p>
    </div>
</template>
