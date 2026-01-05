import db from '../db/index.js';

export const createLeave = async ({
    faculty,
    voiceBlobUrl,
    leaveType
}) => {

    const firstApproverLevel = faculty.level + 1;

    const query = `
        INSERT INTO leave_applications
        (faculty_id, voice_blob_name, status, current_level)
        VALUES ($1, $2, 'PENDING', $3)
        RETURNING *;
    `;

    const { rows } = await db.query(query, [
        faculty.uid,
        voiceBlobUrl,
        firstApproverLevel
    ])

    return rows[0];
}

export const fetchPendingLeaves = async(approver) => {
    const query = `
    SELECT * FROM leave_applications
    WHERE status = 'PENDING'
    AND current_level = $1
    ORDER BY created_at ASC
    `;

    const { rows } = await db.query(query, [approver.level]);
    return rows;
};

export const processDecision = async({
    leaveId,
    decision,
    remarks,
    approver
}) => {
    const client = await db.connect();

    try{
        await client.query("BEGIN");

        const leaveRes = await client.query(
            `SELECT * FROM leave_applications WHERE id = $1 FOR UPDATE`,
            [leaveId]
        )

        const leave = leaveRes.rows[0];
        if(!leave) throw new Error("Leave not found");

        if(leave.current_level != approver.level)
            throw new Error("You are not authorized to act on this leave");

        await client.query(
            `
            INSERT INTO leave_approvals
            (leave_id, role, decision, remarks, approved_by, approved_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            `,
            [leaveId, approver.level, decision, remarks, approver.uid]
        );

        if(decision === "REJECTED") {
            await client.query(
                `UPDATE leave_applications
                SET status = 'REJECTED'
                WHERE id = $1`,
                [leaveId]
            );

            await client.query("COMMIT");
            return;
        }

        const nextLevelRes = await client.query(
            `SELECT MIN(level) AS level FROM users WHERE level > $1`,
            [approver.level]
        );

        //Next steps after one authority approves
        const nextLevel = nextLevelRes.rows[0].level;

        //if highest authority, then stop and return approved
        if(!nextLevel){
            await client.query(
                `UPDATE leave_applications
                SET status = 'APPROVED' WHERE id = $1`,
                [leaveId]
            );
        }
        
        //if there is a higher authority, forward to them by setting current_level
        else {
            await client.query(
                `UPDATE leave_applications
                SET current_level = $1 WHERE id = $2`,
                [nextLevel, leaveId]
            );
        }

        await client.query("COMMIT");

    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

export const fetchLeaveHistory = async (leaveId) => {
    const query = `
        SELECT la.*, u.name, u.role
        FROM leave_approvals la
        JOIN users u ON la.approved_by = u.uid
        WHERE la.leave_id = $1
        ORDER BY la.approved_at
    `;

    const { rows } = await db.query(query, [leaveId]);
    return rows;
}