import { z } from 'zod/v4';

export const NUMBER_OF_VOICES = 6;
export const SEQUENCER_MAX_LENGTH = 64;

// —— Primitive ranges ——
export const Norm = z.number().min(0).max(1);
export const SNorm = z.number().min(-1).max(1);
export const Gate = z.number().min(0.05).max(1);
export const PresetLevel = z.number().min(0.2).max(4);
export const Bpm = z.number().min(30).max(300);
export const u7 = z.number().int().min(0).max(127);
export const SequencerLength = z.number().int().min(1).max(SEQUENCER_MAX_LENGTH);

// —— Enums ——
export const VoicePlayMode = z.enum(['Poly', 'Tri', 'Duo', 'Unison', 'Mono']);
export const ArpPlayMode = z.enum(['Up', 'Down', 'Order', 'Inc', 'Exc', 'Random']);
export const Divisions = z.enum([
	'D4',
	'D3',
	'D2',
	'D1_5',
	'X1',
	'X1_5',
	'X2',
	'X3',
	'X4',
	'X6',
	'X8',
	'X12'
]);
export const SyncMode = z.enum(['Free', 'Key', 'Bpm', 'BpmKey']);
export const Wave = z.enum([
	'Sine',
	'Triangle',
	'Saw',
	'Ramp',
	'Square',
	'Random',
	'EnvPlus',
	'EnvMinus'
]);
export const LfoVcoTarget = z.enum(['Vco1', 'Vco2', 'Vco12']);
export const TrackMode = z.enum(['Off', 'Mid', 'High']);
export const Legato = z.enum(['Off', 'On']);
export const Glide = z.enum(['On', 'Auto']);
export const SeqType = z.enum(['None', 'Arpeggiator', 'Sequencer']);
export const DriveMode = z.enum(['Off', 'Low', 'Mid', 'High']);
export const DistortionType = z.enum([
	'Exponential',
	'Parabolic',
	'SineClip',
	'SCurve',
	'SoftClip',
	'HardClip',
	'TriangleClip',
	'TriangleFoldback',
	'SingleFoldback',
	'MultiFoldback',
	'SineBend',
	'SineFoldback',
	'SineShred',
	'BinaryShred',
	'SymmetricWrap'
]);
export const ModulationsType = z.enum([
	'Chorus',
	'Ensemble',
	'TapeChorus',
	'BBDChorus',
	'Flanger',
	'BBDFlanger',
	'ThroughZeroFlanger',
	'Phaser',
	'BarberPolePhaser',
	'DoubleNotch',
	'PitchShifter'
]);
export const DelaysType = z.enum(['Stereo', 'PingPong', 'BBDDelay', 'RandomRepeater']);
export const ReverbsType = z.enum(['Small', 'Large', 'Huge', 'Granular', 'Shimmer']);

// —— Low-level structs ——
export const NoteInfo = z.object({
	note: u7,
	vel: u7
});

export const Step = z.object({
	notes: z.array(NoteInfo).max(NUMBER_OF_VOICES),
	tied: z.boolean()
});

// —— Effects Parameters ——
export const DistortionsParameters = z.object({
	typ: DistortionType,
	gain: Norm,
	level: Norm,
	decimator_frequency: Norm,
	decimator_bitcrush: Norm,
	mix: Norm
});

export const CommonModulationParameters = z.object({
	depth: Norm,
	feedback: Norm,
	speed: Norm,
	width: Norm
});

export const FlangerParameters = z.object({
	depth: Norm,
	feedback: SNorm,
	speed: Norm,
	width: Norm
});

export const PhaserParameters = z.object({
	mod_frequency: Norm,
	mod_depth: Norm,
	feedback: Norm,
	phase_shift: Norm
});

export const ModulationsParameters = z.object({
	typ: ModulationsType,
	chorus: CommonModulationParameters,
	ensemble: CommonModulationParameters,
	tape_chorus: CommonModulationParameters,
	bbd_chorus: CommonModulationParameters,
	flanger: FlangerParameters,
	bbd_flanger: FlangerParameters,
	through_zero_flanger: FlangerParameters,
	phaser: PhaserParameters,
	mix: Norm
});

export const StereoDelay = z.object({
	left_time: Norm,
	right_time: Norm,
	feedback: Norm,
	damping: SNorm
});

export const PingPongDelay = z.object({
	time: Norm,
	pan: z.boolean(),
	feedback: Norm,
	damping: SNorm
});

export const BbdDelay = z.object({
	time: Norm,
	feedback: Norm,
	mod_frequency: Norm,
	mod_depth: Norm
});

export const RandomRepeaterDelay = z.object({
	length: Norm,
	envelope: Norm,
	repeats: Norm,
	probability: Norm
});

export const DelaysParameters = z.object({
	typ: DelaysType,
	stereo: StereoDelay,
	ping_pong: PingPongDelay,
	bbd: BbdDelay,
	random_repeater: RandomRepeaterDelay,
	mix: Norm
});

export const SmallReverb = z.object({
	pre_delay: Norm,
	size: Norm,
	feedback: Norm,
	damping: SNorm
});

export const LargeReverb = z.object({
	pre_delay: Norm,
	size: Norm,
	feedback: Norm,
	damping: SNorm
});

export const HugeReverb = z.object({
	size: Norm,
	feedback: Norm,
	speed: Norm,
	mod_depth: Norm
});

export const ShimmerRevertb = z.object({
	pitch: Norm,
	size: Norm,
	decay: Norm,
	damping: SNorm
});

export const GranularReverb = z.object({
	grains: SNorm,
	grain_size: Norm,
	detune: Norm,
	feedback: Norm
});

export const ReverbsParameters = z.object({
	typ: ReverbsType,
	small: SmallReverb,
	large: LargeReverb,
	huge: HugeReverb,
	shimmer: ShimmerRevertb,
	granular: GranularReverb,
	mix: Norm
});

export const ArpeggiatorParameters = z.object({
	play_mode: ArpPlayMode,
	divisions: Divisions,
	probability: Norm,
	swing: Norm,
	gate: Gate
});

export const SequencerParameters = z.object({
	length: SequencerLength,
	divisions: Divisions,
	probability: Norm,
	swing: Norm,
	gate: Gate,
	steps: z.array(Step).max(64) // Simplified to 16 steps for demo
});

export const SeqParameters = z.object({
	typ: SeqType,
	arpeggiator: ArpeggiatorParameters,
	sequencer: SequencerParameters
});

export const ModulationCoefficients = z.object({
	lfo_1_rate: SNorm,
	lfo_1_fade: SNorm,
	lfo_1_vco_amount: SNorm,
	lfo_1_vcf_amount: SNorm,
	lfo_2_rate: SNorm,
	lfo_2_xmod: SNorm,
	lfo_2_morph_amount: Norm,
	lfo_2_vco_1_pw_amount: Norm,
	vco_sub_noise: Norm,
	vco_mix: Norm,
	vco_morph: Norm,
	vco_2_tune: Norm,
	vco_detune: Norm,
	vco_glide: Norm,
	vco_pw: SNorm,
	vco_fm: Norm,
	lpf_cut: SNorm,
	lpf_reson: Norm,
	lpf_ffm: Norm,
	hpf_cut: Norm,
	hpf_reson: Norm,
	spread: Norm,
	vca_eg_a: Norm,
	vca_eg_d: Norm,
	vca_eg_s: Norm,
	vca_eg_r: Norm
	//level: PresetLevel
});

export const BaseParameters = z.object({
	// Oscillators
	vco_mix: Norm,
	vco_morph: Norm,
	vco_sync: z.boolean(),
	vco_2_tune: SNorm,
	vco_detune: Norm,
	vco_glide: Norm,
	vco_pw: Norm,
	vco_fm: Norm,

	// LFOs
	lfo_1_rate: Norm,
	lfo_1_fade: Norm,
	lfo_1_wave: Wave,
	lfo_1_vco_target: LfoVcoTarget,
	lfo_1_vco_amount: Norm,
	lfo_1_vcf_amount: Norm,

	lfo_2_rate: Norm,
	lfo_2_wave: Wave,
	lfo_2_sync_mode: SyncMode,

	// Filters
	lpf_cut: Norm,
	lpf_cut_eg_amount: Norm,
	lpf_reson: Norm,
	lpf_poles: z.boolean(),
	lpf_track: TrackMode,

	hpf_cut: Norm,
	hpf_reson: Norm,

	// Envelopes
	vca_eg_a: Norm,
	vca_eg_d: Norm,
	vca_eg_s: Norm,
	vca_eg_r: Norm,

	eg_a: Norm,
	eg_d: Norm,
	eg_s: Norm,
	eg_r: Norm,

	// Global
	play_mode: VoicePlayMode,
	legato: Legato,
	glide: Glide,
	drive_mode: DriveMode,
	level: PresetLevel,
	bpm: Bpm,
	amp_velocity: Norm,

	// Effects
	distortions: DistortionsParameters,
	modulations: ModulationsParameters,
	delays: DelaysParameters,
	reverbs: ReverbsParameters,
	seq: SeqParameters
});

export const PresetParameters = z.object({
	name: z.string().max(10).optional(),
	base: BaseParameters,
	mod_wheel: ModulationCoefficients,
	velocity: ModulationCoefficients,
	aftertouch: ModulationCoefficients
});

export const Bank = z.object({ BankBackup: z.number().min(0).max(7) });

export const BankBackup = z
	.tuple([Bank])
	.rest(z.any())
	.refine((arr) => arr.length == 65, {
		error: 'Expected 1 bank and 64 presets (65 items total)'
	})
	.transform(([bank, ...presets]) => ({
		bank: bank.BankBackup,
		presets: presets
	}));

export const PresetBackup = z.tuple([z.literal('PresetBackup'), PresetParameters]);

export const ArtemisMessage = z.union([BankBackup, PresetBackup]);
