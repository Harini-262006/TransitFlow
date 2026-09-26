const ShiftSwapRequest = require('../models/ShiftSwapRequest');
const Shift = require('../models/Shift');
const Driver = require('../models/Driver');
const Conductor = require('../models/Conductor');
const Notification = require('../models/Notification');

exports.getSwaps = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'manager') {
      query = {
        $or: [{ requester: req.user._id }, { targetEmployee: req.user._id }]
      };
    }

    const swaps = await ShiftSwapRequest.find(query)
      .populate('requester', 'name email employeeId role')
      .populate('targetEmployee', 'name email employeeId role')
      .populate({
        path: 'requesterShift',
        populate: ['bus', 'route', 'driver', 'conductor']
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: swaps.length, data: swaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestSwap = async (req, res) => {
  try {
    const { targetEmployee, requesterShift, reason } = req.body;

    if (!targetEmployee || !requesterShift || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please select an eligible employee, shift, and reason for swap'
      });
    }

    const swap = await ShiftSwapRequest.create({
      requester: req.user._id,
      targetEmployee,
      requesterShift,
      reason,
      peerStatus: 'pending',
      adminStatus: 'pending'
    });

    // Notify target employee
    await Notification.create({
      recipient: targetEmployee,
      title: 'Shift Swap Request Received',
      message: `${req.user.name} requested to swap a shift with you. Reason: ${reason}`
    });

    res.status(201).json({
      success: true,
      message: 'Shift swap request submitted for peer & manager approval!',
      data: swap
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.peerReviewSwap = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const swap = await ShiftSwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ success: false, message: 'Swap request not found' });
    }

    if (swap.targetEmployee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only target employee can review this request' });
    }

    swap.peerStatus = status;
    await swap.save();

    await Notification.create({
      recipient: swap.requester,
      title: `Shift Swap Peer Update`,
      message: `Your shift swap request was ${status} by your peer.`
    });

    res.status(200).json({ success: true, message: `Swap request ${status}`, data: swap });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.managerReviewSwap = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body; // 'approved' or 'rejected'
    const swap = await ShiftSwapRequest.findById(req.params.id).populate('requester targetEmployee requesterShift');

    if (!swap) {
      return res.status(404).json({ success: false, message: 'Swap request not found' });
    }

    swap.adminStatus = status;
    if (status === 'rejected') swap.rejectionReason = rejectionReason || 'Rejected by Manager';
    await swap.save();

    if (status === 'approved') {
      // Execute the actual assignment swap
      const shift = await Shift.findById(swap.requesterShift._id);
      if (shift) {
        // Find if target employee is Driver or Conductor
        const targetDriver = await Driver.findOne({ user: swap.targetEmployee._id });
        const targetConductor = await Conductor.findOne({ user: swap.targetEmployee._id });

        if (targetDriver) {
          shift.driver = targetDriver._id;
        } else if (targetConductor) {
          shift.conductor = targetConductor._id;
        }
        await shift.save();
      }
    }

    await Notification.create({
      recipient: swap.requester,
      title: `Shift Swap Manager Decision`,
      message: `Your shift swap request was ${status} by Manager.`
    });

    res.status(200).json({ success: true, message: `Shift swap ${status} by Manager`, data: swap });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.adminReviewSwap = exports.managerReviewSwap;
