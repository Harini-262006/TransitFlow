const IssueReport = require('../models/IssueReport');
const Maintenance = require('../models/Maintenance');
const Bus = require('../models/Bus');

exports.getIssues = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'manager') {
      query.reporter = req.user._id;
    }

    const issues = await IssueReport.find(query)
      .populate('reporter', 'name email employeeId role')
      .populate('bus')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reportIssue = async (req, res) => {
  try {
    const { bus, issueType, description, priority } = req.body;

    if (!bus || !description) {
      return res.status(400).json({ success: false, message: 'Please provide bus and description' });
    }

    const issue = await IssueReport.create({
      reporter: req.user._id,
      bus,
      issueType: issueType || 'other',
      description,
      priority: priority || 'medium',
      status: 'reported'
    });

    res.status(201).json({
      success: true,
      message: 'Bus problem reported to transport manager successfully!',
      data: issue
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const issue = await IssueReport.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue report not found' });
    }

    issue.status = status;
    await issue.save();

    // If status changed to assigned_maintenance, automatically log a Maintenance entry
    if (status === 'assigned_maintenance') {
      await Maintenance.create({
        bus: issue.bus,
        maintenanceType: 'repair',
        description: `Repair for reported issue: ${issue.description} (${issue.issueType})`,
        status: 'in_progress'
      });
      await Bus.findByIdAndUpdate(issue.bus, { status: 'maintenance' });
    }

    res.status(200).json({ success: true, message: `Issue status updated to ${status}`, data: issue });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
