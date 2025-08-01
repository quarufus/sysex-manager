type ManufacturerId = string[];
type ModelId = string[];

export function getManufacturer(id: Uint8Array | ManufacturerId): string {
	let key: string;
	if (id instanceof Uint8Array) {
		if (id[1].toString(16) == '0') {
			key = Array.from(id.slice(1, 4))
				.map((v) => v.toString(16).padStart(2, '0'))
				.join(',')
				.toUpperCase();
		} else {
			key = id[1].toString(16);
		}

		return MIDI_MANUFACTURERS[key] || 'Unknown Manufacturer';
	} else {
		if (id[1] === '00') {
			key = id.slice(1, 4).join(',').toUpperCase();
		} else {
			key = id[1].toString();
		}

		return MIDI_MANUFACTURERS[key] || 'Unknown Manufacturer';
	}
}

export function getModel(manufacturer: string, id: ModelId): string {
	const key: string = id.slice(0, 2).join(',').toUpperCase();

	return MIDI_MODELS[manufacturer][key] || 'Unknown Model';
}

export function getInfo(data: Uint8Array): [string, string] {
	const manufacturer = getManufacturer(data);
	const start = data[1] == 0 ? 4 : 2;
	const modelId = Array.from(data.slice(start, start + 2)).map((v) =>
		v.toString(16).padStart(2, '0').toUpperCase()
	);
	const model = getModel(manufacturer, modelId);
	return [manufacturer, model];
}

const MIDI_MODELS: Record<string, Record<string, string>> = {
	'Dreadbox P.C.': {
		'00,06': 'Nymphes',
		'00,09': 'Artemis'
	},
	'Elektron ESI AB': {
		'11,00': 'Model:Cycles',
		'0F,00': 'Model:Samples',
		'05,00': 'Oktatrack'
	}
};

const MIDI_MANUFACTURERS: Record<string, string> = {
	'00': '[Used for ID Extensions]',
	'01': 'Sequential Circuits',
	'02': 'IDP',
	'03': 'Voyetra Turtle Beach, Inc.',
	'04': 'Moog Music',
	'05': 'Passport Designs',
	'06': 'Lexicon Inc.',
	'07': 'Kurzweil / Young Chang',
	'08': 'Fender',
	'09': 'MIDI9',
	'0A': 'AKG Acoustics',
	'0B': 'Voyce Music',
	'0C': 'WaveFrame (Timeline)',
	'0D': 'ADA Signal Processors, Inc.',
	'0E': 'Garfield Electronics',
	'0F': 'Ensoniq',
	'10': 'Oberheim',
	'11': 'Apple',
	'12': 'Grey Matter Response',
	'13': 'Digidesign Inc.',
	'14': 'Palmtree Instruments',
	'15': 'JLCooper Electronics',
	'16': 'Lowrey Organ Company',
	'17': 'Adams-Smith',
	'18': 'E-mu',
	'19': 'Harmony Systems',
	'1A': 'ART',
	'1B': 'Baldwin',
	'1C': 'Eventide',
	'1D': 'Inventronics',
	'1E': 'Key Concepts',
	'1F': 'Clarity',
	'20': 'Passac',
	'21': 'Proel Labs (SIEL)',
	'22': 'Synthaxe (UK)',
	'23': 'Stepp',
	'24': 'Hohner',
	'25': 'Twister',
	'26': 'Ketron s.r.l.',
	'27': 'Jellinghaus MS',
	'28': 'Southworth Music Systems',
	'29': 'PPG (Germany)',
	'2A': 'CESYG Ltd.',
	'2B': 'Solid State Logic Organ Systems',
	'2C': 'Audio Veritrieb-P. Struven',
	'2D': 'Neve',
	'2E': 'Soundtracs Ltd.',
	'2F': 'Elka',
	'30': 'Dynacord',
	'31': 'Viscount International Spa (Intercontinental Electronics)',
	'32': 'Drawmer',
	'33': 'Clavia Digital Instruments',
	'34': 'Audio Architecture',
	'35': 'Generalmusic Corp SpA',
	'36': 'Cheetah Marketing',
	'37': 'C.T.M.',
	'38': 'Simmons UK',
	'39': 'Soundcraft Electronics',
	'3A': 'Steinberg Media Technologies GmbH',
	'3B': 'Wersi Gmbh',
	'3C': 'AVAB Niethammer AB',
	'3D': 'Digigram',
	'3E': 'Waldorf Electronics GmbH',
	'3F': 'Quasimidi',
	'00,00,01': 'Time/Warner Interactive',
	'00,00,02': 'Advanced Gravis Comp. Tech Ltd.',
	'00,00,03': 'Media Vision',
	'00,00,04': 'Dornes Research Group',
	'00,00,05': 'K-Muse',
	'00,00,06': 'Stypher',
	'00,00,07': 'Digital Music Corp.',
	'00,00,08': 'IOTA Systems',
	'00,00,09': 'New England Digital',
	'00,00,0A': 'Artisyn',
	'00,00,0B': 'IVL Technologies Ltd.',
	'00,00,0C': 'Southern Music Systems',
	'00,00,0D': 'Lake Butler Sound Company',
	'00,00,0E': 'Alesis Studio Electronics',
	'00,00,0F': 'Sound Creation',
	'00,00,10': 'DOD Electronics Corp.',
	'00,00,11': 'Studer-Editech',
	'00,00,12': 'Sonus',
	'00,00,13': 'Temporal Acuity Products',
	'00,00,14': 'Perfect Fretworks',
	'00,00,15': 'KAT Inc.',
	'00,00,16': 'Opcode Systems',
	'00,00,17': 'Rane Corporation',
	'00,00,18': 'Anadi Electronique',
	'00,00,19': 'KMX',
	'00,00,1A': 'Allen & Heath Brenell',
	'00,00,1B': 'Peavey Electronics',
	'00,00,1C': '360 Systems',
	'00,00,1D': 'Spectrum Design and Development',
	'00,00,1E': 'Marquis Music',
	'00,00,1F': 'Zeta Systems',
	'00,00,20': 'Axxes (Brian Parsonett)',
	'00,00,21': 'Orban',
	'00,00,22': 'Indian Valley Mfg.',
	'00,00,23': 'Triton',
	'00,00,24': 'KTI',
	'00,00,25': 'Breakaway Technologies',
	'00,00,26': 'Leprecon / CAE Inc.',
	'00,00,27': 'Harrison Systems Inc.',
	'00,00,28': 'Future Lab/Mark Kuo',
	'00,00,29': 'Rocktron Corporation',
	'00,00,2A': 'PianoDisc',
	'00,00,2B': 'Cannon Research Group',
	'00,00,2C': 'Reserved',
	'00,00,2D': 'Rodgers Instrument LLC',
	'00,00,2E': 'Blue Sky Logic',
	'00,00,2F': 'Encore Electronics',
	'00,00,30': 'Uptown',
	'00,00,31': 'Voce',
	'00,00,32': 'CTI Audio, Inc. (Musically Intel. Devs.)',
	'00,00,33': 'S3 Incorporated',
	'00,00,34': 'Broderbund / Red Orb',
	'00,00,35': 'Allen Organ Co.',
	'00,00,36': 'Reserved',
	'00,00,37': 'Music Quest',
	'00,00,38': 'Aphex',
	'00,00,39': 'Gallien Krueger',
	'00,00,3A': 'IBM',
	'00,00,3B': 'Mark Of The Unicorn',
	'00,00,3C': 'Hotz Corporation',
	'00,00,3D': 'ETA Lighting',
	'00,00,3E': 'NSI Corporation',
	'00,00,3F': 'Ad Lib, Inc.',
	'00,00,40': 'Richmond Sound Design',
	'00,00,41': 'Microsoft',
	'00,00,42': 'Mindscape (Software Toolworks)',
	'00,00,43': 'Russ Jones Marketing / Niche',
	'00,00,44': 'Intone',
	'00,00,45': 'Advanced Remote Technologies',
	'00,00,46': 'White Instruments',
	'00,00,47': 'GT Electronics/Groove Tubes',
	'00,00,48': 'Pacific Research & Engineering',
	'00,00,49': 'Timeline Vista, Inc.',
	'00,00,4A': 'Mesa Boogie Ltd.',
	'00,00,4B': 'FSLI',
	'00,00,4C': 'Sequoia Development Group',
	'00,00,4D': 'Studio Electronics',
	'00,00,4E': 'Euphonix, Inc',
	'00,00,4F': 'InterMIDI, Inc.',
	'00,00,50': 'MIDI Solutions Inc.',
	'00,00,51': '3DO Company',
	'00,00,52': 'Lightwave Research / High End Systems',
	'00,00,53': 'Micro-W Corporation',
	'00,00,54': 'Spectral Synthesis, Inc.',
	'00,00,55': 'Lone Wolf',
	'00,00,56': 'Studio Technologies Inc.',
	'00,00,57': 'Peterson Electro-Musical Product, Inc.',
	'00,00,58': 'Atari Corporation',
	'00,00,59': 'Marion Systems Corporation',
	'00,00,5A': 'Design Event',
	'00,00,5B': 'Winjammer Software Ltd.',
	'00,00,5C': 'AT&T Bell Laboratories',
	'00,00,5D': 'Reserved',
	'00,00,5E': 'Symetrix',
	'00,00,5F': 'MIDI the World',
	'00,00,60': 'Spatializer',
	'00,00,61': 'Micros ‘N MIDI',
	'00,00,62': 'Accordians International',
	'00,00,63': 'EuPhonics (now 3Com)',
	'00,00,64': 'Musonix',
	'00,00,65': 'Turtle Beach Systems (Voyetra)',
	'00,00,66': 'Loud Technologies / Mackie',
	'00,00,67': 'Compuserve',
	'00,00,68': 'BEC Technologies',
	'00,00,69': 'QRS Music Inc',
	'00,00,6A': 'P.G. Music',
	'00,00,6B': 'Sierra Semiconductor',
	'00,00,6C': 'EpiGraf',
	'00,00,6D': 'Electronics Diversified Inc',
	'00,00,6E': 'Tune 1000',
	'00,00,6F': 'Advanced Micro Devices',
	'00,00,70': 'Mediamation',
	'00,00,71': 'Sabine Musical Mfg. Co. Inc.',
	'00,00,72': 'Woog Labs',
	'00,00,73': 'Micropolis Corp',
	'00,00,74': 'Ta Horng Musical Instrument',
	'00,00,75': 'e-Tek Labs (Forte Tech)',
	'00,00,76': 'Electro-Voice',
	'00,00,77': 'Midisoft Corporation',
	'00,00,78': 'QSound Labs',
	'00,00,79': 'Westrex',
	'00,00,7A': 'Nvidia',
	'00,00,7B': 'ESS Technology',
	'00,00,7C': 'Media Trix Peripherals',
	'00,00,7D': 'Brooktree Corp',
	'00,00,7E': 'Otari Corp',
	'00,00,7F': 'Key Electronics, Inc.',
	'00,01,00': 'Shure Incorporated',
	'00,01,01': 'AuraSound',
	'00,01,02': 'Crystal Semiconductor',
	'00,01,03': 'Conexant (Rockwell)',
	'00,01,04': 'Silicon Graphics',
	'00,01,05': 'M-Audio (Midiman)',
	'00,01,06': 'PreSonus',
	'00,01,08': 'Topaz Enterprises',
	'00,01,09': 'Cast Lighting',
	'00,01,0A': 'Microsoft Consumer Division',
	'00,01,0B': 'Sonic Foundry',
	'00,01,0C': 'Line 6 (Fast Forward) (Yamaha)',
	'00,01,0D': 'Beatnik Inc',
	'00,01,0E': 'Van Koevering Company',
	'00,01,0F': 'Altech Systems',
	'00,01,10': 'S & S Research',
	'00,01,11': 'VLSI Technology',
	'00,01,12': 'Chromatic Research',
	'00,01,13': 'Sapphire',
	'00,01,14': 'IDRC',
	'00,01,15': 'Justonic Tuning',
	'00,01,16': 'TorComp Research Inc.',
	'00,01,17': 'Newtek Inc.',
	'00,01,18': 'Sound Sculpture',
	'00,01,19': 'Walker Technical',
	'00,01,1A': 'Digital Harmony (PAVO)',
	'00,01,1B': 'InVision Interactive',
	'00,01,1C': 'T-Square Design',
	'00,01,1D': 'Nemesys Music Technology',
	'00,01,1E': 'DBX Professional (Harman Intl)',
	'00,01,1F': 'Syndyne Corporation',
	'00,01,20': 'Bitheadz',
	'00,01,21': 'BandLab Technologies',
	'00,01,22': 'Analog Devices',
	'00,01,23': 'National Semiconductor',
	'00,01,24': 'Boom Theory / Adinolfi Alternative Percussion',
	'00,01,25': 'Virtual DSP Corporation',
	'00,01,26': 'Antares Systems',
	'00,01,27': 'Angel Software',
	'00,01,28': 'St Louis Music',
	'00,01,29': 'Passport Music Software LLC (Gvox)',
	'00,01,2A': 'Ashley Audio Inc.',
	'00,01,2B': 'Vari-Lite Inc.',
	'00,01,2C': 'Summit Audio Inc.',
	'00,01,2D': 'Aureal Semiconductor Inc.',
	'00,01,2E': 'SeaSound LLC',
	'00,01,2F': 'U.S. Robotics',
	'00,01,30': 'Aurisis Research',
	'00,01,31': 'Nearfield Research',
	'00,01,32': 'FM7 Inc',
	'00,01,33': 'Swivel Systems',
	'00,01,34': 'Hyperactive Audio Systems',
	'00,01,35': 'MidiLite (Castle Studios Productions)',
	'00,01,36': 'Radikal Technologies',
	'00,01,37': 'Roger Linn Design',
	'00,01,38': 'TC-Helicon Vocal Technologies',
	'00,01,39': 'Event Electronics',
	'00,01,3A': 'Sonic Network Inc',
	'00,01,3B': 'Realtime Music Solutions',
	'00,01,3C': 'Apogee Digital',
	'00,01,3D': 'Classical Organs, Inc.',
	'00,01,3E': 'Microtools Inc.',
	'00,01,3F': 'Numark Industries',
	'00,01,40': 'Frontier Design Group, LLC',
	'00,01,41': 'Recordare LLC',
	'00,01,42': 'Starr Labs',
	'00,01,43': 'Voyager Sound Inc.',
	'00,01,44': 'Manifold Labs',
	'00,01,45': 'Aviom Inc.',
	'00,01,46': 'Mixmeister Technology',
	'00,01,47': 'Notation Software',
	'00,01,48': 'Mercurial Communications',
	'00,01,49': 'Wave Arts',
	'00,01,4A': 'Logic Sequencing Devices',
	'00,01,4B': 'Axess Electronics',
	'00,01,4C': 'Muse Research',
	'00,01,4D': 'Open Labs',
	'00,01,4E': 'Guillemot Corp',
	'00,01,4F': 'Samson Technologies',
	'00,01,50': 'Electronic Theatre Controls',
	'00,01,51': 'Blackberry (RIM)',
	'00,01,52': 'Mobileer',
	'00,01,53': 'Synthogy',
	'00,01,54': 'Lynx Studio Technology Inc.',
	'00,01,55': 'Damage Control Engineering LLC',
	'00,01,56': 'Yost Engineering, Inc.',
	'00,01,57': 'Brooks & Forsman Designs LLC / DrumLite',
	'00,01,58': 'Infinite Response',
	'00,01,59': 'Garritan Corp',
	'00,01,5A': 'Plogue Art et Technologie, Inc',
	'00,01,5B': 'RJM Music Technology',
	'00,01,5C': 'Custom Solutions Software',
	'00,01,5D': 'Sonarcana LLC / Highly Liquid',
	'00,01,5E': 'Centrance',
	'00,01,5F': 'Kesumo LLC',
	'00,01,60': 'Stanton (Gibson Brands)',
	'00,01,61': 'Livid Instruments',
	'00,01,62': 'First Act / 745 Media',
	'00,01,63': 'Pygraphics, Inc.',
	'00,01,64': 'Panadigm Innovations Ltd',
	'00,01,65': 'Avedis Zildjian Co',
	'00,01,66': 'Auvital Music Corp',
	'00,01,67': 'You Rock Guitar (was: Inspired Instruments)',
	'00,01,68': 'Chris Grigg Designs',
	'00,01,69': 'Slate Digital LLC',
	'00,01,6A': 'Mixware',
	'00,01,6B': 'Social Entropy',
	'00,01,6C': 'Source Audio LLC',
	'00,01,6D': 'Ernie Ball / Music Man',
	'00,01,6E': 'Fishman',
	'00,01,6F': 'Custom Audio Electronics',
	'00,01,70': 'American Audio/DJ',
	'00,01,71': 'Mega Control Systems',
	'00,01,72': 'Kilpatrick Audio',
	'00,01,73': 'iConnectivity',
	'00,01,74': 'Fractal Audio',
	'00,01,75': 'NetLogic Microsystems',
	'00,01,76': 'Music Computing',
	'00,01,77': 'Nektar Technology Inc',
	'00,01,78': 'Zenph Sound Innovations',
	'00,01,79': 'DJTechTools.com',
	'00,01,7A': 'Rezonance Labs',
	'00,01,7B': 'Decibel Eleven',
	'00,01,7C': 'CNMAT',
	'00,01,7D': 'Media Overkill',
	'00,01,7E': 'Confusion Studios',
	'00,01,7F': 'moForte Inc',
	'00,02,00': 'Miselu Inc',
	'00,02,01': 'Amelia’s Compass LLC',
	'00,02,02': 'Zivix LLC',
	'00,02,03': 'Artiphon',
	'00,02,04': 'Synclavier Digital',
	'00,02,05': 'Light & Sound Control Devices LLC',
	'00,02,06': 'Retronyms Inc',
	'00,02,07': 'JS Technologies',
	'00,02,08': 'Quicco Sound',
	'00,02,09': 'A-Designs Audio',
	'00,02,0A': 'McCarthy Music Corp',
	'00,02,0B': 'Denon DJ',
	'00,02,0C': 'Keith Robert Murray',
	'00,02,0D': 'Google',
	'00,02,0E': 'ISP Technologies',
	'00,02,0F': 'Abstrakt Instruments LLC',
	'00,02,10': 'Meris LLC',
	'00,02,11': 'Sensorpoint LLC',
	'00,02,12': 'Hi-Z Labs',
	'00,02,13': 'Imitone',
	'00,02,14': 'Intellijel Designs Inc.',
	'00,02,15': 'Dasz Instruments Inc.',
	'00,02,16': 'Remidi',
	'00,02,17': 'Disaster Area Designs LLC',
	'00,02,18': 'Universal Audio',
	'00,02,19': 'Carter Duncan Corp',
	'00,02,1A': 'Essential Technology',
	'00,02,1B': 'Cantux Research LLC',
	'00,02,1C': 'Hummel Technologies',
	'00,02,1D': 'Sensel Inc',
	'00,02,1E': 'DBML Group',
	'00,02,1F': 'Madrona Labs',
	'00,02,20': 'Mesa Boogie',
	'00,02,21': 'Effigy Labs',
	'00,02,22': 'Amenote',
	'00,02,23': 'Red Panda LLC',
	'00,02,24': 'OnSong LLC',
	'00,02,25': 'Jamboxx Inc.',
	'00,02,26': 'Electro-Harmonix',
	'00,02,27': 'RnD64 Inc',
	'00,02,28': 'Neunaber Technology LLC',
	'00,02,29': 'Kaom Inc.',
	'00,02,2A': 'Hallowell EMC',
	'00,02,2B': 'Sound Devices, LLC',
	'00,02,2C': 'Spectrasonics, Inc',
	'00,02,2D': 'Second Sound, LLC',
	'00,02,2E': '8eo (Horn)',
	'00,02,2F': 'VIDVOX LLC',
	'00,02,30': 'Matthews Effects',
	'00,02,31': 'Bright Blue Beetle',
	'00,02,32': 'Audio Impressions',
	'00,02,33': 'Looperlative',
	'00,02,34': 'Steinway',
	'00,02,35': 'Ingenious Arts and Technologies LLC',
	'00,02,36': 'DCA Audio',
	'00,02,37': 'Buchla USA',
	'00,02,38': 'Sinicon',
	'00,02,39': 'Isla Instruments',
	'00,02,3A': 'Soundiron LLC',
	'00,02,3B': 'Sonoclast, LLC',
	'00,02,3C': 'Copper and Cedar',
	'00,02,3D': 'Whirled Notes',
	'00,02,3E': 'Cejetvole, LLC',
	'00,02,3F': 'DAWn Audio LLC',
	'00,02,40': 'Space Brain Circuits',
	'00,02,41': 'Caedence',
	'00,02,42': 'HCN Designs, LLC (The MIDI Maker)',
	'00,02,43': 'PTZOptics',
	'00,02,44': 'Noise Engineering',
	'00,02,45': 'Synthesia LLC',
	'00,02,46': 'Jeff Whitehead Lutherie LLC',
	'00,02,47': 'Wampler Pedals Inc.',
	'00,02,48': 'Tapis Magique',
	'00,02,49': 'Leaf Secrets',
	'00,02,4A': 'Groove Synthesis',
	'00,02,4B': 'Audiocipher Technologies LLC',
	'00,02,4C': 'Mellotron Inc.',
	'00,02,4D': 'Hologram Electronics LLC',
	'00,02,4E': 'iCON Americas, LLC',
	'00,02,4F': 'Singular Sound',
	'00,02,50': 'Genovation Inc',
	'00,02,51': 'Method Red',
	'00,02,52': 'Brain Inventions',
	'00,02,53': 'Synervoz Communications Inc.',
	'00,02,54': 'Hypertriangle Inc',
	'00,02,55': 'DigiBrass LLC',
	'00,02,56': 'MIDI2 Marketing LLC',
	'00,02,57': 'TAQS.IM',
	'00,02,58': 'CSS Designs',
	'00,02,59': 'Mozaic Beats',
	'00,02,5A': 'PianoDisc',
	'00,02,5B': 'Uwyn',
	'00,02,5C': 'FSK Audio',
	'00,02,5D': 'Eternal Research LLC',
	'00,02,5E': 'Azoteq Inc',
	'00,02,5F': 'Hy Music',
	'00,02,60': 'Sound Magic Co.,Ltd',
	'00,02,61': 'Dirtywave',
	'00,02,62': 'Kinotone',
	'00,02,63': 'Yoder Precision Instruments',
	'00,02,64': 'McLaren Labs',
	'00,02,65': 'Gigperfomer',
	'00,02,66': 'Groove Synthesis',
	'00,02,68': 'Stellr Audio',
	'00,02,69': 'Essential technology',
	'00,02,6A': 'Lookc Music',
	'00,02,6B': 'Homey Music0x',
	'00,20,00': 'Dream SAS',
	'00,20,01': 'Strand Lighting',
	'00,20,02': 'Amek Div of Harman Industries',
	'00,20,03': 'Casa Di Risparmio Di Loreto',
	'00,20,04': 'Böhm electronic GmbH',
	'00,20,05': 'Syntec Digital Audio',
	'00,20,06': 'Trident Audio Developments',
	'00,20,07': 'Real World Studio',
	'00,20,08': 'Evolution Synthesis, Ltd',
	'00,20,09': 'Yes Technology',
	'00,20,0A': 'Audiomatica',
	'00,20,0B': 'Bontempi SpA (Sigma)',
	'00,20,0C': 'F.B.T. Elettronica SpA',
	'00,20,0D': 'MidiTemp GmbH',
	'00,20,0E': 'LA Audio (Larking Audio)',
	'00,20,0F': 'Zero 88 Lighting Limited',
	'00,20,10': 'Micon Audio Electronics GmbH',
	'00,20,11': 'Forefront Technology',
	'00,20,12': 'Studio Audio and Video Ltd.',
	'00,20,13': 'Kenton Electronics',
	'00,20,14': 'Celco/ Electrosonic',
	'00,20,15': 'ADB',
	'00,20,16': 'Marshall Products Limited',
	'00,20,17': 'DDA',
	'00,20,18': 'BSS Audio Ltd.',
	'00,20,19': 'MA Lighting Technology',
	'00,20,1A': 'Fatar SRL c/o Music Industries',
	'00,20,1B': 'QSC Audio Products Inc.',
	'00,20,1C': 'Artisan Clasic Organ Inc.',
	'00,20,1D': 'Orla Spa',
	'00,20,1E': 'Pinnacle Audio (Klark Teknik PLC)',
	'00,20,1F': 'TC Electronics',
	'00,20,20': 'Doepfer Musikelektronik GmbH',
	'00,20,21': 'Creative ATC / E-mu',
	'00,20,22': 'Seyddo/Minami',
	'00,20,23': 'LG Electronics (Goldstar)',
	'00,20,24': 'Midisoft sas di M.Cima & C',
	'00,20,25': 'Samick Musical Inst. Co. Ltd.',
	'00,20,26': 'Penny and Giles (Bowthorpe PLC)',
	'00,20,27': 'Acorn Computer',
	'00,20,28': 'LSC Electronics Pty. Ltd.',
	'00,20,29': 'Focusrite/Novation',
	'00,20,2A': 'Samkyung Mechatronics',
	'00,20,2B': 'Medeli Electronics Co.',
	'00,20,2C': 'Charlie Lab SRL',
	'00,20,2D': 'Blue Chip Music Technology',
	'00,20,2E': 'BEE OH Corp',
	'00,20,2F': 'LG Semicon America',
	'00,20,30': 'TESI',
	'00,20,31': 'EMAGIC',
	'00,20,32': 'Behringer GmbH',
	'00,20,33': 'Access Music Electronics',
	'00,20,34': 'Synoptic',
	'00,20,35': 'Hanmesoft',
	'00,20,36': 'Terratec Electronic GmbH',
	'00,20,37': 'Proel SpA',
	'00,20,38': 'IBK MIDI',
	'00,20,39': 'IRCAM',
	'00,20,3A': 'Propellerhead Software',
	'00,20,3B': 'Red Sound Systems Ltd',
	'00,20,3C': 'Elektron ESI AB',
	'00,20,3D': 'Sintefex Audio',
	'00,20,3E': 'MAM (Music and More)',
	'00,20,3F': 'Amsaro GmbH',
	'00,20,40': 'CDS Advanced Technology BV (Lanbox)',
	'00,20,41': 'Mode Machines (Touched By Sound GmbH)',
	'00,20,42': 'DSP Arts',
	'00,20,43': 'Phil Rees Music Tech',
	'00,20,44': 'Stamer Musikanlagen GmbH',
	'00,20,45': 'Musical Muntaner S.A. dba Soundart',
	'00,20,46': 'C-Mexx Software',
	'00,20,47': 'Klavis Technologies',
	'00,20,48': 'Noteheads AB',
	'00,20,49': 'Algorithmix',
	'00,20,4A': 'Skrydstrup R&D',
	'00,20,4B': 'Professional Audio Company',
	'00,20,4C': 'NewWave Labs (MadWaves)',
	'00,20,4D': 'Vermona',
	'00,20,4E': 'Nokia',
	'00,20,4F': 'Wave Idea',
	'00,20,50': 'Hartmann GmbH',
	'00,20,51': 'Lion’s Tracs',
	'00,20,52': 'Analogue Systems',
	'00,20,53': 'Focal-JMlab',
	'00,20,54': 'Ringway Electronics (Chang-Zhou) Co Ltd',
	'00,20,55': 'Faith Technologies (Digiplug)',
	'00,20,56': 'Showworks',
	'00,20,57': 'Manikin Electronic',
	'00,20,58': '1 Come Tech',
	'00,20,59': 'Phonic Corp',
	'00,20,5A': 'Dolby Australia (Lake)',
	'00,20,5B': 'Silansys Technologies',
	'00,20,5C': 'Winbond Electronics',
	'00,20,5D': 'Cinetix Medien und Interface GmbH',
	'00,20,5E': 'A&G Soluzioni Digitali',
	'00,20,5F': 'Sequentix GmbH',
	'00,20,60': 'Oram Pro Audio',
	'00,20,61': 'Be4 Ltd',
	'00,20,62': 'Infection Music',
	'00,20,63': 'Central Music Co. (CME)',
	'00,20,64': 'genoQs Machines GmbH',
	'00,20,65': 'Medialon',
	'00,20,66': 'Waves Audio Ltd',
	'00,20,67': 'Jerash Labs',
	'00,20,68': 'Da Fact',
	'00,20,69': 'Elby Designs',
	'00,20,6A': 'Spectral Audio',
	'00,20,6B': 'Arturia',
	'00,20,6C': 'Vixid',
	'00,20,6D': 'C-Thru Music',
	'00,20,6E': 'Ya Horng Electronic Co LTD',
	'00,20,6F': 'SM Pro Audio',
	'00,20,70': 'OTO Machines',
	'00,20,71': 'ELZAB S.A. (G LAB)',
	'00,20,72': 'Blackstar Amplification Ltd',
	'00,20,73': 'M3i Technologies GmbH',
	'00,20,74': 'Gemalto (from Xiring)',
	'00,20,75': 'Prostage SL',
	'00,20,76': 'Teenage Engineering',
	'00,20,77': 'Tobias Erichsen Consulting',
	'00,20,78': 'Nixer Ltd',
	'00,20,79': 'Hanpin Electron Co Ltd',
	'00,20,7A': "'MIDI-hardware' R.Sowa",
	'00,20,7B': 'Beyond Music Industrial Ltd',
	'00,20,7C': 'Kiss Box B.V.',
	'00,20,7D': 'Misa Digital Technologies Ltd',
	'00,20,7E': 'AI Musics Technology Inc',
	'00,20,7F': 'Serato Inc LP',
	'00,21,00': 'Limex',
	'00,21,01': 'Kyodday (Tokai)',
	'00,21,02': 'Mutable Instruments',
	'00,21,03': 'PreSonus Software Ltd',
	'00,21,04': 'Ingenico (was Xiring)',
	'00,21,05': 'Fairlight Instruments Pty Ltd',
	'00,21,06': 'Musicom Lab',
	'00,21,07': 'Modal Electronics (Modulus/VacoLoco)',
	'00,21,08': 'RWA (Hong Kong) Limited',
	'00,21,09': 'Native Instruments',
	'00,21,0A': 'Naonext',
	'00,21,0B': 'MFB',
	'00,21,0C': 'Teknel Research',
	'00,21,0D': 'Ploytec GmbH',
	'00,21,0E': 'Surfin Kangaroo Studio',
	'00,21,0F': 'Philips Electronics HK Ltd',
	'00,21,10': 'ROLI Ltd',
	'00,21,11': 'Panda-Audio Ltd',
	'00,21,12': 'BauM Software',
	'00,21,13': 'Machinewerks Ltd.',
	'00,21,14': 'Xiamen Elane Electronics',
	'00,21,15': 'Marshall Amplification PLC',
	'00,21,16': 'Kiwitechnics Ltd',
	'00,21,17': 'Rob Papen',
	'00,21,18': 'Spicetone OU',
	'00,21,19': 'V3Sound',
	'00,21,1A': 'IK Multimedia',
	'00,21,1B': 'Novalia Ltd',
	'00,21,1C': 'Modor Music',
	'00,21,1D': 'Ableton',
	'00,21,1E': 'Dtronics',
	'00,21,1F': 'ZAQ Audio',
	'00,21,20': 'Muabaobao Education Technology Co Ltd',
	'00,21,21': 'Flux Effects',
	'00,21,22': 'Audiothingies (MCDA)',
	'00,21,23': 'Retrokits',
	'00,21,24': 'Morningstar FX Pte Ltd',
	'00,21,25': 'Changsha Hotone Audio Co Ltd',
	'00,21,26': 'Expressive E',
	'00,21,27': 'Expert Sleepers Ltd',
	'00,21,28': 'Timecode-Vision Technology',
	'00,21,29': 'Hornberg Research GbR',
	'00,21,2A': 'Sonic Potions',
	'00,21,2B': 'Audiofront',
	'00,21,2C': 'Fred’s Lab',
	'00,21,2D': 'Audio Modeling',
	'00,21,2E': 'C. Bechstein Digital GmbH',
	'00,21,2F': 'Motas Electronics Ltd',
	'00,21,30': 'Elk Audio',
	'00,21,31': 'Sonic Academy Ltd',
	'00,21,32': 'Bome Software',
	'00,21,33': 'AODYO SAS',
	'00,21,34': 'Pianoforce S.R.O',
	'00,21,35': 'Dreadbox P.C.',
	'00,21,36': 'TouchKeys Instruments Ltd',
	'00,21,37': 'The Gigrig Ltd',
	'00,21,38': 'ALM Co',
	'00,21,39': 'CH Sound Design',
	'00,21,3A': 'Beat Bars',
	'00,21,3B': 'Blokas',
	'00,21,3C': 'GEWA Music GmbH',
	'00,21,3D': 'dadamachines',
	'00,21,3E': 'Augmented Instruments Ltd (Bela)',
	'00,21,3F': 'Supercritical Ltd',
	'00,21,40': 'Genki Instruments',
	'00,21,41': 'Marienberg Devices Germany',
	'00,21,42': 'Supperware Ltd',
	'00,21,43': 'Imoxplus BVBA',
	'00,21,44': 'Swapp Technologies SRL',
	'00,21,45': 'Electra One S.R.O.',
	'00,21,46': 'Digital Clef Limited',
	'00,21,47': 'Paul Whittington Group Ltd',
	'00,21,48': 'Music Hackspace',
	'00,21,49': 'Bitwig GMBH',
	'00,21,4A': 'Enhancia',
	'00,21,4B': 'KV 331',
	'00,21,4C': 'Tehnicadelarte',
	'00,21,4D': 'Endlesss Studio',
	'00,21,4E': 'Dongguan MIDIPLUS Co., LTD',
	'00,21,4F': 'Gracely Pty Ltd.',
	'00,21,50': 'Embodme',
	'00,21,51': 'MuseScore',
	'00,21,52': 'EPFL (E-Lab)',
	'00,21,53': 'Orb3 Ltd.',
	'00,21,54': 'Pitch Innovations',
	'00,21,55': 'Playces',
	'00,21,56': 'UDO Audio LTD',
	'00,21,57': 'RSS Sound Design',
	'00,21,58': 'Nonlinear Labs GmbH',
	'00,21,59': 'Robkoo Information & Technologies Co., Ltd.',
	'00,21,5A': 'Cari Electronic',
	'00,21,5B': 'Oxi Electronic Instruments SL',
	'00,21,5C': 'XMPT',
	'00,21,5D': 'SHANGHAI HUAXIN MUSICAL INSTRUMENT',
	'00,21,5E': 'Shenzhen Huashi Technology Co., Ltd',
	'00,21,60': 'Guangzhou Rantion Technology Co., Ltd.',
	'00,21,61': 'Ryme Music',
	'00,21,62': 'GS Music',
	'00,21,63': 'Shenzhen Flamma Innovation Co., Ltd',
	'00,21,64': 'Shenzhen Mooer Audio Co.,LTD.',
	'00,21,65': 'Raw Material Software Limited (JUCE)',
	'00,21,66': 'Birdkids',
	'00,21,67': 'Beijing QianYinHuLian Tech. Co',
	'00,21,68': 'Nimikry Music OG',
	'00,21,69': 'Newzik',
	'00,21,6A': 'Hamburg Wave',
	'00,21,6B': 'Grimm Audio',
	'00,21,6C': 'Arcana Instruments LTD.',
	'00,21,6D': 'GameChanger Audio',
	'00,21,6E': 'OakTone',
	'00,21,6F': 'The Digi-Gurdy: A MIDI Hurdy Gurdy',
	'00,21,70': 'MusiKraken',
	'00,21,71': 'PhotoSynth > InterFACE',
	'00,21,72': 'Instruments of Things',
	'00,21,73': 'oodi',
	'00,21,74': 'Komires Sp. z o.o.',
	'00,21,75': 'Lehle GmbH',
	'00,21,76': 'Joué Music Instruments',
	'00,21,77': 'Guangzhou Pearl River Amason Digital Musical Instrument Co. Ltd',
	'00,21,78': 'Rhesus Engineering GmbH',
	'00,21,79': 'Bremmers Audio Design',
	'00,21,7A': 'Cherub Technology Co., Ltd',
	'00,21,7B': 'Synthstrom Audible',
	'00,21,7C': 'Neural DSP Technologies Oy',
	'00,21,7D': '2box AB',
	'00,21,7E': 'Intuitive Instruments',
	'00,21,7F': 'Twisted-electrons',
	'00,22,00': 'Wildcard Engineering BV',
	'00,22,01': 'Dato Musical Instruments',
	'00,22,02': 'JTJ AUDIO',
	'00,22,03': 'Melbourne Instruments',
	'00,22,04': 'AZMINO',
	'00,22,05': 'TELEMIDI (TRIGITAL PTY LTD)',
	'00,22,06': 'Tylium',
	'00,22,07': 'Engineering Lab',
	'00,22,08': 'Archaea Modular Synthesis Ltd.',
	'00,22,09': 'Tentacle Sync GmbH',
	'00,22,0A': 'Misa Digital Pty Ltd',
	'00,22,0B': 'Heavy Procrastination Industries ApS',
	'00,22,0C': 'Telepathic Pty Ltd',
	'00,22,0D': 'Neoharp LLC-FZ',
	'00,22,0E': 'Rhodes Music Group',
	'00,22,0F': 'Halbestunde GmbH',
	'00,22,11': 'FluQe',
	'00,22,12': 'Blackmagic Design Pty. Ltd.',
	'00,22,13': 'Tangible Waves',
	'00,22,14': 'Huebner Informationselektronik',
	'00,22,15': 'Addictive Instruments0x',
	'40': 'Kawai Musical Instruments MFG. CO. Ltd',
	'41': 'Roland Corporation',
	'42': 'Korg Inc.',
	'43': 'Yamaha Corporation',
	'44': 'Casio Computer Co. Ltd',
	'46': 'Kamiya Studio Co. Ltd',
	'47': 'Akai Electric Co. Ltd.',
	'48': 'Victor Company of Japan, Ltd.',
	'4B': 'Fujitsu Limited',
	'4C': 'Sony Corporation',
	'4E': 'Teac Corporation',
	'50': 'Matsushita Electric Industrial Co. , Ltd',
	'51': 'Fostex Corporation',
	'52': 'Zoom Corporation',
	'54': 'Matsushita Communication Industrial Co., Ltd.',
	'55': 'Suzuki Musical Instruments MFG. Co., Ltd.',
	'56': 'Fuji Sound Corporation Ltd.',
	'57': 'Acoustic Technical Laboratory, Inc.',
	'59': 'Faith, Inc.',
	'5A': 'Internet Corporation',
	'5C': 'Seekers Co. Ltd.',
	'5F': 'SD Card Association',
	'00,40,0x00': 'Crimson Technology Inc.',
	'00,40,0x01': 'Softbank Mobile Corp',
	'00,40,0x03': 'D&M Holdings Inc.',
	'00,40,0x04': 'Xing Inc.',
	'00,40,0x05': 'AlphaTheta Corporation',
	'00,40,0x06': 'Pioneer Corporation',
	'00,40,0x07': 'Slik Corporation'
};
