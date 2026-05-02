const User = require('../models/User');
const Leave = require('../models/Leave');

/**
 * Resolves who should be notified and allowed to act for a department's requests.
 * @param {string} department - The department to resolve for.
 * @returns {Object} { primary: [User], fyi: [User] }
 */
const getDepartmentResponders = async (department) => {
    console.log(`[RESOLVER DEBUG] Resolving responders for department: "${department}"`);
    const now = new Date();
    
    // We use a 72-hour window centered on "now" to be extremely robust against 
    // server/database timezone differences (e.g. UTC server and IST user).
    const startOfWindow = new Date(now.getTime() - 36 * 60 * 60 * 1000);
    const endOfWindow = new Date(now.getTime() + 36 * 60 * 60 * 1000);

    // 1. Get all regular managers for the department (Case-insensitive)
    const realManagers = await User.find({
        role: 'Manager',
        department: { $regex: new RegExp(`^${department}$`, 'i') }
    });
    console.log(`[RESOLVER DEBUG] Found ${realManagers.length} real managers for "${department}"`);

    const primary = [];
    const fyi = [];

    // 2. For each manager, check if they are currently on an approved leave
    for (const manager of realManagers) {
        const activeLeave = await Leave.findOne({
            employee: manager._id,
            status: 'Approved',
            startDate: { $lte: endOfWindow },
            endDate: { $gte: startOfWindow }
        }).populate('actingManager backupEmployee');

        if (activeLeave) {
            console.log(`[RESOLVER DEBUG] Manager ${manager.name} is ON LEAVE today.`);
            fyi.push(manager);

            // 3. Find the Acting Manager assigned to this specific leave
            // Handle both actingManager and backupEmployee for maximal coverage
            const actingObj = activeLeave.actingManager || activeLeave.backupEmployee;
            
            if (actingObj) {
                // Ensure we have a proper User object (or at least an ID string)
                const actingManagerId = actingObj._id ? actingObj._id.toString() : actingObj.toString();
                console.log(`[RESOLVER DEBUG] Redirection target found: ${actingManagerId}`);
                
                // Fetch full acting manager details if it was just an ID
                let actingUser = actingObj._id ? actingObj : await User.findById(actingObj);
                
                if (actingUser && !primary.some(p => p._id.toString() === actingUser._id.toString())) {
                    console.log(`[RESOLVER DEBUG] Adding Acting Manager ${actingUser.name} to Primary list.`);
                    primary.push(actingUser);
                }
            } else {
                console.log(`[RESOLVER DEBUG] NO Acting Manager found for ${manager.name}'s leave.`);
            }
        } else {
            console.log(`[RESOLVER DEBUG] Manager ${manager.name} is ACTIVE (no approved leave today).`);
            primary.push(manager);
        }
    }

    // 4. Fallback: If no managers resolved to primary, notify Admins
    if (primary.length === 0) {
        console.log(`[RESOLVER DEBUG] No primary responders resolved. Falling back to Admins.`);
        const admins = await User.find({ role: 'Admin' });
        primary.push(...admins);
    }

    console.log(`[RESOLVER DEBUG] Final Resolution -> Primary: ${primary.map(p => p.name).join(', ')} | FYI: ${fyi.map(f => f.name).join(', ')}`);
    return { primary, fyi };
};

module.exports = { getDepartmentResponders };
