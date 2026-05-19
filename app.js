const STORAGE_KEY = 'sweatsyncProfile';

const defaultProfile = {
    alias: 'Guest Lifter',
    level: 'dedicated',
    focus: ['Strength', 'Cardio'],
    bio: 'Fitness fan looking for good conversation, shared goals, and steady chemistry.',
    privacy: 'public',
    verified: true,
    distance: 25
};

const levelLabels = {
    casual: 'Casual spark',
    regular: 'Regular chemistry',
    dedicated: 'Dedicated duo',
    obsessed: 'Gym soulmate'
};

const matches = [
    {
        name: 'Alex',
        level: 'Strength regular',
        compatibility: 98,
        focus: ['Strength', 'Nutrition'],
        photo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=80',
        bio: 'Bench press regular who likes early sessions, easy conversation, and post-workout smoothies.',
        prompt: 'Favorite low-pressure date: a quiet lift followed by breakfast.',
        signal: 'Morning strength sessions',
        date: 'Lift and smoothie bar'
    },
    {
        name: 'Jordan',
        level: 'Powerlifting planner',
        compatibility: 95,
        focus: ['Strength', 'CrossFit'],
        photo: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1000&q=80',
        bio: 'Competition-minded, kind-hearted, and happiest when goals are shared instead of performed.',
        prompt: 'Current goal: adding consistency without turning life into a spreadsheet.',
        signal: 'Goal-focused and steady',
        date: 'Weekend PR session'
    },
    {
        name: 'Taylor',
        level: 'Cardio route finder',
        compatibility: 92,
        focus: ['Cardio', 'Nutrition'],
        photo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
        bio: 'Runs for charity, plans excellent recovery meals, and keeps first dates refreshingly simple.',
        prompt: 'Best opener: asking about a favorite route or playlist.',
        signal: 'Recovery brunch expert',
        date: 'Sunrise route and coffee'
    },
    {
        name: 'Riley',
        level: 'CrossFit regular',
        compatibility: 89,
        focus: ['CrossFit', 'Strength'],
        photo: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1000&q=80',
        bio: 'Functional fitness fan who likes partner workouts, weekend challenges, and direct communication.',
        prompt: 'Green flag: someone who warms up properly.',
        signal: 'Partner workout energy',
        date: 'Team WOD and tacos'
    },
    {
        name: 'Morgan',
        level: 'Mobility guide',
        compatibility: 87,
        focus: ['Yoga', 'Nutrition'],
        photo: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80',
        bio: 'Balance-first mover with a soft spot for recovery days, tea, and slow conversation.',
        prompt: 'Favorite match idea: mobility class and a walk.',
        signal: 'Soft reset Sundays',
        date: 'Mobility class and tea'
    }
];

const messageSeeds = [
    ['Alex', 'Your saved profile says strength training. Want to compare favorite warmups?'],
    ['Jordan', 'Saturday lift session, zero pressure, excellent playlist.'],
    ['Taylor', 'I have a recovery brunch idea that fits your vibe perfectly.']
];

function getProfile() {
    try {
        return { ...defaultProfile, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
    } catch {
        return { ...defaultProfile };
    }
}

function saveProfile(profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getProfile(), ...profile }));
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function initials(name) {
    return (name || 'G').trim().charAt(0).toUpperCase();
}

function sharedFocusCount(profile, match) {
    return match.focus.filter((focus) => profile.focus.includes(focus)).length;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
        toast.hidden = true;
    }, 2200);
}

function initOnboarding() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const result = document.getElementById('result');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const alias = String(formData.get('persona') || '').trim() || defaultProfile.alias;
        const level = formData.get('gymInterest');
        const focus = formData.getAll('focus');

        saveProfile({
            alias,
            level,
            focus: focus.length ? focus : defaultProfile.focus,
            bio: `${alias} is exploring fitness-first connections with shared goals and good chemistry.`
        });

        if (level === 'dedicated' || level === 'obsessed') {
            window.location.href = 'premium-matches.html';
            return;
        }

        result.hidden = false;
        result.innerHTML = `
            <h2>Your match room is ready, ${escapeHtml(alias)}</h2>
            <p>Your match room is ready. Step inside whenever you want to browse profiles and conversations.</p>
            <button type="button" class="primary-action compact-action" id="openMatchRoom">Open match room</button>
        `;

        document.getElementById('openMatchRoom').addEventListener('click', () => {
            window.location.href = 'premium-matches.html';
        });
    });
}

function setSection(sectionName) {
    document.querySelectorAll('.content-section').forEach((section) => {
        section.classList.toggle('active', section.id === `${sectionName}-section`);
    });
    document.querySelectorAll('.nav-btn').forEach((button) => {
        button.classList.toggle('active', button.dataset.section === sectionName);
    });
}

function renderSummary(filteredMatches) {
    const profile = getProfile();
    const matchCount = document.getElementById('matchCount');
    const shared = document.getElementById('sharedFocusCount');
    const distance = document.getElementById('distanceSummary');

    if (matchCount) matchCount.textContent = filteredMatches.length;
    if (shared) {
        shared.textContent = matches.filter((match) => sharedFocusCount(profile, match) > 0).length;
    }
    if (distance) distance.textContent = profile.distance;
}

function renderMatches() {
    const grid = document.getElementById('matchesGrid');
    const filter = document.getElementById('focusFilter');
    if (!grid || !filter) return;

    const profile = getProfile();
    const selected = filter.value;
    const filtered = matches.filter((match) => selected === 'All' || match.focus.includes(selected));

    grid.innerHTML = filtered.map((match) => {
        const focusTags = match.focus.map((focus) => `<span class="interest">${escapeHtml(focus)}</span>`).join('');
        const shared = sharedFocusCount(profile, match);
        const boost = shared > 0 ? `${shared} shared focus${shared > 1 ? 'es' : ''}` : 'New lane';
        return `
            <article class="match-card">
                <div class="match-media">
                    <img class="match-photo" src="${escapeHtml(match.photo)}" alt="">
                    <span class="compatibility">${match.compatibility}%</span>
                    <span class="match-signal">${escapeHtml(match.signal)}</span>
                </div>
                <div class="match-body">
                    <div class="match-topline">
                        <div>
                            <h3>${escapeHtml(match.name)}</h3>
                            <p>${escapeHtml(match.level)}</p>
                        </div>
                    </div>
                    <p class="match-bio">${escapeHtml(match.bio)}</p>
                    <div class="interest-row">${focusTags}</div>
                    <div class="match-note">
                        <span>${escapeHtml(boost)} for ${escapeHtml(profile.alias)}</span>
                        <span>${escapeHtml(match.date)}</span>
                    </div>
                    <div class="action-row">
                        <button type="button" class="secondary-action" data-action="view" data-name="${escapeHtml(match.name)}">View</button>
                        <button type="button" class="secondary-action" data-action="like" data-name="${escapeHtml(match.name)}">Super like</button>
                        <button type="button" class="primary-action compact-action" data-action="message" data-name="${escapeHtml(match.name)}">Message</button>
                    </div>
                </div>
            </article>
        `;
    }).join('') || '<p class="empty-state">No matches found for that filter.</p>';

    renderSummary(filtered);
}

function renderMessages() {
    const list = document.getElementById('messageThreads');
    if (!list) return;

    list.innerHTML = messageSeeds.map(([sender, messageText], index) => `
        <article class="message-thread">
            <div class="avatar">${escapeHtml(initials(sender))}</div>
            <div>
                <div class="message-meta">
                    <strong>${escapeHtml(sender)}</strong>
                    <span>${index === 0 ? 'Just now' : `${index + 1}h ago`}</span>
                </div>
                <p>${escapeHtml(messageText)}</p>
            </div>
            <button type="button" class="secondary-action compact-action" data-action="message" data-name="${escapeHtml(sender)}">Reply</button>
        </article>
    `).join('');
}

function renderProfile() {
    const profile = getProfile();
    const aliasInput = document.getElementById('profileAlias');
    const bioInput = document.getElementById('profileBio');
    const initial = document.getElementById('profileInitial');
    const focusList = document.getElementById('profileFocusList');
    const memberAlias = document.getElementById('memberAlias');
    const memberLevel = document.getElementById('memberLevel');

    if (memberAlias) memberAlias.textContent = profile.alias;
    if (memberLevel) memberLevel.textContent = levelLabels[profile.level] || 'Dedicated duo';
    if (aliasInput) aliasInput.value = profile.alias;
    if (bioInput) bioInput.value = profile.bio;
    if (initial) initial.textContent = initials(profile.alias);
    if (focusList) {
        focusList.innerHTML = profile.focus.map((focus) => `<span class="interest">${escapeHtml(focus)}</span>`).join('');
    }
}

function renderSettings() {
    const profile = getProfile();
    const privacy = document.getElementById('privacy');
    const verified = document.getElementById('verifiedToggle');
    const distance = document.getElementById('distance');
    const distanceValue = document.getElementById('distanceValue');

    if (privacy) privacy.value = profile.privacy;
    if (verified) verified.checked = Boolean(profile.verified);
    if (distance) distance.value = profile.distance;
    if (distanceValue) distanceValue.textContent = `${profile.distance} miles`;
}

function openModal(title, bodyHtml) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    if (!modal || !content) return;

    content.innerHTML = `<h2 id="modalTitle">${escapeHtml(title)}</h2>${bodyHtml}`;
    modal.hidden = false;
    modal.querySelector('.modal-close').focus();
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.hidden = true;
}

function handleProfileAction(action, name) {
    const match = matches.find((item) => item.name === name) || matches[0];

    if (action === 'view') {
        openModal(`${match.name}'s profile`, `
            <img class="modal-photo" src="${escapeHtml(match.photo)}" alt="">
            <p>${escapeHtml(match.bio)}</p>
            <p class="match-note">${escapeHtml(match.prompt)}</p>
            <p class="match-note">${escapeHtml(match.date)}</p>
            <div class="interest-row">${match.focus.map((focus) => `<span class="interest">${escapeHtml(focus)}</span>`).join('')}</div>
        `);
        return;
    }

    if (action === 'like') {
        showToast(`Super like sent to ${name}.`);
        return;
    }

    if (action === 'message') {
        openModal(`Message ${name}`, `
            <label for="matchMessage">Message</label>
            <textarea id="matchMessage" rows="4">Hey ${escapeHtml(name)}, want to plan a low-pressure workout date?</textarea>
            <button type="button" class="primary-action compact-action" id="sendMatchMessage">Send message</button>
        `);
        document.getElementById('sendMatchMessage').addEventListener('click', () => {
            closeModal();
            showToast(`Message sent to ${name}.`);
        });
    }
}

function initDashboard() {
    if (!document.querySelector('.dashboard-frame')) return;

    renderProfile();
    renderSettings();
    renderMatches();
    renderMessages();

    document.querySelectorAll('.nav-btn').forEach((button) => {
        button.addEventListener('click', () => setSection(button.dataset.section));
    });

    document.getElementById('focusFilter')?.addEventListener('change', renderMatches);

    document.body.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-action]');
        if (actionButton) {
            handleProfileAction(actionButton.dataset.action, actionButton.dataset.name);
        }
    });

    document.getElementById('profileForm')?.addEventListener('submit', (event) => {
        event.preventDefault();
        saveProfile({
            alias: document.getElementById('profileAlias').value.trim() || defaultProfile.alias,
            bio: document.getElementById('profileBio').value.trim() || defaultProfile.bio
        });
        renderProfile();
        renderMatches();
        showToast('Profile saved locally.');
    });

    document.getElementById('privacy')?.addEventListener('change', (event) => {
        saveProfile({ privacy: event.target.value });
        showToast('Privacy setting saved.');
    });

    document.getElementById('verifiedToggle')?.addEventListener('change', (event) => {
        saveProfile({ verified: event.target.checked });
        showToast(event.target.checked ? 'Verification badge enabled.' : 'Verification badge disabled.');
    });

    document.getElementById('distance')?.addEventListener('input', (event) => {
        const distance = Number(event.target.value);
        saveProfile({ distance });
        document.getElementById('distanceValue').textContent = `${distance} miles`;
        renderSummary(matches);
    });

    document.getElementById('resetProfileData')?.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        renderProfile();
        renderSettings();
        renderMatches();
        showToast('Profile reset.');
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.querySelector('.modal-close')?.addEventListener('click', closeModal);
    document.getElementById('modal')?.addEventListener('click', (event) => {
        if (event.target.id === 'modal') closeModal();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initOnboarding();
    initDashboard();
});
