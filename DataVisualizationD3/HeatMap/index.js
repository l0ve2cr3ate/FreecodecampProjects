// Read in the provided data:
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then(result => {
  let data = result;

  createHeatMap(data);
});

const createHeatMap = data => {
  const { monthlyVariance, baseTemperature } = data;

  const margin = {
    left: 80,
    right: 80,
    top: 80,
    bottom: 100
  };
  const width = 1200 - margin.left - margin.right;
  const height = 750 - margin.top - margin.bottom;

  // Create svg element and append it to the body
  let svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  // Get the yScale domain
  const yScaleDomain = d3.set(monthlyVariance.map(d => d.month)).values();
  // Create yScale from January to December
  const yScale = d3
    .scaleBand()
    // Reverse the months so January is on top instead of on the bottom
    .domain(yScaleDomain.reverse())
    .range([height - margin.top - margin.bottom, 0]);
  //.nice();

  chart
    .append("g")
    .attr("id", "y-axis")
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat(d => months[d - 1])
        // Remove the ticks from the ends of the axis.
        .tickSizeOuter(0)
    );

  // Create xScale
  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(monthlyVariance, m => m.year),
      d3.max(monthlyVariance, m => m.year)
    ])
    .range([0, width - margin.right - margin.left]);
  //.nice();

  chart
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom - margin.top})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat(d3.format("d"))
        .tickSizeOuter(0)
    ); // decimal notation, rounded to integer.

  // Create color scale
  const colorScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateRdYlBu)
    .domain([
      d3.max(monthlyVariance, m => m.variance),
      d3.min(monthlyVariance, m => m.variance)
    ]);

  const legendLength = 11;
  const legendItemWidth = 40;
  // Divide the range of the variance by the length of the legend.
  const legendItemSpread =
    (d3.min(monthlyVariance, m => m.variance) -
      d3.max(monthlyVariance, m => m.variance)) /
    legendLength;

  // Create an array of colors for the legend.
  const colors = yScale
    .domain()
    .map(
      month =>
        d3.min(monthlyVariance, m => m.variance) +
        parseInt(month) * -legendItemSpread
    )
    .reverse();

  // Add label/title to y-axis
  svg
    .append("g")
    .attr("transform", `translate(${margin.left / 3},${height / 2})`)
    .append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("class", "label-y-axis")
    .text("Month");

  // Add label/title to x-axis
  svg
    .append("g")
    .attr(
      "transform",
      `translate(${width / 2}, ${height - margin.bottom / 2 - 10})`
    )
    .append("text")
    .attr("text-anchor", "middle")
    .attr("class", "label-x-axis")
    .text("Year");

  // Add tooltip area to the page
  let tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

  // Draw legend
  const legend = svg
    .selectAll(".legend")
    .data(colors)
    .enter()
    .append("g")
    .attr("id", "legend")
    .attr("class", "legend")
    .attr(
      "transform",
      (d, i) => `translate(${-margin.left + i}, ${height - 25})`
    );

  // Draw legend colored rectangles
  legend
    .append("rect")
    .attr("x", (d, i) => margin.left * 2 + legendItemWidth * i)
    .attr("width", 40)
    .attr("height", 18)
    .style("fill", (d, i) => colorScale(colors[i]));

  // Draw legend text
  legend
    .append("text")
    .attr(
      "x",
      (d, i) => margin.left * 2 + legendItemWidth / 3 + legendItemWidth * i
    )
    .attr("y", -5)
    .style("font-size", "12px")
    .text((d, i) =>
      (
        baseTemperature +
        d3.min(monthlyVariance, m => m.variance) +
        legendItemSpread * (-i + 1)
      ).toFixed(1)
    );

  // Add title to chart and center title
  svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${margin.top - 40})`)
    .append("text")
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text("Monthly Global Land-Surface Temperature")
    .attr("id", "title");

  // Add description to chart and center it
  svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${margin.top - 15})`)
    .append("text")
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    // unicode for degree Celsius doesn't work as text, so add description as html
    .html("1753 - 2015: base temperature &#8451;")
    .attr("id", "description");

  // Create the HeatMap
  svg
    .selectAll("rect")
    .data(monthlyVariance, d => d.variance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("transform", `translate(${margin.left + 1}, ${margin.top})`)
    .attr("x", function(d) {
      return xScale(d.year);
    })
    .attr("y", d => yScale(d.month))
    .attr(
      "width",
      width /
        (d3.max(monthlyVariance, m => m.year) -
          d3.min(monthlyVariance, m => m.year))
    )
    .attr("height", yScale.bandwidth())
    .attr("data-month", d => d.month - 1)
    .attr("data-year", d => d.year)
    .attr("data-temp", d => baseTemperature + d.variance)
    .style("fill", d => colorScale(d.variance))
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 0.8)
    .on("mouseover", d => {
      tooltip
        .attr("data-year", d.year)
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip
        .html(
          `<span>${d.year} - ${months[d.month - 1]}</span><span>${(
            baseTemperature + d.variance
          ).toFixed(1)}&#8451;</span><span>${d.variance.toFixed(
            1
          )}&#8451;</span>`
        )
        .style("left", `${d3.event.pageX + 5}px`)
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function(d) {
      tooltip
        .transition()
        .duration(500)
        .style("opacity", 0);
    });
};
