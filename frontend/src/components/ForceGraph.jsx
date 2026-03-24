import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function ForceGraph({ data, onNodeClick }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // 컨테이너 크기 감지
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.max(500, entry.contentRect.height),
        });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // D3 force simulation
  useEffect(() => {
    if (!data || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    // 줌 설정
    const g = svg.append("g");
    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    // 유사도 → 선 두께/투명도 스케일
    const similarities = data.edges.map((e) => e.similarity);
    const minSim = d3.min(similarities) || 0;
    const maxSim = d3.max(similarities) || 1;

    const strokeScale = d3.scaleLinear().domain([minSim, maxSim]).range([1, 5]);

    const opacityScale = d3
      .scaleLinear()
      .domain([minSim, maxSim])
      .range([0.2, 0.8]);

    // 색상 스케일 (book_id 기준)
    const bookIds = [...new Set(data.nodes.map((n) => n.book_id))];
    const colorPalette = [
      "#e6a532",
      "#b48859",
      "#c19d72",
      "#8b5e41",
      "#d3b997",
      "#f0bf63",
      "#a7754d",
      "#724d39",
      "#5e4031",
      "#f7d89e",
    ];
    const colorScale = d3.scaleOrdinal().domain(bookIds).range(colorPalette);

    // 시뮬레이션
    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.edges)
          .id((d) => d.id)
          .distance((d) => 150 * (1 - d.similarity))
          .strength((d) => d.similarity),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // 엣지 그리기
    const link = g
      .append("g")
      .selectAll("line")
      .data(data.edges)
      .join("line")
      .attr("stroke", "#d3b997")
      .attr("stroke-width", (d) => strokeScale(d.similarity))
      .attr("stroke-opacity", (d) => opacityScale(d.similarity));

    // 엣지 위 유사도 라벨
    const linkLabel = g
      .append("g")
      .selectAll("text")
      .data(data.edges)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#a7754d")
      .attr("opacity", 0)
      .text((d) => `${(d.similarity * 100).toFixed(0)}%`);

    // 노드 그룹
    const node = g
      .append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );
    // 노드 원
    node
      .append("circle")
      .attr("r", (d) => (d.rating ? 14 + d.rating * 3 : 20))
      .attr("fill", (d) => colorScale(d.book_id))
      .attr("stroke", "#fdf8f0")
      .attr("stroke-width", 3)
      .attr("opacity", 0.9);

    // 노드 라벨 (책 제목)
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => (d.rating ? 14 + d.rating * 3 : 20) + 16)
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("fill", "#5e4031")
      .text((d) =>
        d.title.length > 10 ? d.title.slice(0, 10) + "…" : d.title,
      );

    // 호버 효과
    node
      .on("mouseover", function (event, d) {
        // 연결된 엣지 강조
        link
          .attr("stroke-opacity", (l) =>
            l.source.id === d.id || l.target.id === d.id ? 1 : 0.05,
          )
          .attr("stroke", (l) =>
            l.source.id === d.id || l.target.id === d.id
              ? "#e6a532"
              : "#d3b997",
          );

        // 유사도 라벨 표시
        linkLabel.attr("opacity", (l) =>
          l.source.id === d.id || l.target.id === d.id ? 1 : 0,
        );

        // 비연결 노드 흐리게
        const connectedIds = new Set();
        connectedIds.add(d.id);
        data.edges.forEach((e) => {
          const src = typeof e.source === "object" ? e.source.id : e.source;
          const tgt = typeof e.target === "object" ? e.target.id : e.target;
          if (src === d.id) connectedIds.add(tgt);
          if (tgt === d.id) connectedIds.add(src);
        });

        node.attr("opacity", (n) => (connectedIds.has(n.id) ? 1 : 0.15));

        // 현재 노드 확대
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", (d) => (d.rating ? 14 + d.rating * 3 : 20) + 5);
      })
      .on("mouseout", function () {
        link
          .attr("stroke-opacity", (d) => opacityScale(d.similarity))
          .attr("stroke", "#d3b997");
        linkLabel.attr("opacity", 0);
        node.attr("opacity", 1);
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", (d) => (d.rating ? 14 + d.rating * 3 : 20));
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        if (onNodeClick) onNodeClick(d);
      });

    // 시뮬레이션 tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      linkLabel
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2);

      node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    });

    return () => simulation.stop();
  }, [data, dimensions, onNodeClick]);

  return (
    <div ref={containerRef} className="w-full h-[600px]">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="rounded-xl"
      />
    </div>
  );
}
