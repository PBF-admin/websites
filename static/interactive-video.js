async function initializeVideo(widget) {
  const status = widget.querySelector('.video-status');
  let data;
  try {
    const response = await fetch(widget.dataset.interactiveVideo);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } catch (error) {
    console.error('Interactive video content could not be loaded:', error);
    status.textContent = 'Pitanja nije moguće učitati. Osvježi stranicu i pokušaj ponovno.';
    return;
  }
  const questions = data.interactions.filter(item => item.action.library.startsWith('H5P.MultiChoice'));
  const overlay = widget.querySelector('.video-overlay');
  const iframe = widget.querySelector('iframe');
  const answered = new Set();
  const dismissed = new Set();
  let activeQuestion = -1;
  let textPaused = false;
  let player;
  let timer;
  let lastTime = 0;
  let lastText = '';

  function checkAnswer(exercise) {
    const index = Number(exercise.dataset.exercise);
    const answers = questions[index].action.params.answers;
    const selected = [...exercise.querySelectorAll('input:checked')].map(input => Number(input.value));
    const feedback = exercise.querySelector('.exercise-feedback');
    if (!selected.length) {
      feedback.textContent = 'Odaberi odgovor prije provjere.';
      feedback.className = 'exercise-feedback incorrect';
      return;
    }
    const correct = answers.every((answer, answerIndex) => Boolean(answer.correct) === selected.includes(answerIndex));
    feedback.textContent = correct ? 'Točno!' : 'Netočno. Pokušaj ponovno.';
    feedback.className = `exercise-feedback ${correct ? 'correct' : 'incorrect'}`;
    if (correct) {
      answered.add(index);
      if (exercise.closest('.video-overlay') && !exercise.querySelector('.continue-video')) {
        const resume = document.createElement('button');
        resume.type = 'button';
        resume.className = 'button continue-video';
        resume.textContent = 'Nastavi video';
        resume.addEventListener('click', () => {
          dismissed.add(questions[index]);
          activeQuestion = -1;
          overlay.hidden = true;
          player?.playVideo();
          iframe.focus();
        });
        exercise.append(resume);
        resume.focus();
      }
    }
  }
  widget.addEventListener('click', event => {
    const check = event.target.closest('.check-answer');
    if (check) checkAnswer(check.closest('.exercise'));
    const summaryButton = event.target.closest('.check-summary');
    if (summaryButton) {
      const fieldset = summaryButton.closest('fieldset');
      const selected = fieldset.querySelector('input:checked');
      fieldset.querySelector('[role="status"]').textContent = !selected
        ? 'Odaberi odgovor prije provjere.'
        : selected.value === '0' ? 'Točno!' : 'Netočno. Pokušaj ponovno.';
    }
  });

  function showQuestion(index) {
    activeQuestion = index;
    const exercise = widget.querySelector(`.exercise-list [data-exercise="${index}"]`).cloneNode(true);
    exercise.querySelectorAll('input').forEach(input => { input.name += '-overlay'; });
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'button';
    skip.textContent = 'Preskoči pitanje';
    skip.addEventListener('click', () => {
      dismissed.add(questions[index]);
      activeQuestion = -1;
      overlay.hidden = true;
      player.playVideo();
      iframe.focus();
    });
    overlay.replaceChildren(exercise, skip);
    overlay.classList.remove('is-text');
    overlay.hidden = false;
    exercise.querySelector('input')?.focus();
    player.pauseVideo();
  }

  function updateTimeline() {
    if (!player?.getCurrentTime || activeQuestion >= 0 || textPaused) return;
    const now = player.getCurrentTime();
    if (now < lastTime - 2) {
      for (const item of dismissed) {
        if (item.duration.from > now) dismissed.delete(item);
      }
    }
    for (let index = 0; index < questions.length; index++) {
      const item = questions[index];
      if (!answered.has(index) && !dismissed.has(item) && lastTime <= item.duration.from && now >= item.duration.from && now - item.duration.from < 2) {
        lastTime = now;
        showQuestion(index);
        return;
      }
    }
    const pausedText = data.interactions.find(item => item.action.library.startsWith('H5P.Text') && item.pause &&
      !dismissed.has(item) && lastTime <= item.duration.from && now >= item.duration.from && now - item.duration.from < 2);
    if (pausedText) {
      dismissed.add(pausedText);
      textPaused = true;
      overlay.innerHTML = pausedText.action.params.text;
      overlay.classList.add('is-text');
      overlay.hidden = false;
      const resume = document.createElement('button');
      resume.type = 'button';
      resume.className = 'button';
      resume.textContent = 'Nastavi video';
      resume.addEventListener('click', () => {
        textPaused = false;
        lastTime = player.getCurrentTime();
        overlay.hidden = true;
        lastText = '';
        player.playVideo();
        iframe.focus();
      });
      overlay.append(resume);
      resume.focus();
      player.pauseVideo();
      lastTime = now;
      return;
    }
    const text = data.interactions.filter(item => item.action.library.startsWith('H5P.Text') &&
      now >= item.duration.from && now <= Math.max(item.duration.to, item.duration.from + 4))
      .map(item => item.action.params.text).join('');
    if (text !== lastText) {
      lastText = text;
      overlay.innerHTML = text;
      overlay.classList.add('is-text');
      overlay.hidden = !text;
    }
    lastTime = now;
  }

  const timeout = setTimeout(() => {
    status.textContent = 'Ako YouTube nije dostupan, otvori pitanja ispod videa. Automatsko zaustavljanje trenutačno nije dostupno.';
  }, 15000);
  try {
    await loadYouTubeAPI();
    player = new YT.Player(iframe, {
      events: {
        onReady: () => {
          clearTimeout(timeout);
          status.textContent = 'Video se automatski zaustavlja na pitanjima. Pitanja možeš otvoriti i ispod videa.';
          timer = setInterval(updateTimeline, 250);
        },
        onError: event => {
          clearTimeout(timeout);
          clearInterval(timer);
          console.error('YouTube playback error:', event.data);
          status.textContent = 'YouTube video nije dostupan. Pitanja možeš riješiti u nastavku.';
        },
        onStateChange: event => {
          if (event.data === 0) {
            const summary = widget.querySelector('.video-summary');
            if (summary) {
              summary.open = true;
              summary.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
          }
        }
      }
    });
  } catch (error) {
    clearTimeout(timeout);
    console.error('YouTube API could not be loaded:', error);
    status.textContent = 'YouTube nije dostupan. Pitanja možeš riješiti u nastavku.';
  }
  addEventListener('pagehide', () => { clearInterval(timer); clearTimeout(timeout); }, { once: true });
}

let youtubePromise;
function loadYouTubeAPI() {
  if (globalThis.YT?.Player) return Promise.resolve();
  youtubePromise ||= new Promise((resolve, reject) => {
    globalThis.onYouTubeIframeAPIReady = resolve;
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.addEventListener('error', () => reject(new Error('YouTube API network error')), { once: true });
    document.head.append(script);
  });
  return youtubePromise;
}

document.querySelectorAll('[data-interactive-video]').forEach(widget => {
  initializeVideo(widget).catch(error => {
    console.error('Interactive video initialization failed:', error);
    widget.querySelector('.video-status').textContent = 'Interaktivni video nije moguće pokrenuti. Osvježi stranicu i pokušaj ponovno.';
  });
});
