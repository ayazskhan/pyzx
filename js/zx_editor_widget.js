// When the next line is uncommented, the module is reloaded every time the javascript is imported
// This is useful for development.
require.undef('make_editor')

define('make_editor', ['d3'], function(d3) {
        
    // styling functions
    function nodeColor(t) {
        if (t == 0) return "black";
        else if (t == 1) return "green";
        else if (t == 2) return "red";
        else if (t == 3) return "yellow";
    }

    function edgeColor(t,selected) {
        if (selected) return "#083bd4";
        if (t == 1) return "black";
        else if (t == 2) return "#08f";
    }

    function edgeWidth(selected) {
        if (selected) return "stroke-width: 2.5px";
        return "stroke-width: 1.5px";
    }

    function nodeStyle(selected) {
        return selected ? "stroke-width: 2px; stroke: #00f" : "stroke-width: 1.5px";
    }

    function prepareGraph(graph) {
        var ntab = {};
        var max_name = -1;
        graph.nodes.forEach(function(d) {
            ntab[d.name] = d;
            if (d.name > max_name) max_name = d.name;
            d.selected = false;
            d.previouslySelected = false;
            d.nhd = [];
        });
        graph.links.forEach(function(d) {
            var s = ntab[d.source];
            var t = ntab[d.target];
            d.source = s;
            d.target = t;
            s.nhd.push(t);
            t.nhd.push(s);
            d.selected = false;
        });
        return max_name;
    }

    function showGraph(tag, model, auto_hbox, show_labels) {
        var shiftKey;

        // SETUP SVG ITEMS

        var svg = d3.select(tag)
            .attr("tabindex", 1)
            .on("keydown.brush", function() {shiftKey = d3.event.shiftKey || d3.event.metaKey;})
            .on("keyup.brush", function() {shiftKey = d3.event.shiftKey || d3.event.metaKey;})
            .each(function() { this.focus(); })
            .append("svg")
            .attr("style", "max-width: none; max-height: none")
            .attr("width", model.width)
            .attr("height", model.height);
        
        var brush = svg.append("g")
            .attr("class", "brush");
        
        var link = svg.append("g")
                .attr("class", "link")
                .selectAll("line")

        var node = svg.append("g")
                .attr("class", "node")
                .selectAll("g")
        
        const dragLine = svg.append('line')
                .attr('id', 'dragLine')
                .attr('class', 'link hidden')
                .attr("stroke", edgeColor(1))
                .attr("style", "stroke-width: 1.5px;pointer-events: none;")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", 0);

        var mousedownNode = null;
        
        function resetMouseVars() {
            mousedownNode = null;
        }

        
        const vertexTypeBox = svg.append('g').attr('id', 'vertexTypeButton');
        vertexTypeBox.append('rect')
                .attr('x',0)
                .attr('y',model.height-24)
                .attr('width', 100).attr('height', 24)
                .attr("stroke", "black")
                .attr("fill", "white")
                .attr("style", "stroke-width: 2.5px");
        vertexTypeBox.append('text')
                .attr('x',5)
                .attr('y',model.height-7)
                .attr('style', 'pointer-events: none; user-select: none;')
                .text("Vertex type: Z");

        const edgeTypeBox = svg.append('g').attr('id', 'edgeTypeButton');
        edgeTypeBox.append('rect')
                .attr('x',100)
                .attr('y',model.height-24)
                .attr('width', 100).attr('height', 24)
                .attr("stroke", "black")
                .attr("fill", "white")
                .attr("style", "stroke-width: 2.5px");
        edgeTypeBox.append('text')
                .attr('x',105)
                .attr('y',model.height-7)
                .attr('style', 'pointer-events: none; user-select: none;')
                .text("Edge type: R");

        var addVertexType = 1;
        var addEdgeType = 1;

        function switchAddVertexType() {
            console.log("Switching vertex type");
            var thetext = d3.select("#vertexTypeButton").select("text");
            if (addVertexType == 1) {
                thetext.text("Vertex type: X");
                addVertexType = 2;
            }
            else {
                thetext.text("Vertex type: Z");
                addVertexType = 1;
            }
            d3.event.stopImmediatePropagation();
            resetMouseVars();
        }

        function switchAddEdgeType() {
            console.log("Switching edge type");
            var thetext = d3.select("#edgeTypeButton").select("text");
            if (addEdgeType == 1) {
                thetext.text("Edge type: H");
                addEdgeType = 2;
            }
            else {
                thetext.text("Edge type: R");
                addEdgeType = 1;
            }
            d3.select("#dragLine").attr("stroke", edgeColor(addEdgeType));
            d3.event.stopImmediatePropagation();
            resetMouseVars();
        }

        edgeTypeBox.on("click", function(d) {switchAddEdgeType();});
        vertexTypeBox.on("click", function(d) {switchAddVertexType();});

        function deselectEdges() {
            link.attr("stroke", function(e) {return edgeColor(e.t,e.selected=false);})
                            .attr("style", edgeWidth(false));
        }

        
        function updateGraph() {
            console.log("Updating graph view")
            var node_size = model.node_size;
            var graph = model.graph;
            
            //First initialize all the nodes properly, before looking at edges.
            node = node.data(graph.nodes, function(d) {return d.name;});
            node.exit().remove();
            
            var newnodes = node.enter().append("g")

            newnodes.filter(function(d) { return d.t != 3; })
                .append("circle")
                .attr("stroke", "black");

            var hbox = newnodes.filter(function(d) { return d.t == 3; });

            hbox.append("rect")
                .attr("x", -0.75 * node_size).attr("y", -0.75 * node_size)
                .attr("width", node_size * 1.5).attr("height", node_size * 1.5)
                .attr("fill", nodeColor(3))
                .attr("stroke", "black");

            newnodes.append("text")
                .attr("y", 0.7 * node_size + 14)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("font-family", "monospace")
                .attr("fill", "#00d")
                .attr("style", 'pointer-events: none; user-select: none;')

            if (show_labels) {
                newnodes.append("text")
                    .attr("y", -0.7 * node_size - 5)
                    .text(function (d) { return String(d.name); })
                    .attr("text-anchor", "middle")
                    .attr("font-size", "8px")
                    .attr("font-family", "monospace")
                    .attr("fill", "#ccc")
                    .attr('style', 'pointer-events: none; user-select: none;');
            }

            //All the keyboard events of the nodes

            newnodes.on("mousedown", function(d) {
                if (shiftKey) {
                    d3.select(this).select(":first-child").attr("style", nodeStyle(d.selected = !d.selected));
                    d3.event.stopImmediatePropagation();
                    resetMouseVars();
                } else if (!d.selected && !d3.event.ctrlKey) {
                    node.select(":first-child").attr("style", function(p) { return nodeStyle(p.selected = d === p); });
                    deselectEdges();
                    resetMouseVars();
                }
                else if (d3.event.ctrlKey) {
                    mousedownNode = d;
                    d3.event.stopImmediatePropagation();
                    dragLine.classed('hidden', false)
                        .attr("x1", mousedownNode.x)
                        .attr("y1", mousedownNode.y)
                        .attr("x2", mousedownNode.x)
                        .attr("y2", mousedownNode.y);
                }
            })
            .on("mouseup", function(d) { //Check if we need to add an edge
                if (d3.event.ctrlKey && mousedownNode) {
                    d3.event.stopImmediatePropagation();
                    dragLine.classed('hidden', true);
                    if (mousedownNode === d) {//released on self
                        resetMouseVars();
                        return; 
                    }
                    f = link.filter(function (e) {
                        return ((e.source.name == mousedownNode.name && e.target.name == d.name) ||
                                (e.target.name == mousedownNode.name && e.source.name == d.name));
                    })
                    if (!f.empty()) {
                        console.log("already edge present")
                        f.attr("stroke", function(d) {d.t = addEdgeType;return edgeColor(d.t)});
                    }
                    else {
                    const edge = {t:addEdgeType, source: mousedownNode, target: d, selected: false};
                    console.log("Adding edge")
                    mousedownNode.nhd.push(d);
                    d.nhd.push(mousedownNode);
                    model.graph.links.push(edge);
                    //updateGraph();
                    }
                    model.push_changes();
                }
            })
            .on("dblclick", function(d) {
                const pi = '\u03c0';
                var phase = prompt("Input phase as fraction of pi (like 3/4 or 1):", d.phase);
                if (phase == null) {return;}
                if (phase == "0" || phase == "0\u03c0") {phase = "";}
                if (phase.includes('.')) {alert("Invalid value " + phase) + phase; return;}
                if (phase != "") {
                    phase = phase.replace(pi, '').replace('pi', '');
                    if (phase.includes("/")) {
                        var terms = phase.split("/");
                        if (terms.length != 2) {alert("Invalid value " + phase); return;}
                        a = terms[0]; b = terms[1];
                        if (a!= "" && a != "-" && isNaN(a)) {alert("Invalid value " + phase); return;}
                        if (a=="1") {a = "";}
                        if (a=="-1") {a = "-";}
                        // if (a == "") {a=1;}
                        // else if (a == "-") {a=-1;}
                        // else if (isNaN(a)) {alert("Invalid value " + phase); return;}
                        // else {a = parseInt(a);}
                        if (isNaN(b)) {alert("Invalid value " + phase); return;}
                        b = parseInt(b);
                        phase = a + pi +"/" + b;
                    }
                    else {
                        if (isNaN(phase)) {alert("Invalid value " + phase); return;}
                        if (phase == "1") {phase = "";}
                        if (phase == "-1") {phase = "";}
                        phase += pi;
                    }
                }
                d.phase = phase
                model.push_changes();

                d3.select(this).select("text").text(phase)
                                .attr("visibility", (phase == "") ? 'hidden' : 'visible')
            })
            .call(d3.drag().on("drag", function(d) {
                var dx = d3.event.dx;
                var dy = d3.event.dy;
                // node.filter(function(d) { return d.selected; })
                //     .attr("cx", function(d) { return d.x += dx; })
                //     .attr("cy", function(d) { return d.y += dy; });
                node.filter(function(d) { return d.selected; })
                    .attr("transform", function(d) {
                        d.x += dx;
                        d.y += dy;
                        return "translate(" + d.x + "," + d.y +")";
                    });

                update_hboxes();

                link.filter(function(d) { return d.source.selected ||
                                            (auto_hbox && d.source.t == 3); })
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; });

                link.filter(function(d) { return d.target.selected ||
                                            (auto_hbox && d.target.t == 3); })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                // text.filter(function(d) { return d.selected; })
                //     .attr("x", function(d) { return d.x; })
                //     .attr("y", function(d) { return d.y + 0.7 * node_size + 14; });
            }).on("end", function(d) {model.push_changes();})
            );

            //Finally position all the nodes and update the texts and types
            
            node = newnodes.merge(node);
            node.attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y +")";
                    }).filter(function(d) {return d.t!=3;})
                .select(":first-child")
                    .attr("r", function(d) {
                           if (d.t == 0) return 0.5 * node_size;
                           else return node_size;
                        })
                    .attr("fill", function(d) { return nodeColor(d.t); });

            node.select("text").text(function (d) { return d.phase })
                    .attr("visibility", function(d) {return (d.phase == "") ? 'hidden' : 'visible';});

            //TODO: Right now, if a node changes from non-type 3 to type 3 or back, 
            //then the square wouldn't update to a circle and vice versa
            hbox = node.filter(function(d) { return d.t == 3; });

            function update_hboxes() {
                if (auto_hbox) {
                    var pos = {};
                    hbox.attr("transform", function(d) {
                        // calculate barycenter of non-hbox neighbours, then nudge a bit
                        // to the NE.
                        var x=0,y=0,sz=0;
                        for (var i = 0; i < d.nhd.length; ++i) {
                            if (d.nhd[i].t != 3) {
                                sz++;
                                x += d.nhd[i].x;
                                y += d.nhd[i].y;
                            }
                        }

                        if (sz != 0) {
                            x = (x/sz) + 20;
                            y = (y/sz) - 20;

                            while (pos[[x,y]]) {
                                x += 20;
                            }
                            d.x = x;
                            d.y = y;
                            pos[[x,y]] = true;
                        }

                        return "translate("+d.x+","+d.y+")";
                    });
                }
            }

            update_hboxes();

            // Now let's construct and update all the edges
            
            link = link.data(graph.links, function(d) {return String(d.source.name) + "_" + String(d.target.name);});
            link.exit().remove();
            
            var newlinks = link.enter().append("line")
                .attr("style", "stroke-width: 1.5px")
                .on("click", function(d) {
                    if (d3.event.ctrlKey) {return;}
                    if (!shiftKey) {
                        deselectEdges();
                        node.select(":first-child").attr("style", nodeStyle(false));
                    }
                    d.selected = !d.selected
                    d3.select(this).attr("stroke", edgeColor(d.t,d.selected))
                        .attr("style", edgeWidth(d.selected));
                });
            
            link = newlinks.merge(link);
            link.attr("stroke", function(d) { return edgeColor(d.t); })
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        } // End function updateGraph()
        
        updateGraph();
        
        // EVENTS FOR ADDING VERTICES AND EDGES
        svg.on("mousedown", function(d) {
            if (!d3.event.ctrlKey) return;
            console.log("Adding vertex");
            const point = d3.mouse(this);
            model.max_name += 1
            const vert = { name: model.max_name, t: addVertexType, 
                           selected: false, previouslySelected: false,
                           nhd: [], x: point[0], y: point[1], phase:''};
            model.graph.nodes.push(vert);
            resetMouseVars();
            model.push_changes();
            //updateGraph();
            })
            .on("mousemove", function(d) {
                if (!mousedownNode) return;
                dragLine.attr("x2", d3.mouse(this)[0])
                    .attr("y2",d3.mouse(this)[1]);
            })
            .on("mouseup", function(d) {
                if (mousedownNode) {
                    dragLine.classed('hidden', true);
                    resetMouseVars();
                }
            });
        
        var lastKeyDown = -1;
        
        d3.select(tag).on("keydown", function() {
            if (lastKeyDown !== -1) return;
            lastKeyDown = d3.event.keyCode;
            switch (d3.event.keyCode) {
                case 46: //delete
                case 8: //backspace
                    console.log("Deleting...")
                    d3.event.preventDefault();
                    node.each(function(d) {
                        if (!d.selected) return;
                        model.graph.nodes.splice(model.graph.nodes.indexOf(d),1);
                    });
                    link.each(function(d) {
                        if (!d.source.selected && !d.target.selected && !d.selected) return;
                        model.graph.links.splice(model.graph.links.indexOf(d),1);
                        var l = d.target.nhd;
                        l.splice(l.indexOf(d.source),1);
                        l = d.source.nhd;
                        l.splice(l.indexOf(d.target),1);
                        // if (d.source.selected) {
                        //     let l = d.target.nhd;
                            
                        // }
                        // if (d.target.selected) {
                            
                        // }
                    });
                    model.push_changes();
                    //updateGraph();
                    break;
                case 88: // X
                    d3.event.preventDefault();
                    switchAddVertexType(); break;
                case 69: // E
                    d3.event.preventDefault();
                    switchAddEdgeType(); break
            }
            
        }).on("keyup", function() {
            lastKeyDown = -1;
        });

        // EVENTS FOR DRAGGING AND SELECTION
        
        brush.call(d3.brush().keyModifiers(false).filter(() => !d3.event.ctrlKey)
            //.extent([[0, 0], [model.width, model.height]])
            .on("start", function() {
                if (d3.event.sourceEvent.type !== "end") {
                    node.select(":first-child").attr("style", function(d) {
                        return nodeStyle(
                            d.selected = d.previouslySelected = shiftKey &&
                            d.selected);
                    });
                    if (!shiftKey) deselectEdges();
                }
            })
            .on("brush", function() {
                if (d3.event.sourceEvent.type !== "end") {
                    var selection = d3.event.selection;
                    node.select(":first-child").attr("style", function(d) {
                        return nodeStyle(d.selected = d.previouslySelected ^
                            (selection != null
                            && selection[0][0] <= d.x && d.x < selection[1][0]
                            && selection[0][1] <= d.y && d.y < selection[1][1]));
                    });
                }
            })
            .on("end", function() {
                if (d3.event.selection != null) {
                    d3.select(this).call(d3.event.target.move, null);
                }
            }));

        return updateGraph;
    }

    return {
        prepareGraph: prepareGraph,
        showGraph: showGraph
    };
});
