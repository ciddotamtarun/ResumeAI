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

export default function ClassicTemplate({ data }: TemplateProps) {
  const { contact, summary, experience, education, projects, skills, certifications, awards, volunteer, languages } = data;

  const renderSection = (sectionKey: string) => {
    if (!data.enabledSections[sectionKey as keyof typeof data.enabledSections]) return null;

    switch (sectionKey) {
      case 'summary':
        if (!summary?.trim()) return null;
        return (
          <div key="summary" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#171A35] border-b border-[#171A35] pb-0.5 mb-2 font-serif">
              Professional Summary
            </h2>
            <p className="text-[11px] leading-relaxed text-[#2D3142] text-justify font-serif">
              {summary}
            </p>
          </div>
        );

      case 'experience':
        if (!experience || experience.length === 0) return null;
        return (
          <div key="experience" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#171A35] border-b border-[#171A35] pb-0.5 mb-2.5 font-serif">
              Professional Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="text-[11px]">
                  <div className="flex justify-between items-baseline font-serif">
                    <div>
                      <span className="font-bold text-[#171A35]">{exp.jobTitle || 'Job Title'}</span>
                      {exp.company && <span className="text-[#333]">, {exp.company}</span>}
                      {exp.employmentType && <span className="text-[#666] text-[10px] italic"> ({exp.employmentType})</span>}
                    </div>
                    <div className="text-[10px] text-[#555] font-serif">
                      {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                      {exp.location ? ` | ${exp.location}` : ''}
                    </div>
                  </div>
                  {exp.bullets && exp.bullets.filter(Boolean).length > 0 && (
                    <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[#2D3142] text-[10.5px] leading-snug font-serif">
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#171A35] border-b border-[#171A35] pb-0.5 mb-2.5 font-serif">
              Key Projects
            </h2>
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id} className="text-[11px] font-serif">
                  <div className="flex justify-between items-baseline">
                    <div className="font-bold text-[#171A35]">
                      {proj.title || 'Project Title'}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className="font-normal text-[#555] text-[10px] italic ml-1.5">
                          ({proj.technologies.join(', ')})
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#555]">
                      {proj.projectUrl || proj.githubUrl}
                    </div>
                  </div>
                  {proj.description && (
                    <p className="text-[10.5px] text-[#2D3142] mt-0.5 leading-snug">
                      {proj.description}
                    </p>
                  )}
                  {proj.bullets && proj.bullets.filter(Boolean).length > 0 && (
                    <ul className="list-disc ml-4 mt-0.5 space-y-0.5 text-[#2D3142] text-[10.5px] leading-snug">
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#171A35] border-b border-[#171A35] pb-0.5 mb-2 font-serif">
              Skills & Expertise
            </h2>
            <div className="text-[10.5px] space-y-1 font-serif text-[#2D3142]">
              {tech.length > 0 && (
                <div>
                  <strong className="text-[#171A35]">Technical Proficiencies: </strong>
                  <span>{tech.join(' • ')}</span>
                </div>
              )}
              {soft.length > 0 && (
                <div>
                  <strong className="text-[#171A35]">Professional & Leadership Skills: </strong>
                  <span>{soft.join(' • ')}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'education':
        if (!education || education.length === 0) return null;
        return (
          <div key="education" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#171A35] border-b border-[#171A35] pb-0.5 mb-2.5 font-serif">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="text-[11px] font-serif">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#171A35]">{edu.institution || 'University / Institution'}</span>
                    <span className="text-[10px] text-[#555]">
                      {formatPeriod(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[10.5px] text-[#333]">
                    <span>
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    </span>
                    {edu.gpa && <span className="text-[10px] font-medium text-[#444]">GPA: {edu.gpa}</span>}
                  </div>
                  {edu.description && (
                    <p className="text-[10px] text-[#555] mt-0.5 italic">{edu.description}</p>
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#171A35] border-b border-[#171A35] pb-0.5 mb-2 font-serif">
              Certifications
            </h2>
            <div className="space-y-1 font-serif text-[10.5px]">
              {certifications.map((c) => (
                <div key={c.id} className="flex justify-between items-baseline">
                  <span className="font-medium text-[#171A35]">{c.name} — <span className="text-[#444]">{c.issuer}</span></span>
                  {c.date && <span className="text-[10px] text-[#555]">{c.date}</span>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'awards':
        if (!awards || awards.length === 0) return null;
        return (
          <div key="awards" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#171A35] border-b border-[#171A35] pb-0.5 mb-2 font-serif">
              Honors & Awards
            </h2>
            <div className="space-y-1 font-serif text-[10.5px]">
              {awards.map((a) => (
                <div key={a.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#171A35]">{a.title} — {a.issuer}</span>
                    {a.date && <span className="text-[10px] text-[#555]">{a.date}</span>}
                  </div>
                  {a.description && <p className="text-[10px] text-[#444] mt-0.5">{a.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'volunteer':
        if (!volunteer || volunteer.length === 0) return null;
        return (
          <div key="volunteer" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#171A35] border-b border-[#171A35] pb-0.5 mb-2 font-serif">
              Volunteer & Leadership
            </h2>
            <div className="space-y-2 font-serif text-[10.5px]">
              {volunteer.map((v) => (
                <div key={v.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#171A35]">{v.role} — {v.organization}</span>
                    <span className="text-[10px] text-[#555]">{formatPeriod(v.startDate, v.endDate, v.current)}</span>
                  </div>
                  {v.description && <p className="text-[10px] text-[#444] mt-0.5">{v.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (!languages || languages.length === 0) return null;
        return (
          <div key="languages" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#171A35] border-b border-[#171A35] pb-0.5 mb-1.5 font-serif">
              Languages
            </h2>
            <div className="text-[10.5px] font-serif text-[#2D3142]">
              {languages.map((l) => `${l.language} (${l.proficiency})`).join(' • ')}
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
    <div className="w-full bg-white text-[#171A35] p-8 sm:p-10 font-serif leading-normal select-text">
      {/* Header */}
      <div className="text-center border-b border-[#171A35] pb-3 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-[#171A35]">
          {contact.fullName || 'Candidate Name'}
        </h1>
        {contact.jobTitle && (
          <p className="text-xs tracking-widest uppercase font-medium text-[#4F46D8] mt-0.5">
            {contact.jobTitle}
          </p>
        )}
        {contactItems.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-x-2.5 text-[10px] text-[#444] mt-2">
            {contactItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[#888]">•</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Body Sections in user-configured order */}
      {data.sectionOrder.map((sectionKey) => renderSection(sectionKey))}
    </div>
  );
}
