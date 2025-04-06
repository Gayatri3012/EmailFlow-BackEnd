const Flowchart = require( '../models/Flowchart' );
const agenda = require('../config/agenda.js');
require('../jobs/emailJobs.js');


// Controller for saving or updating a flowchart and scheduling the email sequence
exports.saveFlowChart = async (req, res, next) => {
    const { token } = req.body;

    try {
        const { nodes, edges, userId, title,flowchartId } = req.body;
        let savedFlowchart;

        // Update existing flowchart if flowchartId is provided
        if (flowchartId) {
          const existingFlowchart = await Flowchart.findById(flowchartId);
          if (!existingFlowchart) {
              return res.status(404).json({ message: "Flowchart not found" });
          }

          existingFlowchart.nodes = nodes;
          existingFlowchart.edges = edges;
          existingFlowchart.title = title;
          existingFlowchart.updatedAt = new Date();
          savedFlowchart = await existingFlowchart.save();

        } else {
          // Create and save new flowchart
          const newFlowchart = new Flowchart({
              nodes,
              edges,
              title,
              userId
          });

          savedFlowchart = await newFlowchart.save();
        }

        // Create a map of nodes for quick lookup by ID
        const nodeMap = {};
        nodes.forEach((node) => {
          nodeMap[node.id] = node;
        });
    
        // Find the starting point of the flow (Lead Source node)
        const startNode = nodes.find((n) => n.type === 'leadSource');
        if (!startNode) {
          return res.status(400).json({ message: "No lead source node found" });
        }

        // Recursively build the email sequence starting from the lead node
        const buildSequence = (currentNodeId, accumulatedDelay = 0, sequence = []) => {
          const currentNode = nodeMap[currentNodeId];
          if (!currentNode) return sequence;
    
          if (currentNode.type === 'coldEmail') {
            sequence.push({
              action: 'sendEmail',
              delay: accumulatedDelay,
              data: currentNode.data,
            });
          }
          if (currentNode.type === 'delay') {
            const hours = Number(currentNode.data?.delayTime) || 0;
            accumulatedDelay += hours;
          }
    
          // Find the next connected node
          const nextEdge = edges.find((edge) => edge.source === currentNodeId);
          if (nextEdge) {
            return buildSequence(nextEdge.target, accumulatedDelay, sequence);
          }
    
          return sequence;
        }

        const emailSequence = buildSequence(startNode.id);

        // Schedule each email in the sequence using Agenda
        for (let item of emailSequence) {
         // const runAt = new Date(Date.now() + item.delay * 60 * 60 * 1000); // delay in hours
          const runAt = new Date(Date.now() + item.delay * 60 * 1000); // delay in minutes for testing purpose
          await agenda.schedule(runAt, 'send-email', item.data);
        }
    
        // Send response based on whether it was an update or a new flowchart
        return res.status(flowchartId ? 200 : 201).json({
          message: flowchartId ? "Flowchart updated successfully" : "Flowchart saved!",
          id: savedFlowchart._id,
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}


// Controller to fetch all flowcharts created by a specific user
exports.getAllFlowCharts = async (req, res, next) => {

  try {
    const { userId } = req.params;
    const flowcharts = await Flowchart.find({ userId });
      
    res.status(200).json(flowcharts);
  } catch (error) {
    console.error("Error fetching flowcharts:", error);
    res.status(500).json({ error: "Failed to fetch flowcharts" });
  }

}

// Controller to fetch a specific flowchart by its ID
exports.getFlowChartById = async (req, res, next) => {

  try {
    const { flowchartId } = req.params;
    const flowchart = await Flowchart.findById({ _id : flowchartId });

    if(!flowchart){
      return res.status(404).json({message: 'Flowchart not found'})
    }
      
    res.status(200).json(flowchart);
  } catch (error) {
    console.error("Error fetching flowchart:", error);
    res.status(500).json({ error: "Failed to fetch flowchart" });
  }

}