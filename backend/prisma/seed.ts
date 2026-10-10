import { PrismaClient, Role, JobStatus, JobPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FieldFlow operations database...');

  // Clean existing tables in reverse dependency order
  await prisma.activityLog.deleteMany();
  await prisma.jobAttachment.deleteMany();
  await prisma.jobNote.deleteMany();
  await prisma.job.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.technicianProfile.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin123!', salt);
  const managerPassword = await bcrypt.hash('Manager123!', salt);
  const techPassword = await bcrypt.hash('Tech123!', salt);

  // 1. Create Users & Staff
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@fieldflow.io',
      passwordHash: adminPassword,
      name: 'Sarah Jenkins (VP Ops)',
      role: Role.ADMIN,
      phone: '+1-415-555-0101',
      isActive: true,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@fieldflow.io',
      passwordHash: managerPassword,
      name: 'Alex Rivera (Operations Dispatcher)',
      role: Role.MANAGER,
      phone: '+1-415-555-0102',
      isActive: true,
    },
  });

  // Technicians
  const tech1 = await prisma.user.create({
    data: {
      email: 'marcus.vance@fieldflow.io',
      passwordHash: techPassword,
      name: 'Marcus Vance',
      role: Role.TECHNICIAN,
      phone: '+1-415-555-0131',
      isActive: true,
      technicianProfile: {
        create: {
          skills: 'Commercial HVAC, Chiller Overhauls, BMS Automation',
          vehicleNumber: 'VAN-101',
          serviceZone: 'North Metro / Peninsula',
          maxConcurrentJobs: 4,
          isAvailable: true,
        },
      },
    },
    include: { technicianProfile: true },
  });

  const tech2 = await prisma.user.create({
    data: {
      email: 'elena.rodriguez@fieldflow.io',
      passwordHash: techPassword,
      name: 'Elena Rodriguez',
      role: Role.TECHNICIAN,
      phone: '+1-415-555-0132',
      isActive: true,
      technicianProfile: {
        create: {
          skills: 'High Voltage Switchgear, 3-Phase Motors, VFDs',
          vehicleNumber: 'VAN-104',
          serviceZone: 'East Bay Industrial',
          maxConcurrentJobs: 4,
          isAvailable: true,
        },
      },
    },
    include: { technicianProfile: true },
  });

  const tech3 = await prisma.user.create({
    data: {
      email: 'david.chen@fieldflow.io',
      passwordHash: techPassword,
      name: 'David Chen',
      role: Role.TECHNICIAN,
      phone: '+1-415-555-0133',
      isActive: true,
      technicianProfile: {
        create: {
          skills: 'Commercial Hydronics, Backflow Certified, Steam Systems',
          vehicleNumber: 'TRUCK-202',
          serviceZone: 'San Francisco Downtown',
          maxConcurrentJobs: 5,
          isAvailable: true,
        },
      },
    },
    include: { technicianProfile: true },
  });

  const tech4 = await prisma.user.create({
    data: {
      email: 'sam.okafor@fieldflow.io',
      passwordHash: techPassword,
      name: 'Sam Okafor',
      role: Role.TECHNICIAN,
      phone: '+1-415-555-0134',
      isActive: true,
      technicianProfile: {
        create: {
          skills: 'Fire Protection, Life Safety Sprinklers, Pressure Vessels',
          vehicleNumber: 'VAN-108',
          serviceZone: 'South Bay Valley',
          maxConcurrentJobs: 4,
          isAvailable: false, // Currently on dedicated scheduled outage
        },
      },
    },
    include: { technicianProfile: true },
  });

  // 2. Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Apex Data Center',
      company: 'Apex Technologies Inc',
      email: 'facilities@apexdatacenter.com',
      phone: '+1-408-555-8900',
      address: '500 Technology Way',
      city: 'San Jose',
      state: 'CA',
      postalCode: '95110',
      latitude: 37.3382,
      longitude: -121.8863,
      notes: 'Tier-4 Mission Critical Facility. 2-Hour SLA for mechanical cooling issues. Badge access via Security Guard Gate 2.',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'St. Jude Regional Hospital',
      company: 'Northwest Healthcare System',
      email: 'ops@stjude-hospital.org',
      phone: '+1-415-555-4300',
      address: '1200 Mercy Drive',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94117',
      latitude: 37.7749,
      longitude: -122.4194,
      notes: 'Critical Care wing backup systems. Negative pressure rooms must maintain continuous sensor monitoring.',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Meridian Corporate Plaza',
      company: 'Meridian Real Estate Partners',
      email: 'mgmt@meridianplaza.com',
      phone: '+1-415-555-7100',
      address: '400 Financial Center Blvd',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94104',
      latitude: 37.7915,
      longitude: -122.4014,
      notes: 'Class-A commercial high-rise. Service freight elevator requires loading dock master reservation.',
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      name: 'Pacific Cold Storage Logistics',
      company: 'Pacific Freight & Logistics LLC',
      email: 'warehouse@pacificcold.com',
      phone: '+1-510-555-6200',
      address: '880 Pier Terminal Road',
      city: 'Oakland',
      state: 'CA',
      postalCode: '94607',
      latitude: 37.8044,
      longitude: -122.2712,
      notes: 'Industrial ammonia refrigeration warehouse. Heavy PPE and safety harness mandatory in Section C.',
    },
  });

  const customer5 = await prisma.customer.create({
    data: {
      name: 'Beacon Ridge Science Academy',
      company: 'East Bay Education Foundation',
      email: 'maintenance@beaconridge.edu',
      phone: '+1-510-555-3100',
      address: '350 Meadow Lane',
      city: 'Berkeley',
      state: 'CA',
      postalCode: '94705',
      latitude: 37.8715,
      longitude: -122.273,
      notes: 'Campus boiler plant and science wing ventilation. Check in at Main Administrative Office.',
    },
  });

  const customer6 = await prisma.customer.create({
    data: {
      name: 'Vanguard BioSciences Lab',
      company: 'Vanguard Therapeutics',
      email: 'labops@vanguardbio.com',
      phone: '+1-650-555-9400',
      address: '750 Biotech Blvd',
      city: 'South San Francisco',
      state: 'CA',
      postalCode: '94080',
      latitude: 37.6547,
      longitude: -122.4077,
      notes: 'Cleanroom ISO-5 facility. Air filtration HEPA differential pressure monitors require calibration certificates.',
    },
  });

  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000);
  const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3600 * 1000);
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 3600 * 1000);
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 3600 * 1000);

  // 3. Operational Jobs
  const jobsData = [
    // CRITICAL - OVERDUE - IN_PROGRESS
    {
      jobNumber: 'JOB-2026-0101',
      title: 'Server Room Chiller Loop B Emergency Pressure Loss',
      description: 'Chiller Loop B high head-pressure trip triggered at 03:15 AM. Secondary pump cavitating. Server rack temps rising toward 78F threshold.',
      customerId: customer1.id,
      assignedTechnicianId: tech1.id,
      serviceAddress: '500 Technology Way, San Jose, CA',
      priority: JobPriority.CRITICAL,
      status: JobStatus.IN_PROGRESS,
      scheduledStart: hoursAgo(10),
      dueDate: hoursAgo(4), // Overdue!
      startedAt: hoursAgo(6),
      createdById: managerUser.id,
    },
    // CRITICAL - ASSIGNED
    {
      jobNumber: 'JOB-2026-0102',
      title: 'Emergency Generator Transfer Switch Trip - ICU Wing',
      description: 'Monthly automatic load test failed on ATS-3. Switch failed to latch under simulated utility dropout. Redundant path holding but requires urgent isolation.',
      customerId: customer2.id,
      assignedTechnicianId: tech2.id,
      serviceAddress: '1200 Mercy Drive, San Francisco, CA',
      priority: JobPriority.CRITICAL,
      status: JobStatus.ASSIGNED,
      scheduledStart: hoursAgo(2),
      dueDate: hoursFromNow(2),
      createdById: managerUser.id,
    },
    // HIGH - IN_PROGRESS
    {
      jobNumber: 'JOB-2026-0103',
      title: 'High-Rise Hydro-Pneumatic Booster Pump 2 Seal Leak',
      description: 'Floors 28-42 experiencing low domestic water pressure during morning peak. Booster pump 2 mechanical shaft seal blowing steady stream into sump.',
      customerId: customer3.id,
      assignedTechnicianId: tech3.id,
      serviceAddress: '400 Financial Center Blvd, San Francisco, CA',
      priority: JobPriority.HIGH,
      status: JobStatus.IN_PROGRESS,
      scheduledStart: hoursAgo(5),
      dueDate: hoursFromNow(3),
      startedAt: hoursAgo(4),
      createdById: managerUser.id,
    },
    // HIGH - OVERDUE - ASSIGNED
    {
      jobNumber: 'JOB-2026-0104',
      title: 'Ammonia Refrigeration Zone C Defrost Cycle Lockout',
      description: 'Sub-zero freezer evaporator coil heavily iced. Hot gas bypass valve solenoid not energizing on PLC signal. Temperature creeping up to -4F.',
      customerId: customer4.id,
      assignedTechnicianId: tech1.id,
      serviceAddress: '880 Pier Terminal Road, Oakland, CA',
      priority: JobPriority.HIGH,
      status: JobStatus.ASSIGNED,
      scheduledStart: daysAgo(1),
      dueDate: hoursAgo(2), // Overdue!
      createdById: managerUser.id,
    },
    // MEDIUM - IN_PROGRESS
    {
      jobNumber: 'JOB-2026-0105',
      title: 'Cleanroom Air Handler 4 VFD Harmonic Distortion Diagnostic',
      description: 'AHU-4 variable frequency drive showing intermittent over-current fault F0002. Air balancing team reports 15% cfm oscillation.',
      customerId: customer6.id,
      assignedTechnicianId: tech2.id,
      serviceAddress: '750 Biotech Blvd, South San Francisco, CA',
      priority: JobPriority.MEDIUM,
      status: JobStatus.IN_PROGRESS,
      scheduledStart: hoursAgo(3),
      dueDate: hoursFromNow(5),
      startedAt: hoursAgo(2),
      createdById: managerUser.id,
    },
    // HIGH - COMPLETED
    {
      jobNumber: 'JOB-2026-0106',
      title: 'Boiler 1 Low Water Cutoff Mechanism Overhaul',
      description: 'Replaced float chamber linkage and mercury switch assembly on 2.5MBtu hydronic heating boiler. Blowdown valve reseated.',
      customerId: customer5.id,
      assignedTechnicianId: tech3.id,
      serviceAddress: '350 Meadow Lane, Berkeley, CA',
      priority: JobPriority.HIGH,
      status: JobStatus.COMPLETED,
      scheduledStart: daysAgo(2),
      dueDate: daysAgo(1),
      startedAt: daysAgo(2),
      completedAt: daysAgo(1),
      createdById: managerUser.id,
    },
    // MEDIUM - COMPLETED
    {
      jobNumber: 'JOB-2026-0107',
      title: 'Rooftop Condenser Fan Motor Replacement (Unit 4B)',
      description: 'ECM condenser motor bearing seized. Installed new 1.5HP OEM motor, balanced blade pitch, verified 2.8A full-load draw.',
      customerId: customer3.id,
      assignedTechnicianId: tech1.id,
      serviceAddress: '400 Financial Center Blvd, San Francisco, CA',
      priority: JobPriority.MEDIUM,
      status: JobStatus.COMPLETED,
      scheduledStart: daysAgo(3),
      dueDate: daysAgo(2),
      startedAt: daysAgo(3),
      completedAt: daysAgo(2),
      createdById: managerUser.id,
    },
    // LOW - COMPLETED
    {
      jobNumber: 'JOB-2026-0108',
      title: 'Quarterly Backflow Prevention Test & Certification',
      description: 'Tested two 4-inch Reduced Pressure Zone (RPZ) backflow assemblies on main fire and domestic risers. Both passed AWWA criteria.',
      customerId: customer2.id,
      assignedTechnicianId: tech3.id,
      serviceAddress: '1200 Mercy Drive, San Francisco, CA',
      priority: JobPriority.LOW,
      status: JobStatus.COMPLETED,
      scheduledStart: daysAgo(4),
      dueDate: daysAgo(3),
      startedAt: daysAgo(4),
      completedAt: daysAgo(3),
      createdById: managerUser.id,
    },
    // MEDIUM - COMPLETED
    {
      jobNumber: 'JOB-2026-0109',
      title: 'Main Distribution Panel Infrared Thermography Survey',
      description: 'Completed FLIR thermal inspection of 480V 2000A switchboard. Breaker 14 showed 18F phase delta. Torqued lug to 35 ft-lbs.',
      customerId: customer1.id,
      assignedTechnicianId: tech2.id,
      serviceAddress: '500 Technology Way, San Jose, CA',
      priority: JobPriority.MEDIUM,
      status: JobStatus.COMPLETED,
      scheduledStart: daysAgo(5),
      dueDate: daysAgo(4),
      startedAt: daysAgo(5),
      completedAt: daysAgo(4),
      createdById: managerUser.id,
    },
    // OPEN - HIGH (Unassigned)
    {
      jobNumber: 'JOB-2026-0110',
      title: 'Refrigerated Loading Dock 3 Fast-Acting Roll-Up Door Jammed',
      description: 'Hydraulic curtain jammed midway in door track. Cold chain integrity warning active at delivery staging dock.',
      customerId: customer4.id,
      assignedTechnicianId: null,
      serviceAddress: '880 Pier Terminal Road, Oakland, CA',
      priority: JobPriority.HIGH,
      status: JobStatus.OPEN,
      scheduledStart: hoursFromNow(2),
      dueDate: hoursFromNow(8),
      createdById: managerUser.id,
    },
    // OPEN - CRITICAL (Unassigned)
    {
      jobNumber: 'JOB-2026-0111',
      title: 'Fire Suppression Pre-Action Dry Pipe Pressure Drop',
      description: 'Supervisory pressure switch tripped on archive dry sprinkler vault. Compressor cycling continuously indicating hairline leak.',
      customerId: customer1.id,
      assignedTechnicianId: null,
      serviceAddress: '500 Technology Way, San Jose, CA',
      priority: JobPriority.CRITICAL,
      status: JobStatus.OPEN,
      scheduledStart: hoursFromNow(1),
      dueDate: hoursFromNow(6),
      createdById: managerUser.id,
    },
    // OPEN - MEDIUM (Unassigned)
    {
      jobNumber: 'JOB-2026-0112',
      title: 'Laboratory Chemistry Hood Exhaust Damper Actuator Fault',
      description: 'Fume hood 12 sash sensor shows face velocity below 100 fpm standard. Belimo 24V damper actuator humming but not modulating.',
      customerId: customer6.id,
      assignedTechnicianId: null,
      serviceAddress: '750 Biotech Blvd, South San Francisco, CA',
      priority: JobPriority.MEDIUM,
      status: JobStatus.OPEN,
      scheduledStart: daysFromNow(1),
      dueDate: daysFromNow(2),
      createdById: managerUser.id,
    },
    // ASSIGNED - MEDIUM
    {
      jobNumber: 'JOB-2026-0113',
      title: 'Classroom Wing B Thermostat Re-calibration & Sensor Sync',
      description: 'Rooms 201-208 reporting room temps 68F despite 73F setpoint. Wireless BACnet sensor battery replacement and mesh verification.',
      customerId: customer5.id,
      assignedTechnicianId: tech1.id,
      serviceAddress: '350 Meadow Lane, Berkeley, CA',
      priority: JobPriority.MEDIUM,
      status: JobStatus.ASSIGNED,
      scheduledStart: daysFromNow(1),
      dueDate: daysFromNow(2),
      createdById: managerUser.id,
    },
    // ASSIGNED - LOW
    {
      jobNumber: 'JOB-2026-0114',
      title: 'Parking Garage Sump Ejector Pump Semi-Annual Inspection',
      description: 'Dual submersible effluent pumps inspection. Float switches testing, check valve seat check, grease pit clearance.',
      customerId: customer3.id,
      assignedTechnicianId: tech3.id,
      serviceAddress: '400 Financial Center Blvd, San Francisco, CA',
      priority: JobPriority.LOW,
      status: JobStatus.ASSIGNED,
      scheduledStart: daysFromNow(2),
      dueDate: daysFromNow(3),
      createdById: managerUser.id,
    },
    // COMPLETED - HIGH
    {
      jobNumber: 'JOB-2026-0115',
      title: 'Medical Gas Manifold Alarm Sensor Repair (O2 & N2O)',
      description: 'Regulator line B transducer drifting. Replaced precision pressure transmitter and leak-checked Swagelok connections with Snoop.',
      customerId: customer2.id,
      assignedTechnicianId: tech2.id,
      serviceAddress: '1200 Mercy Drive, San Francisco, CA',
      priority: JobPriority.HIGH,
      status: JobStatus.COMPLETED,
      scheduledStart: daysAgo(6),
      dueDate: daysAgo(5),
      startedAt: daysAgo(6),
      completedAt: daysAgo(5),
      createdById: managerUser.id,
    },
    // CANCELLED
    {
      jobNumber: 'JOB-2026-0116',
      title: 'Annex Roof Drainage Gutter Heating Cable Installation',
      description: 'Customer deferred project until Q4 budgetary cycle review.',
      customerId: customer5.id,
      assignedTechnicianId: null,
      serviceAddress: '350 Meadow Lane, Berkeley, CA',
      priority: JobPriority.LOW,
      status: JobStatus.CANCELLED,
      scheduledStart: daysAgo(7),
      dueDate: daysAgo(5),
      createdById: managerUser.id,
    },
  ];

  for (const jobItem of jobsData) {
    const createdJob = await prisma.job.create({
      data: jobItem,
    });

    // Add initial dispatch note
    await prisma.jobNote.create({
      data: {
        jobId: createdJob.id,
        authorId: managerUser.id,
        content: `Work order dispatched into operations system with priority ${createdJob.priority}. Assigned to service zone.`,
        isInternal: true,
      },
    });

    // Add activity log
    await prisma.activityLog.create({
      data: {
        jobId: createdJob.id,
        actorId: managerUser.id,
        action: 'JOB_CREATED',
        metadata: JSON.stringify({ priority: createdJob.priority, initialStatus: createdJob.status }),
      },
    });

    // Add field notes for in-progress & completed jobs
    if (createdJob.status === JobStatus.IN_PROGRESS && createdJob.assignedTechnicianId) {
      await prisma.jobNote.create({
        data: {
          jobId: createdJob.id,
          authorId: createdJob.assignedTechnicianId,
          content: 'Arrived on site. Staged diagnostic manifold gauges and lockout-tagout applied to main disconnect.',
          isInternal: false,
          createdAt: hoursAgo(2),
        },
      });

      await prisma.activityLog.create({
        data: {
          jobId: createdJob.id,
          actorId: createdJob.assignedTechnicianId,
          action: 'STATUS_UPDATED',
          metadata: JSON.stringify({ from: 'ASSIGNED', to: 'IN_PROGRESS' }),
        },
      });
    }

    if (createdJob.status === JobStatus.COMPLETED && createdJob.assignedTechnicianId) {
      await prisma.jobNote.create({
        data: {
          jobId: createdJob.id,
          authorId: createdJob.assignedTechnicianId,
          content: 'Work successfully completed according to engineering specifications. Operational load test run for 45 minutes with normal thermal profiles.',
          isInternal: false,
        },
      });

      await prisma.activityLog.create({
        data: {
          jobId: createdJob.id,
          actorId: createdJob.assignedTechnicianId,
          action: 'STATUS_UPDATED',
          metadata: JSON.stringify({ from: 'IN_PROGRESS', to: 'COMPLETED' }),
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
  console.log(`- Created 1 Admin, 1 Manager, 4 Technicians`);
  console.log(`- Created ${jobsData.length} Realistic Operational Jobs with Notes and Audit Trails`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
