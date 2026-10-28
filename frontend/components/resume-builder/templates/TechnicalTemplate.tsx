'use client';

import React from 'react';
import { ResumeBuilderData } from '@/types/builder';

interface TemplateProps {
  data: ResumeBuilderData;
}

function formatPeriod(start?: string, end?: string, current?: boolean) {
  if (!start && !end && !current) return '';
  const s = start || '';
  const e = current ? 'Present' : end || '';
  if (s && e) return `${s} - ${e}`;
  return s || e;
}

export default function TechnicalTemplate({ data }: TemplateProps) {
  const { contact, summary, experience, education, projects, skills, certifications, awards, volunteer, languages } = data;

  const renderSection = (sectionKey: string) => {
    if (!data.enabledSections[sectionKey as keyof typeof data.enabledSections]) return null;

    switch (sectionKey) {
      case 'summary':
        if (!summary?.trim()) return null;
        return (
          <div key="summary" className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5 font-mono">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-[11px] leading-relaxed text-[#111]">
              {summary}
            </p>
          </div>
        );

      case 'skills':
        const tech = skills?.technical?.filter(Boolean) || [];
        const soft = skills?.soft?.filter(Boolean) || [];
        if (tech.length === 0 && soft.length === 0) return null;
        return (
          <div key="skills" className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5 font-mono">
              TECHNICAL SKILLS & COMPETENCIES
            </h2>
            <div className="text-[10.5px] leading-normal space-y-1 text-[#111]">
              {tech.length > 0 && (
                <div>
                  <strong className="text-black">Technologies & Tools: </strong>
                  <span>{tech.join(', ')}</span>
                </div>
              )}
              {soft.length > 0 && (
                <div>
                  <strong className="text-black">Professional Competencies: </strong>
                  <span>{soft.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'experience':
        if (!experience || experience.length === 0) return null;
        return (
          <div key="experience" className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2 font-mono">
              WORK EXPERIENCE
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="text-[11px]">
                  <div className="flex justify-between items-baseline font-semibold text-black">
                    <span>
                      {exp.jobTitle || 'Job Title'} | {exp.company || 'Company'}
                      {exp.employmentType ? ` (${exp.employmentType})` : ''}
                    </span>
                    <span className="text-[10px] font-normal text-[#333]">
                      {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                      {exp.location ? `, ${exp.location}` : ''}
                    </span>
                  </div>
                  {exp.bullets && exp.bullets.filter(Boolean).length > 0 && (
                    <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[10.5px] leading-snug text-[#111]">
                      {exp.bullets.filter(Boolean).map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        if (!projects || projects.length === 0) return null;
        return (
          <div key="projects" className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2 font-mono">
              TECHNICAL PROJECTS
            </h2>
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id} className="text-[11px]">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-black">
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className="font-normal text-[#333] text-[10px]">
                          {' '}– [{proj.technologies.join(', ')}]
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-[#444]">
                      {proj.projectUrl || proj.githubUrl}
                    </span>
                  </div>
                  {proj.description && (
                    <p className="text-[10.5px] text-[#222] mt-0.5 leading-snug">
                      {proj.description}
                    </p>
                  )}
                  {proj.bullets && proj.bullets.filter(Boolean).length > 0 && (
                    <ul className="list-disc ml-4 mt-0.5 space-y-0.5 text-[10.5px] leading-snug text-[#111]">
                      {proj.bullets.filter(Boolean).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (!education || education.length === 0) return null;
        return (
          <div key="education" className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2 font-mono">
              EDUCATION
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="text-[11px]">
                  <div className="flex justify-between items-baseline font-semibold text-black">
                    <span>{edu.institution}</span>
                    <span className="text-[10px] font-normal text-[#333]">
                      {formatPeriod(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[10.5px] text-[#222]">
                    <span>
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    </span>
                    {edu.gpa && <span className="text-[10px]">GPA: {edu.gpa}</span>}
                  </div>
                  {edu.description && (
                    <p className="text-[10px] text-[#444] mt-0.5">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!certifications || certifications.length === 0) return null;
        return (
          <div key="certifications" className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5 font-mono">
              CERTIFICATIONS
            </h2>
            <div className="space-y-1 text-[10.5px] text-[#111]">
              {certifications.map((c) => (
                <div key={c.id} className="flex justify-between items-baseline">
                  <span>{c.name} — {c.issuer}</span>
                  {c.date && <span className="text-[10px] text-[#444]">{c.date}</span>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'awards':
        if (!awards || awards.length === 0) return null;
        return (
          <div key="awards" className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5 font-mono">
              AWARDS & HONORS
            </h2>
            <div className="space-y-1 text-[10.5px] text-[#111]">
              {awards.map((a) => (
                <div key={a.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-black">{a.title} — {a.issuer}</span>
                    {a.date && <span className="text-[10px] text-[#444]">{a.date}</span>}
                  </div>
                  {a.description && <p className="text-[10px] text-[#333] mt-0.5">{a.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'volunteer':
        if (!volunteer || volunteer.length === 0) return null;
        return (
          <div key="volunteer" className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5 font-mono">
              VOLUNTEER & LEADERSHIP
            </h2>
            <div className="space-y-1.5 text-[10.5px] text-[#111]">
              {volunteer.map((v) => (
                <div key={v.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-black">{v.role} — {v.organization}</span>
                    <span className="text-[10px] text-[#444]">{formatPeriod(v.startDate, v.endDate, v.current)}</span>
                  </div>
                  {v.description && <p className="text-[10px] text-[#333] mt-0.5">{v.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (!languages || languages.length === 0) return null;
        return (
          <div key="languages" className="mb-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1 font-mono">
              LANGUAGES
            </h2>
            <div className="text-[10.5px] text-[#111]">
              {languages.map((l) => `${l.language} (${l.proficiency})`).join(' | ')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const contactItems = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github,
    contact.website,
  ].filter(Boolean);

  return (
    <div className="w-full bg-white text-black p-8 sm:p-10 font-sans leading-normal select-text">
      {/* ATS Standard Header */}
      <div className="text-center border-b border-black pb-2.5 mb-3.5">
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-black">
          {contact.fullName || 'Candidate Name'}
        </h1>
        {contact.jobTitle && (
          <p className="text-xs font-semibold uppercase tracking-wide text-[#222] mt-0.5">
            {contact.jobTitle}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-x-2 text-[10.5px] text-[#333] mt-1.5">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[#666]">|</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Render sections in specified order */}
      {data.sectionOrder.map((sectionKey) => renderSection(sectionKey))}
    </div>
  );
}
