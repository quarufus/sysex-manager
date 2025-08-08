import { z } from 'zod/v4';

export const NUMBER_OF_VOICES = 6;

// —— Primitive ranges ——
export const Norm = z.number().min(0).max(1);
export const SNorm = z.number().min(-1).max(1);
export const PresetLevel = z.number().min(0.2239).max(4.4668);
export const u7 = z.number().int().min(0).max(127);

// —— Enums ——
export const DriveMode = z.enum(['Off', 'Low', 'Mid', 'High']);
export const LfoVcoTarget = z.enum(['Vco12', 'Vco1', 'Vco2']);
export const TrackMode = z.enum(['Off', 'Mid', 'High']);
export const Legato = z.enum(['Off', 'On']);
export const Glide = z.enum(['On', 'Auto']);

export const GenericEffectCoefficients = z.object({
	param_1: SNorm,
	param_2: SNorm,
	param_3: SNorm,
	param_4: SNorm,
	param_5: SNorm
});

// —— Effects Parameters ——
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

export const DistortionsParameters = z.object({
	typ: DistortionType,
	gain: Norm,
	level: Norm,
	decimator_frequency: Norm,
	decimator_bitcrush: Norm,
	mix: Norm
});

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

export const CommonModulationParameters = z.object({
	depth: Norm,
	feedback: Norm,
	speed: Norm,
	width: Norm
});

export const DoubleNotchParameters = z.object({
	depth: Norm,
	notch: Norm,
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

export const BarberPolePhaserParameters = z.object({
	mod_frequency: SNorm,
	mod_depth: Norm,
	feedback: Norm,
	phase_shift: Norm
});

export const PitchShifterParameters = z.object({
	pitch_left: SNorm,
	pitch_right: SNorm,
	feedback: Norm,
	damping: SNorm
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
	barber_pole_phaser: BarberPolePhaserParameters,
	double_notch: DoubleNotchParameters,
	pitch_shifter: PitchShifterParameters,
	mix: Norm
});

export const DelaysType = z.enum(['Stereo', 'PingPong', 'BBDDelay', 'RandomRepeater']);

export const StereoDelayParameters = z.object({
	left_time: Norm,
	right_time: Norm,
	feedback: Norm,
	damping: SNorm
});

export const PingPongDelayParameters = z.object({
	time: Norm,
	pan: z.boolean(),
	feedback: Norm,
	damping: SNorm
});

export const BbdDelayParameters = z.object({
	time: Norm,
	feedback: Norm,
	mod_frequency: Norm,
	mod_depth: Norm
});

export const RandomRepeaterParameters = z.object({
	length: Norm,
	envelope: Norm,
	repeats: Norm,
	probability: Norm
});

export const DelaysParameters = z.object({
	typ: DelaysType,
	stereo: StereoDelayParameters,
	ping_pong: PingPongDelayParameters,
	bbd: BbdDelayParameters,
	random_repeater: RandomRepeaterParameters,
	mix: Norm,
	bpm_sync: z.boolean().default(false)
});

export const ReverbsType = z.enum(['Small', 'Large', 'Huge', 'Granular', 'Shimmer']);

export const NormalReverbParameters = z.object({
	pre_delay: Norm,
	size: Norm,
	feedback: Norm,
	damping: SNorm
});

export const HugeReverbParameters = z.object({
	size: Norm,
	feedback: Norm,
	speed: Norm,
	mod_depth: Norm
});

export const GranularReverbParameters = z.object({
	grains: SNorm,
	grain_size: Norm,
	detune: Norm,
	feedback: Norm
});

export const ShimmerReverbParameters = z.object({
	pitch: SNorm,
	size: Norm,
	decay: Norm,
	damping: SNorm
});

export const ReverbsParameters = z.object({
	typ: ReverbsType,
	small: NormalReverbParameters,
	large: NormalReverbParameters,
	huge: HugeReverbParameters,
	shimmer: ShimmerReverbParameters,
	granular: GranularReverbParameters,
	mix: Norm
});

// --- Modulation Coefficients
export const ModulationCoefficients = z.object({
	lfo_1_rate: SNorm,
	lfo_1_fade: SNorm,
	lfo_1_vco_amount: SNorm,
	lfo_1_vcf_amount: SNorm,

	lfo_2_rate: SNorm,
	lfo_2_xmod: SNorm,
	lfo_2_morph_amount: SNorm,
	lfo_2_vco_1_pw_amount: SNorm,

	vco_sub_noise: SNorm,
	vco_mix: SNorm,
	vco_morph: SNorm,
	vco_2_tune: SNorm,
	vco_detune: SNorm,
	vco_glide: SNorm,
	vco_pw: SNorm,
	vco_fm: SNorm,

	lpf_cut: SNorm,
	lpf_cut_eg_amount: SNorm,
	lpf_reson: SNorm,
	lpf_ffm: SNorm,

	hpf_cut: SNorm,
	hpf_reson: SNorm,

	spread: SNorm,

	vca_eg_a: SNorm,
	vca_eg_d: SNorm,
	vca_eg_s: SNorm,
	vca_eg_r: SNorm,

	eg_a: SNorm,
	eg_d: SNorm,
	eg_s: SNorm,
	eg_r: SNorm,

	distortions_generic: GenericEffectCoefficients,
	modulations_generic: GenericEffectCoefficients,
	delays_generic: GenericEffectCoefficients,
	reverbs_generic: GenericEffectCoefficients
});

export const PlayMode = z.enum(['Poly', '_3x2', '_2x3', 'Unison', 'Mono']);

export const Bpm = z.number().min(30).max(300);
export const SEQUENCER_MAX_LENGTH = 64;
export const Gate = z.number().min(0.05).max(1);
export const SequencerLength = z.number().int().min(1).max(SEQUENCER_MAX_LENGTH);
export const SeqType = z.enum(['None', 'Sequencer', 'Arpeggiator']);
export const ArpMode = z.enum(['Up', 'Down', 'Order', 'Inc', 'Exc', 'Random']);
export const NoteInfo = z.object({
	note: u7,
	vel: u7
});

export const Step = z.object({
	notes: z.array(NoteInfo).max(NUMBER_OF_VOICES),
	tied: z.boolean()
});

export const ArpPlayMode = z.enum(['Up', 'Down', 'Order', 'Inc', 'Exc', 'Random']);

export const SeqDivisions = z.enum([
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

export const ArpeggiatorParameters = z.object({
	play_mode: ArpMode,
	divisions: SeqDivisions,
	probability: Norm,
	swing: Norm,
	gate: Gate
});

export const SequencerParameters = z.object({
	length: SequencerLength,
	divisions: SeqDivisions,
	probability: Norm,
	swing: Norm,
	gate: Gate,
	steps: z.array(Step).max(64)
});

export const SeqParameters = z.object({
	typ: SeqType,
	arpeggiator: ArpeggiatorParameters,
	sequencer: SequencerParameters
});

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

export const BaseParameters = z.object({
	lfo_1_rate: Norm,
	lfo_1_fade: Norm,
	lfo_1_wave: Wave,
	lfo_1_vco_target: LfoVcoTarget,
	lfo_1_vco_amount: Norm,
	lfo_1_vcf_amount: Norm,

	lfo_2_rate: Norm,
	lfo_2_xmod: Norm,
	lfo_2_wave: Wave,
	lfo_2_sync_mode: SyncMode,
	lfo_2_morph_amount: Norm,
	lfo_2_vco_1_pw_amount: Norm,

	vco_sub_noise: SNorm,
	vco_mix: Norm,
	vco_morph: Norm,
	vco_sync: z.boolean(),
	vco_2_tune: SNorm,
	vco_detune: Norm,
	vco_glide: Norm,
	vco_pw: Norm,
	vco_fm_eg: z.boolean(),
	vco_fm: Norm,

	lpf_cut: Norm,
	lpf_cut_eg_amount: Norm,
	lpf_reson: Norm,
	lpf_poles: z.boolean(),
	lpf_track: TrackMode,
	lpf_ffm: Norm,
	lpf_ffm_noise_source: z.boolean(),

	hpf_cut: Norm,
	hpf_reson: Norm,

	spread: Norm,

	vca_eg_a: Norm,
	vca_eg_d: Norm,
	vca_eg_s: Norm,
	vca_eg_r: Norm,

	eg_a: Norm,
	eg_d: Norm,
	eg_s: Norm,
	eg_r: Norm,

	play_mode: PlayMode,

	legato: Legato,

	glide: Glide,

	drive_mode: DriveMode,

	level: PresetLevel,

	bpm: Bpm,

	instability_depth: Norm.default(0.0),

	amp_velocity: Norm,

	distortions: DistortionsParameters,
	modulations: ModulationsParameters,
	delays: DelaysParameters,
	reverbs: ReverbsParameters,
	seq: SeqParameters
});

export const Name = z
	.string()
	.max(10)
	.regex(/^[\x20-\x7F]*$/, 'Invalid character.');

export const PresetParameters = z.object({
	name: Name.optional(),
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
