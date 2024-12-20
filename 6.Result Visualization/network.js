// Load the data from final_result.csv
d3.csv("final_result.csv").then(data => {
    // Default parameters
    let a = -1; // Default value for a (negative)
    let b = 1;  // Default value for b (positive)

    // Create slider controls dynamically
    const container = d3.select("#network-chart").append("div").attr("class", "controls");

    // Slider for parameter a
    container.append("label").attr("for", "a-param").text("Positive Parameter: ");
    const aInput = container.append("input")
        .attr("type", "range")
        .attr("id", "a-param")
        .attr("min", "-10")
        .attr("max", "0")
        .attr("step", "0.1")
        .attr("value", a);
    const aValue = container.append("span").attr("id", "a-value").text(a);

    container.append("br");

    // Slider for parameter b
    container.append("label").attr("for", "b-param").text("Negative Parameter: ");
    const bInput = container.append("input")
        .attr("type", "range")
        .attr("id", "b-param")
        .attr("min", "0")
        .attr("max", "1")
        .attr("step", "0.1")
        .attr("value", b);
    const bValue = container.append("span").attr("id", "b-value").text(b);

    // Function to update the chart based on new a and b values
    function updateChart(a, b) {
        // Step 1: Aggregate predicted_label counts by country
        const aggregatedData = d3.rollups(
            data,
            v => ({
                count0: v.filter(d => +d.predicted_label === 0).length,
                count1: v.filter(d => +d.predicted_label === 1).length,
                count2: v.filter(d => +d.predicted_label === 2).length
            }),
            d => d.origin_country
        );

        // Step 2: Calculate stance score for each country
        const countries = aggregatedData.map(([country, counts]) => ({
            id: country,
            count0: counts.count0,
            count1: counts.count1,
            count2: counts.count2,
            stanceScore: (counts.count1 * a + counts.count2 * b) / (counts.count1 + counts.count2 || 1) // Avoid division by zero
        }));

        // Step 3: Define nodes and links for the network
        const russia = { id: "Russia", stanceScore: 0 }; // Russia as the central node
        const nodes = [russia, ...countries];
        const links = countries.map(country => ({
            source: "Russia",
            target: country.id,
            value: Math.abs(country.stanceScore) // Use stanceScore for edge weight
        }));

        // Update chart
        renderNetwork(nodes, links);
    }

    // Function to render the network
    function renderNetwork(nodes, links) {
    // Clear existing SVG
    d3.select("#network-chart").selectAll("svg").remove();

    const width = 1400;
    const height = 800;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select("#network-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // Create simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links)
            .id(d => d.id)
            .distance(d => Math.max(50, 1000 - d.value * 1000)) // Adjusted distance
        )
        .force("charge", d3.forceManyBody().strength(-300))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    // Add links
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    // Add nodes
    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 50)
        .attr("fill", d => color(d.id === "Russia" ? "Russia" : d.stanceScore))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Add labels for nodes (country names)
    const label = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x) // Placeholder; updated during simulation
        .attr("y", d => d.y) // Placeholder; updated during simulation
        .attr("dy",0) // Adjust position relative to nodes
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .attr("fill", "#fff")
        .text(d => d.id);

    node.append("title")
        .text(d => `${d.id}: Stance Score = ${d.stanceScore.toFixed(2)}`);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        // Update label positions
        label
            .attr("x", d => d.x)
            .attr("y", d => d.y - 15); // Position slightly above nodes
    });

    // Drag behavior
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
}

    // Initial chart render
    updateChart(a, b);

    // Event listeners for parameter inputs
    aInput.on("input", function () {
        a = +this.value;
        aValue.text(a);
        updateChart(a, b);
    });

    bInput.on("input", function () {
        b = +this.value;
        bValue.text(b);
        updateChart(a, b);
    });
}).catch(error => {
    console.error("Error loading CSV data:", error);
});
