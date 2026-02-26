const Leave = require('../models/Leave');
const User = require('../models/User');

/**
 * Calculates skill-based risk impact safely without modifying existing workflow.
 * Appends risk fields to the leave object before saving.
 */
exports.calculateSkillRisk = async (leaveData, employeeId) => {
    try {
        const employee = await User.findById(employeeId);

        // Skip safely if user has no skills defined
        if (!employee || !employee.skills || employee.skills.length === 0) {
            return leaveData;
        }

        const startDate = new Date(leaveData.startDate);
        const endDate = new Date(leaveData.endDate);

        // Fetch overlapping approved leaves
        const overlappingLeaves = await Leave.find({
            status: 'Approved',
            startDate: { $lte: endDate },
            endDate: { $gte: startDate }
        }).populate('employee');

        let criticalSkillsImpacted = new Set();
        let riskScore = 0;

        // Check if overlapping employees share the same skills
        overlappingLeaves.forEach(l => {
            if (l.employee && l.employee._id.toString() !== employeeId.toString() && l.employee.skills) {
                const sharedSkills = employee.skills.filter(s => l.employee.skills.includes(s));

                if (sharedSkills.length > 0) {
                    sharedSkills.forEach(s => criticalSkillsImpacted.add(s));
                    riskScore += sharedSkills.length;

                    if (l.employee.isCriticalEmployee) {
                        riskScore += 2; // Additional penalty if overlapping with another critical employee
                    }
                }
            }
        });

        // Add weight if the applicant is a critical employee
        if (employee.isCriticalEmployee) {
            riskScore += 3;
        }

        // Only add risk flags if there's actually a risk calculated, else default to Low
        if (riskScore === 0) {
            leaveData.riskLevel = 'Low';
        } else if (riskScore < 4) {
            leaveData.riskLevel = 'Medium';
            leaveData.skillRiskScore = riskScore;
            leaveData.criticalSkillsImpacted = Array.from(criticalSkillsImpacted);
        } else {
            leaveData.riskLevel = 'High';
            leaveData.skillRiskScore = riskScore;
            leaveData.criticalSkillsImpacted = Array.from(criticalSkillsImpacted);
        }

        return leaveData;
    } catch (error) {
        console.error("Skill Risk Calculation Error:", error);
        // Fail silently so we don't block the leave application process
        return leaveData;
    }
};
