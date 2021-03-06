'use strict';


$(function() {

  // Initialize variables
  var FADE_TIME = 250; // ms
  
  
  var socket = io();
  var $window = $(window);
  var $usernameInput = $('.userName'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $chatPage = $('.chat.page'); // The chatroom page

  $chatPage.show();
  $chatPage.on("click", () => {
    Notification.requestPermission();
  });
  
  $.get('/messages').then(chatHistory => {    
    let formHis =  JSON.parse(chatHistory).messages.map(history => {
      return `<strong>${history.username}</strong> ${history.message}`;
    });
    formHis.forEach(msg => $('.messages').append($('<li>').html(msg)));
  });

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    message = cleanInput(message);
    var username = $usernameInput.val();
    // This section clears out input fields:
    $inputMessage.val('');
    addNewChatMessage({
      username: username,
      message: message
    });
    let data = {username,message};
    socket.emit('new message', data);
  }

  function addChatMessage (data) {
    let messageData = JSON.parse(data);
    var $messageBodyDiv = $('<span class="messageBody">').text(messageData.message);
    var $usernameDiv = $('<span class="username"/>').text(messageData.username);
    var $messageDiv = $('<li class="message"/>').append($usernameDiv, $messageBodyDiv);
    addMessageElement($messageDiv);
    playSound();
    showNotification(data);
  }

  function addNewChatMessage (data) {
    var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
    var $usernameDiv = $('<span class="username"/>').text(data.username);
    var $messageDiv = $('<li class="message"/>').append($usernameDiv, $messageBodyDiv);
    addMessageElement($messageDiv);
  }

  // Adds a message element to the messages
  function addMessageElement (el, options) {
    var $el = $(el);
    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }
    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
    
  }

  function playSound() {    
    let url = "./audio/noti.mp3";
    const soundEffect = new Audio(url);
    soundEffect.play();    
  }

  function showNotification(data) {
    Notification.requestPermission();
    if(!('permission' in Notification)) {
      Notification.permission = permission;
    }

    if (window.Notification && Notification.permission === "granted") {
      let parsedData = JSON.parse(data);
      let bodyText = `New Message from ${parsedData.username}: \' ${parsedData.message} \'`;
      new Notification('New Message', { body: bodyText});
    }
  }
  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).html();
  }

  // The 'Enter' event handler
  $window.keydown(function (event) {
    if (event.which === 13) {
      sendMessage();
    }
  });
  socket.on('new message', function (data) {    
    addChatMessage(data);
  });
});
