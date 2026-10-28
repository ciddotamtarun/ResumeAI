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
  if (s && e) return `${s} – ${e}`;
  return s || e;
}

export default function ModernTemplate({ data }: TemplateProps) {
  const { contact, summary, experience, education, projects, skills, certifications, awards, volunteer, languages } = data;

  const renderSection = (sectionKey: string) => {
    if (!data.enabledSections[sectionKey as keyof typeof data.enabledSections]) return null;

    switch (sectionKey) {
      case 'summary':
        if (!summary?.trim()) return null;
        return (
          <div key="summary" className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-4 bg-[#4F46D8] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A35]">
                Summary
              </h2>
              <div className="flex-1 h-[1px] bg-[#E7E1D4]" />
            </div>
            <p className="text-[11px] leading-relaxed text-[#4A4E69]">
              {summary}
            </p>
          </div>
        );

      case 'experience':
        if (!experience || experience.length === 0) return null;
        return (
          <div key="experience" className="mb-4">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-1.5 h-4 bg-[#4F46D8] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A35]">
                Experience
              </h2>
              <div className="flex-1 h-[1px] bg-[#E7E1D4]" />
            </div>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-3 border-l-2 border-[#E7E1D4] hover:border-[#4F46D8]/40 transition-colors">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11.5px] font-bold text-[#171A35]">{exp.jobTitle || 'Job Title'}</span>
                    <span className="text-[10px] font-medium text-[#77798B] bg-[#F3F0FC] px-1.5 py-0.5 rounded text-[#4F46D8]">
                      {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                    </span>
                  </div>
                  <div className="text-[10.5px] font-medium text-[#4F46D8] mb-1">
                    {exp.company}
                    {exp.location && <span className="text-[#77798B] font-normal"> • {exp.location}</span>}
                    {exp.employmentType && <span className="text-[#77798B] font-normal"> • {exp.employmentType}</span>}
                  </div>
                  {exp.bullets && exp.bullets.filter(Boolean).length > 0 && (
                    <ul className="list-disc ml-3.5 space-y-0.5 text-[#2D3142] text-[10.5px] leading-snug">
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
          <div key="projects" className="mb-4">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-1.5 h-4 bg-[#4F46D8] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A35]">
                Key Projects
              </h2>
              <div className="flex-1 h-[1px] bg-[#E7E1D4]" />
            </div>
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id} className="pl-3 border-l-2 border-[#E7E1D4]">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-[#171A35]">{proj.title}</span>
                    <span className="text-[9.5px] text-[#77798B] truncate max-w-[200px]">
                      {proj.projectUrl || proj.githubUrl}
                    </span>
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5 mb-1">
                      {proj.technologies.map((t, i) => (
                        <span key={i} className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-[#FAF8F1] border border-[#E7E1D4] text-[#4F46D8]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-[10.5px] text-[#2D3142] leading-snug">
                      {proj.description}
                    </p>
                  )}
                  {proj.bullets && proj.bullets.filter(Boolean).length > 0 && (
                    <ul className="list-disc ml-3.5 mt-0.5 space-y-0.5 text-[#2D3142] text-[10.5px] leading-snug">
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

      case 'skills':
        const tech = skills?.technical?.filter(Boolean) || [];
        const soft = skills?.soft?.filter(Boolean) || [];
        if (tech.length === 0 && soft.length === 0) return null;
        return (
          <div key="skills" className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-4 bg-[#4F46D8] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A35]">
                Core Competencies
              </h2>
              <div className="flex-1 h-[1px] bg-[#E7E1D4]" />
            </div>
            <div className="text-[10.5px] space-y-1.5">
              {tech.length > 0 && (
                <div>
                  <span className="font-semibold text-[#171A35] text-[10px] uppercase tracking-wide block mb-1">
                    Technical Stack:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tech.map((skill, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F3F0FC] text-[#4F46D8] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {soft.length > 0 && (
                <div className="mt-1.5">
                  <span className="font-semibold text-[#171A35] text-[10px] uppercase tracking-wide block mb-1">
                    Leadership & Methodologies:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {soft.map((skill, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF8F1] border border-[#E7E1D4] text-[#171A35]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'education':
        if (!education || education.length === 0) return null;
        return (
          <div key="education" className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-4 bg-[#4F46D8] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A35]">
                Education
              </h2>
              <div className="flex-1 h-[1px] bg-[#E7E1D4]" />
            </div>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="pl-3 border-l-2 border-[#E7E1D4]">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-[#171A35]">{edu.institution}</span>
                    <span className="text-[10px] text-[#77798B]">
                      {formatPeriod(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#4F46D8] font-medium">
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    {edu.gpa && <span className="text-[#77798B] font-normal"> • GPA: {edu.gpa}</span>}
                  </div>
                  {edu.description && (
                    <p className="text-[10px] text-[#77798B] mt-0.5">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!certifications || certifications.length === 0) return null;
        return (
          <div key="certifications" className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-4 bg-[#4F46D8] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A35]">
                Certifications
              </h2>
              <div className="flex-1 h-[1px] bg-[#E7E1D4]" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              {certifications.map((c) => (
                <div key={c.id} className="p-1.5 rounded-lg bg-[#FAF8F1] border border-[#E7E1D4]">
                  <div className="font-semibold text-[#171A35] text-[10.5px] leading-tight">{c.name}</div>
                  <div className="text-[9.5px] text-[#77798B] mt-0.5">{c.issuer} {c.date ? `• ${c.date}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'awards':
        if (!awards || awards.length === 0) return null;
        return (
          <div key="awards" className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-4 bg-[#4F46D8] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A35]">
                Honors & Awards
              </h2>
              <div className="flex-1 h-[1px] bg-[#E7E1D4]" />
            </div>
            <div className="space-y-1.5 text-[10.5px]">
              {awards.map((a) => (
                <div key={a.id} className="pl-3 border-l-2 border-[#E7E1D4]">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#171A35]">{a.title}</span>
                    <span className="text-[10px] text-[#77798B]">{a.date}</span>
                  </div>
                  <div className="text-[10px] text-[#4F46D8]">{a.issuer}</div>
                  {a.description && <p className="text-[10px] text-[#4A4E69] mt-0.5">{a.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'volunteer':
        if (!volunteer || volunteer.length === 0) return null;
        return (
          <div key="volunteer" className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-4 bg-[#4F46D8] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A35]">
                Volunteer
              </h2>
              <div className="flex-1 h-[1px] bg-[#E7E1D4]" />
            </div>
            <div className="space-y-2 text-[10.5px]">
              {volunteer.map((v) => (
                <div key={v.id} className="pl-3 border-l-2 border-[#E7E1D4]">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#171A35]">{v.role}</span>
                    <span className="text-[10px] text-[#77798B]">{formatPeriod(v.startDate, v.endDate, v.current)}</span>
                  </div>
                  <div className="text-[10px] text-[#4F46D8]">{v.organization}</div>
                  {v.description && <p className="text-[10px] text-[#4A4E69] mt-0.5">{v.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (!languages || languages.length === 0) return null;
        return (
          <div key="languages" className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-4 bg-[#4F46D8] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A35]">
                Languages
              </h2>
              <div className="flex-1 h-[1px] bg-[#E7E1D4]" />
            </div>
            <div className="flex flex-wrap gap-2 text-[10.5px]">
              {languages.map((l) => (
                <span key={l.id} className="px-2 py-0.5 rounded-full bg-[#FAF8F1] border border-[#E7E1D4] text-[#171A35]">
                  <strong className="text-[#4F46D8]">{l.language}</strong> ({l.proficiency})
                </span>
              ))}
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
    <div className="w-full bg-white text-[#171A35] p-8 sm:p-10 font-sans leading-normal select-text">
      {/* Modern Header */}
      <div className="border-b-2 border-[#4F46D8]/20 pb-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171A35] tracking-tight">
              {contact.fullName || 'Candidate Name'}
            </h1>
            {contact.jobTitle && (
              <p className="text-sm font-semibold text-[#4F46D8] mt-0.5">
                {contact.jobTitle}
              </p>
            )}
          </div>
        </div>

        {contactItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#77798B] mt-3">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[#E7E1D4]">•</span>}
                <span className="hover:text-[#171A35] transition-colors">{item}</span>
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
