"use strict";
function watchSpaceghostListens(audio, current) {
    let item, ticket, previousPosition, previousTick, heard, nowSent, finalSent;
    const reset = () => { item = null; ticket = null; previousPosition = previousTick = heard = 0; nowSent = finalSent = false; };
    reset();
    function tick() {
        const track = current();
        const token = localStorage.getItem("melodicaClientToken");
        if (!token || !track || track.adToken || !track.artistName || !track.songName) { reset(); return; }
        const pos = audio.currentTime, seconds = audio.duration, wall = performance.now() / 1000;
        if (track !== item || token !== ticket) {
            reset(); item = track; ticket = token; previousPosition = pos; previousTick = wall;
        }
        const delta = pos - previousPosition, elapsed = wall - previousTick;
        previousPosition = pos; previousTick = wall;
        if (audio.paused || audio.seeking || !Number.isFinite(seconds) || pos <= 0) return;
        if (delta > 0 && elapsed > 0 && delta <= elapsed + 1 && elapsed < 10) heard += Math.min(delta, elapsed);
        const send = (type) => {
            const meta = {artist_name: track.artistName, track_name: track.songName,
                additional_info: {submission_client: "Anesidora Melodica", music_service: "pandora.com", duration_ms: Math.round(seconds*1000)}};
            if (track.albumName) meta.release_name = track.albumName;
            const listen = {track_metadata:meta};
            if (type === "single") listen.listened_at = started;
            fetch("https://spacegho.st/scrobble/1/submit-listens", {method:"POST", credentials:"omit", redirect:"error",
                headers:{"Authorization":"Token "+token,"Content-Type":"application/json"},
                body:JSON.stringify({listen_type:type,payload:[listen]})}).catch(()=>{});
        };
        if (!nowSent) { nowSent = true; started = Math.floor(Date.now()/1000); send("playing_now"); }
        if (!finalSent && seconds > 30 && heard >= Math.min(seconds/2,240)) { finalSent = true; send("single"); }
    }
    let started = 0;
    for (const event of ["timeupdate","playing","pause","seeking","seeked"]) audio.addEventListener(event,tick);
    audio.addEventListener("emptied",reset);
}
