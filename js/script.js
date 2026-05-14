
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
        const url = `https://transport.opendata.ch/v1/locations?query=${text}&type=station`;
        const response = await fetch(url);
        const data = await response.json();

        return data.stations.filter(station => {
            return !station.name.includes(',');
        });

    } catch (error) {
        console.error(error);
        return [];
    }
}



const startBtn = document.querySelector('#start-btn');

startBtn.addEventListener('click', () => {
    if (ortEingabe === '') {
        alert('Bitte zuerst einen Bahnhof auswählen.');
        return;
    }

    durationText = 'Kurz'; // oder Mittel / Lang
    main();
});












let duration = prompt('Wie lange?');

let durationOne = 20;
let durationTwo = 80;
let durationThree = 180;

let durationText = 'kurz';

if (duration == '1') {
    durationText = 'Kurz';
    main();
} else if (duration == '2') {
    durationText = 'Mittel';
    main();
} else if (duration == '3') {
    durationText = 'Lang';
    main();
}else {
    alert('Ungültige Eingabe. Bitte gib 1, 2 oder 3 ein.');
}




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

    let gefilterteZuege = dataArray.filter((element) => element.dauerKategorie === durationText);
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