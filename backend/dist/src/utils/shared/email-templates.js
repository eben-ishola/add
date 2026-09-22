"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildJobStatusTemplate = exports.BASE_TEMPLATES = exports.JOB_STATUS_MESSAGES = exports.JOB_STATUS_LABELS = void 0;
exports.buildWorkflowTemplates = buildWorkflowTemplates;
const WORKFLOW_EVENT_SUBJECTS = {
    submitted: '{{workflowLabel}} submitted for review: {{entityName}} ({{periodLabel}})',
    reviewed: '{{workflowLabel}} awaiting approval: {{entityName}} ({{periodLabel}})',
    approved: '{{workflowLabel}} awaiting posting: {{entityName}} ({{periodLabel}})',
    posted: '{{workflowLabel}} posted: {{entityName}} ({{periodLabel}})',
    rejected: '{{workflowLabel}} rejected: {{entityName}} ({{periodLabel}})',
};
const WORKFLOW_EVENT_BODIES = {
    submitted: 'Hello,\n\n' +
        '{{message}}\n' +
        'Workflow: {{workflowLabel}}\n' +
        'Entity: {{entityName}}\n' +
        'Period: {{periodLabel}}\n\n' +
        'Review: {{approvalLink}}',
    reviewed: 'Hello,\n\n' +
        '{{message}}\n' +
        'Workflow: {{workflowLabel}}\n' +
        'Entity: {{entityName}}\n' +
        'Period: {{periodLabel}}\n\n' +
        'Approve: {{approvalLink}}',
    approved: 'Hello,\n\n' +
        '{{message}}\n' +
        'Workflow: {{workflowLabel}}\n' +
        'Entity: {{entityName}}\n' +
        'Period: {{periodLabel}}\n\n' +
        'Post: {{approvalLink}}',
    posted: 'Hello,\n\n' +
        '{{message}}\n' +
        'Workflow: {{workflowLabel}}\n' +
        'Entity: {{entityName}}\n' +
        'Period: {{periodLabel}}\n\n' +
        'View: {{approvalLink}}',
    rejected: 'Hello,\n\n' +
        '{{message}}\n' +
        'Workflow: {{workflowLabel}}\n' +
        'Entity: {{entityName}}\n' +
        'Period: {{periodLabel}}\n\n' +
        'View: {{approvalLink}}',
};
function buildWorkflowTemplates(moduleKey) {
    const events = ['submitted', 'reviewed', 'approved', 'posted', 'rejected'];
    return events.reduce((acc, event) => {
        acc[`workflow.${moduleKey}.${event}`] = {
            subject: WORKFLOW_EVENT_SUBJECTS[event],
            text: WORKFLOW_EVENT_BODIES[event],
        };
        return acc;
    }, {});
}
exports.JOB_STATUS_LABELS = {
    submitted: 'Submitted',
    reviewed: 'In review',
    interview: 'Interview',
    interviewstage1: 'Interview stage 1',
    interviewstage2: 'Interview stage 2',
    interviewstage3: 'Interview stage 3',
    future: 'Future consideration',
    rejected: 'Not selected',
    hired: 'Hired',
};
exports.JOB_STATUS_MESSAGES = {
    submitted: 'We have received your application and will review it soon.',
    reviewed: 'Your application is being reviewed by our team.',
    interview: 'We would like to schedule an interview with you.',
    interviewstage1: 'Your application has progressed to interview stage 1.',
    interviewstage2: 'Your application has progressed to interview stage 2.',
    interviewstage3: 'Your application has progressed to interview stage 3.',
    future: 'We will keep your application on file for future openings.',
    rejected: 'We are moving forward with other candidates at this time.',
    hired: 'Congratulations, you have been selected for this role.',
};
exports.BASE_TEMPLATES = {
    'admin-password-reset': {
        subject: 'Password reset request',
        text: 'Hi {{fullName}},\n\n' +
            'A password reset was requested for your account.\n' +
            'Use this link to reset your password:\n' +
            '{{resetLink}}\n\n' +
            'Token: {{token}}\n' +
            'Expires at: {{expiresAt}}\n\n' +
            'If you did not request this, please contact HR.',
    },
    'password-reset-request': {
        subject: 'Reset your HR Portal password',
        text: 'Hi {{fullName}},\n\n' +
            'We received a request to reset your password.\n' +
            'Use this link to reset your password:\n' +
            '{{resetLink}}\n\n' +
            'Expires at: {{expiresAt}}\n\n' +
            'If you did not request this, you can ignore this email.',
    },
    'birthday-message': {
        subject: 'Happy Birthday, {{firstName}}!',
        text: 'Hi {{firstName}},\n\n' +
            'Wishing you a very happy birthday from all of us.\n' +
            'Have a great day!',
    },
    'anniversary-message': {
        subject: 'Happy Work Anniversary, {{firstName}}!',
        text: 'Hi {{firstName}},\n\n' +
            'Thank you for your contributions since {{startDate}}.\n' +
            'We appreciate your work and dedication.',
    },
    'active-hrms': {
        subject: 'Activity summary',
        text: 'Hi {{firstName}},\n\n' +
            'Here is your activity summary for this period:\n' +
            'Active time: {{totalActiveTime}}\n' +
            'Idle time: {{totalIdleTime}}',
    },
    'leave-approval-notice': {
        subject: 'Leave approval needed for {{employeeName}}',
        text: 'Hi {{approverName}},\n\n' +
            'A leave request requires your approval.\n' +
            'Employee: {{employeeName}}\n' +
            'Leave type: {{leaveType}}\n' +
            'Start date: {{startDate}}\n' +
            'End date: {{endDate}}\n' +
            'Stage: {{stage}}\n\n' +
            'Review: {{leaveApplicationUrl}}',
    },
    'leave-relieve': {
        subject: 'Reliever assignment for {{employeeName}}',
        text: 'Hi {{relieverName}},\n\n' +
            'You have been assigned as the reliever for {{employeeName}}.\n' +
            'Leave type: {{leaveType}}\n' +
            'Start date: {{startDate}}\n' +
            'End date: {{endDate}}\n' +
            'Reason: {{reason}}\n\n' +
            'Review: {{leaveApplicationUrl}}',
    },
    'leave-status-update': {
        subject: 'Leave request status: {{status}}',
        text: 'Hi {{employeeName}},\n\n' +
            'Your leave request has been updated.\n' +
            'Leave type: {{leaveType}}\n' +
            'Start date: {{startDate}}\n' +
            'End date: {{endDate}}\n' +
            'Status: {{status}}{{noteLine}}\n\n' +
            'Review: {{leaveApplicationUrl}}',
    },
    'payroll-approval': {
        subject: 'Payroll approval required: {{entityName}} ({{periodLabel}})',
        text: 'Hello,\n\n' +
            'A payroll batch requires your approval.\n' +
            'Entity: {{entityName}}\n' +
            'Period: {{periodLabel}}\n' +
            'Stage: {{stage}}\n\n' +
            'Review: {{approvalLink}}',
    },
    'payroll-approval-approved': {
        subject: 'Payroll approved: {{entityName}} ({{periodLabel}})',
        text: 'Hello,\n\n' +
            'A payroll batch has been approved.\n' +
            'Entity: {{entityName}}\n' +
            'Period: {{periodLabel}}\n\n' +
            'View: {{approvalLink}}',
    },
    'payroll-approval-rejected': {
        subject: 'Payroll rejected: {{entityName}} ({{periodLabel}})',
        text: 'Hello,\n\n' +
            'A payroll batch was rejected.\n' +
            'Entity: {{entityName}}\n' +
            'Period: {{periodLabel}}\n\n' +
            'View: {{approvalLink}}',
    },
    'payroll-approval-view': {
        subject: 'Payroll ready for audit: {{entityName}} ({{periodLabel}})',
        text: 'Hello,\n\n' +
            'A payroll batch is ready for audit/finance viewing.\n' +
            'Entity: {{entityName}}\n' +
            'Period: {{periodLabel}}\n\n' +
            'View: {{approvalLink}}',
    },
    'payroll-approval-banking': {
        subject: 'Payroll funding needed: {{entityName}} ({{periodLabel}})',
        text: 'Hello,\n\n' +
            'A payroll batch has been approved and awaits funding.\n' +
            'Entity: {{entityName}}\n' +
            'Period: {{periodLabel}}\n\n' +
            'View: {{approvalLink}}',
    },
    ...buildWorkflowTemplates('payroll'),
    ...buildWorkflowTemplates('leave-allowance'),
    ...buildWorkflowTemplates('transport-allowance'),
    ...buildWorkflowTemplates('others'),
};
const buildJobStatusTemplate = () => ({
    subject: 'Application update: {{title}}',
    text: 'Hi {{firstName}},\n\n' +
        'Your application for {{title}} at {{companyName}} is now {{statusLabel}}.\n' +
        '{{statusMessage}}\n' +
        'Date: {{date}}\n\n' +
        'Thank you,\n' +
        '{{companyName}} HR',
});
exports.buildJobStatusTemplate = buildJobStatusTemplate;
//# sourceMappingURL=email-templates.js.map