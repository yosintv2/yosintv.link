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
        return `Time: ${elapsedHours}:${elapsedMinutes.toString().padStart(2, '0')}:${elapsedSeconds.toString().padStart(2, '0')} / ${totalHours}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
      };
      const formatCountdown = (diff, duration) => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(startTime.getTime() + duration * 3600000);
        const total = endTime.getTime() - startTime.getTime();
        if (diff < 0 && now.getTime() > endTime.getTime()) return '<span class="text-gray-600 font-bold">Match Ended</span>';
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
          const minutesLeft = Math.abs(Math.floor(diff / 60000));
          text.textContent = `Starts in: ${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m`;
          return;
        }
        if (diff > total) {
          text.textContent = 'Match Ended';
          return;
        }
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
      const renderMatchCard = (matchData, leagueTitle, isMainMatch = true) => {
        const { name, start, duration, link } = matchData;
        const [team1='', team2=''] = splitTeams(name);
        const startTime = formatTime(start);
        if (isMainMatch) {
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
          progressBar.className = 'bg-red-600 h-6 rounded-full';
          const progressText = document.createElement('div');
          progressText.className = 'text-sm text-gray-600 mb-2 font-bold';
          progressContainer.appendChild(progressBar);
          const content = document.createElement('div');
          content.className = 'space-y-4 text-left';
          content.innerHTML = `
            <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">${name} - Match Details</h3>
            <p class="text-sm text-gray-600">Start: ${startTime}</p>
            <div class="flex justify-center my-4"></div>
            <h3 class="text-2xl font-bold border-b-2 border-gray-200 pb-2 text-gray-900">Frequently Asked Questions</h3>
            <div class="space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-gray-900">Which teams are playing in the ${name} match?</h4>
                <p class="text-gray-600">${team1} will face off against ${team2} in this exciting match.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-gray-900">When and where is the ${name} match happening?</h4>
                <p class="text-gray-600">The match starts at ${startTime}. Check official sources for venue details.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-gray-900">How long will the ${name} match last?</h4>
                <p class="text-gray-600">The match is expected to last about ${duration} hours, including stoppage time.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-gray-900">Where can I watch the ${name} match live online?</h4>
                <p class="text-gray-600">Stream the match live via the <a href="${link}" target="_blank" class="text-blue-600 hover:underline">official live stream</a>.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-gray-900">Who are the key players to watch in the ${name} match?</h4>
                <p class="text-gray-600">Look out for star players from ${team1} and ${team2}. Check official sources for confirmed lineups.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-gray-900">What is the recent performance of ${team1} and ${team2}?</h4>
                <p class="text-gray-600">Check the latest form guides and stats for ${team1} and ${team2} on official sports websites.</p>
              </div>
            </div>
          `;
          content.prepend(progressText);
          content.prepend(progressContainer);
          matchInfoContainer.appendChild(content);
          setInterval(() => updateProgressBar(start, duration, progressContainer, progressBar, progressText), 1000);
        } else {
          const now = new Date();
          const startTime = new Date(start);
          const diff = startTime.getTime() - now.getTime();
          const matchCard = document.createElement('a');
          matchCard.href = link;
          matchCard.target = '_blank';
          matchCard.className = 'bg-gray-50 p-4 rounded-lg flex justify-between items-center block hover:bg-gray-100';
          matchCard.innerHTML = `
            <h4 class="text-lg font-semibold text-gray-900 pr-4">${name}</h4>
            <p class="text-sm text-gray-600 pl-4">${formatCountdown(diff, duration)}</p>
          `;
          moreMatchesContainer.appendChild(matchCard);
          setInterval(() => {
            const updatedDiff = new Date(start).getTime() - new Date().getTime();
            matchCard.querySelector('p').innerHTML = formatCountdown(updatedDiff, duration);
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
        const results = await Promise.allSettled(
          jsonFiles.map(l => fetch(l.file).then(r => {
            if (!r.ok) throw new Error(`${r.status}`);
            return r.json().then(data => ({ league: l.title, file: l.file, data }));
          }))
        );
        for (const r of results) {
          if (r.status !== 'fulfilled') continue;
          const { league, file, data } = r.value;
          const list = Array.isArray(data) ? data : Array.isArray(data.matches) ? data.matches : Array.isArray(data.events) ? data.events : Array.isArray(data.data) ? data.data : [];
          for (const m of list) {
            if (!m?.name || !m?.link) continue;
            const linkTeam = extractTeamFromLink(m.link);
            if (linkTeam === qNorm) {
              const key = m.id ? `id:${m.id}` : `ns:${normalize(m.name)}|${m.start||''}|${league}`;
              if (seen.has(key) || found.length >= 1) continue;
              seen.add(key);
              found.push({ match: m, league });
              mainMatchJsonFile = file;
            }
          }
        }
        if (found.length) {
          matchInfoContainer.innerHTML = '';
          found.sort((a, b) => new Date(a.match.start || 0) - new Date(b.match.start || 0));
          found.forEach(item => renderMatchCard(item.match, item.league));
          if (mainMatchJsonFile) {
            const response = await fetch(mainMatchJsonFile);
            if (response.ok) {
              const data = await response.json();
              const list = Array.isArray(data) ? data : Array.isArray(data.matches) ? data.matches : Array.isArray(data.events) ? data.events : Array.isArray(data.data) ? data.data : [];
              const otherMatches = list.filter(m => {
                const linkTeam = extractTeamFromLink(m.link);
                return linkTeam !== qNorm && m.name && m.link && m.start;
              });
              const shuffled = otherMatches.sort(() => 0.5 - Math.random());
              const randomMatches = shuffled.slice(0, 3);
              randomMatches.forEach(match => renderMatchCard(match, found[0].league, false));
            }
          }
        } else {
          matchInfoContainer.innerHTML = '<p class="text-red-500">This Match is Not Live Right Now</p>';
          matchNameElement.textContent = 'No Match Available';
        }
      } else {
        matchNameElement.textContent = 'No Match Selected';
      }
    });
