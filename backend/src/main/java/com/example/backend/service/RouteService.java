package com.example.backend.service;

import com.example.backend.model.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Service
public class RouteService {
    private GraphData graph;

    @PostConstruct
    public void init() throws IOException {

        ObjectMapper mapper = new ObjectMapper();
        graph = mapper.readValue(new ClassPathResource("graph.json").getInputStream(), GraphData.class);
    }

    public Map<String, Object> calculate(int start, int end, String mode) {
        Map<Integer, Double> dists = new HashMap<>();
        Map<Integer, Integer> prev = new HashMap<>();
        PriorityQueue<NodeWeight> pq = new PriorityQueue<>(Comparator.comparingDouble(nw -> nw.weight));


        graph.getNodes().forEach(n -> dists.put(n.getId(), Double.MAX_VALUE));
        dists.put(start, 0.0);
        pq.add(new NodeWeight(start, 0.0));

        while (!pq.isEmpty()) {
            NodeWeight current = pq.poll();
            if (current.id == end) break;
            if (current.weight > dists.get(current.id)) continue;

            for (Edge e : graph.getEdges()) {
                int neighbor = -1;
                if (e.getFrom() == current.id) neighbor = e.getTo();
                else if (e.getTo() == current.id) neighbor = e.getFrom();

                if (neighbor != -1) {

                    double weight = mode.equals("distance") ? e.getDistance_km() : (e.getDistance_km() / Math.max(e.getSpeed_kmph(), 1));
                    double newDist = dists.get(current.id) + weight;

                    if (newDist < dists.get(neighbor)) {
                        dists.put(neighbor, newDist);
                        prev.put(neighbor, current.id);
                        pq.add(new NodeWeight(neighbor, newDist));
                    }
                }
            }
        }
        return formatPath(start, end, prev);
    }

    private Map<String, Object> formatPath(int start, int end, Map<Integer, Integer> prev) {
        List<Integer> path = new ArrayList<>();
        Integer curr = end;
        while (curr != null) {
            path.add(curr);
            curr = prev.get(curr);
        }
        Collections.reverse(path);

        Map<String, Object> response = new HashMap<>();
        response.add("path", path);
        return response;
    }

    private record NodeWeight(int id, double weight) {}
}
