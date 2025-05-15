const Flowchart = require( '../models/Flowchart' );
const agenda = require('../config/agenda.js');
const { GoogleGenerativeAI } = require( '@google/generative-ai' );
require('../jobs/emailJobs.js');

const apiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

//Controller to generate a general AI response using genAI
exports.handleGenerateAIResponse = async (req, res) => {

  if (req.method !== "POST") return res.status(405).end();

  const { prompt } = req.body;

  try {

    const result = await model.generateContent(prompt);
    const response = await result.response; 

    const text = response.text();

    if (!text) {
      console.error("Invalid Gemini Response:", data);
      return res.status(500).json({ error: "Failed to get content from Gemini response" });
    }

    const rawText = text.split('\n').filter(Boolean);
    res.status(200).json({
      response : rawText
    });
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI generation failed" });
  }
}


// Controller to generate an email using genAI
exports.handleGenerateEmail = async (req, res) => {

  if (req.method !== "POST") return res.status(405).end();

  const { category, prompt } = req.body;

  let finalPrompt = "";

  if (prompt) {
    finalPrompt = `Write a professional cold email. ${prompt}`;
  } else if (category) {
    finalPrompt = `Write a professional cold email for the category "${category}". Include a subject line and a short body.`;
  } else {
    return res.status(400).json({ error: "No prompt or category provided" });
  }

  try {
  

    const result = await model.generateContent(finalPrompt);
    const response = await result.response; // Await the promise

    const text = response.text();

    if (!text) {
      console.error("Invalid Gemini Response:", data);
      return res.status(500).json({ error: "Failed to get content from Gemini response" });
    }

    // Extract subject and body using simple logic
    const rawText = text.split('\n').filter(Boolean);
    const subject = rawText[0].replace(/^Subject:\s*/i, '').trim();
    const body = rawText.slice(1).join('\n').trim();

  
    res.status(200).json({
      subject,
      body,
    });
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI generation failed" });
  }
}

// Controller for saving or updating a flowchart and scheduling the email sequence
exports.saveFlowChart = async (req, res, next) => {
    const { token } = req.body;

    try {
        const { option, nodes, edges, userId, title,flowchartId } = req.body;
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
          existingFlowchart.status = option === 'saveAndSchedule' ? 'scheduled' : 'saved';
          savedFlowchart = await existingFlowchart.save();

        } else {
          // Create and save new flowchart
          const newFlowchart = new Flowchart({
              nodes,
              edges,
              title,
              userId,
              status: option === 'saveAndSchedule' ? 'scheduled' : 'saved',
          });

          savedFlowchart = await newFlowchart.save();
        }

        //Only schedule if user chose 'saveAndSchedule'
        if(option === 'saveAndSchedule'){
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
        }
      
    
        // Send response based on whether it was an update or a new flowchart
        return res.status(flowchartId ? 200 : 201).json({
          message:  option === "saveAndSchedule"
          ? "Flowchart scheduled and saved!"
          : flowchartId
          ? "Flowchart updated successfully"
          : "Flowchart saved!",
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