// Coffee Temperature Tracker JavaScript

class CoffeeTracker {
    constructor() {
        this.selectedMug = 'ceramic';
        this.mugTypes = {
            "ceramic": {"name": "Ceramic Mug", "cooling_constant": 0.05, "color": "#D2691E", "description": "Classic ceramic - good heat retention", "thermal_mass": "Medium"},
            "glass": {"name": "Glass Mug", "cooling_constant": 0.08, "color": "#87CEEB", "description": "Clear glass - faster cooling", "thermal_mass": "Low"},
            "metal": {"name": "Metal Travel Mug", "cooling_constant": 0.03, "color": "#C0C0C0", "description": "Stainless steel - excellent insulation", "thermal_mass": "High"},
            "paper": {"name": "Paper Cup", "cooling_constant": 0.12, "color": "#DEB887", "description": "Disposable - poor insulation", "thermal_mass": "Very Low"},
            "double_wall": {"name": "Double-Wall Glass", "cooling_constant": 0.025, "color": "#E6E6FA", "description": "Premium insulation", "thermal_mass": "High"}
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.selectMug('ceramic'); // Default selection
        this.initChart();
    }
    
    setupEventListeners() {
        // Mug selection with touch support
        document.querySelectorAll('.mug-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const mugType = e.currentTarget.dataset.mug;
                this.selectMug(mugType);
            });
            
            // Prevent double-tap zoom on mobile
            option.addEventListener('touchend', (e) => {
                e.preventDefault();
                const mugType = e.currentTarget.dataset.mug;
                this.selectMug(mugType);
            });
        });
        
        // Calculate button
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculateCooling();
        });
        
        // Input validation
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', this.validateInput);
        });
    }
    
    selectMug(mugType) {
        // Update UI
        document.querySelectorAll('.mug-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        document.querySelector(`[data-mug="${mugType}"]`).classList.add('selected');
        
        // Update selected mug
        this.selectedMug = mugType;
        this.updateMugInfo();
    }
    
    updateMugInfo() {
        const mugData = this.mugTypes[this.selectedMug];
        const infoElement = document.getElementById('selected-mug-info');
        
        infoElement.innerHTML = `
            <div class="selected-mug-details">
                <h4>${mugData.name}</h4>
                <p><strong>Cooling Constant:</strong> k = ${mugData.cooling_constant}</p>
                <p><strong>Thermal Mass:</strong> ${mugData.thermal_mass}</p>
                <p><strong>Description:</strong> ${mugData.description}</p>
                <div class="physics-note">
                    <small>Lower k = slower cooling (better insulation)<br>
                    Higher k = faster cooling (poor insulation)</small>
                </div>
            </div>
        `;
    }
    
    validateInput(e) {
        const input = e.target;
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        
        if (value < min || value > max || isNaN(value)) {
            input.style.borderColor = '#ff6b6b';
        } else {
            input.style.borderColor = '#51cf66';
        }
    }
    
    async calculateCooling() {
        const button = document.getElementById('calculate-btn');
        button.classList.add('loading');
        
        try {
            // Get input values
            const coffeeTemp = parseFloat(document.getElementById('coffee-temp').value);
            const roomTemp = parseFloat(document.getElementById('room-temp').value);
            const duration = parseFloat(document.getElementById('duration').value);
            
            // Validate inputs
            if (isNaN(coffeeTemp) || isNaN(roomTemp) || isNaN(duration)) {
                throw new Error('Please enter valid numbers for all parameters');
            }
            
            if (coffeeTemp <= roomTemp) {
                throw new Error('Coffee temperature must be higher than room temperature');
            }
            
            // Send calculation request
            const response = await fetch('/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    coffee_temp: coffeeTemp,
                    room_temp: roomTemp,
                    duration: duration,
                    mug_type: this.selectedMug
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayResults(data);
                this.updateChart(data.plot_data);
            } else {
                throw new Error(data.error);
            }
            
        } catch (error) {
            this.displayError(error.message);
        } finally {
            button.classList.remove('loading');
        }
    }
    
    displayResults(data) {
        const resultsElement = document.getElementById('results-content');
        
        const timeToIdealText = data.time_to_ideal 
            ? `${data.time_to_ideal} minutes`
            : 'Stays above ideal temp';
        
        resultsElement.innerHTML = `
            <div class="results-grid">
                <div class="result-item">
                    <span class="result-value">${data.final_temp}°C</span>
                    <div class="result-label">Final Temperature</div>
                </div>
                <div class="result-item">
                    <span class="result-value">${data.temp_drop}°C</span>
                    <div class="result-label">Temperature Drop</div>
                </div>
                <div class="result-item">
                    <span class="result-value">${timeToIdealText}</span>
                    <div class="result-label">Perfect Drinking Time</div>
                </div>
                <div class="result-item">
                    <span class="result-value">${data.cooling_constant}</span>
                    <div class="result-label">Cooling Constant (k)</div>
                </div>
            </div>
            
            <div class="analysis-section">
                <h4>Temperature Timeline</h4>
                <table class="timeline-table">
                    <thead>
                        <tr>
                            <th>Time (min)</th>
                            <th>Temperature (°C)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.temp_timeline.map(point => 
                            `<tr><td>${point.time}</td><td>${point.temperature}</td></tr>`
                        ).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="physics-section">
                <h4>Physics Explanation</h4>
                <p>${data.physics_explanation}</p>
                <p><strong>Mug:</strong> ${data.mug_name}</p>
                <p>The cooling rate depends on the mug material and design. 
                ${data.mug_name.toLowerCase()} provides specific thermal properties that affect 
                how quickly your coffee reaches the perfect drinking temperature.</p>
            </div>
        `;
    }
    
    displayError(message) {
        const resultsElement = document.getElementById('results-content');
        resultsElement.innerHTML = `
            <div class="error-message">
                <h4>Calculation Error</h4>
                <p>${message}</p>
                <p>Please check your input values and try again.</p>
            </div>
        `;
    }
    
    initChart() {
        const layout = {
            title: 'Coffee Cooling Curve',
            xaxis: { title: 'Time (minutes)' },
            yaxis: { title: 'Temperature (°C)' },
            paper_bgcolor: 'rgba(245,245,220,0.95)',
            plot_bgcolor: 'rgba(255,255,255,0.9)',
            font: { color: '#2C1810' }
        };
        
        Plotly.newPlot('temperature-chart', [], layout);
    }
    
    updateChart(plotData) {
        const traces = [
            {
                x: plotData.time,
                y: plotData.temperature,
                type: 'scatter',
                mode: 'lines',
                name: 'Coffee Temperature',
                line: { color: plotData.mug_color, width: 3 }
            },
            {
                x: [plotData.time[0], plotData.time[plotData.time.length - 1]],
                y: [plotData.room_temp, plotData.room_temp],
                type: 'scatter',
                mode: 'lines',
                name: `Room Temperature (${plotData.room_temp}°C)`,
                line: { color: 'blue', dash: 'dash', width: 2 }
            },
            {
                x: [plotData.time[0], plotData.time[plotData.time.length - 1]],
                y: [plotData.ideal_temp, plotData.ideal_temp],
                type: 'scatter',
                mode: 'lines',
                name: `Ideal Drinking Temp (${plotData.ideal_temp}°C)`,
                line: { color: 'green', dash: 'dot', width: 2 }
            }
        ];
        
        // Mobile-optimized layout
        const isMobile = window.innerWidth <= 768;
        
        const layout = {
            title: {
                text: 'Coffee Cooling Curve',
                font: { size: isMobile ? 14 : 16 }
            },
            xaxis: { 
                title: { 
                    text: 'Time (minutes)',
                    font: { size: isMobile ? 12 : 14 }
                },
                tickfont: { size: isMobile ? 10 : 12 }
            },
            yaxis: { 
                title: { 
                    text: 'Temperature (°C)',
                    font: { size: isMobile ? 12 : 14 }
                },
                tickfont: { size: isMobile ? 10 : 12 }
            },
            paper_bgcolor: 'rgba(245,245,220,0.95)',
            plot_bgcolor: 'rgba(255,255,255,0.9)',
            font: { color: '#2C1810', size: isMobile ? 10 : 12 },
            legend: { 
                x: isMobile ? 0.02 : 0.7, 
                y: isMobile ? 0.98 : 0.9,
                font: { size: isMobile ? 9 : 11 },
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: 'rgba(139,69,19,0.3)',
                borderwidth: 1
            },
            margin: {
                l: isMobile ? 50 : 60,
                r: isMobile ? 20 : 40,
                t: isMobile ? 40 : 50,
                b: isMobile ? 50 : 60
            }
        };
        
        const config = {
            responsive: true,
            displayModeBar: !isMobile, // Hide toolbar on mobile
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
            displaylogo: false
        };
        
        Plotly.newPlot('temperature-chart', traces, layout, config);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CoffeeTracker();
});