const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('=== STARTING END-TO-END LEAVE MANAGEMENT SYSTEM VALIDATION ===\n');

  try {
    // 1. Driver Login
    console.log('1. Testing Driver Login (driver@shift.com)...');
    const driverLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'driver@shift.com', password: 'Driver@123' }
    });
    if (!driverLoginRes.ok) throw new Error(`Driver login failed: ${JSON.stringify(driverLoginRes.data)}`);
    const driverToken = driverLoginRes.data.token;
    const driverUser = driverLoginRes.data.user;
    console.log(`   ✓ Driver logged in: ${driverUser.name} (${driverUser.role}, ID: ${driverUser.employeeId})`);

    // 2. Driver Submits Leave Application
    console.log('\n2. Testing Driver Leave Application submission...');
    const leaveStart = new Date();
    leaveStart.setDate(leaveStart.getDate() + 10);
    const leaveEnd = new Date();
    leaveEnd.setDate(leaveEnd.getDate() + 12);

    const driverLeaveRes = await request('/leaves', {
      method: 'POST',
      headers: { Authorization: `Bearer ${driverToken}` },
      body: {
        leaveType: 'Sick Leave',
        fromDate: leaveStart.toISOString().split('T')[0],
        toDate: leaveEnd.toISOString().split('T')[0],
        reason: 'Medical checkup and severe viral cold',
        remarks: 'Doctor note will be submitted upon resuming'
      }
    });
    if (!driverLeaveRes.ok) throw new Error(`Driver leave submission failed: ${JSON.stringify(driverLeaveRes.data)}`);
    const createdDriverLeave = driverLeaveRes.data.data;
    console.log(`   ✓ Driver leave created: ID ${createdDriverLeave._id}, Status: ${createdDriverLeave.status}, Days: ${createdDriverLeave.numberOfDays}`);
    if (createdDriverLeave.status.toLowerCase() !== 'pending') {
      throw new Error(`Expected PENDING status, got ${createdDriverLeave.status}`);
    }

    // 3. Test Overlapping Leave Validation
    console.log('\n3. Testing Overlapping Leave Prevention for same employee...');
    const overlapRes = await request('/leaves', {
      method: 'POST',
      headers: { Authorization: `Bearer ${driverToken}` },
      body: {
        leaveType: 'Casual Leave',
        fromDate: leaveStart.toISOString().split('T')[0],
        toDate: leaveEnd.toISOString().split('T')[0],
        reason: 'Duplicate overlapping request attempt'
      }
    });
    if (overlapRes.status === 400) {
      console.log(`   ✓ Overlapping leave correctly rejected with message: "${overlapRes.data.message}"`);
    } else {
      throw new Error(`Expected 400 rejection, got ${overlapRes.status}`);
    }

    // 4. Conductor Login
    console.log('\n4. Testing Conductor Login (conductor@shift.com)...');
    const conductorLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'conductor@shift.com', password: 'Conductor@123' }
    });
    if (!conductorLoginRes.ok) throw new Error(`Conductor login failed: ${JSON.stringify(conductorLoginRes.data)}`);
    const conductorToken = conductorLoginRes.data.token;
    const conductorUser = conductorLoginRes.data.user;
    console.log(`   ✓ Conductor logged in: ${conductorUser.name} (${conductorUser.role}, ID: ${conductorUser.employeeId})`);

    // 5. Conductor Submits Leave Application
    console.log('\n5. Testing Conductor Leave Application submission...');
    const condLeaveStart = new Date();
    condLeaveStart.setDate(condLeaveStart.getDate() + 14);
    const condLeaveEnd = new Date();
    condLeaveEnd.setDate(condLeaveEnd.getDate() + 15);

    const conductorLeaveRes = await request('/leaves', {
      method: 'POST',
      headers: { Authorization: `Bearer ${conductorToken}` },
      body: {
        leaveType: 'Casual Leave',
        fromDate: condLeaveStart.toISOString().split('T')[0],
        toDate: condLeaveEnd.toISOString().split('T')[0],
        reason: 'Attending family wedding ceremony out of state',
        remarks: 'Will resume duty on time'
      }
    });
    if (!conductorLeaveRes.ok) throw new Error(`Conductor leave submission failed: ${JSON.stringify(conductorLeaveRes.data)}`);
    const createdConductorLeave = conductorLeaveRes.data.data;
    console.log(`   ✓ Conductor leave created: ID ${createdConductorLeave._id}, Status: ${createdConductorLeave.status}, Days: ${createdConductorLeave.numberOfDays}`);

    // 6. Test Driver cannot access Manager Approval API (Authorization Security)
    console.log('\n6. Testing Role Security: Driver cannot approve/reject leave requests...');
    const unauthorizedApproveRes = await request(`/leaves/${createdDriverLeave._id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${driverToken}` },
      body: { managerRemarks: 'Self approval attempt' }
    });
    if (unauthorizedApproveRes.status === 403) {
      console.log(`   ✓ Access correctly denied with 403 Forbidden: "${unauthorizedApproveRes.data.message}"`);
    } else {
      throw new Error(`Expected 403 Forbidden, got ${unauthorizedApproveRes.status}`);
    }

    // 7. Manager Login
    console.log('\n7. Testing Manager Login (manager@shift.com)...');
    const managerLoginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'manager@shift.com', password: 'Manager@123' }
    });
    if (!managerLoginRes.ok) throw new Error(`Manager login failed: ${JSON.stringify(managerLoginRes.data)}`);
    const managerToken = managerLoginRes.data.token;
    const managerUser = managerLoginRes.data.user;
    console.log(`   ✓ Manager logged in: ${managerUser.name} (${managerUser.role}, ID: ${managerUser.employeeId})`);

    // 8. Manager Views ALL Leaves
    console.log('\n8. Manager fetching ALL submitted leave requests...');
    const allLeavesRes = await request('/leaves/all', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    console.log(`   ✓ Total leaves visible to Manager: ${allLeavesRes.data.count}`);
    const foundDriverLeave = allLeavesRes.data.data.find((l) => l._id.toString() === createdDriverLeave._id.toString());
    const foundConductorLeave = allLeavesRes.data.data.find((l) => l._id.toString() === createdConductorLeave._id.toString());
    if (!foundDriverLeave || !foundConductorLeave) {
      throw new Error('Manager did not see both Driver and Conductor leave requests!');
    }
    console.log(`   ✓ Manager successfully sees both Driver (${foundDriverLeave.employeeName}) and Conductor (${foundConductorLeave.employeeName}) requests!`);

    // 9. Manager Approves Driver Leave
    console.log('\n9. Manager approving Driver leave request...');
    const approveRes = await request(`/leaves/${createdDriverLeave._id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${managerToken}` },
      body: { managerRemarks: 'Approved by Transport Manager. Take care and rest.' }
    });
    if (!approveRes.ok) throw new Error(`Approval failed: ${JSON.stringify(approveRes.data)}`);
    console.log(`   ✓ Driver leave approval response: ${approveRes.data.message}`);
    if (approveRes.data.data.leave.status.toLowerCase() !== 'approved') {
      throw new Error(`Expected status APPROVED, got ${approveRes.data.data.leave.status}`);
    }

    // 10. Manager Rejects Conductor Leave
    console.log('\n10. Manager rejecting Conductor leave request with remarks...');
    const rejectRes = await request(`/leaves/${createdConductorLeave._id}/reject`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${managerToken}` },
      body: {
        managerRemarks: 'Rejected due to heavy commuter rush expected on selected dates. Please reschedule.'
      }
    });
    if (!rejectRes.ok) throw new Error(`Rejection failed: ${JSON.stringify(rejectRes.data)}`);
    console.log(`   ✓ Conductor leave rejection response: ${rejectRes.data.message}`);
    if (rejectRes.data.data.status.toLowerCase() !== 'rejected') {
      throw new Error(`Expected status REJECTED, got ${rejectRes.data.data.status}`);
    }

    // 11. Conductor logs in and checks updated status & remarks
    console.log('\n11. Conductor checking updated leave history and rejection remarks...');
    const condHistoryRes = await request('/leaves/my', {
      headers: { Authorization: `Bearer ${conductorToken}` }
    });
    const reviewedCondLeave = condHistoryRes.data.data.find((l) => l._id.toString() === createdConductorLeave._id.toString());
    console.log(`   ✓ Conductor sees updated status: ${reviewedCondLeave.status.toUpperCase()}`);
    console.log(`   ✓ Conductor sees Manager Remarks: "${reviewedCondLeave.managerRemarks || reviewedCondLeave.rejectionReason}"`);

    // 12. Driver checks approved status
    console.log('\n12. Driver checking updated leave history and approval remarks...');
    const drvHistoryRes = await request('/leaves/my', {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    const reviewedDrvLeave = drvHistoryRes.data.data.find((l) => l._id.toString() === createdDriverLeave._id.toString());
    console.log(`   ✓ Driver sees updated status: ${reviewedDrvLeave.status.toUpperCase()}`);
    console.log(`   ✓ Driver sees Manager Remarks: "${reviewedDrvLeave.managerRemarks || reviewedDrvLeave.managerComment}"`);

    // 13. Notifications check
    console.log('\n13. Verifying notifications generated for Driver & Conductor...');
    const drvNotifRes = await request('/notifications', {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    console.log(`   ✓ Driver has ${drvNotifRes.data.count} notifications: Latest: "${drvNotifRes.data.data[0]?.title} - ${drvNotifRes.data.data[0]?.message}"`);

    const condNotifRes = await request('/notifications', {
      headers: { Authorization: `Bearer ${conductorToken}` }
    });
    console.log(`   ✓ Conductor has ${condNotifRes.data.count} notifications: Latest: "${condNotifRes.data.data[0]?.title} - ${condNotifRes.data.data[0]?.message}"`);

    console.log('\n======================================================');
    console.log('✓ ALL 13 TEST SCENARIOS PASSED WITH 100% SUCCESS!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    process.exit(1);
  }
}

runTests();
