const fetch = require('node-fetch');

async function fixDB() {
    console.log("Fetching current raw data from production...");
    const kinRes = await fetch('https://app--levadura-7427a.us-central1.hosted.app/api/get-kinetics');
    const kinData = await kinRes.json();
    
    const propRes = await fetch('https://app--levadura-7427a.us-central1.hosted.app/api/get-propagation');
    const propData = await propRes.json();

    const payload = {
        propagacion: propData.rawData,
        cineticas: kinData.rawData
    };

    console.log("Re-syncing to production to apply new parsing logic...");
    const syncRes = await fetch('https://app--levadura-7427a.us-central1.hosted.app/api/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (syncRes.ok) {
        console.log("Successfully updated database!");
        const freshRes = await fetch('https://app--levadura-7427a.us-central1.hosted.app/api/get-kinetics');
        const freshData = await freshRes.json();
        const uniqueTanks = [...new Set(freshData.stats.map(s => s.tanque))];
        console.log("New unique tanks:", uniqueTanks);
    } else {
        console.error("Failed to sync", await syncRes.text());
    }
}
fixDB();
