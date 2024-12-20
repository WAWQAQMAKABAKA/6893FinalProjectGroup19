document.addEventListener("DOMContentLoaded", () => {
    // 定义图表尺寸
    const margin = { top: 20, right: 60, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // 创建 SVG 容器
    const svg = d3.select("#country-stance-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 添加 x 和 y 轴
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);
    const yAxis = svg.append("g");

    // 添加网格线
    const grid = svg.append("g").attr("class", "grid");

    function drawGrid() {
        // 绘制水平网格线
        const yGrid = grid.selectAll(".y-grid-line")
            .data(y.ticks())
            .join("line")
            .attr("class", "y-grid-line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d => y(d))
            .attr("y2", d => y(d))
            .attr("stroke", "#e0e0e0")
            .attr("stroke-width", 0.5)
            .attr("stroke-dasharray", "4 2");

        // 绘制垂直网格线
        const xGrid = grid.selectAll(".x-grid-line")
            .data(x.ticks())
            .join("line")
            .attr("class", "x-grid-line")
            .attr("y1", 0)
            .attr("y2", height)
            .attr("x1", d => x(d))
            .attr("x2", d => x(d))
            .attr("stroke", "#e0e0e0")
            .attr("stroke-width", 0.5)
            .attr("stroke-dasharray", "4 2");
    }

    // 读取 CSV 数据
    d3.csv("final_result.csv").then(data => {
        // 数据预处理
        data.forEach(d => {
            d.publish_date = d3.timeParse("%Y-%m")(d.publish_date); // 转换日期格式
            d.predicted_label = +d.predicted_label; // 转换为数值
        });

        // 获取国家列表
        const countries = Array.from(new Set(data.map(d => d.origin_country)));

        // 创建多选框
        const countrySelection = d3.select("#country-stance")
            .append("div")
            .selectAll("label")
            .data(countries)
            .enter()
            .append("label");

        countrySelection.append("input")
            .attr("type", "checkbox")
            .attr("value", d => d)
            .on("change", updateChart);

        countrySelection.append("span").text(d => d);

        // 创建 a, b, c 输入框
        const controls = d3.select("#country-stance").append("div").attr("id", "controls");
        controls.append("label").text("a: ");
        controls.append("input").attr("id", "a").attr("type", "number").attr("value", 1).on("input", updateChart);
        controls.append("label").text("b: ");
        controls.append("input").attr("id", "b").attr("type", "number").attr("value", 1).on("input", updateChart);
        controls.append("label").text("c: ");
        controls.append("input").attr("id", "c").attr("type", "number").attr("value", 1).on("input", updateChart);

        // 图例颜色
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // 更新图表
        function updateChart() {
            // 获取用户选择的国家
            const selectedCountries = countries.filter(country =>
                d3.select(`input[value="${country}"]`).property("checked")
            );

            // 获取 a, b, c 的值
            const a = +d3.select("#a").property("value");
            const b = +d3.select("#b").property("value");
            const c = +d3.select("#c").property("value");

            // 按国家分组计算 stance score
            const nestedData = selectedCountries.map(country => {
                const filteredData = data.filter(d => d.origin_country === country);

                const aggregatedData = d3.rollup(
                    filteredData,
                    group => a * group.filter(d => d.predicted_label === 0).length +
                             b * group.filter(d => d.predicted_label === 1).length +
                             c * group.filter(d => d.predicted_label === 2).length,
                    d => d.publish_date
                );

                const aggregatedArray = Array.from(aggregatedData, ([date, value]) => ({ date, value }))
                    .sort((a, b) => a.date - b.date);

                return { country, data: aggregatedArray };
            });

            // 更新 x 轴
            x.domain(d3.extent(data, d => d.publish_date));
            xAxis.call(d3.axisBottom(x));

            // 动态调整 y 轴的最大值
            const maxY = d3.max(nestedData.flatMap(d => d.data.map(v => v.value))) || 0;
            y.domain([0, maxY]);
            yAxis.call(d3.axisLeft(y));

            // 绘制网格线
            drawGrid();

            // 绘制折线图
            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.value));

            const lines = svg.selectAll(".line")
                .data(nestedData, d => d.country);

            lines.enter()
                .append("path")
                .attr("class", "line")
                .merge(lines)
                .attr("fill", "none")
                .attr("stroke", d => color(d.country))
                .attr("stroke-width", 1.5)
                .attr("d", d => line(d.data));

            lines.exit().remove();

            // 更新图例
            const legend = svg.selectAll(".legend")
                .data(nestedData, d => d.country);

            legend.enter()
                .append("text")
                .attr("class", "legend")
                .merge(legend)
                .attr("x", width - 100)
                .attr("y", (d, i) => i * 20)
                .attr("fill", d => color(d.country))
                .text(d => d.country);

            legend.exit().remove();
        }

        // 初始化图表
        updateChart();
    });
});
