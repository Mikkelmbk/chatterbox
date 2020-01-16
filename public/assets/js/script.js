var socket = io();

let chatButton = document.querySelector('.chatMessage__button');
let chatInput = document.querySelector('.chatMessage__input');
let chatContainer = document.querySelector('.mainChatView');
let audio = new Audio("/assets/audio/plop.mp3");
let username = document.querySelector('.chatMessage__username');
let user;
let chatForm = document.querySelectorAll('.chatMessage__form')[0];
let loginForm = document.querySelectorAll('.chatMessage__form')[1];
let regex = /<[a-zA-Z0-9].*>[a-zA-Z0-9].*<\/[a-zA-Z0-9].*>/i;


Notification.requestPermission(function (status) {
	console.log('Notification permission status:', status);
});



// https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState

// https://stackoverflow.com/questions/11498508/socket-emit-vs-socket-send socket.send vs socket.emit

// https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications Push notification documentation

function displayNotification(msg) {
	if (document.visibilityState == "hidden") {
		if ("serviceWorker" in navigator) {

			if (Notification.permission == 'granted') {
				navigator.serviceWorker.getRegistration().then(function (reg) {
					var options = {
						body: msg,
						icon: '/assets/images/CropCena.png',
						vibrate: [100, 50, 100],
						data: {
							dateOfArrival: Date.now(),
							primaryKey: 1
						},
						actions: [
							{action: 'explore', title: 'Explore this new world',
							  icon: 'images/checkmark.png'},
							{action: 'close', title: 'Close notification',
							  icon: 'images/xmark.png'},
						  ]
					};
					reg.showNotification("Chatterbox", options);
				});
			}
		}
	}
}


chatForm.addEventListener('submit', (e) => {
	e.preventDefault();
});

loginForm.addEventListener('submit', (e) => {
	e.preventDefault();
	if (username.value == "" && !chatInput.value.match(regex)) {
		return;
	}
	user = username.value;
	socket.emit("userjoin", user);
	loginForm.classList.add('hidden');

	chatForm.classList.remove('hidden');
});

scrollToBottom();


chatButton.addEventListener('click', (e) => {
	sendChatMessage();
});



function sendChatMessage() { // You sending a message.
	if (chatInput.value != "" && !chatInput.value.match(regex)) {

		chatInput.value = chatInput.value.replace(":)", "<img class='emoticons' src='/assets/images/Smile.png'>");
		chatInput.value = chatInput.value.replace("(:", "<img class='emoticons' src='/assets/images/Smile.png'>");
		chatInput.value = chatInput.value.replace("(-:", "<img class='emoticons' src='/assets/images/Smile.png'>");
		chatInput.value = chatInput.value.replace(":-)", "<img class='emoticons' src='/assets/images/Smile.png'>");

		let time = Date.now();

		socket.send({ msg: chatInput.value, timestamp: time, username: user });
		let p = document.createElement('p');
		p.className = "mainChatView__me";

		let small = document.createElement('small');
		small.className = "timestamp right";
		small.innerText = new Date(time).getHours() + ':' + new Date(time).getMinutes();
		chatContainer.appendChild(small);

		p.innerHTML = chatInput.value;
		chatContainer.appendChild(p);
		chatInput.value = "";
		scrollToBottom();
		audio.play();
	}
	else {
		console.log("Du kan ikke skrive html elementer i chatten");
	}
}

socket.on('message', (msg) => { // Others sending a message.
	console.log(msg);
	if (msg != "") {
		let p = document.createElement('p'); // Create P element.
		p.className = "mainChatView__other"; // apply class to P element.

		let span = document.createElement('span');
		span.innerHTML = msg.username;
		span.className = "mainChatView__name";
		p.appendChild(span);

		p.innerHTML += msg.msg;
		let small = document.createElement('small');
		small.className = "timestamp left";
		small.innerText = new Date(msg.timestamp).getHours() + ':' + new Date(msg.timestamp).getMinutes();
		chatContainer.appendChild(small);


		chatContainer.appendChild(p); // append P element to chat container.
		scrollToBottom();
		audio.play();
			// setTimeout(()=>{ // setTimeout for testing purposes
		displayNotification(`${msg.username}: ${msg.msg}`);
			// },2000)
	}

});

function scrollToBottom() {
	chatContainer.scrollTop = chatContainer.scrollHeight;
}


socket.on('userjoin', function (msg) {
	if (document.visibilityState == "hidden") {
		displayNotification(`${msg} has joined the chat`);
	}
	let small = document.createElement('small');
	small.className = "timestamp center";
	small.innerText = `${msg} has joined the chat`;
	chatContainer.appendChild(small);
	scrollToBottom();
	audio.play();
})
