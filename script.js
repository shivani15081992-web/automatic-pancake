// আপনার Google Gemini API Key এখানে পেস্ট করুন
const GEMINI_API_KEY = "AIzaSyC3bmWu50URTnT0jiek3WRV4rgJf8fvhis";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// HTML উপাদানগুলো নির্বাচন করা
const lessonTitle = document.getElementById("lesson-title");
const lessonContent = document.querySelector('.lesson-content');
const nextLessonBtn = document.getElementById("next-lesson-btn");
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// স্পিচ সিন্থেসিস (Text-to-Speech)
const synth = window.speechSynthesis;

// ফিমেল বাংলা ভয়েস খুঁজে বের করার ফাংশন
function getBengaliFemaleVoice() {
    const voices = synth.getVoices();
    return voices.find(voice => voice.lang === 'bn-BD' && voice.name.includes('Female')) ||
           voices.find(voice => voice.lang.startsWith('bn') && voice.name.includes('Female')) ||
           voices.find(voice => voice.lang === 'bn-IN' && voice.name.includes('Female'));
}

// চ্যাটবটে মেসেজ যোগ করার ফাংশন
function addMessage(text, isUser = false) {
    const message = document.createElement("p");
    message.textContent = text;
    message.classList.add(isUser ? "user-message" : "bot-message");
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (!isUser) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'bn-BD';
        const femaleVoice = getBengaliFemaleVoice();
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        synth.speak(utterance);
    }
}

// Gemini থেকে নতুন পাঠ তৈরি করার ফাংশন
async function createNewLesson() {
    lessonTitle.textContent = "নতুন পাঠ তৈরি হচ্ছে...";
    lessonContent.innerHTML = "<p>দয়া করে অপেক্ষা করুন...</p>";

    try {
        const prompt = "আপনি একজন বাংলাভাষী শিক্ষার্থীদের জন্য একজন স্পোকেন ইংলিশ শিক্ষিকা। আপনার লক্ষ্য হলো একজন শিক্ষার্থীকে ধাপে ধাপে ইংরেজি শেখানো। একটি নতুন, সহজ এবং আকর্ষণীয় পাঠ তৈরি করুন। পাঠের মধ্যে একটি ইংরেজি শব্দ বা বাক্য থাকবে, তার বাংলা উচ্চারণ এবং বাংলা অর্থ থাকবে। একটি সংক্ষিপ্ত অনুশীলনও যোগ করুন। পুরো উত্তরটি বাংলায় দিন এবং আপনার উত্তরকে HTML ট্যাগ ব্যবহার করে সুন্দরভাবে সাজান।";

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{text: prompt}]
                }]
            })
        });

        const data = await response.json();
        const lessonResponse = data.candidates[0].content.parts[0].text;

        lessonTitle.textContent = "নতুন পাঠ";
        lessonContent.innerHTML = lessonResponse;

    } catch (error) {
        console.error("Gemini API Error:", error);
        lessonTitle.textContent = "দুঃখিত!";
        lessonContent.innerHTML = "<p>নতুন পাঠ তৈরি করা সম্ভব হয়নি। আবার চেষ্টা করুন।</p>";
    }
}

// ব্যবহারকারীর ইনপুট পাঠানোর ফাংশন
sendBtn.addEventListener("click", async () => {
    const userMessage = userInput.value;
    if (userMessage.trim() === "") return;

    addMessage(userMessage, true);
    userInput.value = "";

    try {
        const prompt = `আপনি একজন বাংলাভাষী স্পোকেন ইংলিশ শিক্ষিকা। একজন শিক্ষার্থী আপনাকে বলছে: "${userMessage}"। তার উত্তরটি একজন শিক্ষিকার মতো দিন। প্রথমত, তার ভুলগুলো খুঁজে বের করুন এবং সেগুলো সহজ বাংলায় বুঝিয়ে দিন। এরপর সঠিক বাক্যটি দিন এবং তাকে আরও একটি অনুশীলনের জন্য একটি নতুন প্রশ্ন বা বাক্য দিন।`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{text: prompt}]
                }]
            })
        });

        const data = await response.json();
        const botResponse = data.candidates[0].content.parts[0].text;
        addMessage(botResponse, false);

    } catch (error) {
        console.error("Gemini API Error:", error);
        addMessage("দুঃখিত, কোনো ভুল হয়েছে। আবার চেষ্টা করুন।", false);
    }
});

// পরবর্তী পাঠে যাওয়ার ফাংশন
nextLessonBtn.addEventListener("click", () => {
    createNewLesson();
});

// প্রথমবার পেজ লোড হলে একটি প্রাথমিক মেসেজ দেখানো
addMessage("শুভ সকাল! আমি আপনার ভার্চুয়াল শিক্ষিকা। ইংরেজি অনুশীলন করতে শুরু করুন।", false);

// প্রথমবার পেজ লোড হলে একটি পাঠ তৈরি করা
createNewLesson();
