/* Logo graphics start here */
let logo = document.getElementById("logo");
let logoctx = logo.getContext("2d");
	//Waveform (Letters WVS)
logoctx.lineWidth = "4";
let counter = 0.6, x,y;
let increase = 90/180*Math.PI/11;
for(let i=0; i<=720; i+=4){
	y =  50 - Math.cos(counter) * 35;
	counter += increase;
	logoctx.lineTo(i,y);
	logoctx.stroke();
}
	//Letter A
logoctx.moveTo(290, 50);
logoctx.lineTo(380, 50);
logoctx.stroke();
	//Letter E
logoctx.moveTo(515, 15);
logoctx.lineTo(620, 15);
logoctx.moveTo(555, 50);
logoctx.lineTo(610, 50);
logoctx.stroke();
/* Logo graphics ends here */


/* Menu buttons and slider start here */
	// Profile
let profile = {
	type: "TET", // Can be set to 'TET', 'CPS' or 'Other'.
	option1: 12,
	option2: "EDO",
	baseNote: 440, // Specified in Hz.
	PSRatio: 2 // Periodic Scale Ratio in witch the notes will be divided.
};
let selProfile = document.getElementById("selProfile");
function selectProfile(button) {
	profile.type = button.innerHTML;
	makeScale();
}
	// Number of notes
let notes = document.getElementById("numberOfTones");
let checkSelect = function(element) {
	let pos = notes.getBoundingClientRect().top;
	for (i = 0; i < element.children.length; i++) {
	if (element.children[i].getBoundingClientRect().top == pos) {
		profile.option1 = element.children[i].innerHTML;
	}}
	makeScale();
}
	// Base note
//let selBaseNote = document.getElementById("baseNote");
function sliderInput () {
	profile.baseNote = baseNote.value;
	makeScale();
}

let PSLimit = document.getElementById("PSLimit");
PSLimit.checked = true;
let keepPSRatio = PSLimit.checked;
function checkbox(element) {
	keepPSRatio = element.checked;
	if (keepPSRatio == true) {
		PSLimit.classList.toggle('hide');
	} else {PSLimit.classList.remove('hide')}
}
checkbox(PSLimit);
	//Create scale
let scale = [];
let container = document.getElementById("scaleContainer");
let toneCSS = document.createElement('style');
function makeScale(){
	scale = [];
	toneCSS.innerHTML = "";
	while (document.getElementsByClassName("tone").length > 0){
		document.getElementsByClassName("tone")[0].remove();
	}
	if (profile.type == "TET") {
		if (!keepPSRatio) {
			profile.PSRatio = PSLimit.value / profile.baseNote
			if (profile.PSRatio == 2){
				profile.option2 = "EDO";
			} else if (profile.PSRatio == 3){
				profile.option2 = "EDT";
			} else if (profile.PSRatio == 4){
				profile.option2 = "ED4";
			} else {profile.option2 = "Custom";}
		}
		for (let i = 0; i < profile.option1; i++){
			scale[i] = Math.floor(profile.baseNote * Math.pow(profile.PSRatio, 1/profile.option1*i) * 1000) / 1000;
			let newTone = document.createElement("a");
			let angle = 360*Math.pow(profile.PSRatio, 1/profile.option1*i) - 90;
			newTone.className = "tone";
			newTone.id = newTone.className + (i);
			newTone.href = '#';
			newTone.innerHTML = '<h1 style="margin: 0.1em auto;">' + (i+1) + '</h1>';
			toneCSS.innerHTML += '#'+newTone.id+' {' +
				'transform: rotate('+ angle +'deg) translate(18em) rotate(-'+ angle +'deg)' +
				'}';
			scaleContainer.appendChild(newTone);
		}
		document.querySelector('head').appendChild(toneCSS);
	}
	if (profile.type == "CPS") {
	}
	let selOption1 = document.getElementsByClassName("option1");
	let selOption2 = document.getElementsByClassName("option2");
	let selOption3 = document.getElementsByClassName("option3");
	selProfile.innerHTML = profile.type;
	for (i = 0; i < selOption1.length; i++) {
		selOption1[i].innerHTML = profile.option1;
	}
	for (i = 0; i < selOption2.length; i++) {
		selOption2[i].innerHTML = profile.option2;
	}
	for (i = 0; i < selOption3.length; i++) {
		selOption3[i].innerHTML = profile.baseNote;
	}
}
makeScale();
/* Menu buttons and slider ends here */


//Find elements and assign letiables
let octave = -42;
let center = 250;
let feedback = document.getElementById("feedback");
let lightFreq = [385*Math.pow(10, 12), 770*Math.pow(10, 12)];
let freqrange = [lightFreq[0]*Math.pow(2, octave), lightFreq[1]*Math.pow(2, octave)];

//Assign first canvas
let light = document.getElementById("light");
let lightctx = light.getContext("2d");

//Make Colorwheel for first canvas
lightctx.lineWidth = 0.6*245;
for(let angle=0; angle<=360; angle++){
	let startAngle = (angle-2)*Math.PI/180 - (Math.PI/2);
	let endAngle = angle*Math.PI/180 - (Math.PI/2);
	lightctx.beginPath();
	lightctx.arc(center, center, (0.7)*245, startAngle, endAngle);
	lightctx.closePath();
	lightctx.strokeStyle = 'hsl('+angle+', 100%, 50%)';
	lightctx.stroke();
}

//Assign second canvas
let sound = document.getElementById("sound");
let soundctx = sound.getContext("2d");


//Find frequency based on microphone feedback
function Microphone (_fft) {
	this.spectrum = [];
	let self = this;
	let audioContext = new AudioContext();
	let SAMPLE_RATE = audioContext.sampleRate;
	let loudestTone = 0;
	let freq;

	// Check and fix compatibility
	window.AudioContext = window.AudioContext ||  window.webkitAudioContext;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
	// Initiate microphone
	window.addEventListener('load', init, false);
	function init () {
		try {startMic(new AudioContext());}
		catch (e) {
			console.error(e);
			alert('Web Audio API is not supported in this browser');
		}
	}
	function startMic (context) {
		navigator.getUserMedia({ audio: true }, processSound, error);
		function processSound (stream) {
			// Analyser extracts frequencies.
			let analyser = context.createAnalyser();
			analyser.maxDecibels = 0;
			analyser.minDecibels = -70;
			analyser.smoothingTimeConstant = 0;
			analyser.fftSize = 4096;
			let node = context.createScriptProcessor(4096*2, 1, 1);
			node.onaudioprocess = function () {
				self.spectrum = new Float32Array(analyser.frequencyBinCount);
				analyser.getFloatFrequencyData(self.spectrum);
				for(let i = 0; i < self.spectrum.length; i++){
					if (self.spectrum[loudestTone] < self.spectrum[i]){
						loudestTone = i;
						console.log(freq);
					}
				}
				freq = Math.floor((freqCorr() + loudestTone+0.5)*(22050/2048) * 100) / 100;
				feedback.innerHTML = freq;
				draw();
			};
			let input = context.createMediaStreamSource(stream);
			input.connect(analyser);
			analyser.connect(node);
			node.connect(context.destination);
		}
		function error () {console.log(arguments);}
	}
	function freqCorr () {
		let low = (self.spectrum[loudestTone -1] - self.spectrum[loudestTone]);
		let high = (self.spectrum[loudestTone +1] - self.spectrum[loudestTone]);
		let diff = low - high;
		if (low < high) {
			return diff / low;
		} else {
			return diff / high;
		}
	}
	function draw(){
		soundctx.clearRect(0, 0, sound.width, sound.height);
		let rotateAngle = 2*Math.PI * freq / profile.baseNote;
		soundctx.lineWidth = 0.6*245;
		soundctx.beginPath();
		soundctx.arc(center, center, (1-0.3)*245, rotateAngle - Math.PI/1.998, rotateAngle - Math.PI/2.002);
		soundctx.closePath();
		soundctx.stroke();
	}
	return this;
};
Microphone();
