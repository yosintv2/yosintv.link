    document.addEventListener('DOMContentLoaded', async () => {
      const normalize = (s='') => s.toString()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g,'')
        .replace(/&/g,'and')
        .replace(/[^a-z0-9]/g,'');
      const splitTeams = (name='') => name.split(/\s+(?:vs?|—|-)\s+/i).map(t => t.trim());
      const extractTeamFromLink = (link='') => {
        const match = link.match(/yosintv=([^&]+)/i);
        return match ? normalize(match[1]) : '';
      };
      const optionsTime = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString(undefined, optionsTime);
      };
      const formatProgressTime = (diff, total, duration) => {
        const elapsedHours = Math.floor(diff / 3600000);
        const elapsedMinutes = Math.floor((diff % 3600000) / 60000);
        const elapsedSeconds = Math.floor((diff % 60000) / 1000);
        const totalHours = Math.floor(duration);
        const totalMinutes = Math.round((duration % 1) * 60);
        const totalSeconds = 0;
        return `Match Playing Time: ${elapsedHours}:${elapsedMinutes.toString().padStart(2, '0')}:${elapsedSeconds.toString().padStart(2, '0')} / ${totalHours}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
      };
      const formatCountdown = (diff, duration, start) => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(startTime.getTime() + duration * 3600000);
        if (now.getTime() > endTime.getTime()) return '<span class="text-gray-600 font-bold">Match Ended</span>';
        if (diff < 0) return '<span class="text-red-600 font-bold">Watch Now</span>';
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      };
      const updateProgressBar = (start, duration, container, bar, text) => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(startTime.getTime() + duration * 3600000);
        const diff = now.getTime() - startTime.getTime();
        const total = endTime.getTime() - startTime.getTime();
        if (diff < 0) {
          bar.style.width = '0%';
          bar.classList.remove('bg-red-600');
          const minutesLeft = Math.abs(Math.floor(diff / 60000));
          text.textContent = `Starts in: ${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m`;
          return;
        }
        if (diff > total) {
          bar.style.width = '100%';
          text.textContent = 'Match Ended';
          return;
        }
        bar.classList.add('bg-red-600');
        text.textContent = formatProgressTime(diff, total, duration);
        bar.style.width = `${(diff / total) * 100}%`;
      };
      const jsonFiles = [
        { id: 'yosintv-fight', file: 'https://yosintv11.pages.dev/fight.json', title: 'UFC/MMA/Boxing' },
        { id: 'yosintv-cricket', file: 'https://yosintv11.pages.dev/cricket.json', title: 'Top Cricket' },
        { id: 'yosintv-cleague', file: 'https://yosintv11.pages.dev/cleague.json', title: 'Cricket League' },
        { id: 'yosintv-nepal', file: 'https://yosintv11.pages.dev/nepal.json', title: '4-Nations Women' },
        { id: 'yosintv-npl', file: 'https://yosintv11.pages.dev/npl.json', title: 'NPL T20' },
        { id: 'yosintv-ucl', file: 'https://yosintv11.pages.dev/ucl.json', title: 'Champions League' },
        { id: 'yosintv-football', file: 'https://yosintv11.pages.dev/football.json', title: 'Top Football' },
        { id: 'yosintv-laliga', file: 'https://yosintv11.pages.dev/more.json', title: 'More Football' },
        { id: 'yosintv-epl', file: 'https://yosintv11.pages.dev/epl.json', title: 'EPL' },
        { id: 'yosintv-seriea', file: 'https://yosintv11.pages.dev/seriea.json', title: 'Serie A' },
        { id: 'yosintv-ligue1', file: 'https://yosintv11.pages.dev/ligue1.json', title: 'Ligue 1' },
        { id: 'yosintv-bundesliga', file: 'https://yosintv11.pages.dev/bundesliga.json', title: 'Bundesliga' }
      ];
      const matchInfoContainer = document.getElementById('match-info');
      const matchNameElement = document.getElementById('match-name');
      const moreMatchesContainer = document.getElementById('more-matches');
      const noMatchesMessage = document.getElementById('no-matches');
      const renderMatchCard = (matchData, leagueTitle, isMainMatch = true) => {
        const { name, start, duration, link } = matchData;
        if (!name || !start || !duration || !link) {
          if (isMainMatch) {
            matchInfoContainer.innerHTML = '<p class="text-red-500">Invalid match data. Please try another match.</p>';
            matchNameElement.textContent = 'Invalid Match Data';
          }
          return;
        }
        const [team1='', team2=''] = splitTeams(name);
        const startTime = formatTime(start);
        if (isMainMatch) {
          console.log('Rendering main match:', name);
          document.title = `YoSinTV - ${name} Live Stream`;
          document.getElementById('meta-description').content = `Watch ${team1} vs ${team2} live stream on YoSinTV, your source for sports matches.`;
          document.getElementById('meta-keywords').content = `${team1} vs ${team2} live stream, sports live, ${team1} highlights, ${team2} highlights, YoSinTV`;
          document.getElementById('og-title').content = `YoSinTV - ${team1} vs ${team2} Live Stream`;
          document.getElementById('og-description').content = `Watch ${team1} vs ${team2} live stream on YoSinTV, your source for sports matches.`;
          document.getElementById('og-url').content = window.location.href;
          document.getElementById('twitter-title').content = `YoSinTV - ${team1} vs ${team2} Live Stream`;
          document.getElementById('twitter-description').content = `Watch ${team1} vs ${team2} live stream on YoSinTV, your source for sports matches.`;
          document.getElementById('canonical-url').href = window.location.href;
          matchNameElement.textContent = `${name} Live Details`;
          const progressContainer = document.createElement('div');
          progressContainer.className = 'w-full bg-gray-200 rounded-full h-6 mb-4';
          const progressBar = document.createElement('div');
          progressBar.className = 'h-6 rounded-full';
          const progressText = document.createElement('div');
          progressText.className = 'text-sm text-gray-600 mb-2 font-bold';
          progressContainer.appendChild(progressBar);
          const content = document.createElement('div');
          content.className = 'space-y-4 text-left overflow-auto';
          const title = document.createElement('h3');
          title.className = 'text-xl sm:text-2xl md:text-3xl font-bold text-gray-900';
          title.textContent = `${name} - Match Details`;
          const startPara = document.createElement('p');
          startPara.className = 'text-sm text-gray-600';
          startPara.textContent = `Start: ${startTime}`;
          const faqTitle = document.createElement('h3');
          faqTitle.className = 'text-2xl font-bold border-b-2 border-gray-200 pb-2 text-gray-900';
          faqTitle.textContent = 'Frequently Asked Questions';
          const faqContainer = document.createElement('div');
          faqContainer.className = 'space-y-4';
          const faqs = [
            {
              question: `Which teams will face against ${team2} in this match?`,
              answer: `${team1} will face off against ${team2} in this exciting match.`
            },
            {
              question: `When is the ${name} match happening?`,
              answer: `The match starts at ${startTime}. Check official sources for venue details.`
            },
            {
              question: `How long will the ${name} match last?`,
              answer: `The match is expected to last about ${duration} hours, including stoppage time.`
            },
            {
              question: `Where can I watch the ${name} match live online?`,
              answer: `Stream the match live via the <a href="${link}" target="_blank" class="text-blue-600 hover:underline">official live stream</a>.`
            },
            {
              question: `Who are the key players to watch in the ${name} match?`,
              answer: `Look out for star players from ${team1} and ${team2}. Check official sources for confirmed lineups.`
            },
            {
              question: `What is the recent performance of ${team1} and ${team2}?`,
              answer: `Check the latest form guides and stats for ${team1} and ${team2} on official sports websites.`
            }
          ];
          faqs.forEach(faq => {
            const faqDiv = document.createElement('div');
            faqDiv.className = 'bg-gray-50 p-4 rounded-lg';
            const faqQuestion = document.createElement('h4');
            faqQuestion.className = 'text-lg font-semibold text-gray-900';
            faqQuestion.textContent = faq.question;
            const faqAnswer = document.createElement('p');
            faqAnswer.className = 'text-gray-600';
            faqAnswer.innerHTML = faq.answer;
            faqDiv.appendChild(faqQuestion);
            faqDiv.appendChild(faqAnswer);
            faqContainer.appendChild(faqDiv);
          });
          content.appendChild(title);
          content.appendChild(startPara);
          content.appendChild(document.createElement('div')).className = 'flex justify-center my-4';
          content.appendChild(faqTitle);
          content.appendChild(faqContainer);
          content.prepend(progressText);
          content.prepend(progressContainer);
          matchInfoContainer.innerHTML = '';
          matchInfoContainer.appendChild(content);
          setInterval(() => updateProgressBar(start, duration, progressContainer, progressBar, progressText), 1000);
        } else {
          const now = new Date();
          const startTime = new Date(start);
          const diff = startTime.getTime() - now.getTime();
          const matchCard = document.createElement('a');
          matchCard.href = link;
          matchCard.target = '_blank';
          matchCard.className = 'bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center block hover:bg-gray-100';
          matchCard.innerHTML = `
            <h4 class="text-base font-semibold text-gray-900 text-left">${name}</h4>
            <p class="text-xs text-gray-600 text-right">${formatCountdown(diff, duration, start)}</p>
          `;
          moreMatchesContainer.appendChild(matchCard);
          setInterval(() => {
            const updatedDiff = new Date(start).getTime() - new Date().getTime();
            matchCard.querySelector('p').innerHTML = formatCountdown(updatedDiff, duration, start);
          }, 1000);
        }
      };
      const urlParams = new URLSearchParams(window.location.search);
      const teamParamRaw = urlParams.get('yosintv');
      if (teamParamRaw) {
        matchInfoContainer.innerHTML = '<p class="text-gray-500 text-xl font-medium animate-pulse">Searching for match data...</p>';
        const qNorm = normalize(teamParamRaw);
        const found = [];
        const seen = new Set();
        let mainMatchJsonFile = null;
        console.log('Fetching JSON files for main match...');
        const results = await Promise.allSettled(
          jsonFiles.map(l => fetch(l.file).then(r => {
            if (!r.ok) throw new Error(`${r.status}`);
            return r.json().then(data => ({ league: l.title, file: l.file, data }));
          }))
        );
        for (const r of results) {
          if (r.status !== 'fulfilled') {
            console.log(`Failed to fetch: ${r.reason}`);
            continue;
          }
          const { league, file, data } = r.value;
          const list = Array.isArray(data) ? data : Array.isArray(data.matches) ? data.matches : Array.isArray(data.events) ? data.events : Array.isArray(data.data) ? data.data : [];
          for (const m of list) {
            if (!m?.name || !m?.link || !m?.start || !m?.duration) continue;
            const linkTeam = extractTeamFromLink(m.link);
            if (linkTeam === qNorm) {
              const key = m.id ? `id:${m.id}` : `ns:${normalize(m.name)}|${m.start}|${league}`;
              if (seen.has(key) || found.length >= 1) continue;
              seen.add(key);
              found.push({ match: m, league, file });
              mainMatchJsonFile = file;
            }
          }
        }
        if (found.length) {
          console.log('Main match found:', found[0].match.name);
          matchInfoContainer.innerHTML = '';
          found.sort((a, b) => new Date(a.match.start || 0) - new Date(b.match.start || 0));
          found.forEach(item => renderMatchCard(item.match, item.league));
          if (mainMatchJsonFile) {
            try {
              console.log(`Fetching more matches from: ${mainMatchJsonFile}`);
              const response = await fetch(mainMatchJsonFile);
              if (response.ok) {
                const data = await response.json();
                const list = Array.isArray(data) ? data : Array.isArray(data.matches) ? data.matches : Array.isArray(data.events) ? data.events : Array.isArray(data.data) ? data.data : [];
                const otherMatches = list.filter(m => {
                  if (!m?.name || !m?.link || !m?.start || !m?.duration) return false;
                  const linkTeam = extractTeamFromLink(m.link);
                  const key = m.id ? `id:${m.id}` : `ns:${normalize(m.name)}|${m.start}|${found[0].league}`;
                  return linkTeam !== qNorm && !seen.has(key);
                });
                moreMatchesContainer.innerHTML = '';
                const shuffled = otherMatches.sort(() => 0.5 - Math.random());
                const randomMatches = shuffled.slice(0, 3);
                if (randomMatches.length > 0) {
                  console.log(`Rendering ${randomMatches.length} more matches`);
                  noMatchesMessage.classList.add('hidden');
                  randomMatches.forEach(match => {
                    seen.add(match.id ? `id:${match.id}` : `ns:${normalize(match.name)}|${match.start}|${found[0].league}`);
                    renderMatchCard(match, found[0].league, false);
                  });
                } else {
                  console.log('No additional matches found');
                  noMatchesMessage.classList.remove('hidden');
                }
              } else {
                console.log(`Failed to fetch more matches: ${response.status}`);
                noMatchesMessage.classList.remove('hidden');
              }
            } catch (error) {
              console.log(`Error fetching more matches: ${error}`);
              noMatchesMessage.classList.remove('hidden');
              matchInfoContainer.innerHTML = '<p class="text-red-500">Error loading match data. Please try again later.</p>';
            }
          } else {
            console.log('No main match JSON file found');
            noMatchesMessage.classList.remove('hidden');
          }
        } else {
          console.log('No main match found for yosintv:', qNorm);
          matchInfoContainer.innerHTML = '<p class="text-red-500">This Match is Not Live Right Now</p>';
          matchNameElement.textContent = 'No Match Available';
          noMatchesMessage.classList.remove('hidden');
        }
      } else {
        console.log('No yosintv parameter provided');
        matchInfoContainer.innerHTML = '<p class="text-gray-500">Please select a match to view details.</p>';
        matchNameElement.textContent = 'No Match Selected';
        noMatchesMessage.classList.remove('hidden');
      }
    });
