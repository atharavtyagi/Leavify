const { GoogleGenerativeAI } = require("@google/generative-ai");
const Leave = require('../models/Leave');
const Reimbursement = require('../models/Reimbursement');
const User = require('../models/User');
const LeaveBalance = require('../models/LeaveBalance');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI("AIzaSyCSQuRXOejZJhnxTLs_JLHbEn5T5cEHs4s");

class AssistantService {
    static async processQuery(message, user) {
        try {
            // 1. Gather Context Data Based on User Role
            const contextData = await this._gatherContextData(user);

            // 2. Construct System Prompt
            const systemPrompt = `You are the Leavify AI Assistant, an intelligent, empathetic, and highly capable HR assistant built into the Leavify employee leave management system. You are an expert at handling questions, rendering beautiful data, and helping the user.
You are currently talking to ${user.name}, whose role is ${user.role}. Do not remind them of this in every message, just use it for context.

CONTEXTUAL DATA YOU HAVE ACCESS TO:
${JSON.stringify(contextData, null, 2)}

INSTRUCTIONS:
1. Use the provided contextual data to answer the user's questions personally and accurately.
2. If the user asks for data in a table form, return "table" type and provide the columns/rows accordingly.
3. If they ask about statistics or dashboards, return "stat" type with label/value pairs.
4. Otherwise, use "text" type. You can format your message using Markdown (bolding, lists) to look awesome on the frontend.
5. Do NOT make up data. If they ask for something not in the context, politely say you don't have access to that yet or it isn't relevant.
6. YOU MUST ALWAYS RETURN A VALID JSON RESPONSE AND NOTHING ELSE. Do not include markdown \`\`\`json blocks. Return only raw JSON.

YOUR JSON RESPONSE SCHEMA MUST BE EXACTLY:
{
  "type": "text" | "stat" | "table",
  "message": "Your conversational response. Write beautifully.",
  "data": [
      // Optional: array of objects.
      // If type="table", it should be an array of objects representing rows: [{"Heading1": "Value1", "Heading2": "Value2"}]
      // If type="stat", it should be an array: [{"label": "Metric Name", "value": "Metric Value"}]
  ]
}`;

            // 3. Call Gemini Model
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: systemPrompt,
                generationConfig: {
                    responseMimeType: "application/json"
                }
            });

            const result = await model.generateContent(message);
            const responseText = result.response.text();

            let parsedResponse;
            try {
                parsedResponse = JSON.parse(responseText);
            } catch (err) {
                console.error("Gemini Parse Error:", err, "Raw response:", responseText);
                return this._fallbackResponse("I had trouble formulating a structured response. Could you rephrase?");
            }

            return parsedResponse;

        } catch (error) {
            console.error("Assistant Error:", error);
            return this._fallbackResponse("An error occurred while connecting to the AI center.");
        }
    }

    static async _gatherContextData(user) {
        const role = user.role;
        const currentYear = new Date().getFullYear();
        let context = {};

        if (role === 'Employee') {
            const balance = await LeaveBalance.findOne({ user: user.id, year: currentYear }).lean() || { annualLeave: 0, sickLeave: 0, casualLeave: 0 };
            const recentLeaves = await Leave.find({ employee: user.id }).sort('-startDate').limit(5).lean();
            const recentClaims = await Reimbursement.find({ employee: user.id }).sort('-expenseDate').limit(5).lean();
            const manager = await User.findOne({ department: user.department, role: 'Manager' }).select('name email').lean();

            context = {
                myLeaveBalances: {
                    annual: balance.annualLeave,
                    sick: balance.sickLeave,
                    casual: balance.casualLeave
                },
                myRecentLeaves: recentLeaves.map(l => ({ type: l.type, from: l.startDate, to: l.endDate, status: l.status })),
                myRecentReimbursements: recentClaims.map(c => ({ type: c.expenseType, amount: c.amount, date: c.expenseDate, status: c.status })),
                myManager: manager || "No manager assigned"
            };
        }
        else if (role === 'Manager') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const teamMembers = await User.find({ department: user.department, role: 'Employee' }).select('name email').lean();
            const pendingLeaves = await Leave.find({ status: 'Pending' }).populate('employee', 'name department').lean();
            const deptPendingLeaves = pendingLeaves.filter(l => l.employee && l.employee.department === user.department);

            const leavesToday = await Leave.find({
                status: 'Approved',
                startDate: { $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                endDate: { $gte: today }
            }).populate('employee', 'name department').lean();
            const deptLeavesToday = leavesToday.filter(l => l.employee && l.employee.department === user.department);

            context = {
                department: user.department,
                myTeam: teamMembers,
                pendingLeaveApprovals: deptPendingLeaves.map(l => ({ employee: l.employee.name, type: l.type, from: l.startDate, to: l.endDate })),
                employeesOnLeaveToday: deptLeavesToday.map(l => ({ employee: l.employee.name, type: l.type, returning: l.endDate }))
            };
        }
        else if (role === 'Admin') {
            const totalUsers = await User.countDocuments();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const globalLeavesToday = await Leave.find({
                status: 'Approved',
                startDate: { $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                endDate: { $gte: today }
            }).populate('employee', 'name department').lean();

            const pendingReimbursements = await Reimbursement.find({ status: { $in: ['Pending', 'Manager Approved'] } })
                .populate('employee', 'name department').lean();

            context = {
                totalEmployeesInCompany: totalUsers,
                employeesOnLeaveToday: globalLeavesToday.map(l => ({ employee: l.employee.name, dept: l.employee.department, type: l.type })),
                pendingReimbursementClaims: pendingReimbursements.map(r => ({ employee: r.employee ? r.employee.name : 'Unknown', amount: r.amount, status: r.status }))
            };
        }

        return context;
    }

    static _fallbackResponse(customMessage) {
        return {
            type: "text",
            message: customMessage || "I'm sorry, I couldn't respond to that right now. Please try again later."
        };
    }
}

module.exports = AssistantService;
