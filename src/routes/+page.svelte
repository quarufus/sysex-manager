<script lang="ts">
	import { onMount } from 'svelte';
	import { messageStatus } from '$lib/utils';

	let selectedInput = $state('');
	let selectedOutput = $state('');
	let midiInputs = $state([]);
	let midiOutputs = $state([]);
	let messages = $state([]);
	let idx = $state(0);
	let textarea = $state('');
	let filters = $state({
		clock: false,
		sysex: true,
		note: true,
		after: true,
		cc: true,
		pc: true,
		pressure: true,
		bend: true
	});
	let files;
	let element;
	let tbody;

	onMount(() => {
		navigator
			.requestMIDIAccess({ sysex: true })
			.then(handleMIDI)
			.catch((error) => {
				console.error(error);
			});
	});

	function handleMIDI(access) {
		midiInputs = Array.from(access.inputs.values());
		midiOutputs = Array.from(access.outputs.values());
		selectedInput = midiInputs[0].id;
		selectedOutput = midiOutputs[0].id;
		midiInputs[0].onmidimessage = handleMIDIMessage;

		access.onstatechange = () => {
			midiInputs = Array.from(access.inputs.values());
			midiOutputs = Array.from(access.outputs.values());
		};
	}

	function handleMIDIMessage(msg) {
		const status = msg.data[0];
		if (status == 248 && !filters.clock) {
			return;
		}
		if ((status == 240 || status == 247) && !filters.sysex) {
			return;
		}
		if (status >= 128 && status <= 159 && !filters.note) {
			return;
		}
		if (status >= 160 && status <= 175 && !filters.after) {
			return;
		}
		if (status >= 176 && status <= 191 && !filters.cc) {
			return;
		}
		if (status >= 192 && status <= 207 && !filters.pc) {
			return;
		}
		if (status >= 208 && status <= 223 && !filters.pressure) {
			return;
		}
		if (status >= 224 && status <= 239 && !bend) {
			return;
		}

		const device = midiInputs.find((d) => d.id == selectedInput);
		idx++;
		let s = [];
		msg.data.forEach((v) => s.push(v.toString(16).toUpperCase().padStart(2, '0')));
		messages.push({
			id: idx,
			timestamp: msg.timeStamp,
			manufacturer: device.manufacturer,
			device: device.name,
			message: messageStatus(msg),
			raw: s.join(' '),
			data: msg.data
		});
		scrollToBottom(element);
	}

	function sendInput() {
		const data = textarea
			.replaceAll('\n', ' ')
			.split(' ')
			.map((c) => parseInt(c, 16));
		const device = midiOutputs.find((d) => d.id == selectedOutput);
		device.send(data);
	}

	function onInputChange() {
		midiInputs.forEach((input) => {
			input.onmidimessage = null;
		});
		const device = midiInputs.find((d) => d.id == selectedInput);
		device.onmidimessage = handleMIDIMessage;
	}

	async function loadFile() {
		if (!files) {
			return;
		}
		let text = await files[0].bytes();
		const hex = [];
		for (var i = 0; i < text.length; i++) {
			hex.push(text[i].toString(16).toUpperCase().padStart(2, '0'));
		}
		textarea = hex.join(' ').replaceAll('F7 ', 'F7\n');
	}

	function downloadMessage(msg) {
		var binary = [];
		for (var i = 0; i < msg.length; i++) {
			binary[i] = parseInt(msg[i].toString(16), 16);
		}
		var byteArray = new Uint8Array(binary);
		const blob = new Blob([byteArray], { type: 'application/octet-stream' });
		const url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.download = 'data.syx';
		a.href = url;
		a.click();
		window.URL.revokeObjectURL(url);
	}

	function onKeyDown(e) {
		if (e.keyCode == 13) {
			console.log('lala');
		}
	}

	const scrollToBottom = async (node) => {
		node.scrollTop = node.scrollHeight;
	};
</script>

<h1 class="m-4 text-2xl">Sysex Manager</h1>
<div
	class="m-4 my-2.5 grid h-[80vh] grid-cols-2 grid-rows-[min-content_min-content_auto_min-content] gap-2.5"
>
	<div></div>
	<div>
		<input type="checkbox" id="clock" name="clock" bind:checked={filters.clock} />
		<label for="clock">Clock</label>
		<input type="checkbox" id="onoff" name="onoff" bind:checked={filters.note} />
		<label for="onoff">Note On/Off</label>
		<input type="checkbox" id="after" name="after" bind:checked={filters.after} />
		<label for="after">Aftertouch</label>
		<input type="checkbox" id="cc" name="cc" bind:checked={filters.cc} />
		<label for="cc">Control Change</label>
		<input type="checkbox" id="pc" name="pc" bind:checked={filters.pc} />
		<label for="pc">Program Change</label>
		<input type="checkbox" id="pressure" name="pressure" bind:checked={filters.pressure} />
		<label for="pressure">Channel Pressure</label>
		<input type="checkbox" id="bend" name="bend" bind:checked={filters.bend} />
		<label for="bend">Pitch Bend</label>
		<input type="checkbox" id="sysex" name="sysex" bind:checked={filters.sysex} />
		<label for="sysex">SysEx</label>
	</div>
	<div class="flex justify-between">
		<form>
			<label for="device_out" id="device_out">MIDI out device</label>
			<select class="w-2/3" bind:value={selectedOutput} name="device_out" id="select_out">
				{#each midiOutputs as device (device.id)}
					<option value={device.id}>{device.name}</option>
				{/each}
			</select>
		</form>
		<input bind:files onchange={loadFile} type="file" id="file_input" />
	</div>
	<div class="flex justify-between">
		<form>
			<label for="device" id="device"
				>MIDI in device
				<select bind:value={selectedInput} onchange={onInputChange} name="device" id="select">
					{#each midiInputs as device (device.id)}
						<option value={device.id}>{device.name}</option>
					{/each}
				</select></label
			>
		</form>
		<!-- <button onclick={downloadMessage} id="download">Download last message</button> -->
	</div>
	<!-- <div class="win"> -->
	<textarea
		class="resize-none overflow-auto whitespace-nowrap"
		id="t"
		bind:value={textarea}
		onkeydown={onKeyDown}
	>
	</textarea>
	<!-- </div> -->
	<div class="win overflow-auto border text-wrap" id="in" bind:this={element}>
		<table class="w-full border-collapse" id="table">
			<thead class="sticky top-0">
				<tr class="border-t-0">
					<th class="border border-t-0 border-l-0" style="width: 15%;">Timestamp</th>
					<th class="border border-t-0" style="width: 20%;">Manufacturer</th>
					<th class="border border-t-0" style="width: 10%;">Device</th>
					<th class="border border-t-0" style="width: 30%;">Message</th>
					<th class="border border-t-0 border-r-0" style="width: 25%;">Raw</th>
				</tr>
			</thead>
			<tbody bind:this={tbody}>
				{#each messages as msg (msg.id)}
					<tr class="last:border-b-0">
						<td class="border border-l-0">{msg.timestamp}</td>
						<td class="border">{msg.manufacturer}</td>
						<td class="border">{msg.device}</td>
						<td class="border">{msg.message}</td>
						<td class="border border-r-0 p-2"
							><div class="flex justify-between">
								{msg.raw}<button
									class="cursor-grab border"
									onclick={() => downloadMessage(msg.data)}>dl</button
								>
							</div></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<button onclick={sendInput}>Send</button>
	<button onclick={() => (messages = [])}>Clear</button>
</div>
