const nodemailer = require('nodemailer');

// Ensure SMTP config exists before trying to create a transporter
let transporter = null;

try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        console.warn("⚠️ SMTP Config is missing in .env. Emails will not be sent.");
    }
} catch (error) {
    console.warn("⚠️ Failed to initialize email transporter:", error.message);
}

const sendEmail = async (options) => {
    if (!transporter) {
        console.log(`[Email Skipped] To: ${options.to}, Subject: ${options.subject}`);
        return;
    }

    const message = {
        from: process.env.SMTP_FROM || '"Leavify HR" <noreply@leavify.com>',
        to: options.to,
        subject: options.subject,
        html: options.html
    };

    try {
        const info = await transporter.sendMail(message);
        console.log(`📧 Email sent to ${options.to}: %s`, info.messageId);
    } catch (error) {
        console.error(`❌ Error sending email to ${options.to}:`, error.message);
    }
};

const getBaseHTML = (title, content) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Outfit', 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-top: 6px solid #6366f1; }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 28px; font-weight: 900; color: #6366f1; text-transform: uppercase; letter-spacing: 2px; }
        .title { font-size: 20px; font-weight: 700; color: #334155; margin-top: 10px; }
        .content { font-size: 15px; line-height: 1.6; color: #475569; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .badge-pending { background-color: #fef3c7; color: #b45309; }
        .badge-approved { background-color: #d1fae5; color: #047857; }
        .badge-rejected { background-color: #fee2e2; color: #b91c1c; }
        .box { background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">LEAVIFY</div>
            <div class="title">${title}</div>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            This is an automated message from the Leavify HR System. Please do not reply directly to this email.
        </div>
    </div>
</body>
</html>
`;

exports.sendLeaveAppliedEmail = (managers, employeeName, leaveDetails) => {
    managers.forEach(manager => {
        // Execute asynchronously, non-blocking
        Promise.resolve().then(() => {
            const html = getBaseHTML(
                'New Leave Request Submitted',
                `
                <p>Hello ${manager.name},</p>
                <p><strong>${employeeName}</strong> has submitted a new leave request that requires your review.</p>
                <div class="box">
                    <p><strong>Type:</strong> ${leaveDetails.type}</p>
                    <p><strong>Dates:</strong> ${new Date(leaveDetails.startDate).toDateString()} to ${new Date(leaveDetails.endDate).toDateString()}</p>
                    <p><strong>Reason:</strong> ${leaveDetails.reason}</p>
                    <p><strong>Status:</strong> <span class="badge badge-pending">Pending</span></p>
                </div>
                <p>Please log in to the Leavify dashboard to approve or reject this request.</p>
                `
            );
            sendEmail({
                to: manager.email,
                subject: `Leave Request: ${employeeName} - Action Required`,
                html
            });
        });
    });
};

exports.sendLeaveStatusEmail = (employee, managerName, leaveDetails, status, comment) => {
    // Execute asynchronously, non-blocking
    Promise.resolve().then(() => {
        let badgeClass = status === 'Approved' ? 'badge-approved' : 'badge-rejected';
        let actionWord = status === 'Approved' ? 'approved' : 'rejected';

        const html = getBaseHTML(
            `Leave Request ${status}`,
            `
            <p>Hello ${employee.name},</p>
            <p>Your leave request has been reviewed by <strong>${managerName}</strong> and marked as <span class="badge ${badgeClass}">${status}</span>.</p>
            <div class="box">
                <p><strong>Type:</strong> ${leaveDetails.type}</p>
                <p><strong>Dates:</strong> ${new Date(leaveDetails.startDate).toDateString()} to ${new Date(leaveDetails.endDate).toDateString()}</p>
                ${comment ? `<p><strong>Manager Comment:</strong> "${comment}"</p>` : ''}
            </div>
            `
        );
        sendEmail({
            to: employee.email,
            subject: `Leave Request ${status} - ${new Date(leaveDetails.startDate).toLocaleDateString()}`,
            html
        });
    });
};

exports.sendRoleChangeEmail = (user, newRole, adminName) => {
    Promise.resolve().then(() => {
        const html = getBaseHTML(
            'Account Role Updated',
            `
            <p>Hello ${user.name},</p>
            <p>Your account role in Leavify has been updated by <strong>${adminName}</strong>.</p>
            <div class="box">
                <p><strong>New Role:</strong> ${newRole}</p>
            </div>
            <p>Please log back into the system to see changes applied to your dashboard.</p>
            `
        );
        sendEmail({
            to: user.email,
            subject: `Leavify - Your role has been updated to ${newRole}`,
            html
        });
    });
};
