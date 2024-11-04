/* Time */

var deviceTime = document.querySelector('.status-bar .time');
var messageTime = document.querySelectorAll('.message .time');

deviceTime.innerHTML = moment().format('h:mm');

setInterval(function() {
	deviceTime.innerHTML = moment().format('h:mm');
}, 1000);

for (var i = 0; i < messageTime.length; i++) {
	messageTime[i].innerHTML = moment().format('h:mm A');
}

/* Message */

var form = document.querySelector('.conversation-compose');
var conversation = document.querySelector('.conversation-container');

form.addEventListener('submit', newMessage);

function newMessage(e) {
	var input = e.target.input;

	if (input.value) {
		var message = buildMessage(input.value);
		conversation.appendChild(message);
		animateMessage(message);
		processMessage(input.value);
	}

	input.value = '';
	conversation.scrollTop = conversation.scrollHeight;

	e.preventDefault();
}

function buildMessage(text) {
	var element = document.createElement('div');

	element.classList.add('message', 'sent');

	element.innerHTML = text +
		'<span class="metadata">' +
			'<span class="time">' + moment().format('h:mm A') + '</span>' +
			'<span class="tick tick-animation">' +
				'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck" x="2047" y="2061"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#92a58c"/></svg>' +
				'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" id="msg-dblcheck-ack" x="2063" y="2076"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="#4fc3f7"/></svg>' +
			'</span>' +
		'</span>';

	return element;
}

function buildMessageReceived(text) {
	var element = document.createElement('div');

	element.classList.add('message', 'received');

	element.innerHTML = text +
		'<span class="metadata">' +
			'<span class="time">' + moment().format('h:mm A') + '</span>' +
		'</span>';

	return element;
}

function buildMessageReceivedHandler(text) {
	var element = document.createElement('div');
	var elementText = document.createElement('span');
	var elementMetadata = document.createElement('span');
	elementMetadata.classList.add('metadata');
  elementMetadata.innerHTML = '<span class="time">' + moment().format('h:mm A') + '</span>'

	element.classList.add('message', 'received');

	element.appendChild(elementText);
	element.appendChild(elementMetadata);

	return {element, elementText};
}

function messageMenu(delay,scrollBottom) {
	var message = buildMessageReceived('Silakan pilih menu berikut:<br>'
		+ '1 | Gimana asal mula ceritanya sih?<br>'
		+ '2 | Ada live streamingnya ngga?<br>'
		+ '9 | Berikan testimoni<br>'
	);
	setTimeout(function() {
		conversation.appendChild(message);
		if (scrollBottom) {
			conversation.scrollTop = conversation.scrollHeight;
		}
	}, delay);
}

function addMessageReceived(text, delay) {
	var message = buildMessageReceived(text);
	setTimeout(function() {
		conversation.appendChild(message);
		conversation.scrollTop = conversation.scrollHeight;
	}, delay);
}
var testimonyState = 0;
var testimonyName = '';
var testimonyMessage = '';
function saveTestimony() {
	var data = new FormData();
	data.append('name', testimonyName);
	data.append('message', testimonyMessage);

	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'post-testi.php', true);
	xhr.onload = function () {
		addMessageReceived("Terima kasih, testimoni anda telah kami catat :)",500);
		testimonyState = 0;
		messageMenu(5000,true);
	};
	xhr.onerror = function () {
		addMessageReceived("Gagal menyimpan testimoni :(<br>Kayaknya internetnya kamu mati deh",0);
		testimonyState = 0;
		messageMenu(5000,true);
	}
	xhr.send(data);
}
function loadTestimony(callback, error) {
	var xhr = new XMLHttpRequest();
	var time = (new Date()).getTime();
	xhr.open('GET', 'testi.json?time=' + time, true);
	xhr.onload = callback
	xhr.onerror = error
	xhr.send();
}
async function processMessage(text) {
  // Fetch the token from wherever you store it
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9vYWMuamFiYXJwcm92LmdvLmlkXC9hcGlcL2xvZ2luIiwiaWF0IjoxNzIxNjk5NDM1LCJleHAiOjE3MjE3ODU4MzUsIm5iZiI6MTcyMTY5OTQzNSwianRpIjoiV0Rzc0NGOXNlNDJIeUQwRyIsInN1YiI6IjEiLCJwcnYiOiI4N2UwYWYxZWY5ZmQxNTgxMmZkZWM5NzE1M2ExNGUwYjA0NzU0NmFhIn0.sEiQyn3dBqyoJ3VLmbU6nK00IkLC5ItSEIijOXNnPY8'; // Replace with your JWT

  // Create a new EventSource to receive SSE
  const response = await fetch('http://localhost:3000/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: text })
  });

  // Check if the response is ok (status 200-299)
  if (!response.ok) {
    console.error('Error:', response.statusText);
    return;
  }

  // Create an SSE listener
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");


  let {element, elementText} = buildMessageReceivedHandler("");
  conversation.appendChild(element);

  // Read the streaming response
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const dataChunk = decoder.decode(value, { stream: true });
    const messages = dataChunk.split('\n').filter(Boolean);

    messages.forEach(data => {
      if (data.startsWith('data: ')) {
        const messageData = data.replace('data: ', '');
        elementText.innerHTML += `${messageData}`;
        conversation.scrollTop = conversation.scrollHeight;
      }
    });
  }
}

function animateMessage(message) {
	setTimeout(function() {
		var tick = message.querySelector('.tick');
		tick.classList.remove('tick-animation');
	}, 500);
}

function escapeHTML(unsafeText) {
    let div = document.createElement('div');
    div.innerText = unsafeText;
    return div.innerHTML;
}

function callMe() {
	// var win = window.open('https://wa.me/6281223456909', '_blank');
	var win = window.open('tel:+6281223456909');
	win.focus();
}

var _originalSize = window.innerWidth + window.innerHeight
window.addEventListener("resize", function() {
	if(window.innerWidth + window.innerHeight != _originalSize){
		if (conversation.scrollTop - (conversation.scrollHeight - conversation.clientHeight) > -20 ) {
			conversation.scrollTop = conversation.scrollHeight;
		}
	}else{
	}
}, false);

function openProfile() {
	Swal.fire({
		title: 'Asesor SDM Aparatur',
		html: 'Menguji kompetensi Anda'
	})
}

function openMenu() {
	Swal.fire({
		title: 'Tentang Website nikahfifi.kamil.web.id',
		html: 'Sebenernya bikin pake style whatsapp gara2 bingung cari template nikah yang bagus yang mana.'
		+ 'Yaudah, pakai tampilan yang udah jelas aja, wkwkwk.... <br>'
		+ '<br>'
		+ 'Bener ga coy'
	})
}

function openAttachment() {
	loadTestimony(function(resp) {
		var data = JSON.parse(resp.target.response);
		var messages = '';
		for (var i = 0; i < data.length; i++) {
			var time = moment(data[i].time * 1000).fromNow();
			var name = escapeHTML(data[i].name)
			var message = escapeHTML(data[i].message)
			messages += '<div class="testi-message"><b>'+name+'</b> ('+time+')<br>'+message+'</div>';
		}
		if (!data.length) {
			messages = 'Belum ada testi :(';
		}
		Swal.fire({
			title: 'Testimoni',
			html: messages
		})
	})
}

function openCamera() {
	Swal.fire({
		title: 'Hai',
		type: 'info',
		html: 'Nanti jangan lupa foto-foto selfie dan upload ke medsos ya',
		timer: 5000,
	}).then((result) => {
		if (
			result.dismiss === Swal.DismissReason.timer
		) {

		}
	})
}

function openEmoji() {
	Swal.fire({
		title: 'Fifi dan Kamil Mengucapkan',
		type: 'success',
		html: 'Jangan lupa tersenyum dan bahagia hari ini <br><br><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" id="smiley" x="3147" y="3209"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.153 11.603c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965zM5.95 12.965c-.027-.307-.132 5.218 6.062 5.55 6.066-.25 6.066-5.55 6.066-5.55-6.078 1.416-12.13 0-12.13 0zm11.362 1.108s-.67 1.96-5.05 1.96c-3.506 0-5.39-1.165-5.608-1.96 0 0 5.912 1.055 10.658 0zM11.804 1.01C5.61 1.01.978 6.034.978 12.23s4.826 10.76 11.02 10.76S23.02 18.424 23.02 12.23c0-6.197-5.02-11.22-11.216-11.22zM12 21.355c-5.273 0-9.38-3.886-9.38-9.16 0-5.272 3.94-9.547 9.214-9.547a9.548 9.548 0 0 1 9.548 9.548c0 5.272-4.11 9.16-9.382 9.16zm3.108-9.75c.795 0 1.44-.88 1.44-1.963s-.645-1.96-1.44-1.96c-.795 0-1.44.878-1.44 1.96s.645 1.963 1.44 1.963z" fill="#7d8489"/></svg>',
		timer: 5000,
	}).then((result) => {
		if (
			result.dismiss === Swal.DismissReason.timer
		) {

		}
	})
}

function onReady() {
	// messageMenu(5000,false);
}

onReady()