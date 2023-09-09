const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", { rockets: [], descriptions: [], images: [] }); 
});

function formatTime(milliseconds) {

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
}


app.post("/", async (req, res) => {
    let companie = req.body.companies;
    let query = ""
    if (companie === "all") {
        query = "https://ll.thespacedevs.com/2.2.0/launch/upcoming"
    } else {
        query = "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?search=" + companie;
    }

    try {
        const response = await axios.get(query);
        const data = response.data;
        let rockets = [];
        let descriptions = [];
        let images = [];
        let time = []; 

        if (data && data.results && data.results.length > 0) {

            for (let i = 0; i < 10; i++) {
                let rocket = data.results[i]?.mission?.name || "Unknown Rocket";
                let mission = data.results[i]?.mission?.description || "No mission description available";
                let image = data.results[i]?.image;
                let launchStart = data.results[i]?.net;
                let windowEnd = data.results[i]?.window_end;

                if (image != null) {
                    images.push(image);
                }

                const launchTime = new Date(launchStart);
                const windowEndTime = new Date(windowEnd);
                const currentTime = new Date();

                let timeNow; 

                if (currentTime < launchTime) {
                    const timeRemaining = launchTime - currentTime;
                    let formatedTime = formatTime(timeRemaining);
                    timeNow = `The launch will take place in: ${formatedTime}`;
                } else if (currentTime >= launchTime && currentTime <= windowEndTime) {
                    timeNow = "The launch is taking place now!";
                } else {
                    timeNow = "The launch has already occurred.";
                }
                rockets.push(rocket);
                descriptions.push(mission);
                time.push(timeNow); 
            }
        }
        res.render("index.ejs", { rockets, descriptions, images, time });
    } catch (error) {
        console.error("Error accessing the API:", error);
        res.render("index.ejs", { rockets: [], descriptions: [], images: [] });
    }
});


app.listen(3001, () => {
    console.log("http://localhost:3001");
});