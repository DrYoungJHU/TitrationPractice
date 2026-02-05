let Ka, Ca, Va, Cb, chart, selectedPoint, V_eq, V_half;
let selectedIndex = null;
let isWeakBaseMode = false;

function setupNewProblem() {
    isWeakBaseMode = document.getElementById('titrationMode').checked;
    
    // Randomize: Ka or Kb
    Ka = Math.pow(10, -(Math.random() * (6 - 3) + 3));
    Ca = parseFloat((Math.random() * (0.2 - 0.05) + 0.05).toFixed(3));
    Cb = parseFloat((Math.random() * (0.2 - 0.05) + 0.05).toFixed(3));
    Va = parseFloat((Math.random() * (5) + 20.00).toFixed(1)); 
    selectedIndex = null;
  
    V_eq = (Ca * Va) / Cb;
    V_half = V_eq / 2;

    updateDisplay();
    generateChart();
    
    document.getElementById('question-prompt').innerText = "Select a point on the line to begin!";
    document.getElementById('input-wrap').style.display = 'none';
    document.getElementById('feedback').innerText = '';
    document.getElementById('user-pH').value = '';
}

function updateDisplay() {
    const display = document.getElementById('params-display');
    const typeA = isWeakBaseMode ? "Weak Base" : "Weak Acid";
    const typeB = isWeakBaseMode ? "HCl (Strong Acid)" : "NaOH (Strong Base)";
    const kLabel = isWeakBaseMode ? "K<sub>b</sub>" : "K<sub>a</sub>";

    display.innerHTML = `
        <b>Analyte:</b> ${Va}mL of ${Ca}M ${typeA} (${kLabel} = ${Ka.toExponential(2)})<br>
        <b>Titrant:</b> ${Cb}M ${typeB}
    `;
}

function calculatePH(Vb) {
    const molesA = (Va * Ca) / 1000;
    const molesB = (Vb * Cb) / 1000;
    const totalV = (Va + Vb) / 1000;
    let pH;

    if (Vb < 0.0001) {
        pH = -Math.log10(Math.sqrt(Ka * Ca));
    } else if (Math.abs(molesB - molesA) < 1e-10) {
        const Kb = 1e-14 / Ka;
        const concSalt = molesA / totalV;
        pH = 14 - (-Math.log10(Math.sqrt(Kb * concSalt)));
    } else if (molesB < molesA) {
        const pKa = -Math.log10(Ka);
        pH = pKa + Math.log10(molesB / (molesA - molesB));
    } else {
        const excessBase = molesB - molesA;
        const concOH = excessBase / totalV;
        pH = 14 + Math.log10(concOH);
    }

    return isWeakBaseMode ? (14 - pH) : pH;
}

function generateChart() {
    const curvePoints = [];
    const noise = () => (Math.random()-0.5)*0.2;
    const maxV = V_eq * 1.6;
    
    for (let i = 0; i <= 200; i++) {
        let v = (i * maxV) / 200;
        curvePoints.push({ x: v.toFixed(2), y: calculatePH(v).toFixed(2) });
    }

    const quizVolumes = [
        0, 
        (V_eq * (0.25 + noise())).toFixed(2), 
        V_half.toFixed(2), 
        (V_eq * (0.75 + noise())).toFixed(2), 
        V_eq.toFixed(2), 
        (V_eq * (1.3 + noise())).toFixed(2), 
        maxV.toFixed(2)
    ];

    if (chart) chart.destroy();

    const ctx = document.getElementById('titrationChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Interactable Points',
                    data: quizVolumes.map(v => ({ x: v, y: calculatePH(parseFloat(v)).toFixed(2) })),
                    showLine: false,
                    pointRadius: quizVolumes.map((v, i) => i === selectedIndex ? 8 : 6),
                    pointBorderColor: quizVolumes.map((v, i) => i === selectedIndex ? 'black' : 'rgba(0,0,0,0.1)'),
                    pointBorderWidth: quizVolumes.map((v, i) => i === selectedIndex ? 4 : 1),
                    pointBackgroundColor: quizVolumes.map(v => 
                        parseFloat(v) === 0 ? 'purple' :
                        parseFloat(v) === parseFloat(V_eq.toFixed(2)) ? 'red' : 
                        parseFloat(v) === parseFloat(V_half.toFixed(2)) ? 'orange' : 'green'
                    ),
                    hitRadius: 15
                },
                {
                    label: 'Titration Curve',
                    data: curvePoints,
                    borderColor: '#007bff',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: { type: 'linear', title: { display: true, text: 'Volume Added (mL)' } },
                y: { display: false }
            },
            onClick: (e) => {
                const points = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                const quizDatasetPoints = points.filter(p => p.datasetIndex === 0);

                if (quizDatasetPoints.length) {
                    selectedIndex = quizDatasetPoints[0].index;
                    const pointData = chart.data.datasets[0].data[selectedIndex];
                    selectedPoint = { x: pointData.x, y: parseFloat(pointData.y) };
                    
                    document.getElementById('question-prompt').innerHTML = 
                        `<strong>Challenge:</strong> Calculate pH at <b>${selectedPoint.x} mL</b> added:`;
                    document.getElementById('input-wrap').style.display = 'block';
                    document.getElementById('feedback').innerText = '';

                    chart.data.datasets[0].pointBorderWidth = quizVolumes.map((_, i) => i === selectedIndex ? 5 : 1);
                    chart.data.datasets[0].pointBorderColor = quizVolumes.map((_, i) => i === selectedIndex ? 'black' : 'rgba(0,0,0,0.1)');
                    chart.update();
                }
            }
        }
    });
}

function checkAnswer() {
    const userVal = parseFloat(document.getElementById('user-pH').value);
    const feedback = document.getElementById('feedback');
    const diff = Math.abs(userVal - selectedPoint.y);
    const percentError = selectedPoint.y * 0.02; 
    
    if (diff < percentError) {
        feedback.style.color = "#28a745";
        feedback.innerText = `Correct! pH = ${selectedPoint.y}`;
        return;
    }
  
    const x = selectedPoint.x;
    const vEqFixed = parseFloat(V_eq.toFixed(2));
    feedback.style.color = "#dc3545";
  
    if (x <= 0.01) {
        feedback.innerText = `Try again! The initial pH is dictated by the weak ${isWeakBaseMode ? 'base' : 'acid'} equilibrium.`;
    } else if (x < vEqFixed) {
        feedback.innerText = `Try again! This point is in the buffer region; try the Henderson-Hasselbalch equation.`;
    } else if (Math.abs(x - vEqFixed) < 0.01) { 
        feedback.innerText = `Try again! At equivalence, only the conjugate is present. Use salt hydrolysis!`;
    } else {
        feedback.innerText = `Try again! At this stage, you have excess strong titrant.`;
    }
}

window.onload = setupNewProblem;
