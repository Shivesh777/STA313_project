// Initialize main variables and constants
const ENERGY_TYPES = {
    renewable: { color: '#4CAF50', icon: 'icons/renewable-icon.svg' },
    coal: { color: '#795548', icon: 'icons/coal-icon.svg' },
    hydro: { color: '#2196F3', icon: 'icons/hydro-icon.svg' },
    solar: { color: '#FFC107', icon: 'icons/solar-icon.svg' },
    wind: { color: '#00BCD4', icon: 'icons/wind-icon.svg' }
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all visualizations
    initializeCharts();
    initializeMap();
    initializeControls();
    initializeTableau();
});

// Chart Initialization Functions
function initializeCharts() {
    createPieChart();
    createTrendChart();
    createGaugeCharts();
    createRegionalCharts();
}

function createPieChart() {
    const width = document.querySelector('#pieChart').clientWidth;
    const height = width;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select('#pieChart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`);

    const pie = d3.pie()
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 0.9);

    // Sample data - replace with actual data
    const data = Object.keys(ENERGY_TYPES).map(type => ({
        type: type,
        value: Math.random() * 100
    }));

    const paths = svg.selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => ENERGY_TYPES[d.data.type].color)
        .attr('stroke', 'white')
        .style('stroke-width', '2px');

    // Add transitions
    paths.transition()
        .duration(1000)
        .attrTween('d', function(d) {
            const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
            return function(t) {
                return arc(interpolate(t));
            };
        });
}

function createTrendChart() {
    const margin = {top: 20, right: 20, bottom: 30, left: 50};
    const width = document.querySelector('#trendChart').clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select('#trendChart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Sample data - replace with actual data
    const data = Array.from({length: 20}, (_, i) => ({
        year: 2004 + i,
        values: Object.keys(ENERGY_TYPES).map(type => ({
            type: type,
            value: Math.random() * 100
        }))
    }));

    // Add lines for each energy type
    Object.keys(ENERGY_TYPES).forEach(type => {
        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.values.find(v => v.type === type).value));

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', ENERGY_TYPES[type].color)
            .attr('stroke-width', 2)
            .attr('d', line);
    });
}

function createGaugeCharts() {
    const gauges = {
        tempGauge: { value: 75, label: 'Average Temp' },
        cleanEnergyGauge: { value: 60, label: 'Clean Energy' },
        goalGauge: { value: 85, label: 'Goal Met' },
        emissionGauge: { value: 40, label: 'CO² Emission' }
    };

    Object.entries(gauges).forEach(([id, config]) => {
        createGauge(id, config);
    });
}

function createGauge(id, config) {
    const width = 150;
    const height = 150;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(`#${id}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`);

    // Create gauge arc
    const arc = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 0.9)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2);

    // Add background arc
    svg.append('path')
        .datum({endAngle: Math.PI / 2})
        .style('fill', '#ddd')
        .attr('d', arc);

    // Add value arc with animation
    const foreground = svg.append('path')
        .datum({endAngle: -Math.PI / 2})
        .style('fill', '#2196F3')
        .attr('d', arc);

    foreground.transition()
        .duration(1000)
        .attrTween('d', function(d) {
            const interpolate = d3.interpolate(
                d.endAngle,
                (-Math.PI / 2) + (Math.PI * (config.value / 100))
            );
            return function(t) {
                d.endAngle = interpolate(t);
                return arc(d);
            };
        });

    // Add text
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .style('font-size', '2em')
        .text(`${config.value}%`);
}

// Map Initialization and Interaction
function initializeMap() {
    const width = document.querySelector('#mapViz').clientWidth;
    const height = 400;

    const svg = d3.select('#mapViz')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const projection = d3.geoMercator()
        .scale(width / 2 / Math.PI)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load and render world map
    d3.json('https://unpkg.com/world-atlas/countries-110m.json')
        .then(function(world) {
            svg.selectAll('path')
                .data(topojson.feature(world, world.objects.countries).features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('class', 'country')
                .style('fill', '#ccc')
                .style('stroke', '#fff')
                .style('stroke-width', '0.5px');
        });
}

// Controls and Interactions
function initializeControls() {
    const yearSlider = document.getElementById('yearSlider');
    const toggleButton = document.getElementById('toggleView');

    yearSlider.addEventListener('input', function(e) {
        updateVisualization(parseInt(e.target.value));
    });

    toggleButton.addEventListener('click', function() {
        toggleView();
    });

    document.querySelectorAll('.energy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            updateEnergyTypeFilter(this.dataset.type);
        });
    });
}

function updateVisualization(year) {
    // Update all visualizations based on the selected year
    updateMap(year);
    updateCharts(year);
    updateGauges(year);
}

function toggleView() {
    const mapView = document.getElementById('mapViz');
    const chartView = document.getElementById('alternateView');
    
    mapView.style.display = mapView.style.display === 'none' ? 'block' : 'none';
    chartView.style.display = chartView.style.display === 'none' ? 'block' : 'none';
}

// Tableau Integration
function initializeTableau() {
    const vizUrl = 'YOUR_TABLEAU_URL';
    const containerDiv = document.getElementById('mapViz');
    const options = {
        hideTabs: true,
        hideToolbar: true,
        width: '100%',
        height: '100%'
    };
    
    const viz = new tableau.Viz(containerDiv, vizUrl, options);
}

// Data update functions
function updateMap(year) {
    // Update map colors based on selected year
}

function updateCharts(year) {
    // Update trend and pie charts based on selected year
}

function updateGauges(year) {
    // Update gauge values based on selected year
}

function updateEnergyTypeFilter(type) {
    // Update visualizations based on selected energy type
}