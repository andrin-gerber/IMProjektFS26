const ortInput = document.querySelector('#ort-input');
const vorschlaegeBox = document.querySelector('#vorschlaege');

let ortEingabe = '';

ortInput.addEventListener('input', async () => {
    const text = ortInput.value;

    if (text.length < 2) {
        vorschlaegeBox.innerHTML = '';
        return;
    }

    const stationen = await sucheBahnhof(text);

    vorschlaegeBox.innerHTML = '';

    stationen.forEach((station) => {
        const div = document.createElement('div');
        div.innerText = station.name;

        div.addEventListener('click', () => {
            ortInput.value = station.name;
            ortEingabe = station.name;
            vorschlaegeBox.innerHTML = '';
        });

        vorschlaegeBox.appendChild(div);
    });
});



async function sucheBahnhof(text) {

    try {

        const url =
            `https://transport.opendata.ch/v1/locations?query=${text}&type=station`;

        const response = await fetch(url);

        const data = await response.json();

        let stationenMitGleis = [];

        
        for (const station of data.stations) {

            // -> Busstationen entfernen
            if (station.name.includes(',')) {
                continue;
            }

            
            // -> Stationboard laden
            const boardResponse = await fetch(
                `https://transport.opendata.ch/v1/stationboard?station=${station.name}&limit=5`
            );

            const boardData = await boardResponse.json();


            // -> Prüfen ob mindestens ein Gleis existiert
            const hatGleis = boardData.stationboard.some((zug) => {
                return zug.stop.platform;
            });


            if (hatGleis) {
                stationenMitGleis.push(station);
            }
        }

        
        return stationenMitGleis;

    } catch (error) {

        console.error(error);

        return [];
    }
}



const startBtn = document.querySelector('#start-btn');
const zeitInput = document.querySelector('#zeit-input');
let durationText = '';
startBtn.addEventListener('click', () => {

    if (ortEingabe === '') {
        alert('Bitte zuerst einen Bahnhof auswählen.');
        return;
    }

    const zeit = zeitInput.value;

    if (zeit === '1') {
        durationText = 'Kurz';

    } else if (zeit === '2') {
        durationText = 'Mittel';

    } else if (zeit === '3') {
        durationText = 'Lang';

    } else {
        alert('Bitte 1, 2 oder 3 eingeben.');
        return;
    }

    
    main();
});



let durationOne = 20;
let durationTwo = 60;
let durationThree = 100;




async function loadData(ort) {
    try {
        const url = `http://transport.opendata.ch/v1/stationboard?station=${ort}&limit=50`;
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function main() {
    let data = await loadData(ortEingabe);
    let dataArray = data.stationboard;


    console.log(dataArray);

    dataArray.forEach((element) => {
        let abfahrtszeit = element.stop.departure;
        console.log(abfahrtszeit);
        let passlist = element.passList;
        console.log(passlist);
        let ankunftszeit = passlist[passlist.length -1].arrival;
        console.log(ankunftszeit);
        let fahrtdauer = (new Date(ankunftszeit) - new Date(abfahrtszeit)) / 60000;
        console.log(fahrtdauer);
        element.fahrtdauer = fahrtdauer;
        if (fahrtdauer <= durationOne) {
            element.dauerKategorie = 'Kurz';
        } else if (fahrtdauer <= durationTwo) {
            element.dauerKategorie = 'Mittel';
        } else {
            element.dauerKategorie = 'Lang';
        }
        console.log(element);
    });

let jetzt = new Date();

let gefilterteZuege = dataArray.filter((element) => {
    let abfahrt = new Date(element.stop.departure);
    let minutenBisAbfahrt = (abfahrt - jetzt) / 60000;

    return element.dauerKategorie === durationText
        && minutenBisAbfahrt >= 8
        && minutenBisAbfahrt <= 68
        && element.stop.platform;
});


// -> Falls nichts gefunden wird:
if (gefilterteZuege.length === 0) {

    gefilterteZuege = dataArray.filter((element) => {

        let abfahrt = new Date(element.stop.departure);

        let minutenBisAbfahrt =
            (abfahrt - jetzt) / 60000;

        return minutenBisAbfahrt >= 8
            && minutenBisAbfahrt <= 68
            && element.stop.platform
            && (
                durationText === 'Lang' && element.dauerKategorie !== 'Lang'
                || durationText === 'Mittel' && element.dauerKategorie === 'Kurz'
            );
    });
}


if (gefilterteZuege.length === 0) {
    alert('Keine passende Verbindung gefunden. Versuche einen anderen Bahnhof oder eine andere Dauer.');
    return;
}


    console.log(gefilterteZuege);
    let zufallsZahl = Math.random() * gefilterteZuege.length;
    console.log(zufallsZahl);
    let Zufallszug = gefilterteZuege[Math.floor(zufallsZahl)];
    console.log(Zufallszug);
    let time = new Date(Zufallszug.stop.departure);

    time = time.toLocaleTimeString("de-CH", {
        hour: "2-digit",
        minute: "2-digit"
    });
    alert(`Du fährst um ${time} Uhr auf Gleis ${Zufallszug.stop.platform} ab. Gute Fahrt!`);

}