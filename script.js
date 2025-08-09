// OpenRouter API Key এখানে পেস্ট করা হয়েছে (English teacher key)
const OPENROUTER_API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_NAME = "mistralai/mistral-7b-instruct";

// যদি API কাজ না করে, তাহলে ব্যবহারের জন্য কিছু আগে থেকে তৈরি করা পাঠ।
const fallbackLessons = [
    {
        title: "পাঠ ১: গ্রিটিংস (Greetings)",
        content: `<h3>আজকের শব্দ: Hello!</h3>
        <p><b>Hello</b> (হ্যালো)লো)<br>
        <b>বাংলা অর্থ:</b> অভিবাদন! / ওহে! / কেমন আছেন? (সাধারণ অর্থ)</p>
        <p><b>ব্যবহার:</b> যখন আপনি কারো সাথে প্রথম দেখা করেন বা কারো মনোযোগ আকর্ষণ করতে চান, তখন আপনি "Hello!" বলতে পারেন।</p>
        <p><b>উদাহরণ:</b><br>
        • Hello, how are you?<br>
        • Hello, is anyone there?</p>
        <h3>আজকের বাক্য: What is your name?</h3>
        <p><b>What is your name?</b> (হোয়াট ইজ ইওর নেইম?)<br>
        <b>বাংলা অর্থ:</b> আপনার নাম কী?</p>
        <p><b>ব্যবহার:</b> কারো নাম জানতে আপনি এই বাক্যটি ব্যবহার করতে পারেন।</p>
        <p><b>উদাহরণ:</b><br>
        • Hello, what is your name?<br>
        • If someone asks you "What is your name?", you can answer "My name is [আপনার নাম]"</p>
        `
    },
    {
        title: "পাঠ ২: নিজেকে পরিচয় করানো (Introducing yourself)",
        content: `<h3>আজকের শব্দ: My name is...</h3>
        <p><b>My name is...</b> (মাই নেইম ইজ...)<br>
        <b>বাংলা অর্থ:</b> আমার নাম হয়...</p>
        <p><b>ব্যবহার:</b> আপনি যখন আপনার নাম বলবেন, তখন এই বাক্যটি ব্যবহার করবেন।</p>
        <p><b>উদাহরণ:</b><br>
        • My name is Rima.<br>
        • My name is Rohan.</p>
        <h3>আজকের বাক্য: Where are you from?</h3>
        <p><b>Where are you from?</b> (হোয়্যার আর ইউ ফ্রম?)<br>
        <b>বাংলা অর্থ:</b> আপনি কোথা থেকে এসেছেন?</p>
        <p><b>ব্যবহার:</b> কারো দেশ বা শহর জানতে এই বাক্যটি ব্যবহার করুন।</p>
        <p><b>উদাহরণ:</b><br>
        • Where are you from? I am from Bangladesh.</p>
        `
    },
    {
        title: "পাঠ ৩: প্রশ্ন করা (Asking Questions)",
        content: `<h3>আজকের শব্দ: How are you?</h3>
        <p><b>How are you?</b> (হাউ আর ইউ?)<br>
        <b>বাংলা অর্থ:</b> আপনি কেমন আছেন?</p>
        <p><b>ব্যবহার:</b> কারো খোঁজ-খবর নিতে এই বাক্যটি ব্যবহার করতে পারেন।</p>
        <p><b>উদাহরণ:</b><br>
        • Hello, how are you?<br>
        • I am fine, thank you. How are you?</p>
        <h3>আজকের বাক্য: What do you do?</h3>
        <p><b>What do you do?</b> (হোয়াট ডু ইউ ডু?)<br>
        <b>বাংলা অর্থ:</b> আপনি কী করেন?</p>
        <p><b>ব্যবহার:</b> কারো পেশা বা কাজ সম্পর্কে জানতে এই বাক্যটি ব্যবহার করুন।</p>
        <p><b>উদাহরণ:</b><br>
        • What do you do? I am a student.</p>
        `
    }
];

let fallbackLessonIndex = 0; // ফলব্যাক পাঠের জন্য সূচক

// HTML উপাদানগুলো নির্বাচন করা
const lessonTitle = document.getElementById("lesson-title");
const lessonContent = document.querySelector('.lesson-content');
const nextLessonBtn = document.getElementById("next-lesson-btn");
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const recordBtn = document.getElementById("record-btn");

// স্পিচ সিন্থেসিস (Text-to-Speech)
const synth = window.speechSynthesis;

// ফিমেল বাংলা ভয়েস খুঁজে বের করার ফাংশন
function getBengaliFemaleVoice() {
    const voices = synth.getVoices();
    const femaleVoice = voices.find(voice => voice.lang === 'bn-BD' && voice.name.includes('Female')) ||
                      voices.find(voice => voice.lang.startsWith('bn') && voice.name.includes('Female')) ||
                      voices.find(voice => voices.length > 0 && voices[0].name.includes('Female')) || // Fallback
                      voices.find(voice => voices.length > 0);
    return femaleVoice;
}

// চ্যাটবটে মেসেজ যোগ করার ফাংশন
function addMessage(text, isUser = false) {
    const message = document.createElement("p");
    message.textContent = text;
    message.classList.add(isUser ? "user-message" : "bot-message");
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (!isUser && text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'bn-BD';
        const femaleVoice = getBengaliFemaleVoice();
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        } else {
            console.warn("No Bengali female voice found. Using default voice.");
        }
        synth.speak(utterance);
    }
}

// OpenRouter থেকে নতুন পাঠ তৈরি করার ফাংশন (অথবা ফলব্যাক)
async function createNewLesson() {
    lessonTitle.textContent = "নতুন পাঠ তৈরি হচ্ছে...";
    lessonContent.innerHTML = "<p>দয়া করে অপেক্ষা করুন...</p>";

    try {
        const prompt = "আপনি একজন বাংলাভাষী শিক্ষার্থীদের জন্য একজন স্পোকেন ইংলিশ শিক্ষিকা। আপনার লক্ষ্য হলো একজন শিক্ষার্থীকে ধাপে ধাপে ইংরেজি শেখানো। একটি নতুন, সহজ এবং আকর্ষণীয় পাঠ তৈরি করুন। পাঠের মধ্যে একটি ইংরেজি শব্দ বা বাক্য থাকবে, তার বাংলা উচ্চারণ এবং বাংলা অর্থ থাকবে। একটি সংক্ষিপ্ত অনুশীলনও যোগ করুন। পুরো উত্তরটি বাংলায় দিন এবং আপনার উত্তরকে HTML ট্যাগ ব্যবহার করে সুন্দরভাবে সাজান।";

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: "system", content: "আপনি একজন বাংলা টু ইংরেজি ভার্চুয়াল শিক্ষিকা। আপনি সহজভাবে ইংরেজি শেখান।" },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const lessonResponse = data.choices[0].message.content;
            lessonTitle.textContent = "নতুন পাঠ";
            lessonContent.innerHTML = lessonResponse;
            addMessage("নতুন পাঠ তৈরি হয়েছে। অনুগ্রহ করে অনুশীলন শুরু করুন।", false);
        } else {
            // API থেকে ভুল উত্তর এলে ফলব্যাক ব্যবহার
            throw new Error("API response error");
        }

    } catch (error) {
        console.error("API Error or Network issue:", error);
        
        // API কল ব্যর্থ হলে ফলব্যাক পাঠ লোড করুন
        const currentLesson = fallbackLessons[fallbackLessonIndex];
        lessonTitle.textContent = currentLesson.title;
        lessonContent.innerHTML = currentLesson.content;
        addMessage("ইন্টারনেটে সমস্যা হচ্ছে। আপনার জন্য একটি অফলাইন পাঠ লোড করা হয়েছে।", false);
        
        // পরের বারের জন্য ফলব্যাক সূচক আপডেট করুন
        fallbackLessonIndex = (fallbackLessonIndex + 1) % fallbackLessons.length;
    }
}

// ব্যবহারকারীর ইনপুট পাঠানোর ফাংশন (টাইপ করে)
sendBtn.addEventListener("click", async () => {
    const userMessage = userInput.value;
    if (userMessage.trim() === "") return;

    addMessage(userMessage, true);
    userInput.value = "";
    
    try {
        const prompt = `আপনি একজন বাংলাভাষী স্পোকেন ইংলিশ শিক্ষিকা। একজন শিক্ষার্থী আপনাকে বলছে: "${userMessage}"। তার উত্তরটি একজন শিক্ষিকার মতো দিন। প্রথমত, তার ভুলগুলো খুঁজে বের করুন এবং সেগুলো সহজ বাংলায় বুঝিয়ে দিন। এরপর সঠিক বাক্যটি দিন এবং তাকে আরও একটি অনুশীলনের জন্য একটি নতুন প্রশ্ন বা বাক্য দিন।`;
        
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: "system", content: "আপনি একজন বাংলা টু ইংরেজি ভার্চুয়াল শিক্ষিকা। আপনি সহজভাবে ইংরেজি শেখান।" },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const botResponse = data.choices[0].message.content;
            addMessage(botResponse, false);
        } else {
            addMessage("⚠️ দুঃখিত, কিছু ভুল হয়েছে। আবার চেষ্টা করুন।", false);
            console.error("OpenRouter API Error:", data);
        }

    } catch (error) {
        console.error("OpenRouter API Error:", error);
        addMessage("দুঃখিত, কোনো ভুল হয়েছে। আপনার API Key বা ইন্টারনেট সংযোগে সমস্যা হতে পারে।", false);
    }
});


// স্পিচ টু টেক্সট ফিচার
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US'; 
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recordBtn.addEventListener('click', () => {
    const isRecording = recordBtn.classList.contains('recording');
    if (isRecording) {
        recognition.stop();
    } else {
        recordBtn.classList.add('recording');
        recordBtn.style.backgroundColor = '#2ecc71'; 
        addMessage("আপনার কথা শোনা হচ্ছে...", false);
        recognition.start();
    }
});

recognition.addEventListener('result', async (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendBtn.click();
});

recognition.addEventListener('end', () => {
    recordBtn.classList.remove('recording');
    recordBtn.style.backgroundColor = '#e74c3c';
});

recognition.addEventListener('error', (event) => {
    console.error('Speech recognition error', event);
    recordBtn.classList.remove('recording');
    recordBtn.style.backgroundColor = '#e74c3c';
    addMessage("দুঃখিত, আপনার কথা শুনতে পাইনি। অনুগ্রহ করে আবার চেষ্টা করুন।", false);
});

// পরবর্তী পাঠে যাওয়ার ফাংশন
nextLessonBtn.addEventListener("click", () => {
    createNewLesson();
});

// প্রথমবার পেজ লোড হলে
addMessage("শুভ সকাল! আমি আপনার ভার্চুয়াল শিক্ষিকা। ইংরেজি অনুশীলন করতে শুরু করুন।", false);
createNewLesson();
