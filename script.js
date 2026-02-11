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
    isWeakBaseMode = document.getElementById('titrationMode').checked;
    
    // Optional: Visual styling for labels
    const labels = document.querySelectorAll('.mode-label');
    if (isWeakBaseMode) {
        labels[0].style.opacity = "0.5";
        labels[1].style.opacity = "1";
    } else {
        labels[0].style.opacity = "1";
        labels[1].style.opacity = "0.5";
    }
    
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
    // 1. Setup constants
    const molesA = (Va * Ca) / 1000;
    const Kw = 1e-14;
    const Veq = (Ca * Va) / Cb;
    
    // 2. IMPORTANT: Round Vb and Veq to the same precision (2 decimal places)
    // This ensures the "Handshake" works when you click the dot.
    const vCheck = parseFloat(parseFloat(Vb).toFixed(2));
    const vEqCheck = parseFloat(Veq.toFixed(2));

    const molesB = (vCheck * Cb) / 1000;
    const totalV = (Va + vCheck) / 1000;
    let pH;

    // --- CHEMISTRY LOGIC ---
    
    // Initial Point
    if (vCheck < 0.01) {
        pH = -Math.log10(Math.sqrt(Ka * Ca));
    } 
    // Equivalence Point (The Handshake)
    else if (Math.abs(vCheck - vEqCheck) < 0.01) {
        const Kb = Kw / Ka;
        const concSalt = molesA / totalV;
        const OH = Math.sqrt(Kb * concSalt);
        pH = 14 + Math.log10(OH);
    } 
    // Buffer Region
    else if (vCheck < vEqCheck) {
        const pKa = -Math.log10(Ka);
        // Henderson-Hasselbalch
        pH = pKa + Math.log10(molesB / (molesA - molesB));
    } 
    // Excess Titrant
    else {
        const excessMols = molesB - molesA;
        const concExcess = excessMols / totalV;
        pH = 14 + Math.log10(concExcess);
    }

    // Weak Base Mode Flip
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
// 1. Size Logic: Selected point is 12, others are 7
    pointRadius: quizVolumes.map((_, i) => i === selectedIndex ? 10 : 7),
    pointHoverRadius: 12,

    // 2. Remove the Border: Set widths to 0
    pointBorderWidth: 0,
    pointHoverBorderWidth: 0,

    // 3. Transparency Logic: Selected point is solid, others are slightly faded
    pointBackgroundColor: quizVolumes.map((v, i) => {
        const baseColor = parseFloat(v) === 0 ? 'rgba(111, 66, 193, ' : // Purple
                          parseFloat(v) === parseFloat(V_eq.toFixed(2)) ? 'rgba(220, 53, 69, ' : // Red
                          parseFloat(v) === parseFloat(V_half.toFixed(2)) ? 'rgba(255, 153, 0, ' : // Orange
                          'rgba(40, 167, 69, '; // Green
        
        // If it's the selected one, use 1.0 opacity, otherwise 0.6
        return baseColor + (i === selectedIndex ? '1.0)' : '0.8)');
    }),
                    hitRadius: 15
                },
                {
                    label: 'Titration Curve',
                    data: curvePoints,
                    borderColor: isWeakBaseMode ? '#000080' : '#8B0000',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.2,
                    hitRadius: 0
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
        const ds = chart.data.datasets[0];

        // 1. Update the data reference for the quiz
        const pointData = ds.data[selectedIndex];
        selectedPoint = { x: pointData.x, y: parseFloat(pointData.y) };
        
        // 2. RE-MAP THE RADIUS (Force the size change)
        ds.pointRadius = ds.data.map((_, i) => i === selectedIndex ? 10 : 7);

        // 3. RE-MAP THE COLORS (Force the opacity change)
        ds.pointBackgroundColor = ds.data.map((v, i) => {
            const vol = parseFloat(v.x);
            let base;
            if (vol === 0) base = 'rgba(111, 66, 193, '; // Purple
            else if (Math.abs(vol - parseFloat(V_eq.toFixed(2))) < 0.01) base = 'rgba(220, 53, 69, '; // Red
            else if (Math.abs(vol - parseFloat(V_half.toFixed(2))) < 0.01) base = 'rgba(255, 153, 0, '; // Orange
            else base = 'rgba(40, 167, 69, '; // Green
            
            return base + (i === selectedIndex ? '1.0)' : '0.9)');
        });

        // 4. Update UI
        document.getElementById('question-prompt').innerHTML = 
            `<strong>Challenge:</strong> Calculate pH at <b>${selectedPoint.x} mL</b> added:`;
        document.getElementById('input-wrap').style.display = 'flex';
        document.getElementById('feedback').innerText = '';

        // 5. Render changes
        chart.update();
    }
}
        }
    });
}

function checkAnswer() {
    const userVal = parseFloat(document.getElementById('user-pH').value);
    const feedback = document.getElementById('feedback');
    
    if (isNaN(userVal)) {
        feedback.innerText = "Please enter a numeric pH value.";
        return;
    }

    // Calculate the 'official' answer for the specific volume clicked
    const correctPH = parseFloat(calculatePH(selectedPoint.x).toFixed(2));
    
    const diff = Math.abs(userVal - correctPH);
    const tolerance = 0.05; // Industry standard for pH calculation errors
    
    if (diff <= tolerance) {
        feedback.style.color = "#28a745";
        feedback.innerText = `Correct! The pH is ${correctPH}.`;
    } else {
        feedback.style.color = "#dc3545";
        // Call the hint logic
        provideHint(correctPH);
    }
}

function provideHint(correctPH) {
    const feedback = document.getElementById('feedback');
    const x = parseFloat(selectedPoint.x);
    const vEq = parseFloat(((Ca * Va) / Cb).toFixed(2));

    let hint = `Try again! `;
    
    if (x < 0.01) {
        hint += "Use the initial weak acid concentration and the equilibrium constant.";
    } else if (Math.abs(x - vEq) < 0.01) {
        hint += "At the equivalence point, only the conjugate is present.";
    } else if (x < vEq) {
        hint += "In the buffer region, use the Henderson-Hasselbalch equation.";
    } else {
        hint += "You have excess strong titrant; calculate pH from the excess moles.";
    }
    
    feedback.innerText = hint;
}

window.onload = setupNewProblem;
