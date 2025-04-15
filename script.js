let currentsong = new Audio();

let songs = [];
let currentfolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "invalid input";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currentfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            const splitHref = element.href.split(`/${folder}/`);
            if (splitHref.length > 1) {
                songs.push(splitHref[1]);
            }
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let safeSong = song ? song.replaceAll("%20", " ") : "Unknown Song";
        songUL.innerHTML += `<li> <img class="invert" src="img/music.svg" alt="">
                                  <div class="info">
                                        <div>${safeSong}</div>
                                        <div>Amay</div>
                                  </div>
                                  <div class="playnow">
                                         <span>Play Now</span>
                                         <img class="invert" src="img/play2.svg" alt="">
                                  </div> </li>`;
    }

    // Attach event listeners to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songName);
        });
    });
}

const playMusic = (track) => {
    if (!track) {
        console.error("No track provided to playMusic.");
        return;
    }
    currentsong.src = `/${currentfolder}/` + track;
    currentsong.play();
    play.src = "img/pause.svg";
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
}

async function main() {
    // Get the list of all the songs
    await getsongs("songs/Bhakti");
    console.log(songs);

    // Attach event listeners to play, next, and previous buttons
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/play2.svg";
        }
    });

    // Listen for time update events
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML =
            `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Add an event listener to the seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    // Add event listeners for hamburger and close buttons
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left-container").style.left = "0";
    });

    document.querySelector(".closed").addEventListener("click", () => {
        document.querySelector(".left-container").style.left = "-100%";
    });

    // Add event listeners for previous and next buttons
    previous.addEventListener("click", () => {
        console.log("Previous clicked");
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        } else {
            console.log("No previous track available.");
        }
    });

    next.addEventListener("click", () => {
        currentsong.pause();
        console.log("Next clicked");
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index !== -1 && index < songs.length - 1) {
            playMusic(songs[index + 1]);
        } else {
            console.log("No next track available.");
        }
    });

    // Add an event listener for volume control
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    // Load the playlist on card click
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
        await getsongs(`songs/${item.currentTarget.dataset.folder}`)
        });
    });
}

main();
