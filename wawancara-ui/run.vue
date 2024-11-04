<template>
  <div class="page">
    <link rel="stylesheet" type="text/css"
      href="https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.1.2/css/material-design-iconic-font.min.css">
    <div class="marvel-device nexus5">
      <div class="top-bar"></div>
      <div class="sleep"></div>
      <div class="volume"></div>
      <div class="camera"></div>
      <div class="screen">
        <div class="screen-container">
          <div class="status-bar">
            <div class="time"></div>
            <div class="battery">
              <i class="zmdi zmdi-battery"></i>
            </div>
            <div class="network">
              <i class="zmdi zmdi-network"></i>
            </div>
            <div class="wifi">
              <i class="zmdi zmdi-wifi-alt-2"></i>
            </div>
            <div class="star">
              <i class="zmdi zmdi-star"></i>
            </div>
          </div>
          <div class="chat">
            <div class="chat-container">
              <div class="user-bar">
                <div class="avatar" @click="openProfile()">
                  <img src="/img/logo_daerah/logo_jabar.png" alt="Avatar">
                </div>
                <div class="name" @click="openProfile()">
                  <span>Asesor SDM Aparatur</span>
                  <span class="status">Online</span>
                </div>
                <div class="actions more" @click="openMenu()">
                  <i class="zmdi zmdi-more-vert"></i>
                </div>
                <div class="actions attachment" @click="openAttachment()">
                  <i class="zmdi zmdi-attachment-alt"></i>
                </div>
                <div class="actions" @click="callMe()">
                  <i class="zmdi zmdi-phone"></i>
                </div>
              </div>
              <div class="conversation">
                <div class="conversation-container" ref="conversation">
                  <div class="btn btn-primary" style="margin-top: 1em" v-show="!started" @click="startAsesmen">Mulai Asesmen</div>
                  <div class="conversation-dropshadow">
                  </div>
                  <div class="message" :class="{received: !chat.isMe, sent: chat.isMe}" v-for="chat in chats">
                    <div v-html="convertMarkdownToHtml(chat.message)"></div>
                    <span class="metadata"><span class="time"></span></span>
                    <span @click="speakChat(chat)" v-if="!chat.isMe" style="color: #aaa;">
                      <i class="zmdi zmdi-volume-up"></i>
                    </span>
                  </div>

                  <!-- Add timer display -->
                  <div v-if="showTimer" class="timer">
                    Time remaining: {{ formatTime(timeRemaining) }}
                  </div>

                </div>
                <div class="conversation-compose">
                  <div class="emoji" @click="openEmoji()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" id="smiley" x="3147" y="3209">
                      <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M9.153 11.603c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965zM5.95 12.965c-.027-.307-.132 5.218 6.062 5.55 6.066-.25 6.066-5.55 6.066-5.55-6.078 1.416-12.13 0-12.13 0zm11.362 1.108s-.67 1.96-5.05 1.96c-3.506 0-5.39-1.165-5.608-1.96 0 0 5.912 1.055 10.658 0zM11.804 1.01C5.61 1.01.978 6.034.978 12.23s4.826 10.76 11.02 10.76S23.02 18.424 23.02 12.23c0-6.197-5.02-11.22-11.216-11.22zM12 21.355c-5.273 0-9.38-3.886-9.38-9.16 0-5.272 3.94-9.547 9.214-9.547a9.548 9.548 0 0 1 9.548 9.548c0 5.272-4.11 9.16-9.382 9.16zm3.108-9.75c.795 0 1.44-.88 1.44-1.963s-.645-1.96-1.44-1.96c-.795 0-1.44.878-1.44 1.96s.645 1.963 1.44 1.963z"
                        fill="#7d8489" />
                    </svg>
                  </div>
                  <textarea class="input-msg" name="input" placeholder="Balas di sini" autocomplete="off"
                    autofocus @key-up.enter="sendMessage" v-model="message" ref="answer" :disabled="replying" @input="handleTyping"></textarea>
                  <div class="word-count">
                    <span :style="{ color: wordCountStyle }">{{ wordCountDisplay }}</span>
                  </div>
                  <div class="photo" @click="openMic()">
                    <i class="zmdi zmdi-mic" :style="{
                    color: isRecording ? '#ff0000' : '#aaaaaa'
                  }"></i>
                  </div>
                  <button class="send" @click="sendMessage()">
                    <div class="circle">
                      <i class="zmdi zmdi-mail-send"></i>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import Swal from "sweetalert2";
import axios from 'axios'
import { mapGetters } from 'vuex'

import { initProtection, clearProtection } from '~/utils/test-protection'
const aichatURL = "https://oac.jabarprov.go.id/aichat"
// const aichatURL = "http://localhost:8000"

class AudioManager {
  constructor() {
    this.audio = new Audio();
    this.queue = [];
    this.isPlaying = false;

    this.audio.addEventListener('ended', () => this.playNext());
  }

  play(url) {
    this.queue.push(url);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    const nextUrl = this.queue.shift();
    this.audio.src = nextUrl;
    this.audio.play()
      .then(() => {
        this.isPlaying = true;
      })
      .catch(error => {
        console.error('Error playing audio:', error);
        this.playNext(); // Skip to the next audio if there's an error
      });
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
    this.queue = []; // Clear the queue
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
  }

  resume() {
    if (this.audio.src) {
      this.audio.play()
        .then(() => {
          this.isPlaying = true;
        })
        .catch(error => {
          console.error('Error resuming audio:', error);
        });
    } else if (this.queue.length > 0) {
      this.playNext();
    }
  }
}

// Usage
const audioManager = new AudioManager();

export default {
  async asyncData({ params, store }) {
    let token = store.getters['auth/token'];
    let level = parseInt(params.level || 1);
    let state = 3010100
    state = state + parseInt(level)
    let param1 = 1
    let id_ccat_assesment_batch_jenis_ujian = ''
    return {
      token,
      level,
      state,
      param1,
      id_ccat_assesment_batch_jenis_ujian,
    }
  },
  data() {
    return {
      started: false,
      indonesianVoices: [],
      message: '',
      interaction: 0,
      chats: [],
      currentHistory: [],
      replying: false,
      isRecording: false,
      transcription: '',
      mediaRecorder: null,
      audioChunks: [],
      showTimer: false,
      timeRemaining: 60,
      timerInterval: null,
      typingTimeout: null,
      addedTime: false,
      autoPlaySound: true,
      wordCount: 0,
      wordCountDisplay: '',
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/user'
    }),

    wordCountStyle() {
      return this.wordCount < 10 || this.wordCount > 50 ? 'red' : 'black';
    }
  },
  async mounted() {
  },
  methods: {
    async startAsesmen() {
      this.started = true
      await this.callChatBackend('WELCOME')
      await new Promise(resolve => setTimeout(resolve, 3000))
      this.currentHistory = []
      this.interaction = 0
      await this.callChatBackend('INIT')
    },
    openMic() {
      if (!this.isRecording) {
        this.startRecording()
      } else {
        this.stopRecording()
      }
    },

    async startRecording () {
      this.handleTyping()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    },

    stopRecording() {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('audio', audioBlob);

        const response = await fetch(aichatURL + '/stt', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
          body: formData,
        });
        // console.log('response', response)

        this.message = (await response.json()).text;
        this.handleTyping()
      };

    },
    openEmoji() {

    },
    openMenu() {

    },
    openProfile() {

    },
    openAttachment() {

    },
    callMe() {

    },
    async speakChat(chat) {
      const response = await fetch(aichatURL + '/tts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: chat.message,
          voiceno: 0,
        })
      })
      const data = await response.json()
      audioManager.play(aichatURL + '/' + data.path)
    },
    speakChatLocal(chat) {
      const speech = new SpeechSynthesisUtterance(chat.message);
      speech.lang = 'id-ID'; // Set language to Indonesian
      speech.rate = 1.2

      // Find an Indonesian voice if available
      if (!this.indonesianVoices.length) {
        const voices = window.speechSynthesis.getVoices();
        this.indonesianVoices = voices.filter(voice => voice.lang === 'id-ID').sort((a, b) => a.name.localeCompare(b.name));
      }
      if (this.indonesianVoices.length) {
        speech.voice = this.indonesianVoices[0];
      }

      window.speechSynthesis.speak(speech);
    },
    convertMarkdownToHtml(markdown) {
      let html = markdown.replace(/\|~/g, "\n");

      // Convert bold text
      html = html.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');

      // Convert headers
      html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl">$1</h1>');
      html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl">$1</h2>');
      html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl">$1</h3>');

      // Convert LaTeX equations
      html = html.replace(/\\\[(.*?)\\\]/gs, (match, p1) => {
        const _window = window
        if (!_window.katex) return p1
        return `<div class="katex-display">${_window.katex.renderToString(p1, { displayMode: true })}</div>`;
      });

      // Convert tables
      html = html.replace(/(\|[^\n]+\|\n)((?:\|[\-:]+)+\|)(\n(?:\|[^\n]+\|\n?)*)/g, function (match, header, separator, body) {
        const headerHtml = header.trim().split('|').filter(Boolean).map((cell) => `<th class="px-6 py-4">${cell.trim()}</th>`).join('');
        const bodyHtml = body.trim().split('\n').map((row) =>
          '<tr>' + row.split('|').filter(Boolean).map((cell) => `<td class="px-6 py-4">${cell.trim()}</td>`).join('') + '</tr>'
        ).join('');

        return `<div class='overflow-x-auto' style="max-width: 600px"><table class="border-b bg-gray-800 border-gray-700 table-auto overflow-scroll w-full">
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${bodyHtml}</tbody>
        </table></div>`;
      });

      // Convert newlines (but not within tables)
      html = html.replace(/\n(?!<\/tr>|<tr>|<table>|<\/table>|<thead>|<tbody>)/g, '<br>');

      return html;
    },

    async callChatBackend(msg) {
      const chatOutput = {
        isMe: false,
        message: '...'
      }
      this.chats.push(chatOutput)
      this.replying = true
      const response = await fetch(aichatURL + '/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: msg,
          nip: this.user.pegawai_hrm.NIP,
          state: this.state,
          level: this.level,
          param1: this.param1,
          interaction: this.interaction,
          currentHistory: this.currentHistory,
          id_ccat_assesment_batch_jenis_ujian: this.id_ccat_assesment_batch_jenis_ujian,
        })
      })
      chatOutput.message = ''

      // Check if the response is ok (status 200-299)
      if (!response.ok) {
        console.error('Error:', response.statusText);
        return;
      }
      if (!response.body) {
        console.error('Error:', response);
        return;
      }

      // Create an SSE listener
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let stillinteract = true
      let retryinteract = false

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const dataChunk = decoder.decode(value, { stream: true });
        const messages = dataChunk.split('\n').filter(Boolean);

        messages.forEach(data => {
          if (data.startsWith('data: state:')) {
            const newstate =  data.replace('data: state: ', '');
            stillinteract = false
            this.state = parseInt(newstate)
          } else if (data.startsWith('data: param1:')) {
            const newparam1 =  data.replace('data: param1: ', '');
            stillinteract = false
            this.param1 = parseInt(newparam1)
          } else if (data.startsWith('data: STOP')) {
            const messageData = data.replace('data: ', '');
            chatOutput.message = `Maaf, saya tidak mengerti jawaban Anda. Mohon jawab ulang sesuai dengan pertanyaan saya.`;
            retryinteract = true
            this.scrollToBottomConversation();
          } else if (data.startsWith('data: ')) {
            const messageData = data.replace('data: ', '');
            chatOutput.message += `${messageData}`;
            this.scrollToBottomConversation();
          }
        });
      }
      // check interaction state
      if (retryinteract) {
        this.currentHistory.pop()
      } else {
        if (stillinteract) {
          this.interaction++
        } else {
          this.interaction = 1
          this.currentHistory = []
        }
        if (this.autoPlaySound) {
          this.speakChat(chatOutput)
        }
        this.currentHistory.push({
          role: 'assistant',
          content: chatOutput.message
        })
      }


      this.replying = false
      this.$nextTick(() => {
        this.$refs.answer.focus()
      })

      // Start the timer when a new question is received
      this.startTimer()
    },

    async sendMessage (e) {
      if (e && !e.shiftKey) {
        return
      }

      // Prevent sending if more than 50 words
      if (this.wordCount > 50) {
        // Swal.fire('Error', 'You cannot submit more than 50 words.', 'error');
        return;
      }

      if (this.wordCount < 10) {
        return;
      }

      // Create a new EventSource to receive SSE
      const msg = !this.showTimer && this.message == '' ? 'WAKTU HABIS' : this.message

      if (msg == 'WAKTU HABIS') {
        this.ontimerend()
      } else if (msg == '') {
        return
      }

      this.chats.push({
        isMe: true,
        message: msg
      })

      this.message = ""
      this.wordCount = 0;
      this.wordCountDisplay = '';
      this.addedTime = false
      this.scrollToBottomConversation()
      this.currentHistory.push({
        role: 'user',
        content: msg
      })

      // Stop the timer when a message is sent
      this.stopTimer()

      await this.callChatBackend(msg)
    },
    scrollToBottomConversation() {
      this.$nextTick(() => {
        this.$refs.conversation.scrollTop = this.$refs.conversation.scrollHeight;
      })
    },

    startTimer() {
      this.showTimer = true
      this.timeRemaining = 60

      clearInterval(this.timerInterval)
      this.timerInterval = setInterval(() => {
        this.timeRemaining--
        if (this.timeRemaining <= 0) {
          this.stopTimer()
          this.handleTimeUp()
        }
      }, 1000)
    },

    stopTimer() {
      clearInterval(this.timerInterval)
      this.showTimer = false
    },

    handleTimeUp() {
      // Automatically send a message when time is up
      this.sendMessage()
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },

    handleTyping() {
      // Split message into words and count them
      const words = this.message.trim().split(/\s+/);
      this.wordCount = words.filter(Boolean).length;

      // Update word count display
      if (this.wordCount < 10) {
        this.wordCountDisplay = `-${10 - this.wordCount}`;
      } else if (this.wordCount <= 50) {
        this.wordCountDisplay = `${this.wordCount} / 50`;
      } else {
        this.wordCountDisplay = `${this.wordCount} / 50`;
      }

      // Clear existing timeout
      clearTimeout(this.typingTimeout)

      // Check if time has already been added during this typing session
      if (!this.addedTime) {
        // Set a new timeout to add time after 1 second of inactivity
        this.typingTimeout = setTimeout(() => {
          // Add 30 seconds to the timer
          this.timeRemaining += 30;

          this.addedTime = true; // Mark that we've added time
        }, 1000); // Wait for 1 second of inactivity before adding time
      }
    },

    ontimerend() {
      console.log('timerend')
    }
  }
}
</script>
<style scoped>
*,
*:before,
*:after {
  box-sizing: inherit;
}

html {
  box-sizing: border-box;
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: "Roboto", sans-serif;
  margin: 0;
  padding: 0;
  height: 100%;
  font-size: 16px;
}

.page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marvel-device .screen {
  text-align: left;
}

.screen-container {
  /*min-height: 100vh;*/
  height: calc(100vh - 135px);
  width: calc(100vw - 60px);
  max-width: 1024px;
}

/* Status Bar */

.status-bar {
  height: 25px;
  background: #004e45;
  color: #fff;
  font-size: 0.875rem;
  padding: 0 8px;
}

.status-bar:after {
  content: "";
  display: table;
  clear: both;
}

.status-bar div {
  float: right;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  margin: 0 0 0 8px;
  font-weight: 600;
}

/* Chat */

.chat {
  height: calc(100% - 69px);
}

.chat-container {
  height: 100%;
}

/* User Bar */

.user-bar {
  height: 55px;
  background: #005e54;
  color: #fff;
  padding: 0 8px;
  font-size: 1.5rem;
  position: relative;
  z-index: 100;
}

.user-bar:after {
  content: "";
  display: table;
  clear: both;
}

.user-bar div {
  float: left;
  transform: translateY(-50%);
  position: relative;
  top: 50%;
}

.user-bar .actions {
  float: right;
  margin: 0 0 0 20px;
}

.user-bar .actions.more {
  margin: 0 12px 0 32px;
}

.user-bar .actions.attachment {
  margin: 0 0 0 30px;
}

.user-bar .actions.attachment i {
  display: block;
  transform: rotate(-45deg);
}

.user-bar .avatar {
  margin: 0 0 0 5px;
  width: 36px;
  height: 36px;
}

.user-bar .avatar img {
  border-radius: 50%;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
  display: block;
  width: 100%;
}

.user-bar .name {
  font-size: 1.0625rem;
  font-weight: 600;
  text-overflow: ellipsis;
  letter-spacing: 0.3px;
  margin: 0 0 0 8px;
  overflow: hidden;
  white-space: nowrap;
  width: 175px;
}

.user-bar .status {
  display: block;
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: 0;
}

/* Conversation */

.conversation {
  height: calc(100% - 12px);
  position: relative;
  background: #efe7dd url("https://cloud.githubusercontent.com/assets/398893/15136779/4e765036-1639-11e6-9201-67e728e86f39.jpg") repeat;
  z-index: 0;
}

.conversation ::-webkit-scrollbar {
  transition: all .5s;
  width: 5px;
  height: 1px;
  z-index: 10;
}

.conversation ::-webkit-scrollbar-track {
  background: transparent;
}

.conversation ::-webkit-scrollbar-thumb {
  background: #b3ada7;
}

.conversation .conversation-container {
  height: calc(100% - 68px);
  overflow-x: hidden;
  padding: 0 16px;
  margin-bottom: 5px;
}

.conversation .conversation-dropshadow {
  box-shadow: inset 0 10px 10px -10px #000000;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  height: 10px;
}

.conversation .conversation-container:after {
  content: "";
  display: table;
  clear: both;
}

/* Messages */

.message {
  color: #000;
  clear: both;
  line-height: 1.25rem;
  font-size: 1rem;
  padding: 8px;
  position: relative;
  margin: 4px 0;
  max-width: 85%;
  word-wrap: break-word;
  z-index: 1;
}

.message:after {
  position: absolute;
  content: "";
  width: 0;
  height: 0;
  border-style: solid;
}

.metadata {
  display: inline-block;
  float: right;
  padding: 0 0 0 7px;
  position: relative;
  bottom: -4px;
}

.metadata .time {
  color: rgba(0, 0, 0, .45);
  font-size: 0.6875rem;
  display: inline-block;
}

.metadata .tick {
  display: inline-block;
  margin-left: 2px;
  position: relative;
  top: 4px;
  height: 16px;
  width: 16px;
}

.metadata .tick svg {
  position: absolute;
  transition: .5s ease-in-out;
}

.metadata .tick svg:first-child {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform: perspective(800px) rotateY(180deg);
  transform: perspective(800px) rotateY(180deg);
}

.metadata .tick svg:last-child {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform: perspective(800px) rotateY(0deg);
  transform: perspective(800px) rotateY(0deg);
}

.metadata .tick-animation svg:first-child {
  -webkit-transform: perspective(800px) rotateY(0);
  transform: perspective(800px) rotateY(0);
}

.metadata .tick-animation svg:last-child {
  -webkit-transform: perspective(800px) rotateY(-179.9deg);
  transform: perspective(800px) rotateY(-179.9deg);
}

.message:nth-child(2) {
  margin: 16px 0 4px;
}

.message.received {
  background: #fff;
  border-radius: 0px 5px 5px 5px;
  float: left;
}

.message.received .metadata {
  padding: 0 0 0 16px;
}

.message.received:after {
  border-width: 0px 10px 10px 0;
  border-color: transparent #fff transparent transparent;
  top: 0;
  left: -10px;
}

.message.sent {
  background: #e1ffc7;
  border-radius: 5px 0px 5px 5px;
  float: right;
}

.message.sent:after {
  border-width: 0px 0 10px 10px;
  border-color: transparent transparent transparent #e1ffc7;
  top: 0;
  right: -10px;
}

.message .img-preview {
  width: 100%;
  height: auto;
}

.message a {
  color: #4fc3f7;
  text-decoration: none;
}

/* Compose */

.conversation-compose {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  overflow: hidden;
  height: 50px;
  width: 100%;
  z-index: 2;
}

.conversation-compose div,
.conversation-compose textarea {
  background: #fff;
  height: 56px;
  line-height: 16px;
}
.conversation-compose textarea {
  padding-top: 16px;
  resize: none;
}

.conversation-compose .emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 5px 0 0 5px;
  flex: 0 0 auto;
  margin-left: 8px;
  width: 48px;
}

.conversation-compose .input-msg {
  border: 0;
  flex: 1 1 auto;
  font-size: 1rem;
  margin: 0;
  outline: none;
  min-width: 50px;
}

.conversation-compose .word-count {
  flex: 0 0 auto;
  text-align: right;
  position: relative;
  /* width: 48px; */
}

.conversation-compose .word-count span {
  display: block;
  color: #7d8488;
  font-size: 1rem;
  transform: translate(-50%, -50%);
  position: relative;
  top: 50%;
  left: 50%;
}

.conversation-compose .photo {
  flex: 0 0 auto;
  border-radius: 0 0 5px 0;
  text-align: center;
  position: relative;
  width: 48px;
}

.conversation-compose .photo:after {
  border-width: 0px 0 10px 10px;
  border-color: transparent transparent transparent #fff;
  border-style: solid;
  position: absolute;
  width: 0;
  height: 0;
  content: "";
  top: 0;
  right: -10px;
}

.conversation-compose .photo i {
  display: block;
  color: #7d8488;
  font-size: 1.5rem;
  transform: translate(-50%, -50%);
  position: relative;
  top: 50%;
  left: 50%;
}

.conversation-compose .send {
  background: transparent;
  border: 0;
  cursor: pointer;
  flex: 0 0 auto;
  margin-left: 8px;
  margin-right: 8px;
  padding: 0;
  position: relative;
  outline: none;
}

.conversation-compose .send .circle {
  background: #008a7c;
  border-radius: 50%;
  color: #fff;
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.conversation-compose .send .circle i {
  font-size: 1.5rem;
  margin-left: 5px;
}

/* Small Screens */

@media (max-width: 768px) {
  .marvel-device.nexus5 {
    border-radius: 0;
    flex: none;
    padding: 0;
    max-width: none;
    overflow: hidden;
    height: 100%;
    width: 100%;
  }

  .marvel-device>.screen .chat {
    visibility: visible;
  }

  .marvel-device {
    visibility: hidden;
  }

  .marvel-device .status-bar {
    display: none;
  }

  .screen-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .conversation {
    height: calc(100vh - 55px - 56px);
  }

  .conversation .conversation-container {
    height: calc(100vh - 120px - 56px);
  }
}

.testi-message {
  margin-bottom: 10px;
  text-align: left;
}

.timer {
  position: fixed;
  top: 70px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
}
</style>
