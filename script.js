
const APP_COLORS = {
    primary: '#4CAF50',    // Green
    secondary: '#2196F3',  // Blue
    accent: '#FFC107',     // Amber
    danger: '#F44336',     // Red
    text: '#333333',       // Dark gray
    background: '#FFFFFF', // White
    chartColors: ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0']
};


const healthData = {
    nutrition: {
        proteins: 0,
        carbs: 0,
        fats: 0
    },
    calories: {
        goal: 2000,
        consumed: 0
    },
    sleep: {
        records: [],
        average: 0
    }
};

// random data for inital loading
const dummyData = {
    nutrition: {
        proteins: 65,
        carbs: 240,
        fats: 55
    },
    calories: {
        goal: 2000,
        consumed: 1450
    },
    sleep: {
        records: [8.5, 6.8, 8.0, 7.2, 6.5, 8.5, 7.8, 9.5],
        average: 8.4
    }
};

function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
    }
}
document.getElementById('nutrition-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const foodItem = this.querySelector('input[type="text"]').value;
    const portion = parseFloat(this.querySelector('input[type="number"]').value);
    
    
    const nutritionInfo = calculateNutrition(foodItem, portion);
    updateNutritionStats(nutritionInfo);
});

function calculateNutrition(food, portion) {
    
    return {
        proteins: portion * 0.2,
        carbs: portion * 0.5,
        fats: portion * 0.3
    };
}

function updateNutritionStats(info) {
    healthData.nutrition.proteins += info.proteins;
    healthData.nutrition.carbs += info.carbs;
    healthData.nutrition.fats += info.fats;
    
    document.querySelector('#nutrition-stats .stat:nth-child(1) p').textContent = 
        `${healthData.nutrition.proteins.toFixed(1)}g`;
    document.querySelector('#nutrition-stats .stat:nth-child(2) p').textContent = 
        `${healthData.nutrition.carbs.toFixed(1)}g`;
    document.querySelector('#nutrition-stats .stat:nth-child(3) p').textContent = 
        `${healthData.nutrition.fats.toFixed(1)}g`;
}


function updateCalories(calories) {
    healthData.calories.consumed += calories;
    const remaining = healthData.calories.goal - healthData.calories.consumed;
    
    document.getElementById('calories-consumed').textContent = healthData.calories.consumed;
    document.getElementById('calories-remaining').textContent = remaining;
    
    const progress = (healthData.calories.consumed / healthData.calories.goal) * 100;
    document.querySelector('.progress').style.width = `${Math.min(progress, 100)}%`;
}


document.getElementById('sleep-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const sleepTime = document.getElementById('sleep-time').value;
    const wakeTime = document.getElementById('wake-time').value;
    
    const sleepDuration = calculateSleepDuration(sleepTime, wakeTime);
    updateSleepStats(sleepDuration);
});

function calculateSleepDuration(sleep, wake) {
    const sleepDate = new Date(`2025-01-01 ${sleep}`);
    const wakeDate = new Date(`2025-01-01 ${wake}`);
    
    if (wakeDate < sleepDate) {
        wakeDate.setDate(wakeDate.getDate() + 1);
    }
    
    return (wakeDate - sleepDate) / (1000 * 60 * 60); 
}

function updateSleepStats(duration) {
    healthData.sleep.records.push(duration);
    const avg = healthData.sleep.records.reduce((a, b) => a + b) / healthData.sleep.records.length;
    healthData.sleep.average = avg;
    
    const hours = Math.floor(avg);
    const minutes = Math.round((avg - hours) * 60);
    
    document.getElementById('avg-sleep').textContent = `${hours}h ${minutes}m`;
    document.getElementById('sleep-quality').textContent = 
        duration >= 7 ? 'Good' : duration >= 6 ? 'Fair' : 'Poor';
}


function initializeCharts() {
    
    const nutritionCtx = document.getElementById('nutrition-chart').getContext('2d');
    new Chart(nutritionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Proteins', 'Carbs', 'Fats'],
            datasets: [{
                data: [
                    dummyData.nutrition.proteins,
                    dummyData.nutrition.carbs,
                    dummyData.nutrition.fats
                ],
                backgroundColor: APP_COLORS.chartColors.slice(0, 3),
                borderWidth: 2,
                borderColor: APP_COLORS.background
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });

    
    const sleepCtx = document.getElementById('sleep-chart').getContext('2d');
    new Chart(sleepCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Hours of Sleep',
                data: dummyData.sleep.records,
                borderColor: APP_COLORS.secondary,
                backgroundColor: APP_COLORS.secondary + '20',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: APP_COLORS.background
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 12,
                    grid: {
                        color: '#eee'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Load user-specific data
function loadUserData() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const userData = JSON.parse(localStorage.getItem(`userData_${currentUser}`));
    if (userData) {
        healthData.nutrition = userData.nutrition;
        healthData.calories = userData.calories;
        healthData.sleep = userData.sleep;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Populate with dummy data for demonstration
    Object.assign(healthData, dummyData);
    loadUserData();
    initializeCharts();
    updateDisplay();
});

// Local Storage functions
function saveData() {
    localStorage.setItem('healthData', JSON.stringify(healthData));
}

function loadData() {
    const saved = localStorage.getItem('healthData');
    if (saved) {
        Object.assign(healthData, JSON.parse(saved));
        updateNutritionStats(healthData.nutrition);
        updateCalories(0); // Update display only
        updateSleepStats(healthData.sleep.average);
    }
}

// Save user-specific data
function saveUserData() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        localStorage.setItem(`userData_${currentUser}`, JSON.stringify(healthData));
    }
}

// Update all displays
function updateDisplay() {
    // Update nutrition display
    document.querySelector('#nutrition-stats .stat:nth-child(1) p').textContent = 
        `${healthData.nutrition.proteins.toFixed(1)}g`;
    document.querySelector('#nutrition-stats .stat:nth-child(2) p').textContent = 
        `${healthData.nutrition.carbs.toFixed(1)}g`;
    document.querySelector('#nutrition-stats .stat:nth-child(3) p').textContent = 
        `${healthData.nutrition.fats.toFixed(1)}g`;

    // Update calories display
    document.getElementById('calories-consumed').textContent = healthData.calories.consumed;
    document.getElementById('calories-remaining').textContent = 
        healthData.calories.goal - healthData.calories.consumed;

    // Update sleep display if there are records
    if (healthData.sleep.records.length > 0) {
        const hours = Math.floor(healthData.sleep.average);
        const minutes = Math.round((healthData.sleep.average - hours) * 60);
        document.getElementById('avg-sleep').textContent = `${hours}h ${minutes}m`;
    }
}