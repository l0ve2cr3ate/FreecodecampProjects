// Read in the provided data:
d3.json(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
).then(result => {
  let data = result;

  createTreeMap(data);
});

const createTreeMap = data => {
  const margin = {
    left: 60,
    right: 60,
    top: 60,
    bottom: 60
  };
  const width = 960 - margin.left - margin.right;
  const height = 1000 - margin.top - margin.bottom;

  let svg = d3
    .select("main")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Colors to color the treemap and for the legend.
  const colors = [
    "#1b70fc",
    "#e509ae",
    "#88fc07",
    "#07a2e6",
    "#b21bff",
    "#7b5057",
    "#393b79",
    "#f92b75",
    "#59c3fa",
    "#3d88d8",
    "#a6761d",
    "#40835f",
    "#78579e",
    "#4468ae",
    "#008080",
    "#75671b",
    "#44A580",
    "#66a61e"
  ];

  // Get text for legend items.
  const legendItemText = data.children.map(el => el.name);

  // Create a colorScale with the colors and the text for the legend items.
  const colorScale = d3
    .scaleOrdinal()
    .domain(legendItemText)
    .range(colors);

  // Add tooltip area to the page
  let tooltip = d3
    .select("main")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

  // Initialize the treemap with width and height properties
  const treemap = d3
    .treemap()
    // height - 75 creates some room for the legend
    .size([width, height - 75])
    .padding(2);

  // Create a root node and determine the size and placement of the boxes
  const root = d3
    .hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  // Build a treemap from the root
  treemap(root);

  // Draw the TreeMap
  let nodes = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  nodes
    .append("rect")
    .attr("class", "tile")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("data-name", d => d.data.name)
    .attr("data-category", d => d.data.category)
    .attr("data-value", d => d.data.value)
    .attr("fill", d => colorScale(d.data.category))
    .on("mouseover", d => {
      tooltip
        .attr("data-value", d.data.value)
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip
        .html(
          `<span>Name: ${d.data.name}</span><span>Category: ${d.data.category}</span><span>Value: ${d.data.value}</span>`
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

  nodes
    .append("text")
    .selectAll("tspan")
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append("tspan")
    .style("font-size", "0.55rem")
    .attr("fill", "white")
    .attr("x", 4)
    .attr("y", (d, i) => 14 + i * 10)
    .text(d => d);

  const legendItemWidth = 40;

  // Draw legend
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(0,${height - 50})`);

  // Draw legend colored rectangles
  legend
    .selectAll("rect")
    .data(colors)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", (d, i) => margin.left + legendItemWidth * i)
    .attr("width", 40)
    .attr("height", 18)
    .style("fill", (d, i) => colors[i]);

  // Draw legend text
  legend
    .selectAll("text")
    .data(legendItemText)
    .enter()
    .append("text")
    .attr(
      "x",
      (d, i) => margin.left + legendItemWidth / 4 + legendItemWidth * i
    )
    .attr("y", -5)
    .style("font-size", "10px")
    .text(d => d);
};
