import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Interview from '../models/Interview.model';
import Resume from '../models/Resume.model';
import User from '../models/User.model';

const RECORD_COUNT = 1000;
const BATCH_SIZE = 250;
const EMAIL_PREFIX = 'sample-user-';
const EMAIL_DOMAIN = '@seed.example';

const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery',
  'Drew', 'Quinn', 'Cameron', 'Reese', 'Parker', 'Rowan', 'Skyler', 'Emerson',
];
const lastNames = [
  'Morgan', 'Chen', 'Patel', 'Garcia', 'Kim', 'Singh', 'Brown', 'Lopez',
  'Wilson', 'Shah', 'Martin', 'Wong', 'Davis', 'Taylor', 'Khan', 'Lee',
];
const roles = [
  'Software Engineer', 'Data Analyst', 'Product Manager', 'UX Designer',
  'DevOps Engineer', 'Frontend Developer', 'Backend Developer', 'QA Engineer',
];

const chunks = <T>(items: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

const main = async (): Promise<void> => {
  if (!process.argv.includes('--confirm')) {
    throw new Error('This inserts 1,000 synthetic records per category. Rerun with --confirm to continue.');
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Configure it in backend/.env before seeding.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to MongoDB database "${mongoose.connection.name}".`);

  const emails = Array.from(
    { length: RECORD_COUNT },
    (_, index) => `${EMAIL_PREFIX}${String(index + 1).padStart(4, '0')}${EMAIL_DOMAIN}`
  );

  for (const emailBatch of chunks(emails, BATCH_SIZE)) {
    await User.bulkWrite(
      emailBatch.map((email) => {
        const number = Number(email.slice(EMAIL_PREFIX.length, -EMAIL_DOMAIN.length));
        const name = `${firstNames[(number - 1) % firstNames.length]} ${lastNames[Math.floor((number - 1) / firstNames.length) % lastNames.length]}`;
        return {
          updateOne: {
            filter: { email },
            update: { $setOnInsert: { name, email } },
            upsert: true,
          },
        };
      }),
      { ordered: false }
    );
  }

  const users = await User.find({ email: { $in: emails } }).select('_id email').lean();
  const userByEmail = new Map(users.map((user) => [user.email, user._id]));
  const rolesByEmail = new Map(emails.map((email, index) => [email, roles[index % roles.length]]));

  for (const emailBatch of chunks(emails, BATCH_SIZE)) {
    await Resume.bulkWrite(
      emailBatch.map((email) => {
        const userId = userByEmail.get(email);
        if (!userId) throw new Error(`Could not find seeded user ${email}.`);
        const role = rolesByEmail.get(email)!;
        const number = Number(email.slice(EMAIL_PREFIX.length, -EMAIL_DOMAIN.length));

        return {
          updateOne: {
            filter: { userId, fileName: `sample-resume-${String(number).padStart(4, '0')}.txt` },
            update: {
              $setOnInsert: {
                userId,
                fileName: `sample-resume-${String(number).padStart(4, '0')}.txt`,
                fileType: 'text/plain',
                targetRole: role,
                rawText: `Sample resume for ${role}. Synthetic candidate with experience delivering projects, collaborating across teams, and measuring outcomes. Skills include communication, problem solving, and ${role.toLowerCase()} fundamentals.`,
                analysis: {
                  overallScore: 70 + (number % 31),
                  sections: {
                    contact: { score: 85, feedback: ['Contact information is clearly presented.'] },
                    summary: { score: 78, feedback: ['Summary aligns with the target role.'] },
                    experience: { score: 74, feedback: ['Add measurable outcomes to key achievements.'] },
                    education: { score: 82, feedback: ['Education details are easy to scan.'] },
                    skills: { score: 80, feedback: ['Skills are relevant to the target role.'] },
                    formatting: { score: 88, feedback: ['Formatting is consistent.'] },
                  },
                  strengths: ['Relevant experience', 'Clear organization'],
                  improvements: ['Add quantified achievements'],
                  keywords: [role, 'communication', 'problem solving'],
                  atsCompatibility: 75 + (number % 26),
                },
                improvements: [
                  {
                    section: 'experience',
                    original: 'Worked on team projects.',
                    suggested: 'Delivered cross-functional projects on schedule.',
                    reason: 'Use specific actions and outcomes.',
                  },
                ],
                aiProvider: 'gemini',
              },
            },
            upsert: true,
          },
        };
      }),
      { ordered: false }
    );
  }

  const resumeNames = emails.map((email) => {
    const number = Number(email.slice(EMAIL_PREFIX.length, -EMAIL_DOMAIN.length));
    return `sample-resume-${String(number).padStart(4, '0')}.txt`;
  });
  const resumes = await Resume.find({
    userId: { $in: [...userByEmail.values()] },
    fileName: { $in: resumeNames },
  })
    .select('_id userId fileName')
    .lean();
  const resumeByUser = new Map(resumes.map((resume) => [String(resume.userId), resume]));

  for (const emailBatch of chunks(emails, BATCH_SIZE)) {
    await Interview.bulkWrite(
      emailBatch.map((email) => {
        const userId = userByEmail.get(email);
        if (!userId) throw new Error(`Could not find seeded user ${email}.`);
        const resume = resumeByUser.get(String(userId));
        if (!resume) throw new Error(`Could not find the sample resume for ${email}.`);
        const role = rolesByEmail.get(email)!;

        return {
          updateOne: {
            filter: { userId, resumeId: resume._id },
            update: {
              $setOnInsert: {
                userId,
                resumeId: resume._id,
                targetRole: role,
                status: 'completed',
                messages: [
                  { role: 'interviewer', content: `Tell me about your experience relevant to ${role}.`, timestamp: new Date() },
                  { role: 'candidate', content: 'I have delivered projects collaboratively and focused on measurable outcomes.', timestamp: new Date() },
                  { role: 'interviewer', content: 'How do you approach a challenging project?', timestamp: new Date() },
                  { role: 'candidate', content: 'I clarify goals, break the work into steps, and communicate progress.', timestamp: new Date() },
                ],
                finalResults: {
                  overallScore: 70 + (Number(email.slice(EMAIL_PREFIX.length, -EMAIL_DOMAIN.length)) % 31),
                  communicationScore: 82,
                  technicalScore: 76,
                  behavioralScore: 80,
                  strengths: ['Clear communication', 'Structured problem solving'],
                  areasForImprovement: ['Use more specific examples'],
                  detailedFeedback: 'Synthetic practice interview feedback for demonstration and testing.',
                },
                aiProvider: 'gemini',
              },
            },
            upsert: true,
          },
        };
      }),
      { ordered: false }
    );
  }

  console.log(`Seed complete: ${users.length} synthetic users, ${resumes.length} resumes, and ${resumes.length} interviews available.`);
  console.log(`Sample accounts use ${EMAIL_PREFIX}####${EMAIL_DOMAIN} email addresses and have no passwords.`);
};

main()
  .catch((error: unknown) => {
    console.error('Database seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
