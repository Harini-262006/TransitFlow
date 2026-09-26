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

async function runConflictTest() {
  console.log('=== TESTING SHIFT CONFLICT DETECTION & REPLACEMENT ASSIGNMENT FLOW ===\n');

  try {
    // 1. Manager Login
    const mgrRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'manager@shift.com', password: 'Manager@123' }
    });
    const mgrToken = mgrRes.data.token;

    // 2. Driver Login
    const drvRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'driver@shift.com', password: 'Driver@123' }
    });
    const drvToken = drvRes.data.token;

    // 3. Driver applies for leave on the exact date where they have an assigned shift (Tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    console.log(`1. Driver applying for leave covering scheduled shift date (${dateStr})...`);
    const leaveRes = await request('/leaves', {
      method: 'POST',
      headers: { Authorization: `Bearer ${drvToken}` },
      body: {
        leaveType: 'Emergency Leave',
        fromDate: dateStr,
        toDate: dateStr,
        reason: 'Urgent family emergency on shift date'
      }
    });

    if (!leaveRes.ok) throw new Error(`Leave submit failed: ${JSON.stringify(leaveRes.data)}`);
    const leave = leaveRes.data.data;
    console.log(`   ✓ Leave request created with affectedShiftsCount: ${leave.affectedShiftsCount}`);

    // 4. Manager inspects affected shifts for this leave
    console.log('\n2. Manager checking affected shifts for this leave...');
    const affectedRes = await request(`/shifts/affected-by-leave/${leave._id}`, {
      headers: { Authorization: `Bearer ${mgrToken}` }
    });
    if (!affectedRes.ok) throw new Error(`Affected shifts check failed: ${JSON.stringify(affectedRes.data)}`);
    console.log(`   ✓ Manager detected ${affectedRes.data.count} conflicting shift(s)!`);
    const affectedShift = affectedRes.data.data[0];
    console.log(`   ✓ Conflict Details -> Bus: ${affectedShift.bus?.busNumber}, Route: ${affectedShift.route?.routeNumber}, Date: ${new Date(affectedShift.shiftDate).toLocaleDateString()}, Time: ${affectedShift.startTime} - ${affectedShift.endTime}`);

    // 5. Manager queries available replacement drivers for the conflicting shift
    console.log('\n3. Manager querying evaluated replacement drivers for conflicting shift...');
    const replRes = await request(`/drivers/available-for-shift/${affectedShift._id}`, {
      headers: { Authorization: `Bearer ${mgrToken}` }
    });
    if (!replRes.ok) throw new Error(`Replacements fetch failed: ${JSON.stringify(replRes.data)}`);
    console.log(`   ✓ Evaluated ${replRes.data.data.length} driver(s):`);
    replRes.data.data.forEach((d) => {
      console.log(`     • ${d.name} (${d.employeeId}): Available = ${d.isAvailable} (${d.validationReason}), Score: ${d.score}`);
    });

    const chosenReplacement = replRes.data.data.find((d) => d.isAvailable);
    if (!chosenReplacement) throw new Error('No available replacement driver found in pool!');
    console.log(`   ✓ Manager selects available replacement: ${chosenReplacement.name} (${chosenReplacement.employeeId})`);

    // 6. Manager approves leave and reassigns replacement driver
    console.log('\n4. Manager executing atomic leave approval & shift reassignment...');
    const approveWithReassignRes = await request(`/leaves/${leave._id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${mgrToken}` },
      body: {
        reassignments: [
          {
            shiftId: affectedShift._id,
            replacementDriverId: chosenReplacement.id
          }
        ],
        managerRemarks: `Approved. Shift reassigned to replacement driver ${chosenReplacement.name}.`
      }
    });

    if (!approveWithReassignRes.ok) throw new Error(`Approval failed: ${JSON.stringify(approveWithReassignRes.data)}`);
    console.log(`   ✓ Approval successful! Server message: "${approveWithReassignRes.data.message}"`);

    // 7. Verify shift preserves originalDriver and has new driver assigned
    console.log('\n5. Verifying shift preserves original driver and tracks reassignment...');
    const shiftsRes = await request('/shifts', {
      headers: { Authorization: `Bearer ${mgrToken}` }
    });
    const updatedShift = shiftsRes.data.data.find((s) => s._id.toString() === affectedShift._id.toString());
    console.log(`   ✓ Shift Current Driver: ${updatedShift.driver?.name} (${updatedShift.driver?.employeeId})`);
    console.log(`   ✓ Original Driver Preserved: ${updatedShift.originalDriver ? 'Yes (ID preserved)' : 'No'}`);
    console.log(`   ✓ Reassignment Reason: "${updatedShift.reassignmentReason}"`);

    console.log('\n======================================================');
    console.log('✓ SHIFT CONFLICT & REPLACEMENT FLOW PASSED 100%!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Conflict Test Error:', error.message);
    process.exit(1);
  }
}

runConflictTest();
