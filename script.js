var selectedInput = "";
var selectedOutput = "";
var midiInputs = new Array();
var midiOutputs = new Array();

navigator.requestMIDIAccess({ sysex: true}).then((access) => {
  const inputs = access.inputs.values();
  const outputs = access.outputs.values();
  midiInputs = Array.from(inputs);
  midiOutputs = Array.from(outputs);
  selectedInput = midiInputs[0].name;
  selectedOutput = midiOutputs[0].name;
  var selectInput = document.getElementById("select");
  var selectOutput = document.getElementById("select_out");

  document.getElementById('file_input').addEventListener('change', readFile, false);
  
  sendInput = () => {
    var text = document.getElementById("t").value;

    const lines = text.split("\n");
    lines.forEach((line) => {
    const data = line.split(" ").map(d => parseInt(d, 16));
    const device = midiOutputs[selectOutput.selectedIndex];
    device.send(data);
    });
  }

  midiInputs.forEach((input) => {
    var opt = document.createElement('option');
    opt.value = input.name;
    opt.innerHTML = input.name;
    selectInput.appendChild(opt);
  });

  midiOutputs.forEach((output) => {
    var opt = document.createElement('option');
    opt.value = output.name;
    opt.innerHTML = output.name;
    selectOutput.appendChild(opt);
  });

  function onInputChange() {
    var value = selectInput.value;
    var text = selectInput.options[selectInput.selectedIndex].text;
    selectedInput = midiInputs[selectInput.selectedIndex].name;
    midiInputs.forEach((input) => {
      input.onmidimessage = null;
    });
    const device = midiInputs[selectInput.selectedIndex];

    device.onmidimessage = handleMIDIMessage;
  }

  function onOutputChange() {
    selectedOutput = midiOutputs[selectOutput.selectedIndex].name;
  }

  selectInput.onchange = onInputChange;
  selectOutput.onchange = onOutputChange;

  access.onstatechange = (event) => {
    console.log(event.port.name, event.port.manufacturer, event.port.state);
  };
}).catch((error) => {console.error(error)});

function handleMIDIMessage(message) {
  console.log(`Received: ${message.target.data}`);
  var in_win = document.getElementById("in");
  const [status, ...dataBytes] = message.data;

  if (status == 248 && !document.getElementById("clock").checked) {
    return;
  }
  if ((status == 240 || status == 247) && !document.getElementById("sysex").checked) {
    return;
  }
  if (status >= 128 && status <= 159 && !document.getElementById("onoff").checked) {
    return;
  }
  if (status >= 160 && status <= 175 && !document.getElementById("after").checked) {
    return;
  }
  if (status >= 176 && status <= 191 && !document.getElementById("cc").checked) {
    return;
  }
  if (status >= 192 && status <= 207 && !document.getElementById("pc").checked) {
    return;
  }
  if (status >= 208 && status <= 223 && !document.getElementById("pressure").checked) {
    return;
  }
  if (status >= 224 && status <= 239 && !document.getElementById("bend").checked) {
    return;
  }
  
  var row = document.createElement('div');
  var s = [];
  message.data.forEach((d) => {
    s.push(d.toString(16).toUpperCase().padStart(2, "0"));
  });
  row.innerHTML = `${Math.round(message.timeStamp).toString().padStart(7, "0")}: ${s.join(" ")}`;
  in_win.appendChild(row);
}

function sendMIDI(midiAccess, name, msg) {
  console.log("called");
  var data = msg.split(" ").map(d => parseInt(d, 16));
  const output = midiAccess.outputs.values().find(device => device.name == name);
  console.log("Output: ", output);
  console.log(data);
  if (data.length > 1) {
  output.send(data);
  }
}

function readFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    displayContents(contents);
  };
  reader.readAsArrayBuffer(file);
}

function displayContents(contents) {
  var element = document.getElementById('t');
  const arr = new Uint8Array(contents);
  const hex = new Array();
  for (var i = 0; i < arr.length; i++) {
    hex.push(arr[i].toString(16).toUpperCase().padStart(2, "0"));
  }
  element.textContent = hex.join(" ").replaceAll("F7 ", "F7\n");
}
