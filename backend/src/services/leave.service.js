import supabase from '../services/supabaseClient.js';
export const createLeave = async ({
    faculty,
    voiceBlobUrl,
    leaveType
}) => {
    const firstApproverLevel = faculty.level + 1;
    const { data: rows } = await supabase.from('leave_applications').insert([
        {
            faculty_id: faculty.uid,
            voice_blob_name: voiceBlobUrl,
            status: 'PENDING',
            current_level: firstApproverLevel
        }
    ]).select();
    return rows[0];
}

export const fetchPendingLeaves = async (approver) => {
    const { rows } = await supabase.from('leave_applications').select('*').eq('current_level', approver.level);
    return rows;
};

export const fetchLeaveHistory = async (leaveId) => {
    const { rows } = await supabase.from('leave_applications').select('*').eq('id', leaveId);
    return rows;
};

export const processDecision = async ({
    leaveId,
    decision,
    remarks,
    approver
}) => {
    try {
        await supabase.from('leave_applications').update({
            status: 'APPROVED'
        }).eq('id', leaveId);

        const leaveRes = await supabase.from('leave_applications').select('*').eq('id', leaveId);

        const leave = leaveRes.rows[0];
        if (!leave) throw new Error("Leave not found");

        if (leave.current_level != approver.level)
            throw new Error("You are not authorized to act on this leave");

        await supabase.from('leave_approvals').insert({
            leave_id: leaveId,
            role: approver.level,
            decision,
            remarks,
            approved_by: approver.uid,
            approved_at: new Date()
        });

        if (decision === "REJECTED") {
            await supabase.from('leave_applications').update({
                status: 'REJECTED'
            }).eq('id', leaveId);

            return;
        }

        const nextLevelRes = await supabase.from('users').select('*').eq('level', approver.level + 1);

        await supabase.from('leave_applications').update({
            current_level: nextLevelRes.rows[0].level
        }).eq('id', leaveId);

        const nextLevel = nextLevelRes.rows[0].level;

        if (!nextLevel) {
            await supabase.from('leave_applications').update({
                status: 'APPROVED   '
            }).eq('id', leaveId);
        }
        else {
            await supabase.from('leave_applications').update({
                current_level: nextLevel
            }).eq('id', leaveId);
        }

    } catch (err) {
        throw err;
    }
};
