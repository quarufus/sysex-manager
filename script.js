var selected = "";
var midiInputs = new Array();

navigator.requestMIDIAccess({ sysex: true}).then((access) => {
  const inputs = access.inputs.values();
  midiInputs = Array.from(inputs);    
  selected = midiInputs[0].name;
  var select = document.getElementById("select");

  midiInputs.forEach((input) => {
    var opt = document.createElement('option');
    opt.value = input.name;
    opt.innerHTML = input.name;
    select.appendChild(opt);
  });

  function onChange() {
    var value = select.value;
    var text = select.options[select.selectedIndex].text;
    selected = midiInputs[select.selectedIndex].name;
    midiInputs.forEach((input) => {
      input.onmidimessage = null;
    });
    const device = midiInputs[select.selectedIndex];

    device.onmidimessage = handleMIDIMessage;
  }

  select.onchange = onChange;

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
  if (status > 127 && status < 160 && !document.getElementById("onoff").checked) {
    return;
  }
  if (status > 175 && status < 192 && !document.getElementById("cc").checked) {
    return;
  }
  
  var row = document.createElement('div');
  var s = [];
  message.data.forEach((d) => {
    s.push(d.toString(16).toUpperCase().padStart(2, "0"));
  });
  //row.innerHTML = `${Math.round(message.timeStamp)}: ${status.toString(16)} ${dataBytes.toString(16)}`;
  row.innerHTML = `${Math.round(message.timeStamp).toString().padStart(7, "0")}: ${s.join(" ")}`;
  in_win.appendChild(row);
}
