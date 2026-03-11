const splash = document.getElementById('splash-screen'), instr = document.getElementById('instructions-screen'),
      app = document.getElementById('main-app'), grid = document.getElementById('stations-grid'),
      playerZone = document.getElementById('player-zone'), audio = document.getElementById('audio-player'),
      transcript = document.getElementById('transcript-box'), popup = document.getElementById('translation-popup'),
      gameZone = document.getElementById('game-zone'), gameBoard = document.getElementById('game-board'),
      feedbackArea = document.getElementById('quiz-feedback-area'), ptsVal = document.getElementById('points-val');

let lifetimeScore = parseInt(localStorage.getItem('traitorsScore')) || 0;
let completedLessons = JSON.parse(localStorage.getItem('completedTraitorsLessons')) || [];
if(ptsVal) ptsVal.innerText = lifetimeScore;

let wordBucket = []; let currentQ = 0; let attempts = 0; let totalScore = 0; let firstCard = null;

const stations = [
    {file:"01_AlfredRedl.mp3", title:"1. Alfred Redl"},
    {file:"02_AndreyVlasov.mp3", title:"2. Andrey Vlasov"},
    {file:"03_BenedictArnold.mp3", title:"3. Benedict Arnold"},
    {file:"04_Brutus.mp3", title:"4. Marcus Brutus"},
    {file:"05_CharlesLee.mp3", title:"5. Charles Lee"},
    {file:"06_DonaMarina.mp3", title:"6. Dona Marina"},
    {file:"07_Ephialtes.mp3", title:"7. Ephialtes of Trachis"},
    {file:"08_Firouz.mp3", title:"8. Firouz"},
    {file:"09_Ganelon.mp3", title:"9. Ganelon"},
    {file:"10_GuyFawkes.mp3", title:"10. Guy Fawkes"},
    {file:"11_JeanBaptisteBernadotte.mp3", title:"11. Jean-Baptiste Bernadotte"},
    {file:"12_JudasIscariot.mp3", title:"12. Judas Iscariot"},
    {file:"13_MirJafar.mp3", title:"13. Mir Jafar"},
    {file:"14_PaullusVitellius.mp3", title:"14. Paullus Vitellius"},
    {file:"15_PhilippePetain.mp3", title:"15. Philippe Petain"},
    {file:"16_TridentineTraitors.mp3", title:"16. The Tridentine Traitors"},
    {file:"17_VidkunQuisling.mp3", title:"17. Vidkun Quisling"},
    {file:"18_WangJingwei.mp3", title:"18. Wang Jingwei"},
    {file:"19_WilliamJoyce.mp3", title:"19. William Joyce"},
    {file:"20_WuSangui.mp3", title:"20. Wu Sangui"},
    {file:"21_ZhangBangchang.mp3", title:"21. Zhang Bangchang"}
];

function renderGrid() {
    grid.innerHTML = "";
    stations.forEach((s, i) => {
        const btn = document.createElement('div'); btn.className = 'station-tile';
        if(completedLessons.includes(s.file)) btn.classList.add('completed');
        btn.innerHTML = `<b>${i + 1}</b> ${s.title.replace(/^\d+\.\s*/, "")}`;
        btn.onclick = () => { 
            grid.classList.add('hidden'); playerZone.classList.remove('hidden'); 
            document.getElementById('now-playing-title').innerText = s.title; 
            audio.src = s.file; wordBucket = []; 
        };
        grid.appendChild(btn);
    });
}
renderGrid();

document.getElementById('btn-back').onclick = () => {
    audio.pause(); audio.currentTime = 0;
    playerZone.classList.add('hidden');
    transcript.classList.add('hidden');
    gameZone.classList.add('hidden');
    grid.classList.remove('hidden');
    currentQ = 0; attempts = 0;
};

document.getElementById('btn-start').onclick = () => { splash.classList.add('hidden'); instr.classList.remove('hidden'); };
document.getElementById('btn-enter').onclick = () => { instr.classList.add('hidden'); app.classList.remove('hidden'); };

document.getElementById('ctrl-play').onclick = () => audio.play();
document.getElementById('ctrl-pause').onclick = () => audio.pause();
document.getElementById('ctrl-stop').onclick = () => { audio.pause(); audio.currentTime = 0; };
document.getElementById('btn-blind').onclick = () => { transcript.classList.add('hidden'); gameZone.classList.add('hidden'); audio.play(); };

document.getElementById('btn-read').onclick = () => {
    if (typeof lessonData === 'undefined') { alert("🚨 Error: data.js failed!"); return; }
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    const data = lessonData[fn][0];
    transcript.classList.remove('hidden'); gameZone.classList.add('hidden'); transcript.innerHTML = "";
    data.text.split(" ").forEach(w => {
        const span = document.createElement('span'); 
        const clean = w.toLowerCase().replace(/[^a-z0-9ğüşöçı-]/gi, "");
        span.innerText = w + " "; span.className = "clickable-word";
        span.onclick = (e) => {
            const tr = data.dict[clean];
            if(tr) {
                if (!wordBucket.some(p => p.en === clean)) wordBucket.push({en: clean, tr: tr});
                popup.innerText = tr; popup.style.left = `${e.clientX}px`; popup.style.top = `${e.clientY - 50}px`;
                popup.classList.remove('hidden'); setTimeout(() => popup.classList.add('hidden'), 2000);
            }
        };
        transcript.appendChild(span);
    });
    audio.play();
};

document.getElementById('btn-game').onclick = () => {
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    const lesson = lessonData[fn][0];
    transcript.classList.add('hidden'); gameZone.classList.remove('hidden'); feedbackArea.innerHTML = "";
    gameBoard.innerHTML = ""; firstCard = null; gameBoard.style.display = "grid";
    let set = [...wordBucket];
    for (let k in lesson.dict) { if (set.length >= 8) break; if (!set.some(p => p.en === k)) set.push({en: k, tr: lesson.dict[k]}); }
    let deck = [];
    set.forEach(p => { deck.push({text: p.en, match: p.tr}); deck.push({text: p.tr, match: p.en}); });
    deck.sort(() => Math.random() - 0.5);
    deck.forEach(card => {
        const div = document.createElement('div'); div.className = 'game-card'; div.innerText = card.text;
        div.onclick = () => {
            if (div.classList.contains('correct') || div.classList.contains('selected')) return;
            if (firstCard) {
                if (firstCard.innerText === card.match) {
                    div.classList.add('correct'); firstCard.classList.add('correct'); firstCard = null;
                } else {
                    div.classList.add('wrong'); setTimeout(() => { div.classList.remove('wrong'); firstCard.classList.remove('selected'); firstCard = null; }, 500);
                }
            } else { firstCard = div; div.classList.add('selected'); }
        };
        gameBoard.appendChild(div);
    });
};

document.getElementById('btn-bowling').onclick = () => {
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    const lesson = lessonData[fn][0];
    transcript.classList.add('hidden'); gameZone.classList.remove('hidden'); gameBoard.style.display = "none";
    currentQ = 0; totalScore = 0; attempts = 0;
    runQuiz(lesson);
};

function runQuiz(lesson) {
    if (currentQ >= 7) { finishQuiz(); return; }
    const qData = lesson.questions[currentQ];
    const storyNum = parseInt(decodeURIComponent(audio.src.split('/').pop()).substring(0,2));
    feedbackArea.innerHTML = `
        <div id="quiz-container">
            <div class="score-badge">SCORE: ${totalScore} | Q: ${currentQ+1}/7</div>
            <button id="btn-hear-q" class="mode-btn neon-green">👂 LISTEN TO QUESTION</button>
            <div id="mic-box" class="hidden" style="margin-top:20px;">
                <button id="btn-speak" class="mic-btn">🎤</button>
                <p id="mic-status" style="color:#666; font-weight:bold;">Ready...</p>
            </div>
            <div id="res-area"></div>
        </div>`;
    document.getElementById('btn-hear-q').onclick = () => {
        const utter = new SpeechSynthesisUtterance(qData.q);
        utter.lang = 'en-US';
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            let v = voices.find(v => (v.name.includes(storyNum % 2 !== 0 ? "Female" : "Male")) && v.lang.startsWith('en'));
            utter.voice = v || voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
        utter.onend = () => { document.getElementById('mic-box').classList.remove('hidden'); };
        window.speechSynthesis.speak(utter);
    };
    document.getElementById('btn-speak').onclick = function() {
        const btn = this; const status = document.getElementById('mic-status');
        window.currentRec = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
        window.currentRec.lang = 'en-US';
        window.currentRec.onstart = () => { btn.classList.add('active'); status.innerText = "Listening..."; };
        window.currentRec.onresult = (e) => {
            document.getElementById('mic-box').classList.add('hidden'); 
            const res = e.results[0][0].transcript.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
            const ans = qData.a_en.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
            if (res === ans) {
                let pts = (attempts === 0) ? 20 : 15; totalScore += pts;
                showResult(true, pts === 20 ? "STRIKE! (+20)" : "SPARE! (+15)", qData, lesson);
            } else {
                attempts++;
                if (attempts === 1) showResult(false, "MISS! TRY AGAIN", qData, lesson, true);
                else showResult(false, "MISS! (0 pts)", qData, lesson, false);
            }
        };
        window.currentRec.start();
    };
}

function showResult(isCorrect, msg, qData, lesson, canRetry = false) {
    const area = document.getElementById('res-area');
    area.innerHTML = `<h1 style="color:${isCorrect?'#39ff14':'#f44'}; font-size: 50px;">${msg}</h1>`;
    if (isCorrect || !canRetry) {
        area.innerHTML += `<p class="quiz-q-text">Q: ${qData.q}</p><p class="quiz-a-text">EN: ${qData.a_en}</p><p style="color:#888; font-size:30px; font-weight: bold;">TR: ${qData.a_tr}</p><button id="btn-nxt" class="action-btn-large">NEXT QUESTION ⮕</button>`;
        document.getElementById('btn-nxt').onclick = () => { currentQ++; attempts = 0; runQuiz(lesson); };
    } else {
        area.innerHTML += `<button id="btn-retry" class="action-btn-large">RETRY FOR SPARE</button>`;
        document.getElementById('btn-retry').onclick = () => { area.innerHTML = ""; document.getElementById('mic-box').classList.remove('hidden'); document.getElementById('btn-speak').classList.remove('active'); };
    }
}

function finishQuiz() {
    lifetimeScore += totalScore; localStorage.setItem('traitorsScore', lifetimeScore);
    const fn = decodeURIComponent(audio.src.split('/').pop());
    if(!completedLessons.includes(fn)) { 
        completedLessons.push(fn); 
        localStorage.setItem('completedTraitorsLessons', JSON.stringify(completedLessons)); 
    }
    renderGrid(); 
    feedbackArea.innerHTML = `<h1 style="color:#ccff00; font-size: 60px;">FINISHED!</h1><h2 style="font-size: 40px;">QUIZ SCORE: ${totalScore}</h2><button id="btn-done" class="action-btn-large">SAVE & RETURN</button>`;
    document.getElementById('btn-done').onclick = () => {
        playerZone.classList.add('hidden');
        grid.classList.remove('hidden');
    };
}
