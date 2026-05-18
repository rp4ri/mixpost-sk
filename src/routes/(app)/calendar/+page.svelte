<script lang="ts">
	let { data } = $props();

	let currentDate = $state(new Date(data.date));
	let viewType = $state(data.type as 'month' | 'week');

	const monthName = $derived(currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' }));

	const daysInMonth = $derived(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDay = new Date(year, month, 1).getDay();
		const lastDate = new Date(year, month + 1, 0).getDate();
		const days: Array<{ date: number; posts: any[] }> = [];

		for (let i = 0; i < firstDay; i++) days.push({ date: 0, posts: [] });
		for (let d = 1; d <= lastDate; d++) {
			const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			const postsOnDay = data.posts.filter((p: any) =>
				p.scheduledAt && new Date(p.scheduledAt).toISOString().split('T')[0] === dateStr
			);
			days.push({ date: d, posts: postsOnDay });
		}
		return days;
	});

	function prevMonth() {
		const d = new Date(currentDate);
		d.setMonth(d.getMonth() - 1);
		currentDate = d;
	}

	function nextMonth() {
		const d = new Date(currentDate);
		d.setMonth(d.getMonth() + 1);
		currentDate = d;
	}
</script>

<div>
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold text-gray-900">Calendar</h2>
		<div class="flex items-center gap-4">
			<button onclick={prevMonth} class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">&larr;</button>
			<span class="text-lg font-medium text-gray-900 min-w-[200px] text-center">{monthName}</span>
			<button onclick={nextMonth} class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">&rarr;</button>
		</div>
	</div>

	<div class="mt-6 grid grid-cols-7 gap-px rounded-xl bg-gray-200 overflow-hidden border border-gray-200">
		{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
			<div class="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500">{day}</div>
		{/each}
		{#each daysInMonth() as day}
			<div class={["bg-white p-2 min-h-[80px]", day.date === 0 ? "bg-gray-50" : ""]}>
				{#if day.date > 0}
					<span class="text-xs font-medium text-gray-500">{day.date}</span>
					{#each day.posts as post}
						<a href="/posts/{post.id}"
							class="mt-1 block truncate rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700 hover:bg-blue-100">
							{new Date(post.scheduledAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
						</a>
					{/each}
				{/if}
			</div>
		{/each}
	</div>
</div>
