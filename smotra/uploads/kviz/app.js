// Podaci o studijima i kombinacijama
const studyData = {
    'prehrambene_tehnologije': {
        naziv: 'PREHRAMBENI TEHNOLOG – KRALJ PROCESA I KREATOR OKUSA',
        opis: `Tvoja znanost ima okus! Sve što zamisliš – možeš i proizvesti.

TVOJ PROFIL:

• Kreativan si i praktičan – voliš spajati okuse i pretvarati ideje u proizvode.

• Tvoj smoothie je savršeno uravnotežen – slatkoća, tekstura i stabilnost u idealnoj mjeri.

ZAŠTO STUDIJ PREHRAMBENE TEHNOLOGIJE?

Kao prehrambeni tehnolog, baviš se procesima koji stoje iza svake boce, jogurta ili pločice.

Na PBF-u učiš o toplinskoj obradi, emulzijama, senzorskoj analizi i inovacijama u prehrambenoj industriji.`,

        trajanje: '3 godine',
        ects_bodovi: '180 ECTS',
        lokacija: 'Zagreb, Pierottijeva 6',
        tip_studija: 'Prijediplomski studij',
        web_link: 'https://www.pbf.unizg.hr/studiji/prijediplomski_studij/prehrambena_tehnologija',
        kombinacije: [
            { baza: 'jogurt', sastojak: 'banana', dodatak: 'med' },
            { baza: 'jogurt', sastojak: 'banana', dodatak: 'kakao' },
            { baza: 'sok', sastojak: 'banana', dodatak: 'kakao' },
            { baza: 'biljni', sastojak: 'banana', dodatak: 'kakao' },
            { baza: 'mlijeko', sastojak: 'banana', dodatak: 'med' },
            { baza: 'mlijeko', sastojak: 'banana', dodatak: 'kakao' },
            { baza: 'jogurt', sastojak: 'spinat', dodatak: 'kakao' },
            { baza: 'sok', sastojak: 'spinat', dodatak: 'kakao' },
            { baza: 'biljni', sastojak: 'spinat', dodatak: 'kakao' },
            { baza: 'mlijeko', sastojak: 'spinat', dodatak: 'kakao' },
            { baza: 'jogurt', sastojak: 'borovnica', dodatak: 'kakao' },
            { baza: 'jogurt', sastojak: 'borovnica', dodatak: 'med' },
            { baza: 'sok', sastojak: 'borovnica', dodatak: 'kakao' },
            { baza: 'biljni', sastojak: 'borovnica', dodatak: 'kakao' },
            { baza: 'mlijeko', sastojak: 'borovnica', dodatak: 'kakao' },
            { baza: 'mlijeko', sastojak: 'borovnica', dodatak: 'med' }
        ]
    },
    'nutricionizam': {
        naziv: 'NUTRICIONIST – ČUVAR ZDRAVLJA',
        opis: `Tvoj laboratorij je tanjur, a tvoja misija – zdravlje kroz znanost.

TVOJ PROFIL:

• Ti si pažljiv, empatičan i voliš razumjeti kako hrana djeluje na tijelo.

• Tvoj smoothie pun je vlakana, biljnih proteina i omega-3 masnih kiselina — prava ravnoteža znanosti i prirode.

ZAŠTO STUDIJ NUTRICIONIZMA?

Kao nutricionist, istražuješ kako različiti sastojci utječu na zdravlje, energiju i prevenciju bolesti.

Na PBF-u učiš o kemiji hrane, ljudskom metabolizmu, dijetoterapiji i planiranju uravnoteženih obroka.`,

        trajanje: '3 godine',
        ects_bodovi: '180 ECTS',
        lokacija: 'Zagreb, Pierottijeva 6',
        tip_studija: 'Prijediplomski studij',
        web_link: 'https://www.pbf.unizg.hr/studiji/prijediplomski_studij/nutricionizam',
        kombinacije: [
            { baza: 'jogurt', sastojak: 'banana', dodatak: 'chia' },
            { baza: 'sok', sastojak: 'banana', dodatak: 'chia' },
            { baza: 'sok', sastojak: 'banana', dodatak: 'med' },
            { baza: 'biljni', sastojak: 'banana', dodatak: 'med' },
            { baza: 'biljni', sastojak: 'banana', dodatak: 'chia' },
            { baza: 'mlijeko', sastojak: 'banana', dodatak: 'chia' },
            { baza: 'jogurt', sastojak: 'spinat', dodatak: 'chia' },
            { baza: 'jogurt', sastojak: 'spinat', dodatak: 'med' },
            { baza: 'sok', sastojak: 'spinat', dodatak: 'chia' },
            { baza: 'sok', sastojak: 'spinat', dodatak: 'med' },
            { baza: 'biljni', sastojak: 'spinat', dodatak: 'chia' },
            { baza: 'biljni', sastojak: 'spinat', dodatak: 'med' },
            { baza: 'mlijeko', sastojak: 'spinat', dodatak: 'chia' },
            { baza: 'mlijeko', sastojak: 'spinat', dodatak: 'med' },
            { baza: 'jogurt', sastojak: 'borovnica', dodatak: 'chia' },
            { baza: 'sok', sastojak: 'borovnica', dodatak: 'med' },
            { baza: 'sok', sastojak: 'borovnica', dodatak: 'chia' },
            { baza: 'biljni', sastojak: 'borovnica', dodatak: 'med' },
            { baza: 'biljni', sastojak: 'borovnica', dodatak: 'chia' },
            { baza: 'mlijeko', sastojak: 'borovnica', dodatak: 'chia' }
        ]
    },
    'biotehnologija': {
        naziv: 'BIOTEHNOLOG – FERMENTACIJSKI MAJSTOR',
        opis: `Tvoj smoothie nije samo piće – to je živa kultura znanosti!

TVOJ PROFIL:

• Istraživačkog si duha. Voliš mikroorganizme i vjeruješ da su oni tajni saveznici okusa i zdravlja.

ZAŠTO STUDIJ BIOTEHNOLOGIJE?

Kao biotehnolog, otkrivaš kako mikroorganizmi i enzimi stvaraju nove teksture i arome.

Na PBF-u učiš o fermentaciji, mikrobiologiji hrane i bioprocesima koji oblikuju budućnost prehrane.`,

        trajanje: '3 godine',
        ects_bodovi: '180 ECTS',
        lokacija: 'Zagreb, Pierottijeva 6',
        tip_studija: 'Prijediplomski studij',
        web_link: 'https://www.pbf.unizg.hr/studiji/prijediplomski_studij/biotehnologija',
        kombinacije: [
            { baza: 'jogurt', sastojak: 'banana', dodatak: 'spirulina' },
            { baza: 'sok', sastojak: 'banana', dodatak: 'spirulina' },
            { baza: 'biljni', sastojak: 'banana', dodatak: 'spirulina' },
            { baza: 'mlijeko', sastojak: 'banana', dodatak: 'spirulina' },
            { baza: 'jogurt', sastojak: 'spinat', dodatak: 'spirulina' },
            { baza: 'sok', sastojak: 'spinat', dodatak: 'spirulina' },
            { baza: 'biljni', sastojak: 'spinat', dodatak: 'spirulina' },
            { baza: 'mlijeko', sastojak: 'spinat', dodatak: 'spirulina' },
            { baza: 'jogurt', sastojak: 'borovnica', dodatak: 'spirulina' },
            { baza: 'sok', sastojak: 'borovnica', dodatak: 'spirulina' },
            { baza: 'biljni', sastojak: 'borovnica', dodatak: 'spirulina' },
            { baza: 'mlijeko', sastojak: 'borovnica', dodatak: 'spirulina' }
        ]
    }
};

// Podaci o opcijama
const optionData = {
    baze: {
        'jogurt': { naziv: 'Jogurt', emoji: '🥛', opis: 'Fermentirana baza bogata probioticima' },
        'sok': { naziv: '100% voćni sok', emoji: '🧃', opis: 'Osvježavajuća baza puna vitamina C' },
        'biljni': { naziv: 'Obogaćeni biljni napitak', emoji: '🌱', opis: 'Alternativa za biljne proteine' },
        'mlijeko': { naziv: 'Mlijeko', emoji: '🐄', opis: 'Klasična baza s proteinima i kalcijem' }
    },
    sastojci: {
        'banana': { naziv: 'Banana', emoji: '🍌', opis: 'Daje slatkoću i gustoću smoothieju' },
        'spinat': { naziv: 'Špinat', emoji: '🥬', opis: 'Zeleno blago s puno željeza i vlakana' },
        'borovnica': { naziv: 'Borovnica', emoji: '🫐', opis: 'Izvor prirodnih antocijana i antioksidansa' }
    },
    dodaci: {
        'chia': { naziv: 'Chia', emoji: '🌱', opis: 'Izvor omega-3 masnih kiselina i vlakana' },
        'spirulina': { naziv: 'Spirulina', emoji: '🌊', opis: 'Mikroalga prepuna proteina i pigmenata' },
        'med': { naziv: 'Med', emoji: '🍯', opis: 'Prirodni zaslađivač i antimikrobno sredstvo' },
        'kakao': { naziv: 'Kakao', emoji: '🍫', opis: 'Daje aromu i energiju' }
    }
};

// Stanje aplikacije
let currentScreen = 'intro';
let selectedBaza = null;
let selectedSastojak = null;
let selectedDodatak = null;

// Funkcije za navigaciju
function showScreen(screenId) {
    // Sakrij sve ekrane
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Prikaži odabrani ekran
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

function startQuiz() {
    showScreen('step1');
}

function goToStep1() {
    showScreen('step1');
}

function goToStep2() {
    if (!selectedBaza) {
        alert('Molimo odaberite bazu prije prelaska na sljedeći korak.');
        return;
    }
    
    showScreen('step2');
}

function goToStep3() {
    if (!selectedSastojak) {
        alert('Molimo odaberite glavni sastojak prije prelaska na sljedeći korak.');
        return;
    }
    
    showScreen('step3');
}

function restartQuiz() {
    selectedBaza = null;
    selectedSastojak = null;
    selectedDodatak = null;
    
    // Ukloni selected klasu s svih opcija
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Onemogući dugmad za sljedeći korak
    document.getElementById('next1').disabled = true;
    document.getElementById('next2').disabled = true;
    document.getElementById('next3').disabled = true;
    
    showScreen('intro');
}

// Funkcija za odabir opcije
function selectOption(type, value) {
    if (type === 'baza') {
        selectedBaza = value;
        
        // Ukloni selected klasu s prethodnih opcija u step1
        document.querySelectorAll('#step1 .option-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Dodaj selected klasu na odabranu opciju
        document.querySelector(`#step1 .option-card[data-value="${value}"]`).classList.add('selected');
        
        // Omogući dugme za sljedeći korak
        document.getElementById('next1').disabled = false;
        
    } else if (type === 'sastojak') {
        selectedSastojak = value;
        
        // Ukloni selected klasu s prethodnih opcija u step2
        document.querySelectorAll('#step2 .option-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Dodaj selected klasu na odabranu opciju
        document.querySelector(`#step2 .option-card[data-value="${value}"]`).classList.add('selected');
        
        // Omogući dugme za sljedeći korak
        document.getElementById('next2').disabled = false;
        
    } else if (type === 'dodatak') {
        selectedDodatak = value;
        
        // Ukloni selected klasu s prethodnih opcija u step3
        document.querySelectorAll('#step3 .option-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Dodaj selected klasu na odabranu opciju
        document.querySelector(`#step3 .option-card[data-value="${value}"]`).classList.add('selected');
        
        // Omogući dugme za rezultat
        document.getElementById('next3').disabled = false;
    }
}

// Funkcija za pronalaženje studija na osnovu kombinacije
function findStudy(baza, sastojak, dodatak) {
    for (const [studyKey, studyInfo] of Object.entries(studyData)) {
        const matchingCombination = studyInfo.kombinacije.find(kombinacija => 
            kombinacija.baza === baza && kombinacija.sastojak === sastojak && kombinacija.dodatak === dodatak
        );
        
        if (matchingCombination) {
            return {
                key: studyKey,
                ...studyInfo
            };
        }
    }
    
    // Fallback - vraća prvi dostupan studij ako se ne pronađe točna kombinacija
    return {
        key: 'prehrambene_tehnologije',
        ...studyData.prehrambene_tehnologije
    };
}

// Funkcija za napredni confetti efekt
function fireAdvancedConfetti() {
    // Glavna eksplozija iz centra
    confetti({
        particleCount: 150,
        spread: 70,
        startVelocity: 45,
        origin: { y: 0.6 },
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'],
        shapes: ['square', 'circle']
    });

    // Kiša šljokica s lijeve strane
    confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.1 },
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
        startVelocity: 35
    });

    // Kiša šljokica s desne strane  
    confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.1 },
        colors: ['#96ceb4', '#feca57', '#ff9ff3'],
        startVelocity: 35
    });

    // Dodatni efekt nakon malo vremena
    setTimeout(() => {
        confetti({
            particleCount: 60,
            spread: 100,
            startVelocity: 30,
            origin: { y: 0.8 },
            colors: ['#54a0ff', '#5f27cd', '#00d2d3'],
            shapes: ['circle']
        });
    }, 300);

    // Još jedan val šljokica
    setTimeout(() => {
        confetti({
            particleCount: 40,
            angle: 90,
            spread: 45,
            origin: { x: 0.5, y: 0.3 },
            colors: ['#fd79a8', '#fdcb6e', '#6c5ce7'],
            startVelocity: 25
        });
    }, 600);

    // Finalni burst
    setTimeout(() => {
        confetti({
            particleCount: 30,
            spread: 360,
            startVelocity: 20,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#ff6b6b', '#4ecdc4', '#feca57'],
            shapes: ['square']
        });
    }, 900);
}

// Funkcija za prikaz rezultata
function showResults() {
    if (!selectedBaza || !selectedSastojak || !selectedDodatak) {
        alert('Molimo odaberite sve sastojke prije prikaza rezultata.');
        return;
    }
    
    // Pronađi odgovarajući studij
    const result = findStudy(selectedBaza, selectedSastojak, selectedDodatak);
    
    // Ažuriraj osnovne informacije
    document.getElementById('study-name').textContent = result.naziv;
    document.getElementById('study-description').innerHTML = result.opis.replace(/\n/g, '<br>');
    
    // Ažuriraj dodatne informacije
    document.getElementById('duration-text').textContent = result.trajanje || 'Nije navedeno';
    document.getElementById('ects-text').textContent = result.ects_bodovi || 'Nije navedeno';
    document.getElementById('location-text').textContent = result.lokacija || 'Zagreb';
    document.getElementById('study-type-text').textContent = result.tip_studija || 'Preddiplomski';
    
    // Ažuriraj web link
    if (result.web_link) {
        document.getElementById('study-web-link').href = result.web_link;
    }
    
    // Ažuriraj emojije u smoothie previewu
    document.getElementById('smoothie-base-emoji').textContent = optionData.baze[selectedBaza].emoji;
    document.getElementById('smoothie-ingredient-emoji').textContent = optionData.sastojci[selectedSastojak].emoji;
    document.getElementById('smoothie-addon-emoji').textContent = optionData.dodaci[selectedDodatak].emoji;
    
    // Prikaži results ekran
    showScreen('results');
    
    // Pokreni advanced confetti efekt nakon kratke pauze
    setTimeout(() => {
        fireAdvancedConfetti();
    }, 500);
}

// Inicijalizacija aplikacije
document.addEventListener('DOMContentLoaded', function() {
    // Početno stanje - prikaži intro ekran
    showScreen('intro');
    
    // Onemogući dugmad za sljedeći korak na početku
    document.getElementById('next1').disabled = true;
    document.getElementById('next2').disabled = true;
    document.getElementById('next3').disabled = true;
});

// Dodaj keyboard navigaciju
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        if (currentScreen === 'intro') {
            startQuiz();
        } else if (currentScreen === 'step1' && selectedBaza) {
            goToStep2();
        } else if (currentScreen === 'step2' && selectedSastojak) {
            goToStep3();
        } else if (currentScreen === 'step3' && selectedDodatak) {
            showResults();
        }
    } else if (e.key === 'Escape') {
        if (currentScreen !== 'intro') {
            restartQuiz();
        }
    }
});

// Dodaj animacije za hover efekte
document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('option-card') && !e.target.classList.contains('selected')) {
        e.target.style.transform = 'translateY(-4px)';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('option-card') && !e.target.classList.contains('selected')) {
        e.target.style.transform = 'translateY(0)';
    }
});