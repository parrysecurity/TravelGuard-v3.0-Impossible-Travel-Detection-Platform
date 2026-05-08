// Backend API integration for TravelGuard
const API_BASE = '/api';

// Fetch all data from backend on load
async function fetchAllData() {
    try {
        // Fetch events
        const eventsRes = await fetch(`${API_BASE}/events`);
        const backendEvents = await eventsRes.json();
        
        // Fetch alerts
        const alertsRes = await fetch(`${API_BASE}/alerts`);
        const backendAlerts = await alertsRes.json();
        
        // Fetch whitelist
        const whitelistRes = await fetch(`${API_BASE}/whitelist`);
        const backendWhitelist = await whitelistRes.json();
        
        // Fetch users
        const usersRes = await fetch(`${API_BASE}/users`);
        const backendUsers = await usersRes.json();
        
        // Convert backend events to frontend format
        window.events = backendEvents.map(e => ({
            id: e.id,
            uid: e.user_id,
            city: e.city,
            country: e.country,
            lat: parseFloat(e.latitude),
            lng: parseFloat(e.longitude),
            ip: e.ip_address,
            device: e.device,
            browser: e.browser,
            ts: parseInt(e.timestamp),
            sus: e.is_suspicious || false,
            alertId: e.alert_id
        }));
        
        // Convert backend alerts to frontend format
        window.alerts = backendAlerts.map(a => ({
            id: a.id,
            uid: a.user_id,
            sev: a.severity,
            dist: a.distance_km,
            hrs: a.time_hours,
            spd: a.required_speed,
            riskScore: a.risk_score,
            ack: a.acknowledged,
            investigating: a.investigating,
            notes: a.notes ? [a.notes] : [],
            ts: parseInt(a.timestamp),
            prev: {
                city: a.prev_city,
                country: a.prev_country,
                lat: parseFloat(a.prev_latitude),
                lng: parseFloat(a.prev_longitude),
                ip: a.prev_ip
            },
            curr: {
                city: a.curr_city,
                country: a.curr_country,
                lat: parseFloat(a.curr_latitude),
                lng: parseFloat(a.curr_longitude),
                ip: a.curr_ip,
                device: a.curr_device,
                browser: a.curr_browser
            }
        }));
        
        // Update whitelist
        window.whitelist = backendWhitelist;
        
        // Update user list if needed
        if (backendUsers.length) {
            window.USERS = backendUsers.map(u => ({
                id: u.id,
                nm: u.name,
                color: u.color
            }));
        }
        
        // Update badge counts
        const unackCount = window.alerts.filter(a => !a.ack).length;
        const badgeEl = document.getElementById('badge-alerts');
        if (badgeEl) badgeEl.textContent = unackCount;
        
        console.log(`✅ Loaded ${window.events.length} events and ${window.alerts.length} alerts`);
        return true;
    } catch (error) {
        console.error('Failed to fetch data:', error);
        return false;
    }
}

// Save event to backend
async function saveEventToBackend(event) {
    try {
        const response = await fetch(`${API_BASE}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: event.id,
                userId: event.uid,
                city: event.city,
                country: event.country,
                latitude: event.lat,
                longitude: event.lng,
                ip: event.ip,
                device: event.device,
                browser: event.browser,
                isSuspicious: event.sus || false,
                alertId: event.alertId || null,
                timestamp: event.ts
            })
        });
        return response.ok;
    } catch (error) {
        console.error('Failed to save event:', error);
        return false;
    }
}

// Save alert to backend
async function saveAlertToBackend(alert) {
    try {
        const response = await fetch(`${API_BASE}/alerts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: alert.id,
                userId: alert.uid,
                severity: alert.sev,
                distanceKm: alert.dist,
                timeHours: alert.hrs,
                requiredSpeed: alert.spd,
                riskScore: alert.riskScore,
                prevCity: alert.prev.city,
                prevCountry: alert.prev.country,
                prevLat: alert.prev.lat,
                prevLng: alert.prev.lng,
                prevIp: alert.prev.ip,
                currCity: alert.curr.city,
                currCountry: alert.curr.country,
                currLat: alert.curr.lat,
                currLng: alert.curr.lng,
                currIp: alert.curr.ip,
                currDevice: alert.curr.device,
                currBrowser: alert.curr.browser,
                timestamp: alert.ts
            })
        });
        return response.ok;
    } catch (error) {
        console.error('Failed to save alert:', error);
        return false;
    }
}

// Update alert status in backend
async function updateAlertStatus(alertId, updates) {
    try {
        const response = await fetch(`${API_BASE}/alerts/${alertId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return response.ok;
    } catch (error) {
        console.error('Failed to update alert:', error);
        return false;
    }
}

// Override the addEvent function to sync with backend
const originalAddEvent = window.addEvent;
window.addEvent = async function(uid, city, ip, ts = Date.now()) {
    // Call original function to create event locally
    const event = originalAddEvent(uid, city, ip, ts);
    
    // Save to backend
    await saveEventToBackend(event);
    
    // If alert was created, save it too
    if (event.sus && event.alertId) {
        const alert = window.alerts.find(a => a.id === event.alertId);
        if (alert) {
            await saveAlertToBackend(alert);
        }
    }
    
    // Refresh the UI
    if (typeof render === 'function') {
        render();
    }
    
    return event;
};

// Override acknowledge functions
const originalAckAlert = window.ackAlert;
window.ackAlert = async function(id) {
    const alert = window.alerts.find(a => a.id === id);
    if (alert) {
        alert.ack = true;
        await updateAlertStatus(id, { acknowledged: true });
        
        // Update badge
        const unackCount = window.alerts.filter(a => !a.ack).length;
        const badgeEl = document.getElementById('badge-alerts');
        if (badgeEl) badgeEl.textContent = unackCount;
        
        // Refresh UI
        if (typeof refreshAlertTable === 'function') refreshAlertTable();
        if (typeof renderAlertDetail === 'function') renderAlertDetail(id);
        
        showToast('Alert Acknowledged', 'Changes saved to database', 'grn');
    }
};

// Override start investigation
const originalStartInv = window.startInv;
window.startInv = async function(id) {
    const alert = window.alerts.find(a => a.id === id);
    if (alert) {
        alert.investigating = true;
        await updateAlertStatus(id, { investigating: true });
        
        if (typeof refreshAlertTable === 'function') refreshAlertTable();
        if (typeof renderAlertDetail === 'function') renderAlertDetail(id);
        
        showToast('Investigation Started', 'Alert marked for investigation', 'amb');
    }
};

// Initialize - load data from backend then start app
async function initWithBackend() {
    await fetchAllData();
    
    // Call original init if it exists
    if (typeof originalInit === 'function') {
        originalInit();
    }
    
    // Render the dashboard
    if (typeof renderDashboard === 'function') {
        renderDashboard();
    } else if (typeof render === 'function') {
        render();
    }
    
    console.log('✅ TravelGuard initialized with backend data');
}

// Store original init
window.originalInit = window.initData;
window.initData = initWithBackend;

// Also override simulate function to save to backend
const originalSimulate = window.simulate;
window.simulate = async function() {
    const u = USERS[Math.floor(Math.random() * USERS.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const ev = await window.addEvent(u.id, city, ip);
    showToast(ev.sus ? '🚨 Alert!' : '✅ Login', `${u.nm} → ${city.n}`, ev.sus ? 'red' : 'grn');
    
    // Refresh current page
    if (page === 'dashboard') renderDashboard();
    else if (page === 'alerts') {
        if (typeof refreshAlertTable === 'function') refreshAlertTable();
        if (typeof badge === 'function') badge('badge-alerts', alerts.filter(x => !x.ack).length);
    } else if (page === 'timeline') {
        if (typeof refreshTimeline === 'function') refreshTimeline();
    }
};

console.log('Backend integration loaded - API: ' + API_BASE);
