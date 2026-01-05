import * as leaveService from '../services/leave.service.js';

export const applyLeave = async(req, res) => {
    try{
        const faculty = req.user;
        const { voiceBlobUrl, leaveType } = req.body;

        const leave = await leaveService.createLeave({
            faculty,
            voiceBlobUrl,
            leaveType
        });

        res.status(201).json({
            message: "Leave request submitted",
            leave
        });

    }catch (err){
        res.status(500).json({error: err.message});
    }
};

export const getPendingLeaves = async (req, res) => {
    try{
        const approver = req.user;

        const leaves = await leaveService.fetchPendingLeaves(approver);

        res.json(leaves);
    }catch (err){
        res.status(500).json({error: err.message})
    }
};

export const decideLeave = async(req, res) => {
    try{
        const approver = req.user;
        const { leaveId, decision, remarks } = req.body;

        await leaveService.processDecision({
            leaveId, decision, remarks, approver
        });

        res.json({ message: "Decision processed successfully" })
    } catch(err) {
        res.status(400).json({ error: err.message })
    }
};

export const getLeaveHistory = async(req, res) => {
    const { leaveId } = req.params;

    const history = await leaveService.fetchLeaveHistory(leaveId);
    res.json(history);
}