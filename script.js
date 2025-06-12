var selectedInput = "";
var selectedOutput = "";
var midiInputs = new Array();
var midiOutputs = new Array();
var lastMessage = new Uint8Array();

navigator.requestMIDIAccess({ sysex: true}).then((access) => {
  const inputs = access.inputs.values();
  const outputs = access.outputs.values();
  midiInputs = Array.from(inputs);
  midiOutputs = Array.from(outputs);
  selectedInput = midiInputs[0].id;
  selectedOutput = midiOutputs[0].id;
  var selectInput = document.getElementById("select");
  var selectOutput = document.getElementById("select_out");

  document.getElementById('file_input').addEventListener('change', readFile, false);
  
  sendInput = () => {
    var text = document.getElementById("t").value;

    // const lines = text.split("\n");
    // lines.forEach((line) => {
    //   const data = line.split(" ").map(d => parseInt(d, 16));
    //   const device = midiOutputs.find((device) => device.id == selectedOutput);
    //   device.send(data);
    // });

    const data = text.replaceAll("\n", " ").split(" ").map(c => parseInt(c, 16));
    const device = midiOutputs[selectOutput.selectedIndex];
    device.send(data);
  }

  updateInputs(midiInputs);
  updateOutputs(midiOutputs);

  function onInputChange() {
    var value = selectInput.value;
    var text = selectInput.options[selectInput.selectedIndex].text;
    selectedInput = midiInputs[selectInput.selectedIndex].id;
    midiInputs.forEach((input) => {
      input.onmidimessage = null;
    });
    const device = midiInputs.find((d) => d.id == selectedInput);

    device.onmidimessage = handleMIDIMessage;
  }

  function onOutputChange() {
    selectedOutput = midiOutputs[selectOutput.selectedIndex].id;
  }

  selectInput.onchange = onInputChange;
  selectOutput.onchange = onOutputChange;

  access.onstatechange = (event) => {
    if (event.port.state)
    midiInputs = Array.from(access.inputs.values());
    midiOutputs = Array.from(access.outputs.values());
    updateInputs(midiInputs);
    updateOutputs(midiOutputs);
  };
}).catch((error) => {console.error(error)});

function handleMIDIMessage(message) {
  lastMessage = message.data;
  // console.log(`Received: ${message.data}`);
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

  var s = [];
  message.data.forEach((d) => {
    s.push(d.toString(16).toUpperCase().padStart(2, "0"));
  });

  var info = new Array();
  const input = midiInputs.find((device) => device.id == selectedInput);
  info.push(Math.round(message.timeStamp).toString().padStart(7, "0"));
  info.push(input.manufacturer != "" ? input.manufacturer : s.slice(1, 4).join(" "));
  var device = input.name;
  if (status == 240) {
    device = s.slice(4, 6).join(" ");
  }
  info.push(device);
  info.push(messageStatus(message));
  info.push(s.join(" ").substring(0, 45));
  
  const row = document.createElement('tr');
  info.forEach((d) => {
    const td = document.createElement('td');
    td.innerHTML = d;
    row.appendChild(td);
  });
  document.getElementById('table').appendChild(row);
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

function updateInputs(inputs) {
  const selectInput = document.getElementById("select");
  var arr = new Array();
  inputs.forEach((input) => {
    var opt = document.createElement('option');
    opt.value = input.id;
    opt.innerHTML = input.name;
    arr.push(opt);
  });
  selectInput.replaceChildren(...arr);
  selectInput.value = selectedInput;
}

function updateOutputs(outputs) {
  const selectOutput = document.getElementById("select_out");
  var arr = new Array();
  outputs.forEach((output) => {
    var opt = document.createElement('option');
    opt.value = output.id;
    opt.innerHTML = output.name;
    arr.push(opt);
  });
  selectOutput.replaceChildren(...arr);
  selectOutput.value = selectedOutput;
}

function clearOutput() {
  const el = document.getElementById('in');
  el.innerHTML = "";
}

function messageStatus(message) {
  const status = message.data[0];
  switch(true) {
    case (status >= 128 && status <= 143):
      return "Note Off";
      break;
    case (status >= 144 && status <= 159):
      return "Note On";
      break;
    case (status >= 160 && status <= 175):
      return "Aftertouch";
      break;
    case (status >= 176 && status <= 191):
      return "Control Change";
      break;
    case (status >= 192 && status <= 207):
      return "Program Change";
      break;
    case (status >= 208 && status <= 223):
      return "Channel Pressure";
      break;
    case (status >= 224 && status <= 239):
      return "Pitch Bend";
      break;
    case (status == 240):
      return "SysEx";
      break;
  }
}
