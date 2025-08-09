/*
  script.js
  Flow summary:
  - Use Google Identity Services (GSI) to sign-in the user and obtain a credential (JWT).
  - Send the credential to the Google Apps Script web app endpoint (backend) to exchange for access_token and to proxy Gemini calls.
  - Backend will call Gemini API with the customer's token (acting on user's behalf) and return responses.
  - Frontend renders chat and course content.

  IMPORTANT: You must deploy backend.gs as a Web App (Execute as: Me, Who has access: Anyone) AND configure OAuth in Google Cloud Console.

  Replace placeholders: CLIENT_ID and BACKEND_URL
*/

const CLIENT_ID = 'REPLACE_WITH_CLIENT_ID.apps.googleusercontent.com';
const BACKEND_URL = 'REPLACE_WITH_BACKEND_DEPLOY_URL'; // Google Apps Script web app URL

let currentProfile = null;

function initGSI() {
  window.onGoogleLibraryLoad = () => {
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
    });

    google.accounts.id.renderButton(
      document.getElementById('g_id_signin'),
      { theme: 'outline', size: 'large', text: 'signin_with' }
    );
  };
}

// load GSI script and call initializer when ready
(function loadGSI() {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.onload = () => {
    window.onGoogleLibraryLoad && window.onGoogleLibraryLoad();
  };
  document.head.appendChild(script);
})();

async function handleCredentialResponse(response) {
  // response.credential is a JWT ID token — send to backend to exchange
  showNote('সাইন-ইন সম্পন্ন হচ্ছে...');

  try {
    const resp = await fetch(BACKEND_URL + '/auth', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ id_token: response.credential })
    });
    const data = await resp.json();
    if (data.error) throw new Error(data.error);

    // backend returns profile & a session token (backend manages user's access token securely)
    currentProfile = data.profile;
    sessionStorage.setItem('sess', data.sessionToken);
    onSignedIn();
  } catch (err) {
    console.error('Auth error', err);
    alert('লগইন করতে সমস্যা হয়েছে: ' + err.message);
  }
}

function onSignedIn() {
  document.getElementById('auth-section').hidden = true;
  document.getElementById('lesson-section').hidden = false;
  document.getElementById('user-name').textContent = currentProfile.name || '';
  document.getElementById('user-email').textContent = currentProfile.email || '';
  document.getElementById('user-avatar').src = currentProfile.picture || '';
  appendBotMessage('স্বাগতম! আপনি এখন আপনার Gemini শিক্ষক ব্যবহার করে ইংরেজি শিখতে পারবেন।');
}

function signOut() {
  sessionStorage.removeItem('sess');
  currentProfile = null;
  document.getElementById('auth-section').hidden = false;
  document.getElementById('lesson-section').hidden = true;
  google.accounts.id.disableAutoSelect();
}

document.getElementById('signout-btn').addEventListener('click', signOut);

const chatEl = document.getElementById('chat');

function appendUserMessage(text){
  const d = document.createElement('div'); d.className='msg user'; d.textContent = text; chatEl.appendChild(d); chatEl.scrollTop = chatEl.scrollHeight;
}
function appendBotMessage(text){
  const d = document.createElement('div'); d.className='msg bot'; d.innerHTML = text; chatEl.appendChild(d); chatEl.scrollTop = chatEl.scrollHeight;
}

// Chat form handling
const form = document.getElementById('chat-form');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const input = document.getElementById('user-input');
  const text = input.value.trim(); if(!text) return;
  appendUserMessage(text);
  input.value='';
  appendBotMessage('শিক্ষক উত্তরের জন্য প্রস্তুত হচ্ছে...');

  try{
    const sessionToken = sessionStorage.getItem('sess');
    const res = await fetch(BACKEND_URL + '/chat',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sessionToken, prompt: generateTeachingPrompt(text) })
    });
    const j = await res.json();
    if(j.error) throw new Error(j.error);
    // replace last placeholder bot message
    const last = chatEl.querySelector('.msg.bot:last-child');
    if(last) last.innerHTML = j.reply;
    else appendBotMessage(j.reply);
  }catch(err){
    console.error(err); appendBotMessage('⚠️ শিক্ষক থেকে উত্তর পাওয়া যায়নি — পরে চেষ্টা করুন।');
  }
});

// New lesson button — ask backend to create lesson content
document.getElementById('new-lesson').addEventListener('click', async ()=>{
  appendBotMessage('নতুন পাঠ তৈরি করা হচ্ছে...');
  try{
    const sessionToken = sessionStorage.getItem('sess');
    const res = await fetch(BACKEND_URL + '/lesson',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionToken})});
    const j = await res.json();
    if(j.error) throw new Error(j.error);
    appendBotMessage(j.lessonHtml);
  }catch(err){console.error(err); appendBotMessage('পাঠ তৈরি করা যায়নি।');}
});

// Course button — get full A→Z course material
document.getElementById('course-btn').addEventListener('click', async ()=>{
  appendBotMessage('কোর্স লোড করা হচ্ছে — এটি বড়, কিছুক্ষণ লাগতে পারে...');
  try{
    const sessionToken = sessionStorage.getItem('sess');
    const res = await fetch(BACKEND_URL + '/course',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionToken})});
    const j = await res.json();
    if(j.error) throw new Error(j.error);
    appendBotMessage(j.courseHtml);
  }catch(err){console.error(err); appendBotMessage('কোর্স লোড করতে ব্যর্থ।');}
});

function showNote(msg){console.log(msg)}

// Teaching prompt maker: gives teacher instructions to correct mistakes and explain in Bangla
function generateTeachingPrompt(userText){
  return `You are a Bengali-speaking spoken-English teacher. A student wrote or said: "${userText}". First, identify mistakes and explain them in simple Bangla. Then give the correct English sentence and an extra short exercise (one sentence) for practice. Use friendly tone.`;
}

// initialize
initGSI();
