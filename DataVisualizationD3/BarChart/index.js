// Read in the provided data:
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
).then(result => {
  let data = result.data;

  createBarChart(data);
});

const createBarChart = data => {
  const margin = {
    left: 80,
    right: 80,
    top: 60,
    bottom: 60
  };
  const width = 1000 - margin.left - margin.right; // 880px
  const height = 600 - margin.top - margin.bottom; // 480px

  // Get the first (oldest) date from the data for creating x-axis
  // data[0] = ["1947-01-01", 243.1]
  minDate = new Date(data[0][0]);

  // Get the last (latest) date from the data for creating x-axis
  maxDate = new Date(data[data.length - 1][0]);
  console.log(data);

  // Create svg element and append it to the body
  let svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Create yScale from 0 to max value of the data
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d[1])])
    .range([height - margin.top - margin.bottom, 0]);

  chart
    .append("g")
    .attr("id", "y-axis")
    .call(d3.axisLeft(yScale).tickFormat(d3.format(",.2r")));

  // Create xScale
  const xScale = d3
    .scaleTime()
    .domain([minDate, maxDate])
    .range([0, width - margin.right - margin.left]);

  chart
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom - margin.top})`)
    .call(d3.axisBottom(xScale).tickSizeOuter(0));

  // Add title to chart and center title
  svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${margin.top})`)
    .append("text")
    .attr("text-anchor", "middle")
    .style("font-size", "32px")
    .text("United States GDP")
    .attr("id", "title");

  // Add label/title to y-axis
  svg
    .append("g")
    .attr("transform", `translate(${margin.left / 3},${height / 2})`)
    .append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("class", "label-y-axis")
    .text("GDP - Billion USD");

  // Add label/title to x-axis
  svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height - margin.bottom / 4})`)
    .append("text")
    .attr("text-anchor", "middle")
    .attr("class", "label-x-axis")
    .text("Year");

  // Create tooltip
  const tooltip = d3
    .select(".bar-chart")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  // Create bar charts
  chart
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", "teal")
    .attr("data-date", d => d[0])
    .attr("data-gdp", d => d[1])
    .attr("x", (d, i) => xScale(Date.parse(d[0])))
    .attr("y", (d, i) => yScale(d[1]))
    .attr("width", width / data.length)
    .attr("height", (d, i) => {
      return height - margin.top - margin.bottom - yScale(d[1]);
    })
    .on("mouseover", (d, i) => {
      tooltip
        .transition()
        .duration(0)
        .style("left", `${xScale(Date.parse(d[0])) + 275}px`)

        .style("top", `${yScale(d[1]) + margin.top}px`)
        .style("opacity", 1);
      tooltip
        .html(
          `<span>${new Date(d[0]).toDateString()}</span><span>$${
            d[1]
          } billion</span>`
        )
        .attr("data-date", data[i][0]);
    })
    .on("mouseout", () => {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0);
    });
};
