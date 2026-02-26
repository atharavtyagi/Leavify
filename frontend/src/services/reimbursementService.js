import api from './api';

const applyReimbursement = async (reimbursementData) => {
    const res = await api.post('/reimbursements/apply', reimbursementData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return res.data;
};

const getMyReimbursements = async () => {
    const res = await api.get('/reimbursements/my');
    return res.data;
};

const getAllReimbursements = async () => {
    const res = await api.get('/reimbursements/all');
    return res.data;
};

const approveReimbursement = async (id) => {
    const res = await api.patch(`/reimbursements/${id}/approve`);
    return res.data;
};

const rejectReimbursement = async (id) => {
    const res = await api.patch(`/reimbursements/${id}/reject`);
    return res.data;
};

const deleteReimbursement = async (id) => {
    const res = await api.delete(`/reimbursements/${id}`);
    return res.data;
};

export const reimbursementService = {
    applyReimbursement,
    getMyReimbursements,
    getAllReimbursements,
    approveReimbursement,
    rejectReimbursement,
    deleteReimbursement
};
