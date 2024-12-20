// this is tab 3 js file
d3.csv("stance_percentages_monthly.csv").then(data => {
    // parse the data
    data.forEach(d => {
        d.month = isNaN(Date.parse(d.month)) ? new Date() : new Date(d.month); //debug, for data vailidation
        d["0"] = isNaN(+d["0"]) ? 0 : +d["0"]; // check numeric value
        d["1"] = isNaN(+d["1"]) ? 0 : +d["1"]; // check numeric value
        d["2"] = isNaN(+d["2"]) ? 0 : +d["2"]; // check numeric value
    });

    // normalize percentages
    // we want to sum of all different labels is 1
    data.forEach(d => {
        const total = d["0"] + d["1"] + d["2"];
        if (total > 0) {
            d["0"] = (d["0"] / total) * 100;
            d["1"] = (d["1"] / total) * 100;
            d["2"] = (d["2"] / total) * 100;
        }
    });

    //sources related
    const sources = Array.from(new Set(data.map(d => d.source)));
    const dropdown = d3.select("#stance-source-dropdown"); // drop down menu for sources
    dropdown.selectAll("option")
        .data(sources)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    //stacked area chart initialization
    //svg, scales and axis initialization
    const margin = { top: 20, right: 120, bottom: 50, left: 50 }; // change top value to align the webpage better
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // SVG container
    const svg = d3.select("#stance-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]).domain([48, 100]); // initialized y-axis slightly around 50 for better presentation
    const color = d3.scaleOrdinal()
        .domain(["0", "1", "2"])
        .range(["#c6c6c6", "#4caf50", "#f44336"]); //grey for neutral, green for positive attitude towards R, red for negative attitude towards R
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    svg.append("g").attr("class", "y-axis");

    // stacked area setting
    const area = d3.area()
        .x(d => x(d.data.month))
        .y0(d => Math.max(0, Math.min(height, y(d[0])))) // baseline for neutral
        .y1(d => Math.max(0, Math.min(height, y(d[1]))));

    
    // legend setting
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20},20)`);
    const labels = ["Neutral", "Positive", "Negative"]; // label name instead of 0,1,2
    const colors = ["#c6c6c6", "#4caf50", "#f44336"];

    labels.forEach((label, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(0,${i * 20})`);
        legendItem.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", colors[i]);
        legendItem.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .style("font-size", "12px")
            .text(label);
    });

    // graph presentation

    const update = source => {
        const filteredData = data.filter(d => d.source === source);

        // stacked data beased on source from dropdown
        const stackedData = d3.stack()
            .keys(["0", "1", "2"])
            .value((d, key) => d[key])
            (filteredData);
        x.domain(d3.extent(filteredData, d => d.month));
        svg.select(".x-axis").call(xAxis);
        svg.select(".y-axis").call(yAxis);

    
        // Debugging logs
        //console.log("X Domain:", x.domain());
        //console.log("Filtered Data:", filteredData);
        //console.log("Stacked Data:", stackedData);
        const areas = svg.selectAll(".area").data(stackedData);

        areas.enter()
            .append("path")
            .attr("class", "area")
            .merge(areas)
            .transition()
            .duration(750)
            .attr("fill", d => color(d.key))
            .attr("d", d => area(d));
        areas.exit().remove();
    };

    // initialization will be the first source-bbc
    update(sources[0]);

    // update dropdown change
    dropdown.on("change", function() {
        update(this.value);
    });
});
