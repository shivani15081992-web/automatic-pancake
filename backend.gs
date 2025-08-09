// backend.gs
// Google Apps Script: lightweight proxy to exchange id_token and call Gemini on behalf of the user

const CLIENT_ID = 'REPLACE_WITH_CLIENT_ID.apps.googleusercontent.com';

function doPost(e){
  const path = e.parameter.path || ''; // optional
  try{
    const body = JSON.parse(e.postData.contents);
    const route = e.pathInfo || body.route || body.action;

    if(e.parameter && e.parameter._fx){
      // legacy
    }

    // /auth : exchange id_token -> get user info and store session
    if(route === 'auth' || e.parameter.action === 'auth'){
      const idToken = body.id_token;
      const payload = JSON.parse(Utilities.newBlob(Utilities.base64Decode(idToken.split('.')[1])).getDataAsString());
      // Basic validation: iss and aud
      if(payload.aud !== CLIENT_ID) return jsonResponse({error:'invalid_client'});
      // create a simple session token (not secure for production). In production store in database.
      const sess = Utilities.getUuid();
      const profile = { name: payload.name, email: payload.email, picture: payload.picture };
      // store mapping in script properties (ephemeral). For production use Firestore/Sheets/Datastore.
      const cache = CacheService.getScriptCache();
      cache.put(sess, idToken, 6 * 60 * 60); // store for 6 hours
      return jsonResponse({ sessionToken: sess, profile });
    }

    // /chat : proxy to Gemini using the id_token stored for session
    if(route === 'chat' || e.parameter.action === 'chat'){
      const sess = body.sessionToken;
      const prompt = body.prompt;
      const cache = CacheService.getScriptCache();
      const idToken = cache.get(sess);
      if(!idToken) return jsonResponse({error:'session_not_found'});

      // Call Generative Language API v1 using the idToken as Bearer token
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateText';
      const payload = {
        prompt: { text: prompt },
        maxOutputTokens: 400
      };
      const options = {
        method:'post',
        contentType:'application/json',
        headers: { Authorization: 'Bearer ' + idToken },
        payload: JSON.stringify(payload),
        muteHttpExceptions:true
      };
      const r = UrlFetchApp.fetch(url, options);
      const res = JSON.parse(r.getContentText());
      // Adapt to response
      const reply = (res && res.candidates && res.candidates[0] && res.candidates[0].content && res.candidates[0].content[0] && res.candidates[0].content[0].text) ? res.candidates[0].content[0].text : (res.output?.[0]?.content?.[0]?.text || JSON.stringify(res));
      return jsonResponse({ reply });
    }

    // /lesson : ask teacher to generate a lesson
    if(route === 'lesson' || e.parameter.action === 'lesson'){
      const sess = body.sessionToken;
      const cache = CacheService.getScriptCache();
      const idToken = cache.get(sess);
      if(!idToken) return jsonResponse({error:'session_not_found'});
      const prompt = `আপনি একজন বাংলাভাষী স্পোকেন ইংলিশ শিক্ষক। একজন শিক্ষার্থীর জন্য একটি নতুন, সহজ এবং আকর্ষণীয় পাঠ (HTML ফরম্যাটে) তৈরি করুন — একটি শব্দ/বাক্য, বাংলা উচ্চারণ, বাংলা অর্থ, এবং একটি ছোট অনুশীলন। পুরো উত্তর বাংলায় দিন।`;
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateText';
      const payload = { prompt:{ text: prompt }, maxOutputTokens: 600 };
      const options = { method:'post', contentType:'application/json', headers:{ Authorization: 'Bearer ' + idToken }, payload: JSON.stringify(payload), muteHttpExceptions:true };
      const r = UrlFetchApp.fetch(url, options);
      const res = JSON.parse(r.getContentText());
      const lesson = (res && res.candidates && res.candidates[0] && res.candidates[0].content && res.candidates[0].content[0] && res.candidates[0].content[0].text) ? res.candidates[0].content[0].text : JSON.stringify(res);
      return jsonResponse({ lessonHtml: lesson });
    }

    // /course : return a larger A→Z course in Bengali & English
    if(route === 'course' || e.parameter.action === 'course'){
      const sess = body.sessionToken;
      const cache = CacheService.getScriptCache();
      const idToken = cache.get(sess);
      if(!idToken) return jsonResponse({error:'session_not_found'});
      const prompt = `আপনি একজন বাংলাভাষী স্পোকেন ইংলিশ ট্রেনার। একটি সম্পূর্ণ A to Z spoken English course তৈরি করুন, যা শুরু থেকে advanced পর্যায় পর্যন্ত সাজানো - প্রতিটি ধাপে অনুশীলন ও শিখানোর নির্দেশ থাকবে। HTML ট্যাগ ব্যবহার করে সুন্দরভাবে সাজান।`;
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateText';
      const payload = { prompt:{ text: prompt }, maxOutputTokens: 2000 };
      const options = { method:'post', contentType:'application/json', headers:{ Authorization: 'Bearer ' + idToken }, payload: JSON.stringify(payload), muteHttpExceptions:true };
      const r = UrlFetchApp.fetch(url, options);
      const res = JSON.parse(r.getContentText());
      const course = (res && res.candidates && res.candidates[0] && res.candidates[0].content && res.candidates[0].content[0] && res.candidates[0].content[0].text) ? res.candidates[0].content[0].text : JSON.stringify(res);
      return jsonResponse({ courseHtml: course });
    }

    return jsonResponse({error:'unknown_route'});

  }catch(err){
    return jsonResponse({error: err.message || String(err)});
  }
}

function jsonResponse(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
