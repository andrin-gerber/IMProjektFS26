let ortEingabe = prompt('Ort eingeben:');
let duration = prompt('Wie lange?');

let durationOne = 60;
let durationTwo = 90;
let durationThree = 120;

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