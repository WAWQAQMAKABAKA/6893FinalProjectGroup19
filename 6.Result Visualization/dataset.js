document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tabs a");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
      tab.addEventListener("click", (event) => {
        event.preventDefault();
        tabs.forEach(t => t.classList.remove("active"));
        tabContents.forEach(content => content.classList.remove("active"));
        const targetTab = tab.getAttribute("data-tab");
        tab.classList.add("active");
        document.getElementById(targetTab).classList.add("active");
      });
    });
    // script refer to the visualization page tab 2
    // tab3 and tab 4 has their own separated script page, please refer them in the folder

    // load data
    d3.csv("processed_filtered_data.csv").then(data => {
      // parse the data
      data.forEach(d => {
        d.article_count = +d.article_count;
        d.year_month = new Date(d.year_month + "-01"); //converting date // orginal date format YYYY-MM
      });

      const sources = Array.from(new Set(data.map(d => d.source)));

      //dropdown
      const dropdown = d3.select("#source-dropdown");
      dropdown.selectAll("option.source-option")
        .data(sources)
        .enter()
        .append("option")
        .attr("class", "source-option")
        .attr("value", d => d)
        .text(d => d);

      // chart size
      // setting up chart size and initial axises setting
      const margin = { top: 20, right: 100, bottom: 50, left: 50 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      //creating SVG container
      const svg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleTime().range([0, width]);
      const y = d3.scaleLinear().range([height, 0]);
      const color = d3.scaleOrdinal(d3.schemeCategory10);
      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y);

      svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
      svg.append("g").attr("class", "y-axis");

      //legend container
      const legend = d3.select("#legend").append("svg")
        .attr("width", 200)
        .attr("height", sources.length * 20);



      // graph presentation

      // after picking the source and update them
      const update = visibleSources => {
        const filteredData = visibleSources.includes("all")
          ? data
          : data.filter(d => visibleSources.includes(d.source));

        // group data by source
        // original dataset is have source article count for each time period
        const groupedData = d3.groups(filteredData, d => d.source);

        //scales changes goiing with update
        x.domain(d3.extent(data, d => d.year_month));
        y.domain([0, d3.max(filteredData, d => d.article_count)]);
        svg.select(".x-axis").call(xAxis);
        svg.select(".y-axis").call(yAxis);

        const lines = svg.selectAll(".line").data(groupedData, d => d[0]);

        lines.enter()
          .append("path")
          .attr("class", "line")
          .merge(lines)
          .transition()
          .duration(750)
          .attr("fill", "none")
          .attr("stroke", d => color(d[0]))
          .attr("stroke-width", 2)
          .attr("d", d => d3.line()
            .x(d => x(d.year_month))
            .y(d => y(d.article_count))
            (d[1]));
        lines.exit().remove();


        //appending the legends
        const legendItems = legend.selectAll(".legend-item").data(groupedData, d => d[0]);
        const legendEnter = legendItems.enter()
          .append("g")
          .attr("class", "legend-item")
          .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legendEnter.append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", d => color(d[0]));

        legendEnter.append("text")
          .attr("x", 15)
          .attr("y", 10)
          .text(d => d[0]);

        legendItems.exit().remove();
      };

      // initialize page would be showing all sources on the page
      //note: NYT is included in this part
      update(["all"]);
      dropdown.on("change", function() {
        const selected = Array.from(this.selectedOptions).map(option => option.value);
        update(selected);
      });
    });
  });
